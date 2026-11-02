import type { Metadata, Viewport } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "Menu MPASI Personal 30 Hari — Flouris Care",
  description:
    "Jadwal menu MPASI 30 hari yang disusun khusus untuk si kecil: sesuai usia, tekstur, alergi, dan bahan di rumah.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mpasi.flouriscare.id"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#23b496",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <MetaPixel />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
