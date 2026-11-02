import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import JsonLd from "@/components/JsonLd";
import { IconBack } from "@/components/icons";
import { PACKAGES, rupiah } from "@/lib/pricing";
import { RECIPES } from "@/lib/recipes";
import { SITE } from "@/lib/site";

const UPDATED = "2026-11-02";
const N = Math.floor(RECIPES.length / 10) * 10;

export const metadata: Metadata = {
  title: "Panduan MPASI 6–24 Bulan: Jadwal, Porsi, Tekstur & Contoh Menu",
  description:
    "Panduan MPASI lengkap berdasarkan WHO & IDAI: kapan mulai, berapa kali makan, porsi dan tekstur per usia (6–8, 9–11, 12–24 bulan), cara mengenalkan alergen, makanan yang dihindari, dan contoh menu harian.",
  alternates: { canonical: "/panduan-mpasi" },
  openGraph: { type: "article", url: "/panduan-mpasi", title: "Panduan MPASI 6–24 Bulan — jadwal, porsi, tekstur & contoh menu" },
};

const AGES = [
  { age: "6–8 bulan", meals: "2–3 kali makan utama + 1–2 selingan", portion: "Mulai 2–3 sendok makan, naik bertahap hingga ±½ mangkuk 250 ml", texture: "Bubur kental / lumat halus — tidak tumpah saat sendok dimiringkan" },
  { age: "9–11 bulan", meals: "3–4 kali makan utama + 1–2 selingan", portion: "±½ mangkuk 250 ml per makan", texture: "Cincang halus sampai kasar, mulai finger food lunak" },
  { age: "12–24 bulan", meals: "3–4 kali makan utama + 1–2 selingan", portion: "¾ – 1 mangkuk 250 ml per makan", texture: "Makanan keluarga, dipotong kecil dan lunak" },
];

const SAMPLE = [
  { age: "7 bulan", menu: ["Pagi: bubur beras hati ayam wortel + minyak", "Selingan: pure pisang", "Siang: bubur kentang ikan kembung bayam", "Sore: bubur beras merah daging sapi labu kuning"] },
  { age: "10 bulan", menu: ["Pagi: nasi tim ayam brokoli", "Selingan: perkedel kentang kukus", "Siang: sup makaroni ikan dori wortel", "Sore: semur daging labu siam + nasi lembek"] },
  { age: "15 bulan", menu: ["Pagi: orak-arik telur sayur + nasi", "Selingan: buah potong pepaya", "Siang: opor ayam labu siam + nasi", "Sore: pepes ikan nila + tumis buncis"] },
];

const FAQ = [
  { q: "Kapan bayi mulai MPASI?", a: "WHO dan IDAI menyarankan MPASI dimulai saat bayi berusia 6 bulan (180 hari), sambil ASI tetap dilanjutkan hingga 2 tahun atau lebih. Tanda siap: kepala tegak, bisa duduk dengan sedikit bantuan, dan tertarik pada makanan. Mulai lebih awal hanya atas saran dokter." },
  { q: "Berapa kali bayi 6 bulan makan dalam sehari?", a: "Usia 6–8 bulan: 2–3 kali makan utama ditambah 1–2 kali selingan. Usia 9–24 bulan: 3–4 kali makan utama ditambah 1–2 kali selingan. Mulai dengan 2–3 sendok makan lalu naikkan porsi bertahap." },
  { q: "Bagaimana tekstur MPASI yang tepat untuk usia 6 bulan?", a: "Kental dan lumat halus — bubur yang tidak tumpah saat sendok dimiringkan, bukan bubur encer. Tekstur dinaikkan bertahap: cincang halus–kasar di 9–11 bulan dan makanan keluarga yang dipotong kecil setelah 12 bulan." },
  { q: "Apakah MPASI harus mengandung protein hewani setiap hari?", a: "Ya. IDAI menekankan protein hewani (hati ayam, daging, ikan, telur) setiap hari karena kaya zat besi dan zinc yang dibutuhkan bayi sejak 6 bulan untuk mencegah anemia dan stunting." },
  { q: "Bolehkah bayi di bawah 1 tahun diberi madu, gula, atau garam?", a: "Madu tidak boleh diberikan sebelum 12 bulan karena risiko botulisme. WHO menyarankan tidak menambahkan gula dan garam pada makanan bayi di bawah 12 bulan; gunakan kaldu tanpa garam, bawang, dan rempah ringan untuk rasa." },
  { q: "Bagaimana cara mengenalkan makanan yang berpotensi alergi?", a: "Kenalkan satu bahan baru dalam satu waktu (misalnya telur), berikan di pagi hari, dan tunggu sekitar 3 hari sebelum mengenalkan bahan baru lainnya sambil mengamati ruam, muntah, atau diare. Bila anak sudah diketahui alergi, hindari bahan tersebut dan konsultasikan ke dokter anak." },
  { q: "Apa itu Menu MPASI Personal 30 Hari dari MPASI APP?", a: `Aplikasi web yang menyusun jadwal menu MPASI 30 hari khusus untuk anak Bunda berdasarkan kuis singkat: usia, tekstur, alergi, bahan yang tersedia, dan waktu memasak. Berisi ${N}+ variasi resep rumahan dengan takaran per porsi, daftar belanja mingguan, dan bisa dicetak. 3 hari pertama bisa dilihat gratis.` },
  { q: "Berapa harga Menu MPASI Personal 30 Hari?", a: `Paket Dasar ${rupiah(PACKAGES.dasar.price)}, paket Lengkap ${rupiah(PACKAGES.lengkap.price)}, dan paket 3 Bulan Bertahap ${rupiah(PACKAGES.tigabulan.price)}. Sekali bayar lewat QRIS (semua e-wallet & m-banking), dengan garansi uang kembali 7 hari.` },
];

export default function Page() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${SITE.url}/panduan-mpasi#article`,
        headline: "Panduan MPASI 6–24 Bulan: Jadwal, Porsi, Tekstur & Contoh Menu",
        inLanguage: "id-ID",
        datePublished: UPDATED,
        dateModified: UPDATED,
        author: { "@id": `${SITE.url}/#org` },
        publisher: { "@id": `${SITE.url}/#org` },
        mainEntityOfPage: `${SITE.url}/panduan-mpasi`,
        image: `${SITE.url}/og.jpg`,
        about: ["Makanan pendamping ASI", "Gizi bayi", "Menu MPASI"],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "Product",
        name: "Menu MPASI Personal 30 Hari",
        description: SITE.description,
        brand: { "@type": "Brand", name: SITE.brand },
        image: `${SITE.url}/og.jpg`,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "IDR",
          lowPrice: PACKAGES.dasar.price,
          highPrice: PACKAGES.tigabulan.price,
          offerCount: 3,
          availability: "https://schema.org/InStock",
          url: `${SITE.url}/kuis`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Panduan MPASI", item: `${SITE.url}/panduan-mpasi` },
        ],
      },
    ],
  };

  return (
    <main className="px-6 pb-14 pt-6 text-[14px] leading-relaxed">
      <JsonLd data={ld} />
<div className="flex items-center justify-between">
      <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas" aria-label="Kembali ke beranda">
        <IconBack />
      </Link>
        <Link href="/"><Logo size={28} /></Link>
      </div>

      <article className="mt-5 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_p]:mt-2 [&_p]:text-muted">
        <p className="!mt-0 text-xs font-semibold uppercase tracking-wide !text-teal-600">Panduan · diperbarui 2 November 2026</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight">Panduan MPASI 6–24 Bulan: jadwal, porsi, tekstur & contoh menu</h1>

        <section className="mt-5 rounded-2xl bg-teal-50 p-4" aria-label="Ringkasan">
          <h2 className="!mt-0 !text-base">Ringkasan cepat</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
            <li>Mulai MPASI di usia <b>6 bulan</b>; ASI tetap dilanjutkan hingga 2 tahun.</li>
            <li>6–8 bulan: <b>2–3x makan + 1–2x selingan</b>, tekstur kental/lumat.</li>
            <li>9–11 bulan: <b>3–4x makan + 1–2x selingan</b>, cincang & finger food.</li>
            <li>12–24 bulan: <b>3–4x makan + 1–2x selingan</b>, makanan keluarga.</li>
            <li><b>Protein hewani setiap hari</b> (hati, daging, ikan, telur) untuk zat besi.</li>
            <li>Tanpa <b>madu</b> sebelum 12 bulan; hindari tambahan gula & garam.</li>
            <li>Kenalkan alergen <b>satu per satu</b>, tunggu ±3 hari.</li>
          </ul>
        </section>

        <h2>Kapan mulai MPASI?</h2>
        <p>
          MPASI (makanan pendamping ASI) dimulai saat bayi berusia 6 bulan. Pada usia ini cadangan zat besi bayi mulai menurun sehingga ASI saja tidak lagi mencukupi kebutuhan energi, zat besi, dan zinc. Tanda siap
          makan: kepala sudah tegak, bisa duduk dengan sedikit bantuan, refleks menjulurkan lidah berkurang, dan bayi tertarik melihat orang makan.
        </p>

        <h2>Jadwal, porsi & tekstur per usia</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-canvas text-ink">
              <tr>
                <th className="p-2.5">Usia</th>
                <th className="p-2.5">Frekuensi</th>
                <th className="p-2.5">Porsi</th>
                <th className="p-2.5">Tekstur</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {AGES.map((a) => (
                <tr key={a.age} className="border-t border-line align-top">
                  <th className="p-2.5 font-semibold text-ink">{a.age}</th>
                  <td className="p-2.5">{a.meals}</td>
                  <td className="p-2.5">{a.portion}</td>
                  <td className="p-2.5">{a.texture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Isi piring MPASI yang lengkap</h2>
        <p>
          Setiap makan utama sebaiknya berisi: <b>karbohidrat</b> (beras, kentang, ubi, oat), <b>protein hewani</b> (hati ayam, daging sapi, ikan kembung/nila/salmon, telur), <b>sayur</b> (wortel, bayam, labu kuning,
          brokoli), dan <b>lemak tambahan</b> (minyak, santan, mentega) untuk menambah energi. Protein nabati seperti tahu dan tempe boleh ditambahkan, tetapi tidak menggantikan protein hewani.
        </p>

        <h2>Mengenalkan makanan alergen</h2>
        <p>
          Bahan yang sering memicu alergi antara lain telur, susu sapi, ikan, udang/seafood, kacang, kedelai, dan gandum. Kenalkan satu per satu di pagi hari, tunggu sekitar 3 hari sambil mengamati reaksi (ruam,
          bengkak, muntah, diare), baru lanjut ke bahan berikutnya. Jika muncul sesak napas atau bengkak di wajah, segera ke IGD.
        </p>

        <h2>Yang perlu dihindari sebelum 1 tahun</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li>Madu (risiko botulisme).</li>
          <li>Tambahan gula, garam, dan kecap; makanan olahan tinggi natrium.</li>
          <li>Susu sapi segar sebagai minuman utama.</li>
          <li>Makanan keras dan bulat yang berisiko tersedak (kacang utuh, anggur utuh, potongan apel mentah).</li>
          <li>Telur, daging, dan ikan yang tidak matang sempurna.</li>
        </ul>

        <h2>Contoh menu MPASI satu hari</h2>
        <div className="mt-3 space-y-3">
          {SAMPLE.map((s) => (
            <div key={s.age} className="rounded-2xl border border-line p-4">
              <h3 className="font-semibold">Usia {s.age}</h3>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">
                {s.menu.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2>Menu MPASI Personal 30 Hari</h2>
        <p>
          Menyusun 30 hari menu yang bervariasi, aman untuk alergi anak, dan sesuai tekstur itu melelahkan. <b>MPASI APP</b> menyusunnya otomatis dari kuis 1 menit: {N}+ resep rumahan dengan takaran per porsi, protein
          hewani setiap hari, alergen dikenalkan bertahap, daftar belanja mingguan, dan bisa dicetak. Lihat 3 hari pertama gratis, buka 30 hari mulai {rupiah(PACKAGES.dasar.price)} sekali bayar via QRIS, garansi
          uang kembali 7 hari.
        </p>
        <Link href="/kuis" className="mt-4 flex h-12 items-center justify-center rounded-full bg-teal-500 font-semibold text-white">
          Susun menu si kecil — gratis
        </Link>

        <h2>Pertanyaan yang sering ditanyakan</h2>
        <div className="mt-2 space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-2xl bg-canvas p-4 [&_p]:mt-2">
              <summary className="cursor-pointer font-semibold text-ink">{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <h2>Sumber</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] text-muted">
          <li>WHO — Guideline for complementary feeding of infants and young children 6–23 months of age (2023).</li>
          <li>Ikatan Dokter Anak Indonesia (IDAI) — Rekomendasi Praktik Pemberian Makan Berbasis Bukti pada Bayi dan Batita di Indonesia.</li>
          <li>Kementerian Kesehatan RI — Buku KIA (Kesehatan Ibu dan Anak).</li>
        </ul>
        <p className="!mt-6 rounded-2xl bg-orange-50 p-3 text-[12px]">
          Informasi ini bersifat edukasi umum dan tidak menggantikan konsultasi dengan dokter anak atau ahli gizi, terutama untuk bayi prematur, berat badan kurang, atau memiliki alergi/kondisi medis.
        </p>
      </article>
    </main>
  );
}
