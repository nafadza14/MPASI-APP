import "server-only";
import crypto from "node:crypto";

const sha = (s: string) => crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");

export function normalizeWa(wa: string) {
  let d = wa.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (d.startsWith("8")) d = "62" + d;
  return d;
}

/** Kirim event ke Meta Conversions API. Diam-diam dilewati jika env belum diisi. */
export async function sendCapiEvent(e: {
  name: "Purchase" | "InitiateCheckout" | "Lead";
  eventId: string;
  value?: number;
  wa?: string | null;
  email?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  ip?: string | null;
  ua?: string | null;
  url?: string;
  contentName?: string;
}) {
  const pixel = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return { skipped: true };
  const user_data: Record<string, unknown> = {};
  if (e.wa) user_data.ph = [sha(normalizeWa(e.wa))];
  if (e.email) user_data.em = [sha(e.email)];
  if (e.fbp) user_data.fbp = e.fbp;
  if (e.fbc) user_data.fbc = e.fbc;
  if (e.ip) user_data.client_ip_address = e.ip;
  if (e.ua) user_data.client_user_agent = e.ua;
  user_data.country = [sha("id")];
  const body = {
    data: [
      {
        event_name: e.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: "website",
        event_source_url: e.url,
        user_data,
        custom_data: e.value ? { value: e.value, currency: "IDR", content_name: e.contentName } : undefined,
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
  };
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    return { ok: r.ok };
  } catch {
    return { ok: false };
  }
}
