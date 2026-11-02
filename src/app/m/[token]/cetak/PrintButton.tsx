"use client";
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print mb-4 w-full rounded-full bg-teal-500 py-3 font-semibold text-white">
      Simpan sebagai PDF / Cetak
    </button>
  );
}
