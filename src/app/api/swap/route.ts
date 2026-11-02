import { NextResponse } from "next/server";
import { features } from "@/lib/pricing";
import { swapCandidates } from "@/lib/generator";
import { findCustomerByToken, updateCustomer } from "@/lib/server/repo";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { token, month, day, meal } = await req.json().catch(() => ({}));
  const c = await findCustomerByToken(String(token ?? ""));
  if (!c || !c.paid) return NextResponse.json({ error: "Akses tidak ditemukan" }, { status: 404 });
  const f = features(c.package, c.plans.length);
  if (c.swaps_used >= f.swaps) return NextResponse.json({ error: f.swaps ? "Jatah ganti menu sudah habis" : "Ganti menu tersedia di paket Lengkap" }, { status: 403 });
  const plans = structuredClone(c.plans);
  const plan = plans[Number(month) - 1];
  const d = plan?.days[Number(day) - 1];
  if (!d || !d.meals[Number(meal)]) return NextResponse.json({ error: "Menu tidak ditemukan" }, { status: 400 });
  const cands = swapCandidates(c.answers, plan, Number(day) - 1, Number(meal));
  if (!cands.length) return NextResponse.json({ error: d.meals[Number(meal)].newAllergen ? "Menu pengenalan alergen sebaiknya tidak diganti" : "Belum ada pengganti yang cocok untuk menu ini" }, { status: 409 });
  const pick = cands[(c.swaps_used * 7 + Number(day)) % cands.length];
  d.meals[Number(meal)] = { ...d.meals[Number(meal)], recipeId: pick.id, newAllergen: null };
  await updateCustomer(c.id, { plans, swaps_used: c.swaps_used + 1 });
  return NextResponse.json({ ok: true, recipeId: pick.id, swapsLeft: f.swaps - c.swaps_used - 1 });
}
