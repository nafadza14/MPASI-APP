import "server-only";
import { normalizeWa } from "./meta";

/**
 * Kirim pesan WhatsApp. Opsional — bila tidak ada konfigurasi, dilewati dan link akses
 * tetap tampil di halaman sukses.
 * - WA_PROVIDER=fonnte + FONNTE_TOKEN  → api.fonnte.com (gateway lokal; bukan API resmi Meta)
 * - WA_PROVIDER=webhook + WA_WEBHOOK_URL → POST {to, message} ke URL Anda (mis. n8n / WhatsApp Cloud API)
 */
export async function sendWhatsApp(to: string, message: string) {
  const provider = process.env.WA_PROVIDER;
  try {
    if (provider === "fonnte" && process.env.FONNTE_TOKEN) {
      const form = new FormData();
      form.set("target", normalizeWa(to));
      form.set("message", message);
      await fetch("https://api.fonnte.com/send", { method: "POST", headers: { Authorization: process.env.FONNTE_TOKEN }, body: form, signal: AbortSignal.timeout(8000) });
      return true;
    }
    if (provider === "webhook" && process.env.WA_WEBHOOK_URL) {
      await fetch(process.env.WA_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: normalizeWa(to), message }),
        signal: AbortSignal.timeout(8000),
      });
      return true;
    }
  } catch (err) {
    console.error("sendWhatsApp gagal", err);
  }
  return false;
}
