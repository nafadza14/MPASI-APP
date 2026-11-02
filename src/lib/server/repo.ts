import "server-only";
import crypto from "node:crypto";
import { db, type CustomerRow, type OrderRow } from "./db";

/**
 * Lapisan data. Produksi: Supabase. DEMO_MODE=1 (hanya di luar production):
 * penyimpanan di memori + pembayaran simulasi, untuk mencoba UI tanpa kredensial.
 */
export const isDemo = () => process.env.DEMO_MODE === "1" && process.env.VERCEL_ENV !== "production";

type Mem = { customers: Map<string, CustomerRow>; orders: Map<string, OrderRow> };
const mem: Mem = ((globalThis as unknown as { __mpasiMem?: Mem }).__mpasiMem ??= { customers: new Map(), orders: new Map() });

export const newToken = () => crypto.randomBytes(18).toString("base64url");
export function newOrderCode() {
  const d = new Date(Date.now() + 7 * 3600e3).toISOString().slice(2, 10).replace(/-/g, "");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rnd = Array.from(crypto.randomBytes(10), (b) => alphabet[b % alphabet.length]).join("");
  return `MP-${d}-${rnd}`;
}

export async function insertCustomer(c: Omit<CustomerRow, "id" | "created_at">): Promise<CustomerRow> {
  if (isDemo()) {
    const row = { ...c, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    mem.customers.set(row.id, row);
    return row;
  }
  const { data, error } = await db().from("customers").insert(c).select("*").single();
  if (error) throw error;
  return data as CustomerRow;
}

export async function findCustomerByToken(token: string): Promise<CustomerRow | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  if (isDemo()) return [...mem.customers.values()].find((c) => c.access_token === token) ?? null;
  const { data } = await db().from("customers").select("*").eq("access_token", token).maybeSingle();
  return (data as CustomerRow | null) ?? null;
}

export async function findCustomerById(id: string): Promise<CustomerRow | null> {
  if (isDemo()) return mem.customers.get(id) ?? null;
  const { data } = await db().from("customers").select("*").eq("id", id).maybeSingle();
  return (data as CustomerRow | null) ?? null;
}

export async function updateCustomer(id: string, patch: Partial<CustomerRow>) {
  if (isDemo()) {
    const cur = mem.customers.get(id);
    if (cur) mem.customers.set(id, { ...cur, ...patch });
    return;
  }
  const { error } = await db().from("customers").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function insertOrder(o: Omit<OrderRow, "id" | "created_at" | "paid_at" | "payment_id" | "payment_url" | "meta_sent" | "status">): Promise<OrderRow> {
  const row = { ...o, status: "pending" as const, paid_at: null, payment_id: null, payment_url: null, meta_sent: false };
  if (isDemo()) {
    const full = { ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    mem.orders.set(full.code, full);
    return full;
  }
  const { data, error } = await db().from("orders").insert(row).select("*").single();
  if (error) throw error;
  return data as OrderRow;
}

export async function findOrder(code: string): Promise<OrderRow | null> {
  if (!/^[A-Z0-9-]{8,40}$/.test(code)) return null;
  if (isDemo()) return mem.orders.get(code) ?? null;
  const { data } = await db().from("orders").select("*").eq("code", code).maybeSingle();
  return (data as OrderRow | null) ?? null;
}

export async function updateOrder(code: string, patch: Partial<OrderRow> & { raw_webhook?: unknown }) {
  if (isDemo()) {
    const cur = mem.orders.get(code);
    if (cur) mem.orders.set(code, { ...cur, ...patch });
    return;
  }
  const { error } = await db().from("orders").update(patch).eq("code", code);
  if (error) throw error;
}

/** Tandai lunas secara atomik. Mengembalikan baris hanya jika baru saja berubah (idempoten). */
export async function markOrderPaid(code: string, raw: unknown): Promise<OrderRow | null> {
  const patch = { status: "paid" as const, paid_at: new Date().toISOString() };
  if (isDemo()) {
    const cur = mem.orders.get(code);
    if (!cur || cur.status === "paid") return null;
    const next = { ...cur, ...patch };
    mem.orders.set(code, next);
    return next;
  }
  const { data, error } = await db()
    .from("orders")
    .update({ ...patch, raw_webhook: raw })
    .eq("code", code)
    .neq("status", "paid")
    .select("*");
  if (error) throw error;
  return ((data as OrderRow[] | null) ?? [])[0] ?? null;
}
