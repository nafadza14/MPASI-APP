"use client";
import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { FAMILY_LABEL, ING, RECIPE_MAP } from "@/lib/recipes";
import type { Meal } from "@/lib/types";
import { Photo, Plate } from "./Img";
import { IconArrow, IconClock, IconLock } from "./icons";

export const MEAL_LABEL: Record<string, string> = {
  Pagi: "Sarapan",
  "Snack pagi": "Snack pagi",
  "Snack siang": "Snack siang",
  Siang: "Makan siang",
  "Snack sore": "Snack sore",
  Sore: "Makan sore",
};

function Wrap({ href, onClick, children, className }: { href?: string; onClick?: () => void; children: ReactNode; className: string }) {
  if (href)
    return (
      <motion.div whileTap={{ scale: 0.97 }} className={className}>
        <Link href={href} className="block h-full">
          {children}
        </Link>
      </motion.div>
    );
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} className={`${className} text-left`}>
      {children}
    </motion.button>
  );
}

/** Kartu horizontal ala "Recommended" Kiddo. */
export function FoodCard({ meal, href, onClick, locked = false }: { meal: Meal; href?: string; onClick?: () => void; locked?: boolean }) {
  const r = RECIPE_MAP[meal.recipeId];
  if (!r) return null;
  return (
    <Wrap href={href} onClick={onClick} className="relative w-[158px] shrink-0 snap-start rounded-[26px] bg-white p-3 pt-4 shadow-[0_10px_30px_rgba(29,36,51,0.08)]">
      <div className={locked ? "blur-lock" : ""}>
        <Plate k={r.img} size={108} className="mx-auto" />
        <p className="mt-3 line-clamp-2 min-h-[40px] text-[13.5px] font-semibold leading-snug">{r.name}</p>
        <p className="mt-0.5 text-[11px] text-muted">{MEAL_LABEL[meal.label] ?? meal.label}</p>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] text-muted">
          <IconClock className="h-3.5 w-3.5" /> {r.minutes}m
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_6px_14px_rgba(251,154,27,0.4)]">
          {locked ? <IconLock className="h-3.5 w-3.5" /> : <IconArrow className="h-3.5 w-3.5" />}
        </span>
      </div>
      {meal.newAllergen && !locked && <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-bold uppercase text-white">Baru: {meal.newAllergen}</span>}
    </Wrap>
  );
}

/** Baris resep ala daftar Kiddo: foto kiri, nama, info, tombol oranye kanan. */
export function FoodRow({ recipeId, label, href, onClick, right, locked = false }: { recipeId: string; label?: string; href?: string; onClick?: () => void; right?: ReactNode; locked?: boolean }) {
  const r = RECIPE_MAP[recipeId];
  if (!r) return null;
  return (
    <Wrap href={href} onClick={onClick} className="block w-full rounded-[22px] bg-white p-2.5 shadow-[0_8px_24px_rgba(29,36,51,0.06)]">
      <div className="flex items-center gap-3">
        <Photo k={r.img} w={76} className="h-[76px] w-[76px] shrink-0 rounded-[18px]" />
        <div className={`min-w-0 flex-1 ${locked ? "blur-lock" : ""}`}>
          {label && <p className="text-[11px] font-medium text-teal-600">{label}</p>}
          <p className="line-clamp-2 text-[14px] font-semibold leading-snug">{r.name}</p>
          <p className="mt-1 flex items-center gap-2 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <IconClock className="h-3.5 w-3.5" />
              {r.minutes} menit
            </span>
            <span>·</span>
            <span>{FAMILY_LABEL[r.family] ?? r.family}</span>
          </p>
        </div>
        {right ?? (
          <span className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
            {locked ? <IconLock className="h-4 w-4" /> : <IconArrow className="h-4 w-4" />}
          </span>
        )}
      </div>
    </Wrap>
  );
}

/** Bulatan foto bahan ala "Ingredients" Kiddo. */
export function IngredientBubble({ k, size = 58 }: { k: string; size?: number }) {
  const g = ING[k];
  if (!g) return null;
  return (
    <div className="flex w-[70px] shrink-0 flex-col items-center gap-1.5">
      <Photo k={g.photo} w={size} round className="ring-4 ring-teal-50" />
      <span className="line-clamp-2 text-center text-[11px] leading-tight text-muted" style={{ width: 70 }}>
        {g.short || "Beras"}
      </span>
    </div>
  );
}

/** Ubin kategori ala "Development / Recipes / Other". */
export function CategoryTile({ k, label, active = false, onClick, tint = "teal" }: { k: string; label: string; active?: boolean; onClick?: () => void; tint?: "teal" | "orange" | "rose" }) {
  const bg = { teal: "bg-teal-50", orange: "bg-orange-50", rose: "bg-[#fdeef0]" }[tint];
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick} className={`flex w-full flex-col items-center gap-2 rounded-[22px] p-3 transition ${active ? "bg-teal-500 text-white shadow-[var(--shadow-lift)]" : bg}`}>
      <Photo k={k} w={52} round className="h-[52px] w-[52px] ring-[3px] ring-white" />
      <span className="text-[12px] font-medium">{label}</span>
    </motion.button>
  );
}
