import { lazy, Suspense, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  Layers,
  Presentation,
  Sliders,
} from "lucide-react";
import { materials } from "../materi";
import type { Navigate } from "../types/navigation";

const HeroDerivativeSimulation = lazy(() =>
  import("../components/simulation/HeroDerivativeSimulation").then((m) => ({
    default: m.HeroDerivativeSimulation,
  })),
);

interface HomePageProps {
  navigate: Navigate;
}

type PathwayFilterKey = "all" | "fase-e" | "fase-f" | "fase-f-lanjut";

export function HomePage({ navigate }: HomePageProps) {
  const [activePathwayFilter, setActivePathwayFilter] =
    useState<PathwayFilterKey>("all");

  return (
    <>
      {/* 1. Hero Section */}
      <section className="hero-band">
        <div className="site-width hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Math 1729 · Portal Pembelajaran &amp; Bahan Ajar Matematika
            </span>
            <h1>
              Platform Terpadu <em>Pembelajaran &amp; Perangkat Ajar</em> Matematika
            </h1>
            <p>
              Membantu proses belajar-mengajar matematika berjalan lebih efektif,
              presisi, dan terstruktur. Tersedia materi kurikulum lengkap, latihan
              soal interaktif, simulasi konsep visual, serta bahan ajar siap pakai
              (modul ajar, slide presentasi, bank soal, dan LKPD) untuk guru dan siswa.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href="/simulasi"
                onClick={(event) => navigate(event, "simulation")}
              >
                Simulasi Matematika <span aria-hidden="true">→</span>
              </a>
              <a
                className="button button-quiet"
                href="/beli"
                onClick={(event) => navigate(event, "shop")}
              >
                Beli Produk Digital <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Hero Simulation (Autonomous JSXGraph Derivative Simulation) */}
          <Suspense
            fallback={
              <div
                className="hero-sim-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "440px",
                  background: "#051f33",
                  color: "#cbd5e1",
                  fontSize: "0.875rem",
                }}
              >
                <span>Memuat pratinjau simulasi...</span>
              </div>
            }
          >
            <HeroDerivativeSimulation navigate={navigate} />
          </Suspense>
        </div>
      </section>

      {/* 3. Empat Pilar Platform */}
      <section className="pillars-section" aria-label="Pilar Platform Pembelajaran">
        <div className="site-width">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Ekosistem Pembelajaran Terintegrasi</span>
              <h2>4 Pilar Pembelajaran Math 1729</h2>
              <p>
                Dirancang secara sistematis untuk menjawab kebutuhan pemahaman konsep
                siswa sekaligus mempermudah persiapan mengajar guru di kelas.
              </p>
            </div>
          </div>

          <div className="pillars-grid">
            {/* Pilar 1 */}
            <div className="pillar-card">
              <div className="pillar-badge-num">01 · MATERI LENGKAP</div>
              <div className="pillar-icon-box" aria-hidden="true">
                <BookOpen size={18} />
              </div>
              <h3>Materi Berjenjang SMA</h3>
              <p>
                22 modul pembelajaran komprehensif mulai dari fondasi aljabar,
                trigonometri, geometri analitik, hingga kalkulus diferensial dan
                integral dengan notasi presisi KaTeX.
              </p>
              <a
                href="/katalog"
                className="pillar-action-link"
                onClick={(e) => navigate(e, "catalog")}
              >
                Buka Katalog Materi <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>

            {/* Pilar 2 */}
            <div className="pillar-card">
              <div className="pillar-badge-num">02 · UJI MANDIRI</div>
              <div className="pillar-icon-box" aria-hidden="true">
                <CheckCircle2 size={18} />
              </div>
              <h3>Latihan Soal Interaktif</h3>
              <p>
                Uji pemahaman topik secara terukur melalui soal interaktif dengan
                kunci jawaban, analisis skor, dan pembahasan langkah demi langkah
                untuk persiapan ulangan hingga UTBK-SNBT.
              </p>
              <a
                href="/latihan-soal"
                className="pillar-action-link"
                onClick={(e) => navigate(e, "practice")}
              >
                Mulai Latihan Soal <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>

            {/* Pilar 3 */}
            <div className="pillar-card">
              <div className="pillar-badge-num">03 · EKSPLORASI VISUAL</div>
              <div className="pillar-icon-box" aria-hidden="true">
                <Sliders size={18} />
              </div>
              <h3>Simulasi Visual Dinamis</h3>
              <p>
                Eksplorasi konsep abstrak seperti lingkaran satuan, transformasi
                geometri, fungsi kuadrat, dan limit secara visual dan dinamis
                agar terbangun intuisi matematis yang kokoh.
              </p>
              <a
                href="/simulasi"
                className="pillar-action-link"
                onClick={(e) => navigate(e, "simulation")}
              >
                Jelajahi Simulasi <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>

            {/* Pilar 4 */}
            <div className="pillar-card">
              <div className="pillar-badge-num">04 · PERANGKAT AJAR</div>
              <div className="pillar-icon-box" aria-hidden="true">
                <Layers size={18} />
              </div>
              <h3>Bahan Ajar Siap Pakai</h3>
              <p>
                Perangkat pembelajaran siap pakai untuk guru: modul ajar terstruktur,
                slide presentasi kelas, bank soal latihan, dan LKPD Discovery
                Learning dalam format PDF dan LaTeX editable.
              </p>
              <a
                href="/beli"
                className="pillar-action-link"
                onClick={(e) => navigate(e, "shop")}
              >
                Pilih Bahan Ajar <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Etalase Bahan Ajar Siap Pakai untuk Guru & Kelas */}
      <section
        className="teaching-resources-section"
        aria-label="Bahan Ajar Siap Pakai Guru"
      >
        <div className="site-width">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Solusi Pendidik &amp; Manajemen Kelas</span>
              <h2>Bahan Ajar Siap Pakai untuk Guru &amp; Kelas</h2>
              <p>
                Tingkatkan efektivitas mengajar dengan dokumen berkualitas tinggi
                berstandar kurikulum nasional. Tersedia dalam format PDF siap cetak
                dan berkas LaTeX (.tex) yang dapat diedit bebas.
              </p>
            </div>
            <a
              className="button button-primary"
              href="/beli"
              onClick={(event) => navigate(event, "shop")}
            >
              Katalog Bahan Ajar Lengkap <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="teaching-materials-grid">
            {/* Card 1: Modul Ajar */}
            <div className="teaching-card">
              <span className="teaching-card-badge">Kurikulum Merdeka</span>
              <div className="teaching-card-icon" aria-hidden="true">
                <FileText size={20} />
              </div>
              <h3>Modul Ajar Terstruktur</h3>
              <p>
                Rancangan alur pembelajaran komprehensif, dilengkapi tujuan
                pembelajaran, materi esensial, contoh soal bertingkat, dan panduan asesmen.
              </p>
              <div className="teaching-features-list">
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Format .pdf &amp; .tex editable</span>
                </div>
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Cakupan Fase E, F, &amp; F Lanjut</span>
                </div>
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Runtut &amp; siap diimplementasikan</span>
                </div>
              </div>
              <a
                href="/beli"
                className="teaching-card-action"
                onClick={(e) => navigate(e, "shop")}
              >
                <span>Lihat Detail Modul</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>

            {/* Card 2: Slide Presentasi */}
            <div className="teaching-card">
              <span className="teaching-card-badge">Media Visual Kelas</span>
              <div className="teaching-card-icon" aria-hidden="true">
                <Presentation size={20} />
              </div>
              <h3>Slide Presentasi Pengajaran</h3>
              <p>
                Bahan tayang proyektor dengan tipografi jernih, bagan alir konsep,
                dan grafik tajam untuk menarik perhatian serta mempermudah penjelasan di kelas.
              </p>
              <div className="teaching-features-list">
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Format .pdf siap tayang</span>
                </div>
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Mencakup seluruh topik materi SMA</span>
                </div>
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Desain profesional &amp; bebas distraksi</span>
                </div>
              </div>
              <a
                href="/beli"
                className="teaching-card-action"
                onClick={(e) => navigate(e, "shop")}
              >
                <span>Lihat Paket Slide</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>

            {/* Card 3: Bank Soal */}
            <div className="teaching-card">
              <span className="teaching-card-badge">Evaluasi &amp; Ujian</span>
              <div className="teaching-card-icon" aria-hidden="true">
                <Layers size={20} />
              </div>
              <h3>Bank Soal &amp; Kunci Pembahasan</h3>
              <p>
                Kumpulan paket latihan soal ulangan harian, ujian semester, serta
                persiapan TKA SMP/SMA lengkap dengan kunci jawaban dan pembahasan analitis.
              </p>
              <div className="teaching-features-list">
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Pilihan ganda &amp; soal uraian</span>
                </div>
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Kunci jawaban &amp; pembahasan tuntas</span>
                </div>
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Tersedia paket TKA SMP &amp; SMA</span>
                </div>
              </div>
              <a
                href="/beli"
                className="teaching-card-action"
                onClick={(e) => navigate(e, "shop")}
              >
                <span>Lihat Bank Soal</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>

            {/* Card 4: LKPD */}
            <div className="teaching-card">
              <span className="teaching-card-badge">Student-Centered</span>
              <div className="teaching-card-icon" aria-hidden="true">
                <ClipboardList size={20} />
              </div>
              <h3>LKPD Discovery &amp; PBL</h3>
              <p>
                Lembar Kerja Peserta Didik terstruktur yang memandu siswa menemukan
                konsep matematika secara mandiri melalui pendekatan penemuan terbimbing.
              </p>
              <div className="teaching-features-list">
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Model penemuan (Discovery/PBL)</span>
                </div>
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Melatih daya nalar kritis siswa</span>
                </div>
                <div className="teaching-feature-item">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Format siap cetak dan dibagikan</span>
                </div>
              </div>
              <a
                href="/beli"
                className="teaching-card-action"
                onClick={(e) => navigate(e, "shop")}
              >
                <span>Lihat LKPD</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Banner Callout Kustomisasi */}
          <div className="teaching-callout-banner">
            <div className="teaching-callout-text">
              <h4>Memerlukan Paket Hemat atau Materi Spesifik?</h4>
              <p>
                Tersedia paket hemat per jenjang kelas (Kelas X, XI, XII) serta
                pemesanan custom sesuai indikator capaian kurikulum di sekolah Anda.
              </p>
            </div>
            <a
              href="/beli"
              className="teaching-callout-btn"
              onClick={(e) => navigate(e, "shop")}
            >
              Buka Halaman Beli Produk <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* 5. Alur Prasyarat Belajar Interaktif */}
      <section id="pathway" className="site-width learning-pathway-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Peta Navigasi Kurikulum</span>
            <h2>Alur Belajar Berjenjang (Kelas X–XII)</h2>
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
        </div>
      </section>

      {/* 6. High-Impact Closing CTA Banner */}
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
            Langkah Menuju Pemahaman Mendalam
          </span>
          <h2>Kuasai Matematika Lebih Mendalam. Mengajar Lebih Efektif.</h2>
          <p>
            Tinggalkan cara menghafal tanpa pemahaman. Mulai bangun intuisi analitis
            melalui kurikulum terstruktur Math 1729, atau lengkapi perangkat kelas
            Anda dengan bahan ajar siap pakai.
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
            <a
              className="button button-quiet"
              href="/beli"
              onClick={(event) => navigate(event, "shop")}
            >
              Pesan Bahan Ajar Siap Pakai <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
