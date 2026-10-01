import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import { materials, getMaterialBySlug } from "../materi";
import type { Material } from "../materi";
import type { LessonNavItem, Navigate } from "../types/navigation";
import { getPathFromPage } from "../types/navigation";
import { LessonHtml } from "../components/LessonHtml";

interface LessonPageProps {
  slug: string;
  navigate: Navigate;
  mobileTocOpen: boolean;
  setMobileTocOpen: (open: boolean) => void;
}

export function LessonPage({
  slug,
  navigate,
  mobileTocOpen,
  setMobileTocOpen,
}: LessonPageProps) {
  const [sections, setSections] = useState<LessonNavItem[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  const material: Material | undefined = getMaterialBySlug(slug);
  const currentDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const currentIndex = materials.findIndex((m) => m.slug === slug);
  const prevMaterial = currentIndex > 0 ? materials[currentIndex - 1] : null;
  const nextMaterial =
    currentIndex >= 0 && currentIndex < materials.length - 1
      ? materials[currentIndex + 1]
      : null;

  // Lacak bagian aktif saat pengguna menggulir halaman (IntersectionObserver)
  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          const topVisible = visibleEntries[0];
          setActiveSectionId(topVisible.target.id);
        }
      },
      {
        rootMargin: "-90px 0px -60% 0px",
        threshold: 0.1,
      },
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  // Kunci scroll body saat modal daftar isi terbuka di ponsel
  useEffect(() => {
    if (mobileTocOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileTocOpen]);

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

  const handleSectionJump = (sectionId: string) => {
    setMobileTocOpen(false);
    setActiveSectionId(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!material) {
    return (
      <main className="site-width inner-page">
        <h2>Materi tidak ditemukan.</h2>
        <p>Materi dengan tautan ini belum tersedia atau telah dipindahkan.</p>
        <a href="/" onClick={(event) => navigate(event, "home")}>
          ← Kembali ke beranda
        </a>
      </main>
    );
  }

  return (
    <>
      {/* Modal / Bottom Sheet Navigasi Daftar Isi untuk Ponsel (Ditekan dari ikon navbar) */}
      {mobileTocOpen && sections.length > 0 && (
        <div
          className="mobile-toc-overlay"
          onClick={() => setMobileTocOpen(false)}
        >
          <div
            className="mobile-toc-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Daftar isi modul lengkap"
          >
            <div className="mobile-toc-drawer-header">
              <div className="drawer-header-title">
                <strong>Daftar Isi Modul</strong>
                <small>{sections.length} bagian materi</small>
              </div>
              <button
                type="button"
                className="mobile-toc-close-btn"
                onClick={() => setMobileTocOpen(false)}
                aria-label="Tutup daftar isi"
              >
                ✕
              </button>
            </div>

            <div className="mobile-toc-items-container">
              {sections.map((sec, index) => (
                <button
                  key={sec.id}
                  type="button"
                  className={`mobile-toc-item-btn ${activeSectionId === sec.id ? "active" : ""}`}
                  onClick={() => handleSectionJump(sec.id)}
                >
                  <span className="toc-item-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="toc-item-title">{sec.title}</span>
                  {activeSectionId === sec.id && (
                    <span className="toc-item-badge">Sedang Dibaca</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mobile-toc-drawer-footer">
              <button
                type="button"
                className="button-link-sm"
                onClick={() => {
                  setMobileTocOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                ↑ Kembali ke Atas
              </button>
              <a
                className="button-link-sm"
                href="/katalog"
                onClick={(e) => {
                  setMobileTocOpen(false);
                  goToCatalog(e);
                }}
              >
                Katalog Materi →
              </a>
            </div>
          </div>
        </div>
      )}

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
              <div className="lesson-kicker-row">
                <span className="section-kicker">
                  Modul {material.number} · {material.grade} ({material.phase})
                </span>
                {material.prerequisite && (
                  <span className="lesson-prerequisite-badge">
                    Prasyarat: {material.prerequisite}
                  </span>
                )}
              </div>

              <h1>{material.title}</h1>
              <p>
                Penyusun: Toriq Afanudin <span>·</span> {currentDate}
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
                      href={
                        slug === "eksponensial" ? "#tes-sumatif" : "#latihan"
                      }
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

            {/* Navigasi Prasyarat Antar Modul (Sebelumnya / Selanjutnya) */}
            <div className="lesson-pager">
              {prevMaterial ? (
                <a
                  className="pager-item pager-prev"
                  href={getPathFromPage(prevMaterial.slug)}
                  onClick={(event) => navigate(event, prevMaterial.slug)}
                >
                  <span className="pager-direction">← Modul Sebelumnya</span>
                  <span className="pager-title">
                    {prevMaterial.number}. {prevMaterial.title}
                  </span>
                </a>
              ) : (
                <div className="pager-empty" />
              )}

              {nextMaterial ? (
                <a
                  className="pager-item pager-next"
                  href={getPathFromPage(nextMaterial.slug)}
                  onClick={(event) => navigate(event, nextMaterial.slug)}
                >
                  <span className="pager-direction">
                    Modul Prasyarat Berikutnya →
                  </span>
                  <span className="pager-title">
                    {nextMaterial.number}. {nextMaterial.title}
                  </span>
                </a>
              ) : (
                <div className="pager-empty" />
              )}
            </div>

            <a className="back-link" href="/katalog" onClick={goToCatalog}>
              ← Kembali ke katalog materi
            </a>
          </article>

          {/* Desktop Sidebar TOC: Sticky di sebelah kanan artikel untuk layar lebar */}
          {sections.length > 0 && (
            <details className="lesson-toc" open>
              <summary>
                <span>Dalam modul ini</span>
                <span className="toc-count">{sections.length} bagian</span>
              </summary>
              <nav aria-label="Daftar isi modul">
                {sections.map((sec, index) => (
                  <a
                    href={`#${sec.id}`}
                    key={sec.id}
                    onClick={(event) => {
                      event.preventDefault();
                      handleSectionJump(sec.id);
                    }}
                    className={
                      activeSectionId === sec.id ? "active-toc-link" : ""
                    }
                  >
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
    </>
  );
}
