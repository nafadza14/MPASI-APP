"use client";
import { Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Button, TopBar } from "@/components/ui";
import { Plate } from "@/components/Img";
import { IconCheck } from "@/components/icons";
import { store, track } from "@/lib/client";
import { rupiah } from "@/lib/pricing";

type Status = { status: string; kind: string; amount: number; token?: string; payment_url?: string | null };

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return (
    <Suspense>
      <Bayar code={code} />
    </Suspense>
  );
}

function Bayar({ code }: { code: string }) {
  const router = useRouter();
  const demo = useSearchParams().get("demo") === "1";
  const [s, setS] = useState<Status | null>(null);
  const [checking, setChecking] = useState(false);
  const fired = useRef(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const r = await fetch(`/api/orders/${code}`, { cache: "no-store" });
      if (r.ok) setS(await r.json());
    } finally {
      setChecking(false);
    }
  }, [code]);

  useEffect(() => {
    check();
    const t = setInterval(check, 3000);
    return () => clearInterval(t);
  }, [check]);

  useEffect(() => {
    if (s?.status !== "paid" || !s.token || fired.current) return;
    fired.current = true;
    store.setToken(s.token);
    track("Purchase", { value: s.amount, currency: "IDR", content_name: s.kind }, code);
    const t = setTimeout(() => router.replace(s.kind === "main" ? `/sukses/${code}` : `/m/${s.token}?upgraded=1`), 900);
    return () => clearTimeout(t);
  }, [s, code, router]);

  async function simulate() {
    await fetch("/api/demo/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    check();
  }

  const paid = s?.status === "paid";
  const expired = s?.status === "expired" || s?.status === "failed";
  const steps = [
    { t: "Pesanan dibuat", d: code, done: true },
    { t: expired ? "QRIS kedaluwarsa" : "Menunggu pembayaran QRIS", d: s ? rupiah(s.amount) : "…", done: paid, active: !paid && !expired },
    { t: "Menu si kecil dibuka", d: "Otomatis setelah lunas", done: paid },
  ];

  return (
    <main className="flex min-h-dvh flex-col pb-6">
      <TopBar title="Pembayaran" onBack={() => router.push("/checkout")} />
      <div className="flex flex-col items-center px-6 pt-4 text-center">
        <motion.div animate={paid ? { scale: [1, 1.08, 1] } : { rotate: [0, 6, -6, 0] }} transition={paid ? { duration: 0.6 } : { duration: 2.4, repeat: Infinity }}>
          <Plate k={paid ? "d_fruitbowl" : expired ? "x_mashed" : "x_carrotsoup"} size={160} />
        </motion.div>
        <h1 className="mt-6 text-[22px] font-bold">{paid ? "Pembayaran diterima!" : expired ? "QRIS sudah tidak berlaku" : "Selesaikan pembayaran"}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {paid ? "Membuka menu si kecil…" : expired ? "Silakan buat pembayaran baru dari halaman checkout." : "Halaman ini berpindah otomatis begitu pembayaran masuk, biasanya kurang dari 1 menit."}
        </p>
      </div>

      <div className="mx-5 mt-7 rounded-[24px] bg-[#f7f8fa] p-5">
        {steps.map((x, k) => (
          <div key={k} className="relative flex gap-4 pb-5 last:pb-0">
            {k < steps.length - 1 && <span className={`absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5 ${x.done ? "bg-teal-500" : "bg-line"}`} />}
            <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${x.done ? "bg-teal-500 text-white" : x.active ? "bg-orange-500 text-white" : "bg-white text-muted ring-1 ring-line"}`}>
              {x.done ? <IconCheck className="h-4 w-4" /> : x.active ? <motion.span className="h-2 w-2 rounded-full bg-white" animate={{ scale: [1, 1.6, 1] }} transition={{ duration: 1, repeat: Infinity }} /> : k + 1}
            </span>
            <div>
              <p className="text-sm font-semibold">{x.t}</p>
              <p className="text-xs text-muted">{x.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3 px-5 pt-8">
        {s?.status === "pending" && s.payment_url && !demo && (
          <Button onClick={() => (window.location.href = s.payment_url!)}>Buka lagi halaman QRIS</Button>
        )}
        {demo && s?.status === "pending" && (
          <Button variant="orange" onClick={simulate}>
            [DEMO] Simulasikan pembayaran berhasil
          </Button>
        )}
        {!expired && !paid && (
          <Button variant="outline" onClick={check} disabled={checking}>
            {checking ? "Mengecek…" : "Saya sudah bayar"}
          </Button>
        )}
        {expired && <Button onClick={() => router.push("/checkout")}>Buat pembayaran baru</Button>}
        {process.env.NEXT_PUBLIC_ADMIN_WA && !paid && (
          <a className="block pt-1 text-center text-xs text-teal-600 underline" href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA}?text=${encodeURIComponent("Halo admin, saya sudah bayar menu MPASI dengan kode " + code)}`}>
            Sudah bayar tapi belum terbuka? Hubungi admin
          </a>
        )}
      </div>
    </main>
  );
}
