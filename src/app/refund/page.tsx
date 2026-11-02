import LegalPage from "@/components/LegalPage";
export const metadata = { title: "Kebijakan Refund", alternates: { canonical: "/refund" } };
export default function Page() {
  return (
    <LegalPage title="Garansi 7 Hari">
      <p>Bila menu tidak cocok untuk keluarga Bunda, ajukan refund dalam <b>7 hari</b> sejak pembayaran. Tidak perlu banyak alasan.</p>
      <h2>Cara mengajukan</h2>
      <p>Kirim kode pembayaran (contoh: MP-261102-XXXX) dan nomor e-wallet/rekening tujuan ke admin. Dana dikembalikan maksimal 3 hari kerja dan akses menu dinonaktifkan.</p>
    </LegalPage>
  );
}
