import { NextResponse } from "next/server";
import { RECIPE_MAP } from "@/lib/recipes";
import { findCustomerByToken, updateCustomer } from "@/lib/server/repo";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { token, recipeId, on } = await req.json().catch(() => ({}));
  const c = await findCustomerByToken(String(token ?? ""));
  if (!c || !c.paid || !RECIPE_MAP[recipeId]) return NextResponse.json({ error: "not found" }, { status: 404 });
  const set = new Set(c.favorites);
  if (on) set.add(recipeId);
  else set.delete(recipeId);
  await updateCustomer(c.id, { favorites: [...set] });
  return NextResponse.json({ ok: true, favorites: [...set] });
}
