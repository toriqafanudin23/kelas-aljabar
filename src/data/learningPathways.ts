export interface PathwayModule {
  /** Slug halaman materi, dipakai langsung sebagai nilai `Page` saat navigasi. */
  slug: string;
  /** Nomor modul dua digit sesuai urutan kurikulum. */
  number: string;
  /** Judul modul yang ditampilkan pada daftar. */
  title: string;
}

export interface PathwayStage {
  id: string;
  /** Label jenjang, contoh: "Kelas X". */
  grade: string;
  /** Label fase kurikulum, contoh: "Fase E". */
  phase: string;
  /** Kalimat singkat tentang cakupan tahap ini. */
  summary: string;
  modules: PathwayModule[];
}

/**
 * Peta modul berjenjang Kelas X–XII. Satu-satunya sumber data untuk
 * daftar modul di landing page, agar tautan mudah diperiksa dan diperbarui.
 */
export const pathwayStages: PathwayStage[] = [
  {
    id: "fase-e",
    grade: "Kelas X",
    phase: "Fase E",
    summary:
      "Fondasi aljabar, trigonometri, geometri vektor, dan pengolahan data.",
    modules: [
      {
        slug: "eksponensial",
        number: "01",
        title: "Eksponensial dan Logaritma",
      },
      { slug: "barisan-deret", number: "02", title: "Barisan dan Deret" },
      { slug: "vektor", number: "03", title: "Vektor" },
      {
        slug: "trigonometri",
        number: "04",
        title: "Perbandingan Trigonometri",
      },
      {
        slug: "sppl",
        number: "05",
        title: "Sistem Persamaan dan Pertidaksamaan Linear",
      },
      { slug: "fungsi-kuadrat", number: "06", title: "Fungsi Kuadrat" },
      { slug: "statistika", number: "07", title: "Statistika" },
      { slug: "peluang", number: "08", title: "Teori Peluang" },
    ],
  },
  {
    id: "fase-f",
    grade: "Kelas XI",
    phase: "Fase F",
    summary:
      "Perluasan fungsi, geometri analitik, bilangan kompleks, dan aljabar matriks.",
    modules: [
      {
        slug: "komposisi-fungsi-dan-invers",
        number: "09",
        title: "Komposisi Fungsi dan Invers",
      },
      { slug: "lingkaran", number: "10", title: "Lingkaran" },
      { slug: "bilangan-kompleks", number: "11", title: "Bilangan Kompleks" },
      { slug: "polinomial", number: "12", title: "Polinomial" },
      { slug: "matriks", number: "13", title: "Matriks" },
      {
        slug: "transformasi-geometri",
        number: "14",
        title: "Transformasi Geometri",
      },
    ],
  },
  {
    id: "fase-f-lanjut",
    grade: "Kelas XII",
    phase: "Fase F Lanjut",
    summary:
      "Pemodelan, irisan kerucut, kombinatorika, serta kalkulus diferensial dan integral.",
    modules: [
      { slug: "fungsi", number: "15", title: "Fungsi dan Pemodelan" },
      {
        slug: "transformasi-fungsi",
        number: "16",
        title: "Transformasi Fungsi",
      },
      { slug: "kombinatorika", number: "17", title: "Kombinatorika" },
      { slug: "irisan-kerucut", number: "18", title: "Irisan Kerucut" },
      { slug: "limit", number: "19", title: "Limit Fungsi" },
      { slug: "turunan", number: "20", title: "Turunan Fungsi" },
      { slug: "integral", number: "21", title: "Integral" },
    ],
  },
];

/** Judul modul pengayaan di luar tiga tahap utama. */
export const enrichmentModule: PathwayModule = {
  slug: "teori-bilangan",
  number: "22",
  title: "Teori Bilangan (Pengayaan Olimpiade)",
};
