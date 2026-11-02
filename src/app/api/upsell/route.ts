import { NextResponse } from "next/server";
import { upsellFor, RENEWAL_PRICE } from "@/lib/pricing";
import { findCustomerByToken, insertOrder, newOrderCode } from "@/lib/server/repo";
import { siteUrl, startPayment } from "@/lib/server/payments";

export const runtime = "nodejs";

/** Paywall #2 (upsell naik paket) dan #3 (perpanjangan bulan berikutnya). body: { token, type: "upgrade" | "renewal" } */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const c = await findCustomerByToken(String(body.token ?? ""));
  if (!c || !c.paid) return NextResponse.json({ error: "Akses tidak ditemukan" }, { status: 404 });

  let kind: "upsell" | "renewal";
  let amount: number;
  let pkg = c.package;
  if (body.type === "renewal") {
    kind = "renewal";
    amount = RENEWAL_PRICE;
  } else {
    const u = upsellFor(c.package);
    if (!u) return NextResponse.json({ error: "Sudah di paket tertinggi" }, { status: 400 });
    kind = "upsell";
    amount = u.price;
    pkg = u.to;
  }
  try {
    const order = await insertOrder({
      code: newOrderCode(),
      customer_id: c.id,
      kind,
      package: pkg,
      bump: false,
      amount,
      utm: {},
      fbp: typeof body.fbp === "string" ? body.fbp : null,
      fbc: typeof body.fbc === "string" ? body.fbc : null,
      client_ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    });
    const url = await startPayment(order, siteUrl(req), `/m/${c.access_token}`);
    return NextResponse.json({ url, code: order.code });
  } catch (err) {
    console.error("upsell gagal", err);
    return NextResponse.json({ error: "Gagal membuat pembayaran" }, { status: 502 });
  }
}
