import type { Navigate } from "../types/navigation";

interface SlideDownload {
  title: string;
  slug: string;
  pdf: string;
  tex: string;
}

const slides: SlideDownload[] = [
  {
    title: "Bilangan Kompleks",
    slug: "bilangan-kompleks",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/bilangan-kompleks.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9iaWxhbmdhbi1rb21wbGVrcy5wZGYiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkwOTk2NzQwLCJleHAiOjE4MjI1MzI3NDB9.kcqc_-ogyPNcLSk-ChHRsythOiEjFDROsi4Hr8XJoZ2Q7ynz1kmoTl6m_IB9UoduC-g2C_nPOQhZTiB5BsSTtA",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/bilangan-kompleks.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9iaWxhbmdhbi1rb21wbGVrcy50ZXgiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkwOTk2NzcwLCJleHAiOjE4MjI1MzI3NzB9.-xNvBWYDOSKNFozLB1kS9YhhZFj9ZQ71iwhoGzav-Jk3F-brkpuX2Ulmef0vIw9PnYCqT0QcL45h1cO2YBzspA",
  },
  {
    title: "Fungsi",
    slug: "fungsi",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/fungsi.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9mdW5nc2kucGRmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MDk5Njc5MSwiZXhwIjoxODIyNTMyNzkxfQ.YbsfRrtk75QaMCu4ePny2o4iJt7Q_ziKd7UgPg1_-xkD1dLxbZotVbELg5R-oyj2d6rIjphgJfU_PGonVOdwDQ",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/fungsi.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9mdW5nc2kudGV4Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MDk5NjgzMywiZXhwIjoxODIyNTMyODMzfQ.Z-ovlz37aP07sHtzWY7mHOZaN4Sq_TDp3QLPNckJZ3U4a5giPdP7LSaVq8AME3wGzwPgv70S1IXhwcSxI08Zmw",
  },
  {
    title: "Komposisi Fungsi",
    slug: "komposisi-fungsi",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/komposisi-fungsi.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9rb21wb3Npc2ktZnVuZ3NpLnBkZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTA5OTY4NTUsImV4cCI6MTgyMjUzMjg1NX0.ThZ8bctAI0YdfPmKnwb9ZhzqBphcawY0FF21SZHXRD3_RA7MoNkaG0zRD14NKk7xN4x59uWc3RUoKdUN_okmwQ",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/komposisi-fungsi.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9rb21wb3Npc2ktZnVuZ3NpLnRleCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTA5OTY5MTYsImV4cCI6MTgyMjUzMjkxNn0.xaRwoc9tP2XN7rhSOJEhE7R47rQMeNePCiplzmpBu5Kp771oL5Z3gle5u_HoSgzW76HmvL17R-lvCg1zhTd3qA",
  },
  {
    title: "Matriks",
    slug: "matriks",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/matriks.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRyaWtzLnBkZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTA5OTY5NDAsImV4cCI6MTgyMjUzMjk0MH0.848o_1FR1Tt04BKV04A9y0y0j6lG334VQY3XeIAqMa2t_ImwMglxrZwQ0tGZvN0Kxp1YKpqN9FU6Q9GkXPTUNA",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/matriks.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRyaWtzLnRleCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTA5OTY5NzMsImV4cCI6MTgyMjUzMjk3M30.H49IzjR75QUPPR15jpYoyFf-Ete_DvsRuXNugYhVdn-ydgZm2a0HocEACDkHeCraGMFHB99JhaJD4wDK14lV_Q",
  },
  {
    title: "Polinomial",
    slug: "polinomial",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/polinomial.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9wb2xpbm9taWFsLnBkZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTA5OTY5OTgsImV4cCI6MTgyMjUzMjk5OH0.TzM6Rx_SQyjgKLvaV7NHJ4WH7eB8HWXf0a9aYc_C0K0Z7yqaK5TJpXZUjhOJG3HV-BO9fPTc0xnseDYeqaPoXg",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/polinomial.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9wb2xpbm9taWFsLnRleCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTA5OTcwMzEsImV4cCI6MTgyMjUzMzAzMX0.kxqta_uovIsbDcUPQNXFXe-6N1DIVe1YFe4DeRBYmiMjxIA6dgqLpKQtDZsh6JYxujDnVsYKB0JTHmp9G99l4A",
  },
  {
    title: "Transformasi Geometri",
    slug: "transformasi-geometri",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/transformasi-geometri.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS90cmFuc2Zvcm1hc2ktZ2VvbWV0cmkucGRmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MDk5NzA4OSwiZXhwIjoxODIyNTMzMDg5fQ.XmJwFBpdLNXxcwkJEyv42KOdUk9WGaVEFR4OUCENBUAwFLhfuYPLiZdQpv5A2A4uNlVm4QaRCcfz2K1EDkhm5Q",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/transformasi-geometri.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS90cmFuc2Zvcm1hc2ktZ2VvbWV0cmkudGV4Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MDk5NzEwOCwiZXhwIjoxODIyNTMzMTA4fQ.-7NTKQakrN31FPXQN4QD1syMdbyBiyvnSdtjgBBw87Tjq_zW5iB69c4gt8wUB-poGdDSpmVtKwnh4pp97h0JkA",
  },
  {
    title: "Vektor",
    slug: "vektor",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/vektor.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS92ZWt0b3IucGRmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MDk5NzEzMywiZXhwIjoxODIyNTMzMTMzfQ.WXl-bOJ29Uizl9p1W2PPP1-ISYAJi-TB-fSXs72gkO65Xx9NS93Uo5MlZQ_dM37WlvFbn_FgoZb0b4YE4l6y7A",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/vektor.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS92ZWt0b3IudGV4Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MDk5NzE1MCwiZXhwIjoxODIyNTMzMTUwfQ.NLmxjx02peHs2tATtM2zbBZiDKYlOgcXNJ6Vh6ALEb6klKiI0qtl3XfHZ0ffAE18ra9Qq3juXOv32cPSsuVsKg",
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
          Pilih materi dan format berkas yang dibutuhkan. Setiap slide tersedia
          dalam format PDF untuk dibaca dan LaTeX untuk disunting.
        </p>
      </div>

      <section className="download-list" aria-label="Daftar slide presentasi">
        <div className="download-list-heading">
          <span>Materi</span>
          <span>Format unduhan</span>
        </div>
        {slides.map((slide, index) => (
          <article className="download-row" key={slide.slug}>
            <div className="download-topic">
              <span className="download-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2>{slide.title}</h2>
            </div>
            <div className="download-actions">
              <a
                href={`${slide.pdf}&download=${slide.slug}.pdf`}
                download={`${slide.slug}.pdf`}
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
              <a
                href={`${slide.tex}&download=${slide.slug}.tex`}
                download={`${slide.slug}.tex`}
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
                <span className="file-type tex-type">TEX</span>
                <span>Unduh .tex</span>
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
