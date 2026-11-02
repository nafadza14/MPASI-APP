"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { FAMILY_LABEL, ING, RECIPE_MAP, portionFactor, scaleQty, TEXTURE_NOTE, ingredientPhoto } from "@/lib/recipes";
import { dailyTarget } from "@/lib/nutrition";
import type { Allergen, Stage } from "@/lib/types";
import { Photo } from "./Img";
import { IngredientBubble } from "./food";
import { IconCheck, IconClock, IconMinus, IconPlus } from "./icons";

const ALLERGEN: Record<string, string> = { telur: "telur", susu: "susu", ikan: "ikan", seafood: "seafood", kacang: "kacang", kedelai: "kedelai", gandum: "gandum" };

/** Isi resep: bahan (foto bulat), takaran dengan pengali porsi, langkah, tekstur. */
export function RecipeBody({ recipeId, stage, newAllergen, checkKey }: { recipeId: string; stage: Stage; newAllergen?: Allergen | null; checkKey?: string }) {
  const r = RECIPE_MAP[recipeId];
  const [portion, setPortion] = useState(1);
  const [done, setDone] = useState<string[]>([]);
  if (!r) return null;
  const keys = [...new Set(r.ingredients.map((x) => x.key!).filter((k) => k && ING[k]))];
  const toggle = (k: string) => setDone((d) => (d.includes(k) ? d.filter((x) => x !== k) : [...d, k]));

  return (
    <div className="px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="flex items-center gap-1 rounded-full bg-[#f7f8fa] px-3 py-1.5">
            <IconClock className="h-3.5 w-3.5" /> {r.minutes} menit
          </span>
          <span className="rounded-full bg-[#f7f8fa] px-3 py-1.5">{FAMILY_LABEL[r.family] ?? r.family}</span>
          {r.freezable && <span className="rounded-full bg-[#f7f8fa] px-3 py-1.5">Bisa dibekukan</span>}
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-1.5 py-1 text-white" aria-label="Jumlah porsi">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setPortion((p) => Math.max(1, p - 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <IconMinus className="h-3.5 w-3.5" />
          </motion.button>
          <span className="w-10 text-center text-xs font-semibold">{portion} porsi</span>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setPortion((p) => Math.min(6, p + 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <IconPlus className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>

      {newAllergen && (
        <p className="mt-4 rounded-[20px] bg-orange-50 p-4 text-[13px] leading-relaxed text-orange-700">
          <b>Pengenalan {ALLERGEN[newAllergen]}.</b> Berikan pagi hari, mulai sedikit, amati ruam, muntah, diare, atau bengkak selama 3 hari. Bila sesak atau bengkak di wajah, segera ke IGD.
        </p>
      )}

      <p className="mt-6 text-[17px] font-semibold">Bahan</p>
      <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
        {keys.map((k) => (
          <IngredientBubble key={k} k={k} />
        ))}
      </div>

      <div className="mt-4 divide-y divide-line rounded-[22px] bg-[#f7f8fa] px-4">
        {r.ingredients.map((g) => {
          const id = (checkKey ?? "") + g.item;
          const on = done.includes(id);
          const q = g.unit === "g" || g.unit === "ml" ? scaleQty(g.qty, stage, r.base) * portion : g.qty * portion;
          return (
            <button key={g.item} onClick={() => toggle(id)} className="flex w-full items-center gap-3 py-3 text-left">
              <Photo k={ingredientPhoto(g)} label={g.key ? ING[g.key]?.short : g.item} w={36} className="h-9 w-9 shrink-0 rounded-xl" />
              <span className={`flex-1 text-[13.5px] ${on ? "text-muted line-through" : ""}`}>{g.item}</span>
              <span className="text-[13px] font-semibold text-teal-600">
                {Number.isInteger(q) ? q : q.toFixed(1)} {g.unit}
              </span>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${on ? "border-teal-500 bg-teal-500 text-white" : "border-line bg-white"}`}>{on && <IconCheck className="h-3.5 w-3.5" />}</span>
            </button>
          );
        })}
      </div>

      <NutritionPanel recipeId={recipeId} stage={stage} />

      <div className="mt-5 rounded-[22px] bg-teal-500 p-4 text-[13px] leading-relaxed text-white">
        <p className="font-semibold">Tekstur sesuai usia</p>
        <p className="mt-1 opacity-90">{TEXTURE_NOTE[stage]}</p>
      </div>

      <p className="mt-6 text-[17px] font-semibold">Cara membuat</p>
      <ol className="mt-3 space-y-3">
        {r.steps.map((s, k) => (
          <li key={k} className="flex gap-3 text-[13.5px] leading-relaxed">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">{k + 1}</span>
            <span className="pt-0.5">{s}</span>
          </li>
        ))}
      </ol>
      {r.freezable && (
        <p className="mt-5 rounded-[20px] bg-[#f7f8fa] p-4 text-[12.5px] leading-relaxed text-muted">
          <b className="text-ink">Simpan:</b> dinginkan maks. 1 jam, wadah tertutup berlabel tanggal. Kulkas maks. 2 hari, freezer maks. 2 minggu. Panaskan hingga beruap merata.
        </p>
      )}
      <p className="mt-5 pb-2 text-center text-[11px] text-muted">
        Tanpa gula & garam tambahan untuk bayi di bawah 12 bulan.{!r.verified && " Resep sedang dalam tahap uji masak tim kami."}
      </p>
    </div>
  );
}

/** Nilai gizi per 1 porsi (perkiraan dari bahan mentah) + bandingan kebutuhan harian. */
export function NutritionPanel({ recipeId, stage }: { recipeId: string; stage: Stage }) {
  const r = RECIPE_MAP[recipeId];
  const [open, setOpen] = useState(false);
  if (!r) return null;
  const f = portionFactor(stage, r.base);
  const n = Object.fromEntries(Object.entries(r.nutrition).map(([k, v]) => [k, v * f])) as unknown as typeof r.nutrition;
  const t = dailyTarget(stage);
  const pct = (v: number, of: number) => Math.min(100, Math.round((v / of) * 100));
  const fmt = (v: number, d = 1) => (v >= 10 ? Math.round(v).toString() : v.toFixed(d).replace(".", ","));
  const bars = [
    { k: "Energi", v: `${Math.round(n.kcal)} kkal`, p: pct(n.kcal, t.kcal), of: `${t.kcal} kkal dari MPASI/hari` },
    { k: "Protein", v: `${fmt(n.protein)} g`, p: pct(n.protein, t.protein), of: `AKG ${t.protein} g/hari` },
    { k: "Zat besi", v: `${fmt(n.iron)} mg`, p: pct(n.iron, t.iron), of: `AKG ${t.iron} mg/hari` },
    { k: "Zinc", v: `${fmt(n.zinc)} mg`, p: pct(n.zinc, t.zinc), of: `AKG ${t.zinc} mg/hari` },
    { k: "Kalsium", v: `${Math.round(n.calcium)} mg`, p: pct(n.calcium, t.calcium), of: `AKG ${t.calcium} mg/hari` },
  ];
  return (
    <div className="mt-5 rounded-[22px] bg-[#f7f8fa] p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[15px] font-semibold">Nilai gizi per porsi</p>
        <span className="text-[11px] text-muted">usia {t.label}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          ["Karbohidrat", `${fmt(n.carb)} g`],
          ["Protein", `${fmt(n.protein)} g`],
          ["Lemak", `${fmt(n.fat)} g`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white py-2.5">
            <p className="text-[15px] font-bold text-teal-600">{v}</p>
            <p className="text-[10.5px] text-muted">{k}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2.5">
        {bars.map((b) => (
          <div key={b.k}>
            <div className="flex justify-between text-[12px]">
              <span className="font-medium">{b.k}</span>
              <span>
                <b>{b.v}</b> <span className="text-muted">· {b.p}%</span>
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max(3, b.p)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setOpen((o) => !o)} className="mt-3 text-[11.5px] font-medium text-teal-600">
        {open ? "Tutup keterangan" : "Cara membaca angka ini"}
      </button>
      {open && (
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
          Persentase = bagian dari kebutuhan sehari yang dipenuhi 1 porsi penuh resep ini. Di awal MPASI si kecil mungkin baru habis beberapa sendok; itu normal. Energi dibandingkan dengan target energi dari MPASI (WHO), sedangkan protein, zat besi, zinc, dan kalsium
          dibandingkan dengan Angka Kecukupan Gizi (Permenkes 28/2019) yang juga dipenuhi dari ASI/susu. Angka adalah perkiraan dari bahan mentah (TKPI & USDA), bisa berbeda ±15% tergantung
          bahan dan cara masak; bukan pengganti penilaian ahli gizi.
        </p>
      )}
    </div>
  );
}
