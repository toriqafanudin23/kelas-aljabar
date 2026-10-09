import { useEffect, useId, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./DerivativeSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
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

type State = {
  fn: FnKey;
  x0: number; // titik P
  h: number; // jarak Δx menuju titik Q
};
type Style = { curveWidth: number; pointSize: number };

const initialState: State = { fn: "quad", x0: 1, h: 2 };
const initialStyle: Style = { curveWidth: 3, pointSize: 4 };
const initialBox: BoundingBox = [-7, 7, 7, -7];
const CURVE_WIDTH_RANGE = [1, 8] as const;
const POINT_SIZE_RANGE = [2, 10] as const;
const ANIMATION_SPEED_FACTOR = 0.25;

function secantSlope(s: State) {
  if (Math.abs(s.h) < 1e-9) return Number.NaN;
  const { f } = FUNCS[s.fn];
  return (f(s.x0 + s.h) - f(s.x0)) / s.h;
}

export function DerivativeSimulation() {
  const boardId = `dv-board-${useId().replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const curveRef = useRef<JXG.Functiongraph | null>(null);
  const pointsRef = useRef<{ el: JXG.Point; extra: number }[]>([]);
  const hRaf = useRef<number | null>(null);

  const { rootRef, isFullscreen, toggleFullscreen } = useSimulationFullscreen();

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
    const msec = () => secantSlope(S());

    const board = createGraphBoard(boardId, initialBox);
    boardRef.current = board;

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
      });
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

    const stopObserving = observeBoardResize(board, containerRef.current);

    return () => {
      stopObserving();
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
      className={`derivative-simulation simulation-fullscreen-frame${isFullscreen ? " is-fullscreen" : ""}`}
    >
      <div className="dv-boards">
        <section className="dv-board-panel" aria-labelledby="dv-title">
          <div className="dv-board-heading">
            <h3 id="dv-title">Grafik tali busur dan garis singgung</h3>
            <span className="dv-equation">
              {fn.label} · {fn.dLabel}
            </span>
            <div className="dv-view-tools" role="group" aria-label="Tampilan">
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
            className="dv-board"
            id={boardId}
            ref={containerRef}
            aria-label="Grafik fungsi f dengan tali busur melalui titik P dan Q serta garis singgung di P. Ubah x0 dan h dengan penggeser. Tahan klik kiri lalu seret untuk menggeser grafik, gulir untuk memperbesar."
          />
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

        <section className="dv-controls" aria-label="Pengatur turunan">
          <div className="dv-field">
            <span id="dv-fn-label">Pilih fungsi</span>
            <div
              className="dv-segment"
              role="radiogroup"
              aria-labelledby="dv-fn-label"
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

          <div className="dv-slider dv-slider-teal">
            <label htmlFor="dv-x0">
              x₀ <small>Posisi titik P</small>
            </label>
            <output htmlFor="dv-x0" aria-live="polite">
              {fmt(st.x0)}
            </output>
            <input
              id="dv-x0"
              type="range"
              min={-4}
              max={4}
              step={0.1}
              value={st.x0}
              aria-valuetext={`x₀ sama dengan ${fmt(st.x0)}`}
              onChange={(event) =>
                patch({ x0: Number(event.currentTarget.value) })
              }
            />
            <div className="dv-range-labels" aria-hidden="true">
              <span>−4</span>
              <span>0</span>
              <span>4</span>
            </div>
          </div>

          <div className="dv-slider dv-slider-orange">
            <label htmlFor="dv-h">
              h <small>Jarak P ke Q (Δx)</small>
            </label>
            <output htmlFor="dv-h" aria-live="polite">
              {fmt(st.h, 4)}
            </output>
            <input
              id="dv-h"
              type="range"
              min={-3}
              max={3}
              step={0.01}
              value={st.h}
              aria-valuetext={`h sama dengan ${fmt(st.h, 4)}`}
              onChange={(event) => {
                stopH();
                patch({ h: Number(event.currentTarget.value) });
              }}
            />
            <div className="dv-range-labels" aria-hidden="true">
              <span>−3</span>
              <span>0</span>
              <span>3</span>
            </div>
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
            <button className="dv-reset-button" type="button" onClick={reset}>
              Atur ulang
            </button>
          </div>

          <GraphAppearanceControls appearance={style} onStep={changeStyle} />

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
              didefinisikan sebagai limit saat h mendekati 0, bukan nilai di h =
              0.
            </p>
          )}

          <div className="dv-table-wrap">
            <table className="dv-table">
              <caption>
                Pendekatan limit di x₀ = {fmt(st.x0)}: kemiringan tali busur
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
                <tr className="dv-table-limit">
                  <th scope="row">h → 0</th>
                  <td colSpan={2}>{`limit = f′(x₀) = ${fmt(mTan, 4)}`}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
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
