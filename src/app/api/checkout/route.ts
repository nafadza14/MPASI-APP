import { NextResponse } from "next/server";
import { PACKAGES, BUMP } from "@/lib/pricing";
import { insertCustomer, insertOrder, newOrderCode, newToken } from "@/lib/server/repo";
import { siteUrl, startPayment } from "@/lib/server/payments";
import { parseAnswers, parseEmail, parseWa } from "@/lib/validate";
import type { PackageId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const answers = parseAnswers(body.answers);
  if (!answers) return NextResponse.json({ error: "Jawaban kuis tidak lengkap. Silakan ulangi kuis." }, { status: 400 });
  const pkgId = body.package as PackageId;
  const pkg = PACKAGES[pkgId];
  if (!pkg) return NextResponse.json({ error: "Paket tidak dikenal" }, { status: 400 });
  const wa = parseWa(body.wa);
  if (!wa) return NextResponse.json({ error: "Nomor WhatsApp belum benar. Contoh: 0812xxxxxxx" }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "Mohon centang persetujuan penggunaan data." }, { status: 400 });
  const bump = body.bump === true;
  const email = parseEmail(body.email);
  const utm = typeof body.utm === "object" && body.utm ? Object.fromEntries(Object.entries(body.utm as Record<string, unknown>).filter(([, v]) => typeof v === "string").map(([k, v]) => [k.slice(0, 40), String(v).slice(0, 200)])) : {};
  const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : null);

  try {
    const customer = await insertCustomer({
      access_token: newToken(),
      wa,
      email,
      child_name: answers.name,
      answers,
      package: pkgId,
      snack_plus: false,
      paid: false,
      plans: [],
      swaps_used: 0,
      favorites: [],
      consent: true,
    });
    const order = await insertOrder({
      code: newOrderCode(),
      customer_id: customer.id,
      kind: "main",
      package: pkgId,
      bump,
      amount: pkg.price + (bump ? BUMP.price : 0),
      utm: utm as Record<string, string>,
      fbp: str(body.fbp),
      fbc: str(body.fbc),
      client_ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    });
    const url = await startPayment(order, siteUrl(req), "/hasil?batal=1");
    return NextResponse.json({ url, code: order.code, amount: order.amount });
  } catch (err) {
    console.error("checkout gagal", err);
    return NextResponse.json({ error: "Gagal membuat pembayaran. Coba lagi sebentar lagi." }, { status: 502 });
  }
}
