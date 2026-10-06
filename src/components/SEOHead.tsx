import { useEffect } from "react";
import type { Page } from "../types/navigation";
import { getPathFromPage } from "../types/navigation";
import { getMaterialBySlug } from "../materi";

interface SEOHeadProps {
  page: Page;
}

const BASE_URL = "https://kelas1729.vercel.app";
const DEFAULT_IMAGE = `${BASE_URL}/logo_math1729.png`;

interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  ogType: string;
  schema?: Record<string, unknown>;
}

export function SEOHead({ page }: SEOHeadProps) {
  useEffect(() => {
    const material = getMaterialBySlug(page);
    const path = getPathFromPage(page);
    const currentUrl = `${BASE_URL}${path}`;

    let meta: PageMeta;

    if (material) {
      meta = {
        title: `${material.title} (${material.grade}) - Rangkuman, Rumus & Latihan | Math 1729`,
        description: `Pelajari materi ${material.title} untuk ${material.grade} (${material.phase}). ${material.description} Lengkap dengan rumus LaTeX, sifat matematis, dan latihan soal.`,
        keywords: `${material.title.toLowerCase()}, materi ${material.title.toLowerCase()} ${material.grade.toLowerCase()}, rumus ${material.title.toLowerCase()}, latihan soal ${material.title.toLowerCase()}, matematika sma, ${material.category.toLowerCase()}, kurikulum merdeka matematika`,
        ogType: "article",
        schema: {
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: `${material.title} - ${material.grade}`,
          description: material.description,
          learningResourceType: "Lesson",
          educationalLevel: material.grade,
          competencyRequired: material.prerequisite || "Matematika Dasar",
          inLanguage: "id",
          url: currentUrl,
          provider: {
            "@type": "EducationalOrganization",
            name: "Math 1729",
            url: BASE_URL,
          },
          author: {
            "@type": "Person",
            name: "Toriq Afanudin",
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Beranda",
                item: BASE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Katalog Materi",
                item: `${BASE_URL}/katalog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: material.title,
                item: currentUrl,
              },
            ],
          },
        },
      };
    } else {
      switch (page) {
        case "catalog":
          meta = {
            title: "Katalog 22 Modul Matematika SMA (Kelas X, XI, XII) | Math 1729",
            description: "Daftar lengkap 22 modul pembelajaran matematika SMA Kurikulum Merdeka (Fase E, Fase F, Fase F Lanjut) dan materi olimpiade (OSN) terstruktur berdasarkan alur prasyarat keilmuan.",
            keywords: "katalog materi matematika sma, modul matematika kelas 10 11 12, silabus matematika kurikulum merdeka, materi osn matematika sma, daftar bab matematika sma, math 1729",
            ogType: "website",
            schema: {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Katalog Materi Matematika SMA - Math 1729",
              description: "Daftar 22 modul pembelajaran matematika SMA Kurikulum Merdeka dari dasar hingga olimpiade.",
              url: currentUrl,
            },
          };
          break;

        case "simulation":
          meta = {
            title: "Simulasi Matematika Interaktif (JSXGraph) | Math 1729",
            description: "Eksplorasi konsep matematika visual secara real-time dengan JSXGraph: Grafik Fungsi Kuadrat, Transformasi Geometri, Kalkulus Turunan & Integral Riemann, SPLDV, dan Plotter Fungsi.",
            keywords: "simulasi matematika interaktif, visualisasi grafik matematika, jsxgraph indonesia, simulasi fungsi kuadrat, kalkulus interaktif, visualisasi transformasi geometri, plotter grafik matematika",
            ogType: "website",
            schema: {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Simulasi Matematika Interaktif Math 1729",
              description: "Alat visualisasi interaktif untuk memahami konsep geometri, aljabar, dan kalkulus secara real-time berbasis JSXGraph.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "All",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              url: currentUrl,
            },
          };
          break;

        case "shop":
          meta = {
            title: "Beli Bahan Ajar, LKPD & Paket Soal Matematika LaTeX | Math 1729",
            description: "Pesan paket latihan soal, kunci pembahasan, slide presentasi Beamer, dan LKPD Discovery/PBL matematika SMA berbasis LaTeX. File siap cetak PDF dan source code .tex.",
            keywords: "beli soal matematika sma latex, lkpd matematika kurikulum merdeka, slide presentasi beamer latex matematika, paket soal kelas 10 11 12 pdf tex, bahan ajar matematika sma, download soal matematika latex",
            ogType: "website",
            schema: {
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Bahan Ajar & Produk Digital Math 1729",
              description: "Layanan pemesanan produk digital bahan ajar matematika SMA (LKPD, Slide, Paket Soal) berbasis LaTeX.",
              url: currentUrl,
              currenciesAccepted: "IDR",
              paymentAccepted: "Bank Transfer",
            },
          };
          break;

        case "about":
          meta = {
            title: "Tentang Math 1729 - Profil Toriq Afanudin & Filosofi Ramanujan",
            description: "Mengenal Toriq Afanudin (Pengajar Matematika Kalikajar Wonosobo), inisiator portal Math 1729, manifesto pendidikan matematika tanpa kompromi, dan kisah legendaris bilangan taksi Ramanujan 1729.",
            keywords: "tentang math 1729, toriq afanudin, profil pengajar matematika wonosobo, bilangan taksi ramanujan 1729, hardy ramanujan number, filosofi pendidikan matematika",
            ogType: "profile",
            schema: {
              "@context": "https://schema.org",
              "@type": "AboutPage",
              name: "Tentang Math 1729",
              description: "Latar belakang, profil pengajar, dan filosofi nama Math 1729.",
              url: currentUrl,
              mainEntity: {
                "@type": "Person",
                name: "Toriq Afanudin",
                jobTitle: "Pengajar Matematika",
                homeLocation: "Wonosobo, Jawa Tengah",
              },
            },
          };
          break;

        case "home":
        default:
          meta = {
            title: "Math 1729 | Modul Matematika SMA Lengkap, OSN, UTBK & Simulasi Interaktif",
            description: "Portal referensi & pembelajaran matematika SMA (Kelas X, XI, XII) Kurikulum Merdeka terstruktur: Eksponen, Vektor, Trigonometri, Matriks, Kalkulus, Simulasi Interaktif JSXGraph, Bank Soal, persiapan OSN & UTBK-SNBT.",
            keywords: "matematika sma, kurikulum merdeka matematika, materi matematika kelas 10 11 12, fase e, fase f, fase f lanjut, latihan soal matematika sma, utbk penalaran matematika, osn matematika sma, rumus matematika lengkap, simulasi matematika interaktif, jsxgraph, math 1729, toriq afanudin",
            ogType: "website",
          };
          break;
      }
    }

    // 1. Update Title
    document.title = meta.title;

    // Helper untuk set/update meta tag
    const setMeta = (nameAttr: "name" | "property", attrValue: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${nameAttr}="${attrValue}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(nameAttr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // 2. Standard Meta
    setMeta("name", "description", meta.description);
    setMeta("name", "keywords", meta.keywords);

    // 3. Canonical Link
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);

    // 4. OpenGraph
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", currentUrl);
    setMeta("property", "og:type", meta.ogType);
    setMeta("property", "og:image", DEFAULT_IMAGE);

    // 5. Twitter Card
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", DEFAULT_IMAGE);

    // 6. Dynamic JSON-LD Schema
    const existingScript = document.getElementById("dynamic-seo-jsonld");
    if (existingScript) {
      existingScript.remove();
    }
    if (meta.schema) {
      const script = document.createElement("script");
      script.id = "dynamic-seo-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(meta.schema);
      document.head.appendChild(script);
    }
  }, [page]);

  return null;
}

