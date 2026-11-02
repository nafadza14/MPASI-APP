import { notFound } from "next/navigation";
import { findCustomerByToken } from "@/lib/server/repo";
import { features } from "@/lib/pricing";
import MenuApp from "./MenuApp";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = await findCustomerByToken(token);
  if (!c) notFound();
  if (!c.paid || !c.plans.length) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
        <p className="text-5xl">⏳</p>
        <h1 className="mt-4 text-xl font-bold">Pembayaran belum terkonfirmasi</h1>
        <p className="mt-2 text-sm text-muted">Bila sudah bayar, tunggu 1–2 menit lalu muat ulang halaman ini, atau hubungi admin.</p>
      </main>
    );
  }
  const f = features(c.package, c.plans.length);
  return (
    <MenuApp
      token={c.access_token}
      name={c.child_name}
      dob={c.answers.dob}
      pkg={c.package}
      plans={c.plans}
      favorites={c.favorites}
      swapsLeft={Math.max(0, f.swaps - c.swaps_used)}
      snackPlus={c.snack_plus}
      allergies={c.answers.allergies}
    />
  );
}
