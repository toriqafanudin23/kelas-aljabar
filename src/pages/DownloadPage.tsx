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
  {
    title: "Lingkaran",
    slug: "lingkaran",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/lingkaran.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL2xpbmdrYXJhbi5wZGYiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkxMDMwMzEwLCJleHAiOjE4MjI1NjYzMTB9.mj5j2sQpA4GuBN9Yxz60uAB335cecZ2Q3bC_xrGXiuJtTZ3-WSl0JlopWCGwvWci5F2pS1DL3RzjqLlamLHdKw",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/lingkaran.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL2xpbmdrYXJhbi50ZXgiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkxMDMwMzU0LCJleHAiOjE4MjI1NjYzNTR9.G5mRRJQMGhyMrC-zSZUG0hQkzF0PQKPCc8WI027SVrHsNe7cyS4Z8vV8A573o6SlrbZHABhrmKxPHyK_tRVaMw",
  },
  {
    title: "Irisan Kerucut",
    slug: "irisan-kerucut",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/irisan-kerucut.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL2lyaXNhbi1rZXJ1Y3V0LnBkZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTEwMzAxMzksImV4cCI6MTgyMjU2NjEzOX0.hsAzo2efngba_06MGuh53IGyezGWlIFbrUeNbsq2jogKcvvWuZ8nGYDElR36dCWykukcO5DA-88cAuZ0lpwJ_A",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/irisan-kerucut.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL2lyaXNhbi1rZXJ1Y3V0LnRleCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTEwMzAxNjYsImV4cCI6MTgyMjU2NjE2Nn0.nAd7AiXnfdb-Ai18ZFedRFXLT0fkC0SxovQeMrxv6mqHcbGqnlA2x7JV7PGW1mz8L-C2AQlLfyQVM92uKR3JBA",
  },
  {
    title: "Kombinatorika",
    slug: "kombinatorika",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/kombinatorika.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL2tvbWJpbmF0b3Jpa2EucGRmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MTAzMDE4NiwiZXhwIjoxODIyNTY2MTg2fQ.zNDx9s4PoGYWKbjd4hHukffzxqqf9NdadQm-jr36ictlusBkjFF6buk9yOGxBWIDdn0aGuIaT7hPMOxvYpH2Eg",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/kombinatorika.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL2tvbWJpbmF0b3Jpa2EudGV4Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MTAzMDIxNiwiZXhwIjoxODIyNTY2MjE2fQ._gxf8rWqAsDe23KU5eBaC4Y7R1ayifR4Fd9H4N0JN9t3UWYsaDF7043Nw8jAIYdxH0dAqLpSpQ3wocjJWWImuw",
  },
  {
    title: "Limit",
    slug: "limit",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/limit.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL2xpbWl0LnBkZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTEwMzAyMzgsImV4cCI6MTgyMjU2NjIzOH0.DwNvss092eZVv33XXCPn0fjeO0gDHLkE6qA5XGp22fDlmet8mY0DQ3ic0A_eZhukYh2a9rvBAORMSTXAQFJ3og",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/limit.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL2xpbWl0LnRleCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTEwMzAyODYsImV4cCI6MTgyMjU2NjI4Nn0.9eITxqmyOUGwTeRqKfLTi5qWRpczVhpxVzZ5FYb7RNEFYHhm73yvZDE0iFpunri-fD9KQU6Is7K-R7pUzte54Q",
  },
  {
    title: "Transformasi Fungsi",
    slug: "transformasi-fungsi",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/transformasi-fungsi.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL3RyYW5zZm9ybWFzaS1mdW5nc2kucGRmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MTAzMDM2OSwiZXhwIjoxODIyNTY2MzY5fQ.Gdb6rCCQ_BdHPaGKwIrESeOeg3Jbmcxp7ZBN4f6TaLwDWLHCzJTDKeWpikSDyx2hdP09QVdHL9hEc7llo9mIvg",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/transformasi-fungsi.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL3RyYW5zZm9ybWFzaS1mdW5nc2kudGV4Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MTAzMDgzNSwiZXhwIjoxODIyNTY2ODM1fQ.UfPzIFA5ut6Prbn-jl9BpualEhemGS30uFnjGPm71x1AdLumtu8yqe6cz1RjTQV9zb8XftdX4xUG7BhgZXP2Jw",
  },
  {
    title: "Turunan",
    slug: "turunan",
    pdf: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/turunan.pdf?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL3R1cnVuYW4ucGRmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MTAzMDQyNSwiZXhwIjoxODIyNTY2NDI1fQ.yyRt5mGZ8kAAul5DCyw8X8fOfw6JS6N1FfkERD7vuiB8ar-mO3JqaR8R054k6reUY8mfv5sHCKP54GWdmxOocQ",
    tex: "https://tpaknparzpagspfgwigx.supabase.co/storage/v1/object/sign/slide/materi2/turunan.tex?token=eyJraWQiOiIwZDljZTk1Mi1mOGRkLTQ1N2QtYWViYi1iZjRiNTM5MjVkNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzbGlkZS9tYXRlcmkyL3R1cnVuYW4udGV4Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MTAzMDQ1MCwiZXhwIjoxODIyNTY2NDUwfQ.p7rjjhi9gpwfqN3U_VTJ8Dg2u0do8H8TQvI10JcHz9qqjiLh_7CZyOyN1i4nnpFiEM6C7zpq3sNQprRiuilRQA",
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
