import { ArrowRight, BookOpenText, Clock3, ListChecks } from "lucide-react";
import type { Navigate } from "../types/navigation";
import "./PracticePage.css";

interface PracticePageProps {
  navigate: Navigate;
}

export function PracticePage({ navigate }: PracticePageProps) {
  return (
    <main className="site-width inner-page practice-page">
      <div className="breadcrumb">
        <a href="/" onClick={(event) => navigate(event, "home")}>
          Beranda
        </a>
        <span>/</span>
        <span>Latihan Soal</span>
      </div>

      <div className="page-intro">
        <span className="section-kicker">Latihan Mandiri</span>
        <h1>Latihan Soal Matematika</h1>
        <p>
          Pilih latihan berdasarkan materi, kerjakan dengan ritmemu, lalu
          periksa jawaban dan pembahasannya.
        </p>
      </div>

      <section className="practice-list" aria-labelledby="practice-list-title">
        <div className="practice-section-heading">
          <div>
            <span className="practice-section-index">01 / KELAS X</span>
            <h2 id="practice-list-title">Eksponen dan Logaritma</h2>
          </div>
          <span className="practice-level">FASE E</span>
        </div>

        <div className="practice-card-grid">
          <a
            className="practice-card"
            href="/latihan-soal/eksponensial"
            onClick={(event) => navigate(event, "practice-eksponensial")}
          >
            <div className="practice-card-main">
              <span className="practice-card-kicker">
                <BookOpenText size={15} aria-hidden="true" />
                LATIHAN INTERAKTIF
              </span>
              <h3>Latihan Soal Eksponensial</h3>
              <p>
                Uji pemahaman sifat eksponen dan logaritma melalui pilihan
                ganda, isian singkat, dan soal uraian.
              </p>
              <span className="practice-card-cta">
                Mulai latihan <ArrowRight size={16} aria-hidden="true" />
              </span>
            </div>
            <div className="practice-card-aside">
              <span className="practice-math-mark" aria-hidden="true">
                a<sup>x</sup>
              </span>
              <span className="practice-card-stat">
                <ListChecks size={15} aria-hidden="true" />
                30 soal · 100 poin
              </span>
              <span className="practice-card-stat">
                <Clock3 size={15} aria-hidden="true" />
                90 menit
              </span>
              <span className="practice-card-types">
                20 PG · 5 isian · 5 uraian
              </span>
            </div>
          </a>
        </div>
      </section>

      <section
        className="practice-list"
        aria-labelledby="practice-series-title"
      >
        <div className="practice-section-heading">
          <div>
            <span className="practice-section-index">02 / KELAS X</span>
            <h2 id="practice-series-title">Barisan dan Deret</h2>
          </div>
          <span className="practice-level">FASE E</span>
        </div>

        <div className="practice-card-grid">
          <a
            className="practice-card"
            href="/latihan-soal/barisan-deret"
            onClick={(event) => navigate(event, "practice-barisan-deret")}
          >
            <div className="practice-card-main">
              <span className="practice-card-kicker">
                <BookOpenText size={15} aria-hidden="true" />
                LATIHAN INTERAKTIF
              </span>
              <h3>Latihan Soal Barisan dan Deret</h3>
              <p>
                Latih pola aritmetika dan geometri, deret tak hingga, serta
                penerapannya melalui soal bertingkat dan pembahasan.
              </p>
              <span className="practice-card-cta">
                Mulai latihan <ArrowRight size={16} aria-hidden="true" />
              </span>
            </div>
            <div className="practice-card-aside">
              <span className="practice-math-mark" aria-hidden="true">
                a<sub>n</sub>
              </span>
              <span className="practice-card-stat">
                <ListChecks size={15} aria-hidden="true" />
                30 soal · 100 poin
              </span>
              <span className="practice-card-stat">
                <Clock3 size={15} aria-hidden="true" />
                120 menit
              </span>
              <span className="practice-card-types">
                20 PG · 5 isian · 5 uraian
              </span>
            </div>
          </a>
        </div>
      </section>
    </main>
  );
}
