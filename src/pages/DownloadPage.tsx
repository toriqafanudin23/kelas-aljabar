import type { Navigate } from "../types/navigation";

interface SlideDownload {
  number: string;
  title: string;
  file: string | null;
}

interface GradeSlides {
  grade: string;
  slides: SlideDownload[];
}

const slideFolder =
  "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/public/slide-berdasarkan-kelas/";

const gradeSlides: GradeSlides[] = [
  {
    grade: "Kelas 10",
    slides: [
      {
        number: "01",
        title: "Eksponensial dan Logaritma",
        file: "kelas10/01eksponensial.pdf",
      },
      {
        number: "02",
        title: "Barisan dan Deret",
        file: "kelas10/02barisan-deret.pdf",
      },
      { number: "03", title: "Vektor", file: "kelas10/03vektor.pdf" },
      {
        number: "04",
        title: "Perbandingan Trigonometri",
        file: "kelas10/04perbandingan-trigonometri.pdf",
      },
      {
        number: "05",
        title: "Sistem Persamaan dan Pertidaksamaan Linear",
        file: "kelas10/05sppl.pdf",
      },
      {
        number: "06",
        title: "Fungsi Kuadrat",
        file: "kelas10/06fungsi-kuadrat.pdf",
      },
      { number: "07", title: "Statistika", file: "kelas10/07statistika.pdf" },
      { number: "08", title: "Peluang", file: "kelas10/08peluang.pdf" },
    ],
  },
  {
    grade: "Kelas 11",
    slides: [
      {
        number: "09",
        title: "Komposisi Fungsi dan Invers",
        file: "kelas11/09komposisi-fungsi.pdf",
      },
      { number: "10", title: "Lingkaran", file: "kelas11/10lingkaran.pdf" },
      {
        number: "11",
        title: "Bilangan Kompleks",
        file: "kelas11/11bilangan-kompleks.pdf",
      },
      { number: "12", title: "Polinomial", file: "kelas11/12polinomial.pdf" },
      { number: "13", title: "Matriks", file: "kelas11/13matriks.pdf" },
      {
        number: "14",
        title: "Transformasi Geometri",
        file: "kelas11/14transformasi-geometri.pdf",
      },
    ],
  },
  {
    grade: "Kelas 12",
    slides: [
      {
        number: "15",
        title: "Fungsi dan Pemodelan",
        file: "kelas12/17fungsi-dan-pemodelan.pdf",
      },
      {
        number: "16",
        title: "Transformasi Fungsi",
        file: "kelas12/15transformasi-fungsi.pdf",
      },
      {
        number: "17",
        title: "Kombinatorika",
        file: "kelas12/16kombinatorika.pdf",
      },
      {
        number: "18",
        title: "Irisan Kerucut",
        file: "kelas12/18irisan-kerucut.pdf",
      },
      { number: "19", title: "Limit", file: "kelas12/19limit.pdf" },
      { number: "20", title: "Turunan Fungsi", file: "kelas12/20turunan.pdf" },
      { number: "21", title: "Integral", file: "kelas12/21integral.pdf" },
      { number: "22", title: "Analisis Data dan Peluang", file: null },
    ],
  },
];

interface DownloadPageProps {
  navigate: Navigate;
}

export function DownloadPage({ navigate }: DownloadPageProps) {
  return (
    <main className="site-width inner-page download-page">
      <div className="breadcrumb">
        <a href="/" onClick={(event) => navigate(event, "home")}>
          Beranda
        </a>
        <span>/</span>
        <span>Unduh</span>
      </div>

      <div className="page-intro">
        <span className="section-kicker">Bahan Presentasi</span>
        <h1>Unduh Slide Presentasi</h1>
        <p>
          Unduh materi matematika SMA dalam format PDF, disusun berdasarkan
          kelas dan urutan pembelajaran.
        </p>
      </div>

      <section
        className="download-preview"
        aria-labelledby="download-preview-title"
      >
        <div className="download-preview-heading">
          <div>
            <span className="download-preview-kicker">
              Contoh materi · Kelas 10
            </span>
            <h2 id="download-preview-title">Eksponensial dan Logaritma</h2>
            <p>Lihat pratinjau materi sebelum mengunduh PDF.</p>
          </div>
          <a
            className="download-preview-link"
            href={`${slideFolder}kelas10/01eksponensial.pdf?download=01eksponensial.pdf`}
            target="_blank"
            rel="noreferrer"
          >
            <span>Unduh PDF</span>
            <svg
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
          </a>
        </div>
        <div className="download-preview-frame">
          <iframe
            src={`${slideFolder}kelas10/01eksponensial.pdf`}
            title="Pratinjau PDF Eksponensial dan Logaritma"
            loading="lazy"
          />
        </div>
      </section>

      <section className="download-list" aria-label="Daftar slide presentasi">
        <div className="download-list-heading">
          <span>Materi</span>
          <span>PDF</span>
        </div>
        {gradeSlides.map(({ grade, slides }) => (
          <section className="download-grade" key={grade} aria-label={grade}>
            <h2 className="download-grade-heading">{grade}</h2>
            {slides.map((slide) => (
              <article
                className={`download-row${slide.file ? "" : " download-row-unavailable"}`}
                key={slide.number}
              >
                <div className="download-topic">
                  <span className="download-number">{slide.number}</span>
                  <h3>{slide.title}</h3>
                </div>
                <div className="download-actions">
                  {slide.file ? (
                    <a
                      href={`${slideFolder}${slide.file}?download=${slide.file.split("/").pop()}`}
                      download
                      aria-label={`Unduh PDF ${slide.title}`}
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
                  ) : (
                    <span className="download-unavailable">Belum tersedia</span>
                  )}
                </div>
              </article>
            ))}
          </section>
        ))}
      </section>
    </main>
  );
}
