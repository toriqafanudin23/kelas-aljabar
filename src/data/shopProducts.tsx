import { ClipboardList, FileText, Pencil, Presentation } from "lucide-react";

export const ORDER_EMAIL = "pesan.math1729@gmail.com";
export const BANK_NAME = "BNI";
export const BANK_ACCOUNT = "0707704528";
export const BRI_ACCOUNT = "300601027906539";
export const SHOPEEPAY_NUMBER = "082122214133";
export const ACCOUNT_HOLDER = "Thoriq Afanudin";
export const PHONE_WA = "088226179468";
export const WHATSAPP_LINK = `https://wa.me/62${PHONE_WA.replace(/^0/, "")}`;
const PREVIEW_BASE_URL =
  "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/preview";
export const PAYMENT_METHODS = [
  { name: BANK_NAME, account: BANK_ACCOUNT },
  { name: "BRI", account: BRI_ACCOUNT },
  { name: "ShopeePay", account: SHOPEEPAY_NUMBER },
];

export function buildPreviewRequestEmailBody(
  productName: string,
  additionalDetails: string[] = [],
) {
  const details = additionalDetails.length
    ? `\n${additionalDetails.join("\n")}\n`
    : "";

  return `Assalamualaikum / Selamat pagi,

Saya ingin meminta preview untuk produk berikut:
${productName}${details}
Mohon kirimkan preview ke email saya. Saya akan meninjau terlebih dahulu. Jika preview sesuai, saya akan melanjutkan pembayaran setelah menerima konfirmasi dari admin. Mohon kirim file asli setelah pembayaran terkonfirmasi.

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Terima kasih.`;
}

export function buildOrderEmailBody(productName: string) {
  return `Assalamualaikum / Selamat pagi,

Saya ingin memesan produk berikut:
${productName}

Saya melampirkan bukti pembayaran pada email ini. Mohon konfirmasi pesanan dan kirimkan file produk setelah pembayaran diterima.

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Terima kasih.`;
}

export const PACKAGES = [
  {
    id: "paket-kelas-10",
    grade: "Kelas X",
    gradeLabel: "FASE E",
    title: "Paket Soal Kelas 10",
    previewUrl: `${PREVIEW_BASE_URL}/preview_soal_kelas_10.pdf`,
    price: "Rp20.000",
    originalPrice: "Rp20.000",
    promoPrice: "Rp5.000",
    desc: "Paket latihan soal beserta kunci jawaban & pembahasan lengkap untuk 8 materi Kelas X.",
    items: [
      "Eksponensial dan Logaritma",
      "Barisan dan Deret",
      "Vektor",
      "Perbandingan Trigonometri",
      "Persamaan dan Pertidaksamaan Linear",
      "Fungsi Kuadrat",
      "Statistika",
      "Teori Peluang",
    ],
    formats: [".pdf", ".tex"],
    emailSubject: "Pemesanan Paket Soal Kelas 10 — Math 1729",
    emailBody: buildOrderEmailBody(
      "Paket Soal Kelas 10 — Rp5.000 (harga normal Rp20.000)",
    ),
  },
  {
    id: "paket-kelas-11",
    grade: "Kelas XI",
    gradeLabel: "FASE F",
    title: "Paket Soal Kelas 11",
    previewUrl: `${PREVIEW_BASE_URL}/preview_soal_kelas_11.pdf`,
    price: "Rp15.000",
    originalPrice: "Rp15.000",
    promoPrice: "Rp5.000",
    desc: "Paket latihan soal beserta kunci jawaban & pembahasan lengkap untuk 6 materi Kelas XI.",
    items: [
      "Matriks",
      "Komposisi Fungsi dan Invers",
      "Lingkaran",
      "Bilangan Kompleks",
      "Polinomial",
      "Transformasi Geometri",
    ],
    formats: [".pdf", ".tex"],
    emailSubject: "Pemesanan Paket Soal Kelas 11 — Math 1729",
    emailBody: buildOrderEmailBody(
      "Paket Soal Kelas 11 — Rp5.000 (harga normal Rp15.000)",
    ),
  },
  {
    id: "paket-kelas-12",
    grade: "Kelas XII",
    gradeLabel: "FASE F LANJUT",
    title: "Paket Soal Kelas 12",
    previewUrl: `${PREVIEW_BASE_URL}/preview_soal_kelas_12.pdf`,
    price: "Rp20.000",
    originalPrice: "Rp20.000",
    promoPrice: "Rp5.000",
    desc: "Paket latihan soal beserta kunci jawaban & pembahasan lengkap untuk 8 materi Kelas XII.",
    items: [
      "Fungsi dan Pemodelan",
      "Transformasi Fungsi",
      "Irisan Kerucut",
      "Kombinatorika",
      "Analisis Data dan Peluang",
      "Limit",
      "Turunan Fungsi",
      "Integral",
    ],
    formats: [".pdf", ".tex"],
    emailSubject: "Pemesanan Paket Soal Kelas 12 — Math 1729",
    emailBody: buildOrderEmailBody(
      "Paket Soal Kelas 12 — Rp5.000 (harga normal Rp20.000)",
    ),
  },
];

export const SLIDE_PACKAGES = PACKAGES.map((pkg) => ({
  ...pkg,
  id: `slide-${pkg.id}`,
  title: `Paket Slide Presentasi ${pkg.grade}`,
  previewUrl: `${PREVIEW_BASE_URL}/preview_slide_${pkg.id.replace("paket-kelas-", "")}.pdf`,
  desc: `Paket slide presentasi untuk seluruh ${pkg.items.length} materi ${pkg.grade}.`,
  emailSubject: `Pemesanan Paket Slide Presentasi ${pkg.grade} — Math 1729`,
  emailBody: buildOrderEmailBody(
    `Paket Slide Presentasi ${pkg.grade} — ${pkg.price}`,
  ),
}));

const TKA_BENEFITS = [
  "4 paket soal TKA",
  "30 soal per paket (total 120 soal)",
  "Bentuk soal: Pilihan ganda, multiple choice, benar atau salah",
];

export const TKA_PACKAGES = (["SMP", "SMA"] as const).map((grade) => ({
  id: `tka-${grade.toLowerCase()}`,
  grade,
  title: `Paket Latihan TKA ${grade}`,
  previewUrl: `${PREVIEW_BASE_URL}/preview_soal_TKA_${grade}.pdf`,
  originalPrice: "Rp20.000",
  price: "Rp5.000",
  desc: `Empat paket latihan TKA untuk membantu persiapan siswa ${grade}.`,
  benefits: TKA_BENEFITS,
  emailSubject: `Pemesanan Paket Latihan TKA ${grade} — Math 1729`,
  emailBody: buildOrderEmailBody(
    `Paket Latihan TKA ${grade} — Rp5.000 (harga normal Rp20.000, diskon 75%)`,
  ),
}));

export const MODUL_AJAR_PEMBELAJARAN_MENDALAM = {
  id: "modul-ajar-pembelajaran-mendalam",
  title: "Modul Ajar Pembelajaran Mendalam",
  gradeLabel: "PRODUK BARU",
  grade: "Harga per materi",
  previewUrl:
    "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/preview/preview_modul_ajar.pdf",
  originalPrice: "Rp20.000",
  price: "Rp5.000",
  availableMaterials: [
    "Eksponensial dan Logaritma",
    "Barisan dan Deret",
    "Vektor",
    "Perbandingan Trigonometri",
    "Fungsi Kuadrat",
    "Sistem Persamaan dan Pertidaksamaan Linear",
    "Peluang",
    "Statistika",
  ],
  preorderMessage:
    "Materi lainnya sedang dalam proses penyusunan. Bisa pre-order, dengan estimasi selesai maksimal 3 hari.",
  emailSubject: "Pemesanan Modul Ajar Pembelajaran Mendalam — Math 1729",
  emailBody: buildOrderEmailBody(
    "Modul Ajar Pembelajaran Mendalam — 1 materi [ISI NAMA MATERI] — Rp5.000 (harga normal Rp20.000)",
  ),
};

export const SHOP_PREVIEWS = [
  ...PACKAGES,
  ...SLIDE_PACKAGES,
  ...TKA_PACKAGES,
  MODUL_AJAR_PEMBELAJARAN_MENDALAM,
].map(({ id, title, previewUrl }) => ({ id, title, url: previewUrl }));

export const BAHAN_AJAR = [
  { title: "Matriks", grade: "Kelas XI" },
  { title: "Fungsi Kuadrat", grade: "Kelas X" },
].map(({ title, grade }) => ({
  title: `Bahan Ajar ${title}`,
  grade,
  gradeLabel: "TERSEDIA",
  originalPrice: "Rp20.000",
  price: "Rp5.000",
  desc: `Paket bahan ajar ${title} untuk mendukung pembelajaran di kelas.`,
  includes: [
    "Slide Presentasi",
    "Slide Presentasi Interaktif",
    `2 Paket Latihan Soal ${title}`,
    "LKPD Discovery Learning",
  ],
  formats: [".pdf", ".tex"],
  emailSubject: `Pemesanan Bahan Ajar ${title} — Math 1729`,
  emailBody: buildOrderEmailBody(
    `Bahan Ajar ${title} — Rp5.000 (harga normal Rp20.000, diskon 75%)`,
  ),
}));

export const SATUAN_ITEMS = [
  {
    label: "Soal Latihan 1 Materi",
    price: "Rp5.000",
    desc: "1 paket latihan soal + kunci + pembahasan untuk 1 materi pilihan Anda.",
    icon: <FileText size={20} strokeWidth={1.8} aria-hidden="true" />,
  },
  {
    label: "Slide Presentasi 1 Materi",
    price: "Rp5.000",
    desc: "1 file slide (statis atau dinamis) untuk 1 materi pilihan Anda.",
    icon: <Presentation size={20} strokeWidth={1.8} aria-hidden="true" />,
  },
  {
    label: "LKPD 1 Materi",
    price: "Rp10.000",
    desc: "1 lembar kerja peserta didik (discovery/PBL) untuk 1 materi pilihan Anda.",
    icon: <ClipboardList size={20} strokeWidth={1.8} aria-hidden="true" />,
  },
  {
    label: "Custom Soal / Slide / LKPD",
    price: "mulai Rp20.000",
    desc: "Pembuatan soal, slide, atau LKPD sesuai kebutuhan spesifik Anda (materi, indikator, KD).",
    icon: <Pencil size={20} strokeWidth={1.8} aria-hidden="true" />,
  },
] as const;

export type SatuanItem = (typeof SATUAN_ITEMS)[number];
