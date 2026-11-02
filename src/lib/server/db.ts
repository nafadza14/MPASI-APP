import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PackageId, Plan, QuizAnswers } from "../types";

let client: SupabaseClient | null = null;

/** Klien Supabase sisi server memakai SECRET key (tidak pernah dikirim ke browser). */
export function db() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase belum dikonfigurasi: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY wajib diisi.");
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export interface CustomerRow {
  id: string;
  access_token: string;
  wa: string;
  email: string | null;
  child_name: string;
  answers: QuizAnswers;
  package: PackageId;
  snack_plus: boolean;
  paid: boolean;
  plans: Plan[];
  swaps_used: number;
  favorites: string[];
  consent: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  code: string;
  customer_id: string;
  kind: "main" | "upsell" | "renewal";
  package: PackageId;
  bump: boolean;
  amount: number;
  status: "pending" | "paid" | "expired" | "failed" | "refunded";
  payment_id: string | null;
  payment_url: string | null;
  paid_at: string | null;
  utm: Record<string, string>;
  fbp: string | null;
  fbc: string | null;
  client_ip: string | null;
  user_agent: string | null;
  meta_sent: boolean;
  created_at: string;
}
