import { lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import type { Navigate } from "../../types/navigation";

const HeroDerivativeSimulation = lazy(() =>
  import("../simulation/HeroDerivativeSimulation").then((m) => ({
    default: m.HeroDerivativeSimulation,
  })),
);

interface HomeHeroProps {
  navigate: Navigate;
}

const heroFacts = [
  { value: "21", label: "Modul kurikulum" },
  { value: "Fase E–F", label: "Kelas X–XII" },
  { value: "PDF & LaTeX", label: "Berkas siap pakai" },
];

export function HomeHero({ navigate }: HomeHeroProps) {
  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="site-width lp-hero-inner">
        <div className="lp-hero-copy">
          <span className="lp-hero-tag">
            Math 1729 · Bahan Ajar & Pembelajaran Matematika
          </span>
          <h1 id="lp-hero-title">
            Matematika SMA yang tersusun rapi dan bisa dipelajari sendiri.
          </h1>
          <p className="lp-hero-lead">
            Materi kurikulum Fase E–F, latihan soal berjenjang, simulasi visual
            interaktif, serta perangkat ajar siap pakai untuk guru — semuanya
            dalam satu tempat.
          </p>
          <div className="lp-hero-cta">
            <a
              className="button button-primary"
              href="/materi/eksponensial"
              onClick={(event) => navigate(event, "eksponensial")}
            >
              Mulai dari Modul 01
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a
              className="button button-quiet"
              href="/simulasi"
              onClick={(event) => navigate(event, "simulation")}
            >
              Coba Simulasi Interaktif
            </a>
          </div>
          <dl className="lp-hero-facts">
            {heroFacts.map((fact) => (
              <div className="lp-hero-fact" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="lp-hero-figure">
          <Suspense
            fallback={
              <div className="lp-hero-figure-loading" aria-hidden="true" />
            }
          >
            <HeroDerivativeSimulation />
          </Suspense>
          <figcaption>
            Garis singgung mengikuti kurva <em>f</em>(x) = ¼x³ − 1,2x — animasi
            turunan pada halaman Turunan Fungsi.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
