import { ArrowRight } from "lucide-react";
import type { Navigate } from "../../types/navigation";

interface HomeCtaProps {
  navigate: Navigate;
}

export function HomeCta({ navigate }: HomeCtaProps) {
  return (
    <section className="lp-cta" aria-labelledby="lp-cta-title">
      <div className="site-width">
        <div className="lp-cta-card">
          <div className="lp-cta-copy">
            <span className="section-kicker">Mulai sekarang</span>
            <h2 id="lp-cta-title">
              Mulai dari modul pertama, atau lengkapi perangkat kelas Anda.
            </h2>
            <p>
              Belajar teratur dari fondasi, atau siapkan dokumen mengajar untuk
              semester ini. Keduanya bisa dimulai hari ini.
            </p>
          </div>
          <div className="lp-cta-actions">
            <a
              className="button button-primary"
              href="/materi/eksponensial"
              onClick={(event) => navigate(event, "eksponensial")}
            >
              Mulai Belajar Materi 01
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a
              className="button button-outline"
              href="/beli"
              onClick={(event) => navigate(event, "shop")}
            >
              Pesan Bahan Ajar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
