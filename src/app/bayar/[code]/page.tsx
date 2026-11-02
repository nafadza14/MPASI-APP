"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { store, track } from "@/lib/client";
import { rupiah } from "@/lib/pricing";

type Status = { status: string; kind: string; amount: number; token?: string; payment_url?: string | null };

export default function Bayar({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
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
    track("Purchase", { value: s.amount, currency: "IDR", content_name: s.kind }, code); // eventID = kode pesanan (dedup dengan CAPI)
    router.replace(s.kind === "main" ? `/sukses/${code}` : `/m/${s.token}?upgraded=1`);
  }, [s, code, router]);

  async function simulate() {
    await fetch("/api/demo/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    check();
  }

  const expired = s?.status === "expired" || s?.status === "failed";
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 text-5xl">{expired ? "⌛" : "📲"}</div>
      <h1 className="mt-6 text-xl font-bold">{expired ? "Pembayaran kedaluwarsa" : s?.status === "paid" ? "Pembayaran berhasil!" : "Menunggu pembayaran QRIS"}</h1>
      <p className="mt-2 text-sm text-muted">
        {expired
          ? "QR sudah tidak berlaku. Silakan buat pembayaran baru dari halaman hasil."
          : s?.status === "paid"
            ? "Membuka menu si kecil…"
            : "Halaman ini otomatis berpindah begitu pembayaran diterima. Biasanya kurang dari 1 menit."}
      </p>
      {s && <p className="mt-4 rounded-full bg-canvas px-4 py-1.5 text-sm font-semibold">{rupiah(s.amount)} · {code}</p>}

      <div className="mt-8 w-full space-y-3">
        {s?.status === "pending" && s.payment_url && !demo && (
          <a href={s.payment_url} className="block w-full rounded-full bg-teal-500 py-3.5 font-semibold text-white shadow-[var(--shadow-lift)]">
            Buka lagi halaman QRIS
          </a>
        )}
        {demo && s?.status === "pending" && (
          <Button variant="orange" onClick={simulate}>
            [DEMO] Simulasikan pembayaran berhasil
          </Button>
        )}
        {!expired && s?.status !== "paid" && (
          <Button variant="outline" onClick={check} disabled={checking}>
            {checking ? "Mengecek…" : "Saya sudah bayar"}
          </Button>
        )}
        {expired && (
          <a href="/hasil#buka" className="block w-full rounded-full bg-teal-500 py-3.5 font-semibold text-white">
            Kembali ke menu
          </a>
        )}
      </div>
      {process.env.NEXT_PUBLIC_ADMIN_WA && (
        <a className="mt-6 text-xs text-teal-600 underline" href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA}?text=${encodeURIComponent("Halo admin, saya sudah bayar MPASI dengan kode " + code)}`}>
          Sudah bayar tapi belum terbuka? Hubungi admin
        </a>
      )}
    </main>
  );
}
