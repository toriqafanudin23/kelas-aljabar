import eksponensialHtml from "./eksponensial.html?raw";
import spplHtml from "./sppl.html?raw";
import fungsiKuadratHtml from "./fungsi-kuadrat.html?raw";
import barisanDeretHtml from "./barisan-deret.html?raw";
import matriksHtml from "./matriks.html?raw";
import vektorHtml from "./vektor.html?raw";
import transformasiGeometriHtml from "./transformasi-geometri.html?raw";
import kombinatorikaHtml from "./kombinatorika.html?raw";
import peluangHtml from "./peluang.html?raw";

export interface Material {
  id: string;
  slug: string;
  number: string;
  category: string;
  title: string;
  grade: string;
  phase: string;
  prerequisite: string;
  formula: string;
  description: string;
  htmlContent: string;
}

/**
 * Urutan materi disusun secara sistematis berdasarkan prasyarat keilmuan (pedagogis)
 * dan kesinambungan kurikulum matematika SMA (Fase E, Fase F, dan Fase F Lanjut):
 * 
 * 1. Eksponensial dan Logaritma (Kelas X) -> Dasar pemangkatan, logaritma, & fungsi dasar
 * 2. Sistem Persamaan & Pertidaksamaan Linear (Kelas X) -> Dasar aljabar linear & daerah penyelesaian
 * 3. Fungsi Kuadrat (Kelas X) -> Karakteristik grafik parabola, diskriminan, titik ekstrim
 * 4. Barisan dan Deret (Kelas X/XI) -> Pola bilangan, notasi sigma, dasar kalkulus diskrit
 * 5. Matriks (Kelas XI) -> Prasyarat langsung dari SPL, aljabar matriks
 * 6. Vektor (Kelas XI) -> Besaran berarah, aljabar vektor analitik R^2 dan R^3
 * 7. Transformasi Geometri (Kelas XI) -> Memerlukan prasyarat matriks & koordinat
 * 8. Kombinatorika (Kelas XII) -> Kaidah pencacahan, permutasi, kombinasi (prasyarat peluang)
 * 9. Teori Peluang (Kelas XII) -> Memerlukan prasyarat mutlak kombinatorika
 */
export const materials: Material[] = [
  {
    id: "exponents",
    slug: "eksponensial",
    number: "01",
    category: "Aljabar Matematika",
    title: "Eksponensial dan Logaritma",
    grade: "Kelas X",
    phase: "Fase E (Kelas X)",
    prerequisite: "Aritmetika & Aljabar Dasar",
    formula: "a^m a^n = a^{m+n} \\qquad \\log_a b = c \\iff a^c=b",
    description:
      "Pelajari landasan aljabar bilangan berpangkat, sifat eksponen, bentuk akar, fungsi eksponensial, serta operasi logaritma secara terstruktur.",
    htmlContent: eksponensialHtml,
  },
  {
    id: "linear-systems",
    slug: "sppl",
    number: "02",
    category: "Aljabar Matematika",
    title: "Sistem Persamaan dan Pertidaksamaan Linear",
    grade: "Kelas X",
    phase: "Fase E (Kelas X)",
    prerequisite: "Persamaan Linear Satu Variabel",
    formula: "ax+by=c \\qquad ax+by\\le c",
    description:
      "Kuasai konsep SPLDV, SPLTV, daerah himpunan penyelesaian SPtLDV, serta pemodelan matematika untuk optimasi masalah kontekstual.",
    htmlContent: spplHtml,
  },
  {
    id: "quadratic-functions",
    slug: "fungsi-kuadrat",
    number: "03",
    category: "Aljabar Matematika",
    title: "Fungsi Kuadrat",
    grade: "Kelas X",
    phase: "Fase E (Kelas X)",
    prerequisite: "Pemfaktoran Aljabar & Relasi Fungsi",
    formula: "f(x)=ax^2+bx+c \\qquad x_p=-\\frac{b}{2a}",
    description:
      "Pelajari karakteristik kurva parabola, pengaruh diskriminan, penentuan titik ekstrem (maksimum/minimum), dan pertidaksamaan kuadrat.",
    htmlContent: fungsiKuadratHtml,
  },
  {
    id: "sequences-series",
    slug: "barisan-deret",
    number: "04",
    category: "Aljabar Matematika",
    title: "Barisan dan Deret",
    grade: "Kelas X / XI",
    phase: "Fase E / F",
    prerequisite: "Pola Bilangan & Fungsi Linear/Eksponen",
    formula: "U_n=a+(n-1)b \\qquad U_n=ar^{n-1}",
    description:
      "Pahami barisan serta deret aritmetika dan geometri, suku ke-n, jumlah deret, sisipan, konvergensi deret geometri tak hingga, dan notasi sigma.",
    htmlContent: barisanDeretHtml,
  },
  {
    id: "matrices",
    slug: "matriks",
    number: "05",
    category: "Aljabar Linear",
    title: "Matriks",
    grade: "Kelas XI",
    phase: "Fase F (Kelas XI)",
    prerequisite: "Sistem Persamaan Linear (SPLDV/SPLTV)",
    formula:
      "\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=ad-bc \\qquad A^{-1}=\\frac{1}{\\det(A)}\\operatorname{adj}(A)",
    description:
      "Eksplorasi susunan skalar tabel dua dimensi, operasi aljabar matriks, determinan, matriks invers, serta metode eliminasi dan aturan Cramer.",
    htmlContent: matriksHtml,
  },
  {
    id: "vectors",
    slug: "vektor",
    number: "06",
    category: "Geometri Analitik",
    title: "Vektor",
    grade: "Kelas XI",
    phase: "Fase F (Kelas XI)",
    prerequisite: "Sistem Koordinat Kartesius & Trigonometri",
    formula:
      "\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta \\qquad |\\vec{a}|=\\sqrt{a_1^2+a_2^2+a_3^2}",
    description:
      "Kuasai representasi geometris dan aljabar vektor pada ruang dua dan tiga dimensi, operasi penjumlahan, perkalian skalar, serta proyeksi ortogonal.",
    htmlContent: vektorHtml,
  },
  {
    id: "geometry",
    slug: "transformasi-geometri",
    number: "07",
    category: "Geometri Analitik",
    title: "Transformasi Geometri",
    grade: "Kelas XI",
    phase: "Fase F (Kelas XI)",
    prerequisite: "Sistem Koordinat Kartesius & Matriks",
    formula:
      "\\begin{bmatrix}x'\\\\y'\\end{bmatrix} = \\begin{bmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{bmatrix} \\begin{bmatrix}x\\\\y\\end{bmatrix}",
    description:
      "Pelajari pemetaan isometri dan keserupaan: translasi, refleksi, rotasi, dan dilatasi, serta komposisinya menggunakan notasi matriks transformasi.",
    htmlContent: transformasiGeometriHtml,
  },
  {
    id: "combinatorics",
    slug: "kombinatorika",
    number: "08",
    category: "Kaidah Pencacahan",
    title: "Kombinatorika",
    grade: "Kelas XII",
    phase: "Fase F Tingkat Lanjut (Kelas XII)",
    prerequisite: "Operasi Himpunan & Logika Matematika",
    formula:
      "{}_nP_r=\\frac{n!}{(n-r)!} \\qquad \\binom{n}{r}=\\frac{n!}{r!(n-r)!}",
    description:
      "Mempelajari kaidah dasar pencacahan (aturan penjumlahan dan perkalian), permutasi dengan elemen berbeda maupun berulang, kombinasi, dan teorema binomial.",
    htmlContent: kombinatorikaHtml,
  },
  {
    id: "probability",
    slug: "peluang",
    number: "09",
    category: "Teori Peluang & Statistika",
    title: "Teori Peluang",
    grade: "Kelas XII",
    phase: "Fase F Tingkat Lanjut (Kelas XII)",
    prerequisite: "Kombinatorika (Kaidah Pencacahan)",
    formula: "P(A\\cup B)=P(A)+P(B)-P(A\\cap B) \\qquad P(A|B)=\\frac{P(A\\cap B)}{P(B)}",
    description:
      "Pelajari ruang sampel, aksioma peluang Kolmogorov, kejadian saling lepas dan saling bebas, peluang bersyarat, hingga penerapan Teorema Bayes.",
    htmlContent: peluangHtml,
  },
];

export function getMaterialBySlug(slug: string): Material | undefined {
  return materials.find((m) => m.slug === slug);
}
