import { useEffect, useId, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./FunctionTransformationSimulation.css";

/* ---------- Tipe ---------- */

type Vec = [number, number];

type FunctionId =
  | "square"
  | "cube"
  | "abs"
  | "sqrt"
  | "inverse"
  | "sine"
  | "exp"
  | "ln";

/** g(x) = a · f(b(x − h)) + k */
type Params = { h: number; k: number; a: number; b: number; x0: number };

type BaseFunction = {
  id: FunctionId;
  label: string;
  evaluate: (u: number) => number;
  /** Menulis f(arg) sebagai teks. */
  text: (arg: string) => string;
  /** Koefisien boleh ditempel langsung ke teks (2x², 3eˣ, …). */
  tight: boolean;
  /** Absis titik kunci pada grafik f. */
  keyU: number[];
  /** Posisi asimtot tegak pada f (jika ada), untuk memutus garis. */
  pole?: number;
};

type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
};

/* ---------- Konstanta ---------- */

const X_MIN = -10;
const X_MAX = 10;
const SAMPLES = 1000;
const Y_LIMIT = 1000;
const STRETCH_STEP = 0.25;

const keyLetters = ["A", "B", "C", "D", "E"];

const colors = {
  original: "#087f8c",
  image: "#d16b36",
  guide: "#183e54",
};

const defaultParams: Params = { h: 2, k: 1, a: 2, b: 1, x0: 1 };
const identityParams: Params = { h: 0, k: 0, a: 1, b: 1, x0: 1 };

const wrap = (arg: string) => (arg === "x" ? arg : `(${arg})`);

const baseFunctions: BaseFunction[] = [
  {
    id: "square",
    label: "x²",
    evaluate: (u) => u * u,
    text: (arg) => `${wrap(arg)}²`,
    tight: true,
    keyU: [-2, -1, 0, 1, 2],
  },
  {
    id: "cube",
    label: "x³",
    evaluate: (u) => u * u * u,
    text: (arg) => `${wrap(arg)}³`,
    tight: true,
    keyU: [-2, -1, 0, 1, 2],
  },
  {
    id: "abs",
    label: "|x|",
    evaluate: (u) => Math.abs(u),
    text: (arg) => `|${arg}|`,
    tight: true,
    keyU: [-2, -1, 0, 1, 2],
  },
  {
    id: "sqrt",
    label: "√x",
    evaluate: (u) => (u >= 0 ? Math.sqrt(u) : Number.NaN),
    text: (arg) => `√${wrap(arg)}`,
    tight: true,
    keyU: [0, 1, 4, 9],
  },
  {
    id: "inverse",
    label: "1/x",
    evaluate: (u) => (u === 0 ? Number.NaN : 1 / u),
    text: (arg) => `1/${wrap(arg)}`,
    tight: false,
    keyU: [-2, -1, 1, 2],
    pole: 0,
  },
  {
    id: "sine",
    label: "sin x",
    evaluate: (u) => Math.sin(u),
    text: (arg) => `sin(${arg})`,
    tight: false,
    keyU: [-Math.PI / 2, 0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2],
  },
  {
    id: "exp",
    label: "eˣ",
    evaluate: (u) => Math.exp(u),
    text: (arg) => `e^${wrap(arg)}`,
    tight: true,
    keyU: [-2, -1, 0, 1, 2],
  },
  {
    id: "ln",
    label: "ln x",
    evaluate: (u) => (u > 0 ? Math.log(u) : Number.NaN),
    text: (arg) => `ln(${arg})`,
    tight: false,
    keyU: [0.5, 1, 2, 4, 8],
  },
];

const functionMap = Object.fromEntries(
  baseFunctions.map((fn) => [fn.id, fn]),
) as Record<FunctionId, BaseFunction>;

/* ---------- Format ---------- */

function cleanNumber(value: number) {
  const rounded = Math.round(value * 1000) / 1000;
  return Math.abs(rounded) < 1e-9 ? 0 : rounded;
}

function formatValue(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 })
    .format(cleanNumber(value))
    .replace("-", "−");
}

const formatCoord = ([x, y]: Vec) => `(${formatValue(x)}; ${formatValue(y)})`;

const signed = (value: number) =>
  value < 0 ? `− ${formatValue(-value)}` : `+ ${formatValue(value)}`;

/* ---------- Matematika ---------- */

/** Titik (x, y) pada f menjadi (h + x/b, a·y + k) pada g. */
const mapPoint = (p: Params, [x, y]: Vec): Vec => [
  p.h + x / p.b,
  p.a * y + p.k,
];

function probeOf(fn: BaseFunction, p: Params) {
  const y = fn.evaluate(p.x0);
  if (!Number.isFinite(y)) return null;
  const base: Vec = [p.x0, y];
  return { base, image: mapPoint(p, base) };
}

/** Titik-titik kurva y = a·f(b(x − h)) + k; NaN dipakai untuk memutus garis. */
function sampleCurve(fn: BaseFunction, p: Params) {
  const nodes: number[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    nodes.push(X_MIN + (i / SAMPLES) * (X_MAX - X_MIN));
  }
  if (p.h > X_MIN && p.h < X_MAX && !nodes.includes(p.h)) {
    nodes.push(p.h);
    nodes.sort((m, n) => m - n);
  }

  const xs: number[] = [];
  const ys: number[] = [];
  const gap = () => {
    if (xs.length > 0 && !Number.isNaN(xs[xs.length - 1])) {
      xs.push(Number.NaN);
      ys.push(Number.NaN);
    }
  };

  let previousU: number | null = null;
  for (const x of nodes) {
    const u = p.b * (x - p.h);
    if (
      fn.pole !== undefined &&
      previousU !== null &&
      (previousU - fn.pole) * (u - fn.pole) < 0
    ) {
      gap();
    }
    previousU = u;
    const y = p.a * fn.evaluate(u) + p.k;
    if (Number.isFinite(y) && Math.abs(y) <= Y_LIMIT) {
      xs.push(x);
      ys.push(y);
    } else {
      gap();
    }
  }

  if (xs.length === 0) {
    xs.push(Number.NaN);
    ys.push(Number.NaN);
  }
  return { xs, ys };
}

/* ---------- Teks ---------- */

function argumentText(h: number, b: number) {
  const inner =
    h === 0 ? "x" : `x ${h > 0 ? "−" : "+"} ${formatValue(Math.abs(h))}`;
  if (b === 1) return inner;
  const factor = b === -1 ? "−" : formatValue(b);
  return h === 0 ? `${factor}x` : `${factor}(${inner})`;
}

function formulaText(fn: BaseFunction, { h, k, a, b }: Params) {
  const core = fn.text(argumentText(h, b));
  let body: string;
  if (a === 1) body = core;
  else if (a === -1) body = `−${core}`;
  else body = `${formatValue(a)}${fn.tight ? "" : " · "}${core}`;
  const shift = k === 0 ? "" : ` ${k > 0 ? "+" : "−"} ${formatValue(Math.abs(k))}`;
  return `g(x) = ${body}${shift}`;
}

function describeEffects({ h, k, a, b }: Params) {
  const horizontalShift =
    h === 0
      ? "tidak bergeser."
      : `bergeser ${formatValue(Math.abs(h))} satuan ke ${h > 0 ? "kanan" : "kiri"}.`;
  const verticalShift =
    k === 0
      ? "tidak bergeser."
      : `bergeser ${formatValue(Math.abs(k))} satuan ke ${k > 0 ? "atas" : "bawah"}.`;

  const magA = Math.abs(a);
  let vertical =
    magA === 1
      ? "tidak diregangkan"
      : magA > 1
        ? `diregangkan ke arah sumbu y dengan faktor ${formatValue(magA)}`
        : `dimampatkan ke arah sumbu y dengan faktor ${formatValue(magA)}`;
  if (a < 0) {
    vertical += `, lalu dicerminkan terhadap ${k === 0 ? "sumbu x" : `garis y = ${formatValue(k)}`}`;
  }

  const magB = Math.abs(b);
  let horizontal =
    magB === 1
      ? "tidak diregangkan"
      : magB > 1
        ? `dimampatkan ke arah sumbu x (lebarnya menjadi ${formatValue(1 / magB)} kali)`
        : `diregangkan ke arah sumbu x dengan faktor ${formatValue(1 / magB)}`;
  if (b < 0) {
    horizontal += `, lalu dicerminkan terhadap ${h === 0 ? "sumbu y" : `garis x = ${formatValue(h)}`}`;
  }

  return [
    { title: "Translasi horizontal (h)", text: `grafik ${horizontalShift}` },
    { title: "Translasi vertikal (k)", text: `grafik ${verticalShift}` },
    { title: "Peregangan vertikal (a)", text: `grafik ${vertical}.` },
    { title: "Peregangan horizontal (b)", text: `grafik ${horizontal}.` },
  ];
}

/* ---------- Komponen kecil ---------- */

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="ft-slider">
      <label htmlFor={id}>{label}</label>
      <output htmlFor={id}>{formatValue(value)}</output>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${label} = ${formatValue(value)}`}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </div>
  );
}

/* ---------- Komponen utama ---------- */

export function FunctionTransformationSimulation() {
  const uid = useId();
  const boardId = `ft-board-${uid.replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<ReturnType<typeof JXG.JSXGraph.initBoard> | null>(
    null,
  );

  const functionRef = useRef<BaseFunction>(functionMap.square);
  const paramsRef = useRef<Params>(defaultParams);
  const showOriginalRef = useRef(true);
  const showKeyRef = useRef(true);

  const [functionId, setFunctionId] = useState<FunctionId>("square");
  const [params, setParams] = useState<Params>(defaultParams);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showKey, setShowKey] = useState(true);

  const refresh = () => boardRef.current?.update();

  const patchParams = (patch: Partial<Params>) => {
    const next = { ...paramsRef.current, ...patch };
    paramsRef.current = next;
    setParams(next);
    refresh();
  };

  const changeStretch = (key: "a" | "b", raw: number) => {
    /* Nilai 0 dilewati: a = 0 atau b = 0 membuat grafik menjadi garis datar. */
    const previous = paramsRef.current[key];
    const value =
      raw === 0 ? (previous > 0 ? -STRETCH_STEP : STRETCH_STEP) : raw;
    patchParams(key === "a" ? { a: value } : { b: value });
  };

  const mirror = (key: "a" | "b") =>
    patchParams(
      key === "a" ? { a: -paramsRef.current.a } : { b: -paramsRef.current.b },
    );

  const selectFunction = (id: FunctionId) => {
    functionRef.current = functionMap[id];
    setFunctionId(id);
    refresh();
  };

  const toggleOriginal = (checked: boolean) => {
    showOriginalRef.current = checked;
    setShowOriginal(checked);
    refresh();
  };

  const toggleKey = (checked: boolean) => {
    showKeyRef.current = checked;
    setShowKey(checked);
    refresh();
  };

  const clearTransformation = () =>
    patchParams({ ...identityParams, x0: paramsRef.current.x0 });

  const resetAll = () => {
    functionRef.current = functionMap.square;
    setFunctionId("square");
    showOriginalRef.current = true;
    setShowOriginal(true);
    showKeyRef.current = true;
    setShowKey(true);
    patchParams({ ...defaultParams });
  };

  /* Papan JSXGraph */
  useEffect(() => {
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

    /* Garis x = h dan y = k (titik (h, k) menggantikan titik asal) */
    const guideAttrs = {
      strokeColor: colors.guide,
      strokeWidth: 1.5,
      strokeOpacity: 0.7,
      dash: 3,
      highlight: false,
      fixed: true,
    };
    const guideX = () => (paramsRef.current.h === 0 ? 1000 : paramsRef.current.h);
    const guideY = () => (paramsRef.current.k === 0 ? 1000 : paramsRef.current.k);
    board.create(
      "line",
      [
        [guideX, 0],
        [guideX, 1],
      ],
      guideAttrs,
    );
    board.create(
      "line",
      [
        [0, guideY],
        [1, guideY],
      ],
      guideAttrs,
    );

    /* Kurva */
    const makeCurve = (
      strokeColor: string,
      strokeWidth: number,
      build: () => { xs: number[]; ys: number[] },
    ) => {
      const curve = board.create("curve", [[0], [0]], {
        strokeColor,
        strokeWidth,
        highlight: false,
        fixed: true,
      }) as unknown as DataCurve;
      curve.updateDataArray = () => {
        const { xs, ys } = build();
        curve.dataX = xs;
        curve.dataY = ys;
      };
      return curve;
    };

    makeCurve(colors.original, 2.5, () =>
      showOriginalRef.current
        ? sampleCurve(functionRef.current, identityParams)
        : { xs: [Number.NaN], ys: [Number.NaN] },
    );
    makeCurve(colors.image, 3, () =>
      sampleCurve(functionRef.current, paramsRef.current),
    );

    /* Titik kunci: asal dan bayangannya */
    const keyBase = (i: number): Vec => {
      const fn = functionRef.current;
      const u = fn.keyU[i];
      if (!showKeyRef.current || u === undefined) return [Number.NaN, Number.NaN];
      return [u, fn.evaluate(u)];
    };
    const keyImage = (i: number): Vec => {
      const base = keyBase(i);
      return Number.isNaN(base[0])
        ? base
        : mapPoint(paramsRef.current, base);
    };

    keyLetters.forEach((name, i) => {
      board.create("point", [() => keyBase(i)[0], () => keyBase(i)[1]], {
        name,
        withLabel: true,
        size: 4,
        fillColor: colors.original,
        strokeColor: "#ffffff",
        strokeWidth: 1.5,
        fixed: true,
        highlight: false,
        label: { offset: [8, 8], fontSize: 11, strokeColor: colors.original },
      });
      board.create("point", [() => keyImage(i)[0], () => keyImage(i)[1]], {
        name: `${name}′`,
        withLabel: true,
        size: 4,
        fillColor: colors.image,
        strokeColor: "#ffffff",
        strokeWidth: 1.5,
        fixed: true,
        highlight: false,
        label: { offset: [8, -14], fontSize: 11, strokeColor: colors.image },
      });
    });

    /* Titik uji P pada f dan bayangannya P′ pada g */
    const probe = () => probeOf(functionRef.current, paramsRef.current);
    board.create(
      "point",
      [
        () => probe()?.base[0] ?? Number.NaN,
        () => probe()?.base[1] ?? Number.NaN,
      ],
      {
        name: "P",
        withLabel: true,
        size: 5,
        fillColor: colors.original,
        strokeColor: "#ffffff",
        strokeWidth: 2,
        fixed: true,
        highlight: false,
        label: { offset: [8, 8], fontSize: 12, strokeColor: colors.original },
      },
    );
    board.create(
      "point",
      [
        () => probe()?.image[0] ?? Number.NaN,
        () => probe()?.image[1] ?? Number.NaN,
      ],
      {
        name: "P′",
        withLabel: true,
        size: 5,
        fillColor: colors.image,
        strokeColor: "#ffffff",
        strokeWidth: 2,
        fixed: true,
        highlight: false,
        label: { offset: [8, -14], fontSize: 12, strokeColor: colors.image },
      },
    );

    const arrowEnd = (which: "from" | "to", coord: 0 | 1) => () => {
      const hidden = 1000 + (which === "to" ? 1 : 0);
      const current = probe();
      if (!current) return hidden;
      const [from, to] = [current.base, current.image];
      if (
        !Number.isFinite(to[0]) ||
        !Number.isFinite(to[1]) ||
        Math.hypot(to[0] - from[0], to[1] - from[1]) < 1e-6
      ) {
        return hidden;
      }
      return (which === "from" ? from : to)[coord];
    };
    board.create(
      "segment",
      [
        [arrowEnd("from", 0), arrowEnd("from", 1)],
        [arrowEnd("to", 0), arrowEnd("to", 1)],
      ],
      {
        strokeColor: colors.guide,
        strokeWidth: 1.5,
        dash: 2,
        lastArrow: { type: 2, size: 5 },
        highlight: false,
        fixed: true,
      },
    );

    board.update();

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

  /* ---------- Turunan untuk tampilan ---------- */

  const fn = functionMap[functionId];
  const { h, k, a, b, x0 } = params;
  const formula = formulaText(fn, params);
  const baseFormula = `f(x) = ${fn.text("x")}`;
  const effects = describeEffects(params);
  const probe = probeOf(fn, params);

  const keyRows = fn.keyU.map((u, i) => {
    const base: Vec = [u, fn.evaluate(u)];
    return { name: keyLetters[i], base, image: mapPoint(params, base) };
  });
  const rows = probe
    ? [...keyRows, { name: "P", base: probe.base, image: probe.image }]
    : keyRows;

  const bText = b < 0 ? `(${formatValue(b)})` : formatValue(b);
  const mappingX = `x′ = ${formatValue(h)} + x/${bText}`;
  const mappingY = `y′ = ${formatValue(a)} · y ${signed(k)}`;

  return (
    <div className="function-transformation-simulation">
      <div className="ft-main">
        <section className="ft-board-panel" aria-labelledby="ft-board-title">
          <div className="ft-board-heading">
            <h3 id="ft-board-title">Bidang koordinat</h3>
            <span>Ubah grafik dengan slider di panel kanan</span>
          </div>
          <div
            className="ft-board"
            id={boardId}
            ref={containerRef}
            aria-label="Bidang koordinat. Grafik awal f(x) berwarna biru dan grafik hasil transformasi g(x) berwarna oranye."
          />
          <div className="ft-legend" aria-label="Legenda grafik">
            <span>
              <i className="legend-original" /> grafik awal f(x)
            </span>
            <span>
              <i className="legend-image" /> hasil g(x)
            </span>
            <span>
              <i className="legend-guide" /> garis x = h dan y = k
            </span>
          </div>
          <p className="ft-caption" aria-live="polite">
            {formula}
          </p>
        </section>

        <section className="ft-side" aria-label="Pengaturan transformasi">
          <div className="ft-panel">
            <h3>Fungsi asal f(x)</h3>
            <div
              className="ft-segmented"
              role="group"
              aria-label="Pilih fungsi asal"
            >
              {baseFunctions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={functionId === option.id}
                  onClick={() => selectFunction(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="ft-check">
              <input
                type="checkbox"
                checked={showOriginal}
                onChange={(event) => toggleOriginal(event.currentTarget.checked)}
              />
              Tampilkan grafik awal f(x)
            </label>
            <label className="ft-check">
              <input
                type="checkbox"
                checked={showKey}
                onChange={(event) => toggleKey(event.currentTarget.checked)}
              />
              Tampilkan titik kunci
            </label>
          </div>

          <div className="ft-panel">
            <h3>Translasi</h3>
            <Slider
              id={`${uid}-h`}
              label="Geser horizontal (h)"
              value={h}
              min={-8}
              max={8}
              step={0.5}
              onChange={(value) => patchParams({ h: value })}
            />
            <Slider
              id={`${uid}-k`}
              label="Geser vertikal (k)"
              value={k}
              min={-8}
              max={8}
              step={0.5}
              onChange={(value) => patchParams({ k: value })}
            />
          </div>

          <div className="ft-panel">
            <h3>Peregangan dan refleksi</h3>
            <Slider
              id={`${uid}-a`}
              label="Regang vertikal (a)"
              value={a}
              min={-4}
              max={4}
              step={STRETCH_STEP}
              onChange={(value) => changeStretch("a", value)}
            />
            <Slider
              id={`${uid}-b`}
              label="Regang horizontal (b)"
              value={b}
              min={-4}
              max={4}
              step={STRETCH_STEP}
              onChange={(value) => changeStretch("b", value)}
            />
            <p className="ft-hint">
              Nilai negatif menghasilkan refleksi: a &lt; 0 terhadap garis y =
              k, b &lt; 0 terhadap garis x = h.
            </p>
            <div className="ft-actions">
              <button
                type="button"
                className="ft-reset-button"
                aria-pressed={a < 0}
                onClick={() => mirror("a")}
              >
                Cerminkan vertikal (a → −a)
              </button>
              <button
                type="button"
                className="ft-reset-button"
                aria-pressed={b < 0}
                onClick={() => mirror("b")}
              >
                Cerminkan horizontal (b → −b)
              </button>
            </div>
          </div>

          <div className="ft-panel">
            <h3>Titik uji</h3>
            <Slider
              id={`${uid}-x0`}
              label="Absis titik P pada f(x)"
              value={x0}
              min={-8}
              max={8}
              step={0.25}
              onChange={(value) => patchParams({ x0: value })}
            />
            <p className="ft-hint">
              {probe
                ? `P${formatCoord(probe.base)} → P′${formatCoord(probe.image)}`
                : `x = ${formatValue(x0)} berada di luar daerah asal f(x).`}
            </p>
          </div>

          <div className="ft-reset-row">
            <button
              type="button"
              className="ft-reset-button"
              onClick={clearTransformation}
            >
              Tanpa transformasi
            </button>
            <button type="button" className="ft-reset-button" onClick={resetAll}>
              Atur ulang semua
            </button>
          </div>
        </section>
      </div>

      <section className="ft-panel ft-wide" aria-labelledby="ft-rule-title">
        <h3 id="ft-rule-title">Persamaan grafik</h3>
        <div className="ft-card-grid">
          <article className="ft-card">
            <h4>Bentuk umum</h4>
            <p className="ft-formula">g(x) = a · f(b(x − h)) + k</p>
            <p>
              h dan k menggeser grafik, a meregangkan vertikal, b meregangkan
              horizontal.
            </p>
          </article>
          <article className="ft-card">
            <h4>Grafik awal</h4>
            <p className="ft-formula ft-formula-original">{baseFormula}</p>
            <p>Titik (x, y) pada f menjadi titik (x′, y′) pada g.</p>
          </article>
          <article className="ft-card ft-card-result">
            <h4>Hasil transformasi</h4>
            <p className="ft-formula ft-formula-image">{formula}</p>
            <p>
              {mappingX}; {mappingY}
            </p>
          </article>
        </div>
        <ul className="ft-insights ft-effects">
          {effects.map((effect) => (
            <li key={effect.title}>
              <strong>{effect.title}:</strong> {effect.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="ft-panel ft-wide" aria-labelledby="ft-coords-title">
        <h3 id="ft-coords-title">Titik kunci dan titik uji</h3>
        <div className="ft-table-wrap">
          <table className="ft-table">
            <thead>
              <tr>
                <th scope="col">Titik</th>
                <th scope="col">Pada f(x)</th>
                <th scope="col">Pada g(x)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <th scope="row">
                    {row.name} → {row.name}′
                  </th>
                  <td className="ft-cell-original">{formatCoord(row.base)}</td>
                  <td className="ft-cell-image">{formatCoord(row.image)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ul className="ft-insights">
        <li>
          <strong>Translasi</strong>: g(x) = f(x − h) + k menggeser grafik h
          satuan ke kanan dan k satuan ke atas. Perubahan di dalam f memengaruhi
          x dan arahnya tampak berlawanan.
        </li>
        <li>
          <strong>Refleksi</strong>: −f(x) mencerminkan grafik terhadap sumbu
          x, sedangkan f(−x) mencerminkannya terhadap sumbu y.
        </li>
        <li>
          <strong>Peregangan vertikal</strong>: a · f(x) mengalikan setiap
          ordinat dengan a. Jika |a| &gt; 1 grafik meregang, jika |a| &lt; 1
          grafik memampat.
        </li>
        <li>
          <strong>Peregangan horizontal</strong>: f(bx) mengalikan setiap
          absis dengan 1/b. Jika |b| &gt; 1 grafik memampat, jika |b| &lt; 1
          grafik meregang.
        </li>
        <li>
          <strong>Titik (h, k)</strong> berperan sebagai titik asal baru:
          peregangan dan refleksi terjadi terhadap garis x = h dan y = k.
        </li>
      </ul>
    </div>
  );
}
