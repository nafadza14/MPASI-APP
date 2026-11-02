"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { FAMILY_LABEL, ING, RECIPE_MAP, scaleQty, TEXTURE_NOTE, ingredientPhoto } from "@/lib/recipes";
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
          const q = g.unit === "g" || g.unit === "ml" ? scaleQty(g.qty, stage) * portion : g.qty * portion;
          return (
            <button key={g.item} onClick={() => toggle(id)} className="flex w-full items-center gap-3 py-3 text-left">
              <Photo k={ingredientPhoto(g)} w={36} className="h-9 w-9 shrink-0 rounded-xl" />
              <span className={`flex-1 text-[13.5px] ${on ? "text-muted line-through" : ""}`}>{g.item}</span>
              <span className="text-[13px] font-semibold text-teal-600">
                {Number.isInteger(q) ? q : q.toFixed(1)} {g.unit}
              </span>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${on ? "border-teal-500 bg-teal-500 text-white" : "border-line bg-white"}`}>{on && <IconCheck className="h-3.5 w-3.5" />}</span>
            </button>
          );
        })}
      </div>

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
      <p className="mt-5 pb-2 text-center text-[11px] text-muted">Tanpa gula & garam tambahan untuk bayi di bawah 12 bulan.</p>
    </div>
  );
}
