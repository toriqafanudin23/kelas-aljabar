import { useEffect, useRef } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render.mjs";
import type { Navigate } from "../types/navigation";
import "../latihan-soal/latihan-soal.css";
import "./PracticePage.css";

type PracticeExerciseId =
  | "eksponensial"
  | "barisan-deret"
  | "vektor"
  | "sppl"
  | "fungsi-kuadrat"
  | "perbandingan-trigonometri"
  | "peluang"
  | "statistika"
  | "transformasi-geometri"
  | "polinomial"
  | "matriks"
  | "lingkaran"
  | "komposisi-fungsi-dan-invers"
  | "turunan"
  | "fungsi-pemodelan"
  | "transformasi-fungsi"
  | "kombinatorika"
  | "irisan-kerucut"
  | "integral"
  | "analisis-data-peluang";

interface PracticeExercisePageProps {
  navigate: Navigate;
  exercise: PracticeExerciseId;
}

const exerciseDetails: Record<
  PracticeExerciseId,
  { title: string; grade: string }
> = {
  eksponensial: { title: "Eksponensial", grade: "Kelas X · Fase E" },
  "barisan-deret": { title: "Barisan dan Deret", grade: "Kelas X · Fase E" },
  vektor: { title: "Vektor", grade: "Kelas X · Fase E" },
  sppl: {
    title: "Sistem Persamaan dan Pertidaksamaan Linear",
    grade: "Kelas X · Fase E",
  },
  "fungsi-kuadrat": {
    title: "Fungsi Kuadrat",
    grade: "Kelas X · Fase E",
  },
  "perbandingan-trigonometri": {
    title: "Perbandingan Trigonometri",
    grade: "Kelas X · Fase E",
  },
  peluang: { title: "Peluang", grade: "Kelas X · Fase E" },
  statistika: { title: "Statistika", grade: "Kelas X · Fase E" },
  "transformasi-geometri": {
    title: "Transformasi Geometri",
    grade: "Kelas XI · Fase F",
  },
  polinomial: { title: "Polinomial", grade: "Kelas XI · Fase F" },
  matriks: { title: "Matriks", grade: "Kelas XI · Fase F" },
  lingkaran: { title: "Lingkaran", grade: "Kelas XI · Fase F" },
  "komposisi-fungsi-dan-invers": {
    title: "Komposisi Fungsi dan Invers",
    grade: "Kelas X · Fase E",
  },
  turunan: { title: "Turunan Fungsi", grade: "Kelas XII · Fase F" },
  "fungsi-pemodelan": {
    title: "Fungsi dan Pemodelan",
    grade: "Kelas XII · Fase F Lanjut",
  },
  "transformasi-fungsi": {
    title: "Transformasi Fungsi",
    grade: "Kelas XII · Fase F Lanjut",
  },
  kombinatorika: {
    title: "Kombinatorika",
    grade: "Kelas XII · Fase F Lanjut",
  },
  "irisan-kerucut": {
    title: "Irisan Kerucut",
    grade: "Kelas XII · Fase F Lanjut",
  },
  integral: {
    title: "Integral",
    grade: "Kelas XII · Fase F Lanjut",
  },
  "analisis-data-peluang": {
    title: "Analisis Data dan Peluang",
    grade: "Kelas XII · Fase F Lanjut",
  },
};

export function PracticeExercisePage({
  navigate,
  exercise,
}: PracticeExercisePageProps) {
  const exerciseRef = useRef<HTMLDivElement>(null);
  const details = exerciseDetails[exercise];

  useEffect(() => {
    const root = exerciseRef.current;
    if (!root) return;

    let isActive = true;
    const loadHtml =
      exercise === "barisan-deret"
        ? import("../latihan-soal/latihan-barisan-deret.html?raw")
        : exercise === "vektor"
          ? import("../latihan-soal/vektor.html?raw")
          : exercise === "sppl"
            ? import("../latihan-soal/sppl.html?raw")
            : exercise === "fungsi-kuadrat"
              ? import("../latihan-soal/latihan_fungsi_kuadrat.html?raw")
              : exercise === "perbandingan-trigonometri"
                ? import("../latihan-soal/latihan_perbandingan_trigonometri.html?raw")
                : exercise === "peluang"
                  ? import("../latihan-soal/latihan_peluang.html?raw")
                  : exercise === "statistika"
                    ? import("../latihan-soal/latihan_statistika.html?raw")
                    : exercise === "transformasi-geometri"
                      ? import("../latihan-soal/latihan_transformasi_geometri.html?raw")
                      : exercise === "polinomial"
                        ? import("../latihan-soal/latihan_polinomial.html?raw")
                        : exercise === "matriks"
                          ? import("../latihan-soal/latihan_matriks.html?raw")
                          : exercise === "lingkaran"
                            ? import("../latihan-soal/latihan_lingkaran.html?raw")
                            : exercise === "komposisi-fungsi-dan-invers"
                              ? import("../latihan-soal/latihan_komposisi_fungsi_invers.html?raw")
                              : exercise === "turunan"
                                ? import("../latihan-soal/latihan_turunan.html?raw")
                                : exercise === "fungsi-pemodelan"
                                  ? import("../latihan-soal/latihan_fungsi_pemodelan.html?raw")
                                  : exercise === "transformasi-fungsi"
                                    ? import("../latihan-soal/latihan_transformasi_fungsi.html?raw")
                                    : exercise === "kombinatorika"
                                      ? import("../latihan-soal/latihan_kombinatorika.html?raw")
                                      : exercise === "irisan-kerucut"
                                        ? import("../latihan-soal/latihan_irisan_kerucut.html?raw")
                                        : exercise === "integral"
                                          ? import("../latihan-soal/latihan_integral.html?raw")
                                          : exercise === "analisis-data-peluang"
                                            ? import("../latihan-soal/latihan_analisis_data_peluang.html?raw")
                                            : import("../latihan-soal/eksponensial.html?raw");

    loadHtml
      .then(({ default: html }) => {
        if (!isActive || !root.isConnected) return;

        root.innerHTML = html;
        root.querySelectorAll("script").forEach((script) => {
          const executableScript = document.createElement("script");
          Array.from(script.attributes).forEach((attribute) => {
            executableScript.setAttribute(attribute.name, attribute.value);
          });
          executableScript.textContent = script.textContent;
          script.replaceWith(executableScript);
        });

        renderMathInElement(root, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
          ],
          throwOnError: false,
        });
      })
      .catch(() => {
        if (isActive) {
          root.textContent =
            "Latihan belum dapat dimuat. Silakan muat ulang halaman.";
        }
      });

    return () => {
      isActive = false;
      root.replaceChildren();
    };
  }, [exercise]);

  return (
    <main className="site-width inner-page practice-page practice-exercise-page">
      <div className="breadcrumb">
        <a href="/" onClick={(event) => navigate(event, "home")}>
          Beranda
        </a>
        <span>/</span>
        <a
          href="/latihan-soal"
          onClick={(event) => navigate(event, "practice")}
        >
          Latihan Soal
        </a>
        <span>/</span>
        <span>{details.title}</span>
      </div>

      <div className="practice-exercise-toolbar">
        <a
          href="/latihan-soal"
          onClick={(event) => navigate(event, "practice")}
        >
          <span aria-hidden="true">←</span> Semua latihan
        </a>
        <span>{details.grade}</span>
      </div>

      <div
        ref={exerciseRef}
        className="lesson-content practice-exercise-content"
      />
    </main>
  );
}
