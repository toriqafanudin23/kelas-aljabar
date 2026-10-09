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
  if (page === "simulation") return "/simulasi";
  if (page === "simulation-play") return "/simulasi-interaktif";
  if (page === "about") return "/tentang";
  if (page === "shop") return "/beli";
  if (page === "shop-preview") return "/pratinjau-produk";
  if (page === "not-found") return "/404";
  return `/materi/${page}`;
}
