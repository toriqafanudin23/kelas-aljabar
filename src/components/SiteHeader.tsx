import { useState } from "react";
import type { MouseEvent } from "react";
import { materials } from "../materi";
import { getPathFromPage } from "../types/navigation";
import type { Page, Navigate } from "../types/navigation";

interface SiteHeaderProps {
  page: Page;
  navigate: Navigate;
}

export function SiteHeader({ page, navigate }: SiteHeaderProps) {
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
            <small>Portal Referensi Matematika SMA</small>
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

          <div className="catalog-menu">
            <a
              className={page === "catalog" ? "active" : ""}
              href="/katalog"
              onClick={(event) => handleNavigation(event, "catalog")}
            >
              Katalog Materi
            </a>
            <div className="catalog-dropdown" aria-label="Daftar materi">
              {materials.map((material) => (
                <a
                  key={material.slug}
                  href={getPathFromPage(material.slug)}
                  onClick={(event) => {
                    setMenuOpen(false);
                    navigate(event, material.slug as Page);
                  }}
                >
                  <span className="dropdown-mod-num">{material.number}.</span> {material.title}
                </a>
              ))}
            </div>
          </div>

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
            <div className="drawer-sublinks">
              {materials.map((material) => (
                <a
                  key={material.slug}
                  className={page === material.slug ? "active" : ""}
                  href={getPathFromPage(material.slug)}
                  onClick={(event) =>
                    handleNavigation(event, material.slug as Page)
                  }
                >
                  {material.number}. {material.title}
                </a>
              ))}
            </div>
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
