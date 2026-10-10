import {
  Crosshair,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  Smartphone,
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
import "./DerivativeSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useStoredSimulationState } from "./useStoredSimulationState";
import { FN_KEYS, FUNCS, calcColors, type FnKey } from "./calculusFunctions";
import { clamp, fmt, round1 } from "./simulationBoard";

/* Simulasi turunan (versi disusun ulang, mengikuti struktur VectorSimulation).
   Prioritas: ponsel lanskap → desktop → ponsel potret.
   Wilayah grafik : wilayah input = 2 : 1.
   - Layar kecil / layar penuh: panel kanan bertab (Input, Hasil, Limit,
     Tampilan) agar semuanya muat tanpa gulir panjang.
   - Desktop: panel input di kanan grafik, hasil dan tabel limit di bawah. */

/* ---------- Tipe ---------- */

type State = {
  fn: FnKey;
  x0: number; // titik P
  h: number; // jarak Δx menuju titik Q
};
type Style = { curveWidth: number; pointSize: number };
type PanelTab = "input" | "result" | "limit" | "view";
type BoundingBox = [number, number, number, number];

const panelTabs: { tab: PanelTab; label: string }[] = [
  { tab: "input", label: "Input" },
  { tab: "result", label: "Hasil" },
  { tab: "limit", label: "Limit" },
  { tab: "view", label: "Tampilan" },
];

/* ---------- Konstanta ---------- */

const initialState: State = { fn: "quad", x0: 1, h: 2 };
const initialStyle: Style = { curveWidth: 3, pointSize: 4 };
const initialBox: BoundingBox = [-7, 7, 7, -7];
const CURVE_WIDTH_RANGE = [1, 8] as const;
const POINT_SIZE_RANGE = [2, 10] as const;
const ANIMATION_SPEED_FACTOR = 0.25;
const X0_LIMIT = 4;
const H_LIMIT = 3;
/** Layar kecil atau pendek memakai panel bertab. */
const TABBED_QUERY = "(max-width: 899px), (max-height: 540px)";

/* ---------- Matematika ---------- */

function secantSlope(s: State) {
  if (Math.abs(s.h) < 1e-9) return Number.NaN;
  const { f } = FUNCS[s.fn];
  return (f(s.x0 + s.h) - f(s.x0)) / s.h;
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
    className: "dv-nudge-button",
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

/** Satu baris: x₀  −  ──●──  +  1,0 */
function SliderField({
  label,
  hint,
  tone,
  min,
  max,
  step,
  value,
  display,
  onSlide,
  onNudge,
}: {
  label: string;
  hint: string;
  tone: "x" | "h";
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onSlide: (value: number) => void;
  onNudge: (direction: 1 | -1) => void;
}) {
  const inputId = `dv-field-${useId().replace(/:/g, "")}`;
  const bind = useHoldRepeat(onNudge);

  // Isi dari titik 0 (tengah) menuju nilai, karena rentang simetris.
  const clamped = Math.min(max, Math.max(min, value));
  const pct = ((clamped - min) / (max - min)) * 100;
  const zero = ((0 - min) / (max - min)) * 100;
  const rangeStyle = {
    "--lo": `${Math.min(zero, pct)}%`,
    "--hi": `${Math.max(zero, pct)}%`,
  } as CSSProperties;

  return (
    <div className={`dv-row-wrap dv-row-wrap-${tone}`}>
      <div className={`dv-row dv-row-${tone}`}>
        <label htmlFor={inputId} aria-label={`${label} (${hint})`}>
          {label}
        </label>
        <button {...bind(-1)} aria-label={`Kurangi ${label}`}>
          <Minus size={13} aria-hidden="true" />
        </button>
        <input
          id={inputId}
          className="dv-range"
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
        <output htmlFor={inputId} className="dv-value" aria-live="polite">
          {display}
        </output>
      </div>
      <p className="dv-row-hint">{hint}</p>
    </div>
  );
}

/* ---------- Komponen utama ---------- */

export function DerivativeSimulation() {
  const baseId = useId().replace(/:/g, "");
  const boardId = `dv-board-${baseId}`;
  const titleId = `dv-title-${baseId}`;
  const [tab, setTab] = useState<PanelTab>("input");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nativeFullscreenRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const smallScreen = useMediaQuery(TABBED_QUERY);
  const tabbed = smallScreen || isFullscreen;

  const boardRef = useRef<ReturnType<typeof JXG.JSXGraph.initBoard> | null>(
    null,
  );
  const curveRef = useRef<JXG.Functiongraph | null>(null);
  const pointsRef = useRef<{ el: JXG.Point; extra: number }[]>([]);
  const hRaf = useRef<number | null>(null);

  const [st, setSt] = useStoredSimulationState(
    "derivative.state",
    initialState,
  );
  const [style, setStyle] = useStoredSimulationState(
    "derivative.style",
    initialStyle,
  );
  const [hAnimating, setHAnimating] = useState(false);

  const stRef = useRef<State>(st);
  const styleRef = useRef<Style>(style);
  styleRef.current = style;

  const patch = (p: Partial<State>) => {
    const next: State = { ...stRef.current, ...p };
    if (p.x0 !== undefined) next.x0 = round1(next.x0);
    stRef.current = next;
    setSt(next);
    boardRef.current?.update();
  };

  const stopH = () => {
    if (hRaf.current !== null) cancelAnimationFrame(hRaf.current);
    hRaf.current = null;
    setHAnimating(false);
  };

  // Animasi h → 0: h dipangkas separuh setiap 450 ms pada kecepatan penuh
  const toggleHAnimation = () => {
    if (hRaf.current !== null) {
      stopH();
      return;
    }
    const current = stRef.current.h;
    patch({ h: Math.abs(current) < 0.05 ? (current < 0 ? -3 : 3) : current });
    setHAnimating(true);
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const next =
        stRef.current.h * Math.pow(0.5, dt / (450 / ANIMATION_SPEED_FACTOR));
      if (Math.abs(next) < 0.0005) {
        patch({ h: next < 0 ? -0.0005 : 0.0005 });
        hRaf.current = null;
        setHAnimating(false);
        return;
      }
      patch({ h: next });
      hRaf.current = requestAnimationFrame(step);
    };
    hRaf.current = requestAnimationFrame(step);
  };

  const reset = () => {
    stopH();
    patch(initialState);
  };

  const nudgeX0 = (direction: 1 | -1) =>
    patch({
      x0: clamp(round1(stRef.current.x0 + direction * 0.1), [
        -X0_LIMIT,
        X0_LIMIT,
      ]),
    });

  const nudgeH = (direction: 1 | -1) => {
    stopH();
    const next = Math.round((stRef.current.h + direction * 0.05) * 100) / 100;
    patch({ h: clamp(next, [-H_LIMIT, H_LIMIT]) });
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
    const msec = () => secantSlope(S());

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

    // Kurva f(x), garis singgung, dan tali busur tidak dibatasi domain
    // sehingga selalu mengikuti area yang terlihat saat digeser/di-zoom.
    curveRef.current = board.create(
      "functiongraph",
      [(x: number) => F().f(x)],
      {
        strokeColor: calcColors.curve,
        strokeWidth: styleRef.current.curveWidth,
        highlight: false,
      },
    );
    board.create(
      "functiongraph",
      [(x: number) => F().f(S().x0) + F().df(S().x0) * (x - S().x0)],
      {
        strokeColor: calcColors.tangent,
        strokeWidth: 2,
        dash: 2,
        highlight: false,
      },
    );
    board.create(
      "functiongraph",
      [
        (x: number) => {
          const m = msec();
          return Number.isFinite(m)
            ? F().f(S().x0) + m * (x - S().x0)
            : Number.NaN;
        },
      ],
      {
        strokeColor: calcColors.secant,
        strokeWidth: 2.5,
        highlight: false,
      },
    );

    // Segmen bantu: Δx (mendatar) dan Δy (tegak)
    board.create(
      "segment",
      [
        [() => S().x0, () => F().f(S().x0)],
        [() => S().x0 + S().h, () => F().f(S().x0)],
      ],
      {
        strokeColor: "#9aa8b0",
        strokeWidth: 1.5,
        dash: 2,
        highlight: false,
        fixed: true,
        point1: { visible: false },
        point2: { visible: false },
      },
    );
    board.create(
      "segment",
      [
        [() => S().x0 + S().h, () => F().f(S().x0)],
        [() => S().x0 + S().h, () => F().f(S().x0 + S().h)],
      ],
      {
        strokeColor: calcColors.secant,
        strokeWidth: 1.5,
        dash: 2,
        highlight: false,
        fixed: true,
        point1: { visible: false },
        point2: { visible: false },
      },
    );

    pointsRef.current = [];
    const dot = (
      x: () => number,
      y: () => number,
      color: string,
      extra = 0,
    ) => {
      const el = board.create("point", [x, y], {
        name: "",
        withLabel: false,
        size: styleRef.current.pointSize + extra,
        fillColor: color,
        strokeColor: "#ffffff",
        strokeWidth: 1.5,
        fixed: true,
        highlight: false,
      }) as JXG.Point;
      pointsRef.current.push({ el, extra });
    };

    dot(
      () => S().x0 + S().h,
      () => (Math.abs(S().h) < 1e-9 ? Number.NaN : F().f(S().x0 + S().h)),
      calcColors.secant,
      0.5,
    );
    dot(
      () => S().x0,
      () => F().f(S().x0),
      calcColors.point,
      1,
    );

    board.update();

    // Saat ukuran kontainer berubah (putar layar, layar penuh, ganti mode),
    // pertahankan skala dan titik tengah tampilan agar grafik tidak melompat.
    let last = {
      w: containerRef.current?.clientWidth ?? 0,
      h: containerRef.current?.clientHeight ?? 0,
    };
    const observer = new ResizeObserver(() => {
      const el = containerRef.current;
      if (!el || el.clientWidth <= 0 || el.clientHeight <= 0) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === last.w && h === last.h) return;

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
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
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
    pointsRef.current.forEach(({ el, extra }) =>
      el.setAttribute({
        size: clamp(style.pointSize, POINT_SIZE_RANGE) + extra,
      }),
    );
    boardRef.current?.update();
  }, [style]);

  // Bersihkan animasi saat komponen dilepas
  useEffect(
    () => () => {
      if (hRaf.current !== null) cancelAnimationFrame(hRaf.current);
    },
    [],
  );

  /* ---------- Turunan untuk tampilan ---------- */

  const fn = FUNCS[st.fn];
  const fx0 = fn.f(st.x0);
  const hZero = Math.abs(st.h) < 1e-9;
  const mSec = secantSlope(st);
  const mTan = fn.df(st.x0);
  const gap = Number.isFinite(mSec) ? Math.abs(mSec - mTan) : Number.NaN;
  const tableRows = [1, 0.1, 0.01, 0.001].map((hh) => ({
    hh,
    minus: (fn.f(st.x0 - hh) - fx0) / -hh,
    plus: (fn.f(st.x0 + hh) - fx0) / hh,
  }));

  return (
    <div
      ref={rootRef}
      className={`derivative-simulation simulation-fullscreen-frame${
        tabbed ? " is-tabbed" : ""
      }${isFullscreen ? " is-fullscreen" : ""}`}
    >
      <p className="dv-orientation-hint">
        <Smartphone size={14} aria-hidden="true" />
        <span>
          Miringkan ponsel ke mode lanskap agar grafik dan panel isian tampil
          berdampingan.
        </span>
      </p>

      <div className="dv-main">
        {/* ───── Wilayah grafik (2 bagian) ───── */}
        <section className="dv-board-panel" aria-labelledby={titleId}>
          <h3 id={titleId} className="dv-sr-only">
            Grafik tali busur dan garis singgung
          </h3>
          <div className="dv-stage">
            <div
              className="dv-board"
              id={boardId}
              ref={containerRef}
              aria-label="Grafik fungsi f dengan tali busur melalui titik P dan Q serta garis singgung di P. Ubah x0 dan h dengan penggeser. Tahan klik kiri lalu seret untuk menggeser grafik, gulir atau cubit untuk memperbesar atau memperkecil."
            />
            <p className="dv-caption" aria-live="polite">
              <span className="dv-caption-fn">
                {fn.label} · {fn.dLabel}
              </span>
              <span className="dv-caption-slope">
                {hZero
                  ? "h = 0: kemiringan 0/0 (tak terdefinisi)"
                  : `m PQ = ${fmt(mSec, 3)}`}
                {" → "}f′(x₀) = {fmt(mTan, 3)}
              </span>
            </p>
            <div className="dv-view-tools" role="group" aria-label="Tampilan">
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
            </div>
          </div>
          <div className="dv-legend" aria-label="Legenda grafik">
            <span>
              <i className="legend-curve" /> f(x)
            </span>
            <span>
              <i className="legend-secant" /> tali busur PQ
            </span>
            <span>
              <i className="legend-tangent" /> garis singgung di P
            </span>
            <span>
              <b className="dot-p" /> titik P
            </span>
            <span>
              <b className="dot-q" /> titik Q
            </span>
          </div>
        </section>

        {/* ───── Wilayah input (1 bagian) ───── */}
        <div className="dv-column" data-tab={tab}>
          <div className="dv-tabs" role="group" aria-label="Bagian panel">
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

          <section className="dv-side" aria-label="Pengatur turunan">
            <div className="dv-panel" data-pane="input">
              <h3>Fungsi dan titik</h3>
              <div
                className="dv-segmented"
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
                    onClick={() => patch({ fn: key })}
                  >
                    {FUNCS[key].short}
                  </button>
                ))}
              </div>

              <div className="dv-rows">
                <SliderField
                  label="x₀"
                  hint="Posisi titik P"
                  tone="x"
                  min={-X0_LIMIT}
                  max={X0_LIMIT}
                  step={0.1}
                  value={st.x0}
                  display={fmt(st.x0)}
                  onSlide={(v) => patch({ x0: v })}
                  onNudge={nudgeX0}
                />
                <SliderField
                  label="h"
                  hint="Jarak P ke Q (Δx)"
                  tone="h"
                  min={-H_LIMIT}
                  max={H_LIMIT}
                  step={0.01}
                  value={st.h}
                  display={fmt(st.h, 4)}
                  onSlide={(v) => {
                    stopH();
                    patch({ h: v });
                  }}
                  onNudge={nudgeH}
                />
              </div>

              <div className="dv-actions">
                <button
                  className="dv-primary-button"
                  type="button"
                  onClick={toggleHAnimation}
                  aria-pressed={hAnimating}
                >
                  {hAnimating ? "Hentikan" : "Animasikan h → 0"}
                </button>
                <button
                  className="dv-reset-button"
                  type="button"
                  onClick={reset}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>Atur ulang</span>
                </button>
              </div>
            </div>

            <div className="dv-panel" data-pane="view">
              <h3>Tampilan grafik</h3>
              <GraphAppearanceControls
                appearance={style}
                onStep={changeStyle}
              />
            </div>
          </section>

          <div className="dv-results">
            <section className="dv-panel dv-wide" data-pane="result">
              <h3>Hasil perhitungan</h3>
              <dl className="dv-readouts" aria-live="polite">
                <div className="readout-gold">
                  <dt>Titik P (x₀, f(x₀))</dt>
                  <dd>{`(${fmt(st.x0)}, ${fmt(fx0)})`}</dd>
                </div>
                <div className="readout-orange">
                  <dt>Titik Q (x₀ + h, f(x₀ + h))</dt>
                  <dd>
                    {hZero
                      ? "—"
                      : `(${fmt(st.x0 + st.h, 3)}, ${fmt(fn.f(st.x0 + st.h), 3)})`}
                  </dd>
                </div>
                <div className="readout-orange">
                  <dt>Kemiringan tali busur</dt>
                  <dd>{hZero ? "—" : fmt(mSec, 4)}</dd>
                  <small>Δy/Δx = [f(x₀+h) − f(x₀)] / h</small>
                </div>
                <div className="readout-teal">
                  <dt>Kemiringan garis singgung</dt>
                  <dd>{fmt(mTan, 4)}</dd>
                  <small>f′(x₀) = limit saat h → 0</small>
                </div>
                <div className="readout-red">
                  <dt>Selisih kedua kemiringan</dt>
                  <dd>{hZero ? "—" : fmt(gap, 4)}</dd>
                  <small>Mengecil saat |h| mengecil</small>
                </div>
                <div className="readout-gold">
                  <dt>Persamaan garis singgung</dt>
                  <dd>{`y = ${fmt(mTan, 2)}(x − ${fmt(st.x0)}) + ${fmt(fx0, 2)}`}</dd>
                </div>
              </dl>

              {hZero && (
                <p className="dv-warning" role="status">
                  Saat h = 0, titik Q berimpit dengan P sehingga kemiringan tali
                  busur berbentuk 0/0 (tak terdefinisi). Itulah sebabnya turunan
                  didefinisikan sebagai limit saat h mendekati 0, bukan nilai di
                  h = 0.
                </p>
              )}
            </section>

            <section className="dv-panel dv-wide" data-pane="limit">
              <h3>Pendekatan limit</h3>
              <div className="dv-table-wrap">
                <table className="dv-table">
                  <caption>
                    Di x₀ = {fmt(st.x0)}: kemiringan tali busur untuk h yang
                    makin kecil
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">h</th>
                      <th scope="col">Dari kiri (−h)</th>
                      <th scope="col">Dari kanan (+h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.hh}>
                        <th scope="row">{fmt(row.hh, 3)}</th>
                        <td>{fmt(row.minus, 4)}</td>
                        <td>{fmt(row.plus, 4)}</td>
                      </tr>
                    ))}
                    <tr className="dv-table-limit">
                      <th scope="row">h → 0</th>
                      <td colSpan={2}>{`limit = f′(x₀) = ${fmt(mTan, 4)}`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      <ul className="dv-insights">
        <li>
          <strong style={{ color: calcColors.secant }}>Tali busur:</strong>{" "}
          kemiringan PQ adalah [f(x₀+h) − f(x₀)]/h. Saat h mengecil, titik Q
          merapat ke P dan tali busur berputar menuju garis singgung.
        </li>
        <li>
          <strong style={{ color: calcColors.tangent }}>
            Limit dan turunan:
          </strong>{" "}
          f′(x₀) = lim<sub>h→0</sub> [f(x₀+h) − f(x₀)]/h = {fmt(mTan, 4)}. Limit
          ada karena pendekatan dari kiri dan kanan menuju nilai yang sama
          (lihat tabel).
        </li>
      </ul>
    </div>
  );
}
