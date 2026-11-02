"use client";
import { useEffect, useRef, useState } from "react";
import { photo } from "@/lib/photos";
import { ING, RECIPE_MAP } from "@/lib/recipes";

/** Foto Unsplash dengan efek muncul halus saat selesai dimuat. */
export function Photo({ k, w = 300, h, className = "", alt = "", round = false, eager = false, label }: { k?: string; w?: number; h?: number; className?: string; alt?: string; round?: boolean; eager?: boolean; label?: string }) {
  const [ok, setOk] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // Gambar yang sudah selesai dimuat sebelum hydration tidak memicu onLoad.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setOk(true);
  }, []);
  if (!k)
    return (
      <span className={`relative flex items-center justify-center overflow-hidden bg-orange-50 font-bold text-orange-600 ${round ? "rounded-full" : ""} ${className}`} style={{ width: w, height: h ?? w, fontSize: Math.max(11, w * 0.32) }} aria-label={label}>
        {(label ?? "?").slice(0, 2)}
      </span>
    );
  return (
    <span className={`relative block overflow-hidden bg-teal-50 ${round ? "rounded-full" : ""} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={k.startsWith("/") ? k : photo(k, w * 2, (h ?? w) * 2)}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setOk(true)}
        className={`h-full w-full object-cover transition duration-500 ${ok ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
      />
    </span>
  );
}

/** Piring bundar ala Kiddo: foto hidangan dalam lingkaran dengan bayangan lembut. */
export function Plate({ k, size = 96, ring = true, className = "" }: { k: string; size?: number; ring?: boolean; className?: string }) {
  return (
    <span className={`block shrink-0 rounded-full ${ring ? "bg-white p-[5%] shadow-[0_12px_28px_rgba(29,36,51,0.16)]" : ""} ${className}`} style={{ width: size, height: size }}>
      <Photo k={k} w={size} round className="h-full w-full" />
    </span>
  );
}

/**
 * Visual resep: foto hidangan ASLI hasil recook bila sudah ada (public/resep/<id>.jpg).
 * Bila belum, tampilkan bahan-bahan utamanya (jujur, tidak memakai foto hidangan lain).
 */
export function RecipePlate({ recipeId, size = 96, className = "" }: { recipeId: string; size?: number; className?: string }) {
  const r = RECIPE_MAP[recipeId];
  if (!r) return <Plate k="" size={size} className={className} />;
  if (r.img) return <Plate k={r.img} size={size} className={className} />;
  const order = ["protein", "sayur", "buah", "karbo", "lemak"];
  const keys = [...new Set(r.ingredients.filter((g) => order.includes(g.group)).sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group)).map((g) => g.key!))].slice(0, 3);
  const pos = keys.length === 1 ? [[0.5, 0.5, 0.78]] : keys.length === 2 ? [[0.36, 0.42, 0.52], [0.66, 0.6, 0.46]] : [[0.34, 0.36, 0.46], [0.68, 0.4, 0.4], [0.5, 0.7, 0.4]];
  return (
    <span className={`relative block shrink-0 rounded-full bg-white shadow-[0_12px_28px_rgba(29,36,51,0.16)] ${className}`} style={{ width: size, height: size }} title="Bahan utama">
      <span className="absolute inset-[6%] rounded-full bg-[#fffaf2]" />
      {keys.map((k, i) => {
        const [x, y, s] = pos[i];
        const d = size * s;
        return (
          <span key={k} className="absolute" style={{ left: size * x - d / 2, top: size * y - d / 2, width: d, height: d }}>
            <Photo k={ING[k]?.photo} label={ING[k]?.short} w={Math.round(d)} round className="h-full w-full ring-2 ring-white" />
          </span>
        );
      })}
    </span>
  );
}
