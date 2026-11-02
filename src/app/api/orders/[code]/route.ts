import { NextResponse } from "next/server";
import { findCustomerById, findOrder } from "@/lib/server/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const order = await findOrder(code);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  const res: Record<string, unknown> = { status: order.status, kind: order.kind, amount: order.amount, payment_url: order.status === "pending" ? order.payment_url : null };
  if (order.status === "paid") {
    const c = await findCustomerById(order.customer_id);
    res.token = c?.access_token;
    res.package = c?.package;
  }
  return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
}
