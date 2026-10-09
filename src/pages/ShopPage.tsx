import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Eye,
  Mail,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { Navigate } from "../types/navigation";
import {
  ACCOUNT_HOLDER,
  BAHAN_AJAR,
  buildPreviewRequestEmailBody,
  buildWhatsAppOrderLink,
  MODUL_AJAR_PEMBELAJARAN_MENDALAM,
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
import "./ShopPage.css";

interface ShopPageProps {
  navigate: Navigate;
}

type CategoryFilter =
  | "semua"
  | "paket-soal"
  | "slide"
  | "modul-bahan"
  | "tka"
  | "satuan";

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

export function ShopPage({ navigate: _navigate }: ShopPageProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (accountNumber: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(accountNumber);
      setTimeout(() => setCopiedAccount(null), 2500);
    }
  };

  const scrollToCatalog = () => {
    const el = document.getElementById("katalog-produk");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Normalized catalog items for unified filtering
  interface CatalogProduct {
    id: string;
    title: string;
    category: CategoryFilter;
    gradeBadge: string;
    promoBadge?: string;
    price: string;
    originalPrice?: string;
    desc: string;
    items?: string[];
    benefits?: string[];
    formats?: string[];
    previewUrl?: string;
    emailSubject: string;
    emailBody: string;
    isFeatured?: boolean;
  }

  const catalogItems: CatalogProduct[] = useMemo(() => {
    const items: CatalogProduct[] = [];

    // Paket Soal
    PACKAGES.forEach((pkg) => {
      items.push({
        id: pkg.id,
        title: pkg.title,
        category: "paket-soal",
        gradeBadge: `${pkg.grade} · ${pkg.gradeLabel}`,
        promoBadge: "HEMAT 75%",
        price: pkg.promoPrice,
        originalPrice: pkg.originalPrice,
        desc: pkg.desc,
        items: pkg.items,
        formats: pkg.formats,
        previewUrl: pkg.previewUrl,
        emailSubject: pkg.emailSubject,
        emailBody: pkg.emailBody,
      });
    });

    // Slide Presentasi
    SLIDE_PACKAGES.forEach((pkg) => {
      items.push({
        id: pkg.id,
        title: pkg.title,
        category: "slide",
        gradeBadge: `${pkg.grade} · ${pkg.gradeLabel}`,
        price: pkg.price,
        desc: pkg.desc,
        items: pkg.items,
        formats: pkg.formats,
        previewUrl: pkg.previewUrl,
        emailSubject: pkg.emailSubject,
        emailBody: pkg.emailBody,
      });
    });

    // Latihan TKA
    TKA_PACKAGES.forEach((pkg) => {
      items.push({
        id: pkg.id,
        title: pkg.title,
        category: "tka",
        gradeBadge: `Jenjang ${pkg.grade}`,
        promoBadge: "HEMAT 75%",
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        desc: pkg.desc,
        benefits: pkg.benefits,
        previewUrl: pkg.previewUrl,
        emailSubject: pkg.emailSubject,
        emailBody: pkg.emailBody,
      });
    });

    // Bahan Ajar per Materi
    BAHAN_AJAR.forEach((pkg) => {
      items.push({
        id: `bahan-${pkg.title.toLowerCase().replace(/\s+/g, "-")}`,
        title: pkg.title,
        category: "modul-bahan",
        gradeBadge: `${pkg.grade} · ${pkg.gradeLabel}`,
        promoBadge: "HEMAT 75%",
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        desc: pkg.desc,
        benefits: pkg.includes,
        formats: pkg.formats,
        emailSubject: pkg.emailSubject,
        emailBody: pkg.emailBody,
      });
    });

    return items;
  }, []);

  // Filter items by category & search query
  const filteredProducts = useMemo(() => {
    return catalogItems.filter((item) => {
      // Category check
      if (activeCategory !== "semua" && item.category !== activeCategory) {
        return false;
      }

      // Search query check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const matchTitle = item.title.toLowerCase().includes(q);
      const matchBadge = item.gradeBadge.toLowerCase().includes(q);
      const matchDesc = item.desc.toLowerCase().includes(q);
      const matchTopics = item.items?.some((t) => t.toLowerCase().includes(q));
      const matchBenefits = item.benefits?.some((b) => b.toLowerCase().includes(q));

      return matchTitle || matchBadge || matchDesc || matchTopics || matchBenefits;
    });
  }, [catalogItems, activeCategory, searchQuery]);

  // Counts for tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      semua: catalogItems.length,
      "paket-soal": 0,
      slide: 0,
      "modul-bahan": 0,
      tka: 0,
      satuan: SATUAN_ITEMS.length,
    };
    catalogItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [catalogItems]);

  return (
    <main className="shop-page site-width inner-page">
      {/* Breadcrumb */}
      <nav className="shop-breadcrumb" aria-label="Navigasi rekam jejak">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            _navigate(e, "home");
          }}
        >
          Beranda
        </a>
        <span className="shop-breadcrumb-sep">/</span>
        <span>Beli Produk</span>
      </nav>

      {/* Hero Section */}
      <section className="shop-hero" aria-label="Katalog Produk Math 1729">
        <div className="shop-hero-top">
          <div className="shop-kicker-badge">
            <Sparkles size={14} aria-hidden="true" />
            <span>Katalog Resmi Math 1729 · Kurikulum Merdeka &amp; K13</span>
          </div>
          <h1>Bahan Ajar, Bank Soal, dan Slide Presentasi Siap Pakai</h1>
          <p className="shop-hero-desc">
            Dapatkan paket soal terstruktur, slide presentasi interaktif, latihan
            TKA, dan modul pembelajaran mendalam. Tersedia format ganda{" "}
            <strong>PDF siap cetak</strong> dan <strong>source LaTeX (.tex)</strong>{" "}
            yang bebas dimodifikasi sesuai kurikulum kelas Anda.
          </p>
          <div className="shop-hero-actions">
            <button
              type="button"
              className="shop-btn-primary"
              onClick={scrollToCatalog}
            >
              Lihat Katalog Produk <ArrowRight size={16} aria-hidden="true" />
            </button>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="shop-btn-wa-hero"
            >
              <MessageCircle size={17} aria-hidden="true" />
              Chat Admin WA (Konsultasi Cepat)
            </a>
            <a
              href="#cara-memesan"
              className="shop-btn-outline-hero"
            >
              Alur Pemesanan
            </a>
          </div>
        </div>

        <div className="shop-hero-metrics" aria-label="Ringkasan keunggulan">
          <div className="shop-metric-item">
            <strong>15+ Paket Siap Pakai</strong>
            <span>Kelas 10, 11, 12, TKA &amp; Modul</span>
          </div>
          <div className="shop-metric-item">
            <strong>Source Code .tex Lengkap</strong>
            <span>Bebas diedit untuk ulangan &amp; kuis</span>
          </div>
          <div className="shop-metric-item">
            <strong>Garansi Kirim &lt; 1 Jam</strong>
            <span>Langsung via WhatsApp &amp; Email</span>
          </div>
          <div className="shop-metric-item">
            <strong>Promo Mulai Rp5.000</strong>
            <span>Hemat hingga 75% per paket</span>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Strip */}
      <section className="shop-trust-strip" aria-label="Jaminan & Kepercayaan">
        <div className="shop-trust-card">
          <div className="shop-trust-icon" aria-hidden="true">
            <Eye size={20} />
          </div>
          <div className="shop-trust-content">
            <h3>Preview Transparan</h3>
            <p>Periksa pratinjau dokumen asli PDF sebelum memutuskan melakukan transfer.</p>
          </div>
        </div>

        <div className="shop-trust-card">
          <div className="shop-trust-icon" aria-hidden="true">
            <Clock size={20} />
          </div>
          <div className="shop-trust-content">
            <h3>Kirim Maks. 1 Jam</h3>
            <p>File dikirim cepat setelah konfirmasi pembayaran diterima admin.</p>
          </div>
        </div>

        <div className="shop-trust-card">
          <div className="shop-trust-icon" aria-hidden="true">
            <ShieldCheck size={20} />
          </div>
          <div className="shop-trust-content">
            <h3>Format PDF &amp; LaTeX</h3>
            <p>File siap cetak kualitas tinggi + source code LaTeX yang rapi dan terstruktur.</p>
          </div>
        </div>

        <div className="shop-trust-card">
          <div className="shop-trust-icon" aria-hidden="true">
            <MessageCircle size={20} />
          </div>
          <div className="shop-trust-content">
            <h3>Dukungan Langsung</h3>
            <p>Konsultasi ramah via WhatsApp untuk pemesanan kustom atau pertanyaan teknis.</p>
          </div>
        </div>
      </section>

      {/* Spotlight: Modul Ajar Pembelajaran Mendalam */}
      <section className="shop-spotlight" aria-label="Produk Unggulan Modul Ajar">
        <div className="shop-spotlight-inner">
          <div className="shop-spotlight-main">
            <div className="shop-spotlight-badges">
              <span className="badge-tag badge-tag--green">PROMO SPESIAL 75%</span>
              <span className="badge-tag badge-tag--navy">PRODUK BARU</span>
            </div>
            <h2 className="shop-spotlight-title">
              {MODUL_AJAR_PEMBELAJARAN_MENDALAM.title}
            </h2>
            <div className="shop-spotlight-price">
              <del>{MODUL_AJAR_PEMBELAJARAN_MENDALAM.originalPrice}</del>
              <span className="current">{MODUL_AJAR_PEMBELAJARAN_MENDALAM.price}</span>
              <span className="note">/ per materi pilihan</span>
            </div>
            <p className="shop-spotlight-desc">
              Modul ajar kurikulum mendalam dirancang berorientasi konsep dan
              pemahaman bermakna. Anda bebas memilih salah satu materi yang diinginkan.
            </p>
            <div className="shop-spotlight-topics-label">Materi Siap Pakai:</div>
            <div className="shop-spotlight-chips">
              {MODUL_AJAR_PEMBELAJARAN_MENDALAM.availableMaterials.map((mat) => (
                <span key={mat} className="shop-topic-chip">
                  {mat}
                </span>
              ))}
            </div>
            <p className="shop-spotlight-preorder">
              * {MODUL_AJAR_PEMBELAJARAN_MENDALAM.preorderMessage}
            </p>
          </div>

          <div className="shop-spotlight-side">
            <a
              href={`/pratinjau-produk?produk=${encodeURIComponent(MODUL_AJAR_PEMBELAJARAN_MENDALAM.id)}`}
              className="shop-btn-action-secondary"
            >
              <Eye size={15} aria-hidden="true" />
              Lihat Preview Dokumen
            </a>
            <a
              href={buildWhatsAppOrderLink(
                MODUL_AJAR_PEMBELAJARAN_MENDALAM.title,
                MODUL_AJAR_PEMBELAJARAN_MENDALAM.price,
              )}
              target="_blank"
              rel="noreferrer"
              className="shop-btn-action-primary"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Pesan Modul via WhatsApp
            </a>
            <a
              href={buildEmailLink(
                MODUL_AJAR_PEMBELAJARAN_MENDALAM.emailSubject,
                MODUL_AJAR_PEMBELAJARAN_MENDALAM.emailBody,
              )}
              className="shop-btn-action-mail"
            >
              <Mail size={15} aria-hidden="true" />
              Pesan via Email
            </a>
          </div>
        </div>
      </section>

      {/* Main Catalog Toolbar: Filter Tabs + Live Search */}
      <div id="katalog-produk" className="shop-toolbar-wrapper">
        <div className="shop-toolbar">
          <div className="shop-search-box">
            <Search size={16} className="shop-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Cari materi atau paket (misal: Vektor, Kelas 11)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shop-search-input"
              aria-label="Cari produk"
            />
            {searchQuery && (
              <button
                type="button"
                className="shop-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Hapus pencarian"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div
            className="shop-filter-tabs"
            role="tablist"
            aria-label="Filter kategori produk"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "semua"}
              className={`shop-filter-tab${activeCategory === "semua" ? " active" : ""}`}
              onClick={() => setActiveCategory("semua")}
            >
              Semua
              <span className="shop-filter-tab-count">{categoryCounts.semua}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "paket-soal"}
              className={`shop-filter-tab${activeCategory === "paket-soal" ? " active" : ""}`}
              onClick={() => setActiveCategory("paket-soal")}
            >
              Paket Soal
              <span className="shop-filter-tab-count">{categoryCounts["paket-soal"]}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "slide"}
              className={`shop-filter-tab${activeCategory === "slide" ? " active" : ""}`}
              onClick={() => setActiveCategory("slide")}
            >
              Slide Presentasi
              <span className="shop-filter-tab-count">{categoryCounts.slide}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "modul-bahan"}
              className={`shop-filter-tab${activeCategory === "modul-bahan" ? " active" : ""}`}
              onClick={() => setActiveCategory("modul-bahan")}
            >
              Modul &amp; Bahan
              <span className="shop-filter-tab-count">{categoryCounts["modul-bahan"]}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "tka"}
              className={`shop-filter-tab${activeCategory === "tka" ? " active" : ""}`}
              onClick={() => setActiveCategory("tka")}
            >
              Latihan TKA
              <span className="shop-filter-tab-count">{categoryCounts.tka}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "satuan"}
              className={`shop-filter-tab${activeCategory === "satuan" ? " active" : ""}`}
              onClick={() => setActiveCategory("satuan")}
            >
              Custom / Satuan
              <span className="shop-filter-tab-count">{categoryCounts.satuan}</span>
            </button>
          </div>
        </div>

        <div className="shop-results-status">
          <span>
            {activeCategory === "satuan"
              ? "Menampilkan opsi pembelian satuan & custom order"
              : `Menampilkan ${filteredProducts.length} paket produk`}
            {searchQuery && ` untuk "${searchQuery}"`}
          </span>
          {searchQuery && (
            <button
              type="button"
              className="shop-btn-reset-filter"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("semua");
              }}
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Product Catalog Grid (Unless user clicked "Item Satuan") */}
      {activeCategory !== "satuan" && (
        <section className="shop-catalog-section" aria-label="Daftar Paket Produk">
          {filteredProducts.length === 0 ? (
            <div className="shop-empty-state">
              <h3>Produk tidak ditemukan</h3>
              <p>Tidak ada paket yang sesuai dengan kata kunci pencarian Anda.</p>
              <button
                type="button"
                className="shop-btn-primary"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("semua");
                }}
              >
                Tampilkan Semua Produk
              </button>
            </div>
          ) : (
            <div className="shop-products-grid">
              {filteredProducts.map((product) => {
                const isExpanded = !!expandedCards[product.id];
                const displayedTopics =
                  product.items && !isExpanded
                    ? product.items.slice(0, 4)
                    : product.items;
                const hiddenCount =
                  product.items && product.items.length > 4
                    ? product.items.length - 4
                    : 0;

                return (
                  <article key={product.id} className="shop-product-card">
                    <div className="shop-card-badge-row">
                      <span className="shop-badge-grade">{product.gradeBadge}</span>
                      {product.promoBadge && (
                        <span className="shop-badge-promo">{product.promoBadge}</span>
                      )}
                    </div>

                    <div className="shop-card-body">
                      <h3 className="shop-card-title">{product.title}</h3>

                      <div className="shop-card-price-row">
                        {product.originalPrice && <del>{product.originalPrice}</del>}
                        <span className="price-val">{product.price}</span>
                      </div>

                      <p className="shop-card-desc">{product.desc}</p>

                      {/* Topic list for packages */}
                      {product.items && (
                        <div className="shop-card-topics-box">
                          <p className="shop-card-topics-header">
                            Materi Lengkap ({product.items.length}):
                          </p>
                          <ul className="shop-card-topics-list">
                            {displayedTopics?.map((topic, idx) => (
                              <li key={topic}>
                                <span className="shop-topic-num">
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                          {hiddenCount > 0 && (
                            <button
                              type="button"
                              className="shop-btn-expand-topics"
                              onClick={() => toggleExpand(product.id)}
                            >
                              {isExpanded ? (
                                <>
                                  Tampilkan Lebih Sedikit <ChevronUp size={13} />
                                </>
                              ) : (
                                <>
                                  + {hiddenCount} Materi Lainnya <ChevronDown size={13} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Benefits list for TKA / Bahan Ajar */}
                      {product.benefits && (
                        <div className="shop-card-topics-box">
                          <p className="shop-card-topics-header">Isi Paket:</p>
                          <ul className="shop-card-topics-list">
                            {product.benefits.map((benefit) => (
                              <li key={benefit}>
                                <Check size={14} className="shop-check-svg" aria-hidden="true" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Format tags */}
                      {product.formats && (
                        <div className="shop-card-format-row">
                          {product.formats.map((fmt) => (
                            <span key={fmt} className="shop-format-pill">
                              {fmt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="shop-card-footer">
                      {/* Primary WhatsApp order button */}
                      <a
                        href={buildWhatsAppOrderLink(product.title, product.price)}
                        target="_blank"
                        rel="noreferrer"
                        className="shop-btn-action-primary"
                      >
                        <MessageCircle size={15} aria-hidden="true" />
                        Pesan via WhatsApp
                      </a>

                      {/* Secondary actions: Preview & Email */}
                      <div className="shop-btn-action-row">
                        {product.previewUrl ? (
                          <a
                            href={`/pratinjau-produk?produk=${encodeURIComponent(product.id)}`}
                            className="shop-btn-action-secondary"
                          >
                            <Eye size={14} aria-hidden="true" />
                            Preview PDF
                          </a>
                        ) : (
                          <a
                            href={WHATSAPP_LINK}
                            target="_blank"
                            rel="noreferrer"
                            className="shop-btn-action-secondary"
                          >
                            <MessageCircle size={14} aria-hidden="true" />
                            Tanya Admin
                          </a>
                        )}

                        <a
                          href={buildEmailLink(product.emailSubject, product.emailBody)}
                          className="shop-btn-action-mail"
                          title="Pesan via Email"
                        >
                          <Mail size={15} aria-hidden="true" />
                          Email
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Satuan & Custom Order Section */}
      {(activeCategory === "semua" || activeCategory === "satuan") && (
        <section
          id="custom-order"
          className="shop-satuan-section"
          aria-label="Pembelian Per File atau Custom"
        >
          <div className="shop-satuan-heading">
            <span className="badge-tag badge-tag--navy">FLEKSIBEL &amp; HEMAT</span>
            <h2>Pembelian Per File atau Kustomisasi</h2>
            <p>
              Hanya butuh satu materi tertentu atau membutuhkan LKPD khusus berbasis
              Discovery / Problem Based Learning? Kami menyediakan opsi satuan dan
              pembuatan bahan ajar kustom sesuai indikator pembelajaran sekolah Anda.
            </p>
          </div>

          <div className="shop-satuan-grid">
            {SATUAN_ITEMS.map((item, idx) => (
              <div key={idx} className="shop-satuan-card">
                <div className="shop-satuan-icon" aria-hidden="true">
                  {item.icon}
                </div>
                <h3 className="shop-satuan-title">{item.label}</h3>
                <div className="shop-satuan-price">{item.price}</div>
                <p className="shop-satuan-desc">{item.desc}</p>

                <div className="shop-satuan-actions">
                  <a
                    href={buildWhatsAppOrderLink(item.label, item.price, true)}
                    target="_blank"
                    rel="noreferrer"
                    className="shop-satuan-btn-wa"
                  >
                    <MessageCircle size={14} aria-hidden="true" />
                    Pesan via WhatsApp
                  </a>
                  <a
                    href={buildEmailLink(
                      `Permintaan Preview ${item.label} — Math 1729`,
                      buildSatuanEmailBody(item),
                    )}
                    className="shop-satuan-btn-mail"
                  >
                    <Mail size={13} aria-hidden="true" />
                    Minta Preview via Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cara Memesan (3-Step Order Flow) */}
      <section id="cara-memesan" className="shop-flow-section" aria-label="Alur Pemesanan">
        <div className="shop-flow-header">
          <span className="badge-tag badge-tag--navy">PANDUAN PEMESANAN</span>
          <h2>Cara Memesan Produk di Math 1729</h2>
          <p>Proses pemesanan mudah, cepat, dan transparan dalam 3 langkah sederhana.</p>
        </div>

        <div className="shop-flow-steps-grid">
          <div className="shop-flow-card">
            <span className="shop-flow-step-num">LANGKAH 01</span>
            <strong>Pilih Produk &amp; Tinjau Preview</strong>
            <p>
              Pilih paket materi yang Anda butuhkan. Anda dapat membuka tombol{" "}
              <em>Preview PDF</em> pada setiap kartu produk untuk memastikan kesesuaian isi materi.
            </p>
          </div>

          <div className="shop-flow-card">
            <span className="shop-flow-step-num">LANGKAH 02</span>
            <strong>Konfirmasi &amp; Transfer Pembayaran</strong>
            <p>
              Hubungi admin melalui WhatsApp atau Email. Lakukan transfer ke salah satu
              rekening resmi (BNI, BRI, ShopeePay) lalu kirimkan bukti pembayaran.
            </p>
          </div>

          <div className="shop-flow-card">
            <span className="shop-flow-step-num">LANGKAH 03</span>
            <strong>Terima File Asli (&lt; 1 Jam)</strong>
            <p>
              File dokumen lengkap dalam format <code>.pdf</code> siap cetak dan source code{" "}
              <code>.tex</code> akan dikirimkan langsung maksimal 1 jam setelah konfirmasi.
            </p>
          </div>
        </div>
      </section>

      {/* Informasi Rekening Pembayaran Terverifikasi */}
      <section className="shop-payment-section" aria-label="Informasi Rekening Pembayaran">
        <div className="shop-payment-header">
          <h2>Metode &amp; Rekening Pembayaran Resmi</h2>
          <p>
            Pastikan rekening tujuan atas nama <strong>{ACCOUNT_HOLDER}</strong>.
            Salin nomor rekening dengan sekali klik di bawah ini:
          </p>
        </div>

        <div className="shop-bank-accounts-grid">
          {PAYMENT_METHODS.map((method) => {
            const isCopied = copiedAccount === method.account;
            return (
              <div key={method.name} className="shop-bank-account-card">
                <span className="shop-bank-badge">{method.name}</span>
                <div className="shop-bank-number-row">
                  <span className="shop-bank-number">{method.account}</span>
                  <button
                    type="button"
                    className="shop-btn-copy-acc"
                    onClick={() => copyToClipboard(method.account)}
                    title={`Salin nomor rekening ${method.name}`}
                  >
                    {isCopied ? (
                      <>
                        <CheckCheck size={13} /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Salin
                      </>
                    )}
                  </button>
                </div>
                <span className="shop-bank-holder">
                  Atas Nama: <strong>{ACCOUNT_HOLDER}</strong>
                </span>
              </div>
            );
          })}
        </div>

        <div className="shop-payment-note-box">
          <strong>Penting:</strong> Pembayaran dilakukan setelah Anda memeriksa pratinjau dokumen.
          Lampirkan bukti pembayaran saat menghubungi admin melalui WhatsApp atau email untuk
          mempercepat verifikasi pesanan.
        </div>
      </section>

      {/* Ketentuan & FAQ Accordion */}
      <section className="shop-faq-section" aria-label="Pertanyaan yang Sering Diajukan">
        <div className="shop-faq-header">
          <span className="badge-tag badge-tag--navy">BANTUAN &amp; FAQ</span>
          <h2>Pertanyaan yang Sering Diajukan</h2>
          <p>Jawaban atas hal-hal yang sering ditanyakan pengajar dan pembeli produk kami.</p>
        </div>

        <div className="shop-faq-list">
          <div className="shop-faq-item">
            <strong>Format file apa saja yang akan saya terima?</strong>
            <p>
              Setiap paket dokumen menyertakan file <code>.pdf</code> (kualitas tinggi, siap cetak)
              dan file <code>.tex</code> (source code LaTeX asli yang dapat diedit di Overleaf
              maupun TeXstudio).
            </p>
          </div>

          <div className="shop-faq-item">
            <strong>Bolehkah saya memodifikasi file .tex untuk kebutuhan kelas?</strong>
            <p>
              Ya, Anda memiliki lisensi penuh untuk mengedit, menambah, atau menyesuaikan soal
              dan slide untuk keperluan pengajaran di kelas sendiri. Dilarang keras menjual
              kembali atau mendistribusikan secara publik.
            </p>
          </div>

          <div className="shop-faq-item">
            <strong>Berapa lama file dikirimkan setelah pembayaran?</strong>
            <p>
              File asli akan dikirimkan maksimal <strong>1 jam</strong> setelah bukti pembayaran
              diterima dan diverifikasi oleh admin kami.
            </p>
          </div>

          <div className="shop-faq-item">
            <strong>Bagaimana jika file belum saya terima lebih dari 1 jam?</strong>
            <p>
              Jika dalam 1 jam belum menerima file, segera hubungi admin via WhatsApp di{" "}
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                {PHONE_WA}
              </a>
              . Kemungkinan antrean pesanan sedang padat dan akan diprioritaskan segera.
            </p>
          </div>

          <div className="shop-faq-item">
            <strong>Apakah ada kunci jawaban dan pembahasan untuk paket soal?</strong>
            <p>
              Ya, semua paket soal per kelas telah dilengkapi dengan kunci jawaban dan uraian
              pembahasan langkah demi langkah yang rapi.
            </p>
          </div>

          <div className="shop-faq-item">
            <strong>Bagaimana jika saya ingin memesan materi khusus (custom)?</strong>
            <p>
              Pilih menu <em>Item Satuan / Custom</em> atau langsung hubungi admin melalui
              WhatsApp. Kami dapat menyusun soal, kisi-kisi, atau LKPD sesuai KD dan indikator
              spesifik sekolah Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Support Direct Banner */}
      <section className="shop-support-card" aria-label="Bantuan dan Konsultasi Langsung">
        <div className="shop-support-badge-icon" aria-hidden="true">
          <MessageCircle size={26} />
        </div>
        <div className="shop-support-info">
          <h3>Butuh Bantuan atau Mau Tanya Materi Dulu?</h3>
          <p>
            Admin Math 1729 siap membantu rekomendasi paket materi yang paling cocok untuk
            tingkat kelas atau kebutuhan ujian Anda.
          </p>
        </div>
        <div className="shop-support-actions">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="shop-support-wa-btn"
          >
            <MessageCircle size={18} aria-hidden="true" />
            <span>Hubungi Admin via WhatsApp</span>
          </a>
          <span className="shop-support-wa-hint">Nomor: {PHONE_WA}</span>
        </div>
      </section>
    </main>
  );
}
