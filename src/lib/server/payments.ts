import "server-only";
import { generatePlan, seedFor } from "../generator";
import { PACKAGES } from "../pricing";
import type { PackageId } from "../types";
import type { OrderRow } from "./db";
import { sendCapiEvent } from "./meta";
import { sendWhatsApp } from "./notify";
import { findCustomerById, isDemo, markOrderPaid, updateCustomer, updateOrder } from "./repo";
import { createQrisPayment } from "./sumopod";

export function siteUrl(req?: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (req) return new URL(req.url).origin;
  return "http://localhost:3000";
}

/** Buat tagihan QRIS untuk pesanan dan kembalikan URL halaman bayar. */
export async function startPayment(order: OrderRow, site: string, cancelPath: string) {
  if (isDemo()) {
    const url = `${site}/bayar/${order.code}?demo=1`;
    await updateOrder(order.code, { payment_url: url, payment_id: "demo-" + order.code });
    return url;
  }
  const p = await createQrisPayment({
    orderId: order.code,
    amount: order.amount,
    successUrl: `${site}/bayar/${order.code}`,
    cancelUrl: `${site}${cancelPath}`,
  });
  await updateOrder(order.code, { payment_url: p.payment_link_url, payment_id: p.payment_id });
  return p.payment_link_url;
}

/** Dipanggil dari webhook (atau simulasi demo). Aman dipanggil berkali-kali. */
export async function fulfillPaid(code: string, raw: unknown, site: string) {
  const order = await markOrderPaid(code, raw);
  if (!order) return { already: true };
  const customer = await findCustomerById(order.customer_id);
  if (!customer) return { error: "customer not found" };

  const plans = [...customer.plans];
  const seed = seedFor(customer.answers);
  let pkg: PackageId = customer.package;

  if (order.kind === "main") {
    pkg = order.package;
  } else if (order.kind === "upsell") {
    pkg = order.package;
  }
  const months = order.kind === "renewal" ? plans.length + 1 : pkg === "tigabulan" ? 3 : 1;
  const today = new Date(new Date(customer.created_at).getTime() + 7 * 3600e3).toISOString().slice(0, 10);
  for (let m = plans.length + 1; m <= months; m++) {
    plans.push(generatePlan(customer.answers, { seed, month: m, snackPlus: customer.snack_plus || order.bump, today }));
  }
  await updateCustomer(customer.id, { paid: true, package: pkg, plans, snack_plus: customer.snack_plus || order.bump });

  const link = `${site}/m/${customer.access_token}`;
  const meta = await sendCapiEvent({
    name: "Purchase",
    eventId: order.code,
    value: order.amount,
    wa: customer.wa,
    email: customer.email,
    fbp: order.fbp,
    fbc: order.fbc,
    ip: order.client_ip,
    ua: order.user_agent,
    url: `${site}/hasil`,
    contentName: `${order.kind}:${PACKAGES[order.package]?.name ?? order.package}`,
  });
  if ("ok" in meta && meta.ok) await updateOrder(code, { meta_sent: true });

  if (order.kind === "main") {
    await sendWhatsApp(
      customer.wa,
      `Terima kasih, Bunda! 🎉\n\nMenu MPASI 30 hari untuk ${customer.child_name} sudah siap.\nBuka di sini (simpan link ini ya):\n${link}\n\nPembayaran: ${order.code}\nAda kendala? Balas pesan ini.`,
    );
  }
  return { ok: true, token: customer.access_token };
}
