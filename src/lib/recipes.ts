import type { Allergen, Ingredient, Protein, Recipe, Stage } from "./types";
import { NUTR, gramsOf, type Nutr } from "./nutrition";
import RECIPE_PHOTOS from "./recipe-photos.json";

/**
 * DATABASE RESEP MPASI — 170-an masakan rumahan Indonesia yang umum dimasak ibu-ibu
 * (bubur, nasi tim, sup, soto, opor, pepes, semur, nugget, perkedel, dll.).
 *
 * - Nama, bahan, takaran, dan langkah ditulis sendiri (tidak disalin dari situs resep).
 * - Takaran = 1 porsi untuk tahap `base` resep; tahap berikutnya dikali (lihat scaleQty).
 * - Setiap resep WAJIB dimasak ulang (recook) dan ditinjau ahli gizi. Setelah lolos,
 *   ubah `verified` menjadi true dan taruh fotonya di public/resep/<id>.jpg.
 */

// ───────────── Katalog bahan ─────────────
type Ing = {
  name: string;
  short: string;
  photo?: string;
  group: Ingredient["group"];
  allergen?: Allergen;
  protein?: Protein;
  cost?: 1 | 2 | 3;
  iron?: boolean;
};

export const ING: Record<string, Ing> = {
  // protein hewani
  ayam: { name: "Daging ayam fillet", short: "Ayam", photo: "chicken", group: "protein", protein: "ayam", cost: 1 },
  ayampaha: { name: "Daging ayam paha fillet", short: "Ayam Paha", photo: "chicken", group: "protein", protein: "ayam", cost: 1 },
  hatiayam: { name: "Hati ayam", short: "Hati Ayam", photo: "liver", group: "protein", protein: "hati", cost: 1, iron: true },
  hatisapi: { name: "Hati sapi", short: "Hati Sapi", photo: "beefliver", group: "protein", protein: "hati", cost: 2, iron: true },
  sapi: { name: "Daging sapi giling", short: "Daging Sapi", photo: "beef", group: "protein", protein: "sapi", cost: 2, iron: true },
  sapihas: { name: "Daging sapi has (potong kecil)", short: "Daging Sapi", photo: "beef", group: "protein", protein: "sapi", cost: 3, iron: true },
  kembung: { name: "Ikan kembung fillet", short: "Ikan Kembung", photo: "pkembung", group: "protein", protein: "ikan", allergen: "ikan", cost: 1 },
  nila: { name: "Ikan nila fillet", short: "Ikan Nila", photo: "tilapia", group: "protein", protein: "ikan", allergen: "ikan", cost: 1 },
  lele: { name: "Ikan lele fillet", short: "Ikan Lele", group: "protein", protein: "ikan", allergen: "ikan", cost: 1 },
  salmon: { name: "Salmon fillet", short: "Salmon", photo: "salmon", group: "protein", protein: "ikan", allergen: "ikan", cost: 3 },
  dori: { name: "Ikan dori fillet", short: "Ikan Dori", photo: "dory", group: "protein", protein: "ikan", allergen: "ikan", cost: 2 },
  udang: { name: "Udang kupas", short: "Udang", photo: "shrimp", group: "protein", protein: "udang", allergen: "seafood", cost: 2 },
  telur: { name: "Telur ayam", short: "Telur", photo: "egg", group: "protein", protein: "telur", allergen: "telur", cost: 1 },
  kuningtelur: { name: "Kuning telur ayam", short: "Kuning Telur", photo: "egg", group: "protein", protein: "telur", allergen: "telur", cost: 1 },
  telurpuyuh: { name: "Telur puyuh", short: "Telur Puyuh", group: "protein", protein: "telur", allergen: "telur", cost: 1 },
  tahu: { name: "Tahu putih", short: "Tahu", photo: "tofu", group: "protein", allergen: "kedelai", cost: 1 },
  tempe: { name: "Tempe", short: "Tempe", photo: "tempeh", group: "protein", allergen: "kedelai", cost: 1 },
  kacanghijau: { name: "Kacang hijau kupas", short: "Kacang Hijau", group: "protein", cost: 1 },
  // karbohidrat
  beras: { name: "Beras putih", short: "Beras", photo: "rice", group: "karbo", cost: 1 },
  berasmerah: { name: "Beras merah", short: "Beras Merah", photo: "brownrice", group: "karbo", cost: 1 },
  nasi: { name: "Nasi putih (dimasak lebih lembek)", short: "Nasi", photo: "rice", group: "karbo", cost: 1 },
  kentang: { name: "Kentang", short: "Kentang", photo: "potato", group: "karbo", cost: 1 },
  ubi: { name: "Ubi oranye", short: "Ubi", photo: "sweetpotato", group: "karbo", cost: 1 },
  ubiungu: { name: "Ubi ungu", short: "Ubi Ungu", photo: "pubiungu", group: "karbo", cost: 1 },
  singkong: { name: "Singkong", short: "Singkong", group: "karbo", cost: 1 },
  oat: { name: "Oat (rolled oats)", short: "Oat", photo: "oats", group: "karbo", allergen: "gandum", cost: 2 },
  makaroni: { name: "Makaroni kecil", short: "Makaroni", photo: "macaroni", group: "karbo", allergen: "gandum", cost: 1 },
  mie: { name: "Mie telur", short: "Mie", photo: "noodles", group: "karbo", allergen: "gandum", cost: 1 },
  spageti: { name: "Spageti", short: "Spageti", photo: "noodles", group: "karbo", allergen: "gandum", cost: 2 },
  bihun: { name: "Bihun beras", short: "Bihun", group: "karbo", cost: 1 },
  roti: { name: "Roti tawar", short: "Roti", photo: "bread", group: "karbo", allergen: "gandum", cost: 1 },
  terigu: { name: "Tepung terigu", short: "Terigu", photo: "bread", group: "karbo", allergen: "gandum" },
  tepungberas: { name: "Tepung beras", short: "Tepung Beras", photo: "rice", group: "karbo" },
  maizena: { name: "Tepung maizena", short: "Maizena", group: "karbo" },
  tapioka: { name: "Tepung tapioka", short: "Tapioka", group: "karbo" },
  // sayur
  wortel: { name: "Wortel", short: "Wortel", photo: "carrot", group: "sayur" },
  bayam: { name: "Bayam (daun)", short: "Bayam", photo: "spinach", group: "sayur", iron: true },
  bayammerah: { name: "Bayam merah (daun)", short: "Bayam Merah", photo: "redspinach", group: "sayur", iron: true },
  brokoli: { name: "Brokoli", short: "Brokoli", photo: "broccoli", group: "sayur" },
  labukuning: { name: "Labu kuning", short: "Labu Kuning", photo: "pumpkin", group: "sayur" },
  labusiam: { name: "Labu siam", short: "Labu Siam", photo: "plabusiam", group: "sayur" },
  buncis: { name: "Buncis", short: "Buncis", photo: "greenbeans", group: "sayur" },
  kacangpanjang: { name: "Kacang panjang", short: "Kacang Panjang", photo: "pkacangpanjang", group: "sayur" },
  jagung: { name: "Jagung manis pipil", short: "Jagung", photo: "corn", group: "sayur" },
  tomat: { name: "Tomat (buang biji & kulit)", short: "Tomat", photo: "tomato", group: "sayur" },
  sawi: { name: "Sawi / pakcoy", short: "Pakcoy", photo: "bokchoy", group: "sayur" },
  zucchini: { name: "Oyong / zucchini", short: "Oyong", photo: "zucchini", group: "sayur" },
  kembangkol: { name: "Kembang kol", short: "Kembang Kol", photo: "cauliflower", group: "sayur" },
  jamur: { name: "Jamur kancing / tiram", short: "Jamur", photo: "mushroom", group: "sayur" },
  kacangpolong: { name: "Kacang polong", short: "Kacang Polong", group: "sayur" },
  kangkung: { name: "Kangkung (daun muda)", short: "Kangkung", photo: "pkangkung", group: "sayur", iron: true },
  kol: { name: "Kol / kubis", short: "Kol", group: "sayur" },
  // buah
  pisang: { name: "Pisang ambon matang", short: "Pisang", photo: "banana", group: "buah" },
  alpukat: { name: "Alpukat matang", short: "Alpukat", photo: "avocado", group: "buah" },
  pepaya: { name: "Pepaya matang", short: "Pepaya", photo: "papaya", group: "buah" },
  mangga: { name: "Mangga matang", short: "Mangga", photo: "mango", group: "buah" },
  melon: { name: "Melon", short: "Melon", photo: "melon", group: "buah" },
  pir: { name: "Pir", short: "Pir", photo: "pear", group: "buah" },
  apel: { name: "Apel", short: "Apel", photo: "apple", group: "buah" },
  naga: { name: "Buah naga", short: "Buah Naga", photo: "dragonfruit", group: "buah" },
  jeruk: { name: "Jeruk manis (air perasan)", short: "Jeruk", group: "buah" },
  nanas: { name: "Nanas matang", short: "Nanas", group: "buah" },
  // lemak & susu
  minyak: { name: "Minyak (zaitun/kelapa/sayur)", short: "Minyak", photo: "oliveoil", group: "lemak" },
  mentega: { name: "Mentega tawar (unsalted)", short: "Mentega", photo: "butter", group: "lemak", allergen: "susu" },
  santan: { name: "Santan encer", short: "Santan", photo: "coconutmilk", group: "lemak" },
  keju: { name: "Keju cheddar parut", short: "Keju", photo: "cheese", group: "lemak", allergen: "susu" },
  yogurt: { name: "Yogurt plain tanpa gula", short: "Yogurt", photo: "yogurt", group: "protein", allergen: "susu" },
  susu: { name: "Susu UHT plain (untuk 1 tahun ke atas)", short: "Susu", group: "protein", allergen: "susu" },
  // lain-lain & bumbu
  kaldu: { name: "Kaldu ayam/sapi tanpa garam", short: "Kaldu", photo: "broth", group: "lain" },
  air: { name: "Air matang", short: "Air", group: "lain" },
  bawang: { name: "Bawang merah & putih", short: "Bawang", photo: "garlic", group: "bumbu" },
  bawangbombay: { name: "Bawang bombay", short: "Bawang Bombay", photo: "garlic", group: "bumbu" },
  kunyit: { name: "Kunyit (parut/bubuk)", short: "Kunyit", photo: "turmeric", group: "bumbu" },
  jahe: { name: "Jahe", short: "Jahe", group: "bumbu" },
  rempah: { name: "Daun salam, serai, lengkuas", short: "Rempah", group: "bumbu" },
  daunbawang: { name: "Daun bawang & seledri", short: "Daun Bawang", group: "bumbu" },
  kemangi: { name: "Daun kemangi", short: "Kemangi", group: "bumbu" },
  pala: { name: "Pala bubuk & kayu manis", short: "Pala", group: "bumbu" },
  asam: { name: "Asam jawa / belimbing wuluh", short: "Asam", group: "bumbu" },
  kecap: { name: "Kecap manis (sedikit)", short: "Kecap", group: "bumbu", allergen: "kedelai" },
  agar: { name: "Agar-agar bubuk tawar", short: "Agar-agar", group: "lain" },
  daunpisang: { name: "Daun pisang (pembungkus)", short: "Daun Pisang", group: "lain" },
};

// ───────────── Pembangun resep ─────────────
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const UNITS = ["ml", "sdm", "sdt", "butir", "buah", "lembar", "batang", "siung"] as const;
/** "beras:20 hatiayam:20 kaldu:150ml minyak:1sdt telur:1butir" → Ingredient[] */
function parseItems(s: string): Ingredient[] {
  return s
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [key, q] = tok.split(":");
      if (!ING[key]) throw new Error("Bahan tidak dikenal: " + key);
      const unit = (UNITS.find((u) => q.endsWith(u)) ?? "g") as Ingredient["unit"];
      const qty = parseFloat(q);
      return { key, item: ING[key].name, qty, unit, group: ING[key].group };
    });
}

type Def = {
  name: string;
  family: string;
  slot: "utama" | "snack";
  stages: Stage[];
  min: number;
  freeze?: boolean;
  items: string;
  steps: string[];
  tags?: Recipe["tags"];
  verified?: boolean;
};

const R: Recipe[] = [];
const seen = new Set<string>();
function add(d: Def) {
  const ingredients = parseItems(d.items);
  const keys = ingredients.map((x) => x.key!);
  const allergens = [...new Set(keys.map((k) => ING[k].allergen).filter(Boolean) as Allergen[])];
  const proteinKey = keys.find((k) => ING[k].protein);
  const tags = new Set<Recipe["tags"][number]>(d.tags ?? []);
  if (keys.some((k) => ING[k].iron)) tags.add("zat-besi");
  if (keys.some((k) => ["santan", "mentega", "keju", "alpukat", "minyak"].includes(k))) tags.add("lemak-tambahan");
  if (keys.some((k) => ["bayam", "brokoli", "sawi", "bayammerah", "kangkung"].includes(k))) tags.add("sayur-hijau");
  const id = slug(d.name);
  if (seen.has(id)) throw new Error("Resep ganda: " + id);
  seen.add(id);
  const base = Math.min(...d.stages) as Stage;
  R.push({
    id,
    name: d.name,
    slot: d.slot,
    stages: d.stages,
    base,
    ingredients,
    steps: d.steps,
    allergens,
    protein: proteinKey ? ING[proteinKey].protein! : null,
    tags: [...tags],
    cost: Math.max(1, ...keys.map((k) => ING[k].cost ?? 1)) as 1 | 2 | 3,
    minutes: d.min,
    freezable: d.freeze ?? false,
    img: (RECIPE_PHOTOS as string[]).includes(id) ? `/resep/${id}.jpg` : "",
    family: d.family,
    verified: d.verified ?? false,
    nutrition: nutritionOf(ingredients),
  });
}

function nutritionOf(items: Ingredient[]): Nutr {
  const t: Nutr = { kcal: 0, protein: 0, fat: 0, carb: 0, iron: 0, zinc: 0, calcium: 0 };
  for (const g of items) {
    const n = NUTR[g.key!];
    if (!n) continue;
    const grams = gramsOf(g.key!, g.qty, g.unit);
    for (const k of Object.keys(t) as (keyof Nutr)[]) t[k] += (n[k] * grams) / 100;
  }
  return t;
}

// Langkah yang sering dipakai
const PREP: Record<string, string> = {
  ayam: "Cuci ayam, rebus hingga matang dan empuk (±20 menit), lalu cincang atau suwir halus.",
  ayampaha: "Buang kulit dan lemak ayam paha, rebus hingga empuk, lalu cincang.",
  hatiayam: "Rendam hati ayam dengan perasan jeruk nipis 10 menit, bilas, rebus hingga matang sempurna (bagian dalam tidak merah lagi).",
  hatisapi: "Rebus hati sapi hingga matang sempurna, kupas selaputnya, potong kecil.",
  sapi: "Tumis daging giling dengan sedikit minyak sampai berubah warna dan matang.",
  sapihas: "Rebus daging sapi bersama daun salam sampai empuk (±45 menit, atau 15 menit dengan panci presto), lalu cincang.",
  kembung: "Kukus ikan kembung 10–15 menit, buang semua duri dengan teliti, suwir halus.",
  nila: "Kukus ikan nila 10–15 menit, buang semua duri dengan teliti, suwir halus.",
  lele: "Kukus ikan lele 10–15 menit, buang kulit dan semua duri, suwir halus.",
  salmon: "Kukus salmon 8–10 menit, pastikan tidak ada duri, suwir halus.",
  dori: "Kukus ikan dori 8–10 menit hingga matang, suwir halus.",
  udang: "Kupas udang, buang kepala dan kotoran di punggungnya, rebus sampai merah dan matang, cincang halus.",
  kuningtelur: "Rebus telur 10–12 menit hingga matang penuh, ambil kuningnya dan hancurkan dengan garpu.",
  tahu: "Kukus tahu 10 menit, lalu hancurkan dengan garpu.",
  tempe: "Kukus tempe 15 menit, lalu cincang atau haluskan.",
};

const lc = (k: string) => ING[k].short.toLowerCase();

/** Bubur tahap 1: dimasak dari beras/umbi dengan kaldu lalu disaring/diblender. */
function bubur(name: string, carb: string, prot: string, veg: string[], opt: { fat?: string; extra?: string; stages?: Stage[]; spice?: string; note?: string } = {}) {
  const fat = opt.fat ?? "minyak";
  const fatQ = fat === "santan" ? "2sdm" : fat === "keju" ? "5" : "1sdt";
  const carbQ = ["beras", "berasmerah", "oat"].includes(carb) ? 20 : 40;
  const protQ = prot === "kuningtelur" ? "1butir" : prot === "telurpuyuh" ? "2butir" : prot === "tahu" || prot === "tempe" ? 25 : 20;
  const vegs = veg.map((v) => `${v}:${veg.length > 1 ? 10 : 15}`).join(" ");
  const isGrain = ["beras", "berasmerah"].includes(carb);
  add({
    name,
    family: "bubur",
    slot: "utama",
    stages: opt.stages ?? [1],
    min: isGrain ? 40 : 30,
    freeze: prot !== "kuningtelur",
    items: `${carb}:${carbQ} ${prot}:${protQ} ${vegs} ${opt.extra ?? ""} ${opt.spice ? opt.spice + " " : ""}kaldu:150ml ${fat}:${fatQ}`.replace(/\s+/g, " "),
    steps: [
      isGrain
        ? `Cuci ${lc(carb)}, masak bersama kaldu dengan api kecil sambil sesekali diaduk sampai menjadi bubur yang sangat lembut (±30 menit).`
        : carb === "oat"
          ? "Masak oat dengan kaldu 5–7 menit sampai lembut."
          : `Kupas ${lc(carb)}, potong kecil, rebus dalam kaldu sampai sangat empuk.`,
      PREP[prot] ?? `Siapkan ${lc(prot)}.`,
      `Masukkan ${veg.map(lc).join(" dan ")} yang sudah dipotong kecil${opt.spice ? " beserta bumbunya" : ""}, masak sampai empuk.`,
      `Campur semua, blender atau saring sampai kental (tidak encer), lalu aduk dengan ${lc(fat)} sebelum disajikan.${opt.note ? " " + opt.note : ""}`,
    ],
  });
}

/** Nasi tim tahap 2: nasi/beras ditim bersama lauk lalu dicincang sesuai tekstur. */
function nasiTim(name: string, prot: string, veg: string[], opt: { extra?: string; stages?: Stage[]; spice?: string; fat?: string } = {}) {
  const fat = opt.fat ?? "minyak";
  const protQ = prot === "telurpuyuh" ? "3butir" : prot === "tahu" || prot === "tempe" ? 30 : 30;
  add({
    name,
    family: "nasi-tim",
    slot: "utama",
    stages: opt.stages ?? [2, 3],
    min: 40,
    freeze: true,
    items: `beras:30 ${prot}:${protQ} ${veg.map((v) => v + ":15").join(" ")} ${opt.extra ?? ""} bawang:1siung ${opt.spice ?? ""} kaldu:200ml ${fat}:1sdt`.replace(/\s+/g, " "),
    steps: [
      "Tumis bawang cincang dengan minyak sampai harum.",
      `${PREP[prot] ?? "Siapkan " + lc(prot) + "."}`,
      `Masukkan beras, kaldu, ${lc(prot)}, dan ${veg.map(lc).join(", ")} ke mangkuk tahan panas${opt.spice ? " beserta bumbunya" : ""}.`,
      "Kukus/tim 30–40 menit sampai nasi lembek dan semua bahan empuk. Tambah kaldu bila terlalu kering.",
      "Cincang atau tekan dengan garpu sesuai tekstur usia, sajikan hangat.",
    ],
  });
}

function pureBuah(f: string[], opt: { extra?: string; stages?: Stage[] } = {}) {
  const steamed = f.some((x) => ["pir", "apel"].includes(x));
  add({
    name: `Pure ${f.map((x) => ING[x].short).join(" ")}`,
    family: "pure-buah",
    slot: "snack",
    stages: opt.stages ?? [1, 2],
    min: steamed ? 15 : 5,
    items: `${f.map((x) => `${x}:${f.length > 1 ? 30 : 50}`).join(" ")} ${opt.extra ?? ""}`.trim(),
    steps: [
      steamed ? `Kupas ${f.map(lc).join(" dan ")}, buang bijinya, kukus 8–10 menit sampai sangat lunak.` : `Kupas ${f.map(lc).join(" dan ")} matang, buang biji bila ada.`,
      "Lumatkan dengan garpu atau saringan sampai halus; encerkan dengan sedikit ASI/air matang bila terlalu kental.",
      "Sajikan segera. Untuk 9 bulan ke atas cukup dilumat kasar.",
    ],
  });
}

function buahPotong(f: string) {
  add({
    name: `Buah Potong ${ING[f].short}`,
    family: "buah-potong",
    slot: "snack",
    stages: [2, 3],
    min: 5,
    items: `${f}:60`,
    tags: ["finger-food"],
    steps: [
      `Cuci dan kupas ${lc(f)}, buang biji.`,
      "Potong memanjang seukuran jari orang dewasa untuk 9–11 bulan, atau dadu ±1 cm untuk 12 bulan ke atas.",
      "Pastikan cukup lunak untuk dilumat dengan gusi.",
    ],
  });
}

function stikKukus(v: string) {
  add({
    name: `Stik ${ING[v].short} Kukus`,
    family: "stik-sayur",
    slot: "snack",
    stages: [2, 3],
    min: 15,
    items: `${v}:60 minyak:1sdt`,
    tags: ["finger-food"],
    steps: [
      v === "brokoli" ? "Potong brokoli per kuntum dengan batangnya sebagai pegangan." : `Kupas ${lc(v)}, potong memanjang seukuran jari orang dewasa.`,
      "Kukus 10–12 menit sampai bisa dilumat dengan tekanan jari.",
      "Olesi sedikit minyak, sajikan hangat.",
    ],
  });
}

// ═══════════════ TAHAP 1 (6–8 bulan): bubur & pure ═══════════════
bubur("Bubur Hati Ayam Wortel", "beras", "hatiayam", ["wortel"]);
bubur("Bubur Hati Ayam Bayam", "beras", "hatiayam", ["bayam"]);
bubur("Bubur Hati Ayam Labu Kuning Santan", "beras", "hatiayam", ["labukuning"], { fat: "santan" });
bubur("Bubur Hati Ayam Kentang Tomat", "kentang", "hatiayam", ["tomat"]);
bubur("Bubur Hati Ayam Ubi Ungu", "ubiungu", "hatiayam", ["buncis"]);
bubur("Bubur Ayam Wortel Kentang", "kentang", "ayam", ["wortel"]);
bubur("Bubur Ayam Labu Siam", "beras", "ayam", ["labusiam"], { fat: "santan" });
bubur("Bubur Ayam Jagung Manis", "beras", "ayam", ["jagung"]);
bubur("Bubur Ayam Kacang Polong Wortel", "beras", "ayam", ["kacangpolong", "wortel"]);
bubur("Bubur Ayam Oyong", "beras", "ayampaha", ["zucchini"]);
bubur("Bubur Ayam Pakcoy Jamur", "beras", "ayam", ["sawi", "jamur"]);
bubur("Bubur Ayam Kuning Santan", "beras", "ayampaha", ["wortel"], { fat: "santan", spice: "kunyit:0.5sdt rempah:1lembar" });
bubur("Bubur Manado Ayam", "beras", "ayam", ["labukuning", "jagung", "bayam"], { fat: "minyak", stages: [1, 2], note: "Bubur Manado (tinutuan) aslinya kaya sayur; untuk 9 bulan ke atas cukup dilumat kasar." });
bubur("Bubur Daging Sapi Labu Kuning", "beras", "sapi", ["labukuning"]);
bubur("Bubur Daging Sapi Bayam Merah", "beras", "sapi", ["bayammerah"]);
bubur("Bubur Daging Sapi Kentang Wortel", "kentang", "sapi", ["wortel"], { fat: "mentega" });
bubur("Bubur Daging Sapi Kembang Kol", "beras", "sapi", ["kembangkol"]);
bubur("Bubur Beras Merah Daging Sapi Tomat", "berasmerah", "sapi", ["tomat"]);
bubur("Bubur Hati Sapi Ubi Oranye", "ubi", "hatisapi", ["brokoli"]);
bubur("Bubur Hati Sapi Brokoli Kentang", "kentang", "hatisapi", ["brokoli"], { fat: "mentega" });
bubur("Bubur Beras Merah Ayam Buncis", "berasmerah", "ayam", ["buncis"]);
bubur("Bubur Singkong Ayam Wortel", "singkong", "ayam", ["wortel"], { fat: "santan" });
bubur("Pure Kentang Ayam Brokoli", "kentang", "ayam", ["brokoli"], { fat: "mentega" });
bubur("Pure Ubi Hati Ayam Wortel", "ubi", "hatiayam", ["wortel"]);
bubur("Bubur Oat Ayam Wortel", "oat", "ayam", ["wortel"]);
bubur("Bubur Ayam Tahu Bayam", "beras", "ayam", ["bayam"], { extra: "tahu:15" });
bubur("Bubur Ayam Tempe Labu Kuning", "beras", "ayam", ["labukuning"], { extra: "tempe:15" });
bubur("Bubur Ikan Kembung Bayam", "beras", "kembung", ["bayam"]);
bubur("Bubur Ikan Kembung Labu Kuning", "beras", "kembung", ["labukuning"], { fat: "santan" });
bubur("Bubur Ikan Nila Wortel", "beras", "nila", ["wortel"]);
bubur("Bubur Ikan Dori Jagung", "beras", "dori", ["jagung"], { fat: "mentega" });
bubur("Bubur Salmon Brokoli", "beras", "salmon", ["brokoli"]);
bubur("Bubur Lele Labu Siam", "beras", "lele", ["labusiam"]);
bubur("Bubur Kuning Telur Bayam", "beras", "kuningtelur", ["bayam"]);
bubur("Bubur Kuning Telur Wortel Keju", "beras", "kuningtelur", ["wortel"], { fat: "keju" });
bubur("Bubur Udang Labu Kuning", "beras", "udang", ["labukuning"], { stages: [1, 2] });

pureBuah(["pisang"]);
pureBuah(["alpukat"]);
pureBuah(["pepaya"]);
pureBuah(["mangga"]);
pureBuah(["pir"]);
pureBuah(["apel"]);
pureBuah(["melon"]);
pureBuah(["naga"]);
pureBuah(["alpukat", "pisang"]);
pureBuah(["pepaya", "pisang"]);
pureBuah(["apel", "pir"]);
add({ name: "Pure Labu Kuning Santan", family: "pure-umbi", slot: "snack", stages: [1, 2], min: 20, freeze: true, items: "labukuning:50 santan:1sdm", tags: ["padat-energi"], steps: ["Kupas labu kuning, potong dadu, kukus 15 menit sampai empuk.", "Lumatkan selagi hangat, aduk dengan santan yang sudah direbus sebentar."] });
add({ name: "Pure Ubi Oranye Mentega", family: "pure-umbi", slot: "snack", stages: [1, 2], min: 20, freeze: true, items: "ubi:50 mentega:1sdt", tags: ["padat-energi"], steps: ["Kupas ubi, potong kecil, kukus 15 menit sampai sangat empuk.", "Lumatkan selagi hangat bersama mentega, encerkan dengan ASI bila perlu."] });
add({ name: "Pure Kentang Keju", family: "pure-umbi", slot: "snack", stages: [1, 2], min: 20, items: "kentang:50 keju:5", tags: ["padat-energi"], steps: ["Kupas kentang, kukus 15 menit sampai empuk.", "Lumatkan selagi hangat dan aduk dengan keju parut sampai meleleh."] });
add({ name: "Yogurt Pisang", family: "yogurt", slot: "snack", stages: [1, 2, 3], min: 5, items: "yogurt:40 pisang:30", steps: ["Lumatkan pisang.", "Campur dengan yogurt plain tanpa gula, sajikan dingin."] });
add({ name: "Yogurt Mangga", family: "yogurt", slot: "snack", stages: [1, 2, 3], min: 5, items: "yogurt:40 mangga:30", steps: ["Lumatkan mangga matang.", "Campur dengan yogurt plain tanpa gula."] });
add({ name: "Bubur Sumsum Pisang", family: "sumsum", slot: "snack", stages: [1, 2, 3], min: 20, items: "tepungberas:10 santan:60ml pisang:30 rempah:1lembar", tags: ["padat-energi"], steps: ["Larutkan tepung beras dalam santan dan sedikit air, masukkan daun pandan/salam.", "Masak dengan api kecil sambil terus diaduk sampai mengental dan matang (±7 menit).", "Sajikan dengan pisang lumat di atasnya. Tanpa gula untuk di bawah 12 bulan."] });
add({ name: "Bubur Sumsum Labu Kuning", family: "sumsum", slot: "snack", stages: [1, 2, 3], min: 20, items: "tepungberas:10 santan:60ml labukuning:30", tags: ["padat-energi"], steps: ["Kukus labu kuning sampai empuk, lumatkan.", "Masak tepung beras dengan santan sambil terus diaduk sampai kental.", "Aduk rata dengan labu lumat."] });
add({ name: "Bubur Kacang Hijau Santan", family: "kacang-hijau", slot: "snack", stages: [1, 2, 3], min: 45, freeze: true, items: "kacanghijau:20 santan:2sdm rempah:1lembar air:200ml", tags: ["padat-energi", "zat-besi"], steps: ["Rendam kacang hijau kupas minimal 2 jam, tiriskan.", "Rebus dengan air dan daun pandan sampai pecah dan sangat lunak (±30 menit).", "Tambahkan santan, didihkan sebentar sambil diaduk.", "Blender untuk 6–8 bulan; tanpa gula untuk di bawah 12 bulan."] });

// ═══════════════ TAHAP 2 (9–11 bulan): nasi tim, sup, lauk lunak ═══════════════
nasiTim("Nasi Tim Ayam Wortel Jamur", "ayam", ["wortel", "jamur"]);
nasiTim("Nasi Tim Hati Ayam Bayam", "hatiayam", ["bayam"]);
nasiTim("Nasi Tim Hati Ayam Kentang Buncis", "hatiayam", ["buncis"], { extra: "kentang:20" });
nasiTim("Nasi Tim Daging Sapi Labu Kuning", "sapi", ["labukuning"]);
nasiTim("Nasi Tim Daging Sapi Buncis", "sapi", ["buncis", "wortel"]);
nasiTim("Nasi Tim Hati Sapi Brokoli", "hatisapi", ["brokoli"]);
nasiTim("Nasi Tim Ayam Kacang Panjang", "ayampaha", ["kacangpanjang"]);
nasiTim("Nasi Tim Ayam Tahu Wortel", "ayam", ["wortel"], { extra: "tahu:20" });
nasiTim("Nasi Tim Ayam Jagung Pakcoy", "ayam", ["jagung", "sawi"]);
nasiTim("Nasi Tim Ikan Kembung Tomat", "kembung", ["tomat"], { spice: "kemangi:3lembar" });
nasiTim("Nasi Tim Ikan Nila Wortel Telur Puyuh", "nila", ["wortel"], { extra: "telurpuyuh:2butir" });
nasiTim("Nasi Tim Ikan Lele Bayam", "lele", ["bayam"]);
nasiTim("Nasi Tim Salmon Brokoli", "salmon", ["brokoli"], { fat: "mentega" });
nasiTim("Nasi Tim Ikan Dori Jagung", "dori", ["jagung", "wortel"]);
nasiTim("Nasi Tim Udang Labu Siam", "udang", ["labusiam"]);
nasiTim("Nasi Tim Ayam Kuning", "ayampaha", ["labusiam"], { spice: "kunyit:0.5sdt rempah:1lembar", fat: "santan" });

add({ name: "Sup Ayam Makaroni Wortel", family: "sup", slot: "utama", stages: [2, 3], min: 35, freeze: true, items: "makaroni:20 ayam:30 wortel:15 kentang:20 bawang:1siung daunbawang:3 kaldu:200ml minyak:1sdt", steps: ["Rebus makaroni sampai sangat lunak, tiriskan.", "Tumis bawang dengan minyak sampai harum, tuang kaldu, didihkan.", "Masukkan ayam cincang, wortel, dan kentang potong dadu kecil; masak sampai empuk.", "Masukkan makaroni dan daun bawang iris halus, masak 2 menit. Cincang sesuai usia."] });
add({ name: "Sup Bola-bola Ayam Sayur", family: "sup", slot: "utama", stages: [2, 3], min: 35, freeze: true, items: "ayam:35 tapioka:1sdt wortel:15 sawi:15 bawang:1siung kaldu:200ml nasi:60 minyak:1sdt", steps: ["Haluskan daging ayam bersama bawang putih, campur tepung tapioka, aduk rata.", "Didihkan kaldu, bentuk adonan menjadi bola kecil dengan sendok, masukkan ke kaldu.", "Masak sampai bola-bola mengapung dan matang, masukkan wortel lalu sawi.", "Sajikan dengan nasi lembek; potong bola-bola kecil sesuai usia."] });
add({ name: "Sup Ikan Labu Kuning", family: "sup", slot: "utama", stages: [2, 3], min: 30, items: "kembung:35 labukuning:30 tomat:15 jahe:2 bawang:1siung daunbawang:3 kaldu:200ml nasi:60 minyak:1sdt", steps: ["Tumis bawang dan sedikit jahe memar sampai harum, tuang kaldu.", "Masukkan labu kuning potong dadu kecil, masak sampai hampir empuk.", "Masukkan ikan yang sudah dibersihkan dari duri dan tomat, masak 8 menit sampai ikan matang.", "Taburi daun bawang, sajikan dengan nasi lembek. Periksa ulang duri sebelum disuapkan."] });
add({ name: "Sup Ikan Tahu Tomat", family: "sup", slot: "utama", stages: [2, 3], min: 25, items: "nila:30 tahu:30 tomat:20 bawang:1siung daunbawang:3 kaldu:200ml nasi:60 minyak:1sdt", steps: ["Tumis bawang sampai harum, tuang kaldu dan didihkan.", "Masukkan tahu potong dadu kecil dan tomat.", "Masukkan ikan, masak sampai matang; pastikan tidak ada duri.", "Sajikan dengan nasi lembek."] });
add({ name: "Sayur Sop Daging Sapi", family: "sup", slot: "utama", stages: [2, 3], min: 50, freeze: true, items: "sapihas:30 kentang:25 wortel:15 buncis:10 kol:10 bawang:1siung pala:1 daunbawang:3 kaldu:250ml nasi:60", steps: ["Rebus daging sapi sampai empuk, potong kecil; gunakan air rebusannya sebagai kaldu.", "Tumis bawang lalu masukkan ke kaldu bersama sedikit pala.", "Masukkan kentang dan wortel, masak sampai hampir empuk, lalu buncis dan kol.", "Masukkan daging dan daun bawang, masak 3 menit. Sajikan dengan nasi lembek."] });
add({ name: "Sup Jagung Ayam Telur", family: "sup", slot: "utama", stages: [2, 3], min: 25, items: "jagung:30 ayam:25 telur:0.5butir wortel:10 maizena:1sdt bawang:1siung kaldu:200ml nasi:60", steps: ["Didihkan kaldu dengan bawang putih cincang.", "Masukkan jagung yang sudah diblender kasar, wortel, dan ayam cincang; masak 10 menit.", "Kentalkan dengan maizena yang dilarutkan sedikit air.", "Tuang kocokan telur sambil diaduk perlahan sampai matang penuh. Sajikan dengan nasi lembek."] });
add({ name: "Sayur Bening Bayam Jagung Ayam Suwir", family: "sayur-bening", slot: "utama", stages: [2, 3], min: 20, items: "bayam:20 jagung:20 ayam:30 bawang:1siung rempah:1lembar kaldu:200ml nasi:60", steps: ["Rebus ayam sampai matang, suwir halus.", "Didihkan kaldu dengan irisan bawang merah dan daun salam.", "Masukkan jagung, masak 5 menit, lalu bayam dan ayam suwir; masak sebentar sampai bayam layu.", "Sajikan dengan nasi lembek, cincang sayur sesuai usia."] });
add({ name: "Sayur Bening Oyong Udang", family: "sayur-bening", slot: "utama", stages: [2, 3], min: 20, items: "zucchini:30 udang:30 bawang:1siung kaldu:200ml nasi:60", steps: ["Kupas oyong, potong kecil.", "Didihkan kaldu dengan irisan bawang.", "Masukkan oyong dan udang cincang, masak sampai udang merah dan oyong lunak.", "Sajikan dengan nasi lembek."] });
add({ name: "Soto Ayam Bening", family: "soto", slot: "utama", stages: [2, 3], min: 40, freeze: true, items: "ayam:35 nasi:60 kol:10 kunyit:0.5sdt jahe:2 rempah:1lembar bawang:1siung daunbawang:3 kaldu:250ml minyak:1sdt", steps: ["Tumis bawang, kunyit, dan jahe sampai harum.", "Masukkan ke kaldu bersama serai dan daun salam, rebus ayam di dalamnya sampai matang.", "Angkat ayam, suwir halus; masukkan kol iris tipis ke kuah, masak sampai lunak.", "Sajikan nasi dengan ayam suwir dan kuah soto. Tanpa garam untuk di bawah 12 bulan."] });
add({ name: "Opor Ayam Labu Siam", family: "opor", slot: "utama", stages: [2, 3], min: 40, freeze: true, items: "ayampaha:35 labusiam:25 santan:60ml kunyit:0.3sdt rempah:1lembar bawang:1siung kaldu:100ml nasi:60 minyak:1sdt", steps: ["Haluskan bawang dan kunyit, tumis sampai matang dan harum bersama daun salam dan serai.", "Masukkan ayam potong kecil, aduk sampai berubah warna, tuang kaldu.", "Masukkan labu siam, masak sampai empuk, lalu tuang santan dan aduk terus agar santan tidak pecah (±5 menit).", "Sajikan dengan nasi lembek, suwir/cincang ayam sesuai usia."] });
add({ name: "Ayam Bumbu Kuning Kentang", family: "bumbu-kuning", slot: "utama", stages: [2, 3], min: 40, freeze: true, items: "ayampaha:35 kentang:30 kunyit:0.5sdt rempah:1lembar bawang:1siung kaldu:150ml minyak:1sdt nasi:50", steps: ["Haluskan bawang dan kunyit, tumis dengan daun salam dan serai sampai harum.", "Masukkan ayam dan kentang potong dadu kecil, aduk rata.", "Tuang kaldu, masak dengan api kecil sampai ayam empuk dan kuah menyusut.", "Sajikan dengan nasi lembek, cincang sesuai usia."] });
add({ name: "Ikan Kembung Bumbu Kuning", family: "bumbu-kuning", slot: "utama", stages: [2, 3], min: 30, items: "kembung:35 tomat:15 kunyit:0.5sdt rempah:1lembar bawang:1siung kaldu:150ml minyak:1sdt nasi:60", steps: ["Tumis bumbu halus (bawang, kunyit) dengan daun salam dan serai sampai harum.", "Tuang kaldu, didihkan, masukkan ikan dan tomat.", "Masak dengan api kecil 10 menit sampai ikan matang.", "Buang duri dengan teliti, suwir, sajikan dengan nasi dan kuahnya."] });
add({ name: "Pepes Ikan Nila Kemangi", family: "pepes", slot: "utama", stages: [2, 3], min: 40, items: "nila:40 tomat:15 kemangi:5lembar kunyit:0.3sdt bawang:1siung daunpisang:1lembar minyak:1sdt nasi:60", steps: ["Haluskan bawang dan kunyit, lumuri ikan nila yang sudah dibersihkan.", "Letakkan ikan di atas daun pisang bersama irisan tomat dan kemangi, beri sedikit minyak, bungkus rapat.", "Kukus 30 menit sampai ikan matang.", "Buang duri, suwir halus, sajikan dengan nasi lembek."] });
add({ name: "Pepes Tahu Ayam", family: "pepes", slot: "utama", stages: [2, 3], min: 35, items: "tahu:40 ayam:25 telur:0.5butir kemangi:3lembar bawang:1siung daunpisang:1lembar nasi:60", steps: ["Hancurkan tahu, campur dengan ayam cincang, telur, bawang halus, dan kemangi iris.", "Bungkus adonan dengan daun pisang.", "Kukus 25 menit sampai padat dan matang.", "Potong kecil, sajikan dengan nasi lembek."] });
add({ name: "Semur Daging Sapi Kentang", family: "semur", slot: "utama", stages: [2, 3], min: 60, freeze: true, items: "sapihas:35 kentang:30 tomat:15 pala:1 rempah:1lembar bawang:1siung kaldu:200ml minyak:1sdt nasi:50", steps: ["Rebus daging sampai empuk, potong kecil.", "Tumis bawang dengan sedikit pala dan kayu manis serta daun salam sampai harum.", "Masukkan daging, kentang, tomat, dan kaldu; masak dengan api kecil sampai kentang empuk dan kuah mengental.", "Tanpa kecap untuk di bawah 12 bulan. Sajikan dengan nasi lembek."] });
add({ name: "Gulai Ikan Kembung Labu Siam", family: "gulai", slot: "utama", stages: [2, 3], min: 35, items: "kembung:35 labusiam:25 santan:60ml kunyit:0.3sdt rempah:1lembar bawang:1siung jahe:2 nasi:60 minyak:1sdt", steps: ["Tumis bumbu halus (bawang, kunyit, jahe) dengan serai sampai harum.", "Tuang santan dan sedikit air, masukkan labu siam, masak sampai hampir empuk.", "Masukkan ikan, masak 10 menit sambil diaduk pelan agar santan tidak pecah.", "Buang duri, suwir, sajikan dengan nasi."] });
add({ name: "Tim Telur Ayam Cincang", family: "tim-telur", slot: "utama", stages: [2, 3], min: 25, items: "telur:1butir ayam:20 wortel:10 daunbawang:2 kaldu:80ml nasi:60", steps: ["Kocok telur dengan kaldu hangat, saring agar halus.", "Campur dengan ayam cincang matang dan wortel parut halus.", "Tuang ke mangkuk tahan panas, kukus api kecil 15 menit sampai set.", "Sajikan dengan nasi lembek."] });
add({ name: "Bola-bola Daging Kuah Tomat", family: "bola-bola", slot: "utama", stages: [2, 3], min: 35, freeze: true, items: "sapi:35 tapioka:1sdt bawang:1siung tomat:30 wortel:10 kaldu:150ml minyak:1sdt nasi:50", steps: ["Campur daging giling, bawang halus, dan tapioka; bentuk bola kecil.", "Kukus bola-bola 10 menit.", "Tumis tomat cincang dan wortel parut, tuang kaldu, masak sampai menjadi saus.", "Masukkan bola-bola, masak 5 menit. Sajikan dengan nasi, potong kecil sesuai usia."] });
add({ name: "Orak-arik Telur Brokoli", family: "orak-arik", slot: "utama", stages: [2, 3], min: 15, items: "telur:1butir brokoli:20 wortel:10 bawang:1siung minyak:1sdt nasi:60", steps: ["Kukus brokoli dan wortel sampai lunak, cincang.", "Tumis bawang dengan minyak, masukkan sayuran.", "Tuang telur kocok, aduk terus sampai matang penuh (tidak ada bagian basah).", "Sajikan dengan nasi lembek."] });
add({ name: "Tumis Udang Brokoli Jagung", family: "tumis", slot: "utama", stages: [2, 3], min: 20, items: "udang:35 brokoli:20 jagung:15 bawang:1siung maizena:0.5sdt kaldu:50ml minyak:1sdt nasi:60", steps: ["Tumis bawang sampai harum, masukkan udang cincang sampai berubah merah.", "Masukkan brokoli dan jagung, tuang kaldu, masak sampai sayur lunak.", "Kentalkan dengan maizena yang dilarutkan sedikit air.", "Sajikan dengan nasi lembek."] });
add({ name: "Tahu Kukus Isi Ayam", family: "tahu", slot: "utama", stages: [2, 3], min: 30, items: "tahu:50 ayam:25 wortel:10 daunbawang:2 bawang:1siung kaldu:50ml nasi:60", steps: ["Belah tahu dan keruk sedikit bagian tengahnya.", "Campur hasil kerukan dengan ayam cincang, wortel parut, bawang halus, dan daun bawang.", "Isikan ke tahu, kukus 20 menit.", "Siram kaldu panas, sajikan dengan nasi; potong kecil."] });
add({ name: "Kentang Tumbuk Daging Saus Tomat", family: "kentang", slot: "utama", stages: [2, 3], min: 35, freeze: true, items: "kentang:60 sapi:30 tomat:20 wortel:10 bawang:1siung mentega:1sdt", steps: ["Kukus kentang sampai empuk, tumbuk dengan mentega.", "Tumis bawang, masukkan daging giling sampai matang.", "Masukkan tomat cincang dan wortel parut, masak sampai menjadi saus kental.", "Sajikan saus daging di atas kentang tumbuk."] });
add({ name: "Ayam Kukus Jahe Kentang", family: "kukus", slot: "utama", stages: [2, 3], min: 35, items: "ayampaha:35 kentang:40 jahe:2 bawang:1siung buncis:15 minyak:1sdt", steps: ["Lumuri ayam dengan jahe parut, bawang putih halus, dan sedikit minyak.", "Tata ayam, kentang, dan buncis di piring tahan panas.", "Kukus 25 menit sampai ayam matang dan kentang empuk.", "Cincang atau suwir sesuai usia; kentang bisa dilumat."] });
add({ name: "Schotel Makaroni Ayam Keju", family: "schotel", slot: "utama", stages: [2, 3], min: 45, freeze: true, items: "makaroni:25 ayam:25 telur:0.5butir keju:10 wortel:10 mentega:1sdt", steps: ["Rebus makaroni sampai sangat lunak, tiriskan.", "Tumis ayam cincang dan wortel parut dengan mentega sampai matang.", "Campur makaroni, tumisan, telur kocok, dan keju parut; tuang ke wadah tahan panas.", "Kukus 25 menit (atau panggang 20 menit) sampai set. Potong kecil."] });
add({ name: "Bakmi Ayam Kuah Pakcoy", family: "mie", slot: "utama", stages: [2, 3], min: 25, items: "mie:25 ayam:30 sawi:20 bawang:1siung jahe:1 kaldu:200ml minyak:1sdt", steps: ["Rebus mie sampai lunak, tiriskan, potong pendek.", "Tumis bawang dan jahe, masukkan ayam cincang sampai matang.", "Tuang kaldu, masukkan pakcoy, masak sampai layu.", "Siram kuah dan ayam ke mie, sajikan hangat."] });
add({ name: "Ayam Tim Jamur", family: "kukus", slot: "utama", stages: [2, 3], min: 40, freeze: true, items: "ayampaha:35 jamur:25 jahe:1 bawang:1siung maizena:0.5sdt kaldu:80ml nasi:60 minyak:1sdt", steps: ["Potong kecil ayam dan jamur, campur dengan bawang, jahe parut, minyak, dan maizena.", "Tata di mangkuk tahan panas, tuang kaldu.", "Kukus 30 menit sampai ayam empuk.", "Sajikan di atas nasi lembek."] });
add({ name: "Tim Ikan Dori Tahu Brokoli", family: "kukus", slot: "utama", stages: [2, 3], min: 25, items: "dori:35 tahu:25 brokoli:15 jahe:1 bawang:1siung minyak:1sdt nasi:60", steps: ["Lumuri ikan dengan jahe parut dan bawang putih halus.", "Tata ikan, tahu potong dadu, dan brokoli di piring tahan panas, beri sedikit minyak.", "Kukus 15 menit sampai matang.", "Suwir ikan, sajikan dengan nasi lembek."] });

// snack tahap 2–3 (finger food & selingan)
add({ name: "Nugget Ayam Wortel Kukus", family: "nugget", slot: "snack", stages: [2, 3], min: 40, freeze: true, items: "ayam:40 wortel:15 telur:0.3butir tapioka:1sdm bawang:1siung", tags: ["finger-food"], steps: ["Haluskan ayam bersama bawang, campur wortel parut, telur, dan tapioka.", "Ratakan di loyang kecil yang dioles minyak, kukus 25 menit.", "Dinginkan, potong stik seukuran jari.", "Boleh dipanggang sebentar agar permukaan kering (bukan keras)."] });
add({ name: "Nugget Ikan Bayam Kukus", family: "nugget", slot: "snack", stages: [2, 3], min: 40, freeze: true, items: "dori:40 bayam:15 tapioka:1sdm bawang:1siung", tags: ["finger-food"], steps: ["Haluskan ikan dori dengan bawang, campur bayam cincang dan tapioka.", "Ratakan di loyang kecil, kukus 20 menit.", "Dinginkan, potong stik."] });
add({ name: "Perkedel Kentang Ayam Kukus", family: "perkedel", slot: "snack", stages: [2, 3], min: 35, freeze: true, items: "kentang:50 ayam:20 daunbawang:2 bawang:1siung telur:0.3butir", tags: ["finger-food"], steps: ["Kukus kentang sampai empuk, haluskan.", "Campur dengan ayam cincang matang, bawang goreng halus, daun bawang, dan sedikit kocokan telur.", "Bentuk bulat pipih, kukus 10 menit (atau panggang sebentar)."] });
add({ name: "Perkedel Kentang Daging", family: "perkedel", slot: "snack", stages: [2, 3], min: 35, freeze: true, items: "kentang:50 sapi:20 bawang:1siung pala:0.5", tags: ["finger-food"], steps: ["Kukus kentang, haluskan.", "Tumis daging giling dengan bawang sampai matang.", "Campur rata dengan kentang dan sejumput pala, bentuk pipih, kukus 10 menit."] });
add({ name: "Bola Nasi Ayam Wortel", family: "bola-nasi", slot: "snack", stages: [2, 3], min: 20, items: "nasi:50 ayam:20 wortel:10 minyak:1sdt", tags: ["finger-food"], steps: ["Rebus ayam dan wortel, cincang halus.", "Campur dengan nasi hangat dan sedikit minyak.", "Kepal kecil seukuran genggaman bayi."] });
add({ name: "Bola Nasi Salmon Keju", family: "bola-nasi", slot: "snack", stages: [2, 3], min: 20, items: "nasi:50 salmon:20 keju:5", tags: ["finger-food"], steps: ["Kukus salmon, suwir halus tanpa duri.", "Campur dengan nasi hangat dan keju parut.", "Kepal kecil."] });
stikKukus("wortel");
stikKukus("brokoli");
stikKukus("labukuning");
stikKukus("buncis");
add({ name: "Wedges Kentang Panggang", family: "wedges", slot: "snack", stages: [2, 3], min: 35, items: "kentang:60 minyak:1sdt", tags: ["finger-food"], steps: ["Potong kentang memanjang, kukus 10 menit.", "Olesi minyak, panggang 15 menit sampai empuk (bukan renyah keras)."] });
add({ name: "Wedges Ubi Panggang", family: "wedges", slot: "snack", stages: [2, 3], min: 35, items: "ubi:60 minyak:1sdt", tags: ["finger-food"], steps: ["Potong ubi memanjang, kukus 10 menit.", "Olesi minyak, panggang 15 menit sampai empuk."] });
add({ name: "Pancake Pisang", family: "pancake", slot: "snack", stages: [2, 3], min: 15, freeze: true, items: "pisang:40 telur:1butir terigu:1sdm mentega:1sdt", tags: ["finger-food", "padat-energi"], steps: ["Lumatkan pisang, kocok bersama telur dan terigu.", "Tuang satu sendok makan adonan ke teflon yang dioles mentega.", "Masak api kecil sampai matang di kedua sisi, potong memanjang."] });
add({ name: "Pancake Oat Pisang", family: "pancake", slot: "snack", stages: [2, 3], min: 15, freeze: true, items: "pisang:40 telur:1butir oat:2sdm mentega:1sdt", tags: ["finger-food", "padat-energi"], steps: ["Blender oat sampai menjadi tepung.", "Campur dengan pisang lumat dan telur.", "Masak sesendok demi sesendok di teflon bermentega sampai matang."] });
add({ name: "Pancake Labu Kuning", family: "pancake", slot: "snack", stages: [2, 3], min: 20, freeze: true, items: "labukuning:40 telur:1butir terigu:1sdm mentega:1sdt", tags: ["finger-food", "padat-energi"], steps: ["Kukus labu kuning, haluskan.", "Campur dengan telur dan terigu.", "Masak di teflon bermentega dengan api kecil, potong stik."] });
add({ name: "Muffin Kukus Pisang", family: "muffin", slot: "snack", stages: [2, 3], min: 30, freeze: true, items: "terigu:2sdm telur:1butir pisang:40 mentega:1sdt", tags: ["finger-food"], steps: ["Lumatkan pisang, campur telur dan mentega leleh.", "Masukkan terigu, aduk rata.", "Tuang ke cetakan kecil, kukus 20 menit sampai matang (tusuk lidi tidak lengket)."] });
add({ name: "Muffin Kukus Wortel Keju", family: "muffin", slot: "snack", stages: [2, 3], min: 30, freeze: true, items: "terigu:2sdm telur:1butir wortel:20 keju:10 mentega:1sdt", tags: ["finger-food"], steps: ["Campur telur, mentega leleh, wortel parut halus, dan keju.", "Masukkan terigu, aduk rata.", "Kukus 20 menit di cetakan kecil."] });
add({ name: "Puding Labu Kuning Santan", family: "puding", slot: "snack", stages: [2, 3], min: 25, items: "labukuning:40 santan:60ml agar:0.5sdt", steps: ["Kukus labu, blender bersama santan.", "Masak dengan agar-agar bubuk sambil diaduk sampai mendidih.", "Tuang ke cetakan, dinginkan sampai set. Tanpa gula untuk di bawah 12 bulan."] });
add({ name: "Puding Pisang Santan", family: "puding", slot: "snack", stages: [2, 3], min: 25, items: "pisang:40 santan:60ml agar:0.5sdt", steps: ["Blender pisang dengan santan.", "Masak bersama agar-agar sampai mendidih sambil diaduk.", "Tuang ke cetakan, dinginkan."] });
add({ name: "Kolak Pisang Ubi Tanpa Gula", family: "kolak", slot: "snack", stages: [2, 3], min: 25, items: "pisang:30 ubi:30 santan:60ml rempah:1lembar", tags: ["padat-energi"], steps: ["Rebus ubi potong dadu kecil dengan sedikit air dan daun pandan sampai empuk.", "Masukkan pisang dan santan, masak sambil diaduk 5 menit.", "Lumatkan kasar sesuai usia; manis alami dari pisang dan ubi."] });
add({ name: "Omelet Mini Sayur", family: "omelet", slot: "snack", stages: [2, 3], min: 15, items: "telur:1butir wortel:10 bayam:10 minyak:1sdt", tags: ["finger-food"], steps: ["Kocok telur dengan wortel parut dan bayam cincang.", "Masak di teflon api kecil sampai matang penuh di kedua sisi.", "Potong stik."] });
add({ name: "Martabak Tahu Mini", family: "tahu", slot: "snack", stages: [2, 3], min: 20, items: "tahu:40 telur:0.5butir daunbawang:2 wortel:10 minyak:1sdt", tags: ["finger-food"], steps: ["Hancurkan tahu, campur telur, wortel parut, dan daun bawang iris.", "Panggang sesendok-sesendok di teflon berminyak sampai matang kedua sisi."] });
add({ name: "Tahu Kukus Telur Puyuh", family: "tahu", slot: "snack", stages: [2, 3], min: 20, items: "tahu:40 telurpuyuh:2butir", tags: ["finger-food"], steps: ["Potong tahu tebal, buat cekungan kecil di atasnya.", "Pecahkan telur puyuh di cekungan.", "Kukus 12 menit sampai telur matang penuh. Potong kecil."] });
add({ name: "Roti Panggang Alpukat", family: "roti", slot: "snack", stages: [2, 3], min: 10, items: "roti:1lembar alpukat:30", tags: ["finger-food"], steps: ["Panggang roti sebentar, buang pinggirannya.", "Oles alpukat lumat, potong memanjang."] });
add({ name: "Roti Panggang Telur", family: "roti", slot: "snack", stages: [2, 3], min: 10, items: "roti:1lembar telur:0.5butir mentega:1sdt", tags: ["finger-food"], steps: ["Celup roti ke kocokan telur.", "Panggang di teflon bermentega sampai telur matang, potong stik."] });
add({ name: "Dimsum Ayam Wortel", family: "dimsum", slot: "snack", stages: [2, 3], min: 35, freeze: true, items: "ayam:40 wortel:10 tapioka:1sdm telur:0.3butir bawang:1siung", tags: ["finger-food"], steps: ["Haluskan ayam dengan bawang, campur wortel parut, telur, dan tapioka.", "Bentuk bulatan kecil, tata di wadah kukusan beralas daun/kertas roti.", "Kukus 20 menit sampai matang."] });
add({ name: "Bakwan Sayur Kukus", family: "bakwan", slot: "snack", stages: [2, 3], min: 25, items: "terigu:2sdm wortel:15 kol:15 jagung:10 telur:0.3butir bawang:1siung", tags: ["finger-food"], steps: ["Iris halus wortel dan kol, campur jagung.", "Campur dengan terigu, telur, bawang halus, dan sedikit air.", "Tuang ke cetakan kecil, kukus 15 menit."] });
add({ name: "Pisang Kukus", family: "buah-potong", slot: "snack", stages: [2, 3], min: 15, items: "pisang:60", tags: ["finger-food"], steps: ["Kukus pisang dengan kulitnya 10 menit.", "Kupas, potong memanjang."] });
add({ name: "Ubi Ungu Kukus", family: "umbi", slot: "snack", stages: [2, 3], min: 20, items: "ubiungu:60", tags: ["finger-food"], steps: ["Kukus ubi ungu sampai empuk (±20 menit).", "Kupas, potong stik."] });
add({ name: "Singkong Kukus Kelapa", family: "umbi", slot: "snack", stages: [2, 3], min: 35, items: "singkong:50 santan:1sdm", tags: ["finger-food"], steps: ["Kukus singkong sampai benar-benar empuk (±30 menit), buang serat tengahnya.", "Potong stik, siram sedikit santan matang."] });
buahPotong("pepaya");
buahPotong("melon");
buahPotong("alpukat");
buahPotong("mangga");
buahPotong("naga");
buahPotong("pir");

// ═══════════════ TAHAP 3 (12–24 bulan): makanan keluarga ═══════════════
const fam = (d: Omit<Def, "slot" | "stages" | "family"> & { family: string; stages?: Stage[] }) => add({ slot: "utama", stages: d.stages ?? [3], ...d } as Def);
fam({ name: "Nasi Ayam Bumbu Kuning Tumis Buncis", family: "bumbu-kuning", min: 40, freeze: true, items: "nasi:90 ayampaha:45 buncis:25 kunyit:0.5sdt rempah:1lembar bawang:2siung kaldu:100ml minyak:2sdt", steps: ["Masak ayam dengan bumbu kuning (bawang, kunyit, salam, serai) dan kaldu sampai empuk dan bumbu meresap.", "Tumis buncis iris tipis dengan bawang putih sampai lunak.", "Sajikan nasi dengan ayam suwir dan tumis buncis."] });
fam({ name: "Nasi Goreng Mentega Ayam Wortel", family: "nasi-goreng", min: 20, items: "nasi:90 ayam:35 wortel:15 telur:0.5butir bawang:2siung daunbawang:3 mentega:2sdt", steps: ["Tumis bawang dengan mentega sampai harum.", "Masukkan ayam cincang dan wortel cincang, masak sampai matang.", "Masukkan telur, orak-arik sampai matang, lalu nasi; aduk rata.", "Taburi daun bawang. Tanpa kecap/garam atau sangat sedikit untuk 1 tahun ke atas."] });
fam({ name: "Nasi Kuning Ayam Suwir Telur Dadar", family: "nasi-kuning", min: 45, items: "beras:45 santan:60ml kunyit:0.5sdt rempah:1lembar ayam:35 telur:0.5butir minyak:1sdt", steps: ["Masak beras dengan santan, air, kunyit, daun salam, dan serai seperti menanak nasi.", "Rebus ayam, suwir halus, tumis sebentar dengan bawang.", "Buat telur dadar tipis matang penuh, iris kecil.", "Sajikan nasi kuning dengan ayam suwir dan telur."] });
fam({ name: "Soto Ayam Telur Rebus", family: "soto", min: 45, freeze: false, items: "nasi:90 ayam:40 telur:0.5butir kol:15 kunyit:0.5sdt jahe:2 rempah:1lembar bawang:2siung daunbawang:3 kaldu:250ml minyak:1sdt", steps: ["Tumis bumbu halus (bawang, kunyit, jahe) dengan serai dan daun salam.", "Rebus ayam di kaldu bersama bumbu sampai matang, suwir.", "Masukkan kol iris ke kuah, masak sampai lunak.", "Sajikan nasi dengan ayam suwir, potongan telur rebus, dan kuah."] });
fam({ name: "Sop Daging Sapi Sayur Lengkap", family: "sup", min: 60, freeze: true, items: "nasi:90 sapihas:40 kentang:30 wortel:20 buncis:15 kol:15 tomat:15 bawang:2siung pala:1 daunbawang:3 kaldu:300ml", steps: ["Rebus daging sampai empuk, potong dadu kecil; pakai air rebusannya sebagai kaldu.", "Masukkan tumisan bawang dan sedikit pala ke kaldu.", "Masukkan kentang dan wortel, lalu buncis, kol, dan tomat.", "Masukkan daging dan daun bawang, sajikan dengan nasi."] });
fam({ name: "Rendang Daging Lembut", family: "rendang", min: 120, freeze: true, items: "nasi:90 sapihas:45 santan:100ml kunyit:0.5sdt jahe:2 rempah:1lembar bawang:2siung", steps: ["Haluskan bawang, jahe, kunyit; tumis dengan serai, daun salam, dan lengkuas sampai harum.", "Masukkan daging potong kecil, aduk, lalu tuang santan.", "Masak api kecil sambil sesekali diaduk 1,5–2 jam sampai daging sangat empuk dan kuah mengental (tanpa cabai).", "Suwir halus, sajikan dengan nasi."] });
fam({ name: "Semur Daging Kecap Kentang", family: "semur", min: 60, freeze: true, items: "nasi:90 sapihas:40 kentang:35 tomat:15 kecap:1sdt pala:1 bawang:2siung kaldu:200ml minyak:1sdt", steps: ["Rebus daging sampai empuk, potong kecil.", "Tumis bawang dengan pala dan kayu manis, masukkan daging, kentang, tomat, kaldu.", "Tambahkan sedikit kecap (hanya untuk 1 tahun ke atas), masak sampai kuah mengental.", "Sajikan dengan nasi."] });
fam({ name: "Ikan Dori Panggang Tepung Wortel Kukus", family: "ikan", min: 30, items: "nasi:90 dori:45 terigu:1sdm telur:0.3butir wortel:30 mentega:1sdt", steps: ["Potong ikan dori seukuran jari, celup ke telur lalu balur tipis terigu.", "Panggang di teflon bermentega atau oven sampai matang dan kecokelatan.", "Kukus wortel sampai lunak.", "Sajikan dengan nasi."] });
fam({ name: "Pepes Ikan Kembung Tahu", family: "pepes", min: 45, items: "nasi:90 kembung:40 tahu:30 tomat:15 kemangi:5lembar kunyit:0.3sdt bawang:2siung daunpisang:1lembar minyak:1sdt", steps: ["Lumuri ikan dan tahu dengan bumbu halus (bawang, kunyit).", "Bungkus dengan daun pisang bersama tomat dan kemangi.", "Kukus 30 menit, lalu buang duri ikan dengan teliti.", "Sajikan dengan nasi."] });
fam({ name: "Garang Asem Ayam", family: "garang-asem", min: 45, items: "nasi:90 ayampaha:45 tomat:20 asam:2 santan:60ml bawang:2siung rempah:1lembar daunpisang:1lembar", steps: ["Campur ayam dengan bawang iris, tomat, belimbing wuluh/asam sedikit, daun salam, dan santan.", "Bungkus dengan daun pisang.", "Kukus 40 menit sampai ayam empuk (tanpa cabai).", "Suwir, sajikan dengan nasi."] });
fam({ name: "Ayam Kecap Wortel Buncis", family: "ayam-kecap", min: 35, items: "nasi:90 ayampaha:45 wortel:20 buncis:15 kecap:1sdt bawang:2siung kaldu:80ml minyak:1sdt", steps: ["Tumis bawang sampai harum, masukkan ayam potong kecil.", "Masukkan wortel, buncis, kaldu, dan sedikit kecap.", "Masak sampai ayam empuk dan kuah menyusut. Sajikan dengan nasi."] });
fam({ name: "Ayam Panggang Kunyit Tumis Kangkung", family: "ayam-panggang", min: 40, items: "nasi:90 ayampaha:45 kunyit:0.5sdt bawang:2siung kangkung:30 minyak:2sdt", steps: ["Lumuri ayam dengan bawang dan kunyit halus, diamkan 15 menit.", "Panggang di teflon/oven sampai matang, suwir.", "Tumis daun kangkung muda dengan bawang putih sampai layu, cincang.", "Sajikan dengan nasi."] });
fam({ name: "Sayur Lodeh Labu Siam Tempe", family: "lodeh", min: 35, items: "nasi:90 labusiam:30 kacangpanjang:15 tempe:35 santan:80ml bawang:2siung rempah:1lembar kaldu:100ml minyak:1sdt", steps: ["Tumis bawang dengan daun salam dan lengkuas sampai harum, tuang kaldu.", "Masukkan labu siam dan kacang panjang, masak sampai empuk.", "Tuang santan, aduk terus 5 menit.", "Panggang/kukus tempe, potong dadu; sajikan dengan nasi dan sayur lodeh."] });
fam({ name: "Bakso Sapi Kuah Bihun", family: "bakso", min: 40, freeze: true, items: "sapi:40 tapioka:1sdm bihun:20 sawi:20 bawang:2siung daunbawang:3 kaldu:250ml", steps: ["Haluskan daging giling dengan bawang putih, campur tapioka dan sedikit air es, uleni.", "Bentuk bola kecil, rebus di air mendidih sampai mengapung.", "Seduh bihun dengan air panas, potong pendek.", "Sajikan bakso, bihun, dan sawi dengan kuah kaldu; potong bakso kecil-kecil."] });
fam({ name: "Bihun Goreng Ayam Sayur", family: "bihun", min: 25, items: "bihun:30 ayam:35 wortel:15 kol:15 telur:0.5butir bawang:2siung minyak:2sdt", steps: ["Seduh bihun, tiriskan, potong pendek.", "Tumis bawang, masukkan ayam dan telur, aduk sampai matang.", "Masukkan wortel dan kol iris halus, lalu bihun; aduk rata dengan sedikit kaldu."] });
fam({ name: "Mie Ayam Sayur", family: "mie", min: 30, items: "mie:35 ayam:40 sawi:20 jamur:15 bawang:2siung jahe:1 kaldu:200ml minyak:2sdt", steps: ["Masak ayam dan jamur potong dadu dengan bawang dan jahe sampai matang (topping).", "Rebus mie dan sawi, tiriskan.", "Sajikan mie dengan topping ayam jamur dan kuah kaldu."] });
fam({ name: "Capcay Ayam Udang", family: "capcay", min: 25, items: "nasi:90 ayam:20 udang:20 wortel:15 brokoli:15 kembangkol:15 sawi:15 maizena:1sdt bawang:2siung kaldu:100ml minyak:1sdt", steps: ["Tumis bawang, masukkan ayam dan udang cincang sampai matang.", "Masukkan wortel, kembang kol, brokoli, lalu sawi; tuang kaldu.", "Kentalkan dengan maizena, sajikan dengan nasi."] });
fam({ name: "Ikan Nila Saus Tomat Nanas", family: "ikan", min: 30, items: "nasi:90 nila:45 tomat:25 nanas:15 bawang:2siung maizena:1sdt kaldu:80ml minyak:1sdt", steps: ["Kukus ikan nila, buang duri, potong kecil.", "Tumis bawang, masukkan tomat dan nanas cincang, tuang kaldu, masak sampai menjadi saus.", "Kentalkan dengan maizena, siram ke ikan. Sajikan dengan nasi."] });
fam({ name: "Gulai Ayam Kentang", family: "gulai", min: 50, freeze: true, items: "nasi:90 ayampaha:45 kentang:30 santan:80ml kunyit:0.5sdt jahe:2 rempah:1lembar bawang:2siung minyak:1sdt", steps: ["Tumis bumbu halus (bawang, kunyit, jahe) dengan serai dan daun salam.", "Masukkan ayam dan kentang, tuang santan dan sedikit air.", "Masak api kecil sampai ayam empuk dan kuah kental, aduk sesekali. Sajikan dengan nasi."] });
fam({ name: "Siomay Ayam Kukus Kentang", family: "dimsum", min: 40, freeze: true, items: "ayam:45 tapioka:1sdm telur:0.3butir kentang:40 kol:15 bawang:1siung", steps: ["Haluskan ayam dengan bawang, campur telur dan tapioka.", "Bentuk bulatan, kukus bersama kentang dan kol 25 menit.", "Potong kecil; untuk saus, gunakan kuah kaldu atau saus tomat rumahan (tanpa kacang)."] });
fam({ name: "Rolade Ayam Telur Kukus", family: "rolade", min: 40, freeze: true, items: "ayam:45 telur:1butir wortel:10 tapioka:1sdm bawang:1siung nasi:90", steps: ["Buat dadar tipis dari sebagian telur.", "Haluskan ayam dengan bawang, campur sisa telur, wortel parut, dan tapioka.", "Ratakan adonan di atas dadar, gulung, bungkus plastik tahan panas/daun.", "Kukus 30 menit, potong-potong; sajikan dengan nasi."] });
fam({ name: "Spageti Bolognese Daging", family: "pasta", min: 30, freeze: true, items: "spageti:35 sapi:40 tomat:40 wortel:15 bawangbombay:10 bawang:1siung minyak:2sdt", steps: ["Rebus spageti sampai lunak, potong pendek.", "Tumis bawang bombay dan bawang putih, masukkan daging giling sampai matang.", "Masukkan tomat cincang dan wortel parut, masak sampai menjadi saus kental.", "Aduk dengan spageti."] });
fam({ name: "Telur Dadar Sayur Sup Tomat", family: "telur", min: 20, items: "nasi:90 telur:1butir wortel:15 daunbawang:3 tomat:40 bawang:1siung kaldu:150ml minyak:1sdt", steps: ["Kocok telur dengan wortel parut dan daun bawang, dadar sampai matang penuh.", "Rebus tomat dengan kaldu dan bawang menjadi sup ringan.", "Sajikan nasi dengan potongan telur dadar dan sup tomat."] });
fam({ name: "Ikan Kembung Kuah Kuning Kemangi", family: "ikan", min: 30, items: "nasi:90 kembung:45 tomat:15 kemangi:5lembar kunyit:0.5sdt jahe:2 asam:1 bawang:2siung kaldu:200ml", steps: ["Didihkan kaldu dengan bumbu halus (bawang, kunyit, jahe) dan sedikit asam.", "Masukkan ikan dan tomat, masak 10 menit.", "Masukkan kemangi, angkat. Buang duri, sajikan dengan nasi."] });
fam({ name: "Udang Saus Mentega Brokoli", family: "udang", min: 20, items: "nasi:90 udang:45 brokoli:25 bawangbombay:10 bawang:1siung mentega:2sdt", steps: ["Tumis bawang bombay dan bawang putih dengan mentega.", "Masukkan udang, masak sampai merah, lalu brokoli dan sedikit air.", "Masak sampai brokoli lunak, sajikan dengan nasi; potong udang kecil."] });
fam({ name: "Tumis Tahu Tempe Kacang Panjang", family: "tumis", min: 25, items: "nasi:90 tahu:30 tempe:30 kacangpanjang:25 tomat:10 bawang:2siung minyak:2sdt", steps: ["Potong dadu tahu dan tempe, kukus 10 menit.", "Tumis bawang dan tomat, masukkan kacang panjang iris dan sedikit air.", "Masukkan tahu dan tempe, aduk sampai bumbu rata. Sajikan dengan nasi."] });
fam({ name: "Sop Ayam Kampung Makaroni", family: "sup", min: 40, freeze: true, items: "makaroni:30 ayampaha:40 wortel:20 kentang:25 buncis:15 bawang:2siung pala:1 daunbawang:3 kaldu:300ml", steps: ["Rebus makaroni sampai lunak.", "Rebus ayam di kaldu dengan bawang dan pala sampai empuk, potong kecil.", "Masukkan kentang, wortel, buncis; masak sampai empuk.", "Masukkan makaroni dan daun bawang, sajikan."] });
fam({ name: "Nasi Tim Ayam Jamur Kecap", family: "nasi-tim", min: 45, freeze: true, items: "beras:45 ayampaha:45 jamur:25 kecap:1sdt jahe:1 bawang:2siung kaldu:250ml minyak:1sdt", steps: ["Tumis bawang dan jahe, masukkan ayam dan jamur, tambahkan sedikit kecap.", "Masukkan beras dan kaldu ke mangkuk tahan panas, letakkan tumisan di atasnya.", "Tim 40 menit sampai nasi lembut."] });
fam({ name: "Ayam Goreng Lengkuas Sayur Bening", family: "ayam", min: 45, items: "nasi:90 ayampaha:45 rempah:1lembar kunyit:0.3sdt bawang:2siung bayam:20 jagung:20 minyak:2sdt kaldu:200ml", steps: ["Ungkep ayam dengan bumbu halus, lengkuas parut, kunyit, dan daun salam sampai empuk.", "Goreng sebentar dengan sedikit minyak atau panggang sampai kecokelatan; suwir.", "Buat sayur bening bayam jagung dengan kaldu dan bawang.", "Sajikan bersama nasi."] });
fam({ name: "Martabak Telur Daging Kukus", family: "telur", stages: [3], min: 30, items: "nasi:90 telur:1butir sapi:30 daunbawang:3 bawangbombay:10 minyak:1sdt", steps: ["Tumis bawang bombay dan daging sampai matang.", "Kocok telur dengan daun bawang, campur dengan daging.", "Tuang ke wadah, kukus 15 menit atau dadar tebal sampai matang. Sajikan dengan nasi."] });
fam({ name: "Brokoli Ayam Saus Keju Kentang", family: "ayam", min: 35, items: "kentang:70 ayam:40 brokoli:25 keju:10 susu:60ml maizena:1sdt mentega:1sdt", steps: ["Kukus kentang dan brokoli, potong kecil.", "Tumis ayam cincang dengan mentega sampai matang.", "Masak susu, keju, dan maizena sampai menjadi saus kental.", "Siram ke ayam, kentang, dan brokoli."] });

export const RECIPES: Recipe[] = R;
export const RECIPE_MAP: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

const F = { 1: 1, 2: 1.3, 3: 1.6 } as const;
/** Faktor porsi dari tahap dasar resep ke tahap si kecil. */
export function portionFactor(stage: Stage, base: Stage = 1) {
  return F[stage] / F[base];
}
export function scaleQty(qty: number, stage: Stage, base: Stage = 1) {
  const v = qty * portionFactor(stage, base);
  return v >= 10 ? Math.round(v / 5) * 5 : Math.round(v * 2) / 2;
}

export function ingredientPhoto(i: Ingredient) {
  return (i.key && ING[i.key]?.photo) || "";
}

export const TEXTURE_NOTE: Record<1 | 2 | 3, string> = {
  1: "Saring atau blender hingga kental (tidak encer), lalu bertahap menjadi lumat kasar. Tahan di sendok saat dimiringkan.",
  2: "Cincang halus hingga kasar. Mulai beri finger food lunak yang bisa dilumat dengan jari.",
  3: "Makanan keluarga yang dipotong kecil (±1 cm) dan lunak dikunyah.",
};

export const FAMILY_LABEL: Record<string, string> = {
  bubur: "Bubur",
  "nasi-tim": "Nasi tim",
  sup: "Sup",
  "sayur-bening": "Sayur bening",
  "bumbu-kuning": "Bumbu kuning",
  opor: "Opor",
  pepes: "Pepes kukus",
  "bola-bola": "Bola-bola",
  semur: "Semur",
  gulai: "Gulai",
  tumis: "Tumisan",
  "orak-arik": "Orak-arik",
  "nasi-goreng": "Nasi goreng",
  "nasi-kuning": "Nasi kuning",
  mie: "Mie",
  bihun: "Bihun",
  pasta: "Pasta",
  schotel: "Schotel",
  soto: "Soto",
  rendang: "Rendang",
  lodeh: "Sayur lodeh",
  bakso: "Bakso",
  capcay: "Capcay",
  "garang-asem": "Garang asem",
  "ayam-kecap": "Ayam kecap",
  "ayam-panggang": "Ayam panggang",
  ayam: "Lauk ayam",
  ikan: "Lauk ikan",
  udang: "Lauk udang",
  telur: "Lauk telur",
  tahu: "Olahan tahu",
  rolade: "Rolade",
  dimsum: "Dimsum",
  kukus: "Kukusan",
  kentang: "Kentang",
  "tim-telur": "Tim telur",
  "pure-buah": "Pure buah",
  "pure-umbi": "Pure umbi",
  yogurt: "Yogurt",
  sumsum: "Bubur sumsum",
  "kacang-hijau": "Bubur kacang hijau",
  nugget: "Nugget",
  perkedel: "Perkedel",
  "bola-nasi": "Bola nasi",
  "stik-sayur": "Finger food",
  wedges: "Finger food",
  "buah-potong": "Buah",
  umbi: "Umbi kukus",
  pancake: "Pancake",
  muffin: "Muffin",
  puding: "Puding",
  kolak: "Kolak",
  omelet: "Omelet",
  roti: "Roti",
  bakwan: "Bakwan",
};
