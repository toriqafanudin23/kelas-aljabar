import { useState } from "react";
import { materials } from "../materi";
import type { Navigate } from "../types/navigation";
import { getPathFromPage } from "../types/navigation";
import { CourseCard } from "../components/CourseCard";
import { Formula } from "../components/Formula";

interface HomePageProps {
  navigate: Navigate;
}

type HeroTabKey = "ramanujan" | "euler" | "calculus";
type PathwayFilterKey = "all" | "fase-e" | "fase-f" | "fase-f-lanjut" | "osn";
type ShowcaseCategoryKey =
  "featured" | "algebra" | "calculus" | "geometry-olympiad";

const HERO_PROOFS: Record<
  HeroTabKey,
  {
    tabLabel: string;
    title: string;
    formula: string;
    description: string;
    moduleSlug: string;
    moduleTag: string;
  }
> = {
  ramanujan: {
    tabLabel: "1729 Ramanujan",
    title: "Bilangan Taksi Hardy-Ramanujan",
    formula: "1729 = 1^3 + 12^3 = 9^3 + 10^3",
    description:
      "Bilangan bulat positif terkecil yang dapat dinyatakan sebagai penjumlahan dua kubus positif dalam dua cara berbeda. Bukti dedikasi terhadap eksplorasi murni teori bilangan.",
    moduleSlug: "teori-bilangan",
    moduleTag: "Olimpiade · Teori Bilangan",
  },
  euler: {
    tabLabel: "Identitas Euler",
    title: "Harmoni 5 Konstanta Fundamental",
    formula: "e^{i\\pi} + 1 = 0",
    description:
      "Menghubungkan analisis riil, geometri trigonometri, dan aljabar kompleks dalam satu persamaan paling elegan dalam sejarah matematika manusia.",
    moduleSlug: "bilangan-kompleks",
    moduleTag: "Fase F · Bilangan Kompleks",
  },
  calculus: {
    tabLabel: "Teorema Kalkulus",
    title: "Teorema Dasar Kalkulus (FTC I)",
    formula: "\\frac{d}{dx} \\left[ \\int_a^x f(t)\\,dt \\right] = f(x)",
    description:
      "Jembatan analitis yang membuktikan bahwa diferensiasi dan integrasi adalah dua operasi yang saling invers, menjadi fondasi sains dan rekayasa modern.",
    moduleSlug: "integral",
    moduleTag: "Fase F Lanjut · Integral",
  },
};

export function HomePage({ navigate }: HomePageProps) {
  const [activeHeroTab, setActiveHeroTab] = useState<HeroTabKey>("ramanujan");
  const [activePathwayFilter, setActivePathwayFilter] =
    useState<PathwayFilterKey>("all");
  const [activeShowcase, setActiveShowcase] =
    useState<ShowcaseCategoryKey>("featured");

  const currentProof = HERO_PROOFS[activeHeroTab];

  // Modul untuk showcase berdasarkan kategori
  const getShowcaseMaterials = () => {
    switch (activeShowcase) {
      case "algebra":
        return materials.filter((m) =>
          ["eksponensial", "sppl", "fungsi-kuadrat", "polinomial"].includes(
            m.slug,
          ),
        );
      case "calculus":
        return materials.filter((m) =>
          ["limit", "turunan", "integral"].includes(m.slug),
        );
      case "geometry-olympiad":
        return materials.filter((m) =>
          [
            "vektor",
            "lingkaran",
            "transformasi-geometri",
            "teori-bilangan",
          ].includes(m.slug),
        );
      case "featured":
      default:
        return materials.filter((m) =>
          ["matriks", "kombinatorika", "turunan", "bilangan-kompleks"].includes(
            m.slug,
          ),
        );
    }
  };

  const showcaseMaterials = getShowcaseMaterials();

  return (
    <>
      {/* Hero Section */}
      <section className="hero-band">
        <div className="site-width hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Standar Akademis Terstruktur · Kurikulum Prestasi
            </span>
            <h1>
              Kuasai matematika dalam <em>30 hari.</em>
            </h1>
            <p>
              Platform pembelajaran matematika komprehensif yang disusun dengan
              ketelitian teoritis formal, penalaran analitis UTBK-SNBT, dan
              pembinaan intensif Olimpiade Sains Nasional (OSN). Disajikan
              secara berjenjang tanpa lompatan logika.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href="/katalog"
                onClick={(event) => navigate(event, "catalog")}
              >
                Jelajahi 22 Modul Lengkap <span aria-hidden="true">→</span>
              </a>
              <a
                className="button button-quiet"
                href="/eksponensial"
                onClick={(event) => navigate(event, "eksponensial")}
              >
                <span>Mulai dari Modul 01</span>
                <span aria-hidden="true">→</span>
              </a>
              <a
                className="button button-quiet"
                href="/unduh"
                onClick={(event) => navigate(event, "download")}
              >
                <span className="hero-new-tag">Aset</span>
                <span>Slide Presentasi</span>
              </a>
            </div>
          </div>

          {/* Hero Rigor / Proof Engine Card */}
          <aside
            className="proof-engine-card"
            aria-label="Ramanujan Rigor Engine"
          >
            <div className="proof-engine-header">
              <span className="proof-engine-title">
                <span className="proof-pulse-dot" />
                Math 1729 / Rigor Engine
              </span>
              <span className="proof-engine-badge">Standar Notasi KaTeX</span>
            </div>

            <div className="proof-engine-tabs" role="tablist">
              {(Object.keys(HERO_PROOFS) as HeroTabKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeHeroTab === key}
                  className={`proof-tab-btn ${activeHeroTab === key ? "active" : ""}`}
                  onClick={() => setActiveHeroTab(key)}
                >
                  {HERO_PROOFS[key].tabLabel}
                </button>
              ))}
            </div>

            <div className="proof-display-body">
              <div className="proof-formula-screen">
                <Formula math={currentProof.formula} />
              </div>
              <h3 className="proof-explanation-title">{currentProof.title}</h3>
              <p className="proof-explanation-desc">
                {currentProof.description}
              </p>
            </div>

            <div className="proof-engine-footer">
              <span className="proof-module-tag">{currentProof.moduleTag}</span>
              <a
                href={getPathFromPage(currentProof.moduleSlug)}
                className="proof-action-link"
                onClick={(e) => navigate(e, currentProof.moduleSlug)}
              >
                Pelajari Pembuktian Modul <span aria-hidden="true">→</span>
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Trust & Proof Metrics Strip */}
      <section
        className="trust-metrics-strip"
        aria-label="Statistik dan Bukti Kredibilitas"
      >
        <div className="site-width">
          <div className="trust-metrics-grid">
            <div className="trust-metric-item">
              <span className="trust-metric-val">
                22<em>+</em>
              </span>
              <strong className="trust-metric-title">
                Modul Akademis Lengkap
              </strong>
              <span className="trust-metric-desc">
                Mencakup kurikulum Fase E, Fase F, Fase F Lanjut, hingga materi
                OSN.
              </span>
            </div>
            <div className="trust-metric-item">
              <span className="trust-metric-val">
                100<em>%</em>
              </span>
              <strong className="trust-metric-title">
                Notasi Presisi KaTeX
              </strong>
              <span className="trust-metric-desc">
                Simbol dan formula matematis berstandar jurnal ilmiah
                internasional.
              </span>
            </div>
            <div className="trust-metric-item">
              <span className="trust-metric-val">
                3<em> Tahap</em>
              </span>
              <strong className="trust-metric-title">
                Alur Prasyarat Runtut
              </strong>
              <span className="trust-metric-desc">
                Dirancang dari penguasaan konsep dasar hingga aplikasi pemodelan
                rumit.
              </span>
            </div>
            <div className="trust-metric-item">
              <span className="trust-metric-val">OSN &amp; SNBT</span>
              <strong className="trust-metric-title">
                Standar Soal Penalaran
              </strong>
              <span className="trust-metric-desc">
                Melatih penalaran matematis murni dan pemecahan masalah
                non-rutin.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pilar Keunggulan Platform */}
      <section
        className="pillars-section"
        aria-label="Standar Keunggulan Math 1729"
      >
        <div className="site-width">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Standar Kualitas &amp; Rigoritas
              </span>
              <h2>Mengapa Belajar di Math 1729?</h2>
              <p>
                Fondasi pendidikan matematika modern yang mengedepankan
                pemahaman konseptual mendalam, bukan sekadar hafalan rumus
                instan.
              </p>
            </div>
          </div>

          <div className="pillars-grid">
            <article className="pillar-card">
              <span className="pillar-badge-num">PILAR 01</span>
              <h3>Rigoritas Konseptual &amp; Bukti Formal</h3>
              <p>
                Setiap teorema, identitas, dan sifat aljabar dijabarkan dari
                aksioma dasar, penurunan matematis runtut, dan makna
                intuitifnya. Siswa mengerti asal-usul rumus.
              </p>
              <span className="pillar-footer-tag">Standar Akademik Formal</span>
            </article>

            <article className="pillar-card">
              <span className="pillar-badge-num">PILAR 02</span>
              <h3>Alur Prasyarat Tanpa Celah (Zero Gaps)</h3>
              <p>
                Setiap modul mencantumkan prasyarat materi sebelumnya secara
                eksplisit. Tidak ada materi lanjutan yang diajarkan sebelum
                fondasi dasarnya dikuasai dengan kokoh.
              </p>
              <span className="pillar-footer-tag">
                Pemetaan Kurikulum Terarah
              </span>
            </article>

            <article className="pillar-card">
              <span className="pillar-badge-num">PILAR 03</span>
              <h3>Penalaran Analitis &amp; Soal Non-Rutin</h3>
              <p>
                Disusun khusus untuk melatih ketajaman nalar tingkat tinggi
                (HOTS) yang diujikan pada UTBK-SNBT (Penalaran Matematika) serta
                seleksi kompetisi sains nasional (OSN).
              </p>
              <span className="pillar-footer-tag">
                Kesiapan Kompetisi &amp; Ujian
              </span>
            </article>

            <article className="pillar-card">
              <span className="pillar-badge-num">PILAR 04</span>
              <h3>Lingkungan Bebas Distraksi &amp; Presisi</h3>
              <p>
                Antarmuka belajar bersih tanpa banner iklan atau elemen
                mengganggu, dilengkapi dengan visualisasi grafik interaktif dan
                render formula matematika berkecepatan tinggi.
              </p>
              <span className="pillar-footer-tag">100% Fokus Pembelajaran</span>
            </article>
          </div>
        </div>
      </section>

      {/* Alur Prasyarat Belajar Interaktif */}
      <section id="pathway" className="site-width learning-pathway-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Peta Navigasi Kurikulum</span>
            <h2>Alur Belajar Berjenjang (Fase E s.d. Olimpiade)</h2>
            <p>
              Klik modul di bawah untuk langsung membuka materi pembelajaran
              sesuai tahapan kesiapan Anda.
            </p>
          </div>
        </div>

        {/* Filter Jenjang */}
        <div
          className="pathway-filter-bar"
          role="tablist"
          aria-label="Filter Jenjang Belajar"
        >
          <button
            type="button"
            className={`pathway-filter-btn ${activePathwayFilter === "all" ? "active" : ""}`}
            onClick={() => setActivePathwayFilter("all")}
          >
            Semua Jenjang ({materials.length} Modul)
          </button>
          <button
            type="button"
            className={`pathway-filter-btn ${activePathwayFilter === "fase-e" ? "active" : ""}`}
            onClick={() => setActivePathwayFilter("fase-e")}
          >
            Kelas X (Fase E)
          </button>
          <button
            type="button"
            className={`pathway-filter-btn ${activePathwayFilter === "fase-f" ? "active" : ""}`}
            onClick={() => setActivePathwayFilter("fase-f")}
          >
            Kelas XI (Fase F)
          </button>
          <button
            type="button"
            className={`pathway-filter-btn ${activePathwayFilter === "fase-f-lanjut" ? "active" : ""}`}
            onClick={() => setActivePathwayFilter("fase-f-lanjut")}
          >
            Kelas XII (Fase F Lanjut)
          </button>
          <button
            type="button"
            className={`pathway-filter-btn ${activePathwayFilter === "osn" ? "active" : ""}`}
            onClick={() => setActivePathwayFilter("osn")}
          >
            Pengayaan Olimpiade (OSN)
          </button>
        </div>

        <div className="pathway-grid">
          {/* Tahap 1: Kelas X */}
          {(activePathwayFilter === "all" ||
            activePathwayFilter === "fase-e") && (
            <div className="pathway-interactive-card highlight">
              <div className="pathway-step">Tahap 1 · Fondasi Dasar</div>
              <h4>Kelas X (Fase E)</h4>
              <p className="pathway-desc">
                Penguatan konsep aljabar dasar, sistem relasi analitis,
                trigonometri fundamental, serta pengolahan data dan
                probabilitas.
              </p>
              <div className="pathway-modules-flow">
                {[
                  {
                    slug: "eksponensial",
                    id: "01",
                    name: "Eksponensial & Logaritma",
                  },
                  { slug: "barisan-deret", id: "02", name: "Barisan & Deret" },
                  { slug: "vektor", id: "03", name: "Vektor Dimensi 2 & 3" },
                  {
                    slug: "trigonometri",
                    id: "04",
                    name: "Perbandingan Trigonometri",
                  },
                  {
                    slug: "sppl",
                    id: "05",
                    name: "Sistem Persamaan & Pertidaksamaan Linear",
                  },
                  { slug: "fungsi-kuadrat", id: "06", name: "Fungsi Kuadrat" },
                  {
                    slug: "statistika",
                    id: "07",
                    name: "Statistika Deskriptif",
                  },
                  { slug: "peluang", id: "08", name: "Peluang & Kaidah Dasar" },
                ].map((item) => (
                  <a
                    key={item.slug}
                    href={`/${item.slug}`}
                    className="pathway-mod-link"
                    onClick={(e) => navigate(e, item.slug)}
                  >
                    <span>
                      <strong className="pathway-mod-id">{item.id}.</strong>{" "}
                      {item.name}
                    </span>
                    <span className="pathway-mod-action" aria-hidden="true">
                      Buka →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tahap 2: Kelas XI */}
          {(activePathwayFilter === "all" ||
            activePathwayFilter === "fase-f") && (
            <div className="pathway-interactive-card">
              <div className="pathway-step">
                Tahap 2 · Aljabar &amp; Geometri Lanjut
              </div>
              <h4>Kelas XI (Fase F)</h4>
              <p className="pathway-desc">
                Perluasan relasi fungsi, geometri lingkaran analitik, perluasan
                sistem bilangan riil ke bidang kompleks, polinomial tingkat
                tinggi, serta operasi matriks.
              </p>
              <div className="pathway-modules-flow">
                {[
                  {
                    slug: "komposisi-fungsi-dan-invers",
                    id: "09",
                    name: "Komposisi Fungsi & Invers",
                  },
                  {
                    slug: "lingkaran",
                    id: "10",
                    name: "Persamaan & Garis Singgung Lingkaran",
                  },
                  {
                    slug: "bilangan-kompleks",
                    id: "11",
                    name: "Bilangan Kompleks & Diagram Argand",
                  },
                  {
                    slug: "polinomial",
                    id: "12",
                    name: "Polinomial & Teorema Sisa",
                  },
                  {
                    slug: "matriks",
                    id: "13",
                    name: "Aljabar Matriks & Determinan",
                  },
                  {
                    slug: "transformasi-geometri",
                    id: "14",
                    name: "Transformasi Geometri",
                  },
                ].map((item) => (
                  <a
                    key={item.slug}
                    href={`/${item.slug}`}
                    className="pathway-mod-link"
                    onClick={(e) => navigate(e, item.slug)}
                  >
                    <span>
                      <strong className="pathway-mod-id">{item.id}.</strong>{" "}
                      {item.name}
                    </span>
                    <span className="pathway-mod-action" aria-hidden="true">
                      Buka →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tahap 3: Kelas XII */}
          {(activePathwayFilter === "all" ||
            activePathwayFilter === "fase-f-lanjut") && (
            <div className="pathway-interactive-card">
              <div className="pathway-step">
                Tahap 3 · Analisis &amp; Kalkulus
              </div>
              <h4>Kelas XII (Fase F Lanjut)</h4>
              <p className="pathway-desc">
                Pemodelan tingkat lanjut, irisan kerucut analitis, teknik
                pencacahan kombinatorika, serta cabang kalkulus diferensial dan
                integral komprehensif.
              </p>
              <div className="pathway-modules-flow">
                {[
                  {
                    slug: "fungsi-pemodelan",
                    id: "15",
                    name: "Fungsi dan Pemodelan",
                  },
                  {
                    slug: "transformasi-fungsi",
                    id: "16",
                    name: "Transformasi Fungsi",
                  },
                  {
                    slug: "kombinatorika",
                    id: "17",
                    name: "Kombinatorika & Binomial Newton",
                  },
                  {
                    slug: "irisan-kerucut",
                    id: "18",
                    name: "Irisan Kerucut (Konik)",
                  },
                  {
                    slug: "limit",
                    id: "19",
                    name: "Limit Fungsi Aljabar & Trigonometri",
                  },
                  {
                    slug: "turunan",
                    id: "20",
                    name: "Turunan Fungsi & Optimasi",
                  },
                  {
                    slug: "integral",
                    id: "21",
                    name: "Integral Tak Tentu & Luas Daerah",
                  },
                ].map((item) => (
                  <a
                    key={item.slug}
                    href={`/${item.slug}`}
                    className="pathway-mod-link"
                    onClick={(e) => navigate(e, item.slug)}
                  >
                    <span>
                      <strong className="pathway-mod-id">{item.id}.</strong>{" "}
                      {item.name}
                    </span>
                    <span className="pathway-mod-action" aria-hidden="true">
                      Buka →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tahap Pengayaan OSN */}
          {(activePathwayFilter === "all" || activePathwayFilter === "osn") && (
            <div className="pathway-interactive-card highlight">
              <div className="pathway-step">Pengayaan Khusus · OSN</div>
              <h4>Pembinaan Prestasi Olimpiade</h4>
              <p className="pathway-desc">
                Materi matematika murni non-sekolah untuk persiapan Kompetisi
                Sains Madrasah (KSM), Olimpiade Sains Nasional (OSN), dan
                kompetisi matematika universitas.
              </p>
              <div className="pathway-modules-flow">
                {[
                  {
                    slug: "teori-bilangan",
                    id: "OSN",
                    name: "Teori Bilangan & Kongruensi Modulo",
                  },
                ].map((item) => (
                  <a
                    key={item.slug}
                    href={`/${item.slug}`}
                    className="pathway-mod-link"
                    onClick={(e) => navigate(e, item.slug)}
                  >
                    <span>
                      <strong className="pathway-mod-id">{item.id}.</strong>{" "}
                      {item.name}
                    </span>
                    <span className="pathway-mod-action" aria-hidden="true">
                      Buka →
                    </span>
                  </a>
                ))}
                <div
                  style={{
                    padding: "8px 10px",
                    fontSize: "11px",
                    color: "var(--muted)",
                    background: "#fafafa",
                  }}
                >
                  <em>
                    Modul geometri sintetis &amp; ketaksamaan aljabar olimpiade
                    sedang disiapkan.
                  </em>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Curated Showcase Section */}
      <section id="materi" className="site-width catalog-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Eksplorasi Modul Pilihan</span>
            <h2>Kurikulum Unggulan Terkurasi</h2>
            <p>
              Kumpulan materi terpopuler yang telah dilengkapi penjelasan
              formal, visualisasi interaktif, dan penurunan rumus terperinci.
            </p>
          </div>
          <a
            className="button button-quiet"
            href="/katalog"
            onClick={(event) => navigate(event, "catalog")}
          >
            Lihat Semua {materials.length} Modul di Katalog{" "}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Showcase Category Tabs */}
        <div className="showcase-filter-bar" role="tablist">
          <button
            type="button"
            className={`showcase-tab-btn ${activeShowcase === "featured" ? "active" : ""}`}
            onClick={() => setActiveShowcase("featured")}
          >
            Paling Populer
          </button>
          <button
            type="button"
            className={`showcase-tab-btn ${activeShowcase === "algebra" ? "active" : ""}`}
            onClick={() => setActiveShowcase("algebra")}
          >
            Aljabar &amp; Sistem Persamaan
          </button>
          <button
            type="button"
            className={`showcase-tab-btn ${activeShowcase === "calculus" ? "active" : ""}`}
            onClick={() => setActiveShowcase("calculus")}
          >
            Kalkulus &amp; Analisis
          </button>
          <button
            type="button"
            className={`showcase-tab-btn ${activeShowcase === "geometry-olympiad" ? "active" : ""}`}
            onClick={() => setActiveShowcase("geometry-olympiad")}
          >
            Geometri &amp; Olimpiade
          </button>
        </div>

        <div className="course-grid">
          {showcaseMaterials.map((material) => (
            <CourseCard
              key={material.slug}
              material={material}
              navigate={navigate}
            />
          ))}
        </div>
      </section>

      {/* Future Premium / Value Assurance Box */}
      <section
        className="premium-future-band"
        aria-label="Rencana Keanggotaan dan Pembinaan"
      >
        <div className="site-width">
          <div className="premium-future-box">
            <div className="future-tier-item">
              <span className="future-tier-badge tier-open">
                Komitmen Publik
              </span>
              <h3>Akses Terbuka Selamanya</h3>
              <p>
                Math 1729 berkomitmen menjaga seluruh silabus bacaan dasar,
                konsep matematika, dan contoh latihan esensial tetap dapat
                diakses bebas oleh seluruh siswa di seluruh pelosok Indonesia.
              </p>
              <ul className="future-tier-list">
                <li>
                  <span className="future-check-icon">✓</span> 22 Modul Lengkap
                  Kurikulum Matematika SMA
                </li>
                <li>
                  <span className="future-check-icon">✓</span> Render Formula
                  KaTeX Definisi &amp; Teorema
                </li>
                <li>
                  <span className="future-check-icon">✓</span> Peta Alur
                  Prasyarat Antar Topik
                </li>
                <li>
                  <span className="future-check-icon">✓</span> Akses Bebas Iklan
                  Distraktif
                </li>
              </ul>
            </div>

            <div className="future-tier-item">
              <span className="future-tier-badge tier-premium">
                Rencana Program Premium
              </span>
              <h3>Pembinaan Intensif &amp; Bank Soal Terbimbing</h3>
              <p>
                Ke depannya, Math 1729 akan menghadirkan program berbayar berupa
                pendampingan belajar intensif bagi siswa yang menargetkan skor
                UTBK 700+ dan medali OSN Matematika.
              </p>
              <ul className="future-tier-list">
                <li>
                  <span className="future-check-icon">★</span> Bank Soal
                  Non-Rutin dengan Video Bedah Solusi Langkah demi Langkah
                </li>
                <li>
                  <span className="future-check-icon">★</span> Kelas Mentoring
                  Mingguan &amp; Diskusi Pembuktian Teorema
                </li>
                <li>
                  <span className="future-check-icon">★</span> Modul Interaktif
                  Eksplorasi Geometri &amp; Analisis Real-Time
                </li>
                <li>
                  <span className="future-check-icon">★</span> Sesi Konsultasi
                  Privat Pemecahan Masalah Matematika
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility & Founder Section */}
      <section
        className="credibility-section"
        aria-label="Filosofi dan Pengembang"
      >
        <div className="site-width credibility-grid">
          <div className="ramanujan-story">
            <span className="section-kicker">Filosofi Nama 1729</span>
            <h2>Dedikasi pada Keindahan &amp; Kejujuran Matematika</h2>
            <p>
              Nama portal ini terinspirasi dari percakapan legendaris antara
              G.H. Hardy dan matematikawan jenius Srinivasa Ramanujan mengenai
              nomor taksi <strong>1729</strong>. Ketika Hardy menganggap angka
              itu biasa saja, Ramanujan seketika menyadari bahwa 1729 adalah
              bilangan bulat terkecil yang dapat dinyatakan sebagai penjumlahan
              dua bilangan kubik dengan dua cara berbeda:
            </p>
            <div className="formula-quote-box">
              <Formula math="1729 = 1^3 + 12^3 = 9^3 + 10^3" />
              <strong>Prinsip Ketelitian Penuh</strong>
              <span>
                Semangat inilah yang menjadi jiwa platform: setiap konsep
                matematika menyimpan keindahan tersembunyi yang dapat dipahami
                siapapun jika diajarkan dengan ketelitian dan kejernihan logika
                yang tepat.
              </span>
            </div>
          </div>

          <div className="founder-profile-card">
            <div className="founder-badge-row">
              <div className="founder-avatar" aria-hidden="true">
                TA
              </div>
              <div className="founder-info">
                <h3>Toriq Afanudin</h3>
                <p>Pengajar Matematika · Wonosobo, Jawa Tengah</p>
              </div>
            </div>
            <p className="founder-mission">
              &ldquo;Misi saya adalah memastikan setiap pelajar di Indonesia
              memiliki akses ke pembelajaran matematika yang presisi, mendalam,
              dan terhormat secara akademis—membangun daya nalar kritis generasi
              penerus bangsa.&rdquo;
            </p>
            <div className="founder-connect">
              <a href="/tentang" onClick={(event) => navigate(event, "about")}>
                Profil Selengkapnya <span aria-hidden="true">→</span>
              </a>
              <a
                href="mailto:pesan.math1729@gmail.com"
                aria-label="Kirim surel ke Toriq Afanudin"
              >
                Hubungi Pengajar ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact Closing CTA Banner */}
      <section className="cta-banner-section" aria-label="Mulai Belajar">
        <div className="site-width cta-banner-content">
          <span
            className="eyebrow"
            style={{
              background: "rgba(250, 204, 21, 0.15)",
              borderColor: "var(--gold)",
              color: "var(--gold-light)",
            }}
          >
            Langkah Pertama Menuju Keunggulan
          </span>
          <h2>Kuasai Matematika Secara Mendalam Hari Ini.</h2>
          <p>
            Tinggalkan cara menghafal tanpa pemahaman. Mulai bangun intuisi dan
            ketajaman analitis Anda melalui silabus terstruktur Math 1729.
          </p>
          <div className="cta-banner-actions">
            <a
              className="button button-primary"
              href="/eksponensial"
              onClick={(event) => navigate(event, "eksponensial")}
            >
              Mulai dari Modul 01: Eksponensial{" "}
              <span aria-hidden="true">→</span>
            </a>
            <a
              className="button button-quiet"
              href="/katalog"
              onClick={(event) => navigate(event, "catalog")}
            >
              Buka Katalog Lengkap ({materials.length} Modul)
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
