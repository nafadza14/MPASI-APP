import { notFound } from "next/navigation";
import { findCustomerByToken, updateCustomer } from "@/lib/server/repo";
import { generatePlan, seedFor } from "@/lib/generator";
import { RECIPE_MAP } from "@/lib/recipes";
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
  // Database resep diperbarui: susun ulang menu lama yang memakai resep yang sudah tidak ada
  // (tanggal mulai, seed, dan aturan sama persis, jadi hanya isi menunya yang berganti).
  if (c.plans.some((p) => p.days.some((d) => d.meals.some((m) => !RECIPE_MAP[m.recipeId])))) {
    const today = new Date(new Date(c.created_at).getTime() + 7 * 3600e3).toISOString().slice(0, 10);
    c.plans = c.plans.map((p) => generatePlan(c.answers, { seed: seedFor(c.answers), month: p.month, snackPlus: c.snack_plus, today }));
    c.favorites = c.favorites.filter((id) => RECIPE_MAP[id]);
    await updateCustomer(c.id, { plans: c.plans, favorites: c.favorites });
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
