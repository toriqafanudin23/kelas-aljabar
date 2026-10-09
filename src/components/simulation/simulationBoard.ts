import { useEffect, useRef, useState } from "react";
import JXG from "jsxgraph";

export type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;
export type BoundingBox = [number, number, number, number];
export type GraphAppearance = { curveWidth: number; pointSize: number };
export type BoardRef = { current: Board | null };

const GRAPH_LINE_TYPES = new Set([
  "arc",
  "arrow",
  "circle",
  "curve",
  "functiongraph",
  "line",
  "polygon",
  "segment",
]);
const GRAPH_POINT_TYPES = new Set(["glider", "point"]);
const originalStrokeWidths = new WeakMap<JXG.GeometryElement, number>();
const originalPointSizes = new WeakMap<JXG.GeometryElement, number>();

export function applyGraphAppearance(
  board: Board | null,
  appearance: GraphAppearance,
) {
  if (!board) return;

  (Object.values(board.objects) as JXG.GeometryElement[]).forEach((element) => {
    if (GRAPH_LINE_TYPES.has(element.elType)) {
      let originalWidth = originalStrokeWidths.get(element);
      if (originalWidth === undefined) {
        originalWidth = Number(element.visProp.strokeWidth);
        if (!Number.isFinite(originalWidth)) return;
        originalStrokeWidths.set(element, originalWidth);
      }
      element.setAttribute({
        strokeWidth: originalWidth * (appearance.curveWidth / 3),
      });
    }

    if (GRAPH_POINT_TYPES.has(element.elType)) {
      let originalSize = originalPointSizes.get(element);
      if (originalSize === undefined) {
        originalSize = Number(element.visProp.size);
        if (!Number.isFinite(originalSize)) return;
        originalPointSizes.set(element, originalSize);
      }
      element.setAttribute({
        size: originalSize * (appearance.pointSize / 4),
      } as unknown as JXG.GeometryElementAttributes);
    }
  });

  board.update();
}

export function useGraphAppearance(boardRefs: BoardRef[]) {
  const [appearance, setAppearance] = useState<GraphAppearance>({
    curveWidth: 3,
    pointSize: 4,
  });

  useEffect(() => {
    boardRefs.forEach((boardRef) =>
      applyGraphAppearance(boardRef.current, appearance),
    );
  }, [appearance, boardRefs]);

  const onStep = (key: keyof GraphAppearance, delta: number) => {
    const range: readonly [number, number] =
      key === "curveWidth" ? [1, 8] : [2, 10];
    setAppearance((current) => ({
      ...current,
      [key]: clamp(current[key] + delta, range),
    }));
  };

  return { appearance, onStep };
}

export function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function clamp(value: number, [min, max]: readonly [number, number]) {
  return Math.min(max, Math.max(min, value));
}

export function fmt(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < Math.pow(10, -digits) / 2) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
  }).format(value);
}

/**
 * Papan JSXGraph standar untuk semua simulasi:
 * - geser dengan tahan klik kiri (atau satu jari), zoom dengan scroll/pinch
 * - grid dan sumbu ikut bergeser serta zoom bersama grafik
 */
export function createGraphBoard(id: string, box: BoundingBox): Board {
  const board = JXG.JSXGraph.initBoard(id, {
    boundingbox: box,
    axis: false,
    showCopyright: false,
    showNavigation: false,
    keepAspectRatio: true,
    pan: { enabled: true, needShift: false, needTwoFingers: false },
    zoom: {
      wheel: true,
      needShift: false,
      factorX: 1.15,
      factorY: 1.15,
      min: 0.25,
      max: 8,
    },
  });

  board.create("grid", [], {
    strokeColor: "#486567",
    strokeOpacity: 0.14,
    strokeWidth: 1,
    highlight: false,
  });

  const axisStyle = {
    strokeColor: "#63727d",
    strokeWidth: 1.2,
    highlight: false,
  };
  const ticks = {
    insertTicks: true,
    minTicksDistance: 36,
    minorTicks: 1,
    majorHeight: 7,
    drawLabels: true,
    label: { fontSize: 9, strokeColor: "#63727d" },
  };
  board.create(
    "axis",
    [
      [0, 0],
      [1, 0],
    ],
    { ...axisStyle, ticks },
  );
  board.create(
    "axis",
    [
      [0, 0],
      [0, 1],
    ],
    { ...axisStyle, ticks },
  );

  return board;
}

/**
 * Saat ukuran kontainer berubah (mis. layar penuh), pertahankan skala dan
 * titik tengah tampilan agar grafik tidak melompat. Mengembalikan fungsi
 * pembersih.
 */
export function observeBoardResize(
  board: Board,
  container: HTMLElement | null,
): () => void {
  if (!container) return () => {};
  let last = { w: container.clientWidth, h: container.clientHeight };

  const observer = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;
    if (w === last.w && h === last.h) return;

    const bb = board.getBoundingBox();
    const spanX = bb[2] - bb[0];
    const spanY = bb[1] - bb[3];
    if (last.w > 0 && last.h > 0 && spanX > 0 && spanY > 0) {
      const ux = last.w / spanX;
      const uy = last.h / spanY;
      const cx = (bb[0] + bb[2]) / 2;
      const cy = (bb[1] + bb[3]) / 2;
      board.resizeContainer(w, h, true, true);
      board.setBoundingBox(
        [cx - w / 2 / ux, cy + h / 2 / uy, cx + w / 2 / ux, cy - h / 2 / uy],
        true,
      );
    } else {
      board.resizeContainer(w, h, true);
    }
    last = { w, h };
    board.update();
  });
  observer.observe(container);
  return () => observer.disconnect();
}

/** Mode layar penuh (asli bila didukung, kalau tidak pakai CSS). */
export function useSimulationFullscreen() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const nativeFullscreenRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    const el = rootRef.current;
    if (!el) return;
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (el.requestFullscreen) {
        try {
          await el.requestFullscreen();
          nativeFullscreenRef.current = true;
        } catch {
          // Gagal masuk fullscreen asli: tetap pakai mode layar penuh CSS.
        }
      }
    } else {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          /* diabaikan */
        }
      }
      nativeFullscreenRef.current = false;
      setIsFullscreen(false);
    }
  };

  // Sinkron saat keluar fullscreen lewat tombol Esc browser.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && nativeFullscreenRef.current) {
        nativeFullscreenRef.current = false;
        setIsFullscreen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !document.fullscreenElement &&
        nativeFullscreenRef.current === false
      ) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return { rootRef, isFullscreen, toggleFullscreen };
}
