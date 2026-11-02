"use client";
import { motion } from "motion/react";
import { LinkButton } from "@/components/ui";
import { Plate } from "@/components/Img";
import UpsellButton from "@/components/UpsellButton";
import { IOS_EASE, spring } from "@/components/motion";

export default function SuccessView({ token, name, pkgName, wa, upsell }: { token: string; name: string; pkgName: string; wa: string; upsell: { title: string; desc: string; price: string } | null }) {
  return (
    <main className="relative flex min-h-dvh flex-col bg-ink/45 px-5 pb-6 pt-16">
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring} className="rounded-[32px] bg-white px-6 pb-6 pt-8 text-center shadow-2xl">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 shadow-[var(--shadow-lift)]">
          <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 12l5 5L20 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.5, ease: IOS_EASE }} />
          </svg>
        </div>
        <h1 className="mt-6 text-[22px] font-bold">Pembayaran berhasil!</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Menu 30 hari {name} sudah siap (paket {pkgName}). Link akses juga dikirim ke WhatsApp {wa}.
        </p>
        <div className="mt-6">
          <LinkButton href={`/m/${token}`} variant="orange">
            Buka menu {name}
          </LinkButton>
        </div>
      </motion.div>

      {upsell && (
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5, ease: IOS_EASE }} className="relative mt-5 overflow-hidden rounded-[28px] bg-white p-5">
          <Plate k="x_chickenrice" size={86} className="absolute -right-3 -top-3" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-600">Penawaran sekali ini</p>
          <p className="mt-1 max-w-[70%] text-[17px] font-bold leading-snug">{upsell.title}</p>
          <p className="mt-1 text-[13px] text-muted">{upsell.desc}</p>
          <div className="mt-2 rounded-2xl border-2 border-dashed border-orange-400 bg-orange-50 px-4 py-2 text-center text-sm">
            Cukup tambah <b className="text-orange-600">{upsell.price}</b>
          </div>
          <UpsellButton token={token} label={`Ya, tambahkan · ${upsell.price}`} />
        </motion.section>
      )}
    </main>
  );
}
