import { notFound } from "next/navigation";
import Link from "next/link";
import { findCustomerByToken } from "@/lib/server/repo";
import { RECIPE_MAP, scaleQty, TEXTURE_NOTE } from "@/lib/recipes";
import { features } from "@/lib/pricing";
import { IconBack, IconClock } from "@/components/icons";
import FavButton from "./FavButton";
import type { Stage } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLERGEN: Record<string, string> = { telur: "Telur", susu: "Susu", ikan: "Ikan", seafood: "Seafood", kacang: "Kacang", kedelai: "Kedelai", gandum: "Gandum" };

export default async function Resep({ params, searchParams }: { params: Promise<{ token: string; id: string }>; searchParams: Promise<{ b?: string; d?: string }> }) {
  const { token, id } = await params;
  const sp = await searchParams;
  const c = await findCustomerByToken(token);
  const r = RECIPE_MAP[id];
  if (!c || !c.paid || !r) notFound();
  const plan = c.plans[Number(sp.b ?? 1) - 1] ?? c.plans[0];
  const day = plan.days[Number(sp.d ?? 1) - 1];
  const stage: Stage = day && r.stages.includes(day.stage) ? day.stage : r.stages[0];
  const meal = day?.meals.find((m) => m.recipeId === id);

  return (
    <main className="pb-10">
      <div className="relative flex h-64 items-center justify-center rounded-b-[36px] bg-orange-50">
        <Link href={`/m/${token}`} className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[var(--shadow-soft)]" aria-label="Kembali">
          <IconBack />
        </Link>
        {features(c.package).favorites && <FavButton token={token} recipeId={id} initial={c.favorites.includes(id)} />}
        <span className="text-[110px] drop-shadow-sm">{r.emoji}</span>
      </div>
      <section className="px-5 pt-5">
        <p className="text-xs font-medium text-teal-600">{meal ? `Hari ${day.day} · ${meal.label}` : r.slot === "utama" ? "Menu utama" : "Snack"}</p>
        <h1 className="mt-1 text-2xl font-bold">{r.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1 rounded-full bg-canvas px-3 py-1"><IconClock /> {r.minutes} menit</span>
          {r.freezable && <span className="rounded-full bg-canvas px-3 py-1">🧊 Bisa dibekukan</span>}
          {r.protein && <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">Protein hewani</span>}
          {r.allergens.map((a) => (
            <span key={a} className="rounded-full bg-orange-50 px-3 py-1 text-orange-600">Mengandung {ALLERGEN[a]}</span>
          ))}
        </div>

        {meal?.newAllergen && (
          <p className="mt-4 rounded-2xl bg-orange-500 p-4 text-sm text-white">
            Pertama kali mengenalkan <b>{ALLERGEN[meal.newAllergen]}</b>. Berikan pagi hari, mulai sedikit, amati ruam, muntah, diare, atau bengkak selama 3 hari. Bila ada sesak atau bengkak di wajah, segera ke IGD.
          </p>
        )}

        <div className="mt-5 rounded-[24px] bg-teal-500 p-4 text-sm text-white">
          <p className="font-semibold">Tekstur sesuai usia</p>
          <p className="mt-1 opacity-90">{TEXTURE_NOTE[stage]}</p>
        </div>

        <h2 className="mt-6 text-lg font-semibold">Bahan (1 porsi)</h2>
        <ul className="mt-2 divide-y divide-line rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-soft)]">
          {r.ingredients.map((g) => (
            <li key={g.item} className="flex justify-between gap-4 px-4 py-3 text-sm">
              <span>{g.item}</span>
              <span className="shrink-0 font-semibold text-teal-600">
                {g.unit === "g" || g.unit === "ml" ? scaleQty(g.qty, stage) : g.qty} {g.unit}
              </span>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-lg font-semibold">Cara membuat</h2>
        <ol className="mt-2 space-y-3">
          {r.steps.map((s, k) => (
            <li key={s} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">{k + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        {r.freezable && (
          <div className="mt-6 rounded-2xl bg-canvas p-4 text-[13px] leading-relaxed text-muted">
            <b className="text-ink">Penyimpanan:</b> dinginkan maks. 1 jam, simpan di wadah tertutup berlabel tanggal. Kulkas maks. 2 hari, freezer maks. 2 minggu. Cairkan di kulkas semalam, panaskan hingga beruap merata.
          </div>
        )}
        <p className="mt-6 text-center text-[11px] text-muted">Tanpa tambahan gula dan garam untuk bayi di bawah 12 bulan.</p>
      </section>
    </main>
  );
}
