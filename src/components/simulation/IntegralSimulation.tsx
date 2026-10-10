import {
  Crosshair,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  Smartphone,
  SlidersHorizontal,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./IntegralSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useStoredSimulationState } from "./useStoredSimulationState";
import { FN_KEYS, FUNCS, calcColors, type FnKey } from "./calculusFunctions";
import { clamp, fmt, round1 } from "./simulationBoard";

/* Simulasi integral (versi disusun ulang, mengikuti struktur VectorSimulation).
   Prioritas: ponsel lanskap → desktop → ponsel potret.
   Wilayah grafik : wilayah input = 2 : 1.
   - Layar kecil / layar penuh: panel kanan bertab (Fungsi, Batas, Hasil,
     Tampilan) agar semuanya muat tanpa gulir panjang.
   - Desktop: panel input di kanan grafik, hasil di bawahnya. */

/* ---------- Tipe ---------- */

type Method = "left" | "right" | "mid";

type State = {
  fn: FnKey;
  a: number; // batas bawah integral
  b: number; // batas atas integral
  n: number;
  method: Method;
};
type Style = { curveWidth: number; pointSize: number };
type PanelTab = "fn" | "bounds" | "result" | "view";
type BoundingBox = [number, number, number, number];

type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
};

const panelTabs: { tab: PanelTab; label: string }[] = [
  { tab: "fn", label: "Fungsi" },
  { tab: "bounds", label: "Batas" },
  { tab: "result", label: "Hasil" },
  { tab: "view", label: "Tampilan" },
];

/* ---------- Konstanta ---------- */

const initialState: State = { fn: "quad", a: -3, b: 3, n: 6, method: "left" };
const initialStyle: Style = { curveWidth: 3, pointSize: 4 };
const initialBox: BoundingBox = [-7, 7, 7, -7];
const CURVE_WIDTH_RANGE = [1, 8] as const;
const POINT_SIZE_RANGE = [2, 10] as const;
const A_RANGE = [-6, 5.5] as const;
const B_RANGE = [-5.5, 6] as const;
const N_RANGE = [1, 100] as const;
/** Layar kecil atau pendek memakai panel bertab. */
const TABBED_QUERY = "(max-width: 899px), (max-height: 540px)";

const METHODS: { key: Method; label: string; full: string }[] = [
  { key: "left", label: "Kiri", full: "titik kiri" },
  { key: "right", label: "Kanan", full: "titik kanan" },
  { key: "mid", label: "Tengah", full: "titik tengah" },
];

const N_STEPS = [
  1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100,
];
const ANIMATION_SPEED_FACTOR = 0.25;

/* ---------- Matematika ---------- */

function riemann(s: State) {
  const { f } = FUNCS[s.fn];
  const dx = (s.b - s.a) / s.n;
  const heights: number[] = [];
  for (let i = 0; i < s.n; i += 1) {
    const left = s.a + i * dx;
    const right = left + dx;
    const sample =
      s.method === "left"
        ? left
        : s.method === "right"
          ? right
          : (left + right) / 2;
    heights.push(f(sample));
  }
  const sum = heights.reduce((total, v) => total + v, 0) * dx;
  return { dx, heights, sum };
}

/* ---------- Hook & komponen kecil ---------- */

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Tombol tahan-untuk-mengulang (−/+ di samping slider). */
function useHoldRepeat(onStep: (direction: 1 | -1) => void) {
  const stepRef = useRef(onStep);
  stepRef.current = onStep;
  const timers = useRef<{ delay?: number; repeat?: number }>({});

  const stop = () => {
    window.clearTimeout(timers.current.delay);
    window.clearInterval(timers.current.repeat);
    timers.current = {};
  };

  useEffect(
    () => () => {
      window.clearTimeout(timers.current.delay);
      window.clearInterval(timers.current.repeat);
    },
    [],
  );

  return (direction: 1 | -1) => ({
    type: "button" as const,
    className: "ig-nudge-button",
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      stop();
      stepRef.current(direction);
      timers.current.delay = window.setTimeout(() => {
        timers.current.repeat = window.setInterval(
          () => stepRef.current(direction),
          80,
        );
      }, 450);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onBlur: stop,
    onContextMenu: (event: { preventDefault: () => void }) =>
      event.preventDefault(),
    // detail === 0 → aktivasi lewat keyboard (Enter/Spasi)
    onClick: (event: { detail: number }) => {
      if (event.detail === 0) stepRef.current(direction);
    },
  });
}

/** Satu baris: a  −  ──●──  +  −3 */
function SliderField({
  label,
  hint,
  tone,
  min,
  max,
  step,
  value,
  display,
  fillFromZero,
  onSlide,
  onNudge,
}: {
  label: string;
  hint: string;
  tone: "a" | "b" | "n";
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  /** true: isian dimulai dari titik 0; false: dari ujung kiri. */
  fillFromZero: boolean;
  onSlide: (value: number) => void;
  onNudge: (direction: 1 | -1) => void;
}) {
  const inputId = `ig-field-${useId().replace(/:/g, "")}`;
  const bind = useHoldRepeat(onNudge);

  const clamped = Math.min(max, Math.max(min, value));
  const pct = ((clamped - min) / (max - min)) * 100;
  const base = fillFromZero ? ((0 - min) / (max - min)) * 100 : 0;
  const rangeStyle = {
    "--lo": `${Math.min(base, pct)}%`,
    "--hi": `${Math.max(base, pct)}%`,
  } as CSSProperties;

  return (
    <div className="ig-row-wrap">
      <div className={`ig-row ig-row-${tone}`}>
        <label htmlFor={inputId} aria-label={`${label} (${hint})`}>
          {label}
        </label>
        <button {...bind(-1)} aria-label={`Kurangi ${label}`}>
          <Minus size={13} aria-hidden="true" />
        </button>
        <input
          id={inputId}
          className="ig-range"
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamped}
          style={rangeStyle}
          aria-valuetext={`${label} sama dengan ${display}`}
          onChange={(event) => onSlide(Number(event.currentTarget.value))}
        />
        <button {...bind(1)} aria-label={`Tambah ${label}`}>
          <Plus size={13} aria-hidden="true" />
        </button>
        <output htmlFor={inputId} className="ig-value" aria-live="polite">
          {display}
        </output>
      </div>
      <p className="ig-row-hint">{hint}</p>
    </div>
  );
}

/* ---------- Komponen utama ---------- */

export function IntegralSimulation() {
  const baseId = useId().replace(/:/g, "");
  const boardId = `ig-board-${baseId}`;
  const titleId = `ig-title-${baseId}`;
  const [tab, setTab] = useState<PanelTab>("fn");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nativeFullscreenRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Panel input hanya dipakai di layar penuh: tersembunyi, muncul mengambang.
  const [panelOpen, setPanelOpen] = useState(false);
  const smallScreen = useMediaQuery(TABBED_QUERY);
  const tabbed = smallScreen || isFullscreen;

  const boardRef = useRef<ReturnType<typeof JXG.JSXGraph.initBoard> | null>(
    null,
  );
  const curveRef = useRef<JXG.Functiongraph | null>(null);
  const pointsRef = useRef<JXG.Point[]>([]);
  const nTimer = useRef<number | null>(null);
  // Menyamakan ukuran papan JSXGraph dengan kontainernya (diisi oleh efek papan)
  const syncSizeRef = useRef<((force?: boolean) => void) | null>(null);

  const [st, setSt] = useStoredSimulationState("integral.state", initialState);
  const [style, setStyle] = useStoredSimulationState(
    "integral.style",
    initialStyle,
  );
  const [nAnimating, setNAnimating] = useState(false);

  const stRef = useRef<State>(st);
  const styleRef = useRef<Style>(style);
  styleRef.current = style;

  const patch = (p: Partial<State>) => {
    const next: State = { ...stRef.current, ...p };
    if (p.a !== undefined) next.a = round1(next.a);
    if (p.b !== undefined) next.b = round1(next.b);
    if (p.a !== undefined && next.a > next.b - 0.5)
      next.b = round1(next.a + 0.5);
    if (p.b !== undefined && next.b < next.a + 0.5)
      next.a = round1(next.b - 0.5);
    stRef.current = next;
    setSt(next);
    boardRef.current?.update();
  };

  const stopN = () => {
    if (nTimer.current !== null) window.clearInterval(nTimer.current);
    nTimer.current = null;
    setNAnimating(false);
  };

  // Animasi n: 1 → 100 persegi panjang
  const toggleNAnimation = () => {
    if (nTimer.current !== null) {
      stopN();
      return;
    }
    let index = 0;
    patch({ n: N_STEPS[0] });
    setNAnimating(true);
    nTimer.current = window.setInterval(() => {
      index += 1;
      if (index >= N_STEPS.length) {
        stopN();
        return;
      }
      patch({ n: N_STEPS[index] });
    }, 550 / ANIMATION_SPEED_FACTOR);
  };

  const reset = () => {
    stopN();
    patch(initialState);
  };

  const nudgeA = (direction: 1 | -1) =>
    patch({ a: clamp(round1(stRef.current.a + direction * 0.1), A_RANGE) });
  const nudgeB = (direction: 1 | -1) =>
    patch({ b: clamp(round1(stRef.current.b + direction * 0.1), B_RANGE) });
  const nudgeN = (direction: 1 | -1) => {
    stopN();
    patch({ n: clamp(stRef.current.n + direction, N_RANGE) });
  };

  const changeStyle = (key: keyof Style, delta: number) => {
    const range = key === "curveWidth" ? CURVE_WIDTH_RANGE : POINT_SIZE_RANGE;
    setStyle({ ...style, [key]: clamp(style[key] + delta, range) });
  };

  /* Tampilan: zoom, pusatkan, layar penuh */
  const zoomIn = () => boardRef.current?.zoomIn();
  const zoomOut = () => boardRef.current?.zoomOut();
  const resetView = () => boardRef.current?.setBoundingBox(initialBox, true);

  const toggleFullscreen = async () => {
    const el = rootRef.current;
    if (!el) return;
    if (!isFullscreen) {
      setPanelOpen(false);
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
        !nativeFullscreenRef.current
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

  // Di layar sentuh, layar penuh dikunci ke lanskap bila browser mengizinkan.
  useEffect(() => {
    if (!isFullscreen) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const orientation = (
      screen as unknown as {
        orientation?: {
          lock?: (mode: "landscape") => Promise<void>;
          unlock?: () => void;
        };
      }
    ).orientation;
    if (typeof orientation?.lock !== "function") return;
    orientation.lock("landscape").catch(() => undefined);
    return () => {
      try {
        orientation.unlock?.();
      } catch {
        /* abaikan */
      }
    };
  }, [isFullscreen]);

  /* Papan JSXGraph */
  useEffect(() => {
    const S = () => stRef.current;
    const F = () => FUNCS[S().fn];

    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: initialBox,
      axis: false,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: true,
      // Geser dengan tahan klik kiri (atau satu jari) pada area kosong;
      // zoom dengan roda mouse atau pinch.
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
    boardRef.current = board;

    board.create("grid", [], {
      strokeColor: "#dbe5e8",
      strokeOpacity: 0.9,
      strokeWidth: 1,
    });

    const axisStyle = {
      strokeColor: "#63727d",
      strokeWidth: 1.2,
      highlight: false,
    };
    const ticks = {
      insertTicks: true,
      minTicksDistance: 32,
      minorTicks: 1,
      majorHeight: 6,
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

    // Persegi panjang Riemann (isi + garis tepi)
    const fill = board.create("curve", [[0], [0]], {
      strokeWidth: 0,
      fillColor: calcColors.area,
      fillOpacity: 0.28,
      highlight: false,
    }) as unknown as DataCurve;
    fill.updateDataArray = function (this: DataCurve) {
      const s = S();
      const { dx, heights } = riemann(s);
      const xs: number[] = [s.a];
      const ys: number[] = [0];
      heights.forEach((h, i) => {
        xs.push(s.a + i * dx, s.a + (i + 1) * dx);
        ys.push(h, h);
      });
      xs.push(s.b);
      ys.push(0);
      this.dataX = xs;
      this.dataY = ys;
    };

    const outline = board.create("curve", [[0], [0]], {
      strokeColor: calcColors.area,
      strokeWidth: 1.4,
      highlight: false,
    }) as unknown as DataCurve;
    outline.updateDataArray = function (this: DataCurve) {
      const s = S();
      const { dx, heights } = riemann(s);
      const xs: number[] = [];
      const ys: number[] = [];
      heights.forEach((h, i) => {
        const x0 = s.a + i * dx;
        const x1 = x0 + dx;
        xs.push(x0, x0, x1, x1, x0, Number.NaN);
        ys.push(0, h, h, 0, 0, Number.NaN);
      });
      this.dataX = xs;
      this.dataY = ys;
    };

    // Kurva f(x) tanpa batas domain: mengikuti area yang terlihat.
    curveRef.current = board.create(
      "functiongraph",
      [(x: number) => F().f(x)],
      {
        strokeColor: calcColors.curve,
        strokeWidth: styleRef.current.curveWidth,
        highlight: false,
      },
    );

    // Batas a dan b: garis vertikal tak berhingga
    ([() => S().a, () => S().b] as const).forEach((edge) => {
      board.create(
        "line",
        [
          [edge, 0],
          [edge, 1],
        ],
        {
          straightFirst: true,
          straightLast: true,
          strokeColor: calcColors.point,
          strokeWidth: 1.2,
          dash: 2,
          highlight: false,
          fixed: true,
          point1: { visible: false },
          point2: { visible: false },
        },
      );
    });

    pointsRef.current = [0, 1].map(
      (index) =>
        board.create(
          "point",
          [
            () => (index === 0 ? S().a : S().b),
            () => F().f(index === 0 ? S().a : S().b),
          ],
          {
            name: "",
            withLabel: false,
            size: styleRef.current.pointSize,
            fillColor: calcColors.point,
            strokeColor: "#ffffff",
            strokeWidth: 1.5,
            fixed: true,
            highlight: false,
          },
        ) as JXG.Point,
    );

    board.update();

    // Saat ukuran kontainer berubah (putar layar, layar penuh, ganti mode),
    // pertahankan skala dan titik tengah tampilan agar grafik tidak melompat.
    let last = {
      w: containerRef.current?.clientWidth ?? 0,
      h: containerRef.current?.clientHeight ?? 0,
    };
    const sync = (force = false) => {
      const el = containerRef.current;
      if (!el || el.clientWidth <= 0 || el.clientHeight <= 0) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!force && w === last.w && h === last.h) return;

      const bb = board.getBoundingBox();
      const spanX = bb[2] - bb[0];
      const spanY = bb[1] - bb[3];
      board.resizeContainer(w, h, true, true);
      if (last.w > 0 && last.h > 0 && spanX > 0 && spanY > 0) {
        const ux = last.w / spanX;
        const uy = last.h / spanY;
        const cx = (bb[0] + bb[2]) / 2;
        const cy = (bb[1] + bb[3]) / 2;
        board.setBoundingBox(
          [cx - w / 2 / ux, cy + h / 2 / uy, cx + w / 2 / ux, cy - h / 2 / uy],
          true,
        );
      }
      last = { w, h };
      board.update();
    };
    syncSizeRef.current = sync;
    const observer = new ResizeObserver(() => sync());
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      syncSizeRef.current = null;
      observer.disconnect();
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
      curveRef.current = null;
      pointsRef.current = [];
    };
  }, [boardId]);

  // Terapkan ketebalan grafik dan ukuran titik.
  useEffect(() => {
    curveRef.current?.setAttribute({
      strokeWidth: clamp(style.curveWidth, CURVE_WIDTH_RANGE),
    });
    pointsRef.current.forEach((point) =>
      point.setAttribute({ size: clamp(style.pointSize, POINT_SIZE_RANGE) }),
    );
    boardRef.current?.update();
  }, [style]);

  // Bersihkan animasi saat komponen dilepas
  useEffect(
    () => () => {
      if (nTimer.current !== null) window.clearInterval(nTimer.current);
    },
    [],
  );

  // Masuk/keluar layar penuh mengubah ukuran kontainer dua kali (tata letak
  // CSS lalu layar penuh asli). Sinkronkan ulang ukuran papan setelah
  // transisi selesai agar grafik langsung terisi penuh.
  useEffect(() => {
    const run = () => syncSizeRef.current?.(true);
    const raf = requestAnimationFrame(() => requestAnimationFrame(run));
    const t1 = window.setTimeout(run, 150);
    const t2 = window.setTimeout(run, 450);
    document.addEventListener("fullscreenchange", run);
    window.addEventListener("resize", run);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.removeEventListener("fullscreenchange", run);
      window.removeEventListener("resize", run);
    };
  }, [isFullscreen, tabbed]);

  /* ---------- Turunan untuk tampilan ---------- */

  const fn = FUNCS[st.fn];
  const rm = riemann(st);
  const exact = fn.F(st.b) - fn.F(st.a);
  const error = rm.sum - exact;
  const methodName = METHODS.find((m) => m.key === st.method)?.full ?? "";

  return (
    <div
      ref={rootRef}
      className={`integral-simulation simulation-fullscreen-frame${
        tabbed ? " is-tabbed" : ""
      }${isFullscreen ? " is-fullscreen" : ""}`}
    >
      <p className="ig-orientation-hint">
        <Smartphone size={14} aria-hidden="true" />
        <span>
          Miringkan ponsel ke mode lanskap agar grafik dan panel isian tampil
          berdampingan.
        </span>
      </p>

      <div className="ig-main">
        {/* ───── Wilayah grafik (2 bagian) ───── */}
        <section className="ig-board-panel" aria-labelledby={titleId}>
          <h3 id={titleId} className="ig-sr-only">
            Jumlah Riemann di [{fmt(st.a)}, {fmt(st.b)}]
          </h3>
          <div className="ig-stage">
            <div
              className="ig-board"
              id={boardId}
              ref={containerRef}
              aria-label="Grafik fungsi f dengan n persegi panjang Riemann di antara batas a dan b. Ubah a, b, n, dan metode untuk melihat perubahan pendekatan luas. Tahan klik kiri lalu seret untuk menggeser grafik, gulir atau cubit untuk memperbesar atau memperkecil."
            />
            <p className="ig-caption" aria-live="polite">
              <span className="ig-caption-fn">
                {fn.label} · [{fmt(st.a)}, {fmt(st.b)}]
              </span>
              <span className="ig-caption-sum">
                Sₙ = {fmt(rm.sum, 3)} → ∫ = {fmt(exact, 3)}
              </span>
            </p>
            <div className="ig-view-tools" role="group" aria-label="Tampilan">
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-pressed={isFullscreen}
                aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
                title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
              >
                {isFullscreen ? (
                  <Minimize2 size={15} aria-hidden="true" />
                ) : (
                  <Maximize2 size={15} aria-hidden="true" />
                )}
              </button>
              <button type="button" onClick={zoomIn} aria-label="Perbesar">
                <Plus size={16} aria-hidden="true" />
              </button>
              <button type="button" onClick={zoomOut} aria-label="Perkecil">
                <Minus size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={resetView}
                aria-label="Pusatkan tampilan"
                title="Pusatkan tampilan"
              >
                <Crosshair size={15} aria-hidden="true" />
              </button>
              {isFullscreen && (
                <button
                  type="button"
                  className="ig-toolbar-toggle"
                  onClick={() => setPanelOpen((open) => !open)}
                  aria-pressed={panelOpen}
                  aria-controls={`ig-column-${baseId}`}
                  aria-label={
                    panelOpen ? "Sembunyikan toolbar" : "Tampilkan toolbar"
                  }
                  title={
                    panelOpen ? "Sembunyikan toolbar" : "Tampilkan toolbar"
                  }
                >
                  <SlidersHorizontal size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="ig-legend" aria-label="Legenda grafik">
            <span>
              <i className="legend-curve" /> f(x)
            </span>
            <span>
              <b className="dot-area" /> persegi panjang Riemann
            </span>
            <span>
              <i className="legend-bound" /> batas a dan b
            </span>
          </div>
        </section>

        {/* ───── Wilayah input (1 bagian) ───── */}
        <div
          id={`ig-column-${baseId}`}
          className={`ig-column${isFullscreen ? " is-floating" : ""}${
            isFullscreen && panelOpen ? " is-open" : ""
          }`}
          data-tab={tab}
        >
          <div className="ig-tabs" role="group" aria-label="Bagian panel">
            {panelTabs.map((item) => (
              <button
                key={item.tab}
                type="button"
                aria-pressed={tab === item.tab}
                onClick={() => setTab(item.tab)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <section className="ig-side" aria-label="Pengatur jumlah Riemann">
            <div className="ig-panel" data-pane="fn">
              <h3>Fungsi dan titik tinggi</h3>
              <p className="ig-subtitle">Pilih fungsi</p>
              <div
                className="ig-segmented"
                role="radiogroup"
                aria-label="Pilih fungsi"
              >
                {FN_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={st.fn === key}
                    aria-pressed={st.fn === key}
                    className="ig-fn-button"
                    onClick={() => patch({ fn: key })}
                  >
                    {FUNCS[key].short}
                  </button>
                ))}
              </div>
              <p className="ig-subtitle">Titik tinggi persegi panjang</p>
              <div
                className="ig-segmented"
                role="radiogroup"
                aria-label="Titik tinggi persegi panjang"
              >
                {METHODS.map((method) => (
                  <button
                    key={method.key}
                    type="button"
                    role="radio"
                    aria-checked={st.method === method.key}
                    aria-pressed={st.method === method.key}
                    onClick={() => patch({ method: method.key })}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ig-panel" data-pane="bounds">
              <h3>Batas dan banyak persegi panjang</h3>
              <div className="ig-rows">
                <SliderField
                  label="a"
                  hint="Batas bawah"
                  tone="a"
                  min={A_RANGE[0]}
                  max={A_RANGE[1]}
                  step={0.1}
                  value={st.a}
                  display={fmt(st.a)}
                  fillFromZero
                  onSlide={(v) => patch({ a: v })}
                  onNudge={nudgeA}
                />
                <SliderField
                  label="b"
                  hint="Batas atas"
                  tone="b"
                  min={B_RANGE[0]}
                  max={B_RANGE[1]}
                  step={0.1}
                  value={st.b}
                  display={fmt(st.b)}
                  fillFromZero
                  onSlide={(v) => patch({ b: v })}
                  onNudge={nudgeB}
                />
                <SliderField
                  label="n"
                  hint="Banyak persegi panjang"
                  tone="n"
                  min={N_RANGE[0]}
                  max={N_RANGE[1]}
                  step={1}
                  value={st.n}
                  display={String(st.n)}
                  fillFromZero={false}
                  onSlide={(v) => {
                    stopN();
                    patch({ n: v });
                  }}
                  onNudge={nudgeN}
                />
              </div>

              <div className="ig-actions">
                <button
                  className="ig-primary-button"
                  type="button"
                  onClick={toggleNAnimation}
                  aria-pressed={nAnimating}
                >
                  {nAnimating ? "Hentikan" : "Animasikan n → 100"}
                </button>
                <button
                  className="ig-reset-button"
                  type="button"
                  onClick={reset}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>Atur ulang</span>
                </button>
              </div>
            </div>

            <div className="ig-panel" data-pane="view">
              <h3>Tampilan grafik</h3>
              <GraphAppearanceControls
                appearance={style}
                onStep={changeStyle}
              />
            </div>
          </section>

          <div className="ig-results">
            <section className="ig-panel ig-wide" data-pane="result">
              <h3>Hasil perhitungan</h3>
              <dl className="ig-readouts" aria-live="polite">
                <div className="readout-green">
                  <dt>Jumlah Riemann Sₙ</dt>
                  <dd>{fmt(rm.sum, 4)}</dd>
                  <small>{`n = ${st.n}, ${methodName}`}</small>
                </div>
                <div className="readout-ink">
                  <dt>{"Nilai eksak ∫ f(x) dx"}</dt>
                  <dd>{fmt(exact, 4)}</dd>
                  <small>F(b) − F(a)</small>
                </div>
                <div className="readout-red">
                  <dt>Galat (Sₙ − eksak)</dt>
                  <dd>{fmt(error, 4)}</dd>
                  <small>Mengecil saat n membesar</small>
                </div>
                <div className="readout-gold">
                  <dt>Lebar tiap persegi panjang</dt>
                  <dd>{`Δx = ${fmt(rm.dx, 4)}`}</dd>
                </div>
                <div className="readout-gold">
                  <dt>Batas integral</dt>
                  <dd>{`[${fmt(st.a)}, ${fmt(st.b)}]`}</dd>
                </div>
                <div className="readout-gold">
                  <dt>Tinggi persegi panjang pertama</dt>
                  <dd>{fmt(rm.heights[0], 3)}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>

      <ul className="ig-insights">
        <li>
          <strong style={{ color: calcColors.area }}>Jumlah Riemann:</strong> Sₙ
          = Σ f(xᵢ*) · Δx dengan Δx = (b − a)/n. Saat n → ∞, Sₙ menuju integral
          tentu ∫ f(x) dx = F(b) − F(a).
        </li>
        <li>
          <strong style={{ color: calcColors.point }}>Luas bertanda:</strong>{" "}
          Bagian grafik di bawah sumbu x menyumbang luas negatif, sehingga nilai
          integral bisa lebih kecil dari luas daerah sebenarnya.
        </li>
      </ul>
    </div>
  );
}
