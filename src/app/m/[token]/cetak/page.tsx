import { notFound } from "next/navigation";
import { findCustomerByToken } from "@/lib/server/repo";
import { RECIPE_MAP, scaleQty, TEXTURE_NOTE } from "@/lib/recipes";
import { ageLabel } from "@/lib/generator";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function Cetak({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ b?: string }> }) {
  const { token } = await params;
  const { b } = await searchParams;
  const c = await findCustomerByToken(token);
  if (!c || !c.paid) notFound();
  const plan = c.plans[Number(b ?? 1) - 1] ?? c.plans[0];
  const used = [...new Set(plan.days.flatMap((d) => d.meals.map((m) => m.recipeId)))];
  const stageOf = (id: string) => plan.days.find((d) => d.meals.some((m) => m.recipeId === id))?.stage ?? 1;

  return (
    <main className="px-6 py-8 text-[12px] leading-relaxed">
      <PrintButton />
      <h1 className="text-2xl font-bold text-teal-600">Menu MPASI {c.child_name}</h1>
      <p className="text-muted">
        Bulan {plan.month} · mulai {plan.startDate} · usia {ageLabel(c.answers.dob, plan.startDate)} · Flouris Care
      </p>
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="bg-teal-500 text-left text-white">
            <th className="p-1.5">Hari</th>
            <th className="p-1.5">Menu</th>
          </tr>
        </thead>
        <tbody>
          {plan.days.map((d) => (
            <tr key={d.day} className="border-b border-line align-top">
              <td className="w-20 p-1.5 font-semibold">
                {d.day}
                <div className="font-normal text-muted">{d.date.slice(5)}</div>
              </td>
              <td className="p-1.5">
                {d.prepDay && <b className="text-orange-600">[Hari masak] </b>}
                {d.meals.map((m) => `${m.label}: ${RECIPE_MAP[m.recipeId]?.name}${m.newAllergen ? ` (kenalkan ${m.newAllergen})` : ""}`).join(" · ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="print-break mt-8 text-xl font-bold text-teal-600">Resep</h2>
      {used.map((id) => {
        const r = RECIPE_MAP[id];
        const st = stageOf(id);
        return (
          <section key={id} className="mt-4 break-inside-avoid border-b border-line pb-3">
            <p className="text-sm font-bold">
              {r.emoji} {r.name}
            </p>
            <p className="text-muted">{r.ingredients.map((g) => `${g.item} ${g.unit === "g" || g.unit === "ml" ? scaleQty(g.qty, st) : g.qty} ${g.unit}`).join(" · ")}</p>
            <ol className="list-decimal pl-5">
              {r.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="text-teal-700">{TEXTURE_NOTE[st]}</p>
          </section>
        );
      })}
      <p className="mt-6 text-center text-muted">Panduan edukasi, bukan pengganti konsultasi dokter. Tanpa gula & garam tambahan di bawah 12 bulan.</p>
    </main>
  );
}
