import type { Metadata, Viewport } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: "%s | MPASI APP" },
  description: SITE.description,
  keywords: SITE.keywords,
  applicationName: SITE.short,
  authors: [{ name: SITE.brand, url: SITE.url }],
  creator: SITE.brand,
  publisher: SITE.brand,
  category: "health",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE.url,
    siteName: SITE.name,
    title: "Menu MPASI Personal 30 Hari untuk si kecil",
    description: "Resep dipilih paling sesuai usia, tekstur & alergi si kecil, dengan gizi seimbang tiap hari. Coba 3 hari pertama gratis.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Menu MPASI Personal 30 Hari — MPASI APP by Flourish Care" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu MPASI Personal 30 Hari untuk si kecil",
    description: "Resep dipilih paling sesuai usia, tekstur & alergi si kecil, dengan gizi seimbang tiap hari. Coba 3 hari pertama gratis.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "48x48" }, { url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "MPASI", statusBarStyle: "default" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: false },
};

const ORG_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#org`,
      name: SITE.brand,
      url: SITE.url,
      logo: `${SITE.url}/icon-512.png`, image: `${SITE.url}/og.jpg`,
      ...(process.env.NEXT_PUBLIC_ADMIN_WA
        ? { contactPoint: { "@type": "ContactPoint", contactType: "customer support", telephone: `+${process.env.NEXT_PUBLIC_ADMIN_WA}`, availableLanguage: "Indonesian" } }
        : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      inLanguage: "id-ID",
      publisher: { "@id": `${SITE.url}/#org` },
    },
  ],
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
        <JsonLd data={ORG_LD} />
        <MetaPixel />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
