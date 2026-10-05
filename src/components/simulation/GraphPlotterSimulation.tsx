import { useEffect, useId, useMemo, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./GraphPlotterSimulation.css";
import { findRoots, parseLatex } from "./latexMath";

type Slot = { src: string; on: boolean };
type Pt = { x: number; y: number };
type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;
type PairResult = { i: number; j: number; pts: Pt[]; coincident: boolean };
type AxisResult = { i: number; yInt: Pt | null; xInts: Pt[] };
type Results = { pairs: PairResult[]; axes: AxisResult[] };

const SLOT_COLORS = ["#087f8c", "#d16b36", "#6b4e9b"];
const INTER_COLOR = "#b23a48";
const INTER_POOL = 24;
const AXIS_POOL = 7; // 1 titik potong sumbu y + maksimal 6 akar per grafik
const HOME_BOX: [number, number, number, number] = [-10, 10, 10, -10];

const initialSlots: Slot[] = [
  { src: "x^{2}", on: true },
  { src: "2x+3", on: true },
  { src: "", on: true },
];

const PLACEHOLDERS = ["x^{2}-2", "\\frac{x+1}{2}", "e^{-x}"];

const PRESETS: { label: string; srcs: [string, string, string] }[] = [
  { label: "Parabola & garis", srcs: ["x^{2}", "2x+3", ""] },
  { label: "eˣ, ln x, y = x", srcs: ["e^{x}", "\\ln x", "x"] },
  { label: "sin, cos, ½", srcs: ["\\sin x", "\\cos x", "\\frac{1}{2}"] },
  { label: "1/x, parabola, akar", srcs: ["\\frac{1}{x}", "x^{2}-2", "\\sqrt{x}"] },
];

// § menandai posisi kursor setelah disisipkan
const SNIPPETS: { label: string; title: string; text: string }[] = [
  { label: "xⁿ", title: "Pangkat", text: "^{§}" },
  { label: "a/b", title: "Pecahan", text: "\\frac{§}{}" },
  { label: "√", title: "Akar kuadrat", text: "\\sqrt{§}" },
  { label: "ⁿ√", title: "Akar pangkat n", text: "\\sqrt[§]{}" },
  { label: "eˣ", title: "Eksponen basis e", text: "e^{§}" },
  { label: "π", title: "Pi", text: "\\pi§" },
  { label: "|x|", title: "Nilai mutlak", text: "\\left|§\\right|" },
  { label: "sin", title: "Sinus", text: "\\sin(§)" },
  { label: "cos", title: "Kosinus", text: "\\cos(§)" },
  { label: "tan", title: "Tangen", text: "\\tan(§)" },
  { label: "ln", title: "Logaritma natural", text: "\\ln(§)" },
  { label: "log", title: "Logaritma basis tertentu", text: "\\log_{§}()" },
];

function fmt(value: number, digits = 4) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < Math.pow(10, -digits) / 2) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
    useGrouping: false,
  }).format(value);
}

function ptText(p: Pt) {
  return `(${fmt(p.x)}; ${fmt(p.y)})`;
}

export function GraphPlotterSimulation() {
  const boardId = `plot-board-${useId().replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);
  const fnsRef = useRef<(((x: number) => number) | null)[]>([null, null, null]);
  const interRef = useRef<Pt[]>([]);
  const axisRef = useRef<Pt[][]>([[], [], []]);
  const showInterRef = useRef(true);
  const showAxisRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastKeyRef = useRef("");

  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [active, setActive] = useState(0);
  const [showInter, setShowInter] = useState(true);
  const [showAxis, setShowAxis] = useState(false);
  const [results, setResults] = useState<Results>({ pairs: [], axes: [] });

  const parsed = useMemo(() => slots.map((slot) => parseLatex(slot.src)), [slots]);

  const setSlot = (index: number, patch: Partial<Slot>) =>
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));

  // Hitung titik potong pada rentang x yang sedang terlihat
  const recompute = () => {
    const board = boardRef.current;
    if (!board) return;
    const [x1, , x2] = board.getBoundingBox();
    const fns = fnsRef.current;

    const pairs: PairResult[] = [];
    const flat: Pt[] = [];
    (
      [
        [0, 1],
        [0, 2],
        [1, 2],
      ] as const
    ).forEach(([i, j]) => {
      const fi = fns[i];
      const fj = fns[j];
      if (!fi || !fj) return;
      const { roots, coincident } = findRoots((x) => fi(x) - fj(x), x1, x2);
      const pts = roots
        .map((x) => ({ x, y: (fi(x) + fj(x)) / 2 }))
        .filter((p) => Number.isFinite(p.y));
      pairs.push({ i, j, pts, coincident });
      pts.forEach((p) => flat.push(p));
    });

    const axes: AxisResult[] = [];
    const axisPts: Pt[][] = [[], [], []];
    fns.forEach((fn, i) => {
      if (!fn) return;
      const y0 = fn(0);
      const yInt = Number.isFinite(y0) ? { x: 0, y: y0 } : null;
      const { roots, coincident } = findRoots(fn, x1, x2);
      const xInts = coincident ? [] : roots.map((x) => ({ x, y: 0 }));
      axes.push({ i, yInt, xInts });
      if (yInt) axisPts[i].push(yInt);
      xInts.slice(0, AXIS_POOL - 1).forEach((p) => axisPts[i].push(p));
    });

    interRef.current = flat.slice(0, INTER_POOL);
    axisRef.current = axisPts;
    board.update();

    const key = JSON.stringify({ pairs, axes });
    if (key !== lastKeyRef.current) {
      lastKeyRef.current = key;
      setResults({ pairs, axes });
    }
  };

  const scheduleRecompute = () => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      recompute();
    });
  };

  const zoomIn = () => {
    boardRef.current?.zoomIn();
    scheduleRecompute();
  };
  const zoomOut = () => {
    boardRef.current?.zoomOut();
    scheduleRecompute();
  };
  const resetView = () => {
    boardRef.current?.setBoundingBox(HOME_BOX, true);
    scheduleRecompute();
  };

  const insertSnippet = (snippet: string) => {
    const index = active;
    const el = inputRefs.current[index];
    const cursor = snippet.indexOf("§");
    const clean = snippet.replace("§", "");
    const src = slots[index].src;
    const start = el?.selectionStart ?? src.length;
    const end = el?.selectionEnd ?? start;
    setSlot(index, { src: src.slice(0, start) + clean + src.slice(end), on: true });
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + (cursor >= 0 ? cursor : clean.length);
      el?.setSelectionRange(pos, pos);
    });
  };

  const applyPreset = (srcs: [string, string, string]) => {
    setSlots(srcs.map((src) => ({ src, on: true })));
    resetView();
  };

  useEffect(() => {
    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: HOME_BOX,
      axis: false,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: true,
      pan: { enabled: true, needTwoFingers: true },
      zoom: { wheel: true, needShift: true, factorX: 1.25, factorY: 1.25 },
    });
    boardRef.current = board;

    const axisStyle = {
      strokeColor: "#63727d",
      strokeWidth: 1.4,
      highlight: false,
    };
    // majorHeight: -1 membuat tanda sumbu memanjang menjadi garis kisi yang ikut zoom/geser
    const ticks = {
      insertTicks: true,
      minorTicks: 0,
      majorHeight: -1,
      drawZero: false,
      strokeColor: "rgba(72, 101, 103, 0.14)",
      strokeWidth: 1,
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

    SLOT_COLORS.forEach((color, i) => {
      board.create(
        "functiongraph",
        [
          (x: number) => {
            const fn = fnsRef.current[i];
            return fn ? fn(x) : Number.NaN;
          },
        ],
        { strokeColor: color, strokeWidth: 3, highlight: false },
      );
    });

    const marker = (
      x: () => number,
      y: () => number,
      color: string,
      size: number,
      info: boolean,
    ) =>
      board.create("point", [x, y], {
        name: "",
        withLabel: false,
        size,
        fillColor: color,
        strokeColor: "#ffffff",
        strokeWidth: 1.5,
        highlightFillColor: color,
        highlightStrokeColor: "#ffffff",
        fixed: true,
        highlight: info,
        showInfobox: info,
        infoboxDigits: 4,
      });

    // titik potong sumbu (per grafik)
    SLOT_COLORS.forEach((color, i) => {
      for (let k = 0; k < AXIS_POOL; k += 1) {
        marker(
          () => (showAxisRef.current ? (axisRef.current[i][k]?.x ?? Number.NaN) : Number.NaN),
          () => (showAxisRef.current ? (axisRef.current[i][k]?.y ?? Number.NaN) : Number.NaN),
          color,
          3.5,
          true,
        );
      }
    });
    // titik potong antargrafik
    for (let k = 0; k < INTER_POOL; k += 1) {
      marker(
        () => (showInterRef.current ? (interRef.current[k]?.x ?? Number.NaN) : Number.NaN),
        () => (showInterRef.current ? (interRef.current[k]?.y ?? Number.NaN) : Number.NaN),
        INTER_COLOR,
        5,
        true,
      );
    }

    board.on("boundingbox", scheduleRecompute);

    const observer = new ResizeObserver(() => {
      const el = containerRef.current;
      if (el && el.clientWidth > 0 && el.clientHeight > 0) {
        board.resizeContainer(el.clientWidth, el.clientHeight, true);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  // Sinkronkan fungsi yang aktif ke papan lalu hitung ulang titik potong
  useEffect(() => {
    fnsRef.current = slots.map((slot, i) => {
      const result = parsed[i];
      return slot.on && result && result.ok ? result.fn : null;
    });
    showInterRef.current = showInter;
    showAxisRef.current = showAxis;
    boardRef.current?.update();
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, parsed, showInter, showAxis]);

  const drawn = slots.map((slot, i) => {
    const result = parsed[i];
    return slot.on && !!result && result.ok;
  });
  const drawnCount = drawn.filter(Boolean).length;

  return (
    <div className="plotter-simulation">
      <div className="plot-boards">
        <section className="plot-board-panel" aria-labelledby="plot-title">
          <div className="plot-board-heading">
            <h3 id="plot-title">Penggambar grafik</h3>
            <div className="plot-zoom" role="group" aria-label="Zoom tampilan">
              <button type="button" onClick={zoomIn} aria-label="Perbesar" title="Perbesar">
                +
              </button>
              <button type="button" onClick={zoomOut} aria-label="Perkecil" title="Perkecil">
                −
              </button>
              <button type="button" onClick={resetView}>
                Reset tampilan
              </button>
            </div>
          </div>
          <div
            className="plot-board"
            id={boardId}
            ref={containerRef}
            aria-label="Grafik hingga tiga fungsi. Ketik rumus pada kolom masukan untuk menggambar dan melihat titik potong."
          />
          <div className="plot-legend" aria-label="Legenda grafik">
            {SLOT_COLORS.map((color, i) =>
              drawn[i] ? (
                <span key={color}>
                  <i style={{ borderTopColor: color }} /> Grafik {i + 1}
                </span>
              ) : null,
            )}
            <span>
              <b className="dot-inter" /> titik potong antargrafik
            </span>
            {showAxis && (
              <span>
                <b className="dot-axis" /> titik potong sumbu
              </span>
            )}
          </div>
          <p className="plot-hint">
            Geser grafik dengan menyeret, zoom dengan Shift + roda mouse atau tombol +/−.
            Arahkan atau ketuk titik untuk melihat koordinatnya.
          </p>
        </section>

        <section className="plot-controls" aria-label="Masukan fungsi">
          {slots.map((slot, i) => {
            const result = parsed[i];
            const inputId = `plot-src-${i}`;
            const statusId = `plot-status-${i}`;
            const isError = !!result && !result.ok;
            return (
              <div className="plot-slot" key={i}>
                <div className="plot-slot-head">
                  <label htmlFor={inputId}>
                    <span className="plot-swatch" style={{ background: SLOT_COLORS[i] }} />
                    Grafik {i + 1}: <em>y =</em>
                  </label>
                  <label className="plot-toggle">
                    <input
                      type="checkbox"
                      checked={slot.on}
                      onChange={(event) => setSlot(i, { on: event.currentTarget.checked })}
                    />
                    tampil
                  </label>
                </div>
                <input
                  id={inputId}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  className="plot-input"
                  type="text"
                  value={slot.src}
                  placeholder={PLACEHOLDERS[i]}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  aria-invalid={isError}
                  aria-describedby={statusId}
                  style={{ borderLeftColor: SLOT_COLORS[i] }}
                  onFocus={() => setActive(i)}
                  onChange={(event) => setSlot(i, { src: event.currentTarget.value })}
                />
                <p id={statusId} className={`plot-status${isError ? " is-error" : ""}`}>
                  {!result
                    ? "Kosong: grafik tidak digambar."
                    : result.ok
                      ? `Terbaca: y = ${result.text}`
                      : result.error}
                </p>
              </div>
            );
          })}

          <div className="plot-palette">
            <span id="plot-palette-label">
              Sisipkan ke Grafik {active + 1}
            </span>
            <div className="plot-palette-buttons" role="group" aria-labelledby="plot-palette-label">
              {SNIPPETS.map((snippet) => (
                <button
                  key={snippet.label}
                  type="button"
                  title={snippet.title}
                  aria-label={snippet.title}
                  onClick={() => insertSnippet(snippet.text)}
                >
                  {snippet.label}
                </button>
              ))}
            </div>
          </div>

          <div className="plot-options">
            <label>
              <input
                type="checkbox"
                checked={showInter}
                onChange={(event) => setShowInter(event.currentTarget.checked)}
              />
              Titik potong antargrafik
            </label>
            <label>
              <input
                type="checkbox"
                checked={showAxis}
                onChange={(event) => setShowAxis(event.currentTarget.checked)}
              />
              Titik potong sumbu x dan y
            </label>
          </div>

          <div className="plot-presets">
            <span id="plot-presets-label">Contoh cepat</span>
            <div className="plot-presets-buttons" role="group" aria-labelledby="plot-presets-label">
              {PRESETS.map((preset) => (
                <button key={preset.label} type="button" onClick={() => applyPreset(preset.srcs)}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {drawnCount < 2 && (
        <p className="plot-warning" role="status">
          Aktifkan dan isi minimal dua grafik untuk melihat titik potong antargrafik.
        </p>
      )}

      <dl className="plot-readouts" aria-live="polite">
        {([
          [0, 1],
          [0, 2],
          [1, 2],
        ] as const).map(([i, j]) => {
          const pair = results.pairs.find((p) => p.i === i && p.j === j);
          const both = drawn[i] && drawn[j] && !!pair;
          return (
            <div className="readout-pair" key={`${i}-${j}`}>
              <dt>
                <span className="plot-swatch" style={{ background: SLOT_COLORS[i] }} />
                <span className="plot-swatch" style={{ background: SLOT_COLORS[j] }} />
                Grafik {i + 1} ∩ Grafik {j + 1}
              </dt>
              {!both || !pair ? (
                <dd>—</dd>
              ) : pair.coincident ? (
                <dd className="plot-same">Berimpit</dd>
              ) : pair.pts.length === 0 ? (
                <dd className="plot-none">Tidak berpotongan</dd>
              ) : (
                <dd>
                  {pair.pts.slice(0, 8).map((p, k) => (
                    <span className="plot-point" key={k}>
                      {ptText(p)}
                    </span>
                  ))}
                </dd>
              )}
              {both && pair && !pair.coincident && (
                <small>
                  {pair.pts.length > 8
                    ? `${pair.pts.length} titik (8 pertama ditampilkan)`
                    : `${pair.pts.length} titik pada tampilan`}
                </small>
              )}
            </div>
          );
        })}
      </dl>

      {showAxis && results.axes.length > 0 && (
        <div className="plot-axis-table-wrap">
          <table className="plot-axis-table">
            <caption>Titik potong dengan sumbu koordinat (pada rentang x yang terlihat)</caption>
            <thead>
              <tr>
                <th scope="col">Grafik</th>
                <th scope="col">Sumbu y</th>
                <th scope="col">Sumbu x</th>
              </tr>
            </thead>
            <tbody>
              {results.axes.map((axis) => (
                <tr key={axis.i}>
                  <th scope="row">
                    <span className="plot-swatch" style={{ background: SLOT_COLORS[axis.i] }} />
                    {axis.i + 1}
                  </th>
                  <td>{axis.yInt ? ptText(axis.yInt) : "tidak ada"}</td>
                  <td>
                    {axis.xInts.length === 0
                      ? "tidak ada"
                      : axis.xInts
                          .slice(0, 6)
                          .map((p) => ptText(p))
                          .join("  ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <details className="plot-guide">
        <summary>Panduan notasi LaTeX yang didukung</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Yang ingin ditulis</th>
              <th scope="col">Ketik</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pangkat</td>
              <td>
                <code>x^2</code>, <code>x^{"{-3}"}</code>, <code>2^x</code>
              </td>
            </tr>
            <tr>
              <td>Pecahan</td>
              <td>
                <code>{"\\frac{x+1}{x-2}"}</code>
              </td>
            </tr>
            <tr>
              <td>Akar</td>
              <td>
                <code>{"\\sqrt{x+1}"}</code>, <code>{"\\sqrt[3]{x}"}</code>
              </td>
            </tr>
            <tr>
              <td>Bilangan euler dan π</td>
              <td>
                <code>{"e^{x}"}</code>, <code>{"e^{-x^2}"}</code>, <code>{"\\pi"}</code>
              </td>
            </tr>
            <tr>
              <td>Trigonometri (radian)</td>
              <td>
                <code>{"\\sin x"}</code>, <code>{"\\sin^2 x"}</code>, <code>{"\\cos(2x)"}</code>,{" "}
                <code>{"\\sin^{-1} x"}</code>
              </td>
            </tr>
            <tr>
              <td>Logaritma</td>
              <td>
                <code>{"\\ln x"}</code>, <code>{"\\log x"}</code> (basis 10), <code>{"\\log_{2} x"}</code>
              </td>
            </tr>
            <tr>
              <td>Nilai mutlak</td>
              <td>
                <code>{"|x-3|"}</code> atau <code>{"\\left|x-3\\right|"}</code>
              </td>
            </tr>
            <tr>
              <td>Perkalian</td>
              <td>
                <code>2x</code>, <code>(x+1)(x-1)</code>, <code>{"x\\cdot 2"}</code>
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          Gunakan kurung kurawal untuk pangkat lebih dari satu karakter, misalnya{" "}
          <code>{"x^{10}"}</code>. Variabel hanya x; awalan <code>y =</code> atau{" "}
          <code>f(x) =</code> boleh ditulis. Akar ganjil bilangan negatif dihitung, jadi{" "}
          <code>{"x^{1/3}"}</code> terdefinisi untuk x negatif.
        </p>
      </details>

      <ul className="plot-insights">
        <li>
          <strong style={{ color: INTER_COLOR }}>Titik potong</strong> adalah nilai x yang
          memenuhi f₁(x) = f₂(x). Program mencarinya secara numerik pada rentang x yang
          sedang terlihat, jadi geser atau zoom out untuk menemukan titik di luar layar.
        </li>
        <li>
          <strong style={{ color: SLOT_COLORS[0] }}>Membandingkan grafik:</strong> matikan
          salah satu grafik dengan kotak “tampil”, atau coba contoh cepat seperti eˣ dan ln x
          bersama y = x untuk melihat dua fungsi invers saling mencerminkan.
        </li>
        <li>
          <strong style={{ color: SLOT_COLORS[1] }}>Asimtot dan lubang:</strong> titik tidak
          ditandai di tempat fungsi tidak terdefinisi, misalnya x = 0 pada 1/x atau
          x = π/2 pada tan x.
        </li>
      </ul>

    </div>
  );
}
