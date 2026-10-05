import { useEffect, useId, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./QuadraticSimulation.css";

type Params = { a: number; b: number; c: number };

const initialParams: Params = { a: 1, b: -2, c: -3 };
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

export function QuadraticSimulation() {
  const boardId = `quad-board-${useId().replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<ReturnType<typeof JXG.JSXGraph.initBoard> | null>(
    null,
  );
  const paramsRef = useRef<Params>(initialParams);
  const [params, setParams] = useState<Params>(initialParams);

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
      boundingbox: [-10, 10, 10, -10],
      axis: false,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: true,
      pan: { enabled: false },
      zoom: { wheel: false },
    });
    boardRef.current = board;

    const axisStyle = {
      strokeColor: "#63727d",
      strokeWidth: 1.2,
      highlight: false,
    };
    const ticks = {
      ticksDistance: 2,
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

    // Kurva pembanding y = x²
    board.create("functiongraph", [(x: number) => x * x, -10, 10], {
      strokeColor: "#9aa8b0",
      strokeWidth: 1.5,
      dash: 3,
      highlight: false,
    });

    // Sumbu simetri
    board.create(
      "segment",
      [
        [() => vertexX(), -60],
        [() => vertexX(), 60],
      ],
      {
        strokeColor: colors.b,
        strokeWidth: 1.2,
        dash: 2,
        highlight: false,
        fixed: true,
      },
    );

    // Kurva utama
    board.create("functiongraph", [f, -10, 10], {
      strokeColor: colors.curve,
      strokeWidth: 3,
      highlight: false,
    });

    const dot = (x: () => number, y: () => number, color: string, size = 4) =>
      board.create("point", [x, y], {
        name: "",
        withLabel: false,
        size,
        fillColor: color,
        strokeColor: "#ffffff",
        strokeWidth: 1.5,
        fixed: true,
        highlight: false,
      });

    dot(
      () => 0,
      () => p().c,
      colors.c,
      5,
    );
    dot(root(1), () => 0, colors.root);
    dot(root(-1), () => 0, colors.root);
    dot(
      () => vertexX(),
      () => (p().a === 0 ? Number.NaN : f(vertexX())),
      colors.vertex,
      5,
    );

    const observer = new ResizeObserver(() => {
      const el = containerRef.current;
      if (el && el.clientWidth > 0 && el.clientHeight > 0) {
        board.resizeContainer(el.clientWidth, el.clientHeight, true);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
    };
  }, [boardId]);

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
    <div className="quadratic-simulation">
      <div className="quad-boards">
        <section className="quad-board-panel" aria-labelledby="quad-title">
          <div className="quad-board-heading">
            <h3 id="quad-title">Grafik fungsi kuadrat</h3>
            <span className="quad-equation">{equationLabel(params)}</span>
          </div>
          <div
            className="quad-board"
            id={boardId}
            ref={containerRef}
            aria-label="Grafik fungsi kuadrat y = ax² + bx + c. Ubah nilai a, b, dan c dengan penggeser."
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
        </section>
      </div>

      {!isQuadratic && (
        <p className="quad-warning" role="status">
          Saat a = 0, persamaan menjadi garis lurus (bukan fungsi kuadrat).
          Geser a menjauhi 0 untuk melihat parabola.
        </p>
      )}

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
