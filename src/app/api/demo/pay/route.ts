import { NextResponse } from "next/server";
import { isDemo } from "@/lib/server/repo";
import { fulfillPaid, siteUrl } from "@/lib/server/payments";

export const runtime = "nodejs";

/** Hanya untuk DEMO_MODE: mensimulasikan webhook payment.completed. */
export async function POST(req: Request) {
  if (!isDemo()) return NextResponse.json({ error: "not available" }, { status: 404 });
  const { code } = await req.json();
  const r = await fulfillPaid(String(code), { demo: true }, siteUrl(req));
  return NextResponse.json(r);
}
