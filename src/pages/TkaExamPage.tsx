import { useEffect, useRef } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render.mjs";
import type { Navigate } from "../types/navigation";
import "../latihan-soal/latihan-soal.css";
import "./PracticePage.css";
import "../ujian/simulasi-tka-paket1.css";

const TKA_EXAM_DETAILS = {
  sma: {
    id: "simulasi-tka-paket1",
    title: "Persiapan TKA SMA Paket 1",
    load: () => import("../ujian/simulasi-tka-paket1.html?raw"),
  },
  smp: {
    id: "simulasi-tka-smp-paket1",
    title: "Persiapan TKA SMP Paket 1",
    load: () => import("../ujian/simulasi-tka-smp-paket1.html?raw"),
  },
} as const;

interface TkaExamPageProps {
  navigate: Navigate;
  exam?: "sma" | "smp";
}

export function TkaExamPage({ navigate, exam = "sma" }: TkaExamPageProps) {
  const examRef = useRef<HTMLDivElement>(null);
  const examDetails = TKA_EXAM_DETAILS[exam];

  useEffect(() => {
    const root = examRef.current;
    if (!root) return;

    let isActive = true;
    examDetails
      .load()
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
            "Simulasi ujian belum dapat dimuat. Silakan muat ulang halaman.";
        }
      });

    return () => {
      isActive = false;
      const section = root.querySelector<HTMLElement>(`#${examDetails.id}`);
      section?.dispatchEvent(new Event("tka:dispose"));
      root.replaceChildren();
    };
  }, [examDetails]);

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
        <span>{examDetails.title}</span>
      </div>

      <div className="practice-exercise-toolbar">
        <a
          href="/latihan-soal"
          onClick={(event) => navigate(event, "practice")}
        >
          <span aria-hidden="true">←</span> Semua latihan
        </a>
        <span>Mode ujian · waktu dapat dipilih</span>
      </div>

      <div ref={examRef} className="lesson-content practice-exercise-content" />
    </main>
  );
}
