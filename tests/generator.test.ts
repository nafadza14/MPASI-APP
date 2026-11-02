import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePlan, isSafeFor, shoppingList, ageInMonths } from "../src/lib/generator";
import { RECIPES, RECIPE_MAP } from "../src/lib/recipes";
import type { QuizAnswers } from "../src/lib/types";

const base: QuizAnswers = { name: "Alya", dob: "2026-05-01", started: "baru", texture: "lumat", allergies: [], concern: "bingung", proteins: ["ayam","hati","ikan","telur","sapi"], budget: "sedang", cookMode: "harian", tools: ["blender"] };
const ages = ["2026-05-20","2026-03-10","2026-01-15","2025-11-02","2025-06-01","2025-01-10"];
const allergySets: any[] = [[], ["telur"], ["telur","susu"], ["ikan","seafood"], ["telur","susu","ikan","seafood","kedelai","gandum"]];

test("every plan has 30 days, ≥1 animal protein/day, no allergens, no honey <12m, variety", () => {
  let n = 0;
  for (const dob of ages) for (const allergies of allergySets) for (const cookMode of ["harian","mealprep"] as const) for (const budget of ["hemat","longgar"] as const) {
    const a = { ...base, dob, allergies, cookMode, budget };
    const p = generatePlan(a, { seed: "S" + n++, today: "2026-11-02" });
    assert.equal(p.days.length, 30);
    p.days.forEach((d, idx) => {
      const recs = d.meals.map(m => RECIPE_MAP[m.recipeId]);
      assert.ok(recs.filter(r=>r.slot==="utama").length >= 2, `mains day ${d.day}`);
      assert.ok(recs.some(r => r.protein), `animal protein day ${d.day} ${dob} ${allergies}`);
      for (const r of recs) {
        assert.ok(!r.allergens.some(x => allergies.includes(x)), `allergen ${r.id}`);
        assert.ok(isSafeFor(r, d.ageMonths, allergies));
        assert.ok(r.stages.includes(d.stage), `stage ${r.id} ${d.stage}`);
        if (d.ageMonths < 12) assert.ok(!/madu|kecap/i.test(JSON.stringify(r.ingredients)), r.id);
      }
      const window = p.days.slice(Math.max(0, idx-6), idx+1).flatMap(x=>x.meals.map(m=>m.recipeId));
      const counts = new Map<string,number>(); window.forEach(id=>counts.set(id,(counts.get(id)??0)+1));
      for (const [id,c] of counts) if (RECIPE_MAP[id].slot==="utama") assert.ok(c <= 2, `variety ${id} ${c}`);
    });
  }
});

test("no two new allergens within 3 days", () => {
  const p = generatePlan({ ...base, started: "belum" }, { seed: "x", today: "2026-11-02" });
  const intro = p.days.flatMap(d => d.meals.filter(m=>m.newAllergen).map(m=>({d:d.day, label:m.label})));
  for (let k=1;k<intro.length;k++) assert.ok(intro[k].d - intro[k-1].d >= 3, JSON.stringify(intro));
  intro.forEach(x => assert.equal(x.label, "Pagi"));
});

test("deterministic + age before 6 months starts at 6 months", () => {
  const a = { ...base, dob: "2026-07-15" };
  const p1 = generatePlan(a, { seed: "abc", today: "2026-11-02" });
  const p2 = generatePlan(a, { seed: "abc", today: "2026-11-02" });
  assert.deepEqual(p1, p2);
  assert.equal(p1.startDate, "2027-01-15");
  assert.equal(ageInMonths(a.dob, p1.startDate), 6);
});

test("shopping list", () => {
  const p = generatePlan(base, { seed: "s", today: "2026-11-02" });
  const l = shoppingList(p, 1, 7);
  assert.ok(l.length > 5);
});

test("snack plus keeps main meals identical to preview", () => {
  const { seedFor } = require("../src/lib/generator");
  const a = { ...base, dob: "2026-03-10" };
  const p0 = generatePlan(a, { seed: seedFor(a), today: "2026-11-02" });
  const p1 = generatePlan(a, { seed: seedFor(a), today: "2026-11-02", snackPlus: true });
  p0.days.forEach((d, k) => {
    const main0 = d.meals.map(m => m.recipeId);
    const main1 = p1.days[k].meals.filter(m => m.label !== "Snack sore" || d.meals.some(x=>x.label==="Snack sore")).map(m => m.recipeId);
    assert.deepEqual(main1, main0);
  });
  assert.ok(p1.days.some(d => d.meals.length > p0.days[d.day-1].meals.length));
});
