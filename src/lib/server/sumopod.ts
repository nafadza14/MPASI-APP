import "server-only";
import crypto from "node:crypto";

const BASE = (process.env.SUMOPOD_BASE_URL || "https://api-pay.sumopod.com/api/v1").replace(/\/$/, "");

export interface SumopodPayment {
  payment_id: string;
  order_id: string;
  amount: number;
  fee?: number;
  net_amount?: number;
  payment_link_url: string;
  status: string;
  expires_at?: string;
}

/** Membuat tagihan QRIS. Sumopod mengembalikan halaman bayar (payment_link_url) yang menampilkan QR. */
export async function createQrisPayment(p: { orderId: string; amount: number; successUrl: string; cancelUrl: string }) {
  const key = process.env.SUMOPOD_API_KEY;
  if (!key) throw new Error("SUMOPOD_API_KEY belum diisi");
  const res = await fetch(`${BASE}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": key },
    body: JSON.stringify({
      order_id: p.orderId,
      amount: p.amount,
      currency: "IDR",
      expires_in_hours: 1,
      success_return_url: p.successUrl,
      cancel_return_url: p.cancelUrl,
      payment_method_type_code: "QRIS",
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Sumopod ${res.status}: ${text.slice(0, 300)}`);
  const json = JSON.parse(text);
  const data: SumopodPayment = json.data ?? json; // jaga-jaga bila respons dibungkus "data"
  if (!data.payment_link_url) throw new Error("Respons Sumopod tanpa payment_link_url: " + text.slice(0, 300));
  return data;
}

/**
 * Verifikasi webhook. Utama: tanda tangan svix (SUMOPOD_WEBHOOK_SECRET, whsec_...).
 * Cadangan: header X-Webhook-Token (SUMOPOD_WEBHOOK_TOKEN, whtok_...).
 */
export function verifyWebhook(headers: Headers, rawBody: string): boolean {
  const secret = process.env.SUMOPOD_WEBHOOK_SECRET;
  if (secret) {
    const id = headers.get("svix-id");
    const ts = headers.get("svix-timestamp");
    const sig = headers.get("svix-signature");
    if (!id || !ts || !sig) return false;
    const age = Math.abs(Date.now() / 1000 - Number(ts));
    if (!Number.isFinite(age) || age > 300) return false; // tolak replay > 5 menit
    const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
    const expected = crypto.createHmac("sha256", key).update(`${id}.${ts}.${rawBody}`).digest("base64");
    return sig
      .split(" ")
      .map((s) => s.split(",")[1])
      .filter(Boolean)
      .some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
  }
  const token = process.env.SUMOPOD_WEBHOOK_TOKEN;
  const got = headers.get("x-webhook-token");
  if (token && got && got.length === token.length) return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(token));
  return false;
}
