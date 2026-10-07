import { ClipboardList, FileText, Pencil, Presentation } from "lucide-react";

export const ORDER_EMAIL = "pesan.math1729@gmail.com";
export const BANK_NAME = "BNI";
export const BANK_ACCOUNT = "0707704528";
export const BRI_ACCOUNT = "300601027906539";
export const SHOPEEPAY_NUMBER = "082122214133";
export const ACCOUNT_HOLDER = "Thoriq Afanudin";
export const PHONE_WA = "088226179468";
export const WHATSAPP_LINK = `https://wa.me/62${PHONE_WA.replace(/^0/, "")}`;
export const PAYMENT_METHODS = [
  { name: BANK_NAME, account: BANK_ACCOUNT },
  { name: "BRI", account: BRI_ACCOUNT },
  { name: "ShopeePay", account: SHOPEEPAY_NUMBER },
];
export const PAYMENT_DETAILS = PAYMENT_METHODS.map(
  ({ name, account }) => `${name} ${account} a.n. ${ACCOUNT_HOLDER}`,
).join("\n");

export const SAMPLE_PRODUCTS = [
  {
    id: "worksheet",
    title: "LKPD",
    file: "contoh-lkpd.pdf",
    description: "Contoh lembar kerja peserta didik.",
    url: new URL("../../contoh-produk-digital/contoh-lkpd.pdf", import.meta.url)
      .href,
  },
  {
    id: "questions",
    title: "Contoh Soal",
    file: "contoh-soal.pdf",
    description: "Contoh soal latihan matematika.",
    url: new URL("../../contoh-produk-digital/contoh-soal.pdf", import.meta.url)
      .href,
  },
  {
    id: "slides",
    title: "Slide Presentasi",
    file: "contoh-slide.pdf",
    description: "Contoh tampilan slide presentasi materi.",
    url: new URL(
      "../../contoh-produk-digital/contoh-slide.pdf",
      import.meta.url,
    ).href,
  },
] as const;

export type SampleProductId = (typeof SAMPLE_PRODUCTS)[number]["id"];

export const PACKAGES = [
  {
    id: "paket-kelas-10",
    grade: "Kelas X",
    gradeLabel: "FASE E",
    title: "Paket Soal Kelas 10",
    price: "Rp20.000",
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
    emailBody: `Assalamualaikum / Selamat pagi,

Saya ingin memesan:
Paket Soal Kelas 10 — Rp20.000

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Silakan transfer sebesar Rp20.000 ke salah satu metode berikut:
${PAYMENT_DETAILS}

[LAMPIRKAN BUKTI TRANSFER DI EMAIL INI]

Terima kasih.`,
  },
  {
    id: "paket-kelas-11",
    grade: "Kelas XI",
    gradeLabel: "FASE F",
    title: "Paket Soal Kelas 11",
    price: "Rp15.000",
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
    emailBody: `Assalamualaikum / Selamat pagi,

Saya ingin memesan:
Paket Soal Kelas 11 — Rp15.000

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Silakan transfer sebesar Rp15.000 ke salah satu metode berikut:
${PAYMENT_DETAILS}

[LAMPIRKAN BUKTI TRANSFER DI EMAIL INI]

Terima kasih.`,
  },
  {
    id: "paket-kelas-12",
    grade: "Kelas XII",
    gradeLabel: "FASE F LANJUT",
    title: "Paket Soal Kelas 12",
    price: "Rp20.000",
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
    emailBody: `Assalamualaikum / Selamat pagi,

Saya ingin memesan:
Paket Soal Kelas 12 — Rp20.000

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Silakan transfer sebesar Rp20.000 ke salah satu metode berikut:
${PAYMENT_DETAILS}

[LAMPIRKAN BUKTI TRANSFER DI EMAIL INI]

Terima kasih.`,
  },
];

export const SLIDE_PACKAGES = PACKAGES.map((pkg) => ({
  ...pkg,
  id: `slide-${pkg.id}`,
  title: `Paket Slide Presentasi ${pkg.grade}`,
  desc: `Paket slide presentasi untuk seluruh ${pkg.items.length} materi ${pkg.grade}.`,
  emailSubject: `Pemesanan Paket Slide Presentasi ${pkg.grade} — Math 1729`,
  emailBody: `Assalamualaikum / Selamat pagi,

Saya ingin memesan:
Paket Slide Presentasi ${pkg.grade} — ${pkg.price}

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Silakan transfer sebesar ${pkg.price} ke salah satu metode berikut:
${PAYMENT_DETAILS}

[LAMPIRKAN BUKTI TRANSFER DI EMAIL INI]

Terima kasih.`,
}));

export const TKA_SMP_PACKAGE = {
  emailSubject: "Pemesanan Paket Latihan TKA SMP — Math 1729",
  emailBody: `Assalamualaikum / Selamat pagi,

Saya ingin memesan:
Paket Latihan TKA SMP
Harga normal: Rp20.000
Diskon 25%: Rp15.000

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Silakan transfer sebesar Rp15.000 ke salah satu metode berikut:
${PAYMENT_DETAILS}

[LAMPIRKAN BUKTI TRANSFER DI EMAIL INI]

Terima kasih.`,
};

export const BAHAN_AJAR = [
  { title: "Matriks", grade: "Kelas XI" },
  { title: "Fungsi Kuadrat", grade: "Kelas X" },
].map(({ title, grade }) => ({
  title: `Bahan Ajar ${title}`,
  grade,
  gradeLabel: "TERSEDIA",
  originalPrice: "Rp20.000",
  price: "Rp15.000",
  desc: `Paket bahan ajar ${title} untuk mendukung pembelajaran di kelas.`,
  includes: [
    "Slide Presentasi",
    "Slide Presentasi Interaktif",
    `2 Paket Latihan Soal ${title}`,
    "LKPD Discovery Learning",
  ],
  formats: [".pdf", ".tex"],
  emailSubject: `Pemesanan Bahan Ajar ${title} — Math 1729`,
  emailBody: `Assalamualaikum / Selamat pagi,

Saya ingin memesan:
Bahan Ajar ${title} — Rp15.000 (harga normal Rp20.000, diskon 25%)

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Silakan transfer sebesar Rp15.000 ke salah satu metode berikut:
${PAYMENT_DETAILS}

[LAMPIRKAN BUKTI TRANSFER DI EMAIL INI]

Terima kasih.`,
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
