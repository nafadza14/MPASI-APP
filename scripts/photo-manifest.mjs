// Mencatat foto hidangan asli di public/resep/<id-resep>.jpg agar otomatis tampil di aplikasi.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
const dir = "public/resep";
const ids = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".jpg")).map((f) => f.replace(/\.jpg$/, "")).sort() : [];
writeFileSync("src/lib/recipe-photos.json", JSON.stringify(ids, null, 0) + "\n");
console.log(`photo-manifest: ${ids.length} foto resep`);
