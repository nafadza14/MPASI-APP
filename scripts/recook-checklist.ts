// Membuat daftar uji masak (recook) untuk tim dapur & ahli gizi: npx tsx scripts/recook-checklist.ts
import { writeFileSync } from "node:fs";
import { RECIPES } from "../src/lib/recipes";
const STAGE = { 1: "6-8 bln", 2: "9-11 bln", 3: "12-23 bln" } as const;
const q = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
const head = ["No", "ID (nama file foto)", "Nama resep", "Tahap", "Jenis", "Slot", "Alergen", "Bahan (1 porsi tahap dasar)", "Langkah", "Waktu (menit)", "Energi kkal", "Protein g", "Lemak g", "Karbo g", "Zat besi mg", "Zinc mg", "Kalsium mg", "Sudah dimasak (Y/N)", "Tekstur sesuai (Y/N)", "Rasa diterima anak (Y/N)", "Waktu aktual", "Takaran perlu diubah", "Catatan ahli gizi", "Foto diambil (Y/N)", "Lolos (Y/N)"];
const rows = RECIPES.map((r, i) => [
  i + 1, r.id, r.name, r.stages.map((s) => STAGE[s]).join(", "), r.family, r.slot, r.allergens.join(", ") || "-",
  r.ingredients.map((g) => `${g.item} ${g.qty} ${g.unit}`).join("; "), r.steps.map((s, k) => `${k + 1}. ${s}`).join(" "), r.minutes,
  Math.round(r.nutrition.kcal), r.nutrition.protein.toFixed(1), r.nutrition.fat.toFixed(1), r.nutrition.carb.toFixed(1), r.nutrition.iron.toFixed(1), r.nutrition.zinc.toFixed(1), Math.round(r.nutrition.calcium),
  "", "", "", "", "", "", "", "",
]);
writeFileSync(process.argv[2] ?? "resep-recook-checklist.csv", "﻿" + [head, ...rows].map((r) => r.map(q).join(",")).join("\r\n"));
console.log(rows.length, "resep");
