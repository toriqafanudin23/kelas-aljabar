import { useEffect, useId, useRef } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";

// Fungsi matematis: f(x) = 0.25x^3 - 1.2x (kurva kubik elegan dengan titik balik)
function funcF(x: number) {
  return 0.25 * Math.pow(x, 3) - 1.2 * x;
}

// Turunan pertama: f'(x) = 0.75x^2 - 1.2 (gradien garis singgung)
function funcDerivative(x: number) {
  return 0.75 * Math.pow(x, 2) - 1.2;
}

export function HeroDerivativeSimulation() {
  const boardId = `hero-deriv-${useId().replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const xPosRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inisialisasi Papan JSXGraph tema akademik dark-navy
    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: [-3.2, 2.6, 3.2, -2.6],
      axis: true,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: false,
      pan: { enabled: false, needShift: false, needTwoFingers: false },
      zoom: { wheel: false, needShift: false },
      defaultAxes: {
        x: {
          strokeColor: "#475569",
          strokeWidth: 1.2,
          ticks: {
            strokeColor: "#334155",
            label: { strokeColor: "#94a3b8", fontSize: 9 },
            drawLabels: false,
            majorHeight: 5,
            insertTicks: true,
            minTicksDistance: 38,
          },
        },
        y: {
          strokeColor: "#475569",
          strokeWidth: 1.2,
          ticks: {
            strokeColor: "#334155",
            label: { strokeColor: "#94a3b8", fontSize: 9 },
            drawLabels: false,
            majorHeight: 5,
            insertTicks: true,
            minTicksDistance: 38,
          },
        },
      },
    });

    board.create("grid", [], {
      strokeColor: "#1e293b",
      strokeOpacity: 0.45,
      strokeWidth: 1,
      highlight: false,
    });

    // 1. Kurva Fungsi f(x) (Cyan terang)
    board.create("functiongraph", [funcF, -3.2, 3.2], {
      strokeColor: "#38bdf8",
      strokeWidth: 2.8,
      highlight: false,
    });

    // 2. Garis proyeksi vertikal ke sumbu-X (putih transparan putus-putus)
    board.create(
      "segment",
      [
        [() => xPosRef.current, () => funcF(xPosRef.current)],
        [() => xPosRef.current, 0],
      ],
      {
        strokeColor: "rgba(255, 255, 255, 0.35)",
        strokeWidth: 1.2,
        dash: 2,
        highlight: false,
      },
    );

    // 3. Titik proyeksi pada sumbu-X
    board.create("point", [() => xPosRef.current, 0], {
      size: 2,
      fillColor: "#94a3b8",
      strokeColor: "#94a3b8",
      fixed: true,
      withLabel: false,
      highlight: false,
    });

    // 4. Garis Singgung f'(x) (Kuning Emas / Gold)
    board.create(
      "line",
      [
        [() => xPosRef.current, () => funcF(xPosRef.current)],
        [
          () => xPosRef.current + 1,
          () => funcF(xPosRef.current) + funcDerivative(xPosRef.current),
        ],
      ],
      {
        strokeColor: "#facc15",
        strokeWidth: 2.2,
        dash: 0,
        highlight: false,
      },
    );

    // 5. Titik Singgung P pada Kurva
    board.create(
      "point",
      [() => xPosRef.current, () => funcF(xPosRef.current)],
      {
        size: 4,
        fillColor: "#facc15",
        strokeColor: "#ffffff",
        strokeWidth: 2,
        fixed: true,
        withLabel: false,
        highlight: false,
      },
    );

    // Auto-loop animasi berjalan sendiri
    const startTimestamp = performance.now();
    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTimestamp;
      // Pergerakan bolak-balik x di antara -2.2 dan 2.2
      const xVal = 2.2 * Math.sin(elapsed * 0.001);
      xPosRef.current = xVal;

      board.update();

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    // Responsive Resize Observer
    const observer = new ResizeObserver(() => {
      const el = containerRef.current;
      if (el && el.clientWidth > 0 && el.clientHeight > 0) {
        board.resizeContainer(el.clientWidth, el.clientHeight, true);
      }
    });
    observer.observe(containerRef.current);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      observer.disconnect();
      JXG.JSXGraph.freeBoard(board);
    };
  }, [boardId]);

  return (
    <aside
      className="hero-sim-card"
      aria-label="Grafik animasi fungsi dan garis singgung"
    >
      <div className="hero-sim-canvas-wrap" ref={containerRef}>
        <div id={boardId} className="hero-sim-canvas" />
      </div>
    </aside>
  );
}
