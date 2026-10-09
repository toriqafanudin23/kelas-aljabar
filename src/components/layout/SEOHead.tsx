import { useEffect } from "react";
import type { Page } from "../../types/navigation";
import { getPathFromPage } from "../../types/navigation";
import { getMaterialBySlug } from "../../materi";

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
            title:
              "Katalog 22 Modul Matematika SMA (Kelas X, XI, XII) | Math 1729",
            description:
              "Daftar lengkap 22 modul pembelajaran matematika SMA Kurikulum Merdeka (Fase E, Fase F, Fase F Lanjut) dan materi olimpiade (OSN) terstruktur berdasarkan alur prasyarat keilmuan.",
            keywords:
              "katalog materi matematika sma, modul matematika kelas 10 11 12, silabus matematika kurikulum merdeka, materi osn matematika sma, daftar bab matematika sma, math 1729",
            ogType: "website",
            schema: {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Katalog Materi Matematika SMA - Math 1729",
              description:
                "Daftar 22 modul pembelajaran matematika SMA Kurikulum Merdeka dari dasar hingga olimpiade.",
              url: currentUrl,
            },
          };
          break;

        case "simulation":
          meta = {
            title: "Simulasi Matematika Interaktif (JSXGraph) | Math 1729",
            description:
              "Eksplorasi konsep matematika visual secara real-time dengan JSXGraph: Grafik Fungsi Kuadrat, Transformasi Geometri, Kalkulus Turunan & Integral Riemann, SPLDV, dan Plotter Fungsi.",
            keywords:
              "simulasi matematika interaktif, visualisasi grafik matematika, jsxgraph indonesia, simulasi fungsi kuadrat, kalkulus interaktif, visualisasi transformasi geometri, plotter grafik matematika",
            ogType: "website",
            schema: {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Simulasi Matematika Interaktif Math 1729",
              description:
                "Alat visualisasi interaktif untuk memahami konsep geometri, aljabar, dan kalkulus secara real-time berbasis JSXGraph.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "All",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              url: currentUrl,
            },
          };
          break;

        case "practice":
          meta = {
            title: "Latihan Soal Matematika SMA | Math 1729",
            description:
              "Kumpulan latihan soal matematika SMA interaktif untuk menguji pemahaman materi. Mulai dengan latihan eksponen dan logaritma kelas X.",
            keywords:
              "latihan soal matematika sma, latihan soal eksponen, latihan soal logaritma, soal matematika kelas 10, latihan matematika interaktif",
            ogType: "website",
            schema: {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Latihan Soal Matematika SMA - Math 1729",
              description:
                "Kumpulan latihan soal matematika SMA interaktif berdasarkan materi.",
              url: currentUrl,
            },
          };
          break;

        case "practice-eksponensial":
          meta = {
            title: "Latihan Soal Eksponen dan Logaritma Kelas X | Math 1729",
            description:
              "Kerjakan 20 pilihan ganda, 5 isian singkat, dan 5 uraian eksponen dan logaritma. Dilengkapi skor langsung dan pembahasan.",
            keywords:
              "latihan soal eksponen dan logaritma, soal eksponen kelas 10, latihan matematika kelas X, pembahasan eksponen logaritma",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Eksponen dan Logaritma",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas X",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-barisan-deret":
          meta = {
            title: "Latihan Soal Barisan dan Deret Kelas X | Math 1729",
            description:
              "Kerjakan latihan interaktif barisan dan deret aritmetika serta geometri. Dilengkapi pilihan ganda, isian singkat, soal uraian, dan pembahasan.",
            keywords:
              "latihan soal barisan dan deret, soal barisan aritmetika kelas 10, soal deret geometri, latihan matematika kelas X, pembahasan barisan deret",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Barisan dan Deret",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas X",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-vektor":
          meta = {
            title: "Latihan Soal Vektor Kelas X | Math 1729",
            description:
              "Kerjakan latihan interaktif vektor dengan pilihan ganda, isian singkat, soal uraian, skor langsung, dan pembahasan.",
            keywords:
              "latihan soal vektor kelas 10, soal vektor matematika kelas X, operasi vektor, pembahasan soal vektor, latihan matematika interaktif",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Vektor",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas X",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-sppl":
          meta = {
            title:
              "Latihan Soal Sistem Persamaan dan Pertidaksamaan Linear Kelas X | Math 1729",
            description:
              "Kerjakan latihan interaktif persamaan linear, pertidaksamaan, dan program linear. Dilengkapi pilihan ganda, isian singkat, skor langsung, dan pembahasan.",
            keywords:
              "latihan soal sistem persamaan linear, soal pertidaksamaan linear kelas 10, soal program linear, latihan matematika kelas X, pembahasan SPPL",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Sistem Persamaan dan Pertidaksamaan Linear",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas X",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-fungsi-kuadrat":
          meta = {
            title: "Latihan Soal Fungsi Kuadrat Kelas X | Math 1729",
            description:
              "Kerjakan latihan interaktif fungsi kuadrat tentang grafik parabola, diskriminan, akar, dan titik puncak. Dilengkapi skor langsung dan pembahasan.",
            keywords:
              "latihan soal fungsi kuadrat, soal fungsi kuadrat kelas 10, diskriminan, grafik parabola, pembahasan fungsi kuadrat",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Fungsi Kuadrat",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas X",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-perbandingan-trigonometri":
          meta = {
            title: "Latihan Soal Perbandingan Trigonometri Kelas X | Math 1729",
            description:
              "Kerjakan latihan interaktif perbandingan trigonometri tentang sinus, cosinus, tangen, sudut istimewa, serta elevasi dan depresi. Dilengkapi pembahasan.",
            keywords:
              "latihan soal perbandingan trigonometri, sinus cosinus tangen kelas 10, sudut istimewa, sudut elevasi depresi, pembahasan trigonometri",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Perbandingan Trigonometri",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas X",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-peluang":
          meta = {
            title: "Latihan Soal Peluang Kelas X | Math 1729",
            description:
              "Kerjakan latihan interaktif peluang kejadian, peluang bersyarat, kombinasi, dan frekuensi harapan. Dilengkapi pilihan ganda, isian singkat, uraian, dan pembahasan.",
            keywords:
              "latihan soal peluang kelas 10, peluang kejadian, peluang bersyarat, kombinasi, frekuensi harapan, pembahasan soal peluang",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Peluang",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas X",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-statistika":
          meta = {
            title: "Latihan Soal Statistika Kelas X | Math 1729",
            description:
              "Kerjakan latihan interaktif statistika tentang mean, median, modus, dan data berkelompok. Dilengkapi pilihan ganda, isian singkat, soal uraian, skor langsung, dan pembahasan.",
            keywords:
              "latihan soal statistika kelas 10, mean median modus, data berkelompok, ukuran pemusatan data, pembahasan statistika",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Statistika",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas X",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-transformasi-geometri":
          meta = {
            title: "Latihan Soal Transformasi Geometri Kelas XI | Math 1729",
            description:
              "Kerjakan latihan interaktif transformasi geometri tentang translasi, refleksi, rotasi, dilatasi, komposisi transformasi, dan matriks. Dilengkapi skor langsung dan pembahasan.",
            keywords:
              "latihan soal transformasi geometri, translasi refleksi rotasi dilatasi, komposisi transformasi, matriks transformasi, pembahasan matematika kelas 11",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Transformasi Geometri",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas XI",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-polinomial":
          meta = {
            title: "Latihan Soal Polinomial Kelas XI | Math 1729",
            description:
              "Kerjakan latihan interaktif polinomial tentang nilai dan kesamaan polinomial, pembagian, teorema sisa dan faktor, serta akar-akar. Dilengkapi skor langsung dan pembahasan.",
            keywords:
              "latihan soal polinomial kelas 11, suku banyak, teorema sisa, teorema faktor, akar polinomial, pembahasan polinomial",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Polinomial",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas XI",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-matriks":
          meta = {
            title: "Latihan Soal Matriks Kelas XI | Math 1729",
            description:
              "Kerjakan latihan interaktif matriks tentang operasi, determinan, invers, sistem persamaan linear, dan transformasi geometri. Dilengkapi skor langsung dan pembahasan.",
            keywords:
              "latihan soal matriks kelas 11, operasi matriks, determinan invers matriks, sistem persamaan linear matriks, pembahasan matriks",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Matriks",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas XI",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "practice-lingkaran":
          meta = {
            title: "Latihan Soal Lingkaran Kelas XI | Math 1729",
            description:
              "Kerjakan latihan interaktif lingkaran tentang keliling, luas, busur, juring, sudut pusat dan keliling, garis singgung, serta persamaan lingkaran. Dilengkapi skor dan pembahasan.",
            keywords:
              "latihan soal lingkaran kelas 11, keliling luas lingkaran, busur juring, sudut pusat sudut keliling, garis singgung, persamaan lingkaran",
            ogType: "article",
            schema: {
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "Latihan Soal Lingkaran",
              learningResourceType: "Quiz",
              educationalLevel: "Kelas XI",
              inLanguage: "id",
              url: currentUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Math 1729",
                url: BASE_URL,
              },
            },
          };
          break;

        case "shop":
          meta = {
            title:
              "Beli Bahan Ajar, LKPD & Paket Soal Matematika LaTeX | Math 1729",
            description:
              "Beli bahan ajar matematika SMA berbasis LaTeX: paket latihan soal, slide presentasi, dan LKPD. Tinjau preview sebelum membeli; file tersedia dalam PDF dan .tex.",
            keywords:
              "beli soal matematika sma latex, lkpd matematika kurikulum merdeka, slide presentasi beamer latex matematika, paket soal kelas 10 11 12 pdf tex, bahan ajar matematika sma, download soal matematika latex",
            ogType: "website",
            schema: {
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Bahan Ajar & Produk Digital Math 1729",
              description:
                "Layanan pemesanan produk digital bahan ajar matematika SMA (LKPD, Slide, Paket Soal) berbasis LaTeX.",
              url: currentUrl,
              currenciesAccepted: "IDR",
              paymentAccepted: "Bank Transfer",
            },
          };
          break;

        case "shop-preview":
          meta = {
            title: "Preview Produk PDF Matematika | Math 1729",
            description:
              "Lihat dan navigasikan preview paket soal, slide presentasi, serta latihan TKA menggunakan PDF.js.",
            keywords:
              "preview paket soal matematika, preview slide matematika, PDF.js Math 1729",
            ogType: "website",
          };
          break;

        case "not-found":
          meta = {
            title: "Halaman Tidak Ditemukan | Math 1729",
            description:
              "Halaman yang Anda cari tidak tersedia. Kembali ke beranda Math 1729.",
            keywords: "404, halaman tidak ditemukan, Math 1729",
            ogType: "website",
          };
          break;

        case "about":
          meta = {
            title:
              "Tentang Math 1729 - Profil Toriq Afanudin & Filosofi Ramanujan",
            description:
              "Mengenal Toriq Afanudin (Pengajar Matematika Kalikajar Wonosobo), inisiator portal Math 1729, manifesto pendidikan matematika tanpa kompromi, dan kisah legendaris bilangan taksi Ramanujan 1729.",
            keywords:
              "tentang math 1729, toriq afanudin, profil pengajar matematika wonosobo, bilangan taksi ramanujan 1729, hardy ramanujan number, filosofi pendidikan matematika",
            ogType: "profile",
            schema: {
              "@context": "https://schema.org",
              "@type": "AboutPage",
              name: "Tentang Math 1729",
              description:
                "Latar belakang, profil pengajar, dan filosofi nama Math 1729.",
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
            title:
              "Math 1729 | Modul Matematika SMA Lengkap, OSN, UTBK & Simulasi Interaktif",
            description:
              "Portal belajar matematika SMA kelas X–XII: materi Kurikulum Merdeka, bahan ajar, bank soal, simulasi interaktif, serta persiapan OSN dan UTBK-SNBT.",
            keywords:
              "matematika sma, bahan ajar matematika sma, bahan ajar matematika kelas 10 11 12, kurikulum merdeka matematika, materi matematika kelas 10 11 12, fase e, fase f, fase f lanjut, latihan soal matematika sma, utbk penalaran matematika, osn matematika sma, rumus matematika lengkap, simulasi matematika interaktif, jsxgraph, math 1729, toriq afanudin",
            ogType: "website",
          };
          break;
      }
    }

    // 1. Update Title
    document.title = meta.title;

    // Helper untuk set/update meta tag
    const setMeta = (
      nameAttr: "name" | "property",
      attrValue: string,
      content: string,
    ) => {
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${nameAttr}="${attrValue}"]`,
      );
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
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
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
