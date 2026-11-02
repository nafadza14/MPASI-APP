import type { Ingredient, Nutrition, Stage } from "./types";

export type Nutr = Nutrition;

/**
 * Kandungan gizi per 100 g bagian yang dapat dimakan (bahan mentah kecuali disebut lain).
 * Angka PERKIRAAN dibulatkan, mengacu Tabel Komposisi Pangan Indonesia (TKPI 2017) dan
 * USDA FoodData Central. Wajib dicek ulang ahli gizi sebelum dipakai untuk klaim.
 *                kcal  prot  lemak  KH    Fe    Zn    Ca
 */
const T: Record<string, [number, number, number, number, number, number, number]> = {
  ayam: [120, 22.5, 2.6, 0, 0.4, 0.8, 5],
  ayampaha: [121, 19.7, 4.1, 0, 0.8, 1.6, 9],
  hatiayam: [119, 16.9, 4.8, 0.7, 9.0, 2.7, 8],
  hatisapi: [135, 20.4, 3.6, 3.9, 4.9, 4.0, 5],
  sapi: [176, 20.0, 10.0, 0, 2.3, 4.8, 12],
  sapihas: [140, 21.0, 6.0, 0, 2.6, 4.5, 10],
  kembung: [125, 21.0, 4.5, 0, 1.3, 0.6, 30],
  nila: [96, 20.1, 1.7, 0, 0.6, 0.3, 10],
  lele: [105, 17.0, 4.0, 0, 0.7, 0.5, 14],
  salmon: [208, 20.0, 13.0, 0, 0.3, 0.4, 9],
  dori: [80, 15.0, 2.5, 0, 0.3, 0.3, 10],
  udang: [85, 20.0, 0.5, 0, 0.5, 1.3, 70],
  telur: [143, 12.6, 9.5, 0.7, 1.8, 1.3, 56],
  kuningtelur: [322, 15.9, 26.5, 3.6, 2.7, 2.3, 129],
  telurpuyuh: [158, 13.1, 11.1, 0.4, 3.7, 1.5, 64],
  tahu: [80, 10.9, 4.7, 0.8, 3.4, 0.8, 223],
  tempe: [201, 20.8, 8.8, 13.5, 4.0, 1.7, 155],
  kacanghijau: [347, 23.9, 1.2, 62.6, 6.7, 2.7, 132],
  beras: [360, 7.0, 0.7, 79.0, 0.8, 1.1, 28],
  berasmerah: [362, 7.5, 2.7, 76.0, 1.5, 2.0, 23],
  nasi: [130, 2.7, 0.3, 28.0, 0.2, 0.5, 10],
  kentang: [77, 2.0, 0.1, 17.0, 0.8, 0.3, 12],
  ubi: [86, 1.6, 0.1, 20.0, 0.6, 0.3, 30],
  ubiungu: [110, 1.4, 0.2, 26.0, 0.6, 0.3, 30],
  singkong: [160, 1.4, 0.3, 38.0, 0.3, 0.3, 16],
  oat: [389, 16.9, 6.9, 66.0, 4.7, 4.0, 54],
  makaroni: [371, 13.0, 1.5, 75.0, 1.3, 1.4, 21],
  mie: [384, 14.0, 4.4, 71.0, 1.6, 1.6, 35],
  spageti: [371, 13.0, 1.5, 75.0, 1.3, 1.4, 21],
  bihun: [360, 6.0, 0.6, 82.0, 0.7, 0.8, 18],
  roti: [266, 8.9, 3.3, 49.0, 2.5, 0.8, 100],
  terigu: [364, 10.3, 1.0, 76.0, 1.2, 0.7, 15],
  tepungberas: [366, 6.0, 1.4, 80.0, 0.4, 0.8, 10],
  maizena: [381, 0.3, 0.1, 91.0, 0.5, 0.1, 2],
  tapioka: [358, 0.2, 0.0, 88.7, 1.6, 0.1, 20],
  wortel: [41, 0.9, 0.2, 9.6, 0.3, 0.2, 33],
  bayam: [23, 2.9, 0.4, 3.6, 2.7, 0.5, 99],
  bayammerah: [32, 2.5, 0.4, 5.0, 2.4, 0.5, 200],
  brokoli: [34, 2.8, 0.4, 6.6, 0.7, 0.4, 47],
  labukuning: [26, 1.0, 0.1, 6.5, 0.8, 0.3, 21],
  labusiam: [19, 0.8, 0.1, 4.5, 0.3, 0.7, 17],
  buncis: [31, 1.8, 0.2, 7.0, 1.0, 0.2, 37],
  kacangpanjang: [47, 2.8, 0.4, 8.4, 0.5, 0.4, 50],
  jagung: [86, 3.3, 1.4, 19.0, 0.5, 0.5, 2],
  tomat: [18, 0.9, 0.2, 3.9, 0.3, 0.2, 10],
  sawi: [13, 1.5, 0.2, 2.2, 0.8, 0.2, 105],
  zucchini: [17, 1.2, 0.3, 3.1, 0.4, 0.3, 16],
  kembangkol: [25, 1.9, 0.3, 5.0, 0.4, 0.3, 22],
  jamur: [22, 3.1, 0.3, 3.3, 0.5, 0.5, 3],
  kacangpolong: [81, 5.4, 0.4, 14.5, 1.5, 1.2, 25],
  kangkung: [19, 2.6, 0.2, 3.1, 1.7, 0.2, 77],
  kol: [25, 1.3, 0.1, 5.8, 0.5, 0.2, 40],
  pisang: [89, 1.1, 0.3, 22.8, 0.3, 0.2, 5],
  alpukat: [160, 2.0, 14.7, 8.5, 0.6, 0.6, 12],
  pepaya: [43, 0.5, 0.3, 10.8, 0.3, 0.1, 20],
  mangga: [60, 0.8, 0.4, 15.0, 0.2, 0.1, 11],
  melon: [34, 0.8, 0.2, 8.2, 0.2, 0.2, 9],
  pir: [57, 0.4, 0.1, 15.0, 0.2, 0.1, 9],
  apel: [52, 0.3, 0.2, 13.8, 0.1, 0.0, 6],
  naga: [60, 1.2, 0.0, 13.0, 0.7, 0.2, 9],
  jeruk: [45, 0.7, 0.2, 10.4, 0.2, 0.1, 11],
  nanas: [50, 0.5, 0.1, 13.1, 0.3, 0.1, 13],
  minyak: [884, 0, 100, 0, 0, 0, 0],
  mentega: [717, 0.9, 81.0, 0.1, 0, 0.1, 24],
  santan: [120, 1.1, 12.0, 2.7, 0.8, 0.3, 10],
  keju: [403, 25.0, 33.0, 1.3, 0.7, 3.1, 721],
  yogurt: [61, 3.5, 3.3, 4.7, 0.1, 0.6, 121],
  susu: [61, 3.2, 3.3, 4.8, 0, 0.4, 113],
  kaldu: [15, 1.5, 0.5, 1.0, 0.2, 0.1, 5],
  bawang: [100, 3.0, 0.1, 22.0, 0.8, 0.5, 30],
  bawangbombay: [40, 1.1, 0.1, 9.3, 0.2, 0.2, 23],
  kunyit: [312, 9.7, 3.3, 67.0, 55.0, 4.5, 168],
  jahe: [80, 1.8, 0.8, 17.8, 0.6, 0.3, 16],
  daunbawang: [32, 1.8, 0.2, 7.3, 1.5, 0.4, 72],
  kemangi: [23, 3.2, 0.6, 2.7, 3.2, 0.8, 177],
  pala: [525, 5.8, 36.0, 49.0, 3.0, 2.2, 184],
  kecap: [300, 6.0, 0.5, 70.0, 2.0, 0.5, 50],
  agar: [306, 6.2, 0.3, 81.0, 21.4, 5.8, 625],
  asam: [239, 2.8, 0.6, 62.5, 2.8, 0.1, 74],
};

export const NUTR: Record<string, Nutr> = Object.fromEntries(
  Object.entries(T).map(([k, [kcal, protein, fat, carb, iron, zinc, calcium]]) => [k, { kcal, protein, fat, carb, iron, zinc, calcium }]),
);

/** Berat (gram) untuk satuan rumah tangga. */
const PER_UNIT: Record<string, Partial<Record<Ingredient["unit"], number>>> = {
  telur: { butir: 55 },
  kuningtelur: { butir: 17 },
  telurpuyuh: { butir: 10 },
  minyak: { sdm: 13, sdt: 4.5 },
  mentega: { sdm: 14, sdt: 5 },
  santan: { sdm: 15, sdt: 5 },
  terigu: { sdm: 8, sdt: 3 },
  tapioka: { sdm: 8, sdt: 3 },
  maizena: { sdm: 8, sdt: 3 },
  oat: { sdm: 5 },
  kunyit: { sdt: 2 },
  kecap: { sdt: 6 },
  agar: { sdt: 2 },
  roti: { lembar: 30 },
  bawang: { siung: 4 },
  kemangi: { lembar: 0.3 },
  pala: { sdt: 2 },
};

export function gramsOf(key: string, qty: number, unit: Ingredient["unit"]) {
  if (unit === "g" || unit === "ml") return qty;
  const g = PER_UNIT[key]?.[unit];
  return g == null ? 0 : qty * g;
}

/**
 * Pembanding harian.
 * - Energi dari MPASI (di luar ASI): WHO/PAHO Guiding Principles — ±200 kkal (6–8 bln),
 *   ±300 kkal (9–11 bln), ±550 kkal (12–23 bln).
 * - Protein, zat besi, zinc, kalsium: Angka Kecukupan Gizi (AKG) Permenkes No. 28/2019
 *   (total kebutuhan harian, termasuk dari ASI).
 */
export function dailyTarget(stage: Stage) {
  if (stage === 1) return { kcal: 200, protein: 15, iron: 11, zinc: 3, calcium: 270, label: "6–8 bulan" };
  if (stage === 2) return { kcal: 300, protein: 15, iron: 11, zinc: 3, calcium: 270, label: "9–11 bulan" };
  return { kcal: 550, protein: 20, iron: 7, zinc: 3, calcium: 650, label: "12–23 bulan" };
}
