import type { PackageId } from "./types";

export const PACKAGES: Record<PackageId, { id: PackageId; name: string; price: number; strike?: number; badge?: string; perks: string[] }> = {
  dasar: {
    id: "dasar",
    name: "Dasar",
    price: 59000,
    perks: ["Jadwal menu 30 hari", "Resep lengkap tiap menu", "Unduh / cetak PDF"],
  },
  lengkap: {
    id: "lengkap",
    name: "Lengkap",
    price: 79000,
    badge: "Paling populer",
    perks: ["Semua isi paket Dasar", "Daftar belanja mingguan", "Mode meal prep + label simpan", "Ganti menu hingga 5x", "Simpan menu favorit"],
  },
  tigabulan: {
    id: "tigabulan",
    name: "3 Bulan Bertahap",
    price: 199000,
    strike: 237000,
    perks: ["Semua isi paket Lengkap", "Menu bulan ke-2 & ke-3 dibuat ulang sesuai usia dan tekstur baru", "Hemat Rp 38.000"],
  },
};

export const BUMP = {
  id: "snackplus",
  name: "Paket Snack & Finger Food 30 Hari",
  price: 25000,
  desc: "Tambah 1 snack harian yang menyambung dengan menu utama + panduan finger food per usia.",
};

/** Upsell setelah bayar (Paywall #2): naik paket. */
export function upsellFor(pkg: PackageId) {
  if (pkg === "dasar") return { to: "lengkap" as PackageId, price: 20000, title: "Naik ke paket Lengkap", desc: "Buka daftar belanja mingguan, mode meal prep, dan 5x ganti menu." };
  if (pkg === "lengkap") return { to: "tigabulan" as PackageId, price: 120000, title: "Lanjutkan sampai 3 bulan", desc: "Menu bulan ke-2 dan ke-3 dibuat otomatis saat si kecil naik usia dan tekstur." };
  return null;
}

export const RENEWAL_PRICE = 69000; // Paywall #3: menu bulan berikutnya untuk pembeli lama

/** monthsOwned: jumlah bulan menu yang sudah dimiliki (jatah ganti menu 5x per bulan). */
export function features(pkg: PackageId, monthsOwned = 1) {
  const full = pkg !== "dasar";
  return { shopping: full, mealprep: full, swaps: full ? 5 * Math.max(1, monthsOwned) : 0, favorites: full, months: pkg === "tigabulan" ? 3 : 1 };
}

export const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
