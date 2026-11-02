"use client";
import { useState } from "react";
import { RECIPE_MAP, scaleQty, TEXTURE_NOTE } from "@/lib/recipes";
import type { Meal, Stage } from "@/lib/types";
import { FoodBubble } from "./ui";
import { IconChevron } from "./icons";

const TAG_LABEL: Record<string, string> = {
  "zat-besi": "Sumber zat besi",
  "lemak-tambahan": "Lemak tambahan",
  "padat-energi": "Padat energi",
  "finger-food": "Finger food",
  "sayur-hijau": "Sayur hijau",
};

export function MealCard({ meal, stage, expandable = true, href, action }: { meal: Meal; stage: Stage; expandable?: boolean; href?: string; action?: React.ReactNode }) {
  const r = RECIPE_MAP[meal.recipeId];
  const [open, setOpen] = useState(false);
  if (!r) return null;
  const head = (
    <div className="flex items-center gap-3">
      <FoodBubble emoji={r.emoji} size={56} tint={meal.slot === "snack" ? "orange" : "teal"} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-muted">{meal.label}</p>
        <p className="truncate text-[15px] font-semibold">{r.name}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {r.protein && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">Protein hewani</span>}
          {r.tags.slice(0, 1).map((t) => (
            <span key={t} className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600">
              {TAG_LABEL[t]}
            </span>
          ))}
          {meal.newAllergen && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">Kenalkan {meal.newAllergen}</span>}
        </div>
      </div>
      {(expandable || href) && <IconChevron className={`h-4 w-4 text-muted transition ${open ? "rotate-90" : ""}`} />}
    </div>
  );
  return (
    <div className="rounded-[var(--radius-card)] bg-white p-3 shadow-[var(--shadow-soft)]">
      {href ? (
        <a href={href} className="block">
          {head}
        </a>
      ) : (
        <button className="block w-full text-left" onClick={() => expandable && setOpen(!open)}>
          {head}
        </button>
      )}
      {action}
      {open && (
        <div className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed">
          {meal.newAllergen && (
            <p className="mb-2 rounded-xl bg-orange-50 px-3 py-2 text-orange-700">
              Pertama kali mengenalkan <b>{meal.newAllergen}</b>. Berikan di pagi hari, amati reaksi (ruam, muntah, bengkak) selama 3 hari sebelum mengenalkan bahan baru lain.
            </p>
          )}
          <p className="font-semibold">Bahan</p>
          <ul className="mt-1 space-y-0.5 text-muted">
            {r.ingredients.map((g) => (
              <li key={g.item}>
                • {g.item} — {g.unit === "g" || g.unit === "ml" ? scaleQty(g.qty, stage) : g.qty} {g.unit}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-semibold">Cara membuat</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-muted">
            {r.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-teal-700">{TEXTURE_NOTE[stage]}</p>
        </div>
      )}
    </div>
  );
}

export function PrepBanner() {
  return <p className="mb-3 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-medium text-white">🧊 Hari masak: siapkan menu untuk 3 hari ke depan. Simpan di kulkas maks. 2 hari, sisanya di freezer.</p>;
}
