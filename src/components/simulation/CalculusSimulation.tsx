import { useEffect, useId, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./CalculusSimulation.css";

type FnKey = "quad" | "cubic" | "sine";
type Method = "left" | "right" | "mid";

type State = {
  fn: FnKey;
  x0: number; // titik P
  h: number; // jarak Δx menuju titik Q
  a: number; // batas bawah integral
  b: number; // batas atas integral
  n: number; // banyak persegi panjang
  method: Method;
};

type FnDef = {
  short: string;
  label: string;
  dLabel: string;
  f: (x: number) => number;
  df: (x: number) => number;
  F: (x: number) => number; // antiturunan
};

type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;
type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
};

const initialState: State = {
  fn: "quad",
  x0: 1,
  h: 2,
  a: -3,
  b: 3,
  n: 6,
  method: "left",
};

const FUNCS: Record<FnKey, FnDef> = {
  quad: {
    short: "¼x²",
    label: "f(x) = ¼x²",
    dLabel: "f′(x) = ½x",
    f: (x) => (x * x) / 4,
    df: (x) => x / 2,
    F: (x) => (x * x * x) / 12,
  },
  cubic: {
    short: "¼x³ − x",
    label: "f(x) = ¼x³ − x",
    dLabel: "f′(x) = ¾x² − 1",
    f: (x) => (x * x * x) / 4 - x,
    df: (x) => (3 * x * x) / 4 - 1,
    F: (x) => x ** 4 / 16 - (x * x) / 2,
  },
  sine: {
    short: "2 sin x",
    label: "f(x) = 2 sin x",
    dLabel: "f′(x) = 2 cos x",
    f: (x) => 2 * Math.sin(x),
    df: (x) => 2 * Math.cos(x),
    F: (x) => -2 * Math.cos(x),
  },
};

const FN_KEYS: FnKey[] = ["quad", "cubic", "sine"];

const METHODS: { key: Method; label: string; full: string }[] = [
  { key: "left", label: "Kiri", full: "titik kiri" },
  { key: "right", label: "Kanan", full: "titik kanan" },
  { key: "mid", label: "Tengah", full: "titik tengah" },
];

const N_STEPS = [
  1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100,
];
const ANIMATION_SPEED_FACTOR = 0.25;

const colors = {
  tangent: "#087f8c",
  secant: "#d16b36",
  area: "#527a41",
  curve: "#183e54",
  deriv: "#6b4e9b",
  point: "#927000",
  axis: "#63727d",
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function fmt(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < Math.pow(10, -digits) / 2) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
  }).format(value);
}

function secantSlope(s: State) {
  if (Math.abs(s.h) < 1e-9) return Number.NaN;
  const { f } = FUNCS[s.fn];
  return (f(s.x0 + s.h) - f(s.x0)) / s.h;
}

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

type SliderProps = {
  id: string;
  tone: "tan" | "sec" | "area";
  label: string;
  hint: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  ticks: string[];
  onChange: (value: number) => void;
};

function SliderRow({
  id,
  tone,
  label,
  hint,
  value,
  display,
  min,
  max,
  step,
  ticks,
  onChange,
}: SliderProps) {
  return (
    <div className={`calc-slider calc-slider-${tone}`}>
      <label htmlFor={id}>
        {label} <small>{hint}</small>
      </label>
      <output htmlFor={id} aria-live="polite">
        {display}
      </output>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${label} sama dengan ${display}`}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
      <div className="calc-range-labels" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

export function CalculusSimulation() {
  const uid = useId().replace(/:/g, "");
  const ids = {
    f: `calc-f-${uid}`,
    d: `calc-d-${uid}`,
    i: `calc-i-${uid}`,
  };
  const containerF = useRef<HTMLDivElement | null>(null);
  const containerD = useRef<HTMLDivElement | null>(null);
  const containerI = useRef<HTMLDivElement | null>(null);
  const boardsRef = useRef<Board[]>([]);
  const stRef = useRef<State>(initialState);
  const hRaf = useRef<number | null>(null);
  const nTimer = useRef<number | null>(null);
  const [st, setSt] = useState<State>(initialState);
  const [hAnimating, setHAnimating] = useState(false);
  const [nAnimating, setNAnimating] = useState(false);

  const patch = (p: Partial<State>) => {
    const next: State = { ...stRef.current, ...p };
    if (p.a !== undefined) next.a = round1(next.a);
    if (p.b !== undefined) next.b = round1(next.b);
    if (p.x0 !== undefined) next.x0 = round1(next.x0);
    if (p.a !== undefined && next.a > next.b - 0.5)
      next.b = round1(next.a + 0.5);
    if (p.b !== undefined && next.b < next.a + 0.5)
      next.a = round1(next.b - 0.5);
    stRef.current = next;
    setSt(next);
    boardsRef.current.forEach((board) => board.update());
  };

  const stopH = () => {
    if (hRaf.current !== null) cancelAnimationFrame(hRaf.current);
    hRaf.current = null;
    setHAnimating(false);
  };

  const stopN = () => {
    if (nTimer.current !== null) window.clearInterval(nTimer.current);
    nTimer.current = null;
    setNAnimating(false);
  };

  // Animasi h → 0: h dipangkas separuh setiap 450 ms pada kecepatan penuh
  const toggleHAnimation = () => {
    if (hRaf.current !== null) {
      stopH();
      return;
    }
    stopN();
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

  // Animasi n: 1 → 100 persegi panjang
  const toggleNAnimation = () => {
    if (nTimer.current !== null) {
      stopN();
      return;
    }
    stopH();
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
    stopH();
    stopN();
    patch(initialState);
  };

  useEffect(() => {
    const S = () => stRef.current;
    const F = () => FUNCS[S().fn];
    const msec = () => secantSlope(S());

    const makeBoard = (id: string): Board => {
      const board = JXG.JSXGraph.initBoard(id, {
        boundingbox: [-7, 7, 7, -7],
        axis: false,
        showCopyright: false,
        showNavigation: false,
        keepAspectRatio: true,
        pan: { enabled: false },
        zoom: { wheel: false },
      });
      const axisStyle = {
        strokeColor: colors.axis,
        strokeWidth: 1.2,
        highlight: false,
      };
      const ticks = {
        ticksDistance: 2,
        minorTicks: 1,
        majorHeight: 7,
        drawLabels: true,
        label: { fontSize: 9, strokeColor: colors.axis },
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
    };

    const dot = (
      board: Board,
      x: () => number,
      y: () => number,
      color: string,
      size = 4,
    ) =>
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

    // ───── Papan 1: grafik f, tali busur, garis singgung ─────
    const b1 = makeBoard(ids.f);
    b1.create("functiongraph", [(x: number) => F().f(x), -7, 7], {
      strokeColor: colors.curve,
      strokeWidth: 3,
      highlight: false,
    });
    b1.create(
      "functiongraph",
      [(x: number) => F().f(S().x0) + F().df(S().x0) * (x - S().x0), -7, 7],
      {
        strokeColor: colors.tangent,
        strokeWidth: 2,
        dash: 2,
        highlight: false,
      },
    );
    b1.create(
      "functiongraph",
      [
        (x: number) => {
          const m = msec();
          return Number.isFinite(m)
            ? F().f(S().x0) + m * (x - S().x0)
            : Number.NaN;
        },
        -7,
        7,
      ],
      {
        strokeColor: colors.secant,
        strokeWidth: 2.5,
        highlight: false,
      },
    );
    // Segmen bantu: Δx (mendatar) dan Δy (tegak)
    b1.create(
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
      },
    );
    b1.create(
      "segment",
      [
        [() => S().x0 + S().h, () => F().f(S().x0)],
        [() => S().x0 + S().h, () => F().f(S().x0 + S().h)],
      ],
      {
        strokeColor: colors.secant,
        strokeWidth: 1.5,
        dash: 2,
        highlight: false,
        fixed: true,
      },
    );
    dot(
      b1,
      () => S().x0 + S().h,
      () => (Math.abs(S().h) < 1e-9 ? Number.NaN : F().f(S().x0 + S().h)),
      colors.secant,
      4.5,
    );
    dot(
      b1,
      () => S().x0,
      () => F().f(S().x0),
      colors.point,
      5,
    );

    // ───── Papan 2: grafik turunan f′ ─────
    const b2 = makeBoard(ids.d);
    b2.create("functiongraph", [(x: number) => F().df(x), -7, 7], {
      strokeColor: colors.deriv,
      strokeWidth: 3,
      highlight: false,
    });
    b2.create(
      "segment",
      [
        [() => S().x0, -60],
        [() => S().x0, 60],
      ],
      {
        strokeColor: "#9aa8b0",
        strokeWidth: 1.2,
        dash: 2,
        highlight: false,
        fixed: true,
      },
    );
    dot(
      b2,
      () => S().x0,
      () => msec(),
      colors.secant,
      4.5,
    );
    dot(
      b2,
      () => S().x0,
      () => F().df(S().x0),
      colors.tangent,
      5,
    );

    // ───── Papan 3: jumlah Riemann ─────
    const b3 = makeBoard(ids.i);
    const fill = b3.create("curve", [[0], [0]], {
      strokeWidth: 0,
      fillColor: colors.area,
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
    const outline = b3.create("curve", [[0], [0]], {
      strokeColor: colors.area,
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
    b3.create("functiongraph", [(x: number) => F().f(x), -7, 7], {
      strokeColor: colors.curve,
      strokeWidth: 3,
      highlight: false,
    });
    ([() => S().a, () => S().b] as const).forEach((edge) => {
      b3.create(
        "segment",
        [
          [edge, -60],
          [edge, 60],
        ],
        {
          strokeColor: colors.point,
          strokeWidth: 1.2,
          dash: 2,
          highlight: false,
          fixed: true,
        },
      );
    });

    const boards = [b1, b2, b3];
    boardsRef.current = boards;
    boards.forEach((board) => board.update());

    const observer = new ResizeObserver(() => {
      [
        [b1, containerF.current],
        [b2, containerD.current],
        [b3, containerI.current],
      ].forEach(([board, el]) => {
        const target = el as HTMLDivElement | null;
        if (target && target.clientWidth > 0 && target.clientHeight > 0) {
          (board as Board).resizeContainer(
            target.clientWidth,
            target.clientHeight,
            true,
          );
        }
      });
    });
    [containerF.current, containerD.current, containerI.current].forEach(
      (el) => {
        if (el) observer.observe(el);
      },
    );

    return () => {
      observer.disconnect();
      boards.forEach((board) => JXG.JSXGraph.freeBoard(board));
      boardsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Bersihkan animasi saat komponen dilepas
  useEffect(
    () => () => {
      if (hRaf.current !== null) cancelAnimationFrame(hRaf.current);
      if (nTimer.current !== null) window.clearInterval(nTimer.current);
    },
    [],
  );

  // ───── Nilai turunan ─────
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

  // ───── Nilai integral ─────
  const rm = riemann(st);
  const exact = fn.F(st.b) - fn.F(st.a);
  const error = rm.sum - exact;
  const methodName = METHODS.find((m) => m.key === st.method)?.full ?? "";

  return (
    <div className="calculus-simulation">
      {/* Pilihan fungsi */}
      <section className="calc-function-bar" aria-label="Pilihan fungsi">
        <div className="calc-function-pick">
          <span id="calc-fn-label">Pilih fungsi</span>
          <div
            className="calc-segment"
            role="radiogroup"
            aria-labelledby="calc-fn-label"
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
        <div className="calc-function-eq">
          <span>{fn.label}</span>
          <span>{fn.dLabel}</span>
        </div>
      </section>

      {/* ═════ BAGIAN 1: LIMIT & TURUNAN ═════ */}
      <h3 className="calc-section-title">
        Limit dan turunan: tali busur menuju garis singgung
      </h3>

      <div className="calc-boards">
        <section className="calc-board-panel" aria-labelledby="calc-f-title">
          <div className="calc-board-heading">
            <h4 id="calc-f-title">Grafik f(x)</h4>
            <span className="calc-equation">{fn.label}</span>
          </div>
          <div
            className="calc-board"
            id={ids.f}
            ref={containerF}
            aria-label="Grafik fungsi f dengan tali busur melalui titik P dan Q serta garis singgung di P. Ubah x0 dan h dengan penggeser."
          />
          <div className="calc-legend" aria-label="Legenda grafik fungsi">
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

        <section className="calc-board-panel" aria-labelledby="calc-d-title">
          <div className="calc-board-heading">
            <h4 id="calc-d-title">Grafik kemiringan f′(x)</h4>
            <span className="calc-equation">{fn.dLabel}</span>
          </div>
          <div
            className="calc-board"
            id={ids.d}
            ref={containerD}
            aria-label="Grafik turunan f′. Titik jingga adalah kemiringan tali busur, titik hijau kebiruan adalah nilai f′ di x0."
          />
          <div className="calc-legend" aria-label="Legenda grafik turunan">
            <span>
              <i className="legend-deriv" /> f′(x)
            </span>
            <span>
              <b className="dot-q" /> kemiringan tali busur
            </span>
            <span>
              <b className="dot-tan" /> f′(x₀) = kemiringan singgung
            </span>
          </div>
        </section>
      </div>

      <section
        className="calc-controls calc-controls-wide"
        aria-label="Pengatur turunan"
      >
        <SliderRow
          id="calc-x0"
          tone="tan"
          label="x₀"
          hint="Posisi titik P"
          value={st.x0}
          display={fmt(st.x0)}
          min={-4}
          max={4}
          step={0.1}
          ticks={["−4", "0", "4"]}
          onChange={(value) => patch({ x0: value })}
        />
        <SliderRow
          id="calc-h"
          tone="sec"
          label="h"
          hint="Jarak P ke Q (Δx)"
          value={st.h}
          display={fmt(st.h, 4)}
          min={-3}
          max={3}
          step={0.01}
          ticks={["−3", "0", "3"]}
          onChange={(value) => {
            stopH();
            patch({ h: value });
          }}
        />
        <div className="calc-actions">
          <button
            className="calc-primary-button"
            type="button"
            onClick={toggleHAnimation}
            aria-pressed={hAnimating}
          >
            {hAnimating ? "Hentikan" : "Animasikan h → 0"}
          </button>
          <button className="calc-reset-button" type="button" onClick={reset}>
            Atur ulang
          </button>
        </div>
      </section>

      {hZero && (
        <p className="calc-warning" role="status">
          Saat h = 0, titik Q berimpit dengan P sehingga kemiringan tali busur
          berbentuk 0/0 (tak terdefinisi). Itulah sebabnya turunan didefinisikan
          sebagai limit saat h mendekati 0, bukan nilai di h = 0.
        </p>
      )}

      <dl className="calc-readouts" aria-live="polite">
        <div className="readout-point">
          <dt>Titik P (x₀, f(x₀))</dt>
          <dd>{`(${fmt(st.x0)}, ${fmt(fx0)})`}</dd>
        </div>
        <div className="readout-sec">
          <dt>Titik Q (x₀ + h, f(x₀ + h))</dt>
          <dd>
            {hZero
              ? "—"
              : `(${fmt(st.x0 + st.h, 3)}, ${fmt(fn.f(st.x0 + st.h), 3)})`}
          </dd>
        </div>
        <div className="readout-sec">
          <dt>Kemiringan tali busur</dt>
          <dd>{hZero ? "—" : fmt(mSec, 4)}</dd>
          <small>{"Δy/Δx = [f(x₀+h) − f(x₀)] / h"}</small>
        </div>
        <div className="readout-tan">
          <dt>Kemiringan garis singgung</dt>
          <dd>{fmt(mTan, 4)}</dd>
          <small>f′(x₀) = limit saat h → 0</small>
        </div>
        <div className="readout-gap">
          <dt>Selisih kedua kemiringan</dt>
          <dd>{hZero ? "—" : fmt(gap, 4)}</dd>
          <small>Mengecil saat |h| mengecil</small>
        </div>
        <div className="readout-point">
          <dt>Persamaan garis singgung</dt>
          <dd>{`y = ${fmt(mTan, 2)}(x − ${fmt(st.x0)}) + ${fmt(fx0, 2)}`}</dd>
        </div>
      </dl>

      <div className="calc-table-wrap">
        <table className="calc-table">
          <caption>
            Tabel pendekatan limit di x₀ = {fmt(st.x0)}: kemiringan tali busur
            untuk h yang makin kecil
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
            <tr className="calc-table-limit">
              <th scope="row">h → 0</th>
              <td colSpan={2}>{`limit = f′(x₀) = ${fmt(mTan, 4)}`}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ═════ BAGIAN 2: INTEGRAL ═════ */}
      <h3 className="calc-section-title">
        Integral: pendekatan luas dengan jumlah Riemann
      </h3>

      <div className="calc-boards calc-boards-integral">
        <section className="calc-board-panel" aria-labelledby="calc-i-title">
          <div className="calc-board-heading">
            <h4 id="calc-i-title">
              Jumlah Riemann di [{fmt(st.a)}, {fmt(st.b)}]
            </h4>
            <span className="calc-equation">{fn.label}</span>
          </div>
          <div
            className="calc-board"
            id={ids.i}
            ref={containerI}
            aria-label="Grafik fungsi f dengan n persegi panjang Riemann di antara batas a dan b. Ubah a, b, n, dan metode untuk melihat perubahan pendekatan luas."
          />
          <div className="calc-legend" aria-label="Legenda grafik integral">
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

        <section className="calc-controls" aria-label="Pengatur jumlah Riemann">
          <SliderRow
            id="calc-a"
            tone="area"
            label="a"
            hint="Batas bawah"
            value={st.a}
            display={fmt(st.a)}
            min={-6}
            max={5.5}
            step={0.1}
            ticks={["−6", "0", "5,5"]}
            onChange={(value) => patch({ a: value })}
          />
          <SliderRow
            id="calc-b"
            tone="area"
            label="b"
            hint="Batas atas"
            value={st.b}
            display={fmt(st.b)}
            min={-5.5}
            max={6}
            step={0.1}
            ticks={["−5,5", "0", "6"]}
            onChange={(value) => patch({ b: value })}
          />
          <SliderRow
            id="calc-n"
            tone="area"
            label="n"
            hint="Banyak persegi panjang"
            value={st.n}
            display={String(st.n)}
            min={1}
            max={100}
            step={1}
            ticks={["1", "50", "100"]}
            onChange={(value) => {
              stopN();
              patch({ n: value });
            }}
          />
          <div className="calc-method">
            <span id="calc-method-label">Titik tinggi persegi panjang</span>
            <div
              className="calc-segment"
              role="radiogroup"
              aria-labelledby="calc-method-label"
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
          <div className="calc-actions">
            <button
              className="calc-primary-button"
              type="button"
              onClick={toggleNAnimation}
              aria-pressed={nAnimating}
            >
              {nAnimating ? "Hentikan" : "Animasikan n → 100"}
            </button>
            <button className="calc-reset-button" type="button" onClick={reset}>
              Atur ulang
            </button>
          </div>
        </section>
      </div>

      <dl className="calc-readouts" aria-live="polite">
        <div className="readout-area">
          <dt>Jumlah Riemann Sₙ</dt>
          <dd>{fmt(rm.sum, 4)}</dd>
          <small>{`n = ${st.n}, ${methodName}`}</small>
        </div>
        <div className="readout-exact">
          <dt>{"Nilai eksak ∫ f(x) dx"}</dt>
          <dd>{fmt(exact, 4)}</dd>
          <small>F(b) − F(a)</small>
        </div>
        <div className="readout-gap">
          <dt>Galat (Sₙ − eksak)</dt>
          <dd>{fmt(error, 4)}</dd>
          <small>Mengecil saat n membesar</small>
        </div>
        <div className="readout-point">
          <dt>Lebar tiap persegi panjang</dt>
          <dd>{`Δx = ${fmt(rm.dx, 4)}`}</dd>
        </div>
        <div className="readout-point">
          <dt>Batas integral</dt>
          <dd>{`[${fmt(st.a)}, ${fmt(st.b)}]`}</dd>
        </div>
        <div className="readout-point">
          <dt>Tinggi persegi panjang pertama</dt>
          <dd>{fmt(rm.heights[0], 3)}</dd>
        </div>
      </dl>

      <ul className="calc-insights">
        <li>
          <strong style={{ color: colors.secant }}>Tali busur:</strong>{" "}
          kemiringan PQ adalah [f(x₀+h) − f(x₀)]/h. Saat h mengecil, titik Q
          merapat ke P dan tali busur berputar menuju garis singgung.
        </li>
        <li>
          <strong style={{ color: colors.tangent }}>Limit dan turunan:</strong>{" "}
          f′(x₀) = lim<sub>h→0</sub> [f(x₀+h) − f(x₀)]/h = {fmt(mTan, 4)}. Limit
          ada karena pendekatan dari kiri dan kanan menuju nilai yang sama
          (lihat tabel).
        </li>
        <li>
          <strong style={{ color: colors.area }}>Jumlah Riemann:</strong> Sₙ = Σ
          f(xᵢ*) · Δx dengan Δx = (b − a)/n. Saat n → ∞, Sₙ menuju integral
          tentu ∫ f(x) dx = F(b) − F(a). Bagian grafik di bawah sumbu x
          menyumbang luas bertanda negatif.
        </li>
      </ul>
    </div>
  );
}
