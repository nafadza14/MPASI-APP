"use client";
import { useEffect, useRef, useState } from "react";
import { photo } from "@/lib/photos";

/** Foto Unsplash dengan efek muncul halus saat selesai dimuat. */
export function Photo({ k, w = 300, h, className = "", alt = "", round = false, eager = false }: { k: string; w?: number; h?: number; className?: string; alt?: string; round?: boolean; eager?: boolean }) {
  const [ok, setOk] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // Gambar yang sudah selesai dimuat sebelum hydration tidak memicu onLoad.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setOk(true);
  }, []);
  return (
    <span className={`relative block overflow-hidden bg-teal-50 ${round ? "rounded-full" : ""} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={photo(k, w * 2, (h ?? w) * 2)}
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
