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
import bilanganKompleksHtml from "./bilangan-kompleks.html?raw";
import fungsiPemodelanHtml from "./fungsi.html?raw";
import transformasiFungsiHtml from "./transformasi-fungsi.html?raw";
import trigonometriHtml from "./trigonometri.html?raw";
import irisanKerucutHtml from "./irisan-kerucut.html?raw";
import integralHtml from "./integral.html?raw";
import teoriBilanganHtml from "./teori-bilangan.html?raw";

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
 * 6. Trigonometri (Kelas X)
 * 7. Komposisi Fungsi dan Invers (Kelas XI)
 * 8. Polinomial (Kelas XI)
 * 9. Matriks (Kelas XI)
 * 10. Lingkaran (Kelas XI)
 * 11. Transformasi Geometri (Kelas XI)
 * 12. Vektor (Kelas XI)
 * 13. Bilangan Kompleks (Kelas XI)
 * 14. Fungsi dan Pemodelan (Kelas XI)
 * 15. Limit Fungsi (Kelas XII)
 * 16. Turunan (Kelas XII)
 * 17. Kombinatorika (Kelas XII)
 * 18. Teori Peluang (Kelas XII)
 * 19. Transformasi Fungsi (Kelas XII)
 * 20. Irisan Kerucut (Kelas XII)
 * 21. Integral (Kelas XII)
 * 22. Teori Bilangan (Materi Khusus Olimpiade)
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
    number: "07",
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
    number: "09",
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
    number: "12",
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
    number: "11",
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
    number: "17",
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
    number: "18",
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
    number: "08",
    category: "Aljabar Matematika",
    title: "Polinomial",
    grade: "Kelas XI",
    phase: "Fase F (Kelas XI)",
    prerequisite: "Operasi Aljabar & Fungsi",
    formula: "P(x)=\\sum_{k=0}^{n}a_kx^k \\qquad a_n\\ne0",
    description:
      "Pelajari bentuk dan derajat polinomial, operasi aljabar, pembagian, teorema sisa dan faktor, serta penentuan akar-akar polinomial.",
    htmlContent: polinomialHtml,
  },
  {
    id: "limits",
    slug: "limit",
    number: "15",
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
    number: "16",
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
    number: "10",
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
  {
    id: "complex-numbers",
    slug: "bilangan-kompleks",
    number: "13",
    category: "Analisis",
    title: "Bilangan Kompleks",
    grade: "Kelas XI",
    phase: "Fase F (Kelas XI)",
    prerequisite: "Bilangan Real dan Operasi Aljabar",
    formula: "z=a+bi \\qquad i^2=-1",
    description:
      "Pelajari bentuk dan representasi bilangan kompleks, operasi hitung, invers, konjugat, modulus, serta argumen pada bidang kompleks.",
    htmlContent: bilanganKompleksHtml,
  },
  {
    id: "functions-modeling",
    slug: "fungsi",
    number: "14",
    category: "Aljabar Matematika",
    title: "Fungsi dan Pemodelan",
    grade: "Kelas XI",
    phase: "Fase F (Kelas XI)",
    prerequisite: "Relasi dan Fungsi Dasar",
    formula: "f:A\\to B \\qquad y=f(x)",
    description:
      "Pelajari konsep dan sifat fungsi, domain dan range, operasi serta komposisi dan invers, transformasi grafik, dan pemodelan menggunakan fungsi.",
    htmlContent: fungsiPemodelanHtml,
  },
  {
    id: "function-transformations",
    slug: "transformasi-fungsi",
    number: "19",
    category: "Aljabar Matematika",
    title: "Transformasi Fungsi",
    grade: "Kelas XII",
    phase: "Fase F Tingkat Lanjut (Kelas XII)",
    prerequisite: "Fungsi dan Pemodelan",
    formula: "y=f(x-h)+k \\qquad y=af(bx)",
    description:
      "Pelajari translasi, refleksi, dilatasi, rotasi, dan komposisi transformasi pada grafik fungsi serta pengaruhnya terhadap sifat grafik.",
    htmlContent: transformasiFungsiHtml,
  },
  {
    id: "trigonometry",
    slug: "trigonometri",
    number: "06",
    category: "Geometri & Trigonometri",
    title: "Trigonometri",
    grade: "Kelas X",
    phase: "Fase E (Kelas X)",
    prerequisite: "Sudut dan Segitiga Siku-Siku",
    formula:
      "\\sin\\theta=\\frac{\\text{sisi depan}}{\\text{hipotenusa}} \\qquad \\cos\\theta=\\frac{\\text{sisi samping}}{\\text{hipotenusa}}",
    description:
      "Pelajari perbandingan trigonometri, sudut istimewa, lingkaran satuan, identitas, persamaan trigonometri, aturan sinus dan cosinus, serta penerapannya.",
    htmlContent: trigonometriHtml,
  },
  {
    id: "conic-sections",
    slug: "irisan-kerucut",
    number: "20",
    category: "Geometri Analitik",
    title: "Irisan Kerucut",
    grade: "Kelas XII",
    phase: "Fase F Tingkat Lanjut (Kelas XII)",
    prerequisite: "Persamaan Kuadrat dan Geometri Koordinat",
    formula: "e=\\frac{c}{a}",
    description:
      "Pelajari lingkaran, garis singgung, elips, parabola, dan hiperbola melalui persamaan serta sifat geometri analitiknya.",
    htmlContent: irisanKerucutHtml,
  },
  {
    id: "integrals",
    slug: "integral",
    number: "21",
    category: "Kalkulus",
    title: "Integral",
    grade: "Kelas XII",
    phase: "Fase F Tingkat Lanjut (Kelas XII)",
    prerequisite: "Turunan dan Fungsi",
    formula: "\\int f(x)\\,dx=F(x)+C",
    description:
      "Pelajari integral tak tentu dan tentu, substitusi, integral parsial, luas daerah, volume benda putar, serta penerapan integral pada gerak.",
    htmlContent: integralHtml,
  },
  {
    id: "number-theory",
    slug: "teori-bilangan",
    number: "22",
    category: "Olimpiade Matematika",
    title: "Teori Bilangan",
    grade: "Khusus Olimpiade",
    phase: "Pengayaan Olimpiade Matematika",
    prerequisite: "Bilangan Bulat dan Operasi Aritmetika",
    formula: "a\\equiv b\\pmod m",
    description:
      "Materi olimpiade tentang keterbagian, FPB dan KPK, aritmetika modulo, teorema utama teori bilangan, serta persamaan Diophantine.",
    htmlContent: teoriBilanganHtml,
  },
];

export function getMaterialBySlug(slug: string): Material | undefined {
  return materials.find((m) => m.slug === slug);
}
