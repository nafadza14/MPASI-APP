import type { QuizAnswers } from "./types";

const oneOf = <T extends string>(v: unknown, list: readonly T[]): v is T => typeof v === "string" && (list as readonly string[]).includes(v);
const listOf = <T extends string>(v: unknown, list: readonly T[]): T[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is T => oneOf(x, list)))] : [];

export function parseAnswers(x: unknown): QuizAnswers | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name.trim().slice(0, 30) : "";
  const dob = typeof o.dob === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.dob) ? o.dob : "";
  if (!name || !dob) return null;
  const ageDays = (Date.now() - Date.parse(dob)) / 864e5;
  if (!(ageDays > 60 && ageDays < 24 * 31)) return null; // 2–24 bulan
  if (!oneOf(o.started, ["belum", "baru", "lanjut"] as const)) return null;
  if (!oneOf(o.texture, ["pure", "lumat", "cincang", "finger", "keluarga"] as const)) return null;
  if (!oneOf(o.concern, ["bb", "gtm", "alergi", "bingung", "waktu"] as const)) return null;
  if (!oneOf(o.budget, ["hemat", "sedang", "longgar"] as const)) return null;
  if (!oneOf(o.cookMode, ["harian", "mealprep"] as const)) return null;
  return {
    name,
    ...(o.gender === "l" || o.gender === "p" ? { gender: o.gender } : {}),
    dob,
    started: o.started,
    texture: o.texture,
    concern: o.concern,
    budget: o.budget,
    cookMode: o.cookMode,
    allergies: listOf(o.allergies, ["telur", "susu", "kacang", "ikan", "seafood", "gandum", "kedelai"] as const),
    proteins: listOf(o.proteins, ["ayam", "hati", "ikan", "telur", "sapi", "udang"] as const),
    tools: listOf(o.tools, ["blender", "slowcooker", "kukusan", "freezer"] as const),
  };
}

export function parseWa(v: unknown) {
  if (typeof v !== "string") return null;
  const d = v.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return /^(0|62)8\d{7,12}$/.test(d) ? d : null;
}

export function parseEmail(v: unknown) {
  if (typeof v !== "string" || !v.trim()) return null;
  const e = v.trim().slice(0, 120);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}
