import { ArrowRight } from "lucide-react";
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

      <section className="practice-list" aria-label="Daftar latihan soal">
        <div className="practice-card-grid">
          <a
            className="practice-card"
            href="/latihan-soal/eksponensial"
            onClick={(event) => navigate(event, "practice-eksponensial")}
          >
            <div className="practice-card-main">
              <h3>Latihan Soal Eksponensial</h3>
              <p>
                Uji pemahaman sifat eksponen dan logaritma melalui pilihan
                ganda, isian singkat, dan soal uraian.
              </p>
            </div>
            <span className="practice-card-meta">
              30 soal <span aria-hidden="true">·</span> 100 poin
              <span aria-hidden="true">·</span> 90 menit
            </span>
            <span className="practice-card-cta">
              Mulai <ArrowRight size={15} aria-hidden="true" />
            </span>
          </a>
          <a
            className="practice-card"
            href="/latihan-soal/barisan-deret"
            onClick={(event) => navigate(event, "practice-barisan-deret")}
          >
            <div className="practice-card-main">
              <h3>Latihan Soal Barisan dan Deret</h3>
              <p>
                Latih pola aritmetika dan geometri, deret tak hingga, serta
                penerapannya melalui soal bertingkat dan pembahasan.
              </p>
            </div>
            <span className="practice-card-meta">
              30 soal <span aria-hidden="true">·</span> 100 poin
              <span aria-hidden="true">·</span> 120 menit
            </span>
            <span className="practice-card-cta">
              Mulai <ArrowRight size={15} aria-hidden="true" />
            </span>
          </a>
          <a
            className="practice-card"
            href="/latihan-soal/vektor"
            onClick={(event) => navigate(event, "practice-vektor")}
          >
            <div className="practice-card-main">
              <h3>Latihan Soal Vektor</h3>
              <p>
                Latih operasi, panjang, sudut, dan hasil kali vektor melalui
                soal pilihan ganda, isian singkat, dan uraian.
              </p>
            </div>
            <span className="practice-card-meta">
              30 soal <span aria-hidden="true">·</span> 100 poin
              <span aria-hidden="true">·</span> 90 menit
            </span>
            <span className="practice-card-cta">
              Mulai <ArrowRight size={15} aria-hidden="true" />
            </span>
          </a>
          <a
            className="practice-card"
            href="/latihan-soal/sppl"
            onClick={(event) => navigate(event, "practice-sppl")}
          >
            <div className="practice-card-main">
              <h3>Latihan Soal Sistem Persamaan dan Pertidaksamaan Linear</h3>
              <p>
                Latih persamaan, pertidaksamaan, dan program linear dengan
                pilihan ganda, isian singkat, serta soal uraian.
              </p>
            </div>
            <span className="practice-card-meta">
              30 soal <span aria-hidden="true">·</span> 100 poin
              <span aria-hidden="true">·</span> 90 menit
            </span>
            <span className="practice-card-cta">
              Mulai <ArrowRight size={15} aria-hidden="true" />
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}
