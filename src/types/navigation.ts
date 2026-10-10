import type { MouseEvent } from "react";

export type Page =
  | "home"
  | "catalog"
  | "download"
  | "bank-download"
  | "about"
  | "simulation"
  | "simulation-play"
  | "shop"
  | "not-found"
  | "practice"
  | "practice-tka-paket1"
  | "practice-eksponensial"
  | "practice-barisan-deret"
  | "practice-vektor"
  | "practice-sppl"
  | "practice-fungsi-kuadrat"
  | "practice-perbandingan-trigonometri"
  | "practice-peluang"
  | "practice-statistika"
  | "practice-transformasi-geometri"
  | "practice-polinomial"
  | "practice-matriks"
  | "practice-lingkaran"
  | "practice-komposisi-fungsi-dan-invers"
  | "practice-turunan"
  | "practice-fungsi-pemodelan"
  | "practice-transformasi-fungsi"
  | "practice-kombinatorika"
  | "practice-irisan-kerucut"
  | "practice-integral"
  | "practice-analisis-data-peluang"
  | "practice-limit"
  | "practice-bilangan-kompleks"
  | string;
export type Navigate = (
  event: MouseEvent<HTMLAnchorElement>,
  page: Page,
) => void;

export interface LessonNavItem {
  id: string;
  title: string;
}

export function getPageFromPath(path: string): Page {
  if (path === "/" || path === "") return "home";
  if (path === "/404" || path === "/404/") return "not-found";
  if (path === "/tentang" || path === "/tentang/") return "about";
  if (path === "/katalog" || path === "/katalog/") return "catalog";
  if (path === "/unduh" || path === "/unduh/") return "download";
  if (path === "/unduh-bank-soal" || path === "/unduh-bank-soal/") {
    return "bank-download";
  }
  if (path === "/latihan-soal" || path === "/latihan-soal/") {
    return "practice";
  }
  if (
    path === "/latihan-soal/tka-paket-1" ||
    path === "/latihan-soal/tka-paket-1/"
  ) {
    return "practice-tka-paket1";
  }
  if (
    path === "/latihan-soal/eksponensial" ||
    path === "/latihan-soal/eksponensial/"
  ) {
    return "practice-eksponensial";
  }
  if (
    path === "/latihan-soal/barisan-deret" ||
    path === "/latihan-soal/barisan-deret/"
  ) {
    return "practice-barisan-deret";
  }
  if (path === "/latihan-soal/vektor" || path === "/latihan-soal/vektor/") {
    return "practice-vektor";
  }
  if (path === "/latihan-soal/sppl" || path === "/latihan-soal/sppl/") {
    return "practice-sppl";
  }
  if (
    path === "/latihan-soal/fungsi-kuadrat" ||
    path === "/latihan-soal/fungsi-kuadrat/"
  ) {
    return "practice-fungsi-kuadrat";
  }
  if (
    path === "/latihan-soal/perbandingan-trigonometri" ||
    path === "/latihan-soal/perbandingan-trigonometri/"
  ) {
    return "practice-perbandingan-trigonometri";
  }
  if (path === "/latihan-soal/peluang" || path === "/latihan-soal/peluang/") {
    return "practice-peluang";
  }
  if (
    path === "/latihan-soal/statistika" ||
    path === "/latihan-soal/statistika/"
  ) {
    return "practice-statistika";
  }
  if (
    path === "/latihan-soal/transformasi-geometri" ||
    path === "/latihan-soal/transformasi-geometri/"
  ) {
    return "practice-transformasi-geometri";
  }
  if (
    path === "/latihan-soal/polinomial" ||
    path === "/latihan-soal/polinomial/"
  ) {
    return "practice-polinomial";
  }
  if (path === "/latihan-soal/matriks" || path === "/latihan-soal/matriks/") {
    return "practice-matriks";
  }
  if (
    path === "/latihan-soal/lingkaran" ||
    path === "/latihan-soal/lingkaran/"
  ) {
    return "practice-lingkaran";
  }
  if (
    path === "/latihan-soal/komposisi-fungsi-dan-invers" ||
    path === "/latihan-soal/komposisi-fungsi-dan-invers/"
  ) {
    return "practice-komposisi-fungsi-dan-invers";
  }
  if (path === "/latihan-soal/turunan" || path === "/latihan-soal/turunan/") {
    return "practice-turunan";
  }
  if (
    path === "/latihan-soal/fungsi-pemodelan" ||
    path === "/latihan-soal/fungsi-pemodelan/"
  ) {
    return "practice-fungsi-pemodelan";
  }
  if (
    path === "/latihan-soal/transformasi-fungsi" ||
    path === "/latihan-soal/transformasi-fungsi/"
  ) {
    return "practice-transformasi-fungsi";
  }
  if (
    path === "/latihan-soal/kombinatorika" ||
    path === "/latihan-soal/kombinatorika/"
  ) {
    return "practice-kombinatorika";
  }
  if (
    path === "/latihan-soal/irisan-kerucut" ||
    path === "/latihan-soal/irisan-kerucut/"
  ) {
    return "practice-irisan-kerucut";
  }
  if (path === "/latihan-soal/integral" || path === "/latihan-soal/integral/") {
    return "practice-integral";
  }
  if (
    path === "/latihan-soal/analisis-data-peluang" ||
    path === "/latihan-soal/analisis-data-peluang/" ||
    path === "/latihan-soal/analisis-data-dan-peluang" ||
    path === "/latihan-soal/analisis-data-dan-peluang/"
  ) {
    return "practice-analisis-data-peluang";
  }
  if (path === "/latihan-soal/limit" || path === "/latihan-soal/limit/") {
    return "practice-limit";
  }
  if (
    path === "/latihan-soal/bilangan-kompleks" ||
    path === "/latihan-soal/bilangan-kompleks/"
  ) {
    return "practice-bilangan-kompleks";
  }
  if (path === "/simulasi" || path === "/simulasi/") return "simulation";
  if (
    path === "/simulasi-interaktif" ||
    path === "/simulasi-interaktif/" ||
    path.startsWith("/simulasi-interaktif")
  ) {
    return "simulation-play";
  }
  if (path === "/beli" || path === "/beli/") return "shop";
  if (path === "/pratinjau-produk" || path === "/pratinjau-produk/") {
    return "shop-preview";
  }
  if (path.startsWith("/materi/")) {
    const slug = path.replace("/materi/", "").replace(/\/$/, "");
    if (slug) return slug;
  }
  return "not-found";
}

export function getPathFromPage(page: Page): string {
  if (page === "home") return "/";
  if (page === "catalog") return "/katalog";
  if (page === "download") return "/unduh";
  if (page === "bank-download") return "/unduh-bank-soal";
  if (page === "practice") return "/latihan-soal";
  if (page === "practice-tka-paket1") return "/latihan-soal/tka-paket-1";
  if (page === "practice-eksponensial") return "/latihan-soal/eksponensial";
  if (page === "practice-barisan-deret") return "/latihan-soal/barisan-deret";
  if (page === "practice-vektor") return "/latihan-soal/vektor";
  if (page === "practice-sppl") return "/latihan-soal/sppl";
  if (page === "practice-fungsi-kuadrat") {
    return "/latihan-soal/fungsi-kuadrat";
  }
  if (page === "practice-perbandingan-trigonometri") {
    return "/latihan-soal/perbandingan-trigonometri";
  }
  if (page === "practice-peluang") return "/latihan-soal/peluang";
  if (page === "practice-statistika") return "/latihan-soal/statistika";
  if (page === "practice-transformasi-geometri") {
    return "/latihan-soal/transformasi-geometri";
  }
  if (page === "practice-polinomial") return "/latihan-soal/polinomial";
  if (page === "practice-matriks") return "/latihan-soal/matriks";
  if (page === "practice-lingkaran") return "/latihan-soal/lingkaran";
  if (page === "practice-komposisi-fungsi-dan-invers") {
    return "/latihan-soal/komposisi-fungsi-dan-invers";
  }
  if (page === "practice-turunan") return "/latihan-soal/turunan";
  if (page === "practice-fungsi-pemodelan") {
    return "/latihan-soal/fungsi-pemodelan";
  }
  if (page === "practice-transformasi-fungsi") {
    return "/latihan-soal/transformasi-fungsi";
  }
  if (page === "practice-kombinatorika") {
    return "/latihan-soal/kombinatorika";
  }
  if (page === "practice-irisan-kerucut") {
    return "/latihan-soal/irisan-kerucut";
  }
  if (page === "practice-integral") return "/latihan-soal/integral";
  if (page === "practice-analisis-data-peluang") {
    return "/latihan-soal/analisis-data-peluang";
  }
  if (page === "practice-limit") return "/latihan-soal/limit";
  if (page === "practice-bilangan-kompleks") {
    return "/latihan-soal/bilangan-kompleks";
  }
  if (page === "simulation") return "/simulasi";
  if (page === "simulation-play") return "/simulasi-interaktif";
  if (page === "about") return "/tentang";
  if (page === "shop") return "/beli";
  if (page === "shop-preview") return "/pratinjau-produk";
  if (page === "not-found") return "/404";
  return `/materi/${page}`;
}
