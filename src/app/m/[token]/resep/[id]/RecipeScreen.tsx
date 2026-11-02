"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { RecipePlate } from "@/components/Img";
import { RecipeBody } from "@/components/RecipeView";
import { MEAL_LABEL } from "@/components/food";
import { IconBack, IconHeart } from "@/components/icons";
import { IOS_EASE, spring } from "@/components/motion";
import { markBack } from "@/components/navdir";
import { RECIPE_MAP } from "@/lib/recipes";
import type { Allergen, Stage } from "@/lib/types";

export default function RecipeScreen({ token, recipeId, stage, label, newAllergen, canFav, fav }: { token: string; recipeId: string; stage: Stage; label?: string; newAllergen: Allergen | null; canFav: boolean; fav: boolean }) {
  const router = useRouter();
  const r = RECIPE_MAP[recipeId];
  const [on, setOn] = useState(fav);
  const [label1, label2] = (label ?? "").split(" · ");
  return (
    <main className="pb-12">
      <div className="relative h-[230px] rounded-b-[40px] bg-teal-500">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -right-10 top-24 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between px-4 pt-4 text-white">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              markBack();
              if (history.length > 1) router.back();
              else router.push(`/m/${token}`);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
            aria-label="Kembali"
          >
            <IconBack />
          </motion.button>
          <p className="text-sm font-medium opacity-90">{label ? `${label1} · ${MEAL_LABEL[label2] ?? label2}` : "Resep"}</p>
          {canFav ? (
            <motion.button
              whileTap={{ scale: 0.8 }}
              animate={{ scale: on ? [1, 1.25, 1] : 1 }}
              onClick={async () => {
                setOn(!on);
                const res = await fetch("/api/favorite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, recipeId, on: !on }) });
                if (!res.ok) setOn(on);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange-500"
              aria-label="Favorit"
            >
              <IconHeart filled={on} className="h-5 w-5" />
            </motion.button>
          ) : (
            <span className="w-10" />
          )}
        </div>
      </div>
      <motion.div initial={{ y: 40, opacity: 0, rotate: -25 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ ...spring, delay: 0.1 }} className="-mt-[140px] flex justify-center">
        <RecipePlate recipeId={r.id} size={240} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: IOS_EASE }}>
        <h1 className="mt-5 px-6 text-center text-[24px] font-bold leading-tight">{r.name}</h1>
        <p className="mt-1 text-center text-xs text-muted">{r.protein ? "Mengandung protein hewani" : "Snack sehat"}{r.tags.includes("zat-besi") ? " · sumber zat besi" : ""}</p>
        <div className="mt-6">
          <RecipeBody recipeId={recipeId} stage={stage} newAllergen={newAllergen} checkKey={recipeId} />
        </div>
      </motion.div>
    </main>
  );
}
