"use client";
// Arah transisi halaman: "back" saat tombol kembali browser / tombol kembali di UI.
let lastNav: "push" | "back" = "push";
if (typeof window !== "undefined") window.addEventListener("popstate", () => (lastNav = "back"));
export const markBack = () => (lastNav = "back");
export const takeNav = () => {
  const d = lastNav;
  lastNav = "push";
  return d;
};
