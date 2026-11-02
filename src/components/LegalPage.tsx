import Link from "next/link";
import { Logo } from "@/components/Logo";
import { IconBack } from "./icons";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  const admin = process.env.NEXT_PUBLIC_ADMIN_WA;
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME || "Flourish Care";
  return (
    <main className="px-6 pb-12 pt-6 text-sm leading-relaxed">
<div className="flex items-center justify-between">
      <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas" aria-label="Kembali">
        <IconBack />
      </Link>
        <Link href="/"><Logo size={28} /></Link>
      </div>
      <h1 className="mt-6 text-2xl font-bold">{title}</h1>
      <div className="mt-4 space-y-3 text-muted [&_b]:text-ink [&_h2]:mt-5 [&_h2]:font-semibold [&_h2]:text-ink">{children}</div>
      <p className="mt-8 text-xs text-muted">
        {company}
        {admin && <> · WhatsApp admin: +{admin}</>}
        {process.env.NEXT_PUBLIC_SUPPORT_EMAIL && <> · {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</>}
      </p>
    </main>
  );
}
