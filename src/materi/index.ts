import eksponensialHtml from "./eksponensial.html?raw";
import spplHtml from "./sppl.html?raw";
import fungsiKuadratHtml from "./fungsi-kuadrat.html?raw";
import barisanDeretHtml from "./barisan-deret.html?raw";
import matriksHtml from "./matriks.html?raw";
import vektorHtml from "./vektor.html?raw";
import transformasiGeometriHtml from "./transformasi-geometri.html?raw";
import kombinatorikaHtml from "./kombinatorika.html?raw";
import peluangHtml from "./peluang.html?raw";
import statistikaHtml from "./statistika.html?raw";
import komposisiFungsiDanInversHtml from "./komposisi-fungsi-dan-invers.html?raw";
import polinomialHtml from "./polinomial.html?raw";
import limitHtml from "./limit.html?raw";
import turunanHtml from "./turunan.html?raw";
import lingkaranHtml from "./lingkaran.html?raw";

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
 * 1. Eksponensial dan Logaritma (Kelas X)
 * 2. Barisan dan Deret (Kelas X)
 * 3. Sistem Persamaan dan Pertidaksamaan Linear (Kelas X)
 * 4. Fungsi Kuadrat (Kelas X)
 * 5. Statistika (Kelas X)
 * 6. Komposisi Fungsi dan Invers (Kelas XI)
 * 7. Polinomial (Kelas XI)
 * 8. Matriks (Kelas XI)
 * 9. Lingkaran (Kelas XI)
 * 10. Transformasi Geometri (Kelas XI)
 * 11. Vektor (Kelas XI)
 * 12. Limit Fungsi (Kelas XII)
 * 13. Turunan (Kelas XII)
 * 14. Kombinatorika (Kelas XII)
 * 15. Teori Peluang (Kelas XII)
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
    number: "03",
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
    number: "04",
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
    id: "statistics",
    slug: "statistika",
    number: "05",
    category: "Teori Peluang & Statistika",
    title: "Statistika",
    grade: "Kelas X",
    phase: "Fase E (Kelas X)",
    prerequisite: "Penyajian Data & Aritmetika Dasar",
    formula:
      "\\bar{x}=\\frac{\\sum x_i}{n} \\qquad s^2=\\frac{\\sum (x_i-\\bar{x})^2}{n-1}",
    description:
      "Pelajari pengumpulan data, penyajian data, ukuran pemusatan, ukuran penyebaran, dan interpretasi data dalam kehidupan sehari-hari.",
    htmlContent: statistikaHtml,
  },
  {
    id: "function-composition-inverse",
    slug: "komposisi-fungsi-dan-invers",
    number: "06",
    category: "Aljabar Matematika",
    title: "Komposisi Fungsi dan Invers",
    grade: "Kelas XI",
    phase: "Fase F (Kelas XI)",
    prerequisite: "Relasi, Fungsi, dan Operasi Aljabar",
    formula: "(f\\circ g)(x)=f(g(x)) \\qquad f^{-1}(f(x))=x",
    description:
      "Pelajari operasi komposisi fungsi, penentuan domain dan range, karakteristik fungsi satu-satu, serta cara menentukan dan menerapkan fungsi invers.",
    htmlContent: komposisiFungsiDanInversHtml,
  },
  {
    id: "sequences-series",
    slug: "barisan-deret",
    number: "02",
    category: "Aljabar Matematika",
    title: "Barisan dan Deret",
    grade: "Kelas X",
    phase: "Fase E (Kelas X)",
    prerequisite: "Pola Bilangan & Fungsi Linear/Eksponen",
    formula: "U_n=a+(n-1)b \\qquad U_n=ar^{n-1}",
    description:
      "Pahami barisan serta deret aritmetika dan geometri, suku ke-n, jumlah deret, sisipan, konvergensi deret geometri tak hingga, dan notasi sigma.",
    htmlContent: barisanDeretHtml,
  },
  {
    id: "matrices",
    slug: "matriks",
    number: "08",
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
    number: "11",
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
    number: "10",
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
    number: "14",
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
    number: "15",
    category: "Teori Peluang & Statistika",
    title: "Teori Peluang",
    grade: "Kelas XII",
    phase: "Fase F Tingkat Lanjut (Kelas XII)",
    prerequisite: "Kombinatorika (Kaidah Pencacahan)",
    formula: "P(A)=\\frac{n(A)}{n(S)}",
    description:
      "Pelajari ruang sampel, aksioma peluang Kolmogorov, kejadian saling lepas dan saling bebas, peluang bersyarat, hingga penerapan Teorema Bayes.",
    htmlContent: peluangHtml,
  },
  {
    id: "polynomials",
    slug: "polinomial",
    number: "07",
    category: "Aljabar Matematika",
    title: "Polinomial",
    grade: "Kelas XI",
    phase: "Fase F (Kelas XI)",
    prerequisite: "Operasi Aljabar & Fungsi",
    formula: "P(x)=a_nx^n+a_{n-1}x^{n-1}+\\cdots+a_1x+a_0 \\qquad a_n\\ne0",
    description:
      "Pelajari bentuk dan derajat polinomial, operasi aljabar, pembagian, teorema sisa dan faktor, serta penentuan akar-akar polinomial.",
    htmlContent: polinomialHtml,
  },
  {
    id: "limits",
    slug: "limit",
    number: "12",
    category: "Kalkulus",
    title: "Limit Fungsi",
    grade: "Kelas XII",
    phase: "Fase F Tingkat Lanjut (Kelas XII)",
    prerequisite: "Fungsi, Aljabar, & Trigonometri",
    formula: "\\lim_{x\\to a}f(x)=L",
    description:
      "Pelajari limit satu sisi, sifat dan teknik limit aljabar, limit tak hingga dan trigonometri, kekontinuan, serta pengantar aturan L'Hôpital.",
    htmlContent: limitHtml,
  },
  {
    id: "derivatives",
    slug: "turunan",
    number: "13",
    category: "Kalkulus",
    title: "Turunan Fungsi",
    grade: "Kelas XII",
    phase: "Fase F Tingkat Lanjut (Kelas XII)",
    prerequisite: "Limit Fungsi",
    formula: "f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}",
    description:
      "Pelajari definisi turunan melalui limit, aturan-aturan diferensiasi, turunan fungsi aljabar dan trigonometri, serta penerapannya pada garis singgung dan masalah optimasi.",
    htmlContent: turunanHtml,
  },
  {
    id: "circle-arcs-sectors",
    slug: "busur-dan-juring-lingkaran",
    number: "09",
    category: "Geometri Lingkaran",
    title: "Lingkaran",
    grade: "Kelas XI",
    phase: "Fase F (Kelas XI)",
    prerequisite: "Pengukuran dan Perbandingan Sudut",
    formula: "K=2\\pi r \\qquad L=\\pi r^2",
    description:
      "Pelajari keliling dan luas, unsur-unsur lingkaran, busur, juring, tali busur, garis singgung, serta penerapan dan latihan soal.",
    htmlContent: lingkaranHtml,
  },
];

export function getMaterialBySlug(slug: string): Material | undefined {
  return materials.find((m) => m.slug === slug);
}
