import { useEffect, useId, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./QuadraticSimulation.css";
import { useStoredSimulationState } from "./useStoredSimulationState";

type Params = { a: number; b: number; c: number };
type Style = { curveWidth: number; pointSize: number };

const initialParams: Params = { a: 1, b: -2, c: -3 };
const initialStyle: Style = { curveWidth: 3, pointSize: 4 };
const initialBox: [number, number, number, number] = [-10, 10, 10, -10];
const CURVE_WIDTH_RANGE = [1, 8] as const;
const POINT_SIZE_RANGE = [2, 10] as const;

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
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
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
  const boardId = `quad-board-${useId().replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const curveRef = useRef<JXG.Functiongraph | null>(null);
  const pointsRef = useRef<{ el: JXG.Point; extra: number }[]>([]);
  const nativeFullscreenRef = useRef(false);

  const [params, setParams] = useStoredSimulationState(
    "quadratic.params",
    initialParams,
  );
  const [style, setStyle] = useStoredSimulationState(
    "quadratic.style",
    initialStyle,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const paramsRef = useRef<Params>(params);
  const styleRef = useRef<Style>(style);
  styleRef.current = style;

  const updateParam = (key: keyof Params, value: number) => {
    const next = { ...paramsRef.current, [key]: round1(value) };
    paramsRef.current = next;
    setParams(next);
    boardRef.current?.update();
  };

  const reset = () => {
    paramsRef.current = initialParams;
    setParams(initialParams);
    boardRef.current?.update();
  };

  const changeStyle = (key: keyof Style, delta: number) => {
    const range = key === "curveWidth" ? CURVE_WIDTH_RANGE : POINT_SIZE_RANGE;
    setStyle({ ...style, [key]: clamp(style[key] + delta, range) });
  };

  const resetView = () => boardRef.current?.setBoundingBox(initialBox, true);
  const zoomIn = () => boardRef.current?.zoomIn();
  const zoomOut = () => boardRef.current?.zoomOut();

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
      // Geser dengan tahan klik kiri (atau satu jari), zoom dengan scroll/pinch.
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

    // Grid ikut bergeser dan zoom bersama grafik.
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

    // Kurva pembanding y = x² (tanpa batas domain, mengikuti area yang terlihat)
    board.create("functiongraph", [(x: number) => x * x], {
      strokeColor: "#9aa8b0",
      strokeWidth: 1.5,
      dash: 3,
      highlight: false,
    });

    // Sumbu simetri: garis vertikal tak berhingga
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

    // Saat ukuran kontainer berubah (mis. layar penuh), pertahankan skala
    // dan titik tengah tampilan agar grafik tidak melompat.
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
      el.setAttribute({ size: clamp(style.pointSize, POINT_SIZE_RANGE) + extra }),
    );
    boardRef.current?.update();
  }, [style]);

  const { a, b, c } = params;
  const isQuadratic = a !== 0;
  const discriminant = b * b - 4 * a * c;
  const vx = isQuadratic ? -b / (2 * a) : null;
  const vy = isQuadratic && vx !== null ? a * vx * vx + b * vx + c : null;

  let rootsText = "—";
  let rootsNote = "";
  if (isQuadratic) {
    if (discriminant > 0) {
      const r1 = (-b - Math.sqrt(discriminant)) / (2 * a);
      const r2 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const [lo, hi] = r1 < r2 ? [r1, r2] : [r2, r1];
      rootsText = `${formatValue(lo)} dan ${formatValue(hi)}`;
      rootsNote = "Memotong sumbu x di dua titik";
    } else if (discriminant === 0) {
      rootsText = formatValue(-b / (2 * a));
      rootsNote = "Menyinggung sumbu x";
    } else {
      rootsText = "Tidak ada";
      rootsNote = "Tidak memotong sumbu x";
    }
  }

  const widthText =
    Math.abs(a) > 1 ? "lebih sempit" : Math.abs(a) < 1 ? "lebih lebar" : "sama";

  return (
    <div
      ref={rootRef}
      className={`quadratic-simulation${isFullscreen ? " is-fullscreen" : ""}`}
    >
      <div className="quad-boards">
        <section className="quad-board-panel" aria-labelledby="quad-title">
          <div className="quad-board-heading">
            <h3 id="quad-title">Grafik fungsi kuadrat</h3>
            <span className="quad-equation">{equationLabel(params)}</span>
            <div className="quad-view-tools" role="group" aria-label="Tampilan">
              <button type="button" onClick={zoomIn} aria-label="Perbesar">
                +
              </button>
              <button type="button" onClick={zoomOut} aria-label="Perkecil">
                −
              </button>
              <button type="button" onClick={resetView}>
                Pusatkan
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-pressed={isFullscreen}
              >
                {isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
              </button>
            </div>
          </div>
          <div
            className="quad-board"
            id={boardId}
            ref={containerRef}
            aria-label="Grafik fungsi kuadrat y = ax² + bx + c. Ubah nilai a, b, dan c dengan penggeser. Tahan klik kiri lalu seret untuk menggeser grafik, gulir untuk memperbesar."
          />
          <div className="quad-legend" aria-label="Legenda grafik">
            <span>
              <i className="legend-curve" /> y = ax² + bx + c
            </span>
            <span>
              <i className="legend-ref" /> y = x² (pembanding)
            </span>
            <span>
              <i className="legend-axis" /> sumbu simetri
            </span>
            <span>
              <b className="dot-vertex" /> puncak
            </span>
            <span>
              <b className="dot-root" /> akar
            </span>
            <span>
              <b className="dot-c" /> titik potong sumbu y
            </span>
          </div>
        </section>

        <section className="quad-controls" aria-label="Pengatur koefisien">
          {(
            [
              {
                key: "a",
                min: -5,
                max: 5,
                hint: "Arah & kelebaran parabola",
              },
              {
                key: "b",
                min: -10,
                max: 10,
                hint: "Menggeser sumbu simetri",
              },
              {
                key: "c",
                min: -10,
                max: 10,
                hint: "Titik potong sumbu y",
              },
            ] as const
          ).map(({ key, min, max, hint }) => (
            <div className={`quad-slider quad-slider-${key}`} key={key}>
              <label htmlFor={`quad-${key}`}>
                {key} <small>{hint}</small>
              </label>
              <output htmlFor={`quad-${key}`} aria-live="polite">
                {formatValue(params[key])}
              </output>
              <input
                id={`quad-${key}`}
                type="range"
                min={min}
                max={max}
                step="0.1"
                value={params[key]}
                aria-valuetext={`${key} sama dengan ${formatValue(params[key])}`}
                onChange={(event) =>
                  updateParam(key, Number(event.currentTarget.value))
                }
              />
              <div className="quad-range-labels" aria-hidden="true">
                <span>{min}</span>
                <span>0</span>
                <span>{max}</span>
              </div>
            </div>
          ))}

          <button className="quad-reset-button" type="button" onClick={reset}>
            Atur ulang
          </button>

          <div className="quad-style" role="group" aria-label="Gaya grafik">
            {(
              [
                {
                  key: "curveWidth",
                  label: "Ketebalan grafik",
                  range: CURVE_WIDTH_RANGE,
                },
                {
                  key: "pointSize",
                  label: "Ukuran titik",
                  range: POINT_SIZE_RANGE,
                },
              ] as const
            ).map(({ key, label, range }) => (
              <div className="quad-stepper" key={key}>
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => changeStyle(key, -1)}
                  disabled={style[key] <= range[0]}
                  aria-label={`Kurangi ${label.toLowerCase()}`}
                >
                  −
                </button>
                <output aria-live="polite">{style[key]}</output>
                <button
                  type="button"
                  onClick={() => changeStyle(key, 1)}
                  disabled={style[key] >= range[1]}
                  aria-label={`Tambah ${label.toLowerCase()}`}
                >
                  +
                </button>
              </div>
            ))}
          </div>

          <dl className="quad-readouts" aria-live="polite">
            <div className="readout-a">
              <dt>Arah parabola</dt>
              <dd>
                {!isQuadratic
                  ? "—"
                  : a > 0
                    ? "Terbuka ke atas"
                    : "Terbuka ke bawah"}
              </dd>
            </div>
            <div className="readout-vertex">
              <dt>Titik puncak</dt>
              <dd>
                {vx === null || vy === null
                  ? "—"
                  : `(${formatValue(vx)}, ${formatValue(vy)})`}
              </dd>
            </div>
            <div className="readout-b">
              <dt>Sumbu simetri</dt>
              <dd>{vx === null ? "—" : `x = ${formatValue(vx)}`}</dd>
            </div>
            <div className="readout-c">
              <dt>Titik potong sumbu y</dt>
              <dd>{`(0, ${formatValue(c)})`}</dd>
            </div>
            <div className="readout-d">
              <dt>Diskriminan (D = b² − 4ac)</dt>
              <dd>{isQuadratic ? formatValue(discriminant) : "—"}</dd>
            </div>
            <div className="readout-roots">
              <dt>Akar-akar</dt>
              <dd>{rootsText}</dd>
              {rootsNote && <small>{rootsNote}</small>}
            </div>
          </dl>

          {!isQuadratic && (
            <p className="quad-warning" role="status">
              Saat a = 0, persamaan menjadi garis lurus (bukan fungsi
              kuadrat). Geser a menjauhi 0 untuk melihat parabola.
            </p>
          )}
        </section>
      </div>

      <ul className="quad-insights">
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