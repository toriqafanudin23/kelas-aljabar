import type { MouseEvent } from "react";

export type Page = "home" | "catalog" | "download" | "about" | string;
export type Navigate = (
  event: MouseEvent<HTMLAnchorElement>,
  page: Page,
) => void;

export interface LessonNavItem {
  id: string;
  title: string;
}

export function getPageFromPath(path: string): Page {
  if (path === "/tentang" || path === "/tentang/") return "about";
  if (path === "/katalog" || path === "/katalog/") return "catalog";
  if (path === "/unduh" || path === "/unduh/") return "download";
  if (path.startsWith("/materi/")) {
    const slug = path.replace("/materi/", "").replace(/\/$/, "");
    if (slug) return slug;
  }
  return "home";
}

export function getPathFromPage(page: Page): string {
  if (page === "home") return "/";
  if (page === "catalog") return "/katalog";
  if (page === "download") return "/unduh";
  if (page === "about") return "/tentang";
  return `/materi/${page}`;
}
