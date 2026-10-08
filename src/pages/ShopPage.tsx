import { ArrowRight, Check, Eye, Mail } from "lucide-react";
import type { Navigate } from "../types/navigation";
import {
  ACCOUNT_HOLDER,
  BAHAN_AJAR,
  buildPreviewRequestEmailBody,
  ORDER_EMAIL,
  PACKAGES,
  PAYMENT_METHODS,
  PHONE_WA,
  SATUAN_ITEMS,
  SLIDE_PACKAGES,
  TKA_PACKAGES,
  type SatuanItem,
  WHATSAPP_LINK,
} from "../data/shopProducts";

interface ShopPageProps {
  navigate: Navigate;
}

function buildEmailLink(subject: string, body: string) {
  return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildSatuanEmailBody(item: SatuanItem) {
  const isCustom = item.label.startsWith("Custom");
  const additionalDetails = ["Materi yang diinginkan: [ISI NAMA MATERI]"];
  if (isCustom) additionalDetails.push("Keterangan tambahan: [ISI KETERANGAN]");

  return buildPreviewRequestEmailBody(
    `${item.label} — ${item.price}`,
    additionalDetails,
  );
}

function ProductActions({
  productId,
  emailSubject,
  emailBody,
}: {
  productId: string;
  emailSubject: string;
  emailBody: string;
}) {
  return (
    <div className="shop-card-actions">
      <a
        href={`/pratinjau-produk?produk=${encodeURIComponent(productId)}`}
        className="button button-secondary shop-order-btn"
      >
        Lihat Preview <Eye size={16} aria-hidden="true" />
      </a>
      <a
        href={buildEmailLink(emailSubject, emailBody)}
        className="button button-primary shop-order-btn"
      >
        Pesan via Email <Mail size={16} aria-hidden="true" />
      </a>
    </div>
  );
}

export function ShopPage({ navigate: _navigate }: ShopPageProps) {
  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

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

      {/* Hero + CTA */}
      <section className="shop-hero" aria-label="Hero produk">
        <div className="shop-hero-copy">
          <span className="section-kicker">Produk Digital Pembelajaran</span>
          <h1>Pilih produk matematika untuk kebutuhan kelasmu</h1>
          <p>
            Temukan paket soal, slide presentasi, latihan TKA, dan bahan ajar
            matematika dalam format PDF dan LaTeX untuk mendukung pembelajaran.
          </p>
          <div className="shop-hero-actions">
            <a
              href="#paket-soal"
              className="button button-primary"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("paket-soal");
              }}
            >
              Pilih Paket untuk Kelasmu
            </a>
            <a
              href="#cara-memesan"
              className="button button-secondary"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("cara-memesan");
              }}
            >
              Cara Memesan
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="shop-hero-chat"
            >
              Chat Admin untuk Konsultasi
            </a>
          </div>
        </div>

        <div className="shop-hero-panel" aria-label="Keunggulan produk">
          <div className="shop-hero-panel-item">
            <strong>Format siap pakai</strong>
            <span>PDF + LaTeX</span>
          </div>
          <div className="shop-hero-panel-item">
            <strong>Preview sebelum membeli</strong>
            <span>Periksa isi sebelum membayar</span>
          </div>
          <div className="shop-hero-panel-item">
            <strong>Standar guru</strong>
            <span>Materi lengkap</span>
          </div>
        </div>
      </section>

      <nav className="shop-quick-nav" aria-label="Navigasi cepat produk">
        <a
          href="#paket-soal"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("paket-soal");
          }}
        >
          Paket Soal
        </a>
        <a
          href="#slide-presentasi"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("slide-presentasi");
          }}
        >
          Slide Presentasi
        </a>
        <a
          href="#bahan-ajar"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("bahan-ajar");
          }}
        >
          Bahan Ajar
        </a>
        <a
          href="#custom-order"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("custom-order");
          }}
        >
          Custom Order
        </a>
      </nav>

      <section
        id="paket-soal"
        className="shop-section"
        aria-label="Paket Soal per Kelas"
      >
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
                <ProductActions
                  productId={pkg.id}
                  emailSubject={pkg.emailSubject}
                  emailBody={pkg.emailBody}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===================== SEKSI 2: Paket Slide Presentasi per Kelas ===================== */}
      <section
        id="slide-presentasi"
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
                <ProductActions
                  productId={pkg.id}
                  emailSubject={pkg.emailSubject}
                  emailBody={pkg.emailBody}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="shop-section"
        aria-label="Paket Latihan TKA SMP dan SMA"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Persiapan TKA</span>
            <h2>Paket Latihan TKA SMP dan SMA</h2>
            <p>
              Empat paket latihan dengan benefit dan harga yang sama untuk
              jenjang SMP maupun SMA.
            </p>
          </div>
        </div>
        <div className="shop-package-grid shop-package-grid--2col">
          {TKA_PACKAGES.map((pkg) => (
            <article key={pkg.grade} className="shop-card shop-card--featured">
              <div className="shop-card-header">
                <span className="shop-card-grade-badge shop-card-grade-badge--green">
                  DISKON 25%
                </span>
                <span className="shop-card-grade">{pkg.grade}</span>
              </div>
              <div className="shop-card-body">
                <h3 className="shop-card-title">{pkg.title}</h3>
                <div className="shop-promo-price">
                  <del>{pkg.originalPrice}</del>
                  <span className="shop-promo-current-price">{pkg.price}</span>
                </div>
                <p className="shop-card-desc">{pkg.desc}</p>
                <ul className="shop-card-list shop-card-list--check">
                  {pkg.benefits.map((benefit) => (
                    <li key={benefit}>
                      <span className="shop-check-icon" aria-hidden="true">
                        <Check size={15} strokeWidth={2.5} />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shop-card-footer">
                <ProductActions
                  productId={pkg.id}
                  emailSubject={pkg.emailSubject}
                  emailBody={pkg.emailBody}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===================== SEKSI 3: Paket Bahan Ajar per Materi ===================== */}
      <section
        id="bahan-ajar"
        className="shop-section"
        aria-label="Paket Bahan Ajar per Materi"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Bahan Ajar Lengkap</span>
            <h2>Paket Bahan Ajar per Materi</h2>
            <p>
              Pilih Bahan Ajar Matriks atau Fungsi Kuadrat. Kedua paket
              mendapatkan benefit dan harga promo yang sama. Produk ini tidak
              memiliki preview; pemesanan langsung melalui email.
            </p>
          </div>
        </div>

        <div className="shop-package-grid shop-package-grid--2col">
          {BAHAN_AJAR.map((pkg) => (
            <article key={pkg.title} className="shop-card shop-card--featured">
              <div className="shop-card-header">
                <span className="shop-card-grade-badge shop-card-grade-badge--green">
                  {pkg.gradeLabel}
                </span>
                <span className="shop-card-grade">{pkg.grade}</span>
              </div>
              <div className="shop-card-body">
                <h3 className="shop-card-title">{pkg.title}</h3>
                <div className="shop-promo-price">
                  <del>{pkg.originalPrice}</del>
                  <span className="shop-promo-current-price">{pkg.price}</span>
                  <span className="shop-card-grade-badge shop-card-grade-badge--green">
                    DISKON 25%
                  </span>
                </div>
                <p className="shop-card-desc">{pkg.desc}</p>
                <p className="shop-includes-label">Yang didapatkan:</p>
                <ul className="shop-card-list shop-card-list--check">
                  {pkg.includes.map((item, i) => (
                    <li key={i}>
                      <span className="shop-check-icon" aria-hidden="true">
                        <Check size={15} strokeWidth={2.5} />
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

      {/* ===================== SEKSI 4: Pembelian Satuan ===================== */}
      <section
        id="custom-order"
        className="shop-section"
        aria-label="Pembelian Per File"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Fleksibel &amp; Hemat</span>
            <h2>Pembelian Per File / Custom</h2>
            <p>
              Hanya butuh satu materi saja? Anda bisa membeli per file atau
              memesan pembuatan custom sesuai kebutuhan spesifik Anda. Untuk
              item satuan dan custom, minta preview melalui email terlebih
              dahulu sebelum melakukan pemesanan.
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
                  `Permintaan Preview ${item.label} — Math 1729`,
                  buildSatuanEmailBody(item),
                )}
                className="satuan-order-link"
              >
                Minta Preview via Email <Mail size={15} aria-hidden="true" />
              </a>
            </div>
          ))}
        </div>

        <div className="shop-satuan-cta">
          <p className="shop-satuan-note">
            Isi data pemesan pada email yang terbuka. Untuk pesanan custom,
            tambahkan materi dan keterangan yang diinginkan. Preview akan
            dikirim sebelum pembayaran.
          </p>
        </div>
      </section>

      {/* FAQ / Ketentuan */}
      <section
        id="faq"
        className="shop-faq-section"
        aria-label="Ketentuan dan FAQ"
      >
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
              <strong>Preview dan File Asli</strong>
              <p>
                Preview paket soal, slide, dan TKA dapat dibuka dari kartu
                produk. Bahan ajar per materi dipesan melalui email. File asli
                dikirim maksimal <strong>1 jam setelah pemesanan</strong>.
              </p>
            </div>
            <div className="faq-item">
              <strong>Jika File Belum Diterima</strong>
              <p>
                Jika file belum diterima dalam 1 jam, hubungi via WhatsApp. Ada
                kemungkinan pesanan sedang padat:{" "}
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                  {PHONE_WA}
                </a>
              </p>
            </div>
            <div className="faq-item">
              <strong>Pembayaran</strong>
              <p>
                Setelah preview sesuai, lakukan pemesanan melalui email dan
                lampirkan bukti pembayaran. Pembayaran dapat dilakukan melalui{" "}
                <strong>BNI, BRI, atau ShopeePay</strong>.
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
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                  {PHONE_WA}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Pembelian */}
      <section
        id="cara-memesan"
        className="shop-flow-band"
        aria-label="Alur Pembelian"
      >
        <div className="shop-flow-inner">
          <span className="section-kicker">Cara Memesan</span>
          <div className="shop-flow-steps">
            <div className="shop-flow-step">
              <span className="flow-step-num">01</span>
              <div>
                <strong>Pilih Produk</strong>
                <p>Pilih produk yang ingin dipesan.</p>
              </div>
            </div>
            <span className="flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <div className="shop-flow-step">
              <span className="flow-step-num">02</span>
              <div>
                <strong>Lihat Preview</strong>
                <p>
                  Periksa preview paket soal, slide, atau TKA. Bahan ajar per
                  materi dipesan langsung; item satuan/custom dimulai dengan
                  permintaan preview email.
                </p>
              </div>
            </div>
            <span className="flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <div className="shop-flow-step">
              <span className="flow-step-num">03</span>
              <div>
                <strong>Pesan via Email</strong>
                <p>
                  Kirim email pemesanan dengan data pemesan dan lampirkan bukti
                  pembayaran.
                </p>
              </div>
            </div>
            <span className="flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <div className="shop-flow-step">
              <span className="flow-step-num">04</span>
              <div>
                <strong>File Dikirim</strong>
                <p>File dikirim maksimal 1 jam setelah pemesanan.</p>
              </div>
            </div>
            <span className="flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <div className="shop-flow-step">
              <span className="flow-step-num">05</span>
              <div>
                <strong>Jika Terlambat</strong>
                <p>Hubungi WhatsApp jika antrean pesanan sedang padat.</p>
              </div>
            </div>
          </div>
          <p className="shop-flow-note">
            Belum menerima file dalam 1 jam? Pesanan mungkin sedang padat.
            Hubungi via WhatsApp:{" "}
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
              <strong>{PHONE_WA}</strong>
            </a>
          </p>
        </div>
      </section>

      <div
        id="detail-pemesanan"
        className="shop-bank-info"
        role="note"
        aria-label="Info rekening pembayaran"
      >
        <span className="shop-bank-label">
          Metode pembayaran setelah preview disetujui:
        </span>
        <div className="shop-bank-detail">
          {PAYMENT_METHODS.map((method) => (
            <span key={method.name}>
              <strong>{method.name}</strong> · {method.account} · a.n.{" "}
              <strong>{ACCOUNT_HOLDER}</strong>
            </span>
          ))}
        </div>
        <p className="shop-bank-note">
          Setelah preview sesuai, lakukan pembayaran dan lampirkan bukti
          transfer pada email pesanan. Jangan transfer sebelum menyetujui
          preview.
        </p>
      </div>
    </main>
  );
}
