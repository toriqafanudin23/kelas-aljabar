import eksponensialHtml from "./eksponensial.html?raw";
import transformasiGeometriHtml from "./transformasi-geometri.html?raw";
import barisanDeretHtml from "./barisan-deret.html?raw";
import matriksHtml from "./matriks.html?raw";
import kombinatorikaHtml from "./kombinatorika.html?raw";
import peluangHtml from "./peluang.html?raw";

export interface Material {
  id: string;
  slug: string;
  number: string;
  category: string;
  title: string;
  grade: string;
  formula: string;
  description: string;
  htmlContent: string;
}

export const materials: Material[] = [
  {
    id: "exponents",
    slug: "eksponensial",
    number: "01",
    category: "Aljabar Matematika",
    title: "Eksponensial dan Logaritma",
    grade: "Kelas X",
    formula: "a^m a^n = a^{m+n} \\qquad \\log_a b = c \\iff a^c=b",
    description:
      "Pahami sifat pangkat, bentuk akar, fungsi eksponensial, dan logaritma melalui definisi serta contoh yang runtut.",
    htmlContent: eksponensialHtml,
  },
  {
    id: "geometry",
    slug: "transformasi-geometri",
    number: "02",
    category: "Geometri Analitik",
    title: "Transformasi Geometri",
    grade: "Kelas XI",
    formula:
      "\\begin{bmatrix}x'\\\\y'\\end{bmatrix} = \\begin{bmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{bmatrix} \\begin{bmatrix}x\\\\y\\end{bmatrix}",
    description:
      "Jelajahi translasi, refleksi, rotasi, dan dilatasi melalui pemetaan titik pada bidang koordinat.",
    htmlContent: transformasiGeometriHtml,
  },
  {
    id: "sequences-series",
    slug: "barisan-deret",
    number: "03",
    category: "Aljabar Matematika",
    title: "Barisan dan Deret",
    grade: "Kelas XI",
    formula: "U_n=a+(n-1)b \\qquad U_n=ar^{n-1}",
    description:
      "Pelajari barisan dan deret aritmetika serta geometri, rumus suku ke-n, jumlah suku, sisipan, dan deret tak hingga.",
    htmlContent: barisanDeretHtml,
  },
  {
    id: "matrices",
    slug: "matriks",
    number: "04",
    category: "Aljabar Matematika",
    title: "Matriks",
    grade: "Kelas XI",
    formula:
      "\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=ad-bc \\qquad AB\\ne BA",
    description:
      "Pelajari konsep dan jenis matriks, operasi, determinan, invers, sistem persamaan linear, aturan Cramer, dan transformasi geometri.",
    htmlContent: matriksHtml,
  },
  {
    id: "combinatorics",
    slug: "kombinatorika",
    number: "05",
    category: "Kaidah Pencacahan",
    title: "Kombinatorika",
    grade: "Kelas XII",
    formula:
      "{}_nP_r=\\frac{n!}{(n-r)!} \\qquad \\binom{n}{r}=\\frac{n!}{r!(n-r)!}",
    description:
      "Mempelajari aturan penjumlahan, aturan perkalian, faktorial, permutasi, kombinasi, dan teknik penyelesaian soal pencacahan.",
    htmlContent: kombinatorikaHtml,
  },
  {
    id: "probability",
    slug: "peluang",
    number: "06",
    category: "Peluang",
    title: "Peluang",
    grade: "Kelas XII",
    formula:
      "P(A)=\\frac{n(A)}{n(S)} \\qquad P(A\\cup B)=P(A)+P(B)-P(A\\cap B)",
    description:
      "Mempelajari ruang sampel, kejadian, peluang dasar, peluang bersyarat, teorema Bayes, dan penerapan dalam soal nyata.",
    htmlContent: peluangHtml,
  },
];

export function getMaterialBySlug(slug: string): Material | undefined {
  return materials.find((m) => m.slug === slug);
}
