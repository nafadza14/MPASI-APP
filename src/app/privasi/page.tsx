import LegalPage from "@/components/LegalPage";
export const metadata = { title: "Kebijakan Privasi", alternates: { canonical: "/privasi" } };
export default function Page() {
  return (
    <LegalPage title="Kebijakan Privasi">
      <p>Kami menyimpan data seminimal mungkin dan hanya untuk menyusun serta mengirim menu MPASI Bunda, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.</p>
      <h2>Data yang kami simpan</h2>
      <p>Nama panggilan dan tanggal lahir anak, jawaban kuis (alergi, tekstur, preferensi), nomor WhatsApp, email (opsional), dan riwayat pembayaran. Kami tidak meminta foto, berat badan, atau riwayat penyakit.</p>
      <h2>Penggunaan</h2>
      <p>Untuk menyusun menu, mengirim link akses, dan layanan pelanggan. Untuk mengukur iklan, nomor WhatsApp dan email dikirim ke Meta dalam bentuk terenkripsi satu arah (hash). Data anak tidak pernah dikirim ke pihak periklanan.</p>
      <h2>Penyimpanan & keamanan</h2>
      <p>Data disimpan di server dengan enkripsi. Pesanan yang tidak dibayar dihapus otomatis setelah 30 hari.</p>
      <h2>Hak Bunda</h2>
      <p>Bunda dapat meminta salinan, perbaikan, atau penghapusan data kapan saja dengan menghubungi admin. Permintaan diproses maksimal 3 x 24 jam.</p>
    </LegalPage>
  );
}
