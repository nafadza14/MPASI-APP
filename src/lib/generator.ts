import { RECIPES, RECIPE_MAP, scaleQty } from "./recipes";
import type { Allergen, Meal, Plan, PlanDay, QuizAnswers, Recipe, Slot, Stage } from "./types";

// ───── util waktu (semua pakai tanggal kalender, tanpa jam) ─────
export function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
export function addDays(s: string, n: number) {
  const d = parseDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return fmtDate(d);
}
export function addMonths(s: string, n: number) {
  const d = parseDate(s);
  d.setUTCMonth(d.getUTCMonth() + n);
  return fmtDate(d);
}
export function ageInMonths(dob: string, on: string) {
  const a = parseDate(dob);
  const b = parseDate(on);
  let m = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  if (b.getUTCDate() < a.getUTCDate()) m -= 1;
  return m;
}
export function ageLabel(dob: string, on: string) {
  const m = ageInMonths(dob, on);
  const anchor = addMonths(dob, m);
  const days = Math.round((parseDate(on).getTime() - parseDate(anchor).getTime()) / 864e5);
  const w = Math.floor(days / 7);
  return w > 0 ? `${m} bulan ${w} minggu` : `${m} bulan`;
}
export function todayJakarta() {
  return new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
}

export function stageForAge(months: number): Stage {
  if (months < 9) return 1;
  if (months < 12) return 2;
  return 3;
}

/** Tanggal mulai: besok, atau tanggal bayi genap 6 bulan bila belum 6 bulan. */
export function planStartDate(dob: string, today = todayJakarta()) {
  const tomorrow = addDays(today, 1);
  const sixMonths = addMonths(dob, 6);
  return sixMonths > tomorrow ? sixMonths : tomorrow;
}

// ───── PRNG deterministik ─────
function hashSeed(s: string) {
  let h = 1779033703 ^ s.length;
  for (let k = 0; k < s.length; k++) {
    h = Math.imul(h ^ s.charCodeAt(k), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function rng(seed: string) {
  let a = hashSeed(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ───── aturan keamanan (diuji di tests/generator.test.ts) ─────
export function isSafeFor(recipe: Recipe, ageMonths: number, allergies: Allergen[]) {
  if (recipe.allergens.some((a) => allergies.includes(a))) return false;
  const text = (recipe.name + " " + recipe.ingredients.map((x) => x.item).join(" ")).toLowerCase();
  if (ageMonths < 12 && /madu/.test(text)) return false;
  if (ageMonths < 12 && /kecap|gula|garam/.test(text.replace(/tanpa garam|tanpa gula|rendah garam/g, ""))) return false;
  if (/kacang utuh|anggur utuh|popcorn/.test(text)) return false;
  return true;
}

function textureStage(a: QuizAnswers): Stage {
  if (a.started === "belum") return 1;
  if (a.texture === "keluarga") return 3;
  if (a.texture === "cincang" || a.texture === "finger") return 2;
  return 1;
}

function slotsFor(ageMonths: number, stage: Stage): { slot: Slot; label: string }[] {
  const s: { slot: Slot; label: string }[] = [];
  const mains = ageMonths < 7 ? 2 : 3;
  s.push({ slot: "utama", label: "Pagi" });
  if (mains === 3) {
    s.push({ slot: "snack", label: "Snack pagi" });
    s.push({ slot: "utama", label: "Siang" });
  } else {
    s.push({ slot: "snack", label: "Snack siang" });
  }
  if (stage === 3) s.push({ slot: "snack", label: "Snack sore" });
  s.push({ slot: "utama", label: "Sore" });
  return s;
}

export interface GenOptions {
  seed: string;
  month?: number; // 1..3
  snackPlus?: boolean; // order bump
  today?: string;
}

export function generatePlan(a: QuizAnswers, opt: GenOptions): Plan {
  const month = opt.month ?? 1;
  const baseStart = planStartDate(a.dob, opt.today);
  const startDate = addDays(baseStart, (month - 1) * 30);
  const rand = rng(`${opt.seed}:${month}`);
  const allergies = a.allergies;
  const tStage = textureStage(a);

  const introduced = new Set<Allergen>(a.started === "lanjut" ? ["susu", "kedelai", "gandum"] : []);
  if (month > 1) (["telur", "ikan", "susu", "kedelai", "gandum", "seafood"] as Allergen[]).forEach((x) => introduced.add(x));
  let lastIntro = -10;
  const history: string[][] = [];
  const days: PlanDay[] = [];
  let prevStage: Stage | null = null;

  for (let d = 1; d <= 30; d++) {
    const date = addDays(startDate, d - 1);
    const age = Math.max(6, ageInMonths(a.dob, date));
    const ageStage = stageForAge(age);
    let stage: Stage = ageStage;
    if (month === 1 && tStage < ageStage) {
      stage = Math.min(ageStage, tStage + Math.floor((d - 1) / 10)) as Stage;
    } else if (tStage > ageStage && age >= 8) {
      stage = Math.min(3, ageStage + 1) as Stage;
    }
    const recent = history.slice(-6).flat();
    const meals: Meal[] = [];
    const usedToday = new Set<string>();
    const prepDay = a.cookMode === "mealprep" && (d - 1) % 3 === 0;

    for (const { slot, label } of slotsFor(age, stage)) {
      const pick = pickRecipe({ slot, stage, age, a, rand, recent, usedToday, introduced, canIntro: label === "Pagi" && d - lastIntro >= 3 });
      if (!pick) continue;
      const newA = pick.allergens.find((x) => !introduced.has(x)) ?? null;
      if (newA) {
        pick.allergens.forEach((x) => introduced.add(x));
        lastIntro = d;
      }
      usedToday.add(pick.id);
      meals.push({ slot, label, recipeId: pick.id, newAllergen: newA });
    }
    history.push(meals.map((m) => m.recipeId));
    days.push({ day: d, date, ageMonths: age, stage, meals, prepDay, textureUp: prevStage !== null && stage > prevStage });
    prevStage = stage;
  }
  // Order bump: snack tambahan untuk usia < 12 bulan, memakai PRNG terpisah supaya
  // menu utama tetap sama persis dengan pratinjau gratis.
  if (opt.snackPlus) {
    const r2 = rng(`${opt.seed}:${month}:snack`);
    for (const day of days) {
      if (day.meals.some((m) => m.label === "Snack sore")) continue;
      const used = new Set(day.meals.map((m) => m.recipeId));
      const pool = RECIPES.filter(
        (r) => r.slot === "snack" && r.stages.includes(day.stage) && !used.has(r.id) && isSafeFor(r, day.ageMonths, allergies) && r.allergens.every((x) => introduced.has(x)),
      );
      if (!pool.length) continue;
      const pick = pool[Math.floor(r2() * pool.length)];
      day.meals.splice(day.meals.length - 1, 0, { slot: "snack", label: "Snack sore", recipeId: pick.id, newAllergen: null });
    }
  }
  return { month, startDate, days, seed: opt.seed };
}

/** Seed stabil dari jawaban kuis: pratinjau gratis dan menu berbayar identik. */
export function seedFor(a: QuizAnswers) {
  return JSON.stringify([a.name.trim().toLowerCase(), a.dob, a.started, a.texture, [...a.allergies].sort(), a.concern, [...a.proteins].sort(), a.budget, a.cookMode]);
}

function pickRecipe(p: {
  slot: Slot;
  stage: Stage;
  age: number;
  a: QuizAnswers;
  rand: () => number;
  recent: string[];
  usedToday: Set<string>;
  introduced: Set<Allergen>;
  canIntro: boolean;
}): Recipe | null {
  const { slot, stage, age, a, rand, recent, usedToday, introduced, canIntro } = p;
  const base = RECIPES.filter(
    (r) =>
      r.slot === slot &&
      r.stages.includes(stage) &&
      isSafeFor(r, age, a.allergies) &&
      !usedToday.has(r.id) &&
      (canIntro || r.allergens.every((x) => introduced.has(x))) &&
      r.allergens.filter((x) => !introduced.has(x)).length <= 1,
  );
  const prefProtein = (r: Recipe) => !r.protein || a.proteins.length === 0 || a.proteins.includes(r.protein);
  const budgetOk = (r: Recipe) => a.budget !== "hemat" || r.cost < 3;
  const variety = (r: Recipe) => recent.filter((x) => x === r.id).length < 2;

  const tiers = [
    base.filter((r) => prefProtein(r) && budgetOk(r) && variety(r)),
    base.filter((r) => prefProtein(r) && variety(r)),
    base.filter((r) => variety(r)),
    base,
  ];
  const pool = tiers.find((t) => t.length > 0);
  if (!pool) return null;

  const weights = pool.map((r) => {
    let w = 1;
    w /= 1 + recent.filter((x) => x === r.id).length * 1.5;
    if (a.budget === "hemat" && r.cost === 1) w *= 1.6;
    if (a.cookMode === "mealprep" && r.freezable) w *= 1.8;
    if (a.concern === "bb" && (r.tags.includes("padat-energi") || r.tags.includes("lemak-tambahan"))) w *= 1.5;
    if (a.concern === "gtm" && r.tags.includes("finger-food")) w *= 1.5;
    if (r.tags.includes("zat-besi")) w *= 1.2;
    return w;
  });
  const total = weights.reduce((s, x) => s + x, 0);
  let t = rand() * total;
  for (let k = 0; k < pool.length; k++) {
    t -= weights[k];
    if (t <= 0) return pool[k];
  }
  return pool[pool.length - 1];
}

/** Pengganti untuk tombol "Ganti menu": resep lain di slot & tahap sama yang lolos aturan,
 *  hanya memakai alergen yang sudah diperkenalkan sebelum hari itu. */
export function swapCandidates(a: QuizAnswers, plan: Plan, dayIdx: number, mealIndex: number) {
  const day = plan.days[dayIdx];
  const meal = day.meals[mealIndex];
  if (meal.newAllergen) return [];
  const current = RECIPE_MAP[meal.recipeId];
  const seen = new Set<Allergen>(a.started === "lanjut" || plan.month > 1 ? ["susu", "kedelai", "gandum"] : []);
  if (plan.month > 1) (["telur", "ikan", "seafood"] as Allergen[]).forEach((x) => seen.add(x));
  for (const d of plan.days.slice(0, dayIdx)) for (const m of d.meals) RECIPE_MAP[m.recipeId]?.allergens.forEach((x) => seen.add(x));
  current.allergens.forEach((x) => seen.add(x));
  const used = new Set(day.meals.map((m) => m.recipeId));
  return RECIPES.filter(
    (r) =>
      r.slot === current.slot &&
      r.stages.includes(day.stage) &&
      !used.has(r.id) &&
      isSafeFor(r, day.ageMonths, a.allergies) &&
      r.allergens.every((x) => seen.has(x)) &&
      (current.protein ? r.protein !== null : true),
  );
}

// ───── daftar belanja ─────
export const WEEKS = [
  { label: "Minggu 1", from: 1, to: 7 },
  { label: "Minggu 2", from: 8, to: 14 },
  { label: "Minggu 3", from: 15, to: 21 },
  { label: "Minggu 4", from: 22, to: 30 },
];

export function shoppingList(plan: Plan, from: number, to: number) {
  const map = new Map<string, { item: string; unit: string; qty: number; group: string }>();
  for (const day of plan.days.filter((d) => d.day >= from && d.day <= to)) {
    for (const m of day.meals) {
      const r = RECIPE_MAP[m.recipeId];
      for (const ing of r.ingredients) {
        const key = `${ing.item}|${ing.unit}`;
        const q = ing.unit === "g" || ing.unit === "ml" ? scaleQty(ing.qty, day.stage) : ing.qty;
        const cur = map.get(key) ?? { item: ing.item, unit: ing.unit, qty: 0, group: ing.group };
        cur.qty += q;
        map.set(key, cur);
      }
    }
  }
  const order = ["protein", "karbo", "sayur", "buah", "lemak", "bumbu", "lain"];
  return [...map.values()]
    .map((x) => ({ ...x, qty: x.unit === "g" || x.unit === "ml" ? Math.ceil(x.qty / 10) * 10 : Math.ceil(x.qty) }))
    .sort((p, q) => order.indexOf(p.group) - order.indexOf(q.group) || p.item.localeCompare(q.item));
}

export function dailyNeeds(ageMonths: number) {
  if (ageMonths < 9)
    return { meals: ageMonths < 7 ? "2 kali makan utama" : "3 kali makan utama", snack: "1–2 kali selingan", portion: "Mulai 2–3 sdm, naik bertahap hingga ±½ mangkuk (125 ml)", texture: "Kental, lumat" };
  if (ageMonths < 12)
    return { meals: "3–4 kali makan utama", snack: "1–2 kali selingan", portion: "±½ mangkuk (125 ml) per makan", texture: "Cincang halus–kasar, finger food lunak" };
  return { meals: "3–4 kali makan utama", snack: "1–2 kali selingan", portion: "¾–1 mangkuk (175–250 ml) per makan", texture: "Makanan keluarga dipotong kecil" };
}
