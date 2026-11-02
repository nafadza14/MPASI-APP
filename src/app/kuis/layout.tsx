import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kuis 1 Menit — Susun Menu MPASI si Kecil",
  description: "Jawab 10 pertanyaan singkat (usia, tekstur, alergi, bahan di rumah) dan lihat 3 hari pertama menu MPASI personal si kecil secara gratis.",
  alternates: { canonical: "/kuis" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
