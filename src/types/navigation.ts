import type { MouseEvent } from "react";

export type Page =
  | "home"
  | "catalog"
  | "download"
  | "bank-download"
  | "about"
  | "simulation"
  | "shop"
  | "not-found"
  | "practice"
  | "practice-eksponensial"
  | "practice-barisan-deret"
  | "practice-vektor"
  | "practice-sppl"
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
  if (path === "/simulasi" || path === "/simulasi/") return "simulation";
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
  if (page === "simulation") return "/simulasi";
  if (page === "about") return "/tentang";
  if (page === "shop") return "/beli";
  if (page === "shop-preview") return "/pratinjau-produk";
  if (page === "not-found") return "/404";
  return `/materi/${page}`;
}
