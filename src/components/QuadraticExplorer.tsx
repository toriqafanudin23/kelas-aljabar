import { useCallback, useEffect, useId, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./QuadraticExplorer.css";

interface Coefficients {
  a: number;
  b: number;
  c: number;
}

const initialCoefficients: Coefficients = { a: 1, b: -2, c: -3 };
const viewRadius = 10;

const COLORS = {
  curve: "#087f8c",
  vertex: "#b45309",
  root: "#c24136",
  intercept: "#6d46b8",
  axis: "#526773",
  label: "#435762",
  grid: "rgba(82, 103, 115, 0.16)",
};

const ranges = {
  a: { min: -3, max: 3 },
  b: { min: -6, max: 6 },
  c: { min: -6, max: 6 },
} as const;

const presets: { label: string; values: Coefficients }[] = [
  { label: "Dua akar", values: { a: 1, b: -2, c: -3 } },
  { label: "Satu akar", values: { a: 1, b: -4, c: 4 } },
  { label: "Tanpa akar", values: { a: 1, b: 0, c: 2 } },
  { label: "Terbuka ke bawah", values: { a: -1, b: 2, c: 3 } },
  { label: "Linear (a = 0)", values: { a: 0, b: 1, c: -2 } },
];

const round1 = (v: number) => Math.round(v * 10) / 10;
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function fmt(value: number) {
  const r = Math.round(value * 100) / 100;
  return (Object.is(r, -0) ? "0" : String(r)).replace("-", "−");
}

function equationOf({ a, b, c }: Coefficients) {
  const terms = [
    { coef: a, sym: "x²" },
    { coef: b, sym: "x" },
    { coef: c, sym: "" },
  ].filter((t) => t.coef !== 0);
  if (terms.length === 0) return "y = 0";
  const text = terms
    .map((t, i) => {
      const abs = Math.abs(t.coef);
      const num = abs === 1 && t.sym ? "" : fmt(abs);
      if (i === 0) return `${t.coef < 0 ? "−" : ""}${num}${t.sym}`;
      return ` ${t.coef < 0 ? "−" : "+"} ${num}${t.sym}`;
    })
    .join("");
  return `y = ${text}`;
}

interface Analysis {
  d: number;
  vertex: { x: number; y: number } | null;
  roots: number[];
}

function analyze({ a, b, c }: Coefficients): Analysis {
  const d = Math.round((b * b - 4 * a * c) * 1e6) / 1e6;
  if (a === 0) {
    return { d, vertex: null, roots: b === 0 ? [] : [-c / b] };
  }
  const x = -b / (2 * a);
  const y = a * x * x + b * x + c;
  let roots: number[] = [];
  if (d === 0) roots = [x];
  else if (d > 0) {
    roots = [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)].sort(
      (p, q) => p - q,
    );
  }
  return { d, vertex: { x, y }, roots };
}

export function QuadraticExplorer() {
  const boardId = `quadratic-board-${useId().replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<ReturnType<typeof JXG.JSXGraph.initBoard> | null>(
    null,
  );
  const vertexRef = useRef<JXG.Point | null>(null);
  const coefficientsRef = useRef(initialCoefficients);
  const analysisRef = useRef<Analysis>(analyze(initialCoefficients));
  const [coefficients, setCoefficients] = useState(initialCoefficients);

  const applyCoefficients = useCallback((next: Coefficients) => {
    coefficientsRef.current = next;
    const analysis = analyze(next);
    analysisRef.current = analysis;
    setCoefficients(next);

    const vertex = vertexRef.current;
    if (vertex) {
      if (analysis.vertex) {
        vertex.setPosition(JXG.COORDS_BY_USER, [
          analysis.vertex.x,
          analysis.vertex.y,
        ]);
        vertex.showElement();
      } else {
        vertex.hideElement();
      }
    }
    boardRef.current?.update();
  }, []);

  useEffect(() => {
    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: [-viewRadius, viewRadius, viewRadius, -viewRadius],
      axis: false,
      grid: false,
      keepAspectRatio: true,
      showCopyright: false,
      showNavigation: false,
      pan: { enabled: true, needTwoFingers: false },
      zoom: {
        wheel: true,
        needShift: false,
        factorX: 1.15,
        factorY: 1.15,
      },
    });
    boardRef.current = board;

    const axisStyle = {
      strokeColor: COLORS.axis,
      strokeWidth: 1.5,
      highlight: false,
    };
    const tickStyle = {
      insertTicks: true,
      ticksDistance: 1,
      minTicksDistance: 26,
      minorTicks: 0,
      majorHeight: 8,
      strokeColor: COLORS.axis,
      label: { strokeColor: COLORS.label, fontSize: 12, highlight: false },
    };

    const xAxis = board.create(
      "axis",
      [
        [0, 0],
        [1, 0],
      ],
      {
        ...axisStyle,
        name: "x",
        withLabel: true,
        label: { strokeColor: COLORS.label, fontSize: 14 },
        ticks: { ...tickStyle, drawZero: true },
      },
    );
    const yAxis = board.create(
      "axis",
      [
        [0, 0],
        [0, 1],
      ],
      {
        ...axisStyle,
        name: "y",
        withLabel: true,
        label: { strokeColor: COLORS.label, fontSize: 14 },
        ticks: { ...tickStyle, drawZero: false },
      },
    );

    // Garis grid ikut menyesuaikan tingkat zoom, selaras dengan angka di sumbu.
    const gridStyle = {
      insertTicks: true,
      minTicksDistance: 26,
      majorHeight: -1,
      minorTicks: 0,
      drawLabels: false,
      drawZero: false,
      strokeColor: COLORS.grid,
      strokeWidth: 1,
      highlight: false,
      layer: 1,
    };
    board.create("ticks", [xAxis, 1], gridStyle);
    board.create("ticks", [yAxis, 1], gridStyle);

    // Sumbu simetri
    const symX = () => analysisRef.current.vertex?.x ?? NaN;
    board.create(
      "line",
      [
        [symX, 0],
        [symX, 1],
      ],
      {
        straightFirst: true,
        straightLast: true,
        dash: 2,
        strokeColor: COLORS.vertex,
        strokeOpacity: 0.5,
        strokeWidth: 1.5,
        fixed: true,
        highlight: false,
        layer: 4,
      },
    );

    // Kurva
    board.create(
      "functiongraph",
      [
        (x: number) => {
          const { a, b, c } = coefficientsRef.current;
          return a * x ** 2 + b * x + c;
        },
      ],
      {
        strokeColor: COLORS.curve,
        strokeWidth: 3.5,
        highlight: false,
        cssClass: "quadratic-explorer-curve",
        highlightCssClass: "quadratic-explorer-curve",
        layer: 6,
      },
    );

    const dot = (color: string) => ({
      name: "",
      withLabel: false,
      size: 5,
      face: "o",
      fillColor: color,
      strokeColor: "#ffffff",
      strokeWidth: 2,
      highlightFillColor: color,
      highlightStrokeColor: "#18313d",
      fixed: true,
      layer: 10,
    });

    // Titik potong sumbu y
    board.create(
      "point",
      [0, () => coefficientsRef.current.c],
      dot(COLORS.intercept),
    );

    // Akar-akar (NaN = tidak digambar)
    board.create(
      "point",
      [() => analysisRef.current.roots[0] ?? NaN, 0],
      dot(COLORS.root),
    );
    board.create(
      "point",
      [() => analysisRef.current.roots[1] ?? NaN, 0],
      dot(COLORS.root),
    );

    // Titik puncak: bisa diseret
    const v0 = analysisRef.current.vertex!;
    const vertex = board.create("point", [v0.x, v0.y], {
      ...dot(COLORS.vertex),
      size: 7,
      fixed: false,
      highlightStrokeColor: "#ffffff",
      layer: 12,
    }) as JXG.Point;
    vertexRef.current = vertex;

    vertex.on("drag", () => {
      const { a } = coefficientsRef.current;
      if (a === 0) return;
      const h = vertex.X();
      const k = vertex.Y();
      const b = clamp(round1(-2 * a * h), ranges.b.min, ranges.b.max);
      const c = clamp(round1(k + a * h * h), ranges.c.min, ranges.c.max);
      applyCoefficients({ a, b, c });
    });

    const el = containerRef.current;
    const observer = el
      ? new ResizeObserver(() => {
          if (el.clientWidth > 0 && el.clientHeight > 0) {
            board.resizeContainer(el.clientWidth, el.clientHeight, true);
          }
        })
      : null;
    if (el) observer?.observe(el);

    return () => {
      observer?.disconnect();
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
      vertexRef.current = null;
    };
  }, [boardId, applyCoefficients]);

  const updateCoefficient = (key: keyof Coefficients, value: number) =>
    applyCoefficients({ ...coefficientsRef.current, [key]: round1(value) });

  const zoomIn = () => boardRef.current?.zoomIn();
  const zoomOut = () => boardRef.current?.zoomOut();
  const resetView = () =>
    boardRef.current?.setBoundingBox(
      [-viewRadius, viewRadius, viewRadius, -viewRadius],
      true,
    );

  const { a, c } = coefficients;
  const info = analyze(coefficients);

  let rootsText = "Tidak ada akar real";
  if (info.roots.length === 1) rootsText = `x = ${fmt(info.roots[0])}`;
  if (info.roots.length === 2)
    rootsText = `x₁ = ${fmt(info.roots[0])},  x₂ = ${fmt(info.roots[1])}`;

  return (
    <div className="quadratic-explorer">
      <header className="quadratic-explorer-header" aria-live="polite">
        <strong className="quadratic-explorer-equation">
          {equationOf(coefficients)}
        </strong>
        <span className="quadratic-explorer-subtitle">
          {a === 0
            ? "a = 0, sehingga fungsi menjadi linear."
            : a > 0
              ? "Parabola terbuka ke atas"
              : "Parabola terbuka ke bawah"}
        </span>
      </header>

      <div className="quadratic-explorer-layout">
        <div className="quadratic-explorer-stage">
          <div
            id={boardId}
            ref={containerRef}
            className="quadratic-explorer-board jxgbox"
            aria-label="Grafik interaktif fungsi kuadrat"
          />
          <div
            className="quadratic-explorer-zoom"
            role="group"
            aria-label="Kontrol zoom"
          >
            <button type="button" onClick={zoomIn} aria-label="Perbesar">
              +
            </button>
            <button type="button" onClick={zoomOut} aria-label="Perkecil">
              −
            </button>
            <button
              type="button"
              onClick={resetView}
              aria-label="Kembalikan tampilan"
              title="Kembalikan tampilan"
            >
              ⟲
            </button>
          </div>
        </div>

        <div className="quadratic-explorer-sidebar">
          <div className="quadratic-explorer-controls">
            {(["a", "b", "c"] as const).map((key) => {
              const inputId = `${boardId}-${key}`;
              const { min, max } = ranges[key];
              return (
                <label
                  className="quadratic-explorer-control"
                  htmlFor={inputId}
                  key={key}
                >
                  <span className="quadratic-explorer-control-head">
                    <span>
                      Koefisien <strong>{key}</strong>
                    </span>
                    <output htmlFor={inputId}>{fmt(coefficients[key])}</output>
                  </span>
                  <input
                    id={inputId}
                    type="range"
                    min={min}
                    max={max}
                    step="0.1"
                    value={coefficients[key]}
                    onChange={(e) =>
                      updateCoefficient(key, Number(e.currentTarget.value))
                    }
                  />
                </label>
              );
            })}
          </div>

          <div className="quadratic-explorer-presets">
            {presets.map((p) => (
              <button
                type="button"
                key={p.label}
                onClick={() => applyCoefficients(p.values)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <dl className="quadratic-explorer-stats">
            <div style={{ ["--dot" as string]: COLORS.vertex }}>
              <dt>Titik puncak</dt>
              <dd>
                {info.vertex
                  ? `(${fmt(info.vertex.x)}, ${fmt(info.vertex.y)})`
                  : "tidak ada"}
              </dd>
            </div>
            <div style={{ ["--dot" as string]: COLORS.root }}>
              <dt>Akar</dt>
              <dd>{rootsText}</dd>
            </div>
            <div style={{ ["--dot" as string]: COLORS.intercept }}>
              <dt>Potong sumbu y</dt>
              <dd>{`(0, ${fmt(c)})`}</dd>
            </div>
            <div style={{ ["--dot" as string]: COLORS.axis }}>
              <dt>Diskriminan</dt>
              <dd>{`D = ${fmt(info.d)}`}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
