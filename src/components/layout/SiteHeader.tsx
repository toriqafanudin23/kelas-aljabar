import { useState } from "react";
import type { MouseEvent } from "react";
import { materials } from "../../materi";
import { getPathFromPage } from "../../types/navigation";
import type { Page, Navigate } from "../../types/navigation";

interface SiteHeaderProps {
  page: Page;
  navigate: Navigate;
  showTocButton?: boolean;
  isTocOpen?: boolean;
  onToggleToc?: () => void;
}

function getGradeOrder(grade: string) {
  if (grade.includes("Kelas XII")) return 2;
  if (grade.includes("Kelas XI")) return 1;
  if (grade.includes("Kelas X")) return 0;
  return 3;
}

export function SiteHeader({
  page,
  navigate,
  showTocButton = false,
  isTocOpen = false,
  onToggleToc,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modulesAccordionOpen, setModulesAccordionOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState("");

  const handleNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    target: Page,
  ) => {
    setMenuOpen(false);
    setModulesAccordionOpen(false);
    setDrawerSearch("");
    navigate(event, target);
  };

  const orderedMaterials = [...materials].sort(
    (firstMaterial, secondMaterial) =>
      getGradeOrder(firstMaterial.grade) -
        getGradeOrder(secondMaterial.grade) ||
      Number(firstMaterial.number) - Number(secondMaterial.number),
  );

  const filteredMaterials = drawerSearch.trim()
    ? orderedMaterials.filter((material) =>
        `${material.number} ${material.title} ${material.grade} ${material.category}`
          .toLowerCase()
          .includes(drawerSearch.toLowerCase()),
      )
    : orderedMaterials;

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
            <small>Portal Referensi Matematika SMA</small>
          </div>
        </a>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          <a
            className={page === "home" ? "active" : ""}
            href="/"
            onClick={(event) => handleNavigation(event, "home")}
          >
            <span>Beranda</span>
          </a>

          <div className="catalog-menu">
            <a
              className={page === "catalog" ? "active" : ""}
              href="/katalog"
              onClick={(event) => handleNavigation(event, "catalog")}
            >
              <span>Katalog Materi</span>
            </a>
            <div className="catalog-dropdown" aria-label="Daftar materi">
              {orderedMaterials.map((material) => (
                <a
                  key={material.slug}
                  href={getPathFromPage(material.slug)}
                  onClick={(event) => {
                    setMenuOpen(false);
                    navigate(event, material.slug as Page);
                  }}
                >
                  <span className="dropdown-mod-num">{material.number}.</span>{" "}
                  {material.title}
                </a>
              ))}
            </div>
          </div>

          <a
            className={
              page === "practice" ||
              page === "practice-tka-paket1" ||
              page === "practice-tka-smp-paket1" ||
              page === "practice-eksponensial" ||
              page === "practice-barisan-deret" ||
              page === "practice-vektor" ||
              page === "practice-sppl" ||
              page === "practice-fungsi-kuadrat" ||
              page === "practice-perbandingan-trigonometri" ||
              page === "practice-peluang" ||
              page === "practice-statistika" ||
              page === "practice-transformasi-geometri" ||
              page === "practice-polinomial" ||
              page === "practice-matriks" ||
              page === "practice-lingkaran" ||
              page === "practice-komposisi-fungsi-dan-invers" ||
              page === "practice-turunan" ||
              page === "practice-fungsi-pemodelan" ||
              page === "practice-transformasi-fungsi" ||
              page === "practice-kombinatorika" ||
              page === "practice-irisan-kerucut" ||
              page === "practice-integral" ||
              page === "practice-analisis-data-peluang" ||
              page === "practice-limit" ||
              page === "practice-bilangan-kompleks"
                ? "active"
                : ""
            }
            href="/latihan-soal"
            onClick={(event) => handleNavigation(event, "practice")}
          >
            <span>Latihan Soal</span>
          </a>

          <a
            className={
              page === "simulation" || page === "simulation-play"
                ? "active"
                : ""
            }
            href="/simulasi"
            onClick={(event) => handleNavigation(event, "simulation")}
          >
            <span>Simulasi</span>
          </a>

          <a
            className={page === "shop" ? "active" : ""}
            href="/beli"
            onClick={(event) => handleNavigation(event, "shop")}
          >
            <span>Beli Produk</span>
          </a>

          <a
            className={page === "about" ? "active" : ""}
            href="/tentang"
            onClick={(event) => handleNavigation(event, "about")}
          >
            <span>Tentang</span>
          </a>
        </nav>

        {/* Aksi Mobile: Tombol Daftar Isi Modul + Tombol Hamburger Menu */}
        <div className="mobile-header-actions">
          {showTocButton && (
            <button
              className={`mobile-toc-nav-btn ${isTocOpen ? "active" : ""}`}
              type="button"
              aria-label={
                isTocOpen ? "Tutup daftar isi modul" : "Buka daftar isi modul"
              }
              aria-expanded={isTocOpen}
              onClick={onToggleToc}
              title="Daftar Isi Modul"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="9" y1="6" x2="20" y2="6"></line>
                <line x1="9" y1="12" x2="20" y2="12"></line>
                <line x1="9" y1="18" x2="20" y2="18"></line>
                <circle cx="4" cy="6" r="1.5" fill="currentColor"></circle>
                <circle cx="4" cy="12" r="1.5" fill="currentColor"></circle>
                <circle cx="4" cy="18" r="1.5" fill="currentColor"></circle>
              </svg>
              <span className="mobile-toc-btn-text">Daftar Isi</span>
            </button>
          )}

          <button
            className="mobile-menu-btn"
            type="button"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen(!menuOpen);
              if (!menuOpen) {
                setModulesAccordionOpen(false);
                setDrawerSearch("");
              }
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-drawer">
          <div className="site-width drawer-links">
            <a
              className={`drawer-primary-link ${page === "home" ? "active" : ""}`}
              href="/"
              onClick={(event) => handleNavigation(event, "home")}
            >
              <span>Beranda</span>
            </a>

            <a
              className={`drawer-primary-link ${page === "catalog" ? "active" : ""}`}
              href="/katalog"
              onClick={(event) => handleNavigation(event, "catalog")}
            >
              <span>Katalog Materi</span>
            </a>

            <a
              className={`drawer-primary-link ${page === "practice" || page === "practice-tka-paket1" || page === "practice-tka-smp-paket1" || page === "practice-eksponensial" || page === "practice-barisan-deret" || page === "practice-vektor" || page === "practice-sppl" || page === "practice-fungsi-kuadrat" || page === "practice-perbandingan-trigonometri" || page === "practice-peluang" || page === "practice-statistika" || page === "practice-transformasi-geometri" || page === "practice-polinomial" || page === "practice-matriks" || page === "practice-lingkaran" || page === "practice-komposisi-fungsi-dan-invers" || page === "practice-turunan" || page === "practice-fungsi-pemodelan" || page === "practice-transformasi-fungsi" || page === "practice-kombinatorika" || page === "practice-irisan-kerucut" || page === "practice-integral" || page === "practice-analisis-data-peluang" || page === "practice-limit" || page === "practice-bilangan-kompleks" ? "active" : ""}`}
              href="/latihan-soal"
              onClick={(event) => handleNavigation(event, "practice")}
            >
              <span>Latihan Soal</span>
            </a>

            <a
              className={`drawer-primary-link ${page === "simulation" ? "active" : ""}`}
              href="/simulasi"
              onClick={(event) => handleNavigation(event, "simulation")}
            >
              <span>Simulasi</span>
            </a>

            <a
              className={`drawer-primary-link ${page === "shop" ? "active" : ""}`}
              href="/beli"
              onClick={(event) => handleNavigation(event, "shop")}
            >
              <span>Beli Produk</span>
            </a>

            {/* Accordion Modul Cepat yang Rapi dan Tidak Memenuhi Layar */}
            <div className="drawer-accordion">
              <button
                type="button"
                className={`drawer-accordion-btn ${modulesAccordionOpen ? "open" : ""}`}
                onClick={() => setModulesAccordionOpen(!modulesAccordionOpen)}
                aria-expanded={modulesAccordionOpen}
              >
                <div className="accordion-label-wrap">
                  <span className="accordion-title">Pilih Modul Cepat</span>
                  <span className="accordion-badge">
                    {materials.length} Modul
                  </span>
                </div>
                <span className="accordion-chevron">
                  {modulesAccordionOpen ? "▲" : "▼"}
                </span>
              </button>

              {modulesAccordionOpen && (
                <div className="drawer-accordion-content">
                  <div className="drawer-search-wrap">
                    <input
                      type="search"
                      className="drawer-search-input"
                      placeholder="Cari materi dalam daftar..."
                      value={drawerSearch}
                      onChange={(e) => setDrawerSearch(e.target.value)}
                    />
                  </div>
                  <div className="drawer-sublinks">
                    {filteredMaterials.map((material) => (
                      <a
                        key={material.slug}
                        className={`drawer-sublink-item ${page === material.slug ? "active" : ""}`}
                        href={getPathFromPage(material.slug)}
                        onClick={(event) =>
                          handleNavigation(event, material.slug as Page)
                        }
                      >
                        <span className="drawer-mod-badge">
                          {material.number}
                        </span>
                        <div className="drawer-mod-info">
                          <span className="drawer-mod-title">
                            {material.title}
                          </span>
                          <small className="drawer-mod-grade">
                            {material.grade}
                          </small>
                        </div>
                      </a>
                    ))}
                    {filteredMaterials.length === 0 && (
                      <p className="drawer-empty-search">
                        Tidak ada materi “{drawerSearch}”
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <a
              className={`drawer-primary-link ${page === "about" ? "active" : ""}`}
              href="/tentang"
              onClick={(event) => handleNavigation(event, "about")}
            >
              <span>Tentang</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
