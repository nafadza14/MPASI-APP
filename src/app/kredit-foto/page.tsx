import LegalPage from "@/components/LegalPage";
import { PEXELS, PHOTOS } from "@/lib/photos";

export const metadata = { title: "Kredit Foto — Menu MPASI" };

export default function Page() {
  const px = new Set(Object.keys(PEXELS));
  const uniq = (src: "px" | "us") =>
    [...new Set(Object.entries(PHOTOS).filter(([k]) => (src === "px") === px.has(k)).map(([, p]) => p[1]))].sort();
  return (
    <LegalPage title="Kredit Foto">
      <p>
        Foto makanan dan bahan di aplikasi ini berasal dari <a className="underline" href="https://www.pexels.com">Pexels</a> (sesuai{" "}
        <a className="underline" href="https://www.pexels.com/license/">Pexels License</a>) dan <a className="underline" href="https://unsplash.com">Unsplash</a> (sesuai{" "}
        <a className="underline" href="https://unsplash.com/license">Unsplash License</a>). Foto bersifat ilustrasi; tampilan masakan Bunda bisa berbeda. Terima kasih kepada para fotografer:
      </p>
      <h2 className="font-semibold">Pexels</h2>
      <ul className="columns-2 text-xs">
        {uniq("px").map((u) => (
          <li key={u}>
            <a className="underline" href={`https://www.pexels.com/@${u}/`}>@{u}</a>
          </li>
        ))}
      </ul>
      <h2 className="font-semibold">Unsplash</h2>
      <ul className="columns-2 text-xs">
        {uniq("us").map((u) => (
          <li key={u}>
            <a className="underline" href={`https://unsplash.com/@${u}`}>@{u}</a>
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}
