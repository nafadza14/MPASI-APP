export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://mpasi.flourishcare.id").replace(/\/$/, ""),
  name: "MPASI APP by Flourish Care",
  short: "MPASI APP",
  brand: "Flourish Care",
  title: "Menu MPASI Personal 30 Hari — sesuai usia, tekstur & alergi | MPASI APP",
  description:
    "Jadwal menu MPASI 30 hari yang disusun khusus untuk si kecil (6–24 bulan): sesuai usia, tekstur, alergi, dan bahan di rumah. 1.600+ resep rumahan, daftar belanja mingguan, mengikuti panduan WHO & IDAI. Coba 3 hari pertama gratis.",
  keywords: [
    "menu MPASI",
    "menu MPASI 6 bulan",
    "menu MPASI 7 bulan",
    "menu MPASI 8 bulan",
    "menu MPASI 9 bulan",
    "menu MPASI 1 tahun",
    "jadwal MPASI 30 hari",
    "resep MPASI",
    "MPASI rumahan",
    "MPASI alergi telur",
    "MPASI alergi susu sapi",
    "aplikasi MPASI",
    "panduan MPASI WHO IDAI",
  ],
};

export const abs = (path = "/") => SITE.url + path;
