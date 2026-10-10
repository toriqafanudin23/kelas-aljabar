import {
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Smartphone,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./TwoCircleTangentSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useGraphAppearance } from "./simulationBoard";
import { useStoredSimulationState } from "./useStoredSimulationState";

/* Simulasi dua lingkaran dan garis singgung persekutuannya.
   Lingkaran 1: pusat O₁(x₁, y₁), jari-jari r₁. Lingkaran 2: O₂(x₂, y₂), r₂.
   d = jarak kedua pusat.

   Garis singgung persekutuan ν·X = c (ν = vektor satuan normal) memenuhi
       ν·O₁ − c = s₁ r₁   dan   ν·O₂ − c = s₂ r₂,   s = ±1
   - luar  (kedua pusat di sisi yang sama, s₁ = s₂):   ada bila d ≥ |r₁ − r₂|
   - dalam (pusat di sisi berlawanan,      s₁ = −s₂):  ada bila d ≥ r₁ + r₂
   Panjang ruas singgung:  luar √(d² − (r₁ − r₂)²),  dalam √(d² − (r₁ + r₂)²).

   Alat bantu belajar (ditambahkan):
   - Fokus satu garis singgung (Luar 1/2, Dalam 1/2).
   - Tanda siku-siku (jari-jari ⟂ garis singgung) di titik singgung.
   - Label panjang ruas singgung ℓ langsung pada grafik.
   - Mode "Proses": 4 langkah mencari ℓ lewat segitiga siku-siku bantu O₁PO₂.
       Garis bantu dari O₂ sejajar T₁T₂ memotong O₁T₁ (atau perpanjangannya) di P.
       Karena T₁T₂O₂P persegi panjang: PO₂ = ℓ, T₁P = r₂,
       O₁P = |r₁ − r₂| (luar) atau r₁ + r₂ (dalam), dan O₁O₂ = d.

   Tata letak: ponsel lanskap → desktop → ponsel potret.
   Wilayah grafik : wilayah input = 2 : 1. */

/* ---------- Tipe ---------- */

type Vec = [number, number];
type Params = {
  x1: number;
  y1: number;
  r1: number;
  x2: number;
  y2: number;
  r2: number;
};
type Opts = {
  ext: boolean;
  int: boolean;
  points: boolean;
  radii: boolean;
  rad: boolean;
  centerline: boolean;
  homothety: boolean;
  extend: boolean;
  fill: boolean;
  rightAngle: boolean;
  lengths: boolean;
  extRadius: boolean;
  parLine: boolean;
};
type PanelTab = "par" | "opt" | "proc" | "res" | "info";
/** Garis singgung yang ditampilkan: semua, atau tepat satu. */
type Focus = "all" | "ext-0" | "ext-1" | "int-0" | "int-1";
type Kind = "ext" | "int";
type Anim = "d" | null;
type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;
type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
  setAttribute: (attributes: Record<string, unknown>) => void;
};
/** Titik pusat yang bisa diseret. */
type DragPoint = {
  X: () => number;
  Y: () => number;
  setPosition: (method: number, coords: number[]) => unknown;
  on: (event: string, handler: () => void) => unknown;
};
type Tangent = {
  /** +1 = singgung luar, −1 = singgung dalam (tanda sisi pusat O₂) */
  s: 1 | -1;
  nx: number;
  ny: number;
  c: number;
  t1: Vec;
  t2: Vec;
};

/* ---------- Konstanta ---------- */

/** JXG.COORDS_BY_USER */
const COORDS_BY_USER = 1;
const X_LIM = 10;
const Y_LIM = 7;
const R_MIN = 0.5;
const R_MAX = 6;
const D_CAP = 20;
/** Toleransi (satuan jarak) untuk menganggap dua lingkaran bersinggungan. */
const EPS = 0.006;
const HOME_BOX: [number, number, number, number] = [-14, 10, 14, -10];
/** Layar kecil atau pendek memakai panel kanan bertab. */
const TABBED_QUERY = "(max-width: 899px), (max-height: 540px)";

const DEFAULT_PARAMS: Params = { x1: -4, y1: -1, r1: 3, x2: 4, y2: 2, r2: 2 };
const DEFAULT_OPTS: Opts = {
  ext: true,
  int: true,
  points: true,
  radii: false,
  rad: true,
  centerline: true,
  homothety: false,
  extend: true,
  fill: true,
  rightAngle: true,
  lengths: true,
  extRadius: false,
  parLine: false,
};

const COLOR_C1 = "#087f8c";
const COLOR_C2 = "#6b4e9b";
const COLOR_EXT = "#2f6bd0";
const COLOR_INT = "#b23a48";
const COLOR_GUIDE = "#63727d";
const COLOR_TOUCH = "#183e54";
const COLOR_HELP = "#c77700";

const FOCUS_OPTIONS: {
  key: Focus;
  label: string;
  title: string;
  color: string;
}[] = [
  {
    key: "all",
    label: "Semua",
    title: "Tampilkan semua garis singgung",
    color: COLOR_TOUCH,
  },
  {
    key: "ext-0",
    label: "Luar 1",
    title: "Hanya garis singgung persekutuan luar 1",
    color: COLOR_EXT,
  },
  {
    key: "ext-1",
    label: "Luar 2",
    title: "Hanya garis singgung persekutuan luar 2",
    color: COLOR_EXT,
  },
  {
    key: "int-0",
    label: "Dalam 1",
    title: "Hanya garis singgung persekutuan dalam 1",
    color: COLOR_INT,
  },
  {
    key: "int-1",
    label: "Dalam 2",
    title: "Hanya garis singgung persekutuan dalam 2",
    color: COLOR_INT,
  },
];
const FOCUS_NAME: Record<Focus, string> = {
  all: "Semua",
  "ext-0": "Luar 1",
  "ext-1": "Luar 2",
  "int-0": "Dalam 1",
  "int-1": "Dalam 2",
};
const STEP_COUNT = 4;

const PRESETS: {
  label: string;
  title: string;
  color: string;
  params: Params;
}[] = [
  {
    label: "Terpisah",
    title: "Saling lepas",
    color: COLOR_C1,
    params: { x1: -4, y1: 0, r1: 3, x2: 3.5, y2: 0, r2: 2 },
  },
  {
    label: "Luar",
    title: "Bersinggungan luar",
    color: COLOR_EXT,
    params: { x1: -3, y1: 0, r1: 3, x2: 2, y2: 0, r2: 2 },
  },
  {
    label: "Potong",
    title: "Berpotongan di dua titik",
    color: COLOR_C2,
    params: { x1: -2, y1: 0, r1: 3, x2: 2, y2: 0, r2: 2.5 },
  },
  {
    label: "Dalam",
    title: "Bersinggungan dalam",
    color: COLOR_INT,
    params: { x1: -1, y1: 0, r1: 5, x2: 2, y2: 0, r2: 2 },
  },
];

const panelTabs: { tab: PanelTab; label: string }[] = [
  { tab: "par", label: "Parameter" },
  { tab: "opt", label: "Tampilan" },
  { tab: "proc", label: "Proses" },
  { tab: "res", label: "Hasil" },
  { tab: "info", label: "Info" },
];

const optionRows: { key: keyof Opts; label: string }[] = [
  { key: "ext", label: "Garis singgung persekutuan luar" },
  { key: "int", label: "Garis singgung persekutuan dalam" },
  { key: "points", label: "Titik-titik singgung" },
  { key: "radii", label: "Jari-jari ke titik singgung" },
  { key: "rightAngle", label: "Tanda siku-siku (jari-jari ⟂ garis singgung)" },
  { key: "lengths", label: "Label panjang ruas singgung ℓ" },
  { key: "extRadius", label: "Perpanjang jari-jari melewati titik singgung" },
  { key: "parLine", label: "Garis lewat O₂ sejajar garis singgung" },
  { key: "rad", label: "Jari-jari r₁ dan r₂" },
  { key: "centerline", label: "Garis hubung pusat O₁O₂" },
  { key: "homothety", label: "Titik potong garis singgung (E dan I)" },
  { key: "extend", label: "Perpanjang garis singgung" },
  { key: "fill", label: "Warnai lingkaran" },
];

/* ---------- Matematika ---------- */

/** Jarak terjauh sepanjang arah a dari (x, y) yang masih di dalam batas pusat. */
function rayMax(x: number, y: number, a: number) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  let t = D_CAP;
  if (c > 1e-9) t = Math.min(t, (X_LIM - x) / c);
  else if (c < -1e-9) t = Math.min(t, (-X_LIM - x) / c);
  if (s > 1e-9) t = Math.min(t, (Y_LIM - y) / s);
  else if (s < -1e-9) t = Math.min(t, (-Y_LIM - y) / s);
  return Math.max(0, t);
}

function analyze(p: Params) {
  const { x1, y1, r1, x2, y2, r2 } = p;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy);
  const sum = r1 + r2;
  const diff = Math.abs(r1 - r2);

  let relation: string;
  if (d <= 1e-3) relation = r1 === r2 ? "Berimpit" : "Sepusat (konsentris)";
  else if (d > sum + EPS) relation = "Saling lepas (terpisah)";
  else if (Math.abs(d - sum) <= EPS) relation = "Bersinggungan luar";
  else if (d > diff + EPS) relation = "Berpotongan di dua titik";
  else if (Math.abs(d - diff) <= EPS) relation = "Bersinggungan dalam";
  else relation = "Satu lingkaran di dalam lingkaran lain";

  const ext: Tangent[] = [];
  const inn: Tangent[] = [];
  const ux = d > 1e-9 ? dx / d : 1;
  const uy = d > 1e-9 ? dy / d : 0;
  if (d > 1e-3) {
    const nx = -uy;
    const ny = ux;
    const build = (out: Tangent[], s2: 1 | -1, bound: number) => {
      const gap = d - bound;
      if (gap < -EPS) return;
      const k = Math.min(1, Math.max(-1, (s2 * r2 - r1) / d));
      // tepat bersinggung: kedua garis menyatu menjadi satu
      const h = gap <= EPS ? 0 : Math.sqrt(Math.max(0, 1 - k * k));
      const signs = h === 0 ? [1] : [1, -1];
      signs.forEach((sg) => {
        let vx = k * ux + sg * h * nx;
        let vy = k * uy + sg * h * ny;
        const len = Math.hypot(vx, vy) || 1;
        vx /= len;
        vy /= len;
        out.push({
          s: s2,
          nx: vx,
          ny: vy,
          c: vx * x1 + vy * y1 - r1,
          t1: [x1 - r1 * vx, y1 - r1 * vy],
          t2: [x2 - s2 * r2 * vx, y2 - s2 * r2 * vy],
        });
      });
    };
    build(ext, 1, diff);
    build(inn, -1, sum);
  }

  const nan: Vec = [Number.NaN, Number.NaN];
  // pusat homotetis: titik potong garis singgung luar (E) dan dalam (I)
  const E: Vec =
    ext.length > 0 && diff > 1e-6
      ? [(r2 * x1 - r1 * x2) / (r2 - r1), (r2 * y1 - r1 * y2) / (r2 - r1)]
      : nan;
  const I: Vec =
    inn.length > 0
      ? [(r2 * x1 + r1 * x2) / sum, (r2 * y1 + r1 * y2) / sum]
      : nan;

  return {
    d,
    ux,
    uy,
    sum,
    diff,
    relation,
    ext,
    inn,
    count: ext.length + inn.length,
    lenExt: Math.sqrt(Math.max(0, d * d - diff * diff)),
    lenInt: Math.sqrt(Math.max(0, d * d - sum * sum)),
    E,
    I,
  };
}

type Analysis = ReturnType<typeof analyze>;

const listOfKind = (a: Analysis, kind: Kind) =>
  kind === "ext" ? a.ext : a.inn;

/** Garis singgung yang dijelaskan: pilihan fokus, atau yang pertama ada. */
function resolveTarget(
  a: Analysis,
  focus: Focus,
): { kind: Kind; i: number; t: Tangent } | null {
  if (focus === "all") {
    if (a.ext[0]) return { kind: "ext", i: 0, t: a.ext[0] };
    if (a.inn[0]) return { kind: "int", i: 0, t: a.inn[0] };
    return null;
  }
  const [kind, idx] = focus.split("-") as [Kind, string];
  const t = listOfKind(a, kind)[Number(idx)];
  return t ? { kind, i: Number(idx), t } : null;
}

/** Geometri segitiga bantu O₁PO₂ untuk satu garis singgung.
    P = O₁ − (r₁ − s·r₂)·ν. Luar (s = 1): P pada O₁T₁ dengan T₁P = r₂.
    Dalam (s = −1): P pada perpanjangan O₁T₁ dengan T₁P = r₂.
    T₁T₂O₂P selalu persegi panjang, jadi PO₂ = T₁T₂ dan ∠O₁PO₂ = 90°. */
function helperGeometry(p: Params, t: Tangent) {
  const k = p.r1 - t.s * p.r2;
  const P: Vec = [p.x1 - k * t.nx, p.y1 - k * t.ny];
  return {
    P,
    O1: [p.x1, p.y1] as Vec,
    O2: [p.x2, p.y2] as Vec,
    leg: Math.abs(k),
  };
}

/** Titik-titik busur berpusat di (cx, cy): dari sudut a0 sepanjang span (derajat). */
function arcPoints(
  cx: number,
  cy: number,
  radius: number,
  a0Deg: number,
  spanDeg: number,
): Vec[] {
  const n = Math.max(24, Math.ceil(Math.abs(spanDeg) * 2));
  const out: Vec[] = [];
  for (let i = 0; i <= n; i += 1) {
    const a = ((a0Deg + (spanDeg * i) / n) * Math.PI) / 180;
    out.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
  }
  return out;
}

/* ---------- Format ---------- */

function fmt(value: number, digits = 3) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < Math.pow(10, -digits) / 2) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
    useGrouping: false,
  })
    .format(value)
    .replace("-", "−");
}

const fmtPt = (x: number, y: number) => `(${fmt(x)}; ${fmt(y)})`;

/** Menyusun suku-suku "koef·simbol" menjadi teks dengan tanda yang rapi. */
function poly(terms: [number, string][]) {
  let out = "";
  terms.forEach(([coef, symbol]) => {
    if (Math.abs(coef) < 5e-4) return;
    const abs = Math.abs(coef);
    const body =
      symbol !== "" && Math.abs(abs - 1) < 5e-4
        ? symbol
        : `${fmt(abs)}${symbol}`;
    if (out === "") out = coef < 0 ? `−${body}` : body;
    else out += coef < 0 ? ` − ${body}` : ` + ${body}`;
  });
  return out === "" ? "0" : out;
}

/** (x − h)² dengan tanda yang rapi. */
function sq(variable: string, h: number) {
  if (Math.abs(h) < 5e-4) return `${variable}²`;
  return h > 0 ? `(${variable} − ${fmt(h)})²` : `(${variable} + ${fmt(-h)})²`;
}

const circleEq = (x: number, y: number, r: number) =>
  `${sq("x", x)} + ${sq("y", y)} = ${fmt(r * r)}`;

const lineEq = (t: Tangent) =>
  `${poly([
    [t.nx, "x"],
    [t.ny, "y"],
  ])} = ${fmt(t.c)}`;

const round3 = (v: number) => Math.round(v * 1000) / 1000;

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
    className: "tc-nudge",
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      stop();
      stepRef.current(direction);
      timers.current.delay = window.setTimeout(() => {
        timers.current.repeat = window.setInterval(
          () => stepRef.current(direction),
          70,
        );
      }, 400);
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

/** Satu baris: r  −  ──●──  +  [5]  ▶ */
function ParamRow({
  id,
  label,
  title,
  value,
  min,
  max,
  step,
  nudge,
  digits,
  bipolar,
  tone,
  playing,
  onChange,
  onPlay,
}: {
  id: string;
  label: string;
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  nudge: number;
  digits: number;
  bipolar?: boolean;
  tone: string;
  playing?: boolean;
  onChange: (value: number) => void;
  onPlay?: () => void;
}) {
  const round = (v: number) => {
    const f = Math.pow(10, digits);
    return Math.round(v * f) / f;
  };
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const bind = useHoldRepeat((d) => onChange(round(clamp(value + d * nudge))));
  const pct = max > min ? ((clamp(value) - min) / (max - min)) * 100 : 0;
  const rangeStyle = {
    "--lo": bipolar ? `${Math.min(50, pct)}%` : "0%",
    "--hi": bipolar ? `${Math.max(50, pct)}%` : `${pct}%`,
    "--tone": tone,
  } as CSSProperties;

  return (
    <div className="tc-param" style={{ "--tone": tone } as CSSProperties}>
      <label htmlFor={id} title={title}>
        {label}
      </label>
      <button {...bind(-1)} aria-label={`Kurangi ${title}`}>
        <Minus size={12} aria-hidden="true" />
      </button>
      <input
        className="tc-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value)}
        style={rangeStyle}
        aria-label={`Penggeser ${title}`}
        onChange={(event) =>
          onChange(round(clamp(Number(event.currentTarget.value))))
        }
      />
      <button {...bind(1)} aria-label={`Tambah ${title}`}>
        <Plus size={12} aria-hidden="true" />
      </button>
      <input
        id={id}
        className="tc-num"
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        aria-label={`Nilai ${title}`}
        onChange={(event) => {
          const v = parseFloat(event.currentTarget.value);
          if (Number.isFinite(v)) onChange(round(clamp(v)));
        }}
      />
      {onPlay ? (
        <button
          type="button"
          className="tc-icon-btn"
          aria-pressed={!!playing}
          aria-label={
            playing ? `Hentikan animasi ${title}` : `Animasikan ${title}`
          }
          title={playing ? "Hentikan animasi" : "Animasikan"}
          onClick={onPlay}
        >
          {playing ? (
            <Pause size={12} aria-hidden="true" />
          ) : (
            <Play size={12} aria-hidden="true" />
          )}
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
    </div>
  );
}

const kv = (key: string, value: string) => (
  <div className="tc-kv" key={key}>
    <span>{key}</span>
    <b>{value}</b>
  </div>
);

/* ---------- Komponen utama ---------- */

export function TwoCircleTangentSimulation() {
  const baseId = useId().replace(/:/g, "");
  const boardId = `tc-board-${baseId}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const centersRef = useRef<DragPoint[]>([]);
  const nativeFsRef = useRef(false);
  const syncSizeRef = useRef<(() => void) | null>(null);
  const { appearance, onStep } = useGraphAppearance([boardRef]);

  const [params, setParams] = useStoredSimulationState<Params>(
    "twocircle.params",
    DEFAULT_PARAMS,
  );
  const [storedOpts, setOpts] = useStoredSimulationState<Opts>(
    "twocircle.opts",
    DEFAULT_OPTS,
  );
  // gabungkan dengan nilai bawaan agar pengaturan lama (tanpa opsi baru) tetap valid
  const opts = useMemo<Opts>(
    () => ({ ...DEFAULT_OPTS, ...storedOpts }),
    [storedOpts],
  );
  const [focus, setFocus] = useStoredSimulationState<Focus>(
    "twocircle.focus",
    "all",
  );
  // 0 = mode proses mati; 1..STEP_COUNT = langkah penjelasan
  const [step, setStep] = useState(0);
  const [anim, setAnim] = useState<Anim>(null);
  const [tab, setTab] = useState<PanelTab>("par");
  const [isFull, setIsFull] = useState(false);
  // Panel input hanya dipakai di layar penuh: tersembunyi, muncul mengambang.
  const [panelOpen, setPanelOpen] = useState(false);
  const smallScreen = useMediaQuery(TABBED_QUERY);
  // Layar kecil / pendek dan layar penuh memakai panel kanan bertab.
  const tabbed = smallScreen || isFull;

  // data yang dibaca papan JSXGraph (selalu lewat ref agar tidak basi)
  const pRef = useRef(params);
  pRef.current = params;
  const oRef = useRef(opts);
  oRef.current = opts;
  const lRef = useRef({ focus, step });
  lRef.current = { focus, step };
  const moveRef = useRef<
    (which: 1 | 2, x: number, y: number, pt: DragPoint) => void
  >(() => undefined);
  moveRef.current = (which, x, y, pt) => {
    const cx = Math.min(X_LIM, Math.max(-X_LIM, Math.round(x * 100) / 100));
    const cy = Math.min(Y_LIM, Math.max(-Y_LIM, Math.round(y * 100) / 100));
    // titik pusat tidak boleh keluar dari batas yang diatur slider
    if (cx !== x || cy !== y) pt.setPosition(COORDS_BY_USER, [cx, cy]);
    const prev = pRef.current;
    const next: Params =
      which === 1 ? { ...prev, x1: cx, y1: cy } : { ...prev, x2: cx, y2: cy };
    pRef.current = next;
    setAnim(null);
    setParams(next);
    boardRef.current?.update();
  };

  const an = analyze(params);

  const setParam = (patch: Partial<Params>) => {
    setAnim(null);
    setParams((prev) => ({ ...prev, ...patch }));
  };

  const setOpt = (key: keyof Opts, value: boolean) =>
    setOpts((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setAnim(null);
    setParams(DEFAULT_PARAMS);
    setOpts(DEFAULT_OPTS);
    setFocus("all");
    setStep(0);
    boardRef.current?.setBoundingBox(HOME_BOX, true);
  };

  // Jarak antarpusat sebagai satu pengatur: O₂ bergeser sepanjang garis O₁O₂.
  const angle =
    an.d > 1e-6 ? Math.atan2(params.y2 - params.y1, params.x2 - params.x1) : 0;
  const dMax = Math.max(0.5, rayMax(params.x1, params.y1, angle));
  const setDistance = (value: number) =>
    setParam({
      x2: round3(params.x1 + Math.cos(angle) * value),
      y2: round3(params.y1 + Math.sin(angle) * value),
    });

  /* Tampilan: zoom, pusatkan */
  const zoomIn = () => boardRef.current?.zoomIn();
  const zoomOut = () => boardRef.current?.zoomOut();
  const resetView = () => boardRef.current?.setBoundingBox(HOME_BOX, true);

  /* Layar penuh */
  const toggleFullscreen = async () => {
    const el = rootRef.current;
    if (!el) return;
    if (isFull || document.fullscreenElement === el) {
      if (document.fullscreenElement === el) {
        try {
          await document.exitFullscreen();
        } catch {
          /* diabaikan */
        }
      }
      nativeFsRef.current = false;
      setIsFull(false);
      return;
    }

    // flushSync memastikan kelas .is-fullscreen/.is-tabbed sudah ada di DOM
    // SEBELUM requestFullscreen dipanggil (tanpa ini, React baru menerapkannya
    // sesudahnya, sehingga transisi pertama memakai tata letak desktop).
    flushSync(() => {
      setPanelOpen(false);
      setIsFull(true);
    });
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        nativeFsRef.current = true;
      } catch {
        // Gagal masuk fullscreen asli: tetap pakai mode layar penuh CSS.
      }
    }
  };

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && nativeFsRef.current) {
        nativeFsRef.current = false;
        setIsFull(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !document.fullscreenElement &&
        !nativeFsRef.current
      ) {
        setIsFull(false);
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
    if (!isFull) return undefined;
    if (!window.matchMedia("(pointer: coarse)").matches) return undefined;
    const orientation = (
      screen as unknown as {
        orientation?: {
          lock?: (mode: "landscape") => Promise<void>;
          unlock?: () => void;
        };
      }
    ).orientation;
    if (typeof orientation?.lock !== "function") return undefined;
    orientation.lock("landscape").catch(() => undefined);
    return () => {
      try {
        orientation.unlock?.();
      } catch {
        /* abaikan */
      }
    };
  }, [isFull]);

  /* Papan JSXGraph */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: HOME_BOX,
      axis: false,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: true, // lingkaran harus tetap terlihat bulat
      // Ukuran papan diatur sepenuhnya oleh syncSize di bawah. Pengamat ukuran
      // bawaan JSXGraph (throttle + setTimeout) bisa berebut dan meninggalkan
      // tinggi kanvas yang basi saat masuk layar penuh.
      resize: { enabled: false, throttle: 100 },
      // geser dengan tahan klik kiri atau satu jari (papan memakai touch-action: none)
      pan: { enabled: true, needShift: false, needTwoFingers: false },
      zoom: {
        wheel: true,
        needShift: false,
        factorX: 1.15,
        factorY: 1.15,
        min: 0.15,
        max: 12,
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

    // analisis dihitung sekali per perubahan parameter
    let cache: { p: Params; v: Analysis } | null = null;
    const A = (): Analysis => {
      const p = pRef.current;
      if (!cache || cache.p !== p) cache = { p, v: analyze(p) };
      return cache.v;
    };
    const show = (key: keyof Opts) => oRef.current[key];
    const circ = (which: 1 | 2) => {
      const p = pRef.current;
      return which === 1
        ? { x: p.x1, y: p.y1, r: p.r1 }
        : { x: p.x2, y: p.y2, r: p.r2 };
    };

    const extent = () => {
      const bb = board.getBoundingBox();
      return 4 * Math.max(...bb.map((v: number) => Math.abs(v))) + 30;
    };

    /* Kurva berdasarkan daftar titik; null menyembunyikannya */
    const makeCurve = (
      color: string,
      width: number,
      dash: number,
      opacity: number,
      build: () => Vec[] | null,
      fill?: { color: string; opacity: number },
    ) => {
      const curve = board.create("curve", [[0], [0]], {
        strokeColor: color,
        strokeWidth: width,
        strokeOpacity: opacity,
        fillColor: fill ? fill.color : "none",
        fillOpacity: fill ? fill.opacity : 0,
        dash,
        highlight: false,
        fixed: true,
      }) as unknown as DataCurve;
      curve.updateDataArray = () => {
        const points = build();
        if (
          !points ||
          points.length === 0 ||
          points.some((q) => !Number.isFinite(q[0]) || !Number.isFinite(q[1]))
        ) {
          curve.dataX = [Number.NaN];
          curve.dataY = [Number.NaN];
          return;
        }
        curve.dataX = points.map((q) => q[0]);
        curve.dataY = points.map((q) => q[1]);
      };
      return curve;
    };

    const circlePoints = (which: 1 | 2) => {
      const c = circ(which);
      return arcPoints(c.x, c.y, c.r, 0, 360);
    };
    const colorOf = (which: 1 | 2) => (which === 1 ? COLOR_C1 : COLOR_C2);

    // isi lingkaran (tanpa garis tepi) lalu garis tepinya
    ([1, 2] as const).forEach((which) => {
      makeCurve(
        colorOf(which),
        0,
        0,
        1,
        () => (show("fill") ? circlePoints(which) : null),
        { color: colorOf(which), opacity: 0.1 },
      );
    });
    ([1, 2] as const).forEach((which) => {
      makeCurve(colorOf(which), 3, 0, 1, () => circlePoints(which));
    });

    // garis hubung pusat (diperpanjang bila titik E dan I ditampilkan)
    makeCurve(COLOR_GUIDE, 1.4, 2, 0.9, () => {
      if (!show("centerline")) return null;
      const a = A();
      const p = pRef.current;
      if (a.d < 1e-3) return null;
      if (show("homothety")) {
        const s = extent();
        return [
          [p.x1 - a.ux * s, p.y1 - a.uy * s],
          [p.x1 + a.ux * s, p.y1 + a.uy * s],
        ];
      }
      return [
        [p.x1, p.y1],
        [p.x2, p.y2],
      ];
    });

    // garis singgung persekutuan: garis panjang tipis + ruas T₁T₂ tebal
    const kinds = ["ext", "int"] as const;
    const listOf = (kind: (typeof kinds)[number]) =>
      kind === "ext" ? A().ext : A().inn;
    const colorKind = (kind: (typeof kinds)[number]) =>
      kind === "ext" ? COLOR_EXT : COLOR_INT;

    // apakah garis singgung (kind, i) ditampilkan: mode proses > fokus > pilihan centang
    const target = () => {
      const l = lRef.current;
      return resolveTarget(A(), l.focus);
    };
    const vis = (kind: (typeof kinds)[number], i: number) => {
      const t = listOf(kind)[i];
      if (!t) return false;
      const l = lRef.current;
      if (l.step > 0) {
        const tg = target();
        return !!tg && tg.kind === kind && tg.i === i;
      }
      if (l.focus !== "all") return l.focus === `${kind}-${i}`;
      return show(kind);
    };
    const isOnly = () => lRef.current.step > 0 || lRef.current.focus !== "all";
    const stepNow = () => lRef.current.step;

    /* Tanda siku-siku di titik v, antara arah ke a dan ke b (ukuran tetap dalam piksel) */
    const rightAngle = (v: Vec, a: Vec, b: Vec): Vec[] | null => {
      const ux = a[0] - v[0];
      const uy = a[1] - v[1];
      const wx = b[0] - v[0];
      const wy = b[1] - v[1];
      const lu = Math.hypot(ux, uy);
      const lw = Math.hypot(wx, wy);
      if (lu < 1e-6 || lw < 1e-6) return null;
      const unit = (board as unknown as { unitX: number }).unitX || 40;
      const size = Math.min(14 / unit, 0.4 * lu, 0.4 * lw);
      const ex = ux / lu;
      const ey = uy / lu;
      const fx = wx / lw;
      const fy = wy / lw;
      return [
        [v[0] + size * ex, v[1] + size * ey],
        [v[0] + size * (ex + fx), v[1] + size * (ey + fy)],
        [v[0] + size * fx, v[1] + size * fy],
      ];
    };

    kinds.forEach((kind) => {
      [0, 1].forEach((i) => {
        makeCurve(colorKind(kind), 1.6, 0, 0.85, () => {
          if (!vis(kind, i) || !show("extend")) return null;
          const t = listOf(kind)[i];
          if (!t) return null;
          const s = extent();
          const dirX = -t.ny;
          const dirY = t.nx;
          const px = t.c * t.nx;
          const py = t.c * t.ny;
          return [
            [px - dirX * s, py - dirY * s],
            [px + dirX * s, py + dirY * s],
          ];
        });
        makeCurve(colorKind(kind), 3.4, 0, 1, () => {
          if (!vis(kind, i)) return null;
          const t = listOf(kind)[i];
          return t ? [t.t1, t.t2] : null;
        });
      });
    });

    // jari-jari ke titik singgung (tegak lurus garis singgung) + tanda siku-siku
    kinds.forEach((kind) => {
      [0, 1].forEach((i) => {
        ([1, 2] as const).forEach((which) => {
          makeCurve(COLOR_GUIDE, 1.3, 2, 1, () => {
            if (
              !vis(kind, i) ||
              !(show("radii") || show("rightAngle") || stepNow() >= 1)
            )
              return null;
            const t = listOf(kind)[i];
            if (!t) return null;
            const c = circ(which);
            return [[c.x, c.y], which === 1 ? t.t1 : t.t2];
          });
          makeCurve(
            COLOR_TOUCH,
            1.5,
            0,
            1,
            () => {
              if (!vis(kind, i) || !(show("rightAngle") || stepNow() >= 1))
                return null;
              const t = listOf(kind)[i];
              if (!t) return null;
              const c = circ(which);
              const own = which === 1 ? t.t1 : t.t2;
              const other = which === 1 ? t.t2 : t.t1;
              return rightAngle(own, [c.x, c.y], other);
            },
            { color: COLOR_TOUCH, opacity: 0.12 },
          );
        });
      });
    });

    // perpanjangan jari-jari O₁T₁ dan O₂T₂ (lurus melewati titik singgung)
    // dan garis lewat O₂ sejajar garis singgung; keduanya bertemu di P
    kinds.forEach((kind) => {
      [0, 1].forEach((i) => {
        ([1, 2] as const).forEach((which) => {
          makeCurve(
            stepNow() >= 2 ? COLOR_HELP : COLOR_GUIDE,
            1.3,
            2,
            0.85,
            () => {
              if (!vis(kind, i) || !(show("extRadius") || stepNow() >= 2))
                return null;
              const t = listOf(kind)[i];
              if (!t) return null;
              const c = circ(which);
              const s = extent();
              return [
                [c.x - t.nx * s, c.y - t.ny * s],
                [c.x + t.nx * s, c.y + t.ny * s],
              ];
            },
          );
        });
        makeCurve(colorKind(kind), 1.4, 3, 0.85, () => {
          if (!vis(kind, i) || !(show("parLine") || stepNow() >= 2))
            return null;
          const t = listOf(kind)[i];
          if (!t) return null;
          const c = circ(2);
          const s = extent();
          return [
            [c.x + t.ny * s, c.y - t.nx * s],
            [c.x - t.ny * s, c.y + t.nx * s],
          ];
        });
      });
    });

    /* ----- Proses: segitiga siku-siku bantu O₁PO₂ ----- */
    const proc = () => {
      if (stepNow() < 1) return null;
      const tg = target();
      if (!tg) return null;
      return { tg, ...helperGeometry(pRef.current, tg.t) };
    };
    // persegi panjang T₁T₂O₂P (langkah 2+)
    makeCurve(COLOR_GUIDE, 1.4, 3, 0.95, () => {
      const g = proc();
      if (!g || stepNow() < 2) return null;
      return [g.tg.t.t1, g.tg.t.t2, g.O2, g.P, g.tg.t.t1];
    });
    // isi segitiga O₁PO₂ (langkah 3+)
    makeCurve(
      COLOR_HELP,
      0,
      0,
      1,
      () => {
        const g = proc();
        if (!g || stepNow() < 3) return null;
        return [g.O1, g.P, g.O2, g.O1];
      },
      { color: COLOR_HELP, opacity: 0.14 },
    );
    // sisi miring O₁O₂ = d (langkah 3+)
    makeCurve(COLOR_TOUCH, 2.6, 0, 1, () => {
      const g = proc();
      if (!g || stepNow() < 3) return null;
      return [g.O1, g.O2];
    });
    // sisi tegak O₁P (langkah 2+)
    makeCurve(COLOR_HELP, 3.6, 0, 1, () => {
      const g = proc();
      if (!g || stepNow() < 2) return null;
      return [g.O1, g.P];
    });
    // sisi tegak PO₂ = ℓ, sejajar dan sama panjang dengan T₁T₂ (langkah 2+)
    makeCurve(COLOR_EXT, 2.6, 4, 1, () => {
      const g = proc();
      if (!g || stepNow() < 2) return null;
      return [g.P, g.O2];
    });
    // tanda siku-siku di P (langkah 3+)
    makeCurve(
      COLOR_HELP,
      1.6,
      0,
      1,
      () => {
        const g = proc();
        if (!g || stepNow() < 3) return null;
        return rightAngle(g.P, g.O1, g.O2);
      },
      { color: COLOR_HELP, opacity: 0.2 },
    );

    // jari-jari r₁ dan r₂ (ke atas)
    ([1, 2] as const).forEach((which) => {
      makeCurve(colorOf(which), 2, 2, 1, () => {
        if (!show("rad")) return null;
        const c = circ(which);
        return [
          [c.x, c.y],
          [c.x, c.y + c.r],
        ];
      });
    });

    /* Titik dan label */
    const dot = (
      x: () => number,
      y: () => number,
      color: string,
      size: number,
    ) =>
      board.create("point", [x, y], {
        name: "",
        withLabel: false,
        size,
        face: "o",
        fillColor: color,
        strokeColor: "#ffffff",
        strokeWidth: 1.5,
        fixed: true,
        highlight: false,
      });
    const label = (
      x: () => number,
      y: () => number,
      text: string | (() => string),
      color: string,
      offset: [number, number] = [8, 8],
    ) =>
      board.create(
        "text",
        [
          () => (Number.isFinite(x()) ? x() : 1e6),
          () => (Number.isFinite(y()) ? y() : 1e6),
          text,
        ],
        {
          fontSize: 14,
          strokeColor: color,
          offset,
          highlight: false,
          fixed: true,
        },
      );

    // titik-titik singgung
    kinds.forEach((kind) => {
      [0, 1].forEach((i) => {
        (["t1", "t2"] as const).forEach((end) => {
          dot(
            () => {
              const t = listOf(kind)[i];
              return vis(kind, i) && show("points") && t
                ? t[end][0]
                : Number.NaN;
            },
            () => {
              const t = listOf(kind)[i];
              return t ? t[end][1] : Number.NaN;
            },
            colorKind(kind),
            4.5,
          );
        });
      });
    });

    // titik P (langkah 2+)
    const procPt = (axis: 0 | 1) => () => {
      const g = proc();
      return g && stepNow() >= 2 ? g.P[axis] : Number.NaN;
    };
    dot(procPt(0), procPt(1), COLOR_HELP, 5);
    label(procPt(0), procPt(1), "P", COLOR_HELP, [-14, 8]);

    // nama titik singgung T₁ dan T₂ (hanya saat satu garis ditampilkan)
    ([1, 2] as const).forEach((which) => {
      const pos = (axis: 0 | 1) => () => {
        if (!isOnly()) return Number.NaN;
        const tg = target();
        if (!tg || !vis(tg.kind, tg.i)) return Number.NaN;
        return which === 1 ? tg.t.t1[axis] : tg.t.t2[axis];
      };
      label(pos(0), pos(1), which === 1 ? "T₁" : "T₂", COLOR_TOUCH, [
        -8,
        which === 1 ? 14 : -22,
      ]);
    });

    // label panjang ruas singgung ℓ (tiap garis, atau pada langkah 4 proses)
    kinds.forEach((kind) => {
      [0, 1].forEach((i) => {
        const t = () => listOf(kind)[i];
        const shown = () =>
          vis(kind, i) &&
          ((stepNow() === 0 && show("lengths")) || stepNow() >= 4);
        const len = () => {
          const tt = t();
          return tt ? Math.hypot(tt.t2[0] - tt.t1[0], tt.t2[1] - tt.t1[1]) : 0;
        };
        label(
          () => (shown() ? (t()!.t1[0] + t()!.t2[0]) / 2 : Number.NaN),
          () => (shown() ? (t()!.t1[1] + t()!.t2[1]) / 2 : Number.NaN),
          () =>
            `${isOnly() ? "" : `${FOCUS_NAME[`${kind}-${i}` as Focus]}: `}ℓ = ${fmt(len(), 2)}`,
          colorKind(kind),
          [8, 8],
        );
      });
    });

    // label sisi segitiga bantu: huruf (langkah 3), nilai (langkah 4)
    const sideLabel = (
      from: (g: NonNullable<ReturnType<typeof proc>>) => Vec,
      to: (g: NonNullable<ReturnType<typeof proc>>) => Vec,
      text: (g: NonNullable<ReturnType<typeof proc>>) => string,
      color: string,
      offset: [number, number],
      minStep = 3,
    ) => {
      const mid = (axis: 0 | 1) => () => {
        const g = proc();
        if (!g || stepNow() < minStep) return Number.NaN;
        return (from(g)[axis] + to(g)[axis]) / 2;
      };
      label(
        mid(0),
        mid(1),
        () => {
          const g = proc();
          return g ? text(g) : "";
        },
        color,
        offset,
      );
    };
    const legName = (g: NonNullable<ReturnType<typeof proc>>) =>
      g.tg.kind === "ext" ? "r₁ − r₂" : "r₁ + r₂";
    sideLabel(
      (g) => g.O1,
      (g) => g.O2,
      (g) =>
        stepNow() >= 4
          ? `d = ${fmt(Math.hypot(g.O2[0] - g.O1[0], g.O2[1] - g.O1[1]), 2)}`
          : "d",
      COLOR_TOUCH,
      [6, -22],
    );
    sideLabel(
      (g) => g.O1,
      (g) => g.P,
      (g) =>
        stepNow() >= 4
          ? `${g.tg.kind === "ext" ? "|r₁ − r₂|" : "r₁ + r₂"} = ${fmt(g.leg, 2)}`
          : g.tg.kind === "ext"
            ? "|r₁ − r₂|"
            : legName(g),
      COLOR_HELP,
      [-70, 6],
      2,
    );
    sideLabel(
      (g) => g.P,
      (g) => g.O2,
      () => "ℓ",
      COLOR_EXT,
      [6, 6],
    );

    // E (titik potong garis singgung luar) dan I (garis singgung dalam)
    dot(
      () => (show("homothety") && show("ext") ? A().E[0] : Number.NaN),
      () => A().E[1],
      COLOR_EXT,
      5,
    );
    dot(
      () => (show("homothety") && show("int") ? A().I[0] : Number.NaN),
      () => A().I[1],
      COLOR_INT,
      5,
    );
    label(
      () => (show("homothety") && show("ext") ? A().E[0] : Number.NaN),
      () => A().E[1],
      "E",
      COLOR_EXT,
    );
    label(
      () => (show("homothety") && show("int") ? A().I[0] : Number.NaN),
      () => A().I[1],
      "I",
      COLOR_INT,
    );

    // label jari-jari dan pusat
    ([1, 2] as const).forEach((which) => {
      label(
        () => (show("rad") ? circ(which).x : Number.NaN),
        () => circ(which).y + circ(which).r / 2,
        which === 1 ? "r₁" : "r₂",
        colorOf(which),
        [6, -2],
      );
      label(
        () => circ(which).x,
        () => circ(which).y,
        which === 1 ? "O₁" : "O₂",
        colorOf(which),
        [-24, -20],
      );
    });

    // titik pusat: bisa diseret (dibuat paling akhir agar berada di atas)
    centersRef.current = ([1, 2] as const).map((which) => {
      const c = circ(which);
      const pt = board.create("point", [c.x, c.y], {
        name: "",
        withLabel: false,
        size: 6,
        face: "o",
        fillColor: colorOf(which),
        strokeColor: "#ffffff",
        strokeWidth: 2,
        fixed: false,
        highlight: false,
        snapToGrid: false,
        showInfobox: false,
      }) as unknown as DragPoint;
      pt.on("drag", () => moveRef.current(which, pt.X(), pt.Y(), pt));
      return pt;
    });

    board.update();

    // Selaraskan ukuran papan dengan kotaknya. Pembanding utamanya adalah ukuran
    // yang DIKETAHUI JSXGraph (canvasWidth/Height), sehingga papan yang
    // tertinggal selalu terkoreksi. Skala dan titik tengah dipertahankan.
    const syncSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      const sized = board as unknown as {
        canvasWidth: number;
        canvasHeight: number;
        fullUpdate?: () => void;
      };
      const oldW = sized.canvasWidth;
      const oldH = sized.canvasHeight;
      // Selain canvasWidth/Height, cocokkan juga dengan ukuran SVG yang benar-
      // benar tergambar, karena nilai internal JSXGraph bisa sudah "benar"
      // sementara SVG-nya masih berukuran lama.
      const svg = el.querySelector("svg");
      const svgW = svg ? Math.round(svg.getBoundingClientRect().width) : w;
      const svgH = svg ? Math.round(svg.getBoundingClientRect().height) : h;
      if (w === oldW && h === oldH && svgW === w && svgH === h) return;
      const bb = board.getBoundingBox();
      const spanX = bb[2] - bb[0];
      const spanY = bb[1] - bb[3];
      board.resizeContainer(w, h, true, true);
      if (w === oldW && h === oldH) {
        // Hanya SVG yang tertinggal: ukuran logis sama, cukup gambar ulang.
        sized.fullUpdate?.();
        board.update();
        return;
      }
      if (oldW > 0 && oldH > 0 && spanX > 0 && spanY > 0) {
        const ux = oldW / spanX;
        const uy = oldH / spanY;
        const cx = (bb[0] + bb[2]) / 2;
        const cy = (bb[1] + bb[3]) / 2;
        board.setBoundingBox(
          [cx - w / 2 / ux, cy + h / 2 / uy, cx + w / 2 / ux, cy - h / 2 / uy],
          true,
        );
      }
      sized.fullUpdate?.();
      board.update();
    };
    syncSizeRef.current = syncSize;
    const observer = new ResizeObserver(syncSize);
    observer.observe(el);
    if (el.parentElement) observer.observe(el.parentElement);

    return () => {
      observer.disconnect();
      syncSizeRef.current = null;
      centersRef.current = [];
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
    };
  }, [boardId]);

  // Perbarui papan setiap parameter atau pilihan berubah; titik pusat yang
  // bisa diseret disamakan dengan nilai slider.
  useEffect(() => {
    const points = centersRef.current;
    if (points.length === 2) {
      (
        [
          [params.x1, params.y1],
          [params.x2, params.y2],
        ] as Vec[]
      ).forEach(([x, y], i) => {
        const pt = points[i];
        if (Math.abs(pt.X() - x) > 1e-9 || Math.abs(pt.Y() - y) > 1e-9)
          pt.setPosition(COORDS_BY_USER, [x, y]);
      });
    }
    boardRef.current?.update();
  }, [params, opts, focus, step]);

  // Masuk/keluar layar penuh atau ganti mode panel mengubah ukuran papan
  useEffect(() => {
    // Browser menyelesaikan transisi layar penuh asli dengan waktu yang tidak
    // pasti (animasi bilah browser, perubahan viewport). Selama ~2 detik papan
    // dicocokkan dengan kotaknya setiap frame; syncSize murah karena langsung
    // keluar bila ukurannya sudah sama.
    let raf = 0;
    const started = performance.now();
    const tick = () => {
      syncSizeRef.current?.();
      if (performance.now() - started < 2000) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isFull, tabbed]);

  useEffect(() => {
    let timer = 0;
    const sync = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => syncSizeRef.current?.(), 120);
    };
    window.addEventListener("resize", sync);
    document.addEventListener("fullscreenchange", sync);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", sync);
      document.removeEventListener("fullscreenchange", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, []);

  // Animasi: O₂ maju-mundur sepanjang garis O₁O₂ (jauh → dekat → di dalam)
  useEffect(() => {
    if (!anim) return undefined;
    let raf = 0;
    let last = performance.now();
    let dir = -1;
    const start = pRef.current;
    const dist0 = Math.hypot(start.x2 - start.x1, start.y2 - start.y1);
    const alpha =
      dist0 > 1e-6 ? Math.atan2(start.y2 - start.y1, start.x2 - start.x1) : 0;
    let dist = dist0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = pRef.current;
      const max = Math.max(0.5, rayMax(p.x1, p.y1, alpha));
      dist += dir * dt * 2.2;
      if (dist >= max) {
        dist = max;
        dir = -1;
      } else if (dist <= 0) {
        dist = 0;
        dir = 1;
      }
      setParams((prev) => ({
        ...prev,
        x2: round3(prev.x1 + Math.cos(alpha) * dist),
        y2: round3(prev.y1 + Math.sin(alpha) * dist),
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim]);

  /* ---------- Turunan untuk tampilan ---------- */

  const sameParams = (a: Params, b: Params) =>
    (Object.keys(a) as (keyof Params)[]).every(
      (key) => Math.abs(a[key] - b[key]) < 1e-6,
    );
  const target = resolveTarget(an, focus);
  const focusMissing = focus !== "all" && !target;
  const kindShown = (kind: Kind) => {
    if (step > 0) return target?.kind === kind;
    if (focus !== "all") return !!target && focus.startsWith(kind);
    return opts[kind];
  };
  const startProcess = () => {
    setAnim(null);
    setStep(1);
  };
  const goStep = (delta: number) =>
    setStep((value) => Math.min(STEP_COUNT, Math.max(1, value + delta)));

  // bahan penjelasan proses (hanya bermakna bila ada garis singgung terpilih)
  const isExt = target?.kind === "ext";
  const helper = target ? helperGeometry(params, target.t) : null;
  const leg = helper ? helper.leg : 0;
  const legAbs = isExt ? "|r₁ − r₂|" : "r₁ + r₂";
  const tLen = target
    ? Math.hypot(
        target.t.t2[0] - target.t.t1[0],
        target.t.t2[1] - target.t.t1[1],
      )
    : 0;
  const targetName = target
    ? FOCUS_NAME[`${target.kind}-${target.i}` as Focus]
    : "—";
  const procSteps: { title: string; caption: string; body: string }[] = [
    {
      title: "Jari-jari ⟂ garis singgung",
      caption:
        "Jari-jari ke titik singgung selalu tegak lurus pada garis singgung.",
      body: "O₁T₁ dan O₂T₂ adalah jari-jari yang ditarik ke titik singgung. Jari-jari selalu tegak lurus pada garis singgung, jadi ∠O₁T₁T₂ = ∠O₂T₂T₁ = 90°. Akibatnya O₁T₁ ∥ O₂T₂.",
    },
    {
      title: "Garis bantu dari O₂",
      caption: "Perpanjangan O₁T₁ dan garis dari O₂ ∥ T₁T₂ bertemu di P.",
      body: isExt
        ? `Perpanjang jari-jari O₁T₁ melewati T₁ dan tarik garis dari O₂ yang sejajar T₁T₂; keduanya berpotongan di titik P. Bangun T₁T₂O₂P punya tiga sudut siku-siku, jadi ia persegi panjang: PO₂ = T₁T₂ = ℓ dan T₁P = O₂T₂ = r₂. Karena O₁T₁ = r₁, maka O₁P = |r₁ − r₂| = ${fmt(leg)}.${
            leg < 1e-6
              ? " Di sini r₁ = r₂, sehingga P berimpit dengan O₁ dan T₁T₂O₂O₁ sendiri sudah persegi panjang."
              : ""
          }`
        : `Perpanjang jari-jari O₁T₁ melewati T₁, lalu tarik garis dari O₂ yang sejajar T₁T₂; keduanya berpotongan di titik P. Bangun T₁T₂O₂P persegi panjang: PO₂ = T₁T₂ = ℓ dan T₁P = O₂T₂ = r₂. Karena P di seberang O₁ terhadap T₁, maka O₁P = O₁T₁ + T₁P = r₁ + r₂ = ${fmt(leg)}.`,
    },
    {
      title: "Segitiga siku-siku O₁PO₂",
      caption: "Segitiga O₁PO₂ siku-siku di P, sisi miringnya d.",
      body: `Segitiga O₁PO₂ siku-siku di P. Sisi miringnya O₁O₂ = d = ${fmt(an.d)}, sisi tegaknya O₁P = ${legAbs} = ${fmt(leg)}, dan sisi tegak lainnya PO₂ = ℓ, yang ingin dicari.`,
    },
    {
      title: "Hitung dengan Pythagoras",
      caption: `Pythagoras: ℓ² = d² − (${legAbs})², jadi ℓ = ${fmt(tLen, 2)}.`,
      body: `Dari d² = (${legAbs})² + ℓ² diperoleh ℓ = √(d² − (${legAbs})²).`,
    },
  ];
  const countText = `${an.count} garis singgung persekutuan${
    focus !== "all"
      ? ` · fokus: ${FOCUS_NAME[focus]}${focusMissing ? " (tidak ada)" : ""}`
      : ""
  }`;
  const extText = an.ext.length ? `${an.ext.length} garis` : "tidak ada";
  const intText = an.inn.length ? `${an.inn.length} garis` : "tidak ada";

  const focusPicker = (
    <div className="tc-focus-wrap">
      <p className="tc-group" style={{ color: COLOR_TOUCH }}>
        Garis singgung yang ditampilkan
      </p>
      <div className="tc-focus" role="group" aria-label="Pilih garis singgung">
        {FOCUS_OPTIONS.map((item) => {
          const exists = item.key === "all" || !!resolveTarget(an, item.key);
          return (
            <button
              key={item.key}
              type="button"
              title={item.title}
              aria-label={item.title}
              aria-pressed={focus === item.key}
              disabled={!exists && focus !== item.key}
              style={{ "--kc": item.color } as CSSProperties}
              onClick={() => setFocus(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {focusMissing && (
        <p className="tc-focus-note">
          {FOCUS_NAME[focus]} tidak ada pada posisi lingkaran ini. Ubah d atau
          jari-jari, atau pilih garis lain.
        </p>
      )}
      {step > 0 && focus === "all" && target && (
        <p className="tc-focus-note">
          Mode proses menjelaskan {targetName}. Pilih garis lain di atas bila
          ingin yang berbeda.
        </p>
      )}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={`twocircle-simulation simulation-fullscreen-frame${
        tabbed ? " is-tabbed" : ""
      }${isFull ? " is-fullscreen" : ""}`}
    >
      <p className="tc-orientation-hint">
        <Smartphone size={14} aria-hidden="true" />
        <span>
          Miringkan ponsel ke mode lanskap agar grafik dan panel isian tampil
          berdampingan.
        </span>
      </p>

      <div className="tc-boards">
        {/* ───── Wilayah grafik (2 bagian) ───── */}
        <section className="tc-board-panel" aria-label="Grafik dua lingkaran">
          <div className="tc-stage">
            <div
              className="tc-board"
              id={boardId}
              ref={containerRef}
              tabIndex={0}
              aria-label="Grafik dua lingkaran dan garis singgung persekutuannya. Seret latar untuk menggeser, roda mouse atau cubit untuk zoom, seret titik pusat O1 atau O2 untuk memindahkan lingkaran."
            />

            <p
              className="tc-chip"
              style={{ borderLeftColor: COLOR_EXT }}
              aria-live="polite"
            >
              <b style={{ color: COLOR_EXT }}>{an.relation}</b>
              <span>{countText}</span>
            </p>

            <div className="tc-pinfo" aria-live="off">
              <span>
                <b>d</b> = {fmt(an.d, 2)}
              </span>
              {an.ext.length > 0 && kindShown("ext") && (
                <span>
                  <b>ℓ luar</b> = {fmt(an.lenExt, 2)}
                </span>
              )}
              {an.inn.length > 0 && kindShown("int") && (
                <span>
                  <b>ℓ dalam</b> = {fmt(an.lenInt, 2)}
                </span>
              )}
            </div>

            <div className="tc-tools" role="group" aria-label="Tampilan">
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-pressed={isFull}
                aria-label={isFull ? "Keluar layar penuh" : "Layar penuh"}
                title={isFull ? "Keluar layar penuh" : "Layar penuh"}
              >
                {isFull ? (
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
                aria-label="Kembali ke tampilan awal"
                title="Kembali ke tampilan awal"
              >
                <Crosshair size={15} aria-hidden="true" />
              </button>
              {isFull && (
                <button
                  type="button"
                  className="tc-toolbar-toggle"
                  onClick={() => setPanelOpen((open) => !open)}
                  aria-pressed={panelOpen}
                  aria-controls={`tc-column-${baseId}`}
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

          {step > 0 && (
            <div
              className="tc-stepbar"
              role="group"
              aria-label="Langkah penjelasan"
            >
              <button
                type="button"
                onClick={() => goStep(-1)}
                disabled={step <= 1}
                aria-label="Langkah sebelumnya"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <p aria-live="polite">
                <b>
                  {step}/{STEP_COUNT}
                  {target ? ` · ${procSteps[step - 1].title}` : ""}
                </b>
                <span>
                  {target
                    ? procSteps[step - 1].caption
                    : "Tidak ada garis singgung yang bisa dijelaskan pada posisi ini."}
                </span>
              </p>
              <button
                type="button"
                onClick={() => goStep(1)}
                disabled={step >= STEP_COUNT}
                aria-label="Langkah berikutnya"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setStep(0)}
                aria-label="Tutup mode proses"
                title="Tutup mode proses"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="tc-legend" aria-label="Legenda grafik">
            <span>
              <i style={{ borderTopColor: COLOR_C1 }} /> lingkaran 1
            </span>
            <span>
              <i style={{ borderTopColor: COLOR_C2 }} /> lingkaran 2
            </span>
            {opts.ext && (
              <span>
                <i className="line-ext" /> singgung luar
              </span>
            )}
            {opts.int && (
              <span>
                <i className="line-int" /> singgung dalam
              </span>
            )}
            {opts.points && (
              <span>
                <b className="dot-touch" /> titik singgung
              </span>
            )}
            {opts.centerline && (
              <span>
                <i className="line-center" /> garis hubung pusat
              </span>
            )}
            {(opts.rightAngle || step > 0) && (
              <span>
                <i className="sq-right" /> siku-siku (90°)
              </span>
            )}
            {step >= 2 && (
              <span>
                <i className="line-help" /> garis bantu O₁P
              </span>
            )}
            {(opts.extRadius || step >= 2) && (
              <span>
                <i className="line-guide" /> perpanjangan jari-jari
              </span>
            )}
            {(opts.parLine || step >= 2) && (
              <span>
                <i className="line-par" /> garis lewat O₂ ∥ singgung
              </span>
            )}
          </div>
          <p className="tc-hint">
            Tahan klik kiri pada latar lalu seret untuk menggeser · roda mouse
            untuk zoom · seret titik pusat O₁ atau O₂ untuk memindahkan
            lingkaran.
          </p>
        </section>

        {/* ───── Wilayah input (1 bagian) ───── */}
        <div
          id={`tc-column-${baseId}`}
          className={`tc-column${isFull ? " is-floating" : ""}${
            isFull && panelOpen ? " is-open" : ""
          }`}
          data-tab={tab}
        >
          <div className="tc-tabs" role="group" aria-label="Bagian panel">
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

          <section className="tc-controls" aria-label="Pengaturan">
            <div className="tc-pane" data-pane="par">
              <div
                className="tc-kinds"
                role="group"
                aria-label="Posisi dua lingkaran"
              >
                {PRESETS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    title={item.title}
                    aria-label={item.title}
                    aria-pressed={sameParams(params, item.params)}
                    style={{ "--kc": item.color } as CSSProperties}
                    onClick={() => setParam(item.params)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {focusPicker}

              <div className="tc-params">
                <p className="tc-group" style={{ color: COLOR_C1 }}>
                  Lingkaran 1
                </p>
                <ParamRow
                  id={`tc-x1-${baseId}`}
                  label="x₁"
                  title="absis pusat lingkaran 1"
                  value={params.x1}
                  min={-X_LIM}
                  max={X_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_C1}
                  onChange={(v) => setParam({ x1: v })}
                />
                <ParamRow
                  id={`tc-y1-${baseId}`}
                  label="y₁"
                  title="ordinat pusat lingkaran 1"
                  value={params.y1}
                  min={-Y_LIM}
                  max={Y_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_C1}
                  onChange={(v) => setParam({ y1: v })}
                />
                <ParamRow
                  id={`tc-r1-${baseId}`}
                  label="r₁"
                  title="jari-jari lingkaran 1"
                  value={params.r1}
                  min={R_MIN}
                  max={R_MAX}
                  step={0.1}
                  nudge={0.1}
                  digits={1}
                  tone={COLOR_C1}
                  onChange={(v) => setParam({ r1: v })}
                />

                <p className="tc-group" style={{ color: COLOR_C2 }}>
                  Lingkaran 2
                </p>
                <ParamRow
                  id={`tc-x2-${baseId}`}
                  label="x₂"
                  title="absis pusat lingkaran 2"
                  value={params.x2}
                  min={-X_LIM}
                  max={X_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_C2}
                  onChange={(v) => setParam({ x2: v })}
                />
                <ParamRow
                  id={`tc-y2-${baseId}`}
                  label="y₂"
                  title="ordinat pusat lingkaran 2"
                  value={params.y2}
                  min={-Y_LIM}
                  max={Y_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_C2}
                  onChange={(v) => setParam({ y2: v })}
                />
                <ParamRow
                  id={`tc-r2-${baseId}`}
                  label="r₂"
                  title="jari-jari lingkaran 2"
                  value={params.r2}
                  min={R_MIN}
                  max={R_MAX}
                  step={0.1}
                  nudge={0.1}
                  digits={1}
                  tone={COLOR_C2}
                  onChange={(v) => setParam({ r2: v })}
                />

                <p className="tc-group" style={{ color: COLOR_TOUCH }}>
                  Jarak kedua pusat
                </p>
                <ParamRow
                  id={`tc-d-${baseId}`}
                  label="d"
                  title="jarak antarpusat d (O₂ bergeser sepanjang garis O₁O₂)"
                  value={Math.round(an.d * 100) / 100}
                  min={0}
                  max={dMax}
                  step={0.05}
                  nudge={0.1}
                  digits={2}
                  tone={COLOR_TOUCH}
                  playing={anim === "d"}
                  onChange={setDistance}
                  onPlay={() => setAnim(anim === "d" ? null : "d")}
                />
              </div>

              <button type="button" className="tc-reset" onClick={reset}>
                <RotateCcw size={13} aria-hidden="true" />
                <span>Atur ulang</span>
              </button>
            </div>

            <div className="tc-pane" data-pane="opt">
              <div className="tc-options">
                {optionRows.map((row) => (
                  <label key={row.key}>
                    <input
                      type="checkbox"
                      checked={opts[row.key]}
                      onChange={(event) =>
                        setOpt(row.key, event.currentTarget.checked)
                      }
                    />
                    {row.label}
                  </label>
                ))}
              </div>
              <GraphAppearanceControls
                appearance={appearance}
                onStep={onStep}
              />
            </div>
          </section>

          <div className="tc-results">
            <div className="tc-pane" data-pane="proc">
              {tabbed && focusPicker}
              {step === 0 ? (
                <section className="tc-card" aria-label="Mulai penjelasan">
                  <h4 style={{ color: COLOR_HELP }}>
                    Cara mencari panjang garis singgung
                  </h4>
                  <p>
                    Ikuti 4 langkah: jari-jari tegak lurus garis singgung, garis
                    bantu dari O₂, segitiga siku-siku O₁PO₂, lalu teorema
                    Pythagoras. Setiap langkah digambar langsung di grafik dan
                    ikut berubah saat lingkaran digeser.
                  </p>
                  <button
                    type="button"
                    className="tc-primary"
                    onClick={startProcess}
                    disabled={!target}
                  >
                    Mulai dengan {targetName}
                  </button>
                  {!target && (
                    <p className="tc-eq-note">
                      Belum ada garis singgung yang bisa dijelaskan. Jauhkan
                      kedua lingkaran atau pilih garis lain.
                    </p>
                  )}
                </section>
              ) : target ? (
                <>
                  <p className="tc-proc-target">
                    Menjelaskan: <b>{targetName}</b>
                  </p>
                  <ol className="tc-steps" aria-label="Langkah penjelasan">
                    {procSteps.map((item, idx) => {
                      const n = idx + 1;
                      const state =
                        n === step ? "now" : n < step ? "done" : "todo";
                      return (
                        <li key={item.title} data-state={state}>
                          <button
                            type="button"
                            aria-current={n === step ? "step" : undefined}
                            onClick={() => setStep(n)}
                          >
                            <span aria-hidden="true">{n}</span>
                            {item.title}
                          </button>
                          {n === step && <p>{item.body}</p>}
                        </li>
                      );
                    })}
                  </ol>
                  {step === STEP_COUNT && (
                    <section className="tc-card" aria-label="Perhitungan">
                      <h4 style={{ color: COLOR_HELP }}>Perhitungan</h4>
                      <p className="tc-eq">d² = ({legAbs})² + ℓ²</p>
                      <p className="tc-eq">ℓ = √(d² − ({legAbs})²)</p>
                      <p className="tc-eq">
                        ℓ = √({fmt(an.d)}² − {fmt(leg)}²)
                      </p>
                      <p className="tc-eq">
                        ℓ = √{fmt(Math.max(0, an.d * an.d - leg * leg))} ={" "}
                        {fmt(tLen)}
                      </p>
                      {tLen < 1e-3 && (
                        <p className="tc-eq-note">
                          ℓ = 0 karena kedua lingkaran bersinggungan: T₁ dan T₂
                          berimpit.
                        </p>
                      )}
                    </section>
                  )}
                  <div className="tc-stepnav">
                    <button
                      type="button"
                      onClick={() => goStep(-1)}
                      disabled={step <= 1}
                    >
                      <ChevronLeft size={14} aria-hidden="true" />
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={() => goStep(1)}
                      disabled={step >= STEP_COUNT}
                    >
                      Berikutnya
                      <ChevronRight size={14} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setStep(0)}>
                      Selesai
                    </button>
                  </div>
                </>
              ) : (
                <section className="tc-card" aria-label="Tidak ada garis">
                  <p>
                    Garis singgung yang dipilih tidak ada pada posisi ini. Ubah
                    posisi lingkaran atau pilih garis lain.
                  </p>
                  <div className="tc-stepnav">
                    <button type="button" onClick={() => setStep(0)}>
                      Tutup
                    </button>
                  </div>
                </section>
              )}
            </div>

            <div className="tc-pane" data-pane="res">
              <section
                className="tc-card tc-card-kind"
                aria-label="Hubungan kedua lingkaran"
              >
                <h3 style={{ color: COLOR_EXT }}>{an.relation}</h3>
                <p>
                  d = {fmt(an.d)} · r₁ + r₂ = {fmt(an.sum)} · |r₁ − r₂| ={" "}
                  {fmt(an.diff)}
                </p>
                <p>
                  Garis singgung persekutuan luar: {extText}; dalam: {intText}.
                </p>
              </section>

              <section className="tc-card" aria-label="Persamaan lingkaran">
                <h4>Persamaan kedua lingkaran</h4>
                <p className="tc-eq">
                  {circleEq(params.x1, params.y1, params.r1)}
                </p>
                <p className="tc-eq-note">
                  lingkaran 1, pusat O₁ {fmtPt(params.x1, params.y1)}
                </p>
                <p className="tc-eq">
                  {circleEq(params.x2, params.y2, params.r2)}
                </p>
                <p className="tc-eq-note">
                  lingkaran 2, pusat O₂ {fmtPt(params.x2, params.y2)}
                </p>
              </section>

              <section
                className="tc-card"
                aria-label="Garis singgung persekutuan luar"
              >
                <h4 style={{ color: COLOR_EXT }}>
                  Garis singgung persekutuan luar
                </h4>
                {an.ext.length > 0 ? (
                  <>
                    <p className="tc-eq">ℓ = √(d² − (r₁ − r₂)²)</p>
                    <p className="tc-eq-note">
                      √({fmt(an.d)}² − {fmt(an.diff)}²) = {fmt(an.lenExt)}
                    </p>
                    {an.ext.map((t, i) => (
                      <div key={`ext-${i}`}>
                        <p className="tc-eq">{lineEq(t)}</p>
                        <p className="tc-eq-note">
                          menyinggung di {fmtPt(t.t1[0], t.t1[1])} dan{" "}
                          {fmtPt(t.t2[0], t.t2[1])}
                        </p>
                      </div>
                    ))}
                    {Number.isFinite(an.E[0]) &&
                      kv("Titik potong E", fmtPt(an.E[0], an.E[1]))}
                  </>
                ) : (
                  <p className="tc-eq-note">
                    Tidak ada: salah satu lingkaran berada di dalam lingkaran
                    lain (d &lt; |r₁ − r₂|).
                  </p>
                )}
              </section>

              <section
                className="tc-card"
                aria-label="Garis singgung persekutuan dalam"
              >
                <h4 style={{ color: COLOR_INT }}>
                  Garis singgung persekutuan dalam
                </h4>
                {an.inn.length > 0 ? (
                  <>
                    <p className="tc-eq">ℓ = √(d² − (r₁ + r₂)²)</p>
                    <p className="tc-eq-note">
                      √({fmt(an.d)}² − {fmt(an.sum)}²) = {fmt(an.lenInt)}
                    </p>
                    {an.inn.map((t, i) => (
                      <div key={`int-${i}`}>
                        <p className="tc-eq">{lineEq(t)}</p>
                        <p className="tc-eq-note">
                          menyinggung di {fmtPt(t.t1[0], t.t1[1])} dan{" "}
                          {fmtPt(t.t2[0], t.t2[1])}
                        </p>
                      </div>
                    ))}
                    {Number.isFinite(an.I[0]) &&
                      kv("Titik potong I", fmtPt(an.I[0], an.I[1]))}
                  </>
                ) : (
                  <p className="tc-eq-note">
                    Tidak ada: kedua lingkaran berpotongan, bersinggungan dalam,
                    atau saling di dalam (d &lt; r₁ + r₂).
                  </p>
                )}
              </section>
            </div>

            <div className="tc-pane" data-pane="info">
              <table className="tc-info-table">
                <thead>
                  <tr>
                    <th scope="col">Hubungan</th>
                    <th scope="col">Syarat</th>
                    <th scope="col">Luar</th>
                    <th scope="col">Dalam</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Terpisah</td>
                    <td>d &gt; r₁ + r₂</td>
                    <td>2</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>Singgung luar</td>
                    <td>d = r₁ + r₂</td>
                    <td>2</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>Berpotongan</td>
                    <td>|r₁ − r₂| &lt; d &lt; r₁ + r₂</td>
                    <td>2</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>Singgung dalam</td>
                    <td>d = |r₁ − r₂|</td>
                    <td>1</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>Saling di dalam</td>
                    <td>d &lt; |r₁ − r₂|</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
              <ul className="tc-insights">
                <li>
                  <strong style={{ color: COLOR_TOUCH }}>
                    Jari-jari ⟂ singgung:
                  </strong>{" "}
                  jari-jari ke titik singgung selalu tegak lurus garis singgung,
                  sehingga O₁T₁ dan O₂T₂ sejajar. Dari sini terbentuk segitiga
                  siku-siku dengan sisi miring d.
                </li>
                <li>
                  <strong style={{ color: COLOR_EXT }}>Singgung luar:</strong>{" "}
                  selisih jari-jari menjadi salah satu sisi siku-siku, sehingga
                  ℓ = √(d² − (r₁ − r₂)²). Bila r₁ = r₂, kedua garis sejajar O₁O₂
                  dan tidak berpotongan.
                </li>
                <li>
                  <strong style={{ color: COLOR_INT }}>Singgung dalam:</strong>{" "}
                  jumlah jari-jari menjadi sisi siku-siku, sehingga ℓ = √(d² −
                  (r₁ + r₂)²). Kedua garisnya berpotongan di titik I pada ruas
                  O₁O₂ yang membagi O₁O₂ dengan perbandingan r₁ : r₂.
                </li>
                <li>
                  <strong style={{ color: COLOR_C2 }}>Titik E:</strong> garis
                  singgung luar berpotongan di E pada perpanjangan O₁O₂ dengan
                  EO₁ : EO₂ = r₁ : r₂. Coba animasikan d untuk melihat garis
                  singgung muncul dan hilang saat posisi kedua lingkaran
                  berubah.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
