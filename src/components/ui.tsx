import Link from "next/link";
import type { ReactNode } from "react";

export function Button({ children, variant = "primary", className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "orange" | "outline" | "ghost" }) {
  const v = {
    primary: "bg-teal-500 text-white shadow-[var(--shadow-lift)] active:bg-teal-600 disabled:bg-teal-100 disabled:shadow-none",
    orange: "bg-orange-500 text-white shadow-[0_10px_30px_rgba(251,154,27,0.3)] active:bg-orange-600 disabled:opacity-50",
    outline: "border-2 border-teal-500 text-teal-600 bg-white active:bg-teal-50",
    ghost: "text-muted",
  }[variant];
  return (
    <button {...rest} className={`w-full rounded-full px-6 py-3.5 text-[15px] font-semibold transition ${v} ${className}`}>
      {children}
    </button>
  );
}

export function LinkButton({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: "primary" | "outline" | "orange"; className?: string }) {
  const v = {
    primary: "bg-teal-500 text-white shadow-[var(--shadow-lift)]",
    outline: "border-2 border-teal-500 text-teal-600 bg-white",
    orange: "bg-orange-500 text-white",
  }[variant];
  return (
    <Link href={href} className={`block w-full rounded-full px-6 py-3.5 text-center text-[15px] font-semibold ${v} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-soft)] ${className}`}>{children}</div>;
}

export function Chip({ children, active = false, className = "" }: { children: ReactNode; active?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${active ? "bg-teal-500 text-white" : "bg-teal-50 text-teal-700"} ${className}`}>
      {children}
    </span>
  );
}

export function FoodBubble({ emoji, size = 64, tint = "teal" }: { emoji: string; size?: number; tint?: "teal" | "orange" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${tint === "teal" ? "bg-teal-50" : "bg-orange-50"}`}
      style={{ width: size, height: size, fontSize: size * 0.48 }}
      aria-hidden
    >
      {emoji}
    </div>
  );
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div className="flex shrink-0 items-center justify-center rounded-full bg-orange-400 font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {name.trim().charAt(0).toUpperCase() || "B"}
    </div>
  );
}
