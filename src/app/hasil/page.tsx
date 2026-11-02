"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, Button, Card } from "@/components/ui";
import { IconCheck, IconLock } from "@/components/icons";
import { MealCard, PrepBanner } from "@/components/MealCard";
import { cookie, store, track } from "@/lib/client";
import { ageLabel, dailyNeeds, generatePlan, seedFor, todayJakarta } from "@/lib/generator";
import { BUMP, PACKAGES, rupiah } from "@/lib/pricing";
import { RECIPE_MAP } from "@/lib/recipes";
import { parseAnswers } from "@/lib/validate";
import type { PackageId, QuizAnswers } from "@/lib/types";

const ALLERGY_LABEL: Record<string, string> = { telur: "telur", susu: "susu sapi", ikan: "ikan", seafood: "seafood", kacang: "kacang", kedelai: "kedelai", gandum: "gandum" };
const STAGE_LABEL = { 1: "Pure & lumat", 2: "Cincang & finger food", 3: "Makanan keluarga" } as const;

export default function Page() {
  return (
    <Suspense>
      <Hasil />
    </Suspense>
  );
}

function Hasil() {
  const router = useRouter();
  const sp = useSearchParams();
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [building, setBuilding] = useState(sp.get("baru") === "1");
  const [msg, setMsg] = useState(0);

  useEffect(() => {
    const a = parseAnswers(store.getAnswers());
    if (!a) {
      router.replace("/kuis");
      return;
    }
    setAnswers(a);
  }, [router]);

  useEffect(() => {
    if (!building) return;
    const t = setInterval(() => setMsg((m) => m + 1), 1400);
    const done = setTimeout(() => {
      setBuilding(false);
      router.replace("/hasil");
    }, 6500);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [building, router]);

  const plan = useMemo(() => (answers ? generatePlan(answers, { seed: seedFor(answers), today: todayJakarta() }) : null), [answers]);

  useEffect(() => {
    if (plan && !building) track("ViewResult");
  }, [plan, building]);

  if (!answers || !plan) return <main className="p-6" />;
  const name = answers.name;
  const first = plan.days[0];

  if (building) {
    const steps = [
      `Menghitung usia ${name}: ${ageLabel(answers.dob, first.date)}…`,
      `Menyesuaikan tekstur: ${STAGE_LABEL[first.stage].toLowerCase()}…`,
      answers.allergies.length ? `Menghindari ${answers.allergies.map((x) => ALLERGY_LABEL[x]).join(", ")}…` : "Menjadwalkan pengenalan alergen dengan aman…",
      "Memastikan protein hewani setiap hari…",
      "Menyusun 30 hari menu…",
    ];
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full bg-teal-100" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 text-4xl">🥣</div>
        </div>
        <h1 className="mt-8 text-xl font-bold">Menyusun menu {name}</h1>
        <ul className="mt-6 w-full space-y-3 text-left text-sm">
          {steps.map((s, k) => (
            <li key={s} className={`flex items-center gap-3 transition ${k <= msg ? "opacity-100" : "opacity-30"}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${k < msg ? "bg-teal-500 text-white" : "bg-teal-50"}`}>{k < msg && <IconCheck className="h-3.5 w-3.5" />}</span>
              {s}
            </li>
          ))}
        </ul>
      </main>
    );
  }

  const needs = dailyNeeds(first.ageMonths);
  const locked = plan.days.slice(3);

  return (
    <main className="pb-32">
      {/* Header profil */}
      <section className="rounded-b-[32px] bg-teal-500 px-5 pb-6 pt-6 text-white">
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <div>
            <p className="text-xs opacity-80">Profil MPASI</p>
            <p className="text-lg font-semibold">
              {name}, {ageLabel(answers.dob, first.date)}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs opacity-80">Mulai {fmtDay(first.date)} · 30 hari</p>
        <div className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5">
          {plan.days.map((d) => (
            <a
              key={d.day}
              href={d.day <= 3 ? `#hari-${d.day}` : "#buka"}
              className={`flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-2xl ${d.day <= 3 ? "bg-white text-teal-600" : "bg-teal-400/50 text-white/80"}`}
            >
              <span className="text-[10px]">Hari</span>
              {d.day <= 3 ? <span className="text-lg font-bold leading-none">{d.day}</span> : <IconLock className="h-4 w-4" />}
            </a>
          ))}
        </div>
      </section>

      {/* Kebutuhan harian */}
      <section className="-mt-1 px-5 pt-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">Tekstur: {STAGE_LABEL[first.stage]}</span>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">{answers.cookMode === "mealprep" ? "Mode meal prep" : "Masak harian"}</span>
          {answers.allergies.length > 0 && <span className="rounded-full bg-canvas px-3 py-1 text-xs font-medium">Tanpa {answers.allergies.map((x) => ALLERGY_LABEL[x]).join(", ")}</span>}
        </div>
        <Card className="mt-4">
          <p className="font-semibold">Kebutuhan harian {name}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
            <Need label="Makan utama" value={needs.meals} />
            <Need label="Selingan" value={needs.snack} />
            <Need label="Porsi" value={needs.portion} />
            <Need label="Protein hewani" value="Setiap hari" />
          </div>
          <p className="mt-3 text-[11px] text-muted">Patokan umum WHO & IDAI. Tetap lanjutkan ASI. Ikuti tanda lapar dan kenyang si kecil.</p>
        </Card>
      </section>

      {/* Hari 1–3 gratis */}
      {plan.days.slice(0, 3).map((d) => (
        <section key={d.day} id={`hari-${d.day}`} className="scroll-mt-4 px-5 pt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-lg font-semibold">Hari {d.day}</p>
            <p className="text-xs text-muted">{fmtDay(d.date)} · gratis</p>
          </div>
          {d.prepDay && <PrepBanner />}
          <div className="space-y-3">
            {d.meals.map((m, k) => (
              <MealCard key={k} meal={m} stage={d.stage} />
            ))}
          </div>
        </section>
      ))}

      {/* Hari 4–30 terkunci */}
      <section className="px-5 pt-8">
        <p className="text-lg font-semibold">Hari 4–30</p>
        <p className="text-xs text-muted">27 hari menu {name} sudah tersusun dan menunggu dibuka.</p>
        <div className="relative mt-3">
          <div className="space-y-2">
            {locked.slice(0, 6).map((d) => (
              <Card key={d.day} className="flex items-center gap-3 py-3">
                <span className="w-14 text-sm font-semibold text-teal-600">Hari {d.day}</span>
                <span className="blur-lock flex-1 truncate text-sm">{d.meals.map((m) => RECIPE_MAP[m.recipeId]?.name).join(" · ")}</span>
                <IconLock className="h-4 w-4 text-muted" />
              </Card>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-white/0" />
        </div>
        <p className="mt-2 text-center text-xs text-muted">+ {locked.length - 6} hari lainnya</p>
      </section>

      <Paywall answers={answers} />

      <footer className="px-6 pb-6 pt-8 text-center text-[11px] leading-relaxed text-muted">
        Panduan edukasi, bukan pengganti konsultasi dokter. Bila BB tidak naik atau ada reaksi alergi berat, periksakan ke dokter anak atau posyandu.
        <p className="mt-2 space-x-3">
          <Link href="/privasi">Privasi</Link>
          <Link href="/syarat">Syarat</Link>
          <Link href="/refund">Refund</Link>
        </p>
      </footer>
    </main>
  );
}

function Need({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-canvas p-3">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-0.5 font-medium leading-snug">{value}</p>
    </div>
  );
}

function fmtDay(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
}

function Paywall({ answers }: { answers: QuizAnswers }) {
  const sp = useSearchParams();
  const [pkg, setPkg] = useState<PackageId>("lengkap");
  const [bump, setBump] = useState(false);
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState(sp.get("batal") ? "Pembayaran dibatalkan. Bunda bisa coba lagi kapan saja." : "");
  const [loading, setLoading] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const total = PACKAGES[pkg].price + (bump ? BUMP.price : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
    <>
      <section id="buka" ref={ref} className="scroll-mt-4 px-5 pt-8">
        <div className="rounded-[28px] bg-teal-50 p-5">
          <p className="text-center text-lg font-bold">Buka 30 hari menu {answers.name}</p>
          <p className="mt-1 text-center text-xs text-muted">Sekali bayar lewat QRIS · tanpa langganan · garansi 7 hari</p>

          <div className="mt-5 space-y-3">
            {(Object.keys(PACKAGES) as PackageId[]).map((id) => {
              const p = PACKAGES[id];
              const active = pkg === id;
              return (
                <button key={id} onClick={() => setPkg(id)} className={`relative w-full rounded-2xl border-2 bg-white p-4 text-left transition ${active ? "border-teal-500" : "border-white"}`}>
                  {p.badge && <span className="absolute -top-2.5 right-4 rounded-full bg-orange-500 px-3 py-0.5 text-[10px] font-semibold text-white">{p.badge}</span>}
                  <div className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? "border-teal-500" : "border-line"}`}>{active && <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />}</span>
                    <span className="flex-1 font-semibold">{p.name}</span>
                    <span className="text-right">
                      {p.strike && <span className="block text-[11px] text-muted line-through">{rupiah(p.strike)}</span>}
                      <span className="font-bold text-teal-600">{rupiah(p.price)}</span>
                    </span>
                  </div>
                  {active && (
                    <ul className="mt-3 space-y-1 pl-8 text-[13px] text-muted">
                      {p.perks.map((x) => (
                        <li key={x} className="flex gap-2">
                          <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>

          <label className="mt-4 flex cursor-pointer gap-3 rounded-2xl border-2 border-dashed border-orange-400 bg-orange-50 p-4">
            <input type="checkbox" checked={bump} onChange={(e) => setBump(e.target.checked)} className="mt-1 h-5 w-5 accent-orange-500" />
            <span className="text-[13px]">
              <span className="font-semibold text-orange-600">Ya, tambahkan {BUMP.name} (+{rupiah(BUMP.price)})</span>
              <span className="mt-0.5 block text-muted">{BUMP.desc}</span>
            </span>
          </label>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium">Nomor WhatsApp (link menu dikirim ke sini)</span>
              <input value={wa} onChange={(e) => setWa(e.target.value)} inputMode="tel" placeholder="0812 3456 7890" className="mt-1 w-full rounded-2xl border-2 border-white bg-white px-4 py-3 outline-none focus:border-teal-500" />
            </label>
            <label className="block">
              <span className="text-xs font-medium">Email (opsional)</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" placeholder="bunda@email.com" className="mt-1 w-full rounded-2xl border-2 border-white bg-white px-4 py-3 outline-none focus:border-teal-500" />
            </label>
            <label className="flex gap-2 text-[11px] leading-snug text-muted">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 shrink-0 accent-teal-500" />
              <span>
                Saya orang tua/wali dan setuju data si kecil dipakai hanya untuk menyusun menu ini (lihat{" "}
                <Link href="/privasi" className="underline">
                  kebijakan privasi
                </Link>
                ).
              </span>
            </label>
          </div>

          {err && <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-700">{err}</p>}
          <Button className="mt-4" onClick={pay} disabled={loading}>
            {loading ? "Membuat QRIS…" : `Bayar dengan QRIS · ${rupiah(total)}`}
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted">GoPay · OVO · DANA · ShopeePay · LinkAja · m-banking</p>
        </div>
      </section>

      {!inView && (
        <div className="no-print fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] bg-gradient-to-t from-white via-white to-white/0 px-5 pb-5 pt-6">
          <a href="#buka" className="block w-full rounded-full bg-teal-500 py-4 text-center font-semibold text-white shadow-[var(--shadow-lift)]">
            Buka 30 hari · {rupiah(PACKAGES.lengkap.price)}
          </a>
        </div>
      )}
    </>
  );
}
