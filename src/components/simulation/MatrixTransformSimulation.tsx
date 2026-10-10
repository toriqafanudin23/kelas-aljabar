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
import "./MatrixTransformSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useGraphAppearance } from "./simulationBoard";
import { useStoredSimulationState } from "./useStoredSimulationState";

/* Simulasi transformasi matriks 2 × 2.
   Matriks M = [[a, b], [c, d]] bekerja pada vektor kolom:
       M·(x, y) = (a·x + b·y, c·x + d·y)
   Kolom pertama (a, c) adalah bayangan vektor basis i = (1, 0), kolom kedua
   (b, d) adalah bayangan j = (0, 1). Titik (x, y) berpindah ke x·i′ + y·j′,
   sehingga kisi persegi menjadi kisi jajar genjang.

   Determinan det = a·d − b·c adalah luas BERTANDA jajar genjang yang dibentuk
   i′ dan j′ (bayangan persegi satuan, luas 1):
     luas = |det|;  det < 0 → orientasi terbalik;  det = 0 → bidang runtuh.

   Peralihan t ∈ [0, 1] menggeser matriks dari identitas I ke M:
       Mₜ = I + t·(M − I)
   sehingga perubahan kisi, basis, dan determinan bisa diamati perlahan.

   Tata letak: ponsel lanskap → desktop → ponsel potret.
   Wilayah grafik : wilayah input = 2 : 1. */

/* ---------- Tipe ---------- */

type Vec = [number, number];
type Pt = Vec | null;
type Mat = { a: number; b: number; c: number; d: number };
type Params = Mat & {
  /** vektor v yang ikut ditransformasikan */
  vx: number;
  vy: number;
  /** peralihan dari identitas (0) ke M (1) */
  t: number;
};
type Opts = {
  origGrid: boolean;
  grid: boolean;
  basis: boolean;
  square: boolean;
  detLabel: boolean;
  vector: boolean;
  decomp: boolean;
  eigen: boolean;
  circle: boolean;
};
type PanelTab = "par" | "opt" | "proc" | "res" | "info";
type Anim = "t" | null;
type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;
type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
  setAttribute: (attributes: Record<string, unknown>) => void;
};
/** Titik yang bisa diseret (ujung i′, ujung j′, dan vektor v). */
type DragPoint = {
  X: () => number;
  Y: () => number;
  setPosition: (method: number, coords: number[]) => unknown;
  on: (event: string, handler: () => void) => unknown;
};
type DragWhich = "i" | "j" | "v";

/* ---------- Konstanta ---------- */

/** JXG.COORDS_BY_USER */
const COORDS_BY_USER = 1;
/** Batas isi matriks dan komponen vektor v. */
const M_LIM = 5;
const V_LIM = 5;
const HOME_BOX: [number, number, number, number] = [-10, 7.5, 10, -7.5];
/** Layar kecil atau pendek memakai panel kanan bertab. */
const TABBED_QUERY = "(max-width: 899px), (max-height: 540px)";
/** Toleransi penggolongan jenis transformasi. */
const TOL = 0.012;
const DET_ZERO = 0.005;
const STEP_COUNT = 4;

const DEFAULT_PARAMS: Params = {
  a: 1.5,
  b: 1,
  c: 0.5,
  d: 1.5,
  vx: 1.5,
  vy: 1,
  t: 1,
};
const DEFAULT_OPTS: Opts = {
  origGrid: true,
  grid: true,
  basis: true,
  square: true,
  detLabel: true,
  vector: true,
  decomp: false,
  eigen: false,
  circle: false,
};

const COLOR_I = "#b23a48";
const COLOR_J = "#2f6bd0";
const COLOR_POS = "#087f8c";
const COLOR_NEG = "#6b4e9b";
const COLOR_V = "#183e54";
const COLOR_MV = "#c77700";
const COLOR_EIG = "#3a7d44";
const COLOR_GRID = "#4f8fae";
const COLOR_GUIDE = "#63727d";
const COLOR_TOUCH = "#183e54";
const COLOR_HELP = "#c77700";

const PRESETS: {
  label: string;
  title: string;
  color: string;
  m: Mat;
}[] = [
  {
    label: "Identitas",
    title: "Matriks identitas: tidak ada perubahan",
    color: COLOR_GUIDE,
    m: { a: 1, b: 0, c: 0, d: 1 },
  },
  {
    label: "Putar 45°",
    title: "Rotasi 45° berlawanan arah jarum jam",
    color: COLOR_POS,
    m: { a: 0.707, b: -0.707, c: 0.707, d: 0.707 },
  },
  {
    label: "Putar 90°",
    title: "Rotasi 90° berlawanan arah jarum jam",
    color: COLOR_POS,
    m: { a: 0, b: -1, c: 1, d: 0 },
  },
  {
    label: "Skala",
    title: "Penskalaan: sumbu x ×2, sumbu y ×1,5 (luas ×3)",
    color: COLOR_J,
    m: { a: 2, b: 0, c: 0, d: 1.5 },
  },
  {
    label: "Geser",
    title: "Geseran (shear) searah sumbu x",
    color: COLOR_MV,
    m: { a: 1, b: 1, c: 0, d: 1 },
  },
  {
    label: "Cermin",
    title: "Refleksi terhadap sumbu x (determinan negatif)",
    color: COLOR_NEG,
    m: { a: 1, b: 0, c: 0, d: -1 },
  },
  {
    label: "Singular",
    title: "Matriks singular: determinan 0, bidang runtuh menjadi garis",
    color: COLOR_I,
    m: { a: 1, b: 2, c: 0.5, d: 1 },
  },
  {
    label: "Simetris",
    title: "Matriks simetris: vektor eigen saling tegak lurus",
    color: COLOR_EIG,
    m: { a: 2, b: 1, c: 1, d: 2 },
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
  { key: "origGrid", label: "Kisi asli (sebelum transformasi)" },
  { key: "grid", label: "Kisi hasil transformasi" },
  { key: "basis", label: "Vektor basis i′ dan j′ (kolom matriks)" },
  { key: "square", label: "Persegi satuan → jajar genjang" },
  { key: "detLabel", label: "Label determinan dan luas" },
  { key: "vector", label: "Vektor v dan bayangannya Mv" },
  { key: "decomp", label: "Uraian v = x·i′ + y·j′" },
  { key: "eigen", label: "Garis vektor eigen (arah yang tidak berputar)" },
  { key: "circle", label: "Lingkaran satuan → elips" },
];

/* ---------- Matematika ---------- */

/** Matriks yang sedang ditampilkan: I + t·(M − I). */
function effective(p: Params): Mat {
  return {
    a: 1 + (p.a - 1) * p.t,
    b: p.b * p.t,
    c: p.c * p.t,
    d: 1 + (p.d - 1) * p.t,
  };
}

function analyze(p: Params) {
  const m = effective(p);
  const { a, b, c, d } = m;
  const det = a * d - b * c;
  const tr = a + d;
  const disc = tr * tr - 4 * det;

  // nilai dan vektor eigen real
  const eig: { l: number; v: Vec }[] = [];
  let eigNote = "";
  const scalar =
    Math.abs(b) < 1e-9 && Math.abs(c) < 1e-9 && Math.abs(a - d) < 1e-9;
  if (scalar) {
    eigNote = "Matriks skalar: setiap vektor adalah vektor eigen.";
  } else if (disc < -1e-9) {
    eigNote = "Tidak ada vektor eigen real: setiap arah ikut berputar.";
  } else {
    const root = Math.sqrt(Math.max(0, disc));
    const values =
      Math.abs(disc) < 1e-8 ? [tr / 2] : [(tr + root) / 2, (tr - root) / 2];
    values.forEach((l) => {
      let vx: number;
      let vy: number;
      if (Math.abs(c) > 1e-9) {
        vx = l - d;
        vy = c;
      } else if (Math.abs(b) > 1e-9) {
        vx = b;
        vy = l - a;
      } else if (Math.abs(l - a) < 1e-9) {
        vx = 1;
        vy = 0;
      } else {
        vx = 0;
        vy = 1;
      }
      const len = Math.hypot(vx, vy);
      if (len > 1e-12) eig.push({ l, v: [vx / len, vy / len] });
    });
  }

  const near = (x: number, y: number) => Math.abs(x - y) < TOL;
  const zero = [a, b, c, d].every((v) => Math.abs(v) < DET_ZERO);
  const ortho =
    near(a * a + c * c, 1) &&
    near(b * b + d * d, 1) &&
    Math.abs(a * b + c * d) < TOL;
  const angle = (Math.atan2(c, a) * 180) / Math.PI;
  let kind: string;
  if (zero) kind = "Matriks nol (semua titik ke asal)";
  else if (Math.abs(det) < DET_ZERO)
    kind = "Singular (bidang runtuh menjadi garis)";
  else if (near(a, 1) && near(d, 1) && Math.abs(b) < TOL && Math.abs(c) < TOL)
    kind = "Identitas (tidak berubah)";
  else if (ortho && det > 0) kind = `Rotasi ${fmt(angle, 1)}°`;
  else if (ortho) kind = "Refleksi (pencerminan)";
  else if (Math.abs(b) < TOL && Math.abs(c) < TOL) kind = "Penskalaan sumbu";
  else if (near(a, 1) && near(d, 1) && (Math.abs(b) < TOL || Math.abs(c) < TOL))
    kind = "Geseran (shear)";
  else kind = "Transformasi linear umum";

  const invertible = Math.abs(det) > 1e-6;
  const inverse: Mat | null = invertible
    ? { a: d / det, b: -b / det, c: -c / det, d: a / det }
    : null;

  const Mv: Vec = [a * p.vx + b * p.vy, c * p.vx + d * p.vy];

  return {
    m,
    det,
    tr,
    area: Math.abs(det),
    disc,
    eig,
    eigNote,
    kind,
    inverse,
    Mv,
    i2: [a, c] as Vec,
    j2: [b, d] as Vec,
  };
}

type Analysis = ReturnType<typeof analyze>;

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

const fmtPt = (x: number, y: number, digits = 2) =>
  `(${fmt(x, digits)}; ${fmt(y, digits)})`;

/** Bilangan negatif diberi kurung agar rumus substitusi terbaca jelas. */
const par = (v: number, digits = 2) =>
  v < -5e-4 ? `(${fmt(v, digits)})` : fmt(v, digits);

const round2 = (v: number) => Math.round(v * 100) / 100;
const round3 = (v: number) => Math.round(v * 1000) / 1000;
const clamp = (v: number, lim: number) => Math.min(lim, Math.max(-lim, v));

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
    className: "mt-nudge",
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

/** Satu baris: a  −  ──●──  +  [1,5]  ▶ */
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
  const clampV = (v: number) => Math.min(max, Math.max(min, v));
  const bind = useHoldRepeat((d) =>
    onChange(round(clampV(value + d * nudge))),
  );
  const pct = max > min ? ((clampV(value) - min) / (max - min)) * 100 : 0;
  const rangeStyle = {
    "--lo": bipolar ? `${Math.min(50, pct)}%` : "0%",
    "--hi": bipolar ? `${Math.max(50, pct)}%` : `${pct}%`,
    "--tone": tone,
  } as CSSProperties;

  return (
    <div className="mt-param" style={{ "--tone": tone } as CSSProperties}>
      <label htmlFor={id} title={title}>
        {label}
      </label>
      <button {...bind(-1)} aria-label={`Kurangi ${title}`}>
        <Minus size={12} aria-hidden="true" />
      </button>
      <input
        className="mt-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={clampV(value)}
        style={rangeStyle}
        aria-label={`Penggeser ${title}`}
        onChange={(event) =>
          onChange(round(clampV(Number(event.currentTarget.value))))
        }
      />
      <button {...bind(1)} aria-label={`Tambah ${title}`}>
        <Plus size={12} aria-hidden="true" />
      </button>
      <input
        id={id}
        className="mt-num"
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        aria-label={`Nilai ${title}`}
        onChange={(event) => {
          const v = parseFloat(event.currentTarget.value);
          if (Number.isFinite(v)) onChange(round(clampV(v)));
        }}
      />
      {onPlay ? (
        <button
          type="button"
          className="mt-icon-btn"
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
  <div className="mt-kv" key={key}>
    <span>{key}</span>
    <b>{value}</b>
  </div>
);

/** Matriks 2 × 2 dengan kurung siku. */
function MatrixView({ m, digits = 2 }: { m: Mat; digits?: number }) {
  return (
    <div
      className="mt-matrix"
      role="img"
      aria-label={`Matriks dua kali dua. Baris pertama ${fmt(m.a, digits)} dan ${fmt(m.b, digits)}. Baris kedua ${fmt(m.c, digits)} dan ${fmt(m.d, digits)}.`}
    >
      <span style={{ color: COLOR_I }}>{fmt(m.a, digits)}</span>
      <span style={{ color: COLOR_J }}>{fmt(m.b, digits)}</span>
      <span style={{ color: COLOR_I }}>{fmt(m.c, digits)}</span>
      <span style={{ color: COLOR_J }}>{fmt(m.d, digits)}</span>
    </div>
  );
}

/* ---------- Komponen utama ---------- */

export function MatrixTransformSimulation() {
  const baseId = useId().replace(/:/g, "");
  const boardId = `mt-board-${baseId}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const handlesRef = useRef<DragPoint[]>([]);
  const nativeFsRef = useRef(false);
  const syncSizeRef = useRef<(() => void) | null>(null);
  const { appearance, onStep } = useGraphAppearance([boardRef]);

  const [storedParams, setParams] = useStoredSimulationState<Params>(
    "matrix.params",
    DEFAULT_PARAMS,
  );
  const [storedOpts, setOpts] = useStoredSimulationState<Opts>(
    "matrix.opts",
    DEFAULT_OPTS,
  );
  // gabungkan dengan nilai bawaan agar pengaturan lama tetap valid
  const params = useMemo<Params>(
    () => ({ ...DEFAULT_PARAMS, ...storedParams }),
    [storedParams],
  );
  const opts = useMemo<Opts>(
    () => ({ ...DEFAULT_OPTS, ...storedOpts }),
    [storedOpts],
  );
  const [anim, setAnim] = useState<Anim>(null);
  const [tab, setTab] = useState<PanelTab>("par");
  // 0 = mode proses mati; 1..STEP_COUNT = langkah penjelasan
  const [step, setStep] = useState(0);
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
  const sRef = useRef(step);
  sRef.current = step;
  const moveRef = useRef<
    (which: DragWhich, x: number, y: number, pt: DragPoint) => void
  >(() => undefined);
  moveRef.current = (which, x, y, pt) => {
    const lim = which === "v" ? V_LIM : M_LIM;
    const cx = clamp(round2(x), lim);
    const cy = clamp(round2(y), lim);
    // titik tidak boleh keluar dari batas yang diatur slider
    if (cx !== x || cy !== y) pt.setPosition(COORDS_BY_USER, [cx, cy]);
    const prev = pRef.current;
    let next: Params;
    if (which === "v") {
      next = { ...prev, vx: cx, vy: cy };
    } else {
      // "kunci" matriks yang sedang tampil (t) agar kolom lain tidak melompat
      const e = effective(prev);
      const base: Params = { ...prev, ...e, t: 1 };
      next =
        which === "i" ? { ...base, a: cx, c: cy } : { ...base, b: cx, d: cy };
    }
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
    setStep(0);
    setParams(DEFAULT_PARAMS);
    setOpts(DEFAULT_OPTS);
    boardRef.current?.setBoundingBox(HOME_BOX, true);
  };

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
      keepAspectRatio: true, // sumbu x dan y harus berskala sama
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

    // analisis dihitung sekali per perubahan parameter
    let cache: { p: Params; v: Analysis } | null = null;
    const A = (): Analysis => {
      const p = pRef.current;
      if (!cache || cache.p !== p) cache = { p, v: analyze(p) };
      return cache.v;
    };
    const show = (key: keyof Opts) => oRef.current[key];
    const stepNow = () => sRef.current;
    /** Saat mode proses aktif, tiap elemen muncul sesuai langkahnya. */
    const on = (key: keyof Opts, minStep?: number) => {
      const st = stepNow();
      if (st > 0) return minStep !== undefined && st >= minStep;
      return show(key);
    };
    const tf = (x: number, y: number): Vec => {
      const m = A().m;
      return [m.a * x + m.b * y, m.c * x + m.d * y];
    };
    const identity = (x: number, y: number): Vec => [x, y];
    const unit = () => (board as unknown as { unitX: number }).unitX || 40;

    const extent = () => {
      const bb = board.getBoundingBox();
      return 4 * Math.max(...bb.map((v: number) => Math.abs(v))) + 30;
    };

    /* Kurva berdasarkan daftar titik; null di dalam daftar memutus garis,
       null sebagai hasil menyembunyikannya */
    const makeCurve = (
      color: string,
      width: number,
      dash: number,
      opacity: number,
      build: () => Pt[] | null,
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
      const ok = (q: Pt) =>
        q !== null && Number.isFinite(q[0]) && Number.isFinite(q[1]);
      curve.updateDataArray = () => {
        const points = build();
        if (!points || points.length === 0 || !points.some(ok)) {
          curve.dataX = [Number.NaN];
          curve.dataY = [Number.NaN];
          return;
        }
        curve.dataX = points.map((q) => (ok(q) ? (q as Vec)[0] : Number.NaN));
        curve.dataY = points.map((q) => (ok(q) ? (q as Vec)[1] : Number.NaN));
      };
      return curve;
    };

    /** Garis kisi x = k dan y = k untuk k bulat, dipetakan oleh `map`. */
    const gridSegments = (
      map: (x: number, y: number) => Vec,
      n: number,
      len: number,
    ): Pt[] => {
      const out: Pt[] = [];
      for (let k = -n; k <= n; k += 1) {
        if (k === 0) continue;
        out.push(map(k, -len), map(k, len), null);
        out.push(map(-len, k), map(len, k), null);
      }
      return out;
    };

    /** Panah dari `from` ke `to`; kepala panah berukuran tetap dalam piksel. */
    const arrow = (from: Vec, to: Vec): Pt[] | null => {
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];
      const len = Math.hypot(dx, dy);
      if (len < 1e-6) return null;
      const ux = dx / len;
      const uy = dy / len;
      const head = Math.min(12 / unit(), len * 0.5);
      const half = head * 0.42;
      const bx = to[0] - ux * head;
      const by = to[1] - uy * head;
      return [
        from,
        to,
        null,
        [bx - uy * half, by + ux * half],
        to,
        [bx + uy * half, by - ux * half],
      ];
    };

    /* Kisi asli (di bawah sumbu) */
    makeCurve("#d3dfe3", 1, 0, 0.95, () =>
      stepNow() > 0 || show("origGrid")
        ? gridSegments(identity, 30, 45)
        : null,
    );

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

    /* Kisi hasil transformasi + bayangan sumbu */
    makeCurve(COLOR_GRID, 1.2, 0, 0.8, () =>
      on("grid", 2) ? gridSegments(tf, 30, 90) : null,
    );
    makeCurve(COLOR_TOUCH, 2.2, 0, 0.6, () =>
      on("grid", 2)
        ? [tf(-90, 0), tf(90, 0), null, tf(0, -90), tf(0, 90)]
        : null,
    );

    /* Lingkaran satuan → elips (luas π·|det|) */
    const circlePts = (map: (x: number, y: number) => Vec): Pt[] => {
      const out: Pt[] = [];
      for (let i = 0; i <= 120; i += 1) {
        const a = (i / 120) * 2 * Math.PI;
        out.push(map(Math.cos(a), Math.sin(a)));
      }
      return out;
    };
    makeCurve(COLOR_GUIDE, 1.4, 3, 0.9, () =>
      on("circle") ? circlePts(identity) : null,
    );
    makeCurve(
      COLOR_MV,
      2.4,
      0,
      1,
      () => (on("circle") ? circlePts(tf) : null),
      { color: COLOR_MV, opacity: 0.1 },
    );

    /* Persegi satuan asli (putus-putus) */
    makeCurve(
      COLOR_GUIDE,
      1.6,
      3,
      0.95,
      () =>
        on("square", 3)
          ? [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ]
          : null,
      { color: COLOR_GUIDE, opacity: 0.07 },
    );
    /* Jajar genjang bayangannya: teal bila det ≥ 0, ungu bila det < 0 */
    const parallelogram = (): Pt[] => [
      [0, 0],
      tf(1, 0),
      tf(1, 1),
      tf(0, 1),
      [0, 0],
    ];
    makeCurve(
      COLOR_POS,
      2.6,
      0,
      1,
      () => (on("square", 3) && A().det >= 0 ? parallelogram() : null),
      { color: COLOR_POS, opacity: 0.22 },
    );
    makeCurve(
      COLOR_NEG,
      2.6,
      0,
      1,
      () => (on("square", 3) && A().det < 0 ? parallelogram() : null),
      { color: COLOR_NEG, opacity: 0.22 },
    );

    /* Garis vektor eigen */
    [0, 1].forEach((idx) => {
      makeCurve(COLOR_EIG, 1.8, 4, 0.95, () => {
        if (!on("eigen")) return null;
        const e = A().eig[idx];
        if (!e) return null;
        const s = extent();
        return [
          [-e.v[0] * s, -e.v[1] * s],
          [e.v[0] * s, e.v[1] * s],
        ];
      });
    });

    /* Uraian v = x·i′ + y·j′ (dan uraian aslinya x·i + y·j) */
    const decomp = () => {
      const p = pRef.current;
      const m = A().m;
      const corner: Vec = [m.a * p.vx, m.c * p.vx];
      return { corner, end: A().Mv };
    };
    makeCurve(COLOR_GUIDE, 1.4, 3, 0.9, () =>
      on("decomp")
        ? [
            [0, 0],
            [pRef.current.vx, 0],
            [pRef.current.vx, pRef.current.vy],
          ]
        : null,
    );
    makeCurve(COLOR_I, 2.4, 3, 1, () =>
      on("decomp") ? [[0, 0], decomp().corner] : null,
    );
    makeCurve(COLOR_J, 2.4, 3, 1, () =>
      on("decomp") ? [decomp().corner, decomp().end] : null,
    );

    /* Vektor basis: i, j asli (pudar) dan bayangannya i′, j′ */
    makeCurve(COLOR_I, 1.6, 2, 0.45, () =>
      on("basis", 1) ? arrow([0, 0], [1, 0]) : null,
    );
    makeCurve(COLOR_J, 1.6, 2, 0.45, () =>
      on("basis", 1) ? arrow([0, 0], [0, 1]) : null,
    );
    makeCurve(COLOR_I, 3.6, 0, 1, () =>
      on("basis", 1) ? arrow([0, 0], A().i2) : null,
    );
    makeCurve(COLOR_J, 3.6, 0, 1, () =>
      on("basis", 1) ? arrow([0, 0], A().j2) : null,
    );

    /* Vektor v dan bayangannya Mv */
    makeCurve(COLOR_V, 2.4, 0, 1, () =>
      on("vector")
        ? arrow([0, 0], [pRef.current.vx, pRef.current.vy])
        : null,
    );
    makeCurve(COLOR_MV, 2.8, 0, 1, () =>
      on("vector") ? arrow([0, 0], A().Mv) : null,
    );

    /* Titik dan label */
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

    // titik asal
    board.create("point", [0, 0], {
      name: "",
      withLabel: false,
      size: 3.5,
      face: "o",
      fillColor: COLOR_TOUCH,
      strokeColor: "#ffffff",
      strokeWidth: 1.5,
      fixed: true,
      highlight: false,
    });

    // label vektor basis
    label(
      () => (on("basis", 1) ? A().i2[0] : Number.NaN),
      () => A().i2[1],
      "i′",
      COLOR_I,
      [8, -20],
    );
    label(
      () => (on("basis", 1) ? A().j2[0] : Number.NaN),
      () => A().j2[1],
      "j′",
      COLOR_J,
      [-22, 8],
    );
    // label v dan Mv
    label(
      () => (on("vector") ? pRef.current.vx : Number.NaN),
      () => pRef.current.vy,
      "v",
      COLOR_V,
      [10, 6],
    );
    label(
      () => (on("vector") ? A().Mv[0] : Number.NaN),
      () => A().Mv[1],
      "Mv",
      COLOR_MV,
      [10, 6],
    );
    // determinan dan luas, di pusat jajar genjang
    label(
      () => (on("detLabel", 4) && on("square", 3) ? tf(0.5, 0.5)[0] : Number.NaN),
      () => tf(0.5, 0.5)[1],
      () => `det = ${fmt(A().det, 2)}  ·  luas = ${fmt(A().area, 2)}`,
      COLOR_TOUCH,
      [-58, -8],
    );
    // nilai eigen
    [0, 1].forEach((idx) => {
      label(
        () => {
          const e = A().eig[idx];
          return on("eigen") && e ? e.v[0] * 3.2 : Number.NaN;
        },
        () => {
          const e = A().eig[idx];
          return e ? e.v[1] * 3.2 : Number.NaN;
        },
        () => {
          const e = A().eig[idx];
          return e ? `λ = ${fmt(e.l, 2)}` : "";
        },
        COLOR_EIG,
        [8, 8],
      );
    });

    // titik Mv (hasil, tidak bisa diseret)
    board.create(
      "point",
      [
        () => (on("vector") ? A().Mv[0] : Number.NaN),
        () => A().Mv[1],
      ],
      {
        name: "",
        withLabel: false,
        size: 5,
        face: "o",
        fillColor: COLOR_MV,
        strokeColor: "#ffffff",
        strokeWidth: 1.5,
        fixed: true,
        highlight: false,
      },
    );

    // titik yang bisa diseret: ujung i′, ujung j′, dan v (dibuat paling akhir
    // agar berada di atas)
    const makeHandle = (
      which: DragWhich,
      at: Vec,
      color: string,
      size: number,
    ) => {
      const pt = board.create("point", at, {
        name: "",
        withLabel: false,
        size,
        face: "o",
        fillColor: color,
        strokeColor: "#ffffff",
        strokeWidth: 2,
        fixed: false,
        highlight: false,
        snapToGrid: false,
        showInfobox: false,
      }) as unknown as DragPoint;
      pt.on("drag", () => moveRef.current(which, pt.X(), pt.Y(), pt));
      return pt;
    };
    const a0 = analyze(pRef.current);
    handlesRef.current = [
      makeHandle("i", a0.i2, COLOR_I, 6.5),
      makeHandle("j", a0.j2, COLOR_J, 6.5),
      makeHandle("v", [pRef.current.vx, pRef.current.vy], COLOR_V, 6),
    ];

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
      handlesRef.current = [];
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
    };
  }, [boardId]);

  // Perbarui papan setiap parameter atau pilihan berubah; titik yang bisa
  // diseret disamakan dengan nilai matriks yang sedang tampil.
  useEffect(() => {
    const points = handlesRef.current;
    if (points.length === 3) {
      const e = effective(params);
      (
        [
          [e.a, e.c],
          [e.b, e.d],
          [params.vx, params.vy],
        ] as Vec[]
      ).forEach(([x, y], i) => {
        const pt = points[i];
        if (Math.abs(pt.X() - x) > 1e-9 || Math.abs(pt.Y() - y) > 1e-9)
          pt.setPosition(COORDS_BY_USER, [x, y]);
      });
    }
    boardRef.current?.update();
  }, [params, opts, step]);

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

  // Animasi: t maju-mundur antara 0 (identitas) dan 1 (matriks M)
  useEffect(() => {
    if (!anim) return undefined;
    let raf = 0;
    let last = performance.now();
    let value = pRef.current.t;
    let dir: 1 | -1 = value >= 1 ? -1 : 1;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      value += dir * dt * 0.35;
      if (value >= 1) {
        value = 1;
        dir = -1;
      } else if (value <= 0) {
        value = 0;
        dir = 1;
      }
      setParams((prev) => ({ ...prev, t: round3(value) }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim]);

  /* ---------- Turunan untuk tampilan ---------- */

  const sameMatrix = (p: Params, m: Mat) =>
    (["a", "b", "c", "d"] as const).every(
      (key) => Math.abs(p[key] - m[key]) < 1e-6,
    ) && Math.abs(p.t - 1) < 1e-6;

  const m = an.m;
  const flipped = an.det < -DET_ZERO;
  const collapsed = Math.abs(an.det) < DET_ZERO;
  const orientation = collapsed
    ? "runtuh (luas 0)"
    : flipped
      ? "orientasi terbalik"
      : "orientasi tetap";
  const areaTone = flipped ? COLOR_NEG : COLOR_POS;
  const partial = Math.abs(params.t - 1) > 1e-6;

  const goStep = (delta: number) =>
    setStep((value) => Math.min(STEP_COUNT, Math.max(1, value + delta)));
  const startProcess = () => {
    setAnim(null);
    setStep(1);
  };

  const procSteps: { title: string; caption: string; body: string }[] = [
    {
      title: "Kolom = bayangan basis",
      caption: `Kolom 1 = bayangan i, kolom 2 = bayangan j: i′ = ${fmtPt(an.i2[0], an.i2[1])}, j′ = ${fmtPt(an.j2[0], an.j2[1])}.`,
      body: `Matriks M memetakan vektor basis i = (1; 0) ke i′ = (a; c) = ${fmtPt(an.i2[0], an.i2[1])} dan j = (0; 1) ke j′ = (b; d) = ${fmtPt(an.j2[0], an.j2[1])}. Jadi isi kolom-kolom matriks langsung memberi tahu ke mana vektor basis pergi. Seret ujung i′ atau j′ pada grafik untuk mengubah matriksnya.`,
    },
    {
      title: "Kisi ikut berubah",
      caption: "Garis kisi tetap lurus dan sejajar; titik asal tetap diam.",
      body: "Setiap titik (x, y) berpindah ke x·i′ + y·j′. Karena itu garis lurus tetap lurus, garis sejajar tetap sejajar dengan jarak antargaris yang sama, dan titik asal tidak bergerak. Kisi persegi berubah menjadi kisi jajar genjang yang disusun oleh i′ dan j′.",
    },
    {
      title: "Persegi satuan → jajar genjang",
      caption: "Persegi satuan (luas 1) menjadi jajar genjang bersisi i′ dan j′.",
      body: "Persegi satuan bersisi i dan j (luas 1) berubah menjadi jajar genjang bersisi i′ dan j′. Seluruh bidang diskalakan dengan faktor luas yang sama, jadi luas jajar genjang ini adalah faktor perubahan luas untuk bangun apa pun.",
    },
    {
      title: "Determinan = luas bertanda",
      caption: `det = ad − bc = ${fmt(an.det, 2)}; luas jajar genjang = |det| = ${fmt(an.area, 2)}.`,
      body: `det M = a·d − b·c. Luas jajar genjang = |det|, sedangkan tanda det menunjukkan orientasi: positif berarti i′ ke j′ tetap berlawanan arah jarum jam seperti i ke j, negatif berarti orientasi terbalik (seperti bayangan cermin). Bila det = 0, luas runtuh menjadi 0, bidang tertekan menjadi garis atau titik, dan matriks tidak punya invers.`,
    },
  ];

  const countText = `det = ${fmt(an.det, 2)}${partial ? ` · t = ${fmt(params.t, 2)}` : ""}`;

  return (
    <div
      ref={rootRef}
      className={`matrix-simulation simulation-fullscreen-frame${
        tabbed ? " is-tabbed" : ""
      }${isFull ? " is-fullscreen" : ""}`}
    >
      <p className="mt-orientation-hint">
        <Smartphone size={14} aria-hidden="true" />
        <span>
          Miringkan ponsel ke mode lanskap agar grafik dan panel isian tampil
          berdampingan.
        </span>
      </p>

      <div className="mt-boards">
        {/* ───── Wilayah grafik (2 bagian) ───── */}
        <section className="mt-board-panel" aria-label="Grafik transformasi matriks">
          <div className="mt-stage">
            <div
              className="mt-board"
              id={boardId}
              ref={containerRef}
              tabIndex={0}
              aria-label="Grafik transformasi matriks pada kisi koordinat. Seret latar untuk menggeser, roda mouse atau cubit untuk zoom, seret ujung vektor basis i′ atau j′ untuk mengubah matriks, seret titik v untuk memindahkan vektor."
            />

            <p
              className="mt-chip"
              style={{ borderLeftColor: areaTone }}
              aria-live="polite"
            >
              <b style={{ color: areaTone }}>{an.kind}</b>
              <span>{countText}</span>
            </p>

            <div className="mt-pinfo" aria-live="off">
              <span>
                <b>luas</b> = {fmt(an.area, 2)}
              </span>
              <span>
                <b>M·v</b> = {fmtPt(an.Mv[0], an.Mv[1], 2)}
              </span>
            </div>

            <div className="mt-tools" role="group" aria-label="Tampilan">
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
                  className="mt-toolbar-toggle"
                  onClick={() => setPanelOpen((open) => !open)}
                  aria-pressed={panelOpen}
                  aria-controls={`mt-column-${baseId}`}
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
              className="mt-stepbar"
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
                  {step}/{STEP_COUNT} · {procSteps[step - 1].title}
                </b>
                <span>{procSteps[step - 1].caption}</span>
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

          <div className="mt-legend" aria-label="Legenda grafik">
            {(opts.basis || step > 0) && (
              <>
                <span>
                  <i style={{ borderTopColor: COLOR_I }} /> i′ (kolom 1)
                </span>
                <span>
                  <i style={{ borderTopColor: COLOR_J }} /> j′ (kolom 2)
                </span>
              </>
            )}
            {(opts.square || step >= 3) && (
              <span>
                <b
                  className="dot-area"
                  style={{ background: areaTone, opacity: 0.55 }}
                />{" "}
                jajar genjang ({flipped ? "det < 0" : "det ≥ 0"})
              </span>
            )}
            {(opts.grid || step >= 2) && (
              <span>
                <i style={{ borderTopColor: COLOR_GRID }} /> kisi baru
              </span>
            )}
            {opts.vector && step === 0 && (
              <>
                <span>
                  <i style={{ borderTopColor: COLOR_V }} /> v
                </span>
                <span>
                  <i style={{ borderTopColor: COLOR_MV }} /> Mv
                </span>
              </>
            )}
            {opts.eigen && step === 0 && (
              <span>
                <i className="line-eig" /> arah eigen
              </span>
            )}
          </div>
          <p className="mt-hint">
            Seret ujung i′ (merah) atau j′ (biru) untuk mengubah matriks · seret
            titik v · tahan klik kiri pada latar lalu seret untuk menggeser ·
            roda mouse untuk zoom.
          </p>
        </section>

        {/* ───── Wilayah input (1 bagian) ───── */}
        <div
          id={`mt-column-${baseId}`}
          className={`mt-column${isFull ? " is-floating" : ""}${
            isFull && panelOpen ? " is-open" : ""
          }`}
          data-tab={tab}
        >
          <div className="mt-tabs" role="group" aria-label="Bagian panel">
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

          <section className="mt-controls" aria-label="Pengaturan">
            <div className="mt-pane" data-pane="par">
              <div
                className="mt-kinds"
                role="group"
                aria-label="Contoh transformasi"
              >
                {PRESETS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    title={item.title}
                    aria-label={item.title}
                    aria-pressed={sameMatrix(params, item.m)}
                    style={{ "--kc": item.color } as CSSProperties}
                    onClick={() => setParam({ ...item.m, t: 1 })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-params">
                <p className="mt-group" style={{ color: COLOR_I }}>
                  Kolom 1: bayangan i, yaitu i′ = (a, c)
                </p>
                <ParamRow
                  id={`mt-a-${baseId}`}
                  label="a"
                  title="elemen a (baris 1, kolom 1)"
                  value={params.a}
                  min={-M_LIM}
                  max={M_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_I}
                  onChange={(v) => setParam({ a: v })}
                />
                <ParamRow
                  id={`mt-c-${baseId}`}
                  label="c"
                  title="elemen c (baris 2, kolom 1)"
                  value={params.c}
                  min={-M_LIM}
                  max={M_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_I}
                  onChange={(v) => setParam({ c: v })}
                />

                <p className="mt-group" style={{ color: COLOR_J }}>
                  Kolom 2: bayangan j, yaitu j′ = (b, d)
                </p>
                <ParamRow
                  id={`mt-b-${baseId}`}
                  label="b"
                  title="elemen b (baris 1, kolom 2)"
                  value={params.b}
                  min={-M_LIM}
                  max={M_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_J}
                  onChange={(v) => setParam({ b: v })}
                />
                <ParamRow
                  id={`mt-d-${baseId}`}
                  label="d"
                  title="elemen d (baris 2, kolom 2)"
                  value={params.d}
                  min={-M_LIM}
                  max={M_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_J}
                  onChange={(v) => setParam({ d: v })}
                />

                <p className="mt-group" style={{ color: COLOR_V }}>
                  Vektor v yang ditransformasikan
                </p>
                <ParamRow
                  id={`mt-vx-${baseId}`}
                  label="v₁"
                  title="komponen x vektor v"
                  value={params.vx}
                  min={-V_LIM}
                  max={V_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_V}
                  onChange={(v) => setParam({ vx: v })}
                />
                <ParamRow
                  id={`mt-vy-${baseId}`}
                  label="v₂"
                  title="komponen y vektor v"
                  value={params.vy}
                  min={-V_LIM}
                  max={V_LIM}
                  step={0.1}
                  nudge={0.1}
                  digits={2}
                  bipolar
                  tone={COLOR_V}
                  onChange={(v) => setParam({ vy: v })}
                />

                <p className="mt-group" style={{ color: COLOR_TOUCH }}>
                  Peralihan dari identitas I ke M
                </p>
                <ParamRow
                  id={`mt-t-${baseId}`}
                  label="t"
                  title="peralihan t dari matriks identitas (0) ke matriks M (1)"
                  value={params.t}
                  min={0}
                  max={1}
                  step={0.01}
                  nudge={0.01}
                  digits={2}
                  tone={COLOR_TOUCH}
                  playing={anim === "t"}
                  onChange={(v) => setParam({ t: v })}
                  onPlay={() => setAnim(anim === "t" ? null : "t")}
                />
              </div>

              <button type="button" className="mt-reset" onClick={reset}>
                <RotateCcw size={13} aria-hidden="true" />
                <span>Atur ulang</span>
              </button>
            </div>

            <div className="mt-pane" data-pane="opt">
              <div className="mt-options">
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

          <div className="mt-results">
            <div className="mt-pane" data-pane="proc">
              {step === 0 ? (
                <section className="mt-card" aria-label="Mulai penjelasan">
                  <h4 style={{ color: COLOR_HELP }}>
                    Dari matriks ke luas: 4 langkah
                  </h4>
                  <p>
                    Lihat bagaimana kolom matriks menentukan bayangan vektor
                    basis, bagaimana kisi ikut berubah, lalu bagaimana
                    determinan muncul sebagai luas jajar genjang. Setiap
                    langkah digambar langsung di grafik dan ikut berubah saat
                    matriks diubah.
                  </p>
                  <button
                    type="button"
                    className="mt-primary"
                    onClick={startProcess}
                  >
                    Mulai penjelasan
                  </button>
                </section>
              ) : (
                <>
                  <ol className="mt-steps" aria-label="Langkah penjelasan">
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
                    <section className="mt-card" aria-label="Perhitungan">
                      <h4 style={{ color: COLOR_HELP }}>Perhitungan</h4>
                      <p className="mt-eq">det = a·d − b·c</p>
                      <p className="mt-eq">
                        det = {par(m.a)}·{par(m.d)} − {par(m.b)}·{par(m.c)}
                      </p>
                      <p className="mt-eq">
                        det = {fmt(m.a * m.d, 3)} − {par(m.b * m.c, 3)} ={" "}
                        {fmt(an.det)}
                      </p>
                      <p className="mt-eq">luas = |det| = {fmt(an.area)}</p>
                      <p className="mt-eq-note">
                        {collapsed
                          ? "det = 0: jajar genjang menjadi garis atau titik, jadi M tidak punya invers."
                          : flipped
                            ? "det < 0: luasnya |det|, tetapi orientasi terbalik (bayangan cermin)."
                            : an.area > 1
                              ? "det > 1: luas membesar, orientasi tetap."
                              : an.area < 1 - 5e-4
                                ? "0 < det < 1: luas mengecil, orientasi tetap."
                                : "det = 1: luas tidak berubah, orientasi tetap."}
                      </p>
                    </section>
                  )}
                  <div className="mt-stepnav">
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
              )}
            </div>

            <div className="mt-pane" data-pane="res">
              <section
                className="mt-card mt-card-kind"
                aria-label="Jenis transformasi"
              >
                <h3 style={{ color: areaTone }}>{an.kind}</h3>
                <p>
                  det = {fmt(an.det)} · luas jajar genjang = {fmt(an.area)} ·{" "}
                  {orientation}
                </p>
                {partial && (
                  <p>
                    Peralihan t = {fmt(params.t, 2)}: yang tampil adalah Mₜ = I
                    + t(M − I), belum matriks M sepenuhnya.
                  </p>
                )}
              </section>

              <section className="mt-card" aria-label="Matriks dan basis">
                <h4>Matriks yang tampil</h4>
                <MatrixView m={m} />
                <p className="mt-eq-note">
                  i′ = {fmtPt(an.i2[0], an.i2[1])} (kolom 1) · j′ ={" "}
                  {fmtPt(an.j2[0], an.j2[1])} (kolom 2)
                </p>
              </section>

              <section className="mt-card" aria-label="Determinan dan luas">
                <h4 style={{ color: areaTone }}>Determinan dan luas</h4>
                <p className="mt-eq">det = a·d − b·c</p>
                <p className="mt-eq-note">
                  {par(m.a)}·{par(m.d)} − {par(m.b)}·{par(m.c)} ={" "}
                  {fmt(an.det)}
                </p>
                {kv("Faktor luas |det|", fmt(an.area))}
                {kv("Luas persegi satuan", `1 → ${fmt(an.area)}`)}
                {kv("Luas elips dari lingkaran satuan", `π → ${fmt(Math.PI * an.area)}`)}
                {kv("Orientasi", orientation)}
              </section>

              <section className="mt-card" aria-label="Bayangan vektor">
                <h4 style={{ color: COLOR_MV }}>Bayangan vektor v</h4>
                <p className="mt-eq">
                  M·v = ({fmt(m.a)}·{par(params.vx)} + {par(m.b)}·
                  {par(params.vy)} ; {par(m.c)}·{par(params.vx)} + {par(m.d)}·
                  {par(params.vy)})
                </p>
                <p className="mt-eq-note">
                  v = {fmtPt(params.vx, params.vy)} → Mv ={" "}
                  {fmtPt(an.Mv[0], an.Mv[1])}
                </p>
              </section>

              <section className="mt-card" aria-label="Invers dan nilai eigen">
                <h4 style={{ color: COLOR_EIG }}>Invers dan nilai eigen</h4>
                {an.inverse ? (
                  <>
                    <p className="mt-eq-note">M⁻¹ = (1/det)·[[d, −b], [−c, a]]</p>
                    <MatrixView m={an.inverse} />
                  </>
                ) : (
                  <p className="mt-eq-note">
                    Tidak punya invers karena det = 0: banyak titik jatuh ke
                    tempat yang sama, sehingga transformasinya tidak bisa
                    dibalik.
                  </p>
                )}
                {an.eig.length > 0 ? (
                  an.eig.map((e, i) => (
                    <p className="mt-eq-note" key={`eig-${i}`}>
                      λ{i + 1} = {fmt(e.l)} dengan arah {fmtPt(e.v[0], e.v[1])}
                    </p>
                  ))
                ) : (
                  <p className="mt-eq-note">{an.eigNote}</p>
                )}
                {an.eig.length === 2 &&
                  kv("λ₁·λ₂ = det", fmt(an.eig[0].l * an.eig[1].l))}
              </section>
            </div>

            <div className="mt-pane" data-pane="info">
              <table className="mt-info-table">
                <thead>
                  <tr>
                    <th scope="col">Determinan</th>
                    <th scope="col">Efek pada bidang</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>det &gt; 1</td>
                    <td>Luas membesar, orientasi tetap</td>
                  </tr>
                  <tr>
                    <td>0 &lt; det &lt; 1</td>
                    <td>Luas mengecil, orientasi tetap</td>
                  </tr>
                  <tr>
                    <td>det = 1</td>
                    <td>Luas tetap (rotasi, geseran)</td>
                  </tr>
                  <tr>
                    <td>det &lt; 0</td>
                    <td>Orientasi terbalik; luas berubah sebesar |det|</td>
                  </tr>
                  <tr>
                    <td>det = 0</td>
                    <td>Bidang runtuh menjadi garis atau titik, tanpa invers</td>
                  </tr>
                </tbody>
              </table>
              <ul className="mt-insights">
                <li>
                  <strong style={{ color: COLOR_I }}>Kolom = bayangan basis:</strong>{" "}
                  kolom pertama matriks adalah tempat i = (1, 0) mendarat, dan
                  kolom kedua adalah tempat j = (0, 1) mendarat. Titik (x, y)
                  berpindah ke x·i′ + y·j′.
                </li>
                <li>
                  <strong style={{ color: COLOR_POS }}>Determinan = luas:</strong>{" "}
                  persegi satuan berluas 1 menjadi jajar genjang berluas
                  |ad − bc|. Semua bangun diskalakan dengan faktor yang sama,
                  misalnya lingkaran satuan menjadi elips berluas π·|det|.
                </li>
                <li>
                  <strong style={{ color: COLOR_NEG }}>Tanda determinan:</strong>{" "}
                  bila negatif, i′ ke j′ berputar searah jarum jam sehingga
                  bidang seperti dicerminkan. Coba preset Cermin lalu
                  animasikan t: determinan melewati 0 saat bidang terlipat
                  rata.
                </li>
                <li>
                  <strong style={{ color: COLOR_EIG }}>Vektor eigen:</strong>{" "}
                  arahnya tidak berputar, hanya dikali λ. Pada hasil kali
                  kedua nilai eigen, λ₁·λ₂ = det.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
