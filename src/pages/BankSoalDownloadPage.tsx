import type { Navigate } from "../types/navigation";

interface BankQuestion {
  title: string;
  url: string;
}

interface BankQuestionGrade {
  grade: string;
  questions: BankQuestion[];
}

const bankQuestionGrades: BankQuestionGrade[] = [
  {
    grade: "Kelas 10",
    questions: [
      {
        title: "Eksponensial dan Logaritma",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal10/01latihan_eksponen_logaritma.pdf",
      },
      {
        title: "Barisan dan Deret",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal10/02latihan_barisan_deret.pdf",
      },
      {
        title: "Vektor",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal10/03latihan_vektor.pdf",
      },
      {
        title: "Perbandingan Trigonometri",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal10/04latihan_perbandingan_trigonometri.pdf",
      },
      {
        title: "Sistem Persamaan dan Pertidaksamaan Linear",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal10/05latihan_sistem_persamaan_pertidaksamaan_linear.pdf",
      },
      {
        title: "Fungsi Kuadrat",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal10/06latihan_fungsi_kuadrat.pdf",
      },
      {
        title: "Statistika",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal10/07latihan_statistika.pdf",
      },
      {
        title: "Teori Peluang",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal10/08latihan_peluang.pdf",
      },
    ],
  },
  {
    grade: "Kelas 11",
    questions: [
      {
        title: "Bilangan Kompleks",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal11/latihan_bilangan_kompleks.pdf",
      },
      {
        title: "Komposisi Fungsi dan Invers",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal11/latihan_komposisi_fungsi_invers.pdf",
      },
      {
        title: "Lingkaran",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal11/latihan_lingkaran.pdf",
      },
      {
        title: "Polinomial",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal11/latihan_polinomial.pdf",
      },
      {
        title: "Transformasi Geometri",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal11/latihan_transformasi_geometri.pdf",
      },
      {
        title: "Matriks",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal11/matriks_latihan.pdf",
      },
    ],
  },
  {
    grade: "Kelas 12",
    questions: [
      {
        title: "Irisan Kerucut",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal12/latihan_irisan_kerucut.pdf",
      },
      {
        title: "Fungsi dan Pemodelan",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal12/fungsi_latihan.pdf",
      },
      {
        title: "Transformasi Fungsi",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal12/latihan_transformasi_fungsi.pdf",
      },
      {
        title: "Kombinatorika",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal12/latihan_kombinatorika.pdf",
      },
      {
        title: "Analisis Data dan Peluang",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal12/latihan_analisis_data_peluang.pdf",
      },
      {
        title: "Limit",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal12/latihan_limit.pdf",
      },
      {
        title: "Turunan Fungsi",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal12/latihan_turunan.pdf",
      },
      {
        title: "Integral",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soal12/latihan_integral.pdf",
      },
    ],
  },
  {
    grade: "SMP",
    questions: [
      {
        title: "Pengantar Himpunan, Relasi, dan Fungsi",
        url: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/soalSMP/latihan_himpunan_relasi_fungsi.pdf",
      },
    ],
  },
];

interface BankSoalDownloadPageProps {
  navigate: Navigate;
}

export function BankSoalDownloadPage({ navigate }: BankSoalDownloadPageProps) {
  return (
    <main className="site-width inner-page download-page">
      <div className="breadcrumb">
        <a href="/" onClick={(event) => navigate(event, "home")}>
          Beranda
        </a>
        <span>/</span>
        <a href="/unduh" onClick={(event) => navigate(event, "download")}>
          Unduh
        </a>
        <span>/</span>
        <span>Bank Soal</span>
      </div>

      <div className="page-intro">
        <span className="section-kicker">Latihan Matematika</span>
        <h1>Unduh Bank Soal</h1>
        <p>
          Kumpulan latihan soal matematika dalam format PDF, disusun berdasarkan
          jenjang dan kelas.
        </p>
      </div>

      <section className="download-list" aria-label="Daftar bank soal">
        <div className="download-list-heading">
          <span>Topik latihan</span>
          <span>File</span>
        </div>
        {bankQuestionGrades.map(({ grade, questions }, gradeIndex) => {
          const firstQuestionNumber = bankQuestionGrades
            .slice(0, gradeIndex)
            .reduce(
              (total, currentGrade) => total + currentGrade.questions.length,
              0,
            );

          return (
            <section className="download-grade" key={grade} aria-label={grade}>
              <h2 className="download-grade-heading">{grade}</h2>
              {questions.map((question, questionIndex) => {
                const questionNumber = firstQuestionNumber + questionIndex + 1;
                const filename =
                  question.url.split("/").pop() ?? "bank-soal.pdf";

                return (
                  <article className="download-row" key={question.title}>
                    <div className="download-topic">
                      <span className="download-number">
                        {String(questionNumber).padStart(2, "0")}
                      </span>
                      <h3>{question.title}</h3>
                    </div>
                    <div className="download-actions">
                      <a
                        href={`${question.url}?download=${filename}`}
                        download
                        aria-label={`Unduh bank soal ${question.title}`}
                      >
                        <svg
                          className="download-button-icon"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 3v12" />
                          <path d="m7 10 5 5 5-5" />
                          <path d="M5 19h14" />
                        </svg>
                        <span className="file-type">PDF</span>
                        <span>Unduh PDF</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </section>
    </main>
  );
}
