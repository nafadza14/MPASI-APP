import Link from "next/link";
import { BowlIllustration } from "@/components/Illustration";
import { Card, FoodBubble } from "@/components/ui";
import UtmCapture from "@/components/UtmCapture";

const benefits = [
  { emoji: "👶", title: "Sesuai usia dalam bulan", desc: "Tekstur & porsi naik bertahap mengikuti panduan WHO dan IDAI." },
  { emoji: "🚫", title: "Otomatis menghindari alergi", desc: "Pilih telur, susu sapi, ikan, dll — menu tidak akan memuatnya." },
  { emoji: "🛒", title: "Daftar belanja mingguan", desc: "Belanja sekali seminggu, sesuai budget dan bahan di sekitar Bunda." },
];

const faqs = [
  ["Apakah benar dibuat khusus untuk anak saya?", "Ya. Menu disusun dari jawaban kuis: usia tepat, tahap tekstur, alergi, protein yang mudah didapat, budget, dan waktu masak. Nama si kecil ada di setiap halaman."],
  ["Bisa lihat isinya dulu sebelum bayar?", "Bisa. Setelah kuis, Bunda melihat menu hari 1–3 lengkap secara gratis."],
  ["Bayarnya bagaimana?", "Sekali bayar lewat QRIS dari GoPay, OVO, DANA, ShopeePay, atau m-banking. Tidak ada langganan otomatis."],
  ["Apakah ini pengganti dokter?", "Bukan. Panduan ini bersifat edukasi. Untuk BB tidak naik, alergi berat, atau kondisi khusus, konsultasikan ke dokter anak atau posyandu."],
  ["Kalau tidak cocok?", "Ada garansi 7 hari: hubungi admin, uang kembali."],
];

export default function Landing() {
  return (
    <main className="pb-28">
      <UtmCapture />
      <section className="px-6 pt-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Flouris Care · Menu MPASI</p>
        <BowlIllustration className="mx-auto mt-4 w-60" />
        <h1 className="mt-4 text-[26px] font-bold leading-tight">Menu MPASI 30 hari, disusun khusus untuk si kecil</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">Jawab 10 pertanyaan singkat, lihat 3 hari pertama gratis. Sesuai usia, tekstur, alergi, dan bahan di rumah.</p>
        <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
          <span className="h-1.5 w-6 rounded-full bg-teal-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-teal-100" />
          <span className="h-1.5 w-1.5 rounded-full bg-teal-100" />
        </div>
      </section>

      <section className="mt-8 space-y-3 px-5">
        {benefits.map((b) => (
          <Card key={b.title} className="flex items-center gap-4">
            <FoodBubble emoji={b.emoji} size={52} />
            <div>
              <p className="font-semibold">{b.title}</p>
              <p className="text-[13px] leading-snug text-muted">{b.desc}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-8 px-5">
        <p className="mb-3 text-lg font-semibold">Contoh isi menu</p>
        <Card className="overflow-hidden p-0">
          <div className="bg-teal-500 px-5 py-4 text-white">
            <p className="text-xs opacity-80">Menu MPASI · Alya, 7 bulan 2 minggu</p>
            <div className="mt-2 flex items-end gap-4 font-semibold">
              <span className="text-xl opacity-50">3</span>
              <span className="text-xl opacity-70">4</span>
              <span className="text-4xl">5</span>
              <span className="text-xl opacity-70">6</span>
              <span className="text-xl opacity-50">7</span>
              <span className="ml-auto text-xs opacity-80">Hari</span>
            </div>
          </div>
          {[
            ["Pagi", "Bubur Hati Ayam Bayam", "🥬", "Sumber zat besi"],
            ["Snack", "Pure Alpukat", "🥑", "Lemak tambahan"],
            ["Siang", "Bubur Ikan Kembung Labu", "🐟", "Protein hewani"],
          ].map(([t, n, e, tag]) => (
            <div key={n} className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
              <FoodBubble emoji={e} size={44} />
              <div className="flex-1">
                <p className="text-[11px] text-muted">{t}</p>
                <p className="text-sm font-medium">{n}</p>
              </div>
              <span className="text-[11px] text-teal-600">{tag}</span>
            </div>
          ))}
        </Card>
      </section>

      <section className="mt-8 px-5">
        <p className="mb-3 text-lg font-semibold">Pertanyaan yang sering muncul</p>
        <div className="space-y-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="group rounded-2xl bg-canvas px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-medium">{q}</summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="mt-10 px-6 text-center text-[11px] leading-relaxed text-muted">
        <p>Mengikuti panduan umum WHO (2023) dan IDAI. Resep ditinjau ahli gizi.</p>
        <p className="mt-1">Panduan edukasi, bukan pengganti konsultasi dokter.</p>
        <p className="mt-3 space-x-3">
          <Link href="/privasi">Privasi</Link>
          <Link href="/syarat">Syarat</Link>
          <Link href="/refund">Refund</Link>
        </p>
      </footer>

      <div className="no-print fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] bg-gradient-to-t from-white via-white to-white/0 px-5 pb-5 pt-6">
        <Link href="/kuis" className="block w-full rounded-full bg-teal-500 py-4 text-center font-semibold text-white shadow-[var(--shadow-lift)]">
          Mulai, gratis 2 menit
        </Link>
      </div>
    </main>
  );
}
