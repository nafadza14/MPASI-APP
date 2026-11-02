import LegalPage from "@/components/LegalPage";
import { PHOTOS } from "@/lib/photos";

export const metadata = { title: "Kredit Foto — Menu MPASI" };

export default function Page() {
  const people = [...new Set(Object.values(PHOTOS).map((p) => p[1]))].sort();
  return (
    <LegalPage title="Kredit Foto">
      <p>
        Foto makanan dan bahan di aplikasi ini berasal dari <a className="underline" href="https://unsplash.com">Unsplash</a> dan dipakai sesuai <a className="underline" href="https://unsplash.com/license">Unsplash License</a>. Foto bersifat ilustrasi; tampilan masakan Bunda bisa berbeda. Terima kasih kepada para fotografer:
      </p>
      <ul className="columns-2 text-xs">
        {people.map((u) => (
          <li key={u}>
            <a className="underline" href={`https://unsplash.com/@${u}`}>
              @{u}
            </a>
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}
