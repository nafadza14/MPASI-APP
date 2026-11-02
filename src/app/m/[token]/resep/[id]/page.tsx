import { notFound } from "next/navigation";
import { findCustomerByToken } from "@/lib/server/repo";
import { RECIPE_MAP } from "@/lib/recipes";
import { features } from "@/lib/pricing";
import RecipeScreen from "./RecipeScreen";
import type { Stage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Resep({ params, searchParams }: { params: Promise<{ token: string; id: string }>; searchParams: Promise<{ b?: string; d?: string; s?: string }> }) {
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
    <RecipeScreen
      token={token}
      recipeId={id}
      stage={stage}
      label={meal ? `Hari ${day.day} · ${meal.label}` : undefined}
      newAllergen={meal?.newAllergen ?? null}
      canFav={features(c.package).favorites}
      fav={c.favorites.includes(id)}
    />
  );
}
