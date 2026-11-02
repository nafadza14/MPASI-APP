"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Button, TopBar } from "@/components/ui";
import { Plate } from "@/components/Img";
import { IconCheck, IconPlus, IconShield } from "@/components/icons";
import { IOS_EASE } from "@/components/motion";
import { cookie, store, track } from "@/lib/client";
import { ageLabel, generatePlan, seedFor, todayJakarta } from "@/lib/generator";
import { BUMP, PACKAGES, rupiah } from "@/lib/pricing";
import { parseAnswers } from "@/lib/validate";
import type { PackageId, QuizAnswers } from "@/lib/types";

export default function Page() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}

function Checkout() {
  const router = useRouter();
  const sp = useSearchParams();
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [pkg, setPkg] = useState<PackageId>("lengkap");
  const [bump, setBump] = useState(false);
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState(sp.get("batal") ? "Pembayaran dibatalkan. Bunda bisa coba lagi kapan saja." : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const a = parseAnswers(store.getAnswers());
    if (!a) {
      router.replace("/kuis");
      return;
    }
    setAnswers(a);
    track("ViewCheckout");
  }, [router]);
  const plan = useMemo(() => (answers ? generatePlan(answers, { seed: seedFor(answers), today: todayJakarta() }) : null), [answers]);
  if (!answers || !plan) return <main className="min-h-dvh" />;

  const total = PACKAGES[pkg].price + (bump ? BUMP.price : 0);
  const start = new Date(plan.startDate + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long" });

  async function pay() {
    setErr("");
    if (!/^(\+?62|0)8\d{7,12}$/.test(wa.replace(/[\s-]/g, ""))) return setErr("Nomor WhatsApp belum benar. Contoh: 0812 3456 7890");
    if (!consent) return setErr("Mohon centang persetujuan penggunaan data.");
    setLoading(true);
    track("InitiateCheckout", { value: total, currency: "IDR", content_name: pkg });
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, package: pkg, bump, wa, email, consent, utm: store.getUtm(), fbp: cookie("_fbp"), fbc: cookie("_fbc") }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Gagal membuat pembayaran");
      track("AddPaymentInfo", { value: j.amount, currency: "IDR" });
      window.location.href = j.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <main className="pb-40">
      <TopBar title="Checkout" />

      <section className="px-5">
        <p className="mb-2 text-[15px] font-semibold">Untuk</p>
        <div className="flex items-center gap-3 rounded-[22px] bg-[#f7f8fa] p-3">
          <Avatar name={answers.name} size={48} />
          <div className="flex-1">
            <p className="font-semibold">{answers.name}</p>
            <p className="text-xs text-muted">
              {ageLabel(answers.dob, plan.startDate)} · mulai {start}
            </p>
          </div>
          <Link href="/hasil" className="text-xs font-semibold text-teal-600">
            Lihat menu
          </Link>
        </div>
      </section>

      <section className="mt-6 px-5">
        <p className="mb-2 text-[15px] font-semibold">Pilih paket</p>
        <div className="space-y-3">
          {(Object.keys(PACKAGES) as PackageId[]).map((id) => {
            const p = PACKAGES[id];
            const active = pkg === id;
            return (
              <motion.button key={id} whileTap={{ scale: 0.98 }} onClick={() => setPkg(id)} layout className={`relative w-full rounded-[22px] border-2 p-4 text-left transition-colors ${active ? "border-teal-500 bg-teal-50/60" : "border-line bg-white"}`}>
                {p.badge && <span className="absolute -top-2.5 right-4 rounded-full bg-orange-500 px-3 py-0.5 text-[10px] font-semibold text-white">{p.badge}</span>}
                <div className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? "border-teal-500" : "border-line"}`}>{active && <motion.span layoutId="radio" className="h-2.5 w-2.5 rounded-full bg-teal-500" />}</span>
                  <span className="flex-1 font-semibold">{p.name}</span>
                  <span className="text-right">
                    {p.strike && <span className="block text-[11px] text-muted line-through">{rupiah(p.strike)}</span>}
                    <span className="font-bold text-teal-600">{rupiah(p.price)}</span>
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: IOS_EASE }} className="overflow-hidden pl-8 text-[13px] text-muted">
                      {p.perks.map((x) => (
                        <li key={x} className="mt-1.5 flex gap-2 first:mt-3">
                          <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" />
                          {x}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-5">
        <p className="mb-2 text-[15px] font-semibold">Metode pembayaran</p>
        <div className="flex items-center gap-3 rounded-[22px] border border-line p-3">
          <span className="flex h-11 w-14 items-center justify-center rounded-xl bg-[#f7f8fa] text-[13px] font-black tracking-tight text-ink">QRIS</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">QRIS</p>
            <p className="text-[11px] text-muted">GoPay · OVO · DANA · ShopeePay · m-banking</p>
          </div>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white">
            <IconCheck className="h-3.5 w-3.5" />
          </span>
        </div>
      </section>

      <section className="mt-4 px-5">
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setBump(!bump)} className={`flex w-full items-center gap-3 rounded-[22px] border-2 border-dashed p-3 text-left transition ${bump ? "border-orange-500 bg-orange-50" : "border-teal-400 bg-teal-50/50"}`}>
          <Plate k="d_fruitbowl" size={52} />
          <span className="flex-1 text-[13px]">
            <span className={`block font-semibold ${bump ? "text-orange-600" : "text-teal-700"}`}>
              {BUMP.name} · +{rupiah(BUMP.price)}
            </span>
            <span className="block text-[11.5px] leading-snug text-muted">{BUMP.desc}</span>
          </span>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${bump ? "bg-orange-500 text-white" : "bg-white text-teal-600"}`}>{bump ? <IconCheck className="h-4 w-4" /> : <IconPlus />}</span>
        </motion.button>
      </section>

      <section className="mt-6 space-y-3 px-5">
        <p className="text-[15px] font-semibold">Kirim link menu ke</p>
        <label className="block rounded-[16px] border border-line bg-[#f7f8fa] px-4 py-3 focus-within:border-teal-500 focus-within:bg-white">
          <span className="block text-[11px] text-muted">Nomor WhatsApp</span>
          <input value={wa} onChange={(e) => setWa(e.target.value)} inputMode="tel" placeholder="0812 3456 7890" className="w-full bg-transparent text-[15px] outline-none" />
        </label>
        <label className="block rounded-[16px] border border-line bg-[#f7f8fa] px-4 py-3 focus-within:border-teal-500 focus-within:bg-white">
          <span className="block text-[11px] text-muted">Email (opsional)</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" placeholder="bunda@email.com" className="w-full bg-transparent text-[15px] outline-none" />
        </label>
      </section>

      <section className="mt-6 px-5">
        <div className="space-y-2 rounded-[22px] bg-[#f7f8fa] p-4 text-sm">
          <Row l={`Paket ${PACKAGES[pkg].name}`} v={rupiah(PACKAGES[pkg].price)} />
          {bump && <Row l="Paket Snack" v={rupiah(BUMP.price)} />}
          <Row l="Biaya layanan" v="Gratis" />
          <div className="border-t border-line pt-2">
            <Row l="Total" v={rupiah(total)} bold />
          </div>
        </div>
        <label className="mt-4 flex gap-3 text-[11.5px] leading-snug text-muted">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-teal-500" />
          <span>
            Saya orang tua/wali dan setuju data si kecil dipakai hanya untuk menyusun menu ini (lihat{" "}
            <Link href="/privasi" className="underline">
              kebijakan privasi
            </Link>
            ).
          </span>
        </label>
        <p className="mt-3 flex items-center gap-2 text-[11.5px] text-muted">
          <IconShield className="h-4 w-4 text-teal-500" /> Garansi 7 hari uang kembali · tanpa langganan otomatis
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] border-t border-line bg-white px-5 pb-5 pt-3">
        <AnimatePresence>
          {err && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-2 rounded-xl bg-orange-50 px-3 py-2 text-[13px] text-orange-700">
              {err}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[11px] text-muted">Total</p>
            <motion.p key={total} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-lg font-bold">
              {rupiah(total)}
            </motion.p>
          </div>
          <Button onClick={pay} disabled={loading} className="flex-1">
            {loading ? "Membuat QRIS…" : "Bayar dengan QRIS"}
          </Button>
        </div>
      </div>
    </main>
  );
}

function Row({ l, v, bold = false }: { l: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-[15px] font-bold" : "text-muted"}`}>
      <span>{l}</span>
      <span className={bold ? "text-teal-600" : "text-ink"}>{v}</span>
    </div>
  );
}
