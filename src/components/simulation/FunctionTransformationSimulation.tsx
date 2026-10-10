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
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./FunctionTransformationSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useGraphAppearance } from "./simulationBoard";
import { useStoredSimulationState } from "./useStoredSimulationState";

/* Simulasi transformasi fungsi (disusun ulang, mengikuti simulasi vektor).
   Prioritas: ponsel lanskap → desktop → ponsel potret.
   Wilayah grafik : wilayah input = 2 : 1.
   - Layar kecil / layar penuh: panel kanan bertab (Fungsi, Ubah, Lainnya,
     Hasil) agar semuanya muat tanpa gulir panjang.
   - Desktop: panel input bertumpuk di kanan, hasil di bawah.
   Fungsi awal f(x) dapat diketik sendiri (mis. x^2 − 3, sin(x), 1/x). */

/* ---------- Tipe ---------- */

type Vec = [number, number];
type Fn = (x: number) => number;
type ParamKey = "h" | "k" | "a" | "b" | "x0";
type PanelTab = "function" | "transform" | "more" | "result";

/** g(x) = a · f(b(x − h)) + k */
type Params = { h: number; k: number; a: number; b: number; x0: number };

const panelTabs: { tab: PanelTab; label: string }[] = [
  { tab: "function", label: "Fungsi" },
  { tab: "transform", label: "Ubah" },
  { tab: "more", label: "Lainnya" },
  { tab: "result", label: "Hasil" },
];

type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
};

/* ---------- Konstanta ---------- */

const SAMPLES = 1000;
const Y_LIMIT = 1000;
const INITIAL_BOX: [number, number, number, number] = [-10, 10, 10, -10];
/** Layar kecil atau pendek memakai panel bertab. */
const TABBED_QUERY = "(max-width: 899px), (max-height: 540px)";

const keyLetters = ["A", "B", "C", "D", "E"];
const KEY_CANDIDATES = [-2, -1, 0, 1, 2, 3, 0.5, 4, -3, -0.5, 8];

const colors = {
  original: "#087f8c",
  image: "#d16b36",
  guide: "#183e54",
};

const DEFAULT_EXPRESSION = "x^2";
const defaultParams: Params = { h: 2, k: 1, a: 2, b: 1, x0: 1 };
const identityParams: Params = { h: 0, k: 0, a: 1, b: 1, x0: 1 };

const presets: { label: string; expr: string }[] = [
  { label: "x", expr: "x" },
  { label: "x²", expr: "x^2" },
  { label: "x³", expr: "x^3" },
  { label: "|x|", expr: "abs(x)" },
  { label: "√x", expr: "sqrt(x)" },
  { label: "1/x", expr: "1/x" },
  { label: "sin x", expr: "sin(x)" },
  { label: "eˣ", expr: "e^x" },
  { label: "ln x", expr: "ln(x)" },
];

const paramRows: {
  key: ParamKey;
  label: string;
  sub: string;
  tone: "shift" | "stretch";
  min: number;
  max: number;
  step: number;
  nonZero: boolean;
}[] = [
  {
    key: "h",
    label: "h",
    sub: "geser x",
    tone: "shift",
    min: -8,
    max: 8,
    step: 0.5,
    nonZero: false,
  },
  {
    key: "k",
    label: "k",
    sub: "geser y",
    tone: "shift",
    min: -8,
    max: 8,
    step: 0.5,
    nonZero: false,
  },
  {
    key: "a",
    label: "a",
    sub: "regang y",
    tone: "stretch",
    min: -4,
    max: 4,
    step: 0.25,
    nonZero: true,
  },
  {
    key: "b",
    label: "b",
    sub: "regang x",
    tone: "stretch",
    min: -4,
    max: 4,
    step: 0.25,
    nonZero: true,
  },
];

const probeRow = {
  key: "x0" as ParamKey,
  label: "x₀",
  sub: "titik P",
  tone: "probe" as const,
  min: -8,
  max: 8,
  step: 0.25,
  nonZero: false,
};

/* ---------- Pengurai ekspresi (tanpa eval) ---------- */

const FUNCS: Record<string, Fn> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: (u) => (u >= 0 ? Math.sqrt(u) : Number.NaN),
  abs: Math.abs,
  ln: (u) => (u > 0 ? Math.log(u) : Number.NaN),
  log: (u) => (u > 0 ? Math.log10(u) : Number.NaN),
  exp: Math.exp,
};
const NAMES = ["sqrt", "sin", "cos", "tan", "abs", "exp", "log", "ln", "pi"];

type Tok =
  { t: "num"; v: number } | { t: "id"; v: string } | { t: "op"; v: string };

function tokenize(src: string): Tok[] | null {
  const s = src
    .toLowerCase()
    .replace(/[−–]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/ˣ/g, "^x")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j += 1;
      const text = s.slice(i, j);
      if (!/^(\d+\.?\d*|\.\d+)$/.test(text)) return null;
      out.push({ t: "num", v: Number(text) });
      i = j;
    } else if (/[a-z]/.test(c)) {
      const name = NAMES.find((n) => s.startsWith(n, i));
      if (name) {
        out.push({ t: "id", v: name });
        i += name.length;
      } else if (c === "x" || c === "e") {
        out.push({ t: "id", v: c });
        i += 1;
      } else {
        return null;
      }
    } else if ("+-*/^()".includes(c)) {
      out.push({ t: "op", v: c });
      i += 1;
    } else {
      return null;
    }
  }
  return out;
}

class ParseError extends Error {}

function compileExpression(
  src: string,
): { fn: Fn; error?: undefined } | { fn?: undefined; error: string } {
  const tokens = tokenize(src);
  if (!tokens || tokens.length === 0) {
    return { error: "Tulis fungsi dalam x, mis. x^2 − 3 atau sin(x)." };
  }
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (v: string) => {
    const tk = peek();
    return tk !== undefined && tk.t === "op" && tk.v === v;
  };
  const startsFactor = () => {
    const tk = peek();
    return (
      tk !== undefined &&
      (tk.t === "id" || (tk.t === "op" && tk.v === "(") || tk.t === "num")
    );
  };

  const parseExpr = (): Fn => {
    let left = parseTerm();
    while (isOp("+") || isOp("-")) {
      const plus = isOp("+");
      pos += 1;
      const l = left;
      const r = parseTerm();
      left = plus ? (x) => l(x) + r(x) : (x) => l(x) - r(x);
    }
    return left;
  };

  const parseTerm = (): Fn => {
    let left = parseUnary();
    for (;;) {
      if (isOp("*") || isOp("/")) {
        const times = isOp("*");
        pos += 1;
        const l = left;
        const r = parseUnary();
        left = times ? (x) => l(x) * r(x) : (x) => l(x) / r(x);
      } else if (startsFactor() && peek()?.t !== "num") {
        const l = left;
        const r = parseUnary();
        left = (x) => l(x) * r(x);
      } else {
        return left;
      }
    }
  };

  const parseUnary = (): Fn => {
    if (isOp("-")) {
      pos += 1;
      const inner = parseUnary();
      return (x) => -inner(x);
    }
    if (isOp("+")) {
      pos += 1;
      return parseUnary();
    }
    return parsePower();
  };

  const parsePower = (): Fn => {
    const base = parseAtom();
    if (isOp("^")) {
      pos += 1;
      const exponent = parseUnary();
      return (x) => Math.pow(base(x), exponent(x));
    }
    return base;
  };

  const parseAtom = (): Fn => {
    const tk = peek();
    if (!tk) throw new ParseError("Ekspresi belum lengkap.");
    if (tk.t === "num") {
      pos += 1;
      const v = tk.v;
      return () => v;
    }
    if (tk.t === "op" && tk.v === "(") {
      pos += 1;
      const inner = parseExpr();
      if (!isOp(")")) throw new ParseError("Tanda kurung belum ditutup.");
      pos += 1;
      return inner;
    }
    if (tk.t === "id") {
      pos += 1;
      if (tk.v === "x") return (x) => x;
      if (tk.v === "e") return () => Math.E;
      if (tk.v === "pi") return () => Math.PI;
      const f = FUNCS[tk.v];
      const arg = isOp("(") ? parseAtom() : parsePower();
      return (x) => f(arg(x));
    }
    throw new ParseError("Ada tanda yang tidak dikenali.");
  };

  try {
    const fn = parseExpr();
    if (pos < tokens.length)
      throw new ParseError("Ada bagian yang tidak dikenali.");
    return { fn };
  } catch (error) {
    return {
      error:
        error instanceof ParseError
          ? `${error.message} Contoh: x^2 − 3, sin(x), 1/x, sqrt(x), abs(x), e^x, ln(x).`
          : "Ekspresi tidak dapat dibaca.",
    };
  }
}

/** Absis titik kunci: lima titik pertama yang terdefinisi pada f. */
function computeKeys(fn: Fn) {
  const picked: number[] = [];
  for (const u of KEY_CANDIDATES) {
    const y = fn(u);
    if (Number.isFinite(y) && Math.abs(y) <= 30 && !picked.includes(u)) {
      picked.push(u);
      if (picked.length === keyLetters.length) break;
    }
  }
  return picked.sort((m, n) => m - n);
}

/* ---------- Format ---------- */

function cleanNumber(value: number) {
  const rounded = Math.round(value * 1000) / 1000;
  return Math.abs(rounded) < 1e-9 ? 0 : rounded;
}

function formatValue(value: number) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 })
    .format(cleanNumber(value))
    .replace("-", "−");
}

const formatCoord = ([x, y]: Vec) => `(${formatValue(x)}; ${formatValue(y)})`;

const signed = (value: number) =>
  value < 0 ? `− ${formatValue(-value)}` : `+ ${formatValue(value)}`;

const toField = (value: number) => String(cleanNumber(value)).replace(".", ",");

/** Teks angka valid → angka; selain itu null (mis. "−" yang belum selesai). */
function parseNumber(text: string): number | null {
  const normalized = text.trim().replace("−", "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/* ---------- Matematika ---------- */

/** Titik (x, y) pada f menjadi (h + x/b, a·y + k) pada g. */
const mapPoint = (p: Params, [x, y]: Vec): Vec => [
  p.h + x / p.b,
  p.a * y + p.k,
];

function probeOf(fn: Fn, p: Params) {
  const y = fn(p.x0);
  if (!Number.isFinite(y)) return null;
  const base: Vec = [p.x0, y];
  return { base, image: mapPoint(p, base) };
}

/** Titik-titik kurva y = a·f(b(x − h)) + k; NaN memutus garis (asimtot, di luar daerah asal). */
function sampleCurve(
  fn: Fn,
  p: Params,
  xMin: number,
  xMax: number,
  ySpan: number,
) {
  const nodes: number[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    nodes.push(xMin + (i / SAMPLES) * (xMax - xMin));
  }
  if (p.h > xMin && p.h < xMax && !nodes.includes(p.h)) {
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

  let previous: number | null = null;
  for (const x of nodes) {
    const y = p.a * fn(p.b * (x - p.h)) + p.k;
    if (Number.isFinite(y) && Math.abs(y) <= Y_LIMIT) {
      // Lompatan besar dengan tanda berganti = asimtot tegak.
      if (
        previous !== null &&
        Math.abs(y - previous) > 2 * ySpan &&
        y * previous < 0
      ) {
        gap();
      }
      xs.push(x);
      ys.push(y);
      previous = y;
    } else {
      gap();
      previous = null;
    }
  }

  if (xs.length === 0) {
    xs.push(Number.NaN);
    ys.push(Number.NaN);
  }
  return { xs, ys };
}

/* ---------- Teks ---------- */

/** Ekspresi ketikan → tampilan rapi (spasi, minus, pangkat, √, π). */
function displayExpression(raw: string) {
  return raw
    .replace(/\s+/g, "")
    .replace(/-/g, "−")
    .replace(/([^\s(^*+−/])([+−])/g, "$1 $2 ")
    .replace(/\^2(?!\d)/g, "²")
    .replace(/\^3(?!\d)/g, "³")
    .replace(/\bsqrt\b/g, "√")
    .replace(/\bpi\b/g, "π")
    .replace(/\*/g, "·");
}

/** Mengganti x pada ekspresi dengan argumen baru. */
function substituteX(display: string, arg: string) {
  return display.replace(/\bx\b/g, (_m, offset: number, whole: string) => {
    if (arg === "x") return "x";
    return whole[offset - 1] === "(" && whole[offset + 1] === ")"
      ? arg
      : `(${arg})`;
  });
}

function hasTopLevelOperator(text: string) {
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === "(") depth += 1;
    else if (c === ")") depth -= 1;
    else if (
      depth === 0 &&
      (c === " " || c === "·" || (c === "−" && i === 0))
    ) {
      return true;
    }
  }
  return false;
}

function argumentText(h: number, b: number) {
  const inner =
    h === 0 ? "x" : `x ${h > 0 ? "−" : "+"} ${formatValue(Math.abs(h))}`;
  if (b === 1) return inner;
  const factor = b === -1 ? "−" : formatValue(b);
  return h === 0 ? `${factor}x` : `${factor}(${inner})`;
}

function formulaText(expression: string, { h, k, a, b }: Params) {
  const core = substituteX(displayExpression(expression), argumentText(h, b));
  const wrapped = hasTopLevelOperator(core) ? `(${core})` : core;
  let body: string;
  if (a === 1) body = core;
  else if (a === -1) body = `−${wrapped}`;
  else body = `${formatValue(a)} · ${wrapped}`;
  const shift =
    k === 0 ? "" : ` ${k > 0 ? "+" : "−"} ${formatValue(Math.abs(k))}`;
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
    className: "ft-nudge-button",
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

/** Satu baris: h  −  ──●──  +  [ 2 ] */
function SliderField({
  label,
  sub,
  tone,
  value,
  min,
  max,
  step,
  nonZero,
  onChange,
  onNudge,
}: {
  label: string;
  sub: string;
  tone: "shift" | "stretch" | "probe";
  value: number;
  min: number;
  max: number;
  step: number;
  nonZero: boolean;
  onChange: (value: number) => void;
  onNudge: (direction: 1 | -1) => void;
}) {
  const inputId = `ft-field-${useId().replace(/:/g, "")}`;
  const bind = useHoldRepeat(onNudge);
  const [text, setText] = useState(() => toField(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(toField(value));
  }, [value]);

  // Isi dari titik 0 menuju nilai, karena parameter bisa negatif.
  const clamped = Math.min(max, Math.max(min, value));
  const span = max - min;
  const pct = ((clamped - min) / span) * 100;
  const zero = ((0 - min) / span) * 100;
  const rangeStyle = {
    "--lo": `${Math.min(zero, pct)}%`,
    "--hi": `${Math.max(zero, pct)}%`,
  } as CSSProperties;

  const onText = (next: string) => {
    setText(next);
    const parsed = parseNumber(next);
    if (parsed === null) return;
    if (nonZero && parsed === 0) return;
    onChange(Math.min(max, Math.max(min, parsed)));
  };

  return (
    <div className={`ft-row ft-row-${tone}`}>
      <label htmlFor={inputId} aria-label={`${label} (${sub})`}>
        {label}
        <small>{sub}</small>
      </label>
      <button {...bind(-1)} aria-label={`Kurangi ${label}`}>
        <Minus size={13} aria-hidden="true" />
      </button>
      <input
        className="ft-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        style={rangeStyle}
        aria-label={`Penggeser ${label}`}
        aria-valuetext={`${label} sama dengan ${formatValue(value)}`}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
      <button {...bind(1)} aria-label={`Tambah ${label}`}>
        <Plus size={13} aria-hidden="true" />
      </button>
      <input
        id={inputId}
        className="ft-num"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        value={text}
        onChange={(event) => onText(event.currentTarget.value)}
        onFocus={(event) => {
          focused.current = true;
          event.currentTarget.select();
        }}
        onBlur={() => {
          focused.current = false;
          setText(toField(value));
        }}
      />
    </div>
  );
}

/* ---------- Komponen utama ---------- */

export function FunctionTransformationSimulation() {
  const baseId = useId().replace(/:/g, "");
  const boardId = `ft-board-${baseId}`;
  const ruleTitleId = `ft-rule-title-${baseId}`;
  const tableTitleId = `ft-table-title-${baseId}`;
  const [tab, setTab] = useState<PanelTab>("function");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nativeFullscreenRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const smallScreen = useMediaQuery(TABBED_QUERY);
  const tabbed = smallScreen || isFullscreen;
  const boardRef = useRef<ReturnType<typeof JXG.JSXGraph.initBoard> | null>(
    null,
  );
  const { appearance, onStep } = useGraphAppearance([boardRef]);

  const [expression, setExpression] = useStoredSimulationState(
    "function-transformation.expression",
    DEFAULT_EXPRESSION,
  );
  const [params, setParams] = useStoredSimulationState(
    "function-transformation.params",
    defaultParams,
  );
  const [showOriginal, setShowOriginal] = useStoredSimulationState(
    "function-transformation.show-original",
    true,
  );
  const [showKey, setShowKey] = useStoredSimulationState(
    "function-transformation.show-key",
    true,
  );

  const compiled = useMemo(
    () =>
      compileExpression(expression).fn ??
      (compileExpression(DEFAULT_EXPRESSION).fn as Fn),
    [expression],
  );

  const [exprText, setExprText] = useState(expression);
  const [exprError, setExprError] = useState<string | null>(null);

  const functionRef = useRef<Fn>(compiled);
  const keysRef = useRef<number[]>(computeKeys(compiled));
  const paramsRef = useRef<Params>(params);
  const showOriginalRef = useRef(showOriginal);
  const showKeyRef = useRef(showKey);

  const refresh = () => boardRef.current?.update();

  /* Fungsi awal f(x) yang diketik */
  const commitExpression = (text: string) => {
    const result = compileExpression(text);
    if (!result.fn) {
      setExprError(result.error);
      return;
    }
    setExprError(null);
    functionRef.current = result.fn;
    keysRef.current = computeKeys(result.fn);
    setExpression(text.trim());
    refresh();
  };

  const changeExpression = (text: string) => {
    setExprText(text);
    commitExpression(text);
  };

  const choosePreset = (expr: string) => {
    setExprText(expr);
    commitExpression(expr);
  };

  /* Parameter transformasi */
  const patchParams = (patch: Partial<Params>) => {
    const next = { ...paramsRef.current, ...patch };
    paramsRef.current = next;
    setParams(next);
    refresh();
  };

  const changeParam = (key: ParamKey, raw: number) => {
    const row = key === "x0" ? probeRow : paramRows.find((r) => r.key === key);
    let value = raw;
    /* Nilai 0 dilewati: a = 0 atau b = 0 membuat grafik menjadi garis datar. */
    if (row?.nonZero && value === 0) {
      value = paramsRef.current[key] > 0 ? -row.step : row.step;
    }
    patchParams({ [key]: value } as Partial<Params>);
  };

  const nudgeParam = (key: ParamKey, direction: 1 | -1) => {
    const row = key === "x0" ? probeRow : paramRows.find((r) => r.key === key);
    if (!row) return;
    let next = cleanNumber(paramsRef.current[key] + direction * row.step);
    if (row.nonZero && next === 0) next = direction * row.step;
    changeParam(key, Math.min(row.max, Math.max(row.min, next)));
  };

  const mirror = (key: "a" | "b") =>
    patchParams(
      key === "a" ? { a: -paramsRef.current.a } : { b: -paramsRef.current.b },
    );

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
    choosePreset(DEFAULT_EXPRESSION);
    showOriginalRef.current = true;
    setShowOriginal(true);
    showKeyRef.current = true;
    setShowKey(true);
    patchParams({ ...defaultParams });
  };

  /* Tampilan: zoom, pusatkan, layar penuh */
  const zoomIn = () => boardRef.current?.zoomIn();
  const zoomOut = () => boardRef.current?.zoomOut();
  const resetView = () => boardRef.current?.setBoundingBox(INITIAL_BOX, true);

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
    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: INITIAL_BOX,
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

    /* Garis x = h dan y = k (titik (h, k) menggantikan titik asal) */
    const guideAttrs = {
      strokeColor: colors.guide,
      strokeWidth: 1.5,
      strokeOpacity: 0.7,
      dash: 3,
      highlight: false,
      fixed: true,
    };
    const guideX = () =>
      paramsRef.current.h === 0 ? 1000 : paramsRef.current.h;
    const guideY = () =>
      paramsRef.current.k === 0 ? 1000 : paramsRef.current.k;
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

    /* Kurva berdasarkan titik-titik; NaN memutus garis */
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

    /* Kurva dihitung pada rentang x yang sedang terlihat (+10% margin),
       sehingga tetap utuh saat grafik digeser atau di-zoom. */
    const view = () => {
      const [x1, y1, x2, y2] = board.getBoundingBox();
      const margin = (x2 - x1) * 0.1;
      return { xMin: x1 - margin, xMax: x2 + margin, ySpan: Math.abs(y1 - y2) };
    };

    makeCurve(colors.original, 2.5, () => {
      if (!showOriginalRef.current)
        return { xs: [Number.NaN], ys: [Number.NaN] };
      const { xMin, xMax, ySpan } = view();
      return sampleCurve(
        functionRef.current,
        identityParams,
        xMin,
        xMax,
        ySpan,
      );
    });
    makeCurve(colors.image, 3, () => {
      const { xMin, xMax, ySpan } = view();
      return sampleCurve(
        functionRef.current,
        paramsRef.current,
        xMin,
        xMax,
        ySpan,
      );
    });

    /* Titik kunci: asal dan bayangannya */
    const keyBase = (i: number): Vec => {
      const u = keysRef.current[i];
      if (!showKeyRef.current || u === undefined) {
        return [Number.NaN, Number.NaN];
      }
      return [u, functionRef.current(u)];
    };
    const keyImage = (i: number): Vec => {
      const base = keyBase(i);
      return Number.isNaN(base[0]) ? base : mapPoint(paramsRef.current, base);
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
    };
  }, [boardId]);

  /* ---------- Turunan untuk tampilan ---------- */

  const { h, k, a, b } = params;
  const formula = formulaText(expression, params);
  const baseFormula = `f(x) = ${displayExpression(expression)}`;
  const effects = describeEffects(params);
  const probe = probeOf(compiled, params);

  const keyRows = computeKeys(compiled).map((u, i) => {
    const base: Vec = [u, compiled(u)];
    return { name: keyLetters[i], base, image: mapPoint(params, base) };
  });
  const rows = probe
    ? [...keyRows, { name: "P", base: probe.base, image: probe.image }]
    : keyRows;

  const bText = b < 0 ? `(${formatValue(b)})` : formatValue(b);
  const mappingX = `x′ = ${formatValue(h)} + x/${bText}`;
  const mappingY = `y′ = ${formatValue(a)} · y ${signed(k)}`;
  const caption = formula;

  return (
    <div
      ref={rootRef}
      className={`function-transformation-simulation simulation-fullscreen-frame${
        tabbed ? " is-tabbed" : ""
      }${isFullscreen ? " is-fullscreen" : ""}`}
    >
      <p className="ft-orientation-hint">
        <Smartphone size={14} aria-hidden="true" />
        <span>
          Miringkan ponsel ke mode lanskap agar bidang koordinat dan panel isian
          tampil berdampingan.
        </span>
      </p>

      <div className="ft-main">
        {/* ───── Wilayah grafik (2 bagian) ───── */}
        <section className="ft-board-panel" aria-label="Bidang koordinat">
          <div className="ft-stage">
            <div
              className="ft-board"
              id={boardId}
              ref={containerRef}
              aria-label="Bidang koordinat interaktif. Grafik awal f(x) berwarna biru kehijauan dan grafik hasil transformasi g(x) berwarna oranye. Seret area kosong untuk menggeser bidang, gulir atau cubit untuk memperbesar atau memperkecil."
            />
            <p className="ft-caption" aria-live="polite">
              {caption}
            </p>
            <div className="ft-view-tools" role="group" aria-label="Tampilan">
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
        </section>

        {/* ───── Wilayah input (1 bagian) ───── */}
        <div className="ft-column" data-tab={tab}>
          <div className="ft-tabs" role="group" aria-label="Bagian panel">
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

          <section className="ft-side" aria-label="Pengaturan transformasi">
            <div className="ft-panel" data-pane="function">
              <h3>Fungsi awal f(x)</h3>
              <div className="ft-expr-row">
                <label htmlFor={`${baseId}-expr`} className="ft-expr-label">
                  f(x) =
                </label>
                <input
                  id={`${baseId}-expr`}
                  className="ft-expr"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                  placeholder="mis. x^2 − 3"
                  value={exprText}
                  aria-invalid={exprError !== null}
                  aria-describedby={`${baseId}-expr-note`}
                  onChange={(event) =>
                    changeExpression(event.currentTarget.value)
                  }
                  onFocus={(event) => event.currentTarget.select()}
                />
              </div>
              <p
                id={`${baseId}-expr-note`}
                className={`ft-expr-note${exprError ? " is-error" : ""}`}
                role={exprError ? "alert" : undefined}
              >
                {exprError ??
                  "Pangkat: ^ · akar: sqrt(x) · nilai mutlak: abs(x) · juga sin, cos, tan, ln, log, e^x, pi."}
              </p>
              <div
                className="ft-segmented"
                role="group"
                aria-label="Contoh fungsi awal"
              >
                {presets.map((preset) => (
                  <button
                    key={preset.expr}
                    type="button"
                    aria-pressed={expression === preset.expr}
                    onClick={() => choosePreset(preset.expr)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <label className="ft-check">
                <input
                  type="checkbox"
                  checked={showOriginal}
                  onChange={(event) =>
                    toggleOriginal(event.currentTarget.checked)
                  }
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

            <div className="ft-panel" data-pane="transform">
              <h3>Translasi, peregangan, dan refleksi</h3>
              <div className="ft-rows">
                {paramRows.map((row) => (
                  <SliderField
                    key={row.key}
                    label={row.label}
                    sub={row.sub}
                    tone={row.tone}
                    value={params[row.key]}
                    min={row.min}
                    max={row.max}
                    step={row.step}
                    nonZero={row.nonZero}
                    onChange={(v) => changeParam(row.key, v)}
                    onNudge={(d) => nudgeParam(row.key, d)}
                  />
                ))}
              </div>
              <div className="ft-segmented ft-mirror">
                <button
                  type="button"
                  aria-pressed={a < 0}
                  onClick={() => mirror("a")}
                >
                  Cerminkan a → −a
                </button>
                <button
                  type="button"
                  aria-pressed={b < 0}
                  onClick={() => mirror("b")}
                >
                  Cerminkan b → −b
                </button>
              </div>
              <p className="ft-hint">
                g(x) = a · f(b(x − h)) + k. Nilai negatif menghasilkan refleksi:
                a &lt; 0 terhadap garis y = k, b &lt; 0 terhadap garis x = h.
              </p>
              <div className="ft-reset-row">
                <button
                  type="button"
                  className="ft-reset-button"
                  onClick={clearTransformation}
                >
                  Tanpa transformasi
                </button>
              </div>
            </div>

            <div className="ft-panel" data-pane="more">
              <h3>Titik uji</h3>
              <div className="ft-rows">
                <SliderField
                  label={probeRow.label}
                  sub={probeRow.sub}
                  tone={probeRow.tone}
                  value={params.x0}
                  min={probeRow.min}
                  max={probeRow.max}
                  step={probeRow.step}
                  nonZero={false}
                  onChange={(v) => changeParam("x0", v)}
                  onNudge={(d) => nudgeParam("x0", d)}
                />
              </div>
              <p className="ft-probe-note">
                {probe
                  ? `P${formatCoord(probe.base)} → P′${formatCoord(probe.image)}`
                  : `x = ${formatValue(params.x0)} berada di luar daerah asal f(x).`}
              </p>
            </div>

            <div className="ft-reset-row" data-pane="more">
              <button
                type="button"
                className="ft-reset-button"
                onClick={resetAll}
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Atur ulang semua</span>
              </button>
              <GraphAppearanceControls
                appearance={appearance}
                onStep={onStep}
              />
            </div>
          </section>

          <div className="ft-results" data-pane="result">
            <section className="ft-panel ft-wide" aria-labelledby={ruleTitleId}>
              <h3 id={ruleTitleId}>Persamaan grafik</h3>
              <div className="ft-card-grid">
                <article className="ft-card">
                  <h4>Bentuk umum</h4>
                  <p className="ft-formula">g(x) = a · f(b(x − h)) + k</p>
                  <p>
                    h dan k menggeser grafik, a meregangkan vertikal, b
                    meregangkan horizontal.
                  </p>
                </article>
                <article className="ft-card">
                  <h4>Grafik awal</h4>
                  <p className="ft-formula ft-formula-original">
                    {baseFormula}
                  </p>
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
              <ul className="ft-effects">
                {effects.map((effect) => (
                  <li key={effect.title}>
                    <strong>{effect.title}:</strong> {effect.text}
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="ft-panel ft-wide"
              aria-labelledby={tableTitleId}
            >
              <h3 id={tableTitleId}>Titik kunci dan titik uji</h3>
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
                        <td className="ft-cell-original">
                          {formatCoord(row.base)}
                        </td>
                        <td className="ft-cell-image">
                          {formatCoord(row.image)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      <ul className="ft-insights">
        <li>
          <strong>Translasi</strong>: g(x) = f(x − h) + k menggeser grafik h
          satuan ke kanan dan k satuan ke atas. Perubahan di dalam f memengaruhi
          x dan arahnya tampak berlawanan.
        </li>
        <li>
          <strong>Refleksi</strong>: −f(x) mencerminkan grafik terhadap sumbu x,
          sedangkan f(−x) mencerminkannya terhadap sumbu y.
        </li>
        <li>
          <strong>Peregangan vertikal</strong>: a · f(x) mengalikan setiap
          ordinat dengan a. Jika |a| &gt; 1 grafik meregang, jika |a| &lt; 1
          grafik memampat.
        </li>
        <li>
          <strong>Peregangan horizontal</strong>: f(bx) mengalikan setiap absis
          dengan 1/b. Jika |b| &gt; 1 grafik memampat, jika |b| &lt; 1 grafik
          meregang.
        </li>
        <li>
          <strong>Titik (h, k)</strong> berperan sebagai titik asal baru:
          peregangan dan refleksi terjadi terhadap garis x = h dan y = k.
        </li>
      </ul>
    </div>
  );
}
