import { useEffect, useRef } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render.mjs";
import type { LessonNavItem } from "../types/navigation";

interface LessonHtmlProps {
  html: string;
  onSectionsChange: (sections: LessonNavItem[]) => void;
}

export function LessonHtml({ html, onSectionsChange }: LessonHtmlProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = html;

    renderMathInElement(containerRef.current, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });

    const sectionEls = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>("section[id]"),
    );
    const navSections: LessonNavItem[] = sectionEls.map((sec) => ({
      id: sec.id,
      title:
        sec.getAttribute("data-title") ||
        sec.querySelector("h2")?.textContent?.trim() ||
        "Bagian",
    }));

    onSectionsChange(navSections);
  }, [html, onSectionsChange]);

  return <div ref={containerRef} className="lesson-content" />;
}
