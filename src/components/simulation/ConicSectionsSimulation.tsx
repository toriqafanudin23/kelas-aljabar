import {
  Crosshair,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Smartphone,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./ConicSectionsSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useGraphAppearance } from "./simulationBoard";
import { useStoredSimulationState } from "./useStoredSimulationState";

/* Simulasi irisan kerucut.
   Satu keluarga kurva dengan fokus di titik asal (0, 0) dan persamaan kutub

       r = ℓ / (1 − e cos θ)

   e = eksentrisitas, ℓ = parameter (setengah lebar fokal / semi latus rectum).
   e = 0 lingkaran, 0 < e < 1 elips, e = 1 parabola, e > 1 hiperbola.
   Setiap titik P memenuhi  PF = e · (jarak P ke direktriks).
   Persamaan umum: (1 − e²)x² − 2eℓx + y² = ℓ².

   Tata letak: ponsel lanskap → desktop → ponsel potret.
   Wilayah grafik : wilayah input = 2 : 1. */

/* ---------- Tipe ---------- */

type Vec = [number, number];
type Sample = [number, number, number]; // x, y, θ (derajat)
type Params = { e: number; l: number; t: number };
type Opts = {
  focus: boolean;
  dir: boolean;
  tangent: boolean;
  dist: boolean;
  guide: boolean;
  ghost: boolean;
};
type Kind = "circle" | "ellipse" | "parabola" | "hyperbola";
type PanelTab = "par" | "opt" | "res" | "info";
type Anim = "e" | "t" | null;
type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;
type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
  setAttribute: (attributes: Record<string, unknown>) => void;
};

/* ---------- Konstanta ---------- */

const EPS = 1e-9;
const E_MIN = 0;
const E_MAX = 3;
const L_MIN = 0.5;
const L_MAX = 10;
const HOME_BOX: [number, number, number, number] = [-10, 10, 16, -10];
/** Layar kecil atau pendek memakai panel kanan bertab. */
const TABBED_QUERY = "(max-width: 899px), (max-height: 540px)";

const DEFAULT_PARAMS: Params = { e: 0.6, l: 4, t: 60 };
const DEFAULT_OPTS: Opts = {
  focus: true,
  dir: true,
  tangent: true,
  dist: true,
  guide: false,
  ghost: true,
};

const KINDS: Record<Kind, { label: string; color: string; e: number }> = {
  circle: { label: "Lingkaran", color: "#087f8c", e: 0 },
  ellipse: { label: "Elips", color: "#6b4e9b", e: 0.6 },
  parabola: { label: "Parabola", color: "#d16b36", e: 1 },
  hyperbola: { label: "Hiperbola", color: "#b23a48", e: 2 },
};
const KIND_ORDER: Kind[] = ["circle", "ellipse", "parabola", "hyperbola"];

const COLOR_FOCUS = "#183e54";
const COLOR_DIR = "#8a6d00";
const COLOR_TAN = "#2f6bd0";
const COLOR_GUIDE = "#63727d";

const panelTabs: { tab: PanelTab; label: string }[] = [
  { tab: "par", label: "Parameter" },
  { tab: "opt", label: "Tampilan" },
  { tab: "res", label: "Hasil" },
  { tab: "info", label: "Info" },
];

const optionRows: { key: keyof Opts; label: string }[] = [
  { key: "focus", label: "Fokus" },
  { key: "dir", label: "Direktriks" },
  { key: "tangent", label: "Titik P dan garis singgung" },
  { key: "dist", label: "Jarak P ke fokus dan ke direktriks" },
  { key: "guide", label: "Pusat, puncak, dan asimtot" },
];

/* ---------- Matematika ---------- */

function kindOf(e: number): Kind {
  if (e < EPS) return "circle";
  if (Math.abs(e - 1) < EPS) return "parabola";
  return e < 1 ? "ellipse" : "hyperbola";
}

function analyze(e: number, l: number, tDeg: number) {
  const kind = kindOf(e);
  const e2 = e * e;
  let a = Number.NaN;
  let b = Number.NaN;
  let c = 0;
  let x0 = Number.NaN;
  if (kind === "circle") {
    a = l;
    b = l;
    x0 = 0;
  } else if (kind === "ellipse") {
    a = l / (1 - e2);
    b = a * Math.sqrt(1 - e2);
    c = e * a;
    x0 = c; // pusat di (+c, 0)
  } else if (kind === "hyperbola") {
    a = l / (e2 - 1);
    b = a * Math.sqrt(e2 - 1);
    c = e * a;
    x0 = -c; // pusat di (−c, 0)
  }
  const pair = kind === "ellipse" || kind === "hyperbola";
  const f2: Vec | null = pair ? [2 * x0, 0] : null;
  const dir1 = e > EPS ? -l / e : null;
  const dir2 = pair ? 2 * x0 + l / e : null;
  const vertices: Vec[] =
    kind === "parabola"
      ? [[-l / 2, 0]]
      : pair
        ? [
            [x0 - a, 0],
            [x0 + a, 0],
          ]
        : [];

  // titik P pada sudut θ (diukur dari fokus)
  const th = (tDeg * Math.PI) / 180;
  const u = 1 - e * Math.cos(th);
  const r = Math.abs(u) > 1e-4 ? l / u : Number.NaN;
  const valid = Number.isFinite(r) && Math.abs(r) < 1e5;
  const px = valid ? r * Math.cos(th) : Number.NaN;
  const py = valid ? r * Math.sin(th) : Number.NaN;
  const rp = valid ? (-l * e * Math.sin(th)) / (u * u) : Number.NaN;
  const tx = rp * Math.cos(th) - r * Math.sin(th);
  const ty = rp * Math.sin(th) + r * Math.cos(th);
  // garis singgung: A x + B y = C
  const tanA = (1 - e2) * px - e * l;
  const tanB = py;
  const tanC = l * l + e * l * px;
  const pf1 = valid ? Math.abs(r) : Number.NaN;
  const pf2 = valid && f2 ? Math.hypot(px - f2[0], py) : Number.NaN;
  const pd = valid && dir1 !== null ? Math.abs(px - dir1) : Number.NaN;

  return {
    kind,
    e,
    l,
    a,
    b,
    c,
    x0,
    pair,
    f2,
    dir1,
    dir2,
    vertices,
    valid,
    px,
    py,
    tx,
    ty,
    tanA,
    tanB,
    tanC,
    slope: Math.abs(tanB) > 1e-9 ? -tanA / tanB : null,
    pf1,
    pf2,
    pd,
    ratio: pd > EPS ? pf1 / pd : Number.NaN,
    rightBranch: u > 0,
  };
}

type Analysis = ReturnType<typeof analyze>;

/** Titik-titik kurva r = ℓ/(1 − e cos θ), dipotong pada jarak rmax. */
function conicBranch(
  e: number,
  l: number,
  rmax: number,
  which: "a" | "b",
): Sample[] {
  const make = (t0: number, t1: number, n: number) => {
    const out: Sample[] = [];
    for (let i = 0; i <= n; i += 1) {
      const t = t0 + ((t1 - t0) * i) / n;
      const r = l / (1 - e * Math.cos(t));
      let deg = (t * 180) / Math.PI;
      if (deg > 180) deg -= 360;
      out.push([r * Math.cos(t), r * Math.sin(t), deg]);
    }
    return out;
  };
  const clampCos = (v: number) => Math.min(1, Math.max(-1, v));
  if (e < 1 - EPS) return which === "a" ? make(0, 2 * Math.PI, 720) : [];
  const k = l / rmax;
  if (which === "a") {
    const tLo = Math.acos(clampCos((1 - k) / e));
    return make(tLo, 2 * Math.PI - tLo, 520);
  }
  if (e > 1 + EPS) {
    const cB = (1 + k) / e;
    if (cB < 1) {
      const tHi = Math.acos(cB);
      return make(-tHi, tHi, 520);
    }
  }
  return [];
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

function shifted(h: number) {
  if (Math.abs(h) < 5e-4) return "x";
  return h > 0 ? `(x − ${fmt(h)})` : `(x + ${fmt(-h)})`;
}

function standardForm(an: Analysis) {
  const { kind, l } = an;
  if (kind === "circle") return `x² + y² = ${fmt(l * l)}`;
  if (kind === "ellipse")
    return `${shifted(an.x0)}² / ${fmt(an.a * an.a)} + y² / ${fmt(an.b * an.b)} = 1`;
  if (kind === "hyperbola")
    return `${shifted(an.x0)}² / ${fmt(an.a * an.a)} − y² / ${fmt(an.b * an.b)} = 1`;
  const p = l / 2;
  return `y² = ${fmt(4 * p)}(x + ${fmt(p)})`;
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
    className: "cs-nudge",
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

/** Satu baris: e  −  ──●──  +  [0,6]  ▶ */
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
  const pct = ((clamp(value) - min) / (max - min)) * 100;
  const rangeStyle = {
    "--lo": bipolar ? `${Math.min(50, pct)}%` : "0%",
    "--hi": bipolar ? `${Math.max(50, pct)}%` : `${pct}%`,
    "--tone": tone,
  } as CSSProperties;

  return (
    <div className="cs-param" style={{ "--tone": tone } as CSSProperties}>
      <label htmlFor={id} title={title}>
        {label}
      </label>
      <button {...bind(-1)} aria-label={`Kurangi ${title}`}>
        <Minus size={12} aria-hidden="true" />
      </button>
      <input
        className="cs-range"
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
        className="cs-num"
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
          className="cs-icon-btn"
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
  <div className="cs-kv" key={key}>
    <span>{key}</span>
    <b>{value}</b>
  </div>
);

/* ---------- Komponen utama ---------- */

export function ConicSectionsSimulation() {
  const baseId = useId().replace(/:/g, "");
  const boardId = `cs-board-${baseId}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const nativeFsRef = useRef(false);
  const syncSizeRef = useRef<(() => void) | null>(null);
  const samplesRef = useRef<Sample[]>([]);
  const mainCurvesRef = useRef<DataCurve[]>([]);
  const { appearance, onStep } = useGraphAppearance([boardRef]);

  const [params, setParams] = useStoredSimulationState<Params>(
    "conic.params",
    DEFAULT_PARAMS,
  );
  const [opts, setOpts] = useStoredSimulationState<Opts>(
    "conic.opts",
    DEFAULT_OPTS,
  );
  const [anim, setAnim] = useState<Anim>(null);
  const [tab, setTab] = useState<PanelTab>("par");
  const [isFull, setIsFull] = useState(false);
  const smallScreen = useMediaQuery(TABBED_QUERY);
  // Layar kecil / pendek dan layar penuh memakai panel kanan bertab.
  const tabbed = smallScreen || isFull;

  // data yang dibaca papan JSXGraph (selalu lewat ref agar tidak basi)
  const pRef = useRef(params);
  pRef.current = params;
  const oRef = useRef(opts);
  oRef.current = opts;
  const clickRef = useRef<(deg: number) => void>(() => undefined);
  clickRef.current = (deg: number) => {
    setAnim(null);
    setParams((prev) => ({ ...prev, t: deg }));
  };

  const an = analyze(params.e, params.l, params.t);
  const kindInfo = KINDS[an.kind];

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

    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        nativeFsRef.current = true;
        setIsFull(true);
        return;
      } catch {
        // Gagal masuk fullscreen asli: tetap pakai mode layar penuh CSS.
      }
    }
    setIsFull(true);
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
      if (!cache || cache.p !== p) cache = { p, v: analyze(p.e, p.l, p.t) };
      return cache.v;
    };
    const show = (key: keyof Opts) => oRef.current[key];

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
    ) => {
      const curve = board.create("curve", [[0], [0]], {
        strokeColor: color,
        strokeWidth: width,
        strokeOpacity: opacity,
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

    const toVec = (s: Sample[]): Vec[] => s.map(([x, y]) => [x, y] as Vec);

    // pembanding: keempat jenis dengan fokus dan ℓ yang sama
    KIND_ORDER.forEach((kind) => {
      const info = KINDS[kind];
      const ghost = (which: "a" | "b") => () =>
        show("ghost")
          ? toVec(conicBranch(info.e, pRef.current.l, extent(), which))
          : null;
      makeCurve(info.color, 1.6, 0, 0.4, ghost("a"));
      if (kind === "hyperbola") makeCurve(info.color, 1.6, 0, 0.4, ghost("b"));
    });

    // garis bantu: direktriks, asimtot
    const vertical = (x: number | null): Vec[] | null => {
      if (x === null || !Number.isFinite(x) || Math.abs(x) > 1e5) return null;
      const s = extent();
      return [
        [x, -s],
        [x, s],
      ];
    };
    makeCurve(COLOR_DIR, 2, 3, 1, () =>
      show("dir") ? vertical(A().dir1) : null,
    );
    makeCurve(COLOR_DIR, 2, 3, 1, () =>
      show("dir") ? vertical(A().dir2) : null,
    );

    [1, -1].forEach((sign) => {
      makeCurve(COLOR_GUIDE, 1.2, 2, 0.9, () => {
        const a = A();
        if (!show("guide") || a.kind !== "hyperbola") return null;
        const n = Math.hypot(a.a, a.b);
        const d: Vec = [a.a / n, (sign * a.b) / n];
        const s = extent();
        return [
          [a.x0 - d[0] * s, -d[1] * s],
          [a.x0 + d[0] * s, d[1] * s],
        ];
      });
    });

    // kurva utama (maksimal dua cabang); sampelnya disimpan untuk klik-menempatkan P
    const mainA = makeCurve(KINDS.circle.color, 3, 0, 1, () => {
      const p = pRef.current;
      const r = extent();
      const first = conicBranch(p.e, p.l, r, "a");
      samplesRef.current = first.concat(conicBranch(p.e, p.l, r, "b"));
      return toVec(first);
    });
    const mainB = makeCurve(KINDS.circle.color, 3, 0, 1, () => {
      const p = pRef.current;
      return toVec(conicBranch(p.e, p.l, extent(), "b"));
    });
    mainCurvesRef.current = [mainA, mainB];

    // garis singgung dan jarak
    makeCurve(COLOR_TAN, 2.4, 0, 1, () => {
      const a = A();
      if (!show("tangent") || !a.valid) return null;
      const n = Math.hypot(a.tx, a.ty);
      if (n < 1e-9) return null;
      const s = extent();
      const d: Vec = [a.tx / n, a.ty / n];
      return [
        [a.px - d[0] * s, a.py - d[1] * s],
        [a.px + d[0] * s, a.py + d[1] * s],
      ];
    });
    makeCurve(COLOR_GUIDE, 1.5, 2, 1, () => {
      const a = A();
      return show("dist") && a.valid
        ? [
            [a.px, a.py],
            [0, 0],
          ]
        : null;
    });
    makeCurve(COLOR_GUIDE, 1.5, 2, 1, () => {
      const a = A();
      return show("dist") && a.valid && a.f2
        ? [
            [a.px, a.py],
            [a.f2[0], 0],
          ]
        : null;
    });
    makeCurve(COLOR_DIR, 1.8, 2, 1, () => {
      const a = A();
      return show("dist") && a.valid && a.dir1 !== null
        ? [
            [a.px, a.py],
            [a.dir1, a.py],
          ]
        : null;
    });

    /* Titik dan label */
    const dot = (
      x: () => number,
      y: () => number,
      color: string,
      size: number,
      face = "o",
      fill = color,
    ) =>
      board.create("point", [x, y], {
        name: "",
        withLabel: false,
        size,
        face,
        fillColor: fill,
        strokeColor: color === fill ? "#ffffff" : color,
        strokeWidth: 1.5,
        fixed: true,
        highlight: false,
      });
    const label = (
      x: () => number,
      y: () => number,
      text: string,
      color: string,
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
          offset: [8, 8],
          highlight: false,
          fixed: true,
        },
      );

    const focusOn = () => show("focus");
    dot(
      () => (focusOn() ? 0 : Number.NaN),
      () => 0,
      COLOR_FOCUS,
      4.5,
    );
    dot(
      () => (focusOn() && A().f2 ? A().f2![0] : Number.NaN),
      () => 0,
      COLOR_FOCUS,
      4.5,
    );
    label(
      () => (focusOn() ? 0 : Number.NaN),
      () => 0,
      "F₁",
      COLOR_FOCUS,
    );
    label(
      () => (focusOn() && A().f2 ? A().f2![0] : Number.NaN),
      () => 0,
      "F₂",
      COLOR_FOCUS,
    );

    // pusat dan puncak
    const guideOn = () => show("guide");
    dot(
      () => (guideOn() && A().pair ? A().x0 : Number.NaN),
      () => 0,
      COLOR_GUIDE,
      3.5,
      "o",
      "#ffffff",
    );
    for (let k = 0; k < 2; k += 1) {
      dot(
        () => (guideOn() && A().vertices[k] ? A().vertices[k][0] : Number.NaN),
        () => 0,
        KINDS.circle.color,
        3.5,
        "<>",
      );
    }

    // titik P
    const pOn = () => (show("tangent") || show("dist")) && A().valid;
    dot(
      () => (pOn() ? A().px : Number.NaN),
      () => (pOn() ? A().py : Number.NaN),
      COLOR_FOCUS,
      5.5,
    );
    label(
      () => (pOn() ? A().px : Number.NaN),
      () => (pOn() ? A().py : Number.NaN),
      "P",
      COLOR_FOCUS,
    );

    board.update();

    // ───── klik/ketuk kurva untuk menempatkan titik P (geser tetap lancar) ─────
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved >= 5) return;
      const r = el.getBoundingClientRect();
      const [x1, y1, x2, y2] = board.getBoundingBox();
      const sx = r.width / (x2 - x1);
      const sy = r.height / (y1 - y2);
      const ux = x1 + ((e.clientX - r.left) / r.width) * (x2 - x1);
      const uy = y1 - ((e.clientY - r.top) / r.height) * (y1 - y2);
      let best: Sample | null = null;
      let bestD = 30; // piksel
      samplesRef.current.forEach((s) => {
        const d = Math.hypot((s[0] - ux) * sx, (s[1] - uy) * sy);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      });
      const hit = best as Sample | null;
      if (hit) clickRef.current(Math.round(hit[2] * 10) / 10);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);

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
      if (w === oldW && h === oldH) return;
      const bb = board.getBoundingBox();
      const spanX = bb[2] - bb[0];
      const spanY = bb[1] - bb[3];
      board.resizeContainer(w, h, true, true);
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

    return () => {
      observer.disconnect();
      syncSizeRef.current = null;
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
    };
  }, [boardId]);

  // Warna kurva utama mengikuti jenis irisan kerucut
  useEffect(() => {
    mainCurvesRef.current.forEach((curve) =>
      curve.setAttribute({ strokeColor: kindInfo.color }),
    );
    boardRef.current?.update();
  }, [kindInfo.color]);

  // Perbarui papan setiap parameter atau pilihan berubah
  useEffect(() => {
    boardRef.current?.update();
  }, [params, opts]);

  // Masuk/keluar layar penuh atau ganti mode panel mengubah ukuran papan
  useEffect(() => {
    const sync = () => syncSizeRef.current?.();
    const raf = requestAnimationFrame(() => requestAnimationFrame(sync));
    const t1 = window.setTimeout(sync, 250);
    const t2 = window.setTimeout(sync, 800);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [isFull, tabbed]);

  useEffect(() => {
    let timer = 0;
    const sync = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => syncSizeRef.current?.(), 120);
    };
    window.addEventListener("resize", sync);
    document.addEventListener("fullscreenchange", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", sync);
      document.removeEventListener("fullscreenchange", sync);
    };
  }, []);

  // Animasi: e bolak-balik 0 ↔ 3, atau titik P berkeliling
  useEffect(() => {
    if (!anim) return undefined;
    let raf = 0;
    let last = performance.now();
    let dir = 1;
    let e = pRef.current.e;
    let t = pRef.current.t;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (anim === "e") {
        e += dir * dt * 0.35;
        if (e >= E_MAX) {
          e = E_MAX;
          dir = -1;
        } else if (e <= E_MIN) {
          e = E_MIN;
          dir = 1;
        }
        const value = Math.round(e * 100) / 100;
        setParams((prev) => ({ ...prev, e: value }));
      } else {
        t += dt * 35;
        if (t > 180) t -= 360;
        const value = Math.round(t * 10) / 10;
        setParams((prev) => ({ ...prev, t: value }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim]);

  /* ---------- Turunan untuk tampilan ---------- */

  const { kind } = an;
  const general = `${poly([
    [1 - params.e * params.e, "x²"],
    [-2 * params.e * params.l, "x"],
    [1, "y²"],
  ])} = ${fmt(params.l * params.l)}`;

  const elements: [string, string][] = [];
  if (kind === "circle") {
    elements.push(["Pusat = fokus", "(0; 0)"]);
    elements.push(["Jari-jari r = ℓ", fmt(an.l)]);
    elements.push(["Direktriks", "di tak hingga"]);
  } else if (kind === "parabola") {
    elements.push(["p = ℓ/2", fmt(an.l / 2)]);
    elements.push(["Fokus F", "(0; 0)"]);
    elements.push(["Puncak", fmtPt(-an.l / 2, 0)]);
    elements.push(["Direktriks", `x = ${fmt(an.dir1 ?? Number.NaN)}`]);
    elements.push(["Lebar fokal 4p", fmt(2 * an.l)]);
  } else {
    elements.push(["a", fmt(an.a)]);
    elements.push(["b", fmt(an.b)]);
    elements.push([
      "c = √(" + (kind === "ellipse" ? "a² − b²" : "a² + b²") + ")",
      fmt(an.c),
    ]);
    elements.push(["e = c / a", fmt(an.c / an.a)]);
    elements.push(["Pusat", fmtPt(an.x0, 0)]);
    elements.push(["Fokus F₁", "(0; 0)"]);
    elements.push(["Fokus F₂", fmtPt(an.f2 ? an.f2[0] : 0, 0)]);
    elements.push([
      "Puncak",
      an.vertices.map((v) => fmtPt(v[0], v[1])).join("  "),
    ]);
    elements.push([
      "Direktriks",
      `x = ${fmt(an.dir1 ?? Number.NaN)} dan x = ${fmt(an.dir2 ?? Number.NaN)}`,
    ]);
    if (kind === "hyperbola")
      elements.push(["Asimtot", `y = ±${fmt(an.b / an.a)}${shifted(an.x0)}`]);
    elements.push(["ℓ = b² / a", fmt(an.l)]);
  }

  const tangentText = an.valid
    ? `${poly([
        [an.tanA, "x"],
        [an.tanB, "y"],
      ])} = ${fmt(an.tanC)}`
    : "—";

  return (
    <div
      ref={rootRef}
      className={`conic-simulation simulation-fullscreen-frame${
        tabbed ? " is-tabbed" : ""
      }${isFull ? " is-fullscreen" : ""}`}
    >
      <p className="cs-orientation-hint">
        <Smartphone size={14} aria-hidden="true" />
        <span>
          Miringkan ponsel ke mode lanskap agar grafik dan panel isian tampil
          berdampingan.
        </span>
      </p>

      <div className="cs-boards">
        {/* ───── Wilayah grafik (2 bagian) ───── */}
        <section className="cs-board-panel" aria-label="Grafik irisan kerucut">
          <div className="cs-stage">
            <div
              className="cs-board"
              id={boardId}
              ref={containerRef}
              tabIndex={0}
              aria-label="Grafik irisan kerucut dengan fokus di titik asal. Seret untuk menggeser, roda mouse atau cubit untuk zoom, klik atau ketuk kurva untuk menempatkan titik P."
            />

            <p
              className="cs-chip"
              style={{ borderLeftColor: kindInfo.color }}
              aria-live="polite"
            >
              <b style={{ color: kindInfo.color }}>{kindInfo.label}</b>
              <span>e = {fmt(params.e, 2)}</span>
            </p>

            {(opts.tangent || opts.dist) && (
              <div className="cs-pinfo" aria-live="off">
                {an.valid ? (
                  <>
                    <span>
                      <b>P</b> {fmtPt(an.px, an.py)}
                    </span>
                    {opts.dist && (
                      <span>
                        PF₁ = {fmt(an.pf1, 2)}
                        {Number.isFinite(an.pd) && (
                          <>
                            {" "}
                            · jarak ke direktriks = {fmt(an.pd, 2)} · rasio ={" "}
                            {fmt(an.ratio, 2)}
                          </>
                        )}
                      </span>
                    )}
                  </>
                ) : (
                  <span>P terlalu jauh (dekat arah asimtot).</span>
                )}
              </div>
            )}

            <div className="cs-tools" role="group" aria-label="Tampilan">
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
            </div>
          </div>

          <div className="cs-legend" aria-label="Legenda grafik">
            <span>
              <i style={{ borderTopColor: kindInfo.color }} /> {kindInfo.label}
            </span>
            {opts.focus && (
              <span>
                <b className="dot-focus" /> fokus
              </span>
            )}
            {opts.dir && (
              <span>
                <i className="line-dir" /> direktriks
              </span>
            )}
            {opts.tangent && (
              <span>
                <i className="line-tan" /> garis singgung
              </span>
            )}
            {opts.ghost &&
              KIND_ORDER.map((k) => (
                <span key={k} className="legend-ghost">
                  <b style={{ background: KINDS[k].color }} />{" "}
                  {KINDS[k].label.toLowerCase()} (e = {KINDS[k].e})
                </span>
              ))}
          </div>
          <p className="cs-hint">
            Tahan klik kiri lalu seret untuk menggeser · roda mouse untuk zoom ·
            klik pada kurva untuk memindahkan titik P.
          </p>
        </section>

        {/* ───── Wilayah input (1 bagian) ───── */}
        <div className="cs-column" data-tab={tab}>
          <div className="cs-tabs" role="group" aria-label="Bagian panel">
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

          <section className="cs-controls" aria-label="Pengaturan">
            <div className="cs-pane" data-pane="par">
              <div
                className="cs-kinds"
                role="group"
                aria-label="Jenis irisan kerucut"
              >
                {KIND_ORDER.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={kind === k}
                    style={{ "--kc": KINDS[k].color } as CSSProperties}
                    onClick={() => setParam({ e: KINDS[k].e })}
                  >
                    {KINDS[k].label}
                  </button>
                ))}
              </div>

              <div className="cs-params">
                <ParamRow
                  id={`cs-e-${baseId}`}
                  label="e"
                  title="eksentrisitas e"
                  value={params.e}
                  min={E_MIN}
                  max={E_MAX}
                  step={0.01}
                  nudge={0.01}
                  digits={2}
                  tone={kindInfo.color}
                  playing={anim === "e"}
                  onChange={(v) => setParam({ e: v })}
                  onPlay={() => setAnim(anim === "e" ? null : "e")}
                />
                <ParamRow
                  id={`cs-l-${baseId}`}
                  label="ℓ"
                  title="parameter ℓ (setengah lebar fokal)"
                  value={params.l}
                  min={L_MIN}
                  max={L_MAX}
                  step={0.1}
                  nudge={0.1}
                  digits={1}
                  tone="#183e54"
                  onChange={(v) => setParam({ l: v })}
                />
                <ParamRow
                  id={`cs-t-${baseId}`}
                  label="θ"
                  title="sudut titik P dari fokus (derajat)"
                  value={params.t}
                  min={-180}
                  max={180}
                  step={0.5}
                  nudge={1}
                  digits={1}
                  bipolar
                  tone={COLOR_TAN}
                  playing={anim === "t"}
                  onChange={(v) => setParam({ t: v })}
                  onPlay={() => setAnim(anim === "t" ? null : "t")}
                />
              </div>

              <label className="cs-check">
                <input
                  type="checkbox"
                  checked={opts.ghost}
                  onChange={(event) =>
                    setOpt("ghost", event.currentTarget.checked)
                  }
                />
                Bandingkan keempat jenis (fokus dan ℓ sama)
              </label>

              <button type="button" className="cs-reset" onClick={reset}>
                <RotateCcw size={13} aria-hidden="true" />
                <span>Atur ulang</span>
              </button>
            </div>

            <div className="cs-pane" data-pane="opt">
              <div className="cs-options">
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

          <div className="cs-results">
            <div className="cs-pane" data-pane="res">
              <section
                className="cs-card cs-card-kind"
                aria-label="Jenis kurva"
              >
                <h3 style={{ color: kindInfo.color }}>{kindInfo.label}</h3>
                <p>
                  e = {fmt(params.e, 2)}
                  {kind === "circle" && " (e = 0)"}
                  {kind === "ellipse" && " (0 < e < 1)"}
                  {kind === "parabola" && " (e = 1)"}
                  {kind === "hyperbola" && " (e > 1)"}
                </p>
              </section>

              <section className="cs-card" aria-label="Persamaan">
                <h4>Persamaan</h4>
                <p className="cs-eq">{general}</p>
                <p className="cs-eq-note">umum, dengan fokus di (0; 0)</p>
                <p className="cs-eq">{standardForm(an)}</p>
                <p className="cs-eq-note">bentuk baku (setelah digeser)</p>
              </section>

              <section className="cs-card" aria-label="Unsur-unsur">
                <h4>Unsur-unsur</h4>
                <div className="cs-kvs">
                  {elements.map(([k, v]) => kv(k, v))}
                </div>
              </section>

              <section
                className="cs-card"
                aria-label="Titik P dan garis singgung"
              >
                <h4>Titik P dan garis singgung</h4>
                {an.valid ? (
                  <div className="cs-kvs">
                    {kv("θ", `${fmt(params.t, 1)}°`)}
                    {kv("P", fmtPt(an.px, an.py))}
                    {kv("PF₁", fmt(an.pf1))}
                    {Number.isFinite(an.pf2) && kv("PF₂", fmt(an.pf2))}
                    {Number.isFinite(an.pd) &&
                      kv("Jarak ke direktriks", fmt(an.pd))}
                    {Number.isFinite(an.ratio) &&
                      kv("PF₁ / jarak = e", fmt(an.ratio))}
                    {kind === "ellipse" &&
                      kv(
                        "PF₁ + PF₂ = 2a",
                        `${fmt(an.pf1 + an.pf2)} (2a = ${fmt(2 * an.a)})`,
                      )}
                    {kind === "hyperbola" &&
                      kv(
                        "|PF₁ − PF₂| = 2a",
                        `${fmt(Math.abs(an.pf1 - an.pf2))} (2a = ${fmt(2 * an.a)})`,
                      )}
                    {kv("Garis singgung", tangentText)}
                    {kv(
                      "Gradien",
                      an.slope === null ? "tegak lurus sumbu x" : fmt(an.slope),
                    )}
                  </div>
                ) : (
                  <p className="cs-eq-note">
                    P berada sangat jauh. Ubah θ agar P kembali ke kurva.
                  </p>
                )}
              </section>
            </div>

            <div className="cs-pane" data-pane="info">
              <table className="cs-info-table">
                <thead>
                  <tr>
                    <th scope="col">e</th>
                    <th scope="col">Bentuk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>e = 0</td>
                    <td>lingkaran (direktriks di tak hingga)</td>
                  </tr>
                  <tr>
                    <td>0 &lt; e &lt; 1</td>
                    <td>elips: tertutup, dua fokus, dua direktriks</td>
                  </tr>
                  <tr>
                    <td>e = 1</td>
                    <td>parabola: satu fokus, satu direktriks</td>
                  </tr>
                  <tr>
                    <td>e &gt; 1</td>
                    <td>hiperbola: dua cabang, dua fokus, asimtot</td>
                  </tr>
                </tbody>
              </table>
              <ul className="cs-insights">
                <li>
                  <strong style={{ color: COLOR_FOCUS }}>
                    Definisi fokus–direktriks:
                  </strong>{" "}
                  jarak setiap titik pada kurva ke fokus sama dengan e kali
                  jaraknya ke direktriks. Karena itu PF₁ / jarak selalu sama
                  dengan e, di mana pun titik P berada.
                </li>
                <li>
                  <strong style={{ color: KINDS.circle.color }}>
                    Parameter ℓ:
                  </strong>{" "}
                  ℓ adalah setengah lebar kurva tepat di atas fokus (setengah
                  latus rectum). Dengan ℓ tetap, menggeser e mengubah lingkaran
                  menjadi elips, lalu parabola, lalu hiperbola secara
                  berkesinambungan.
                </li>
                <li>
                  <strong style={{ color: COLOR_TAN }}>Garis singgung:</strong>{" "}
                  pada elips, garis singgung membagi dua sudut luar antara PF₁
                  dan PF₂; pada hiperbola, membagi dua sudut F₁PF₂; pada
                  parabola, membagi dua sudut antara PF dan garis tegak lurus
                  direktriks. Inilah sifat pemantul irisan kerucut.
                </li>
                <li>
                  <strong style={{ color: KINDS.parabola.color }}>
                    Koordinat:
                  </strong>{" "}
                  titik pada kurva memenuhi (1 − e²)x² − 2eℓx + y² = ℓ² dengan
                  fokus di titik asal. Bentuk baku ditampilkan setelah sumbu
                  digeser ke pusat atau puncak.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
