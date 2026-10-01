import type { Navigate } from "../types/navigation";

interface SiteFooterProps {
  navigate: Navigate;
}

export function SiteFooter({ navigate }: SiteFooterProps) {
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
