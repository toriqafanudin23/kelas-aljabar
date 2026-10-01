import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { renderToString } from "katex";
import renderMathInElement from "katex/dist/contrib/auto-render.mjs";
import "katex/dist/katex.min.css";
import { materials, getMaterialBySlug } from "./materi";
import type { Material } from "./materi";

type Page = "home" | "catalog" | "about" | string;
type Navigate = (event: MouseEvent<HTMLAnchorElement>, page: Page) => void;

function getPageFromPath(path: string): Page {
  if (path === "/tentang" || path === "/tentang/") return "about";
  if (path === "/katalog" || path === "/katalog/") return "catalog";
  if (path.startsWith("/materi/")) {
    const slug = path.replace("/materi/", "").replace(/\/$/, "");
    if (slug) return slug;
  }
  return "home";
}

function getPathFromPage(page: Page): string {
  if (page === "home") return "/";
  if (page === "catalog") return "/katalog";
  if (page === "about") return "/tentang";
  return `/materi/${page}`;
}

function Formula({ math }: { math: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: renderToString(math, {
          displayMode: true,
          throwOnError: false,
        }),
      }}
    />
  );
}

type LessonNavItem = { id: string; title: string };

function LessonHtml({
  html,
  onSectionsChange,
}: {
  html: string;
  onSectionsChange: (sections: LessonNavItem[]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = html;

    renderMathInElement(containerRef.current, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });

    const sectionEls = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>("section[id]"),
    );
    const navSections: LessonNavItem[] = sectionEls.map((sec) => ({
      id: sec.id,
      title:
        sec.getAttribute("data-title") ||
        sec.querySelector("h2")?.textContent?.trim() ||
        "Bagian",
    }));

    onSectionsChange(navSections);
  }, [html, onSectionsChange]);

  return <div ref={containerRef} className="lesson-content" />;
}

function App() {
  const [page, setPage] = useState<Page>(() =>
    getPageFromPath(window.location.pathname),
  );

  useEffect(() => {
    const syncPage = () => setPage(getPageFromPath(window.location.pathname));
    window.addEventListener("popstate", syncPage);
    return () => window.removeEventListener("popstate", syncPage);
  }, []);

  const navigate: Navigate = (event, nextPage) => {
    event.preventDefault();
    if (page !== nextPage) {
      window.history.pushState({}, "", getPathFromPage(nextPage));
      setPage(nextPage);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isMaterialPage =
    page !== "home" && page !== "catalog" && page !== "about";

  return (
    <>
      <SiteHeader page={page} navigate={navigate} />
      {page === "home" && <HomePage navigate={navigate} />}
      {page === "catalog" && <CatalogPage navigate={navigate} />}
      {page === "about" && <AboutPage />}
      {isMaterialPage && <LessonPage slug={page} navigate={navigate} />}
      <SiteFooter navigate={navigate} />
    </>
  );
}

function SiteHeader({ page, navigate }: { page: Page; navigate: Navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    target: Page,
  ) => {
    setMenuOpen(false);
    navigate(event, target);
  };

  return (
    <header className="site-header">
      <div className="site-width header-inner">
        <a
          className="brand-logo"
          href="/"
          onClick={(event) => handleNavigation(event, "home")}
        >
          <span className="logo-badge" aria-hidden="true">
            &Sigma;
          </span>
          <div className="logo-text">
            <strong>Math 1729</strong>
            <small>Referensi materi matematika SMA</small>
          </div>
        </a>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          <a
            className={page === "home" ? "active" : ""}
            href="/"
            onClick={(event) => handleNavigation(event, "home")}
          >
            Beranda
          </a>
          <a
            className={page === "catalog" ? "active" : ""}
            href="/katalog"
            onClick={(event) => handleNavigation(event, "catalog")}
          >
            Katalog Materi
          </a>
          <a
            className={page === "about" ? "active" : ""}
            href="/tentang"
            onClick={(event) => handleNavigation(event, "about")}
          >
            Tentang
          </a>
        </nav>

        <button
          className="mobile-menu-btn"
          type="button"
          aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-drawer">
          <div className="site-width drawer-links">
            <a
              className={page === "home" ? "active" : ""}
              href="/"
              onClick={(event) => handleNavigation(event, "home")}
            >
              Beranda
            </a>
            <a
              className={page === "catalog" ? "active" : ""}
              href="/katalog"
              onClick={(event) => handleNavigation(event, "catalog")}
            >
              Katalog Materi
            </a>
            <a
              className={page === "about" ? "active" : ""}
              href="/tentang"
              onClick={(event) => handleNavigation(event, "about")}
            >
              Tentang
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function HomePage({ navigate }: { navigate: Navigate }) {
  return (
    <>
      <section className="hero-band">
        <div className="site-width hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Modul sedang dalam pengembangan
            </span>
            <h1>
              Kuasai matematika SMA dalam <em>30 hari.</em>
            </h1>
            <p>
              Sumber terbuka pelajaran matematika SMA. Bisa juga untuk persiapan
              OSN dan UTBK. Sepenuhnya dapat diakses secara gratis!
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href="/katalog"
                onClick={(event) => navigate(event, "catalog")}
              >
                Jelajahi Katalog Materi <span aria-hidden="true">→</span>
              </a>
              <a
                className="button button-quiet"
                href="/tentang"
                onClick={(event) => navigate(event, "about")}
              >
                Tentang Portal <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <aside className="focus-panel">
            <div className="panel-heading">
              <span>Fokus pembelajaran</span>
              <span className="panel-index">01 — 03</span>
            </div>
            <div className="focus-row">
              <span className="focus-number">01</span>
              <p>
                <strong>Matematika SMA</strong>
                <small>Materi berjenjang kelas X, XI, dan XII</small>
              </p>
            </div>
            <div className="focus-row">
              <span className="focus-number">02</span>
              <p>
                <strong>Persiapan Olimpiade</strong>
                <small>Pendalaman materi dan latihan soal</small>
              </p>
            </div>
            <div className="focus-row">
              <span className="focus-number">03</span>
              <p>
                <strong>Persiapan UTBK-SNBT</strong>
                <small>Penalaran matematika dan pengetahuan kuantitatif</small>
              </p>
            </div>
            <div className="panel-credit">
              <span>Disusun oleh</span>
              <strong>Toriq Afanudin</strong>
            </div>
          </aside>
        </div>
      </section>

      <section id="materi" className="site-width catalog-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Modul Pilihan</span>
            <h2>Katalog Materi Pembelajaran</h2>
            <p>
              Pilih topik untuk mempelajari teori, sifat-sifat, dan pembahasan
              soal.
            </p>
          </div>
          <a
            className="button button-quiet"
            href="/katalog"
            onClick={(event) => navigate(event, "catalog")}
          >
            Buka Halaman Katalog Lengkap <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="course-grid">
          {["barisan-deret", "matriks", "kombinatorika"]
            .map((slug) => materials.find((material) => material.slug === slug))
            .filter((material): material is Material => Boolean(material))
            .map((material) => (
              <article className="course-card" key={material.slug}>
                <div className="course-meta">
                  <span>{material.category}</span>
                  <span>Modul {material.number}</span>
                </div>
                <div className="course-content">
                  <p className="course-grade">
                    {material.grade} <span>·</span> Catatan akademis
                  </p>
                  <h3>
                    <a
                      href={getPathFromPage(material.slug)}
                      onClick={(event) => navigate(event, material.slug)}
                    >
                      {material.title}
                    </a>
                  </h3>
                  <div className="formula-preview">
                    <Formula math={material.formula} />
                  </div>
                  <p className="course-description">{material.description}</p>
                </div>
                <div className="course-footer">
                  <span>Akses terbuka</span>
                  <a
                    href={getPathFromPage(material.slug)}
                    onClick={(event) => navigate(event, material.slug)}
                  >
                    Baca modul <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="about-band">
        <div className="site-width about-preview">
          <div className="about-copy">
            <span className="section-kicker">Informasi dan pengembang</span>
            <h2>Motivasi dan Harapan</h2>
            <p>
              Saya berharap di masa depan seluruh siswa Indonesia mendapat akses
              pendidikan yang sama dan sederajat, agar terealisasi kemajuan
              peradaban yang merata di seluruh negeri.
            </p>
            <a
              className="text-link"
              href="/tentang"
              onClick={(event) => navigate(event, "about")}
            >
              Kenali portal dan pengembang <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="profile-signature">
            <span className="initials">TA</span>
            <div>
              <strong>Toriq Afanudin</strong>
              <span>Pengajar Matematika · Wonosobo</span>
            </div>
            <a
              href="mailto:toriqafanudin23@gmail.com"
              aria-label="Kirim email ke Toriq Afanudin"
            >
              ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function CatalogPage({ navigate }: { navigate: Navigate }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const categories = [
    "Semua",
    ...Array.from(new Set(materials.map((m) => m.category))),
  ];

  const filteredMaterials = materials.filter((material) => {
    const matchesCategory =
      selectedCategory === "Semua" || material.category === selectedCategory;
    const matchesSearch =
      `${material.category} ${material.title} ${material.grade} ${material.description}`
        .toLowerCase()
        .includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="site-width inner-page catalog-page">
      <div className="breadcrumb">
        <a href="/" onClick={(event) => navigate(event, "home")}>
          Beranda
        </a>
        <span>/</span>
        <span>Katalog Materi</span>
      </div>

      <div className="page-intro">
        <span className="section-kicker">Modul Pembelajaran</span>
        <h1>Katalog Materi Pembelajaran</h1>
        <p>
          Cari dan pelajari topik matematika yang Anda butuhkan. Setiap modul
          disajikan secara terstruktur dari definisi formal hingga pembahasan
          soal mandiri.
        </p>
      </div>

      <div className="catalog-toolbar">
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pill-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="search-box">
          <span className="sr-only">Cari materi matematika</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Cari materi matematika..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="course-grid">
        {filteredMaterials.map((material) => (
          <article className="course-card" key={material.slug}>
            <div className="course-meta">
              <span>{material.category}</span>
              <span>Modul {material.number}</span>
            </div>
            <div className="course-content">
              <p className="course-grade">
                {material.grade} <span>·</span> Catatan akademis
              </p>
              <h3>
                <a
                  href={getPathFromPage(material.slug)}
                  onClick={(event) => navigate(event, material.slug)}
                >
                  {material.title}
                </a>
              </h3>
              <div className="formula-preview">
                <Formula math={material.formula} />
              </div>
              <p className="course-description">{material.description}</p>
            </div>
            <div className="course-footer">
              <span>Akses terbuka</span>
              <a
                href={getPathFromPage(material.slug)}
                onClick={(event) => navigate(event, material.slug)}
              >
                Baca modul <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}

        <article className="course-card coming-card">
          <div className="coming-content">
            <span className="coming-label">
              <span /> Pembaruan berkala
            </span>
            <h3>Modul berikutnya</h3>
            <p>
              Topik mendatang mencakup kalkulus integral, persamaan diferensial,
              dan teori graf.
            </p>
            <div className="coming-status">
              <span>Status kurikulum</span>
              <strong>Aktif disusun</strong>
            </div>
          </div>
          <div className="course-footer">
            <span>HTML &amp; LaTeX</span>
            <span>Segera Hadir</span>
          </div>
        </article>

        {filteredMaterials.length === 0 && (
          <div className="empty-state">
            <p>Tidak ada materi yang cocok dengan “{query}”.</p>
            <button
              className="button button-quiet"
              onClick={() => {
                setQuery("");
                setSelectedCategory("Semua");
              }}
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="site-width inner-page about-page">
      <div className="breadcrumb">
        <a href="/">Beranda</a>
        <span>/</span>
        <span>Tentang</span>
      </div>
      <div className="page-intro">
        <span className="section-kicker">
          Profil Penulis dan Tentang Platform
        </span>
        <h1>Tentang Math 1729</h1>
        <p>
          Media pembelajaran digital untuk pelajari matematika secara praktis.
        </p>
      </div>
      <section className="profile-section">
        <div className="profile-card">
          <span className="profile-avatar">TA</span>
          <h2>Toriq Afanudin</h2>
          <p>Pengajar Matematika</p>
          <span className="profile-tag">Inisiator &amp; pengembang</span>
          <div className="profile-contact">
            <span>
              LOKASI<strong>Kalikajar, Wonosobo</strong>
            </span>
            <span>
              EMAIL
              <strong>
                <a href="mailto:toriqafanudin23@gmail.com">
                  toriqafanudin23@gmail.com
                </a>
              </strong>
            </span>
          </div>
        </div>
        <div className="profile-story">
          <span className="section-kicker">Catatan pengembang</span>
          <h2>Alasan dibuatnya website pembelajaran ini.</h2>
          <p>
            Berawal dari keresahan penulis terhadap standarisasi materi
            matematika di Indonesia, dan juga keterbatasan akses sumber belajar
            yang terbatas di daerah 3T.
          </p>
          <p>
            Penulis ingin menyusun materi matematika yang lengkap dan
            terstruktur, sehingga siswa dapat belajar dengan baik.
          </p>
        </div>
      </section>
      <section className="program-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Kurikulum dan program</span>
            <h2>Cakupan pembelajaran</h2>
          </div>
        </div>
        <div className="program-grid">
          <article>
            <span>01 / SMA</span>
            <h3>Matematika SMA</h3>
            <p>
              Kurikulum berjenjang dari kelas X hingga XII, mulai dari aljabar
              dan geometri hingga kalkulus dan statistika.
            </p>
          </article>
          <article>
            <span>02 / OSN</span>
            <h3>Persiapan Olimpiade</h3>
            <p>
              Pemecahan masalah non-rutin dalam aljabar, teori bilangan,
              geometri, dan kombinatorika.
            </p>
          </article>
          <article>
            <span>03 / UTBK</span>
            <h3>Persiapan UTBK-SNBT</h3>
            <p>
              Penguatan penalaran matematika, pemodelan masalah, dan pengetahuan
              kuantitatif.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

function LessonPage({ slug, navigate }: { slug: string; navigate: Navigate }) {
  const [sections, setSections] = useState<LessonNavItem[]>([]);
  const material: Material | undefined = getMaterialBySlug(slug);
  const downloadUrl =
    slug === "eksponensial"
      ? "https://cmnxalvcfxxwuuewmbgf.supabase.co/storage/v1/object/public/img-kelas-aljabar/modul/modul_eksponen.pdf?download=modul_eksponen.pdf"
      : slug === "transformasi-geometri"
        ? "https://cmnxalvcfxxwuuewmbgf.supabase.co/storage/v1/object/public/img-kelas-aljabar/modul/modul_transformasi.pdf?download=modul_transformasi.pdf"
        : undefined;
  const questionsDownloadUrl =
    slug === "eksponensial"
      ? "https://cmnxalvcfxxwuuewmbgf.supabase.co/storage/v1/object/public/img-kelas-aljabar/modul/soal_eksponen_dan_logaritma.pdf?download=soal_eksponen_dan_logaritma.pdf"
      : undefined;
  const transformationQuestionsDownloadUrl =
    slug === "transformasi-geometri"
      ? "https://cmnxalvcfxxwuuewmbgf.supabase.co/storage/v1/object/public/img-kelas-aljabar/modul/soal_transformasi.pdf?download=soal_transformasi.pdf"
      : undefined;

  const goToCatalog = (event: MouseEvent<HTMLAnchorElement>) => {
    navigate(event, "catalog");
  };

  if (!material) {
    return (
      <main className="site-width inner-page">
        <h2>Materi tidak ditemukan.</h2>
        <a href="/" onClick={(event) => navigate(event, "home")}>
          ← Kembali ke beranda
        </a>
      </main>
    );
  }

  return (
    <main className="site-width inner-page lesson-page">
      <div className="breadcrumb">
        <a href="/" onClick={(event) => navigate(event, "home")}>
          Beranda
        </a>
        <span>/</span>
        <a href="/katalog" onClick={goToCatalog}>
          Katalog
        </a>
        <span>/</span>
        <span>{material.title}</span>
      </div>
      <div className="lesson-layout">
        <article className="lesson-article">
          <div className="lesson-heading">
            <span className="section-kicker">
              Modul pembelajaran · {material.grade}
            </span>
            <h1>{material.title}</h1>
            <p>
              Kategori: {material.category} <span>·</span> Catatan akademis
            </p>
            {(downloadUrl ||
              questionsDownloadUrl ||
              transformationQuestionsDownloadUrl ||
              slug === "eksponensial") && (
              <div className="lesson-actions">
                {downloadUrl && (
                  <a
                    className="button button-primary lesson-download"
                    href={downloadUrl}
                  >
                    Unduh Modul PDF <span aria-hidden="true">↓</span>
                  </a>
                )}
                {questionsDownloadUrl && (
                  <a
                    className="button lesson-practice"
                    href={questionsDownloadUrl}
                  >
                    Unduh Soal Eksponen PDF <span aria-hidden="true">↓</span>
                  </a>
                )}
                {transformationQuestionsDownloadUrl && (
                  <a
                    className="button lesson-practice"
                    href={transformationQuestionsDownloadUrl}
                  >
                    Unduh Soal Transformasi PDF
                    <span aria-hidden="true">↓</span>
                  </a>
                )}
                {(slug === "eksponensial" ||
                  slug === "transformasi-geometri") && (
                  <a
                    className="button lesson-practice"
                    href={slug === "eksponensial" ? "#tes-sumatif" : "#latihan"}
                  >
                    Latihan Soal <span aria-hidden="true">↓</span>
                  </a>
                )}
              </div>
            )}
          </div>
          {material.description && (
            <p className="lesson-lead">{material.description}</p>
          )}

          <LessonHtml
            html={material.htmlContent}
            onSectionsChange={setSections}
          />

          <a className="back-link" href="/katalog" onClick={goToCatalog}>
            ← Kembali ke katalog materi
          </a>
        </article>

        {sections.length > 0 && (
          <details className="lesson-toc">
            <summary>
              <span>Dalam modul ini</span>
              <span className="toc-count">{sections.length} bagian</span>
            </summary>
            <nav aria-label="Daftar isi modul">
              {sections.map((sec, index) => (
                <a href={`#${sec.id}`} key={sec.id}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  {sec.title}
                </a>
              ))}
              <a className="toc-back" href="/katalog" onClick={goToCatalog}>
                Semua materi →
              </a>
            </nav>
          </details>
        )}
      </div>
    </main>
  );
}

function SiteFooter({ navigate }: { navigate: Navigate }) {
  return (
    <footer className="site-footer">
      <div className="site-width footer-main">
        <div>
          <strong>SUMBER BELAJAR MATEMATIKA</strong>
          <p>
            Portal pembelajaran matematika akademis SMA, persiapan olimpiade,
            dan UTBK.
          </p>
        </div>
        <div className="footer-links">
          <a href="/" onClick={(event) => navigate(event, "home")}>
            Beranda
          </a>
          <a href="/katalog" onClick={(event) => navigate(event, "catalog")}>
            Katalog Materi
          </a>
          <a href="/tentang" onClick={(event) => navigate(event, "about")}>
            Tentang
          </a>
        </div>
      </div>
      <div className="site-width footer-bottom">
        <span>© 2026 Sumber Belajar Matematika · Toriq Afanudin</span>
        <a href="mailto:toriqafanudin23@gmail.com">
          Kalikajar, Wonosobo · Hubungi pengembang
        </a>
      </div>
    </footer>
  );
}

export default App;
