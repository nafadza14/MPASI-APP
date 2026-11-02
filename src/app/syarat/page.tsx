import LegalPage from "@/components/LegalPage";
export const metadata = { title: "Syarat & Ketentuan", alternates: { canonical: "/syarat" } };
export default function Page() {
  return (
    <LegalPage title="Syarat & Ketentuan">
      <p>Menu MPASI Personal adalah produk digital berisi panduan menu dan resep makanan pendamping ASI untuk usia 6–24 bulan.</p>
      <h2>Sifat panduan</h2>
      <p><b>Panduan ini bersifat edukasi dan tidak menggantikan konsultasi dengan dokter anak atau tenaga kesehatan.</b> Untuk bayi dengan berat badan tidak naik, alergi berat, prematur, atau kondisi medis khusus, konsultasikan terlebih dahulu ke dokter anak atau posyandu.</p>
      <h2>Keamanan makanan</h2>
      <p>Orang tua bertanggung jawab memastikan bahan segar, dimasak matang, bebas duri, dan disajikan dengan tekstur sesuai kemampuan anak. Selalu dampingi anak saat makan.</p>
      <h2>Pembayaran</h2>
      <p>Pembayaran sekali bayar melalui QRIS. Tidak ada tagihan otomatis berulang. Akses diberikan melalui link pribadi; jangan bagikan link tersebut.</p>
      <h2>Hak cipta</h2>
      <p>Isi menu dan resep untuk penggunaan pribadi keluarga, tidak untuk dijual kembali.</p>
    </LegalPage>
  );
}
