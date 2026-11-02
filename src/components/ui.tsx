"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { IconBack } from "./icons";
import { markBack } from "./navdir";

type BtnVariant = "primary" | "orange" | "outline" | "ghost" | "soft";
const VARIANT: Record<BtnVariant, string> = {
  primary: "bg-teal-500 text-white shadow-[var(--shadow-lift)] disabled:bg-teal-100 disabled:shadow-none",
  orange: "bg-orange-500 text-white shadow-[0_10px_26px_rgba(251,154,27,0.35)] disabled:opacity-50",
  outline: "border-[1.5px] border-teal-500 text-teal-600 bg-white",
  soft: "bg-teal-50 text-teal-700",
  ghost: "text-muted",
};

export function Button({ children, variant = "primary", className = "", ...rest }: HTMLMotionProps<"button"> & { variant?: BtnVariant }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }} {...rest} className={`w-full rounded-[18px] px-6 py-4 text-[15px] font-semibold ${VARIANT[variant]} ${className}`}>
      {children}
    </motion.button>
  );
}

export function LinkButton({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: BtnVariant; className?: string }) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} className="w-full">
      <Link href={href} className={`block w-full rounded-[18px] px-6 py-4 text-center text-[15px] font-semibold ${VARIANT[variant]} ${className}`}>
        {children}
      </Link>
    </motion.div>
  );
}

/** Bar atas ala Kiddo: tombol kembali kiri, judul di tengah. */
export function TopBar({ title, right, onBack, transparent = false }: { title?: string; right?: ReactNode; onBack?: () => void; transparent?: boolean }) {
  const router = useRouter();
  return (
    <header className={`sticky top-0 z-30 flex h-14 items-center justify-between px-4 ${transparent ? "" : "bg-white/90 backdrop-blur-md"}`}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        aria-label="Kembali"
        onClick={() => {
          markBack();
          if (onBack) onBack();
          else router.back();
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full"
      >
        <IconBack className="h-5 w-5" />
      </motion.button>
      {title && <p className="text-[16px] font-semibold">{title}</p>}
      <div className="flex h-10 min-w-10 items-center justify-end">{right}</div>
    </header>
  );
}

export function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <p className="text-[17px] font-semibold">{title}</p>
      {action && (
        <button onClick={onAction} className="text-xs font-medium text-teal-600">
          {action}
        </button>
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-soft)] ${className}`}>{children}</div>;
}

export function Avatar({ name, size = 44, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 font-semibold text-white ring-4 ring-orange-50 ${className}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {name.trim().charAt(0).toUpperCase() || "B"}
    </div>
  );
}

export function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="flex gap-0.5 text-[10px] text-orange-400" aria-hidden>
      {"★★★★★".slice(0, n)}
      <span className="text-line">{"★★★★★".slice(n)}</span>
    </span>
  );
}

export function Dots({ n, active }: { n: number; active: number }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: n }, (_, k) => (
        <motion.span key={k} animate={{ width: k === active ? 22 : 6, backgroundColor: k === active ? "#23b496" : "#cdeee5" }} className="h-1.5 rounded-full" />
      ))}
    </div>
  );
}
