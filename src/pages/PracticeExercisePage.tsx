import { useEffect, useRef } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render.mjs";
import type { Navigate } from "../types/navigation";
import "../latihan-soal/latihan-soal.css";
import "./PracticePage.css";

type PracticeExerciseId = "eksponensial" | "barisan-deret" | "vektor" | "sppl";

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
