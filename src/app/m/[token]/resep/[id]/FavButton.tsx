"use client";
import { useState } from "react";
import { IconHeart } from "@/components/icons";

export default function FavButton({ token, recipeId, initial }: { token: string; recipeId: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      aria-label={on ? "Hapus dari favorit" : "Tambah ke favorit"}
      onClick={async () => {
        setOn(!on);
        const r = await fetch("/api/favorite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, recipeId, on: !on }) });
        if (!r.ok) setOn(on);
      }}
      className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange-500 shadow-[var(--shadow-soft)]"
    >
      <IconHeart filled={on} />
    </button>
  );
}
