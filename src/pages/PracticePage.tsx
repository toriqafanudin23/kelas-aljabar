import { ArrowRight, Clock3, FileQuestion, Trophy } from "lucide-react";
import type { Navigate } from "../types/navigation";
import "./PracticePage.css";

interface PracticePageProps {
  navigate: Navigate;
}

const practiceModules = [
  {
    id: "01",
    page: "practice-eksponensial",
    href: "/latihan-soal/eksponensial",
    title: "Eksponensial dan Logaritma",
    description:
      "Uji pemahaman sifat eksponen dan logaritma melalui pilihan ganda, isian singkat, dan soal uraian.",
    topics: ["Sifat eksponen", "Logaritma"],
    questionCount: 30,
    points: 100,
    duration: 90,
  },
  {
    id: "02",
    page: "practice-barisan-deret",
    href: "/latihan-soal/barisan-deret",
    title: "Barisan dan Deret",
    description:
      "Latih pola aritmetika dan geometri, deret tak hingga, serta penerapannya melalui soal bertingkat dan pembahasan.",
    topics: ["Aritmetika", "Geometri", "Deret tak hingga"],
    questionCount: 30,
    points: 100,
    duration: 120,
  },
  {
    id: "03",
    page: "practice-vektor",
    href: "/latihan-soal/vektor",
    title: "Vektor",
    description:
      "Latih operasi, panjang, sudut, dan hasil kali vektor melalui soal pilihan ganda, isian singkat, dan uraian.",
    topics: ["Operasi", "Panjang dan sudut", "Hasil kali"],
    questionCount: 30,
    points: 100,
    duration: 90,
  },
  {
    id: "04",
    page: "practice-sppl",
    href: "/latihan-soal/sppl",
    title: "Sistem Persamaan dan Pertidaksamaan Linear",
    description:
      "Latih persamaan, pertidaksamaan, dan program linear dengan pilihan ganda, isian singkat, serta soal uraian.",
    topics: ["Persamaan", "Pertidaksamaan", "Program linear"],
    questionCount: 30,
    points: 100,
    duration: 90,
  },
  {
    id: "05",
    page: "practice-fungsi-kuadrat",
    href: "/latihan-soal/fungsi-kuadrat",
    title: "Fungsi Kuadrat",
    description:
      "Latih persamaan dan grafik fungsi kuadrat, diskriminan, akar, serta titik puncak melalui soal interaktif dan pembahasan.",
    topics: ["Grafik parabola", "Diskriminan", "Akar dan titik puncak"],
    questionCount: 30,
    points: 100,
    duration: 120,
  },
  {
    id: "06",
    page: "practice-perbandingan-trigonometri",
    href: "/latihan-soal/perbandingan-trigonometri",
    title: "Perbandingan Trigonometri",
    description:
      "Latih sinus, cosinus, tangen, sudut istimewa, serta sudut elevasi dan depresi melalui soal interaktif dan pembahasan.",
    topics: ["Sinus, cosinus, tangen", "Sudut istimewa", "Elevasi dan depresi"],
    questionCount: 23,
    points: 100,
    duration: 90,
  },
  {
    id: "07",
    page: "practice-peluang",
    href: "/latihan-soal/peluang",
    title: "Peluang",
    description:
      "Latih peluang kejadian, peluang bersyarat, kombinasi, dan frekuensi harapan melalui soal interaktif dan pembahasan.",
    topics: ["Peluang kejadian", "Peluang bersyarat", "Frekuensi harapan"],
    questionCount: 23,
    points: 100,
    duration: 90,
  },
  {
    id: "08",
    page: "practice-statistika",
    href: "/latihan-soal/statistika",
    title: "Statistika",
    description:
      "Latih mean, median, modus, dan penyajian data, termasuk pengolahan data berkelompok melalui soal interaktif dan pembahasan.",
    topics: ["Mean, median, modus", "Data berkelompok", "Penyajian data"],
    questionCount: 30,
    points: 100,
    duration: 120,
  },
];

export function PracticePage({ navigate }: PracticePageProps) {
  const totalQuestions = practiceModules.reduce(
    (total, module) => total + module.questionCount,
    0,
  );

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

      <section className="practice-overview" aria-label="Ringkasan latihan">
        <div className="practice-overview-lead">
          <span className="practice-overview-label">Koleksi latihan</span>
          <strong>{practiceModules.length} paket berdasarkan materi</strong>
        </div>
        <div className="practice-overview-stat">
          <strong>{totalQuestions}</strong>
          <span>soal tersedia</span>
        </div>
        <div className="practice-overview-stat">
          <strong>90–120</strong>
          <span>menit per paket</span>
        </div>
      </section>

      <section className="practice-list" aria-label="Daftar latihan soal">
        <div className="practice-section-heading">
          <div>
            <span className="practice-overview-label">Pilih topik</span>
            <h2>Mulai dari materi yang ingin kamu latih</h2>
          </div>
          <span className="practice-module-count">
            {practiceModules.length} paket
          </span>
        </div>
        <div className="practice-card-grid">
          {practiceModules.map((module) => (
            <a
              key={module.page}
              className="practice-card"
              href={module.href}
              onClick={(event) =>
                navigate(event, module.page as Parameters<Navigate>[1])
              }
            >
              <div className="practice-card-heading">
                <span className="practice-card-index">PAKET {module.id}</span>
                <span className="practice-card-question-count">
                  <FileQuestion size={15} aria-hidden="true" />
                  {module.questionCount} soal
                </span>
              </div>
              <div className="practice-card-main">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
              <div className="practice-card-topics" aria-label="Fokus materi">
                {module.topics.map((topic) => (
                  <span className="practice-topic" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
              <div className="practice-card-details">
                <span>
                  <Clock3 size={15} aria-hidden="true" />
                  {module.duration} menit
                </span>
                <span>
                  <Trophy size={15} aria-hidden="true" />
                  {module.points} poin
                </span>
              </div>
              <span className="practice-card-cta">
                Mulai latihan <ArrowRight size={16} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
