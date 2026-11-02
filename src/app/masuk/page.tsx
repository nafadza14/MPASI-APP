"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TopBar } from "@/components/ui";
import { Plate } from "@/components/Img";
import { store } from "@/lib/client";

export default function Masuk() {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    const t = store.getToken();
    if (t) router.replace(`/m/${t}`);
  }, [router]);
  const admin = process.env.NEXT_PUBLIC_ADMIN_WA;
  return (
    <main className="flex min-h-dvh flex-col pb-6">
      <TopBar title="Masuk" />
      <div className="flex flex-col items-center px-6 pt-6 text-center">
        <Plate k="h_babyeat3" size={150} />
        <h1 className="mt-6 text-[22px] font-bold">Selamat datang kembali</h1>
        <p className="mt-2 text-[13px] text-muted">Tempel link akses menu yang dikirim ke WhatsApp Bunda setelah pembayaran.</p>
      </div>
      <div className="mt-8 space-y-3 px-5">
        <label className="block rounded-[16px] border border-line bg-[#f7f8fa] px-4 py-3 focus-within:border-teal-500 focus-within:bg-white">
          <span className="block text-[11px] text-muted">Link akses</span>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://mpasi.flouriscare.id/m/…" className="w-full bg-transparent text-[15px] outline-none" />
        </label>
        {err && <p className="text-sm text-orange-700">{err}</p>}
        <Button
          onClick={() => {
            const m = link.match(/\/m\/([A-Za-z0-9_-]{20,64})/) || link.trim().match(/^([A-Za-z0-9_-]{20,64})$/);
            if (!m) return setErr("Link belum benar. Salin utuh dari pesan WhatsApp.");
            router.push(`/m/${m[1]}`);
          }}
        >
          Buka menu
        </Button>
      </div>
      <div className="mt-auto px-5 pt-8 text-center text-xs text-muted">
        Tidak menemukan link?{" "}
        {admin ? (
          <a className="font-semibold text-teal-600" href={`https://wa.me/${admin}?text=${encodeURIComponent("Halo admin, saya butuh link akses menu MPASI saya.")}`}>
            Chat admin
          </a>
        ) : (
          "Hubungi admin."
        )}
      </div>
    </main>
  );
}
