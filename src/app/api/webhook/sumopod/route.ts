import { NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/server/sumopod";
import { findOrder, updateOrder } from "@/lib/server/repo";
import { fulfillPaid, siteUrl } from "@/lib/server/payments";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(req.headers, raw)) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  let evt: { event_type?: string; data?: { order_id?: string; amount?: number; status?: string } };
  try {
    evt = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const type = evt.event_type;
  const code = evt.data?.order_id;
  if (type === "payment.test" || !code) return NextResponse.json({ status: "ignored" });

  const order = await findOrder(code);
  if (!order) return NextResponse.json({ status: "unknown order" }); // 200 supaya tidak dikirim ulang terus

  if (type === "payment.completed") {
    if (Number(evt.data?.amount) !== order.amount) {
      console.error("Nominal tidak cocok", code, evt.data?.amount, order.amount);
      await updateOrder(code, { raw_webhook: evt });
      return NextResponse.json({ status: "amount mismatch" });
    }
    const r = await fulfillPaid(code, evt, siteUrl(req));
    return NextResponse.json({ status: "ok", ...("already" in r ? { already: true } : {}) });
  }
  if (type === "payment.expired" && order.status === "pending") await updateOrder(code, { status: "expired", raw_webhook: evt });
  if (type === "payment.failed" && order.status === "pending") await updateOrder(code, { status: "failed", raw_webhook: evt });
  return NextResponse.json({ status: "ok" });
}
