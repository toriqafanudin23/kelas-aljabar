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
import "./QuadraticSimulation.css";
import { useStoredSimulationState } from "./useStoredSimulationState";

/* Simulasi fungsi kuadrat v2.
   Prioritas: ponsel lanskap → desktop → ponsel potret.
   Wilayah grafik : wilayah input = 2 : 1. */

type Params = { a: number; b: number; c: number };
type Style = { curveWidth: number; pointSize: number };

const initialParams: Params = { a: 1, b: -2, c: -3 };
const initialStyle: Style = { curveWidth: 3, pointSize: 4 };
const initialBox: [number, number, number, number] = [-10, 10, 10, -10];
const CURVE_WIDTH_RANGE = [1, 8] as const;
const POINT_SIZE_RANGE = [2, 10] as const;

const sliderConfig = [
  { key: "a", min: -5, max: 5, hint: "arah & kelebaran" },
  { key: "b", min: -10, max: 10, hint: "geser sumbu simetri" },
  { key: "c", min: -10, max: 10, hint: "potong sumbu y" },
] as const;

const colors = {
  a: "#087f8c",
  b: "#d16b36",
  c: "#527a41",
  curve: "#183e54",
  vertex: "#927000",
  root: "#b23a48",
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, [min, max]: readonly [number, number]) {
  return Math.min(max, Math.max(min, value));
}

function formatValue(value: number) {
  if (Math.abs(value) < 0.0005) return "0";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(
    value,
  );
}

function equationLabel({ a, b, c }: Params) {
  const parts: string[] = [];
  const push = (coef: number, term: string) => {
    if (coef === 0) return;
    const abs = Math.abs(coef);
    const body = term !== "" && abs === 1 ? term : `${formatValue(abs)}${term}`;
    if (parts.length === 0) parts.push(coef < 0 ? `−${body}` : body);
    else parts.push(coef < 0 ? `− ${body}` : `+ ${body}`);
  };
  push(a, "x²");
  push(b, "x");
  push(c, "");
  return `y = ${parts.length ? parts.join(" ") : "0"}`;
}

type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;

export function QuadraticSimulation() {
  const baseId = useId().replace(/:/g, "");
  const boardId = `qs2-board-${baseId}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const curveRef = useRef<JXG.Functiongraph | null>(null);
  const pointsRef = useRef<{ el: JXG.Point; extra: number }[]>([]);
  const nativeFullscreenRef = useRef(false);
  const holdRef = useRef<{ delay?: number; repeat?: number }>({});

  const [params, setParams] = useStoredSimulationState(
    "quadratic.params",
    initialParams,
  );
  const [style, setStyle] = useStoredSimulationState(
    "quadratic.style",
    initialStyle,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Panel input hanya dipakai di layar penuh: tersembunyi, muncul mengambang.
  const [panelOpen, setPanelOpen] = useState(false);

  const paramsRef = useRef<Params>(params);
  const styleRef = useRef<Style>(style);
  styleRef.current = style;

  /* ───────── Parameter a, b, c ───────── */

  const updateParam = (key: keyof Params, value: number) => {
    const next = { ...paramsRef.current, [key]: round1(value) };
    paramsRef.current = next;
    setParams(next);
    boardRef.current?.update();
  };

  const stepParam = (key: keyof Params, direction: 1 | -1) => {
    const config = sliderConfig.find((item) => item.key === key);
    if (!config) return;
    updateParam(
      key,
      clamp(paramsRef.current[key] + direction * 0.1, [config.min, config.max]),
    );
  };

  const stopHold = () => {
    window.clearTimeout(holdRef.current.delay);
    window.clearInterval(holdRef.current.repeat);
    holdRef.current = {};
  };

  // Tahan tombol −/+ untuk mengubah nilai terus-menerus.
  const startHold =
    (key: keyof Params, direction: 1 | -1) =>
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      stopHold();
      stepParam(key, direction);
      holdRef.current.delay = window.setTimeout(() => {
        holdRef.current.repeat = window.setInterval(
          () => stepParam(key, direction),
          60,
        );
      }, 400);
    };

  useEffect(() => stopHold, []);

  const reset = () => {
    paramsRef.current = initialParams;
    setParams(initialParams);
    boardRef.current?.update();
  };

  const changeStyle = (key: keyof Style, delta: number) => {
    const range = key === "curveWidth" ? CURVE_WIDTH_RANGE : POINT_SIZE_RANGE;
    setStyle({ ...style, [key]: clamp(style[key] + delta, range) });
  };

  /* ───────── Tampilan grafik ───────── */

  const resetView = () => boardRef.current?.setBoundingBox(initialBox, true);
  const zoomIn = () => boardRef.current?.zoomIn();
  const zoomOut = () => boardRef.current?.zoomOut();

  /* ───────── Layar penuh ───────── */

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
          // Tetap memakai mode layar penuh CSS.
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

  /* ───────── Papan JSXGraph ───────── */

  useEffect(() => {
    const p = () => paramsRef.current;
    const discriminant = () => p().b * p().b - 4 * p().a * p().c;
    const vertexX = () => (p().a === 0 ? Number.NaN : -p().b / (2 * p().a));
    const f = (x: number) => p().a * x * x + p().b * x + p().c;
    const root = (sign: number) => () => {
      const d = discriminant();
      if (p().a === 0 || d < 0) return Number.NaN;
      return (-p().b + sign * Math.sqrt(d)) / (2 * p().a);
    };

    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: initialBox,
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
    boardRef.current = board;

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

    // Pembanding y = x²
    board.create("functiongraph", [(x: number) => x * x], {
      strokeColor: "#9aa8b0",
      strokeWidth: 1.5,
      dash: 3,
      highlight: false,
    });

    // Sumbu simetri
    board.create(
      "line",
      [
        [() => vertexX(), 0],
        [() => vertexX(), 1],
      ],
      {
        straightFirst: true,
        straightLast: true,
        strokeColor: colors.b,
        strokeWidth: 1.2,
        dash: 2,
        highlight: false,
        fixed: true,
        point1: { visible: false },
        point2: { visible: false },
      },
    );

    // Kurva utama
    curveRef.current = board.create("functiongraph", [f], {
      strokeColor: colors.curve,
      strokeWidth: styleRef.current.curveWidth,
      highlight: false,
    });

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
      });
      pointsRef.current.push({ el, extra });
    };

    dot(
      () => 0,
      () => p().c,
      colors.c,
      1,
    );
    dot(root(1), () => 0, colors.root);
    dot(root(-1), () => 0, colors.root);
    dot(
      () => vertexX(),
      () => (p().a === 0 ? Number.NaN : f(vertexX())),
      colors.vertex,
      1,
    );

    // Saat ukuran kontainer berubah (putar layar, layar penuh), pertahankan
    // skala dan titik tengah agar grafik tidak melompat.
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

  // Ketebalan kurva dan ukuran titik.
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

  /* ───────── Nilai turunan ───────── */

  const { a, b, c } = params;
  const isQuadratic = a !== 0;
  const discriminant = b * b - 4 * a * c;
  const vx = isQuadratic ? -b / (2 * a) : null;
  const vy = isQuadratic && vx !== null ? a * vx * vx + b * vx + c : null;

  let rootsText = "—";
  if (isQuadratic) {
    if (discriminant > 0) {
      const r1 = (-b - Math.sqrt(discriminant)) / (2 * a);
      const r2 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const [lo, hi] = r1 < r2 ? [r1, r2] : [r2, r1];
      rootsText = `${formatValue(lo)} dan ${formatValue(hi)}`;
    } else if (discriminant === 0) {
      rootsText = formatValue(-b / (2 * a));
    } else {
      rootsText = "Tidak ada";
    }
  }

  const widthText =
    Math.abs(a) > 1 ? "lebih sempit" : Math.abs(a) < 1 ? "lebih lebar" : "sama";

  const stepProps = (
    key: keyof Params,
    direction: 1 | -1,
    atLimit: boolean,
  ) => ({
    type: "button" as const,
    className: "qs2-step",
    disabled: atLimit,
    "aria-label": `${direction === 1 ? "Tambah" : "Kurangi"} ${key} 0,1`,
    onPointerDown: startHold(key, direction),
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onPointerCancel: stopHold,
    onBlur: stopHold,
    onContextMenu: (event: { preventDefault: () => void }) =>
      event.preventDefault(),
    // detail === 0 → aktivasi lewat keyboard (Enter/Spasi)
    onClick: (event: { detail: number }) => {
      if (event.detail === 0) stepParam(key, direction);
    },
  });

  return (
    <div ref={rootRef} className={`qs2${isFullscreen ? " is-fs" : ""}`}>
      <p className="qs2-hint">
        <Smartphone size={14} aria-hidden="true" />
        <span>
          Miringkan ponsel ke mode lanskap agar grafik dan slider tampil nyaman.
        </span>
      </p>

      <div className="qs2-layout">
        {/* ───── Wilayah grafik (2 bagian) ───── */}
        <section className="qs2-graph" aria-label="Grafik fungsi kuadrat">
          <div className="qs2-stage">
            <div
              className="qs2-board"
              id={boardId}
              ref={containerRef}
              aria-label="Grafik y = ax² + bx + c. Seret untuk menggeser, gulir atau cubit untuk memperbesar."
            />
            <p className="qs2-eq" aria-live="polite">
              {equationLabel(params)}
            </p>
            <div className="qs2-tools" role="group" aria-label="Tampilan">
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
                  className="qs2-toolbar-toggle"
                  onClick={() => setPanelOpen((open) => !open)}
                  aria-pressed={panelOpen}
                  aria-controls={`qs2-inputs-${baseId}`}
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
          <div className="qs2-legend" aria-label="Legenda grafik">
            <span>
              <i className="lg-curve" /> y = ax² + bx + c
            </span>
            <span>
              <i className="lg-ref" /> y = x²
            </span>
            <span>
              <i className="lg-axis" /> sumbu simetri
            </span>
            <span>
              <b className="dt-vertex" /> puncak
            </span>
            <span>
              <b className="dt-root" /> akar
            </span>
            <span>
              <b className="dt-c" /> potong sumbu y
            </span>
          </div>
        </section>

        {/* ───── Wilayah input (1 bagian) ───── */}
        <section
          id={`qs2-inputs-${baseId}`}
          className={`qs2-inputs${isFullscreen ? " is-floating" : ""}${
            isFullscreen && panelOpen ? " is-open" : ""
          }`}
          aria-label="Pengatur koefisien"
        >
          <div className="qs2-sliders">
            {sliderConfig.map(({ key, min, max, hint }) => {
              const value = params[key];
              const inputId = `qs2-${baseId}-${key}`;
              const sliderStyle = {
                "--fill": `${((value - min) / (max - min)) * 100}%`,
              } as CSSProperties;
              return (
                <div className={`qs2-slider qs2-slider-${key}`} key={key}>
                  <div className="qs2-slider-head">
                    <label htmlFor={inputId}>
                      <i>{key}</i>
                      <small>{hint}</small>
                    </label>
                    <output htmlFor={inputId} aria-live="polite">
                      {formatValue(value)}
                    </output>
                  </div>
                  <button {...stepProps(key, -1, value <= min)}>
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <input
                    id={inputId}
                    className="qs2-range"
                    type="range"
                    min={min}
                    max={max}
                    step="0.1"
                    value={value}
                    style={sliderStyle}
                    aria-valuetext={`${key} sama dengan ${formatValue(value)}`}
                    onChange={(event) =>
                      updateParam(key, Number(event.currentTarget.value))
                    }
                  />
                  <button {...stepProps(key, 1, value >= max)}>
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="qs2-actions">
            <button type="button" className="qs2-reset" onClick={reset}>
              <RotateCcw size={13} aria-hidden="true" />
              <span>Atur ulang</span>
            </button>
            <div className="qs2-style" role="group" aria-label="Gaya grafik">
              <span>Garis</span>
              <button
                type="button"
                aria-label="Kurangi tebal garis"
                onClick={() => changeStyle("curveWidth", -1)}
              >
                <Minus size={12} aria-hidden="true" />
              </button>
              <b>{style.curveWidth}</b>
              <button
                type="button"
                aria-label="Tambah tebal garis"
                onClick={() => changeStyle("curveWidth", 1)}
              >
                <Plus size={12} aria-hidden="true" />
              </button>
              <span>Titik</span>
              <button
                type="button"
                aria-label="Kurangi ukuran titik"
                onClick={() => changeStyle("pointSize", -1)}
              >
                <Minus size={12} aria-hidden="true" />
              </button>
              <b>{style.pointSize}</b>
              <button
                type="button"
                aria-label="Tambah ukuran titik"
                onClick={() => changeStyle("pointSize", 1)}
              >
                <Plus size={12} aria-hidden="true" />
              </button>
            </div>
          </div>

          {!isQuadratic && (
            <p className="qs2-warning" role="status">
              Saat a = 0 grafik berupa garis lurus. Geser a menjauhi 0 untuk
              melihat parabola.
            </p>
          )}

          <dl className="qs2-readouts" aria-live="polite">
            <div className="ro-a">
              <dt>Arah</dt>
              <dd>
                {!isQuadratic ? "—" : a > 0 ? "Buka ke atas" : "Buka ke bawah"}
              </dd>
            </div>
            <div className="ro-vertex">
              <dt>Puncak</dt>
              <dd>
                {vx === null || vy === null
                  ? "—"
                  : `(${formatValue(vx)}, ${formatValue(vy)})`}
              </dd>
            </div>
            <div className="ro-b">
              <dt>Sumbu simetri</dt>
              <dd>{vx === null ? "—" : `x = ${formatValue(vx)}`}</dd>
            </div>
            <div className="ro-c">
              <dt>Potong sumbu y</dt>
              <dd>{`(0, ${formatValue(c)})`}</dd>
            </div>
            <div className="ro-d">
              <dt>Diskriminan</dt>
              <dd>{isQuadratic ? formatValue(discriminant) : "—"}</dd>
            </div>
            <div className="ro-roots">
              <dt>Akar</dt>
              <dd>{rootsText}</dd>
            </div>
          </dl>
        </section>
      </div>

      <ul className="qs2-insights">
        <li>
          <strong style={{ color: colors.a }}>Pengaruh a:</strong>{" "}
          {isQuadratic
            ? `a ${a > 0 ? "positif" : "negatif"} membuat parabola terbuka ke ${a > 0 ? "atas" : "bawah"}. |a| = ${formatValue(Math.abs(a))} membuat parabola ${widthText} dibanding y = x².`
            : "a = 0 membuat grafik berupa garis lurus."}
        </li>
        <li>
          <strong style={{ color: colors.b }}>Pengaruh b:</strong> Sumbu simetri
          berada di x = −b/2a
          {vx !== null ? ` = ${formatValue(vx)}` : ""}. Mengubah b menggeser
          puncak ke kiri atau kanan sekaligus ke atas atau bawah.
        </li>
        <li>
          <strong style={{ color: colors.c }}>Pengaruh c:</strong> Grafik selalu
          memotong sumbu y di (0, {formatValue(c)}). Mengubah c menggeser
          seluruh parabola secara vertikal.
        </li>
      </ul>
    </div>
  );
}
