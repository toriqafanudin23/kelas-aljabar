import { useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardList,
  ExternalLink,
  FileText,
  Mail,
  Pencil,
  Presentation,
} from "lucide-react";
import type { Navigate } from "../types/navigation";

interface ShopPageProps {
  navigate: Navigate;
}

const ORDER_EMAIL = "pesan.math1729@gmail.com";
const BANK_NAME = "BNI";
const BANK_ACCOUNT = "0707704528";
const BRI_ACCOUNT = "300601027906539";
const SHOPEEPAY_NUMBER = "082122214133";
const ACCOUNT_HOLDER = "Thoriq Afanudin";
const PHONE_WA = "088226179468";
const PAYMENT_METHODS = [
  { name: BANK_NAME, account: BANK_ACCOUNT },
  { name: "BRI", account: BRI_ACCOUNT },
  { name: "ShopeePay", account: SHOPEEPAY_NUMBER },
];
const PAYMENT_DETAILS = PAYMENT_METHODS.map(
  ({ name, account }) => `${name} ${account} a.n. ${ACCOUNT_HOLDER}`,
).join("\n");

const SAMPLE_PRODUCTS = [
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

type SampleProductId = (typeof SAMPLE_PRODUCTS)[number]["id"];

function buildEmailLink(subject: string, body: string) {
  return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const PACKAGES = [
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

const SLIDE_PACKAGES = PACKAGES.map((pkg) => ({
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

const TKA_SMP_PACKAGE = {
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

const BAHAN_AJAR = {
  title: "Bahan Ajar Matriks",
  grade: "Kelas XI",
  gradeLabel: "TERSEDIA",
  originalPrice: "Rp20.000",
  price: "Rp15.000",
  desc: "Paket bahan ajar Matriks untuk mendukung pembelajaran di kelas.",
  includes: [
    "Slide Presentasi",
    "Slide Presentasi Interaktif",
    "2 Paket Latihan Soal Matriks",
    "LKPD Discovery Learning",
  ],
  formats: [".pdf", ".tex"],
  emailSubject: "Pemesanan Bahan Ajar Matriks — Math 1729",
  emailBody: `Assalamualaikum / Selamat pagi,

Saya ingin memesan:
Bahan Ajar Matriks — Rp15.000 (harga normal Rp20.000, diskon 25%)

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Silakan transfer sebesar Rp15.000 ke salah satu metode berikut:
${PAYMENT_DETAILS}

[LAMPIRKAN BUKTI TRANSFER DI EMAIL INI]

Terima kasih.`,
};

const SATUAN_ITEMS = [
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
];

function buildSatuanEmailBody(item: (typeof SATUAN_ITEMS)[number]) {
  const isCustom = item.label.startsWith("Custom");
  const transferAmount = isCustom
    ? "Rp[JUMLAH SESUAI KESEPAKATAN]"
    : item.price;

  return `Assalamualaikum / Selamat pagi,

Saya ingin memesan:
${item.label} — ${item.price}

Materi yang diinginkan: [ISI NAMA MATERI]
${isCustom ? "Keterangan tambahan: [ISI KETERANGAN]" : ""}

Data pemesan:
- Nama  : [ISI NAMA ANDA]
- Email : [ISI EMAIL ANDA]
- WA    : [ISI NOMOR WA]

Silakan transfer sebesar ${transferAmount} ke salah satu metode berikut:
${PAYMENT_DETAILS}

[LAMPIRKAN BUKTI TRANSFER DI EMAIL INI]

Terima kasih.`;
}

export function ShopPage({ navigate: _navigate }: ShopPageProps) {
  const [activeSampleId, setActiveSampleId] =
    useState<SampleProductId>("worksheet");
  const activeSample =
    SAMPLE_PRODUCTS.find((sample) => sample.id === activeSampleId) ??
    SAMPLE_PRODUCTS[0];

  return (
    <main className="shop-page site-width inner-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            _navigate(e, "home");
          }}
        >
          Beranda
        </a>
        <span>/</span>
        <span>Beli Produk</span>
      </div>

      {/* Page Intro */}
      <div className="page-intro">
        <span className="section-kicker">
          Produk Digital Pembelajaran · Dibuat dengan LaTeX
        </span>
        <h1>Beli Produk Bahan Ajar</h1>
        <p>
          Dapatkan file bahan ajar berkualitas tinggi yang dikembangkan dengan
          notasi LaTeX standar — siap cetak, siap proyeksi, dan siap
          dimodifikasi sesuai kebutuhan pembelajaran Anda.
        </p>
      </div>

      <section
        className="shop-product-preview"
        aria-labelledby="shop-preview-title"
      >
        <div className="shop-preview-heading">
          <div>
            <span className="section-kicker">Lihat Contoh Produk</span>
            <h2 id="shop-preview-title">Pratinjau Produk Digital</h2>
            <p>
              Pilih contoh soal, slide, atau LKPD untuk melihat isi produknya.
            </p>
          </div>
        </div>

        <div className="shop-preview-layout">
          <div className="shop-preview-stage">
            <div className="shop-preview-stage-head">
              <strong>{activeSample.title}</strong>
              <a href={activeSample.url} target="_blank" rel="noreferrer">
                Buka PDF <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
            <iframe
              key={activeSample.id}
              className="shop-preview-frame"
              src={activeSample.url}
              title={activeSample.title}
              loading="lazy"
            />
          </div>

          <div className="shop-preview-picker" aria-label="Pilih contoh produk">
            <span className="shop-preview-picker-label">PILIH FILE</span>
            <div className="shop-preview-options">
              {SAMPLE_PRODUCTS.map((sample, index) => (
                <button
                  key={sample.id}
                  type="button"
                  className={`shop-preview-option ${activeSampleId === sample.id ? "active" : ""}`}
                  aria-pressed={activeSampleId === sample.id}
                  onClick={() => setActiveSampleId(sample.id)}
                >
                  <span className="shop-preview-option-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="shop-preview-option-copy">
                    <strong>{sample.title}</strong>
                    <small>{sample.file}</small>
                  </span>
                </button>
              ))}
            </div>
            <p className="shop-preview-description">
              {activeSample.description}
            </p>
          </div>
        </div>
      </section>

      {/* Alur Pembelian */}
      <section className="shop-flow-band" aria-label="Alur Pembelian">
        <div className="shop-flow-inner">
          <span className="section-kicker">Cara Memesan</span>
          <div className="shop-flow-steps">
            <div className="shop-flow-step">
              <span className="flow-step-num">01</span>
              <div>
                <strong>Pilih Produk</strong>
                <p>
                  Pilih paket atau produk satuan yang sesuai kebutuhan Anda.
                </p>
              </div>
            </div>
            <span className="flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <div className="shop-flow-step">
              <span className="flow-step-num">02</span>
              <div>
                <strong>Transfer Pembayaran</strong>
                <p>
                  Pilih salah satu metode pembayaran:{" "}
                  <strong>BNI, BRI, atau ShopeePay</strong>.
                </p>
              </div>
            </div>
            <span className="flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <div className="shop-flow-step">
              <span className="flow-step-num">03</span>
              <div>
                <strong>Kirim Email Pesanan</strong>
                <p>
                  Klik tombol &quot;Pesan via Email&quot; dan lampirkan bukti
                  transfer di email Anda.
                </p>
              </div>
            </div>
            <span className="flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <div className="shop-flow-step">
              <span className="flow-step-num">04</span>
              <div>
                <strong>Terima File</strong>
                <p>
                  File dikirim ke email Anda <strong>maks. 12 jam</strong>{" "}
                  setelah pesanan diterima.
                </p>
              </div>
            </div>
          </div>
          <p className="shop-flow-note">
            Belum menerima file setelah 12 jam? Hubungi via WhatsApp:{" "}
            <a
              href={`https://wa.me/62${PHONE_WA.replace(/^0/, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <strong>{PHONE_WA}</strong>
            </a>
          </p>
        </div>
      </section>

      {/* Rekening Info Banner */}
      <div
        className="shop-bank-info"
        role="note"
        aria-label="Info rekening pembayaran"
      >
        <span className="shop-bank-label">
          Pembayaran via Transfer Bank / E-Wallet:
        </span>
        <div className="shop-bank-detail">
          {PAYMENT_METHODS.map((method) => (
            <span key={method.name}>
              <strong>{method.name}</strong> · {method.account} · a.n.{" "}
              <strong>{ACCOUNT_HOLDER}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* ===================== SEKSI 1: Paket Soal Per Kelas ===================== */}
      <section className="shop-section" aria-label="Paket Soal per Kelas">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Paket Soal Lengkap</span>
            <h2>Paket Soal Latihan per Kelas</h2>
            <p>
              Latihan soal beserta kunci jawaban dan pembahasan, mencakup
              seluruh materi dalam satu jenjang kelas. File tersedia dalam
              format <code>.pdf</code> dan <code>.tex</code>.
            </p>
          </div>
        </div>

        <div className="shop-package-grid">
          {PACKAGES.map((pkg) => (
            <article key={pkg.id} className="shop-card">
              <div className="shop-card-header">
                <span className="shop-card-grade-badge">{pkg.gradeLabel}</span>
                <span className="shop-card-grade">{pkg.grade}</span>
              </div>
              <div className="shop-card-body">
                <h3 className="shop-card-title">{pkg.title}</h3>
                <div className="shop-card-price">{pkg.price}</div>
                <p className="shop-card-desc">{pkg.desc}</p>
                <ul className="shop-card-list">
                  {pkg.items.map((item, i) => (
                    <li key={i}>
                      <span className="shop-list-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="shop-card-formats">
                  {pkg.formats.map((f) => (
                    <span key={f} className="format-badge">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shop-card-footer">
                <a
                  href={buildEmailLink(pkg.emailSubject, pkg.emailBody)}
                  className="button button-primary shop-order-btn"
                >
                  Pesan via Email <Mail size={16} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===================== SEKSI 2: Paket Slide Presentasi per Kelas ===================== */}
      <section
        className="shop-section"
        aria-label="Paket Slide Presentasi per Kelas"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Slide Presentasi Lengkap</span>
            <h2>Paket Slide Presentasi per Kelas</h2>
            <p>
              Slide presentasi untuk seluruh materi dalam satu jenjang kelas.
              Daftar materi dan harga mengikuti Paket Soal per Kelas. File
              tersedia dalam format <code>.pdf</code> dan <code>.tex</code>.
            </p>
          </div>
        </div>

        <div className="shop-package-grid">
          {SLIDE_PACKAGES.map((pkg) => (
            <article key={pkg.id} className="shop-card">
              <div className="shop-card-header">
                <span className="shop-card-grade-badge">{pkg.gradeLabel}</span>
                <span className="shop-card-grade">{pkg.grade}</span>
              </div>
              <div className="shop-card-body">
                <h3 className="shop-card-title">{pkg.title}</h3>
                <div className="shop-card-price">{pkg.price}</div>
                <p className="shop-card-desc">{pkg.desc}</p>
                <ul className="shop-card-list">
                  {pkg.items.map((item, i) => (
                    <li key={i}>
                      <span className="shop-list-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="shop-card-formats">
                  {pkg.formats.map((format) => (
                    <span key={format} className="format-badge">
                      {format}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shop-card-footer">
                <a
                  href={buildEmailLink(pkg.emailSubject, pkg.emailBody)}
                  className="button button-primary shop-order-btn"
                >
                  Pesan via Email <Mail size={16} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shop-section" aria-label="Paket Latihan TKA SMP">
        <div className="shop-package-grid shop-package-grid--single">
          <article className="shop-card shop-card--featured">
            <div className="shop-card-header">
              <span className="shop-card-grade-badge shop-card-grade-badge--green">
                DISKON 25%
              </span>
              <span className="shop-card-grade">SMP</span>
            </div>
            <div className="shop-card-body">
              <h3 className="shop-card-title">Paket Latihan TKA SMP</h3>
              <div className="shop-promo-price">
                <del>Rp20.000</del>
                <span className="shop-promo-current-price">Rp15.000</span>
              </div>
              <p className="shop-card-desc">
                Empat paket latihan TKA untuk membantu persiapan siswa SMP.
              </p>
              <ul className="shop-card-list shop-card-list--check">
                <li>
                  <span className="shop-check-icon" aria-hidden="true">
                    <Check size={15} strokeWidth={2.5} />
                  </span>
                  4 paket soal TKA
                </li>
                <li>
                  <span className="shop-check-icon" aria-hidden="true">
                    <Check size={15} strokeWidth={2.5} />
                  </span>
                  30 soal per paket (total 120 soal)
                </li>
                <li>
                  <span className="shop-check-icon" aria-hidden="true">
                    <Check size={15} strokeWidth={2.5} />
                  </span>
                  Bentuk soal: Pilihan ganda, multiple choice, benar atau salah
                </li>
              </ul>
            </div>
            <div className="shop-card-footer">
              <a
                href={buildEmailLink(
                  TKA_SMP_PACKAGE.emailSubject,
                  TKA_SMP_PACKAGE.emailBody,
                )}
                className="button button-primary shop-order-btn"
              >
                Pesan via Email <Mail size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </section>

      {/* ===================== SEKSI 3: Paket Bahan Ajar per Materi ===================== */}
      <section
        className="shop-section"
        aria-label="Paket Bahan Ajar per Materi"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Bahan Ajar Lengkap</span>
            <h2>Bahan Ajar Matriks</h2>
            <p>
              Paket bahan ajar Matriks dengan slide, latihan soal, dan LKPD.
              Tersedia dalam format <code>.pdf</code> dan <code>.tex</code>.
            </p>
          </div>
        </div>

        <div className="shop-package-grid shop-package-grid--single">
          <article className="shop-card shop-card--featured">
            <div className="shop-card-header">
              <span className="shop-card-grade-badge shop-card-grade-badge--green">
                {BAHAN_AJAR.gradeLabel}
              </span>
              <span className="shop-card-grade">{BAHAN_AJAR.grade}</span>
            </div>
            <div className="shop-card-body">
              <h3 className="shop-card-title">{BAHAN_AJAR.title}</h3>
              <div className="shop-promo-price">
                <del>{BAHAN_AJAR.originalPrice}</del>
                <span className="shop-promo-current-price">
                  {BAHAN_AJAR.price}
                </span>
                <span className="shop-card-grade-badge shop-card-grade-badge--green">
                  DISKON 25%
                </span>
              </div>
              <p className="shop-card-desc">{BAHAN_AJAR.desc}</p>
              <p className="shop-includes-label">Yang didapatkan:</p>
              <ul className="shop-card-list shop-card-list--check">
                {BAHAN_AJAR.includes.map((item, i) => (
                  <li key={i}>
                    <span className="shop-check-icon" aria-hidden="true">
                      <Check size={15} strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="shop-card-formats">
                {BAHAN_AJAR.formats.map((f) => (
                  <span key={f} className="format-badge">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="shop-card-footer">
              <a
                href={buildEmailLink(
                  BAHAN_AJAR.emailSubject,
                  BAHAN_AJAR.emailBody,
                )}
                className="button button-primary shop-order-btn"
              >
                Pesan via Email <Mail size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </section>

      {/* ===================== SEKSI 4: Pembelian Satuan ===================== */}
      <section className="shop-section" aria-label="Pembelian Per File">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Fleksibel &amp; Hemat</span>
            <h2>Pembelian Per File / Custom</h2>
            <p>
              Hanya butuh satu materi saja? Anda bisa membeli per file atau
              memesan pembuatan custom sesuai kebutuhan spesifik Anda.
            </p>
          </div>
        </div>

        <div className="shop-satuan-grid">
          {SATUAN_ITEMS.map((item, i) => (
            <div key={i} className="shop-satuan-card">
              <span className="satuan-icon" aria-hidden="true">
                {item.icon}
              </span>
              <div className="satuan-body">
                <strong className="satuan-label">{item.label}</strong>
                <span className="satuan-price">{item.price}</span>
                <p className="satuan-desc">{item.desc}</p>
              </div>
              <a
                href={buildEmailLink(
                  `Pemesanan ${item.label} — Math 1729`,
                  buildSatuanEmailBody(item),
                )}
                className="satuan-order-link"
              >
                Pesan via Email <Mail size={15} aria-hidden="true" />
              </a>
            </div>
          ))}
        </div>

        <div className="shop-satuan-cta">
          <p className="shop-satuan-note">
            Isi nama materi dan data pemesan pada email yang terbuka. Untuk
            pesanan custom, tambahkan keterangan dan nominal yang disepakati.
          </p>
        </div>
      </section>

      {/* FAQ / Ketentuan */}
      <section className="shop-faq-section" aria-label="Ketentuan dan FAQ">
        <div className="shop-faq-box">
          <h2>Ketentuan &amp; Informasi Pemesanan</h2>
          <div className="shop-faq-grid">
            <div className="faq-item">
              <strong>Format File yang Diterima</strong>
              <p>
                Semua produk tersedia dalam format <code>.pdf</code> (siap
                cetak) dan <code>.tex</code> (source LaTeX yang dapat diedit
                sesuai kebutuhan).
              </p>
            </div>
            <div className="faq-item">
              <strong>Estimasi Pengiriman File</strong>
              <p>
                File akan dikirim ke email Anda <strong>maksimal 12 jam</strong>{" "}
                setelah pesanan dan bukti transfer diterima.
              </p>
            </div>
            <div className="faq-item">
              <strong>Jika File Belum Diterima</strong>
              <p>
                Jika sudah lebih dari 12 jam dan file belum terkirim, silakan
                hubungi via WhatsApp:{" "}
                <a
                  href={`https://wa.me/62${PHONE_WA.replace(/^0/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {PHONE_WA}
                </a>
              </p>
            </div>
            <div className="faq-item">
              <strong>Pembayaran</strong>
              <p>
                Pembayaran tersedia melalui{" "}
                <strong>BNI, BRI, atau ShopeePay</strong>. Nomor rekening dan
                nama pemilik tercantum pada informasi pembayaran di atas.
                Lampirkan screenshot bukti transfer di email pesanan Anda.
              </p>
            </div>
            <div className="faq-item">
              <strong>Bolehkah Dimodifikasi?</strong>
              <p>
                File <code>.tex</code> dapat Anda modifikasi untuk kebutuhan
                kelas sendiri. Redistribusi atau penjualan kembali tanpa izin
                tidak diperbolehkan.
              </p>
            </div>
            <div className="faq-item">
              <strong>Pertanyaan Lain?</strong>
              <p>
                Hubungi via email{" "}
                <a href={`mailto:${ORDER_EMAIL}`}>{ORDER_EMAIL}</a> atau
                WhatsApp{" "}
                <a
                  href={`https://wa.me/62${PHONE_WA.replace(/^0/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {PHONE_WA}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
