import { useEffect, useId, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./IntegralSimulation.css";
import { useStoredSimulationState } from "./useStoredSimulationState";
import { FN_KEYS, FUNCS, calcColors, type FnKey } from "./calculusFunctions";
import {
  clamp,
  createGraphBoard,
  fmt,
  observeBoardResize,
  round1,
  useSimulationFullscreen,
  type Board,
  type BoundingBox,
} from "./simulationBoard";

type Method = "left" | "right" | "mid";

type State = {
  fn: FnKey;
  a: number; // batas bawah integral
  b: number; // batas atas integral
  n: number; // banyak persegi panjang
  method: Method;
};
type Style = { curveWidth: number; pointSize: number };

type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
};

const initialState: State = { fn: "quad", a: -3, b: 3, n: 6, method: "left" };
const initialStyle: Style = { curveWidth: 3, pointSize: 4 };
const initialBox: BoundingBox = [-7, 7, 7, -7];
const CURVE_WIDTH_RANGE = [1, 8] as const;
const POINT_SIZE_RANGE = [2, 10] as const;

const METHODS: { key: Method; label: string; full: string }[] = [
  { key: "left", label: "Kiri", full: "titik kiri" },
  { key: "right", label: "Kanan", full: "titik kanan" },
  { key: "mid", label: "Tengah", full: "titik tengah" },
];

const N_STEPS = [
  1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100,
];
const ANIMATION_SPEED_FACTOR = 0.25;

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

export function IntegralSimulation() {
  const boardId = `ig-board-${useId().replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const curveRef = useRef<JXG.Functiongraph | null>(null);
  const nTimer = useRef<number | null>(null);

  const { rootRef, isFullscreen, toggleFullscreen } =
    useSimulationFullscreen();

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

  const changeStyle = (key: keyof Style, delta: number) => {
    const range = key === "curveWidth" ? CURVE_WIDTH_RANGE : POINT_SIZE_RANGE;
    setStyle({ ...style, [key]: clamp(style[key] + delta, range) });
  };

  const resetView = () => boardRef.current?.setBoundingBox(initialBox, true);
  const zoomIn = () => boardRef.current?.zoomIn();
  const zoomOut = () => boardRef.current?.zoomOut();

  useEffect(() => {
    const S = () => stRef.current;
    const F = () => FUNCS[S().fn];

    const board = createGraphBoard(boardId, initialBox);
    boardRef.current = board;

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
    curveRef.current = board.create("functiongraph", [(x: number) => F().f(x)], {
      strokeColor: calcColors.curve,
      strokeWidth: styleRef.current.curveWidth,
      highlight: false,
    });

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

    const stopObserving = observeBoardResize(board, containerRef.current);

    return () => {
      stopObserving();
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
      curveRef.current = null;
    };
  }, [boardId]);

  // Terapkan ketebalan grafik.
  useEffect(() => {
    curveRef.current?.setAttribute({
      strokeWidth: clamp(style.curveWidth, CURVE_WIDTH_RANGE),
    });
    boardRef.current?.update();
  }, [style]);

  // Bersihkan animasi saat komponen dilepas
  useEffect(
    () => () => {
      if (nTimer.current !== null) window.clearInterval(nTimer.current);
    },
    [],
  );

  const fn = FUNCS[st.fn];
  const rm = riemann(st);
  const exact = fn.F(st.b) - fn.F(st.a);
  const error = rm.sum - exact;
  const methodName = METHODS.find((m) => m.key === st.method)?.full ?? "";

  return (
    <div
      ref={rootRef}
      className={`integral-simulation${isFullscreen ? " is-fullscreen" : ""}`}
    >
      <div className="ig-boards">
        <section className="ig-board-panel" aria-labelledby="ig-title">
          <div className="ig-board-heading">
            <h3 id="ig-title">
              Jumlah Riemann di [{fmt(st.a)}, {fmt(st.b)}]
            </h3>
            <span className="ig-equation">{fn.label}</span>
            <div className="ig-view-tools" role="group" aria-label="Tampilan">
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
            className="ig-board"
            id={boardId}
            ref={containerRef}
            aria-label="Grafik fungsi f dengan n persegi panjang Riemann di antara batas a dan b. Ubah a, b, n, dan metode untuk melihat perubahan pendekatan luas. Tahan klik kiri lalu seret untuk menggeser grafik, gulir untuk memperbesar."
          />
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

        <section className="ig-controls" aria-label="Pengatur jumlah Riemann">
          <div className="ig-field">
            <span id="ig-fn-label">Pilih fungsi</span>
            <div
              className="ig-segment"
              role="radiogroup"
              aria-labelledby="ig-fn-label"
            >
              {FN_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={st.fn === key}
                  className={st.fn === key ? "is-active" : ""}
                  onClick={() => patch({ fn: key })}
                >
                  {FUNCS[key].short}
                </button>
              ))}
            </div>
          </div>

          {(
            [
              {
                key: "a",
                label: "a",
                hint: "Batas bawah",
                min: -6,
                max: 5.5,
                step: 0.1,
                ticks: ["−6", "0", "5,5"],
                display: fmt(st.a),
              },
              {
                key: "b",
                label: "b",
                hint: "Batas atas",
                min: -5.5,
                max: 6,
                step: 0.1,
                ticks: ["−5,5", "0", "6"],
                display: fmt(st.b),
              },
              {
                key: "n",
                label: "n",
                hint: "Banyak persegi panjang",
                min: 1,
                max: 100,
                step: 1,
                ticks: ["1", "50", "100"],
                display: String(st.n),
              },
            ] as const
          ).map(({ key, label, hint, min, max, step, ticks, display }) => (
            <div className="ig-slider ig-slider-green" key={key}>
              <label htmlFor={`ig-${key}`}>
                {label} <small>{hint}</small>
              </label>
              <output htmlFor={`ig-${key}`} aria-live="polite">
                {display}
              </output>
              <input
                id={`ig-${key}`}
                type="range"
                min={min}
                max={max}
                step={step}
                value={st[key]}
                aria-valuetext={`${label} sama dengan ${display}`}
                onChange={(event) => {
                  if (key === "n") stopN();
                  patch({ [key]: Number(event.currentTarget.value) } as Partial<State>);
                }}
              />
              <div className="ig-range-labels" aria-hidden="true">
                {ticks.map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
            </div>
          ))}

          <div className="ig-field">
            <span id="ig-method-label">Titik tinggi persegi panjang</span>
            <div
              className="ig-segment"
              role="radiogroup"
              aria-labelledby="ig-method-label"
            >
              {METHODS.map((method) => (
                <button
                  key={method.key}
                  type="button"
                  role="radio"
                  aria-checked={st.method === method.key}
                  className={st.method === method.key ? "is-active" : ""}
                  onClick={() => patch({ method: method.key })}
                >
                  {method.label}
                </button>
              ))}
            </div>
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
            <button className="ig-reset-button" type="button" onClick={reset}>
              Atur ulang
            </button>
          </div>

          <div className="ig-style" role="group" aria-label="Gaya grafik">
            <div className="ig-stepper">
              <span>Ketebalan grafik</span>
              <button
                type="button"
                onClick={() => changeStyle("curveWidth", -1)}
                disabled={style.curveWidth <= CURVE_WIDTH_RANGE[0]}
                aria-label="Kurangi ketebalan grafik"
              >
                −
              </button>
              <output aria-live="polite">{style.curveWidth}</output>
              <button
                type="button"
                onClick={() => changeStyle("curveWidth", 1)}
                disabled={style.curveWidth >= CURVE_WIDTH_RANGE[1]}
                aria-label="Tambah ketebalan grafik"
              >
                +
              </button>
            </div>
          </div>

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

      <ul className="ig-insights">
        <li>
          <strong style={{ color: calcColors.area }}>Jumlah Riemann:</strong>{" "}
          Sₙ = Σ f(xᵢ*) · Δx dengan Δx = (b − a)/n. Saat n → ∞, Sₙ menuju
          integral tentu ∫ f(x) dx = F(b) − F(a).
        </li>
        <li>
          <strong style={{ color: calcColors.point }}>Luas bertanda:</strong>{" "}
          Bagian grafik di bawah sumbu x menyumbang luas negatif, sehingga
          nilai integral bisa lebih kecil dari luas daerah sebenarnya.
        </li>
      </ul>
    </div>
  );
}
