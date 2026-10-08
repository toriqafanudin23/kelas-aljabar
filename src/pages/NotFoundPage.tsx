import { Home } from "lucide-react";
import type { Navigate } from "../types/navigation";

interface NotFoundPageProps {
  navigate: Navigate;
}

export function NotFoundPage({ navigate }: NotFoundPageProps) {
  const handleHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    navigate(event, "home");
  };

  return (
    <main className="site-width inner-page not-found-page">
      <section className="not-found-content" aria-labelledby="not-found-title">
        <div className="not-found-code" aria-hidden="true">
          404
        </div>
        <div className="not-found-copy">
          <span className="section-kicker">Halaman Tidak Ditemukan</span>
          <h1 id="not-found-title">Sepertinya Anda tersesat.</h1>
          <p>
            Tautan yang dibuka tidak tersedia atau sudah berubah. Kembali ke
            beranda untuk melanjutkan menjelajahi Math 1729.
          </p>
          <a className="button button-primary" href="/" onClick={handleHome}>
            <Home size={16} aria-hidden="true" /> Kembali ke Beranda
          </a>
        </div>
      </section>
    </main>
  );
}
