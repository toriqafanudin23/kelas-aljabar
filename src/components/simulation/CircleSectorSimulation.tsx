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
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./CircleSectorSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useGraphAppearance } from "./simulationBoard";
import { useStoredSimulationState } from "./useStoredSimulationState";

/* Simulasi busur, juring, tali busur, dan garis singgung lingkaran.
   Lingkaran berpusat di O(0, 0) dengan jari-jari r. Titik A berada pada arah φ
   dari sumbu x positif dan titik B pada arah φ + θ, dengan θ = sudut pusat.

       panjang busur   s = θ/360° · 2πr
       luas juring     L = θ/360° · πr²
       tali busur      c = 2r sin(θ/2)
       apotema         d = r cos(θ/2)
       luas tembereng  ½ r² (θ − sin θ)      (θ dalam radian)
       garis singgung  di A:  x·xA + y·yA = r²   (tegak lurus OA)

   Tata letak: ponsel lanskap → desktop → ponsel potret.
   Wilayah grafik : wilayah input = 2 : 1. */

/* ---------- Tipe ---------- */

type Vec = [number, number];
type Params = { r: number; t: number; p: number };
type Opts = {
  circle: boolean;
  sector: boolean;
  segment: boolean;
  chord: boolean;
  apothem: boolean;
  tangent: boolean;
  tpoint: boolean;
  angle: boolean;
};
type PanelTab = "par" | "opt" | "res" | "info";
type Anim = "t" | "p" | null;
type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;
type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
  setAttribute: (attributes: Record<string, unknown>) => void;
};

/* ---------- Konstanta ---------- */

const DEG = Math.PI / 180;
const R_MIN = 1;
const R_MAX = 8;
const T_MIN = 1;
const T_MAX = 360;
const HOME_BOX: [number, number, number, number] = [-14, 10, 14, -10];
/** Sudut pusat di atas ini: garis singgung hampir sejajar, titik T disembunyikan. */
const T_POINT_MAX = 175;
/** Layar kecil atau pendek memakai panel kanan bertab. */
const TABBED_QUERY = "(max-width: 899px), (max-height: 540px)";

const DEFAULT_PARAMS: Params = { r: 5, t: 60, p: 30 };
const DEFAULT_OPTS: Opts = {
  circle: true,
  sector: true,
  segment: false,
  chord: true,
  apothem: false,
  tangent: true,
  tpoint: false,
  angle: true,
};

const COLOR_ARC = "#087f8c";
const COLOR_RADIUS = "#183e54";
const COLOR_CHORD = "#b23a48";
const COLOR_SEGMENT = "#d16b36";
const COLOR_TAN = "#2f6bd0";
const COLOR_ANGLE = "#6b4e9b";
const COLOR_GUIDE = "#63727d";
const COLOR_CIRCLE = "#9fb3ba";

const PRESETS: { t: number; color: string }[] = [
  { t: 60, color: COLOR_ARC },
  { t: 90, color: COLOR_ANGLE },
  { t: 120, color: COLOR_SEGMENT },
  { t: 180, color: COLOR_CHORD },
];

const panelTabs: { tab: PanelTab; label: string }[] = [
  { tab: "par", label: "Parameter" },
  { tab: "opt", label: "Tampilan" },
  { tab: "res", label: "Hasil" },
  { tab: "info", label: "Info" },
];

const optionRows: { key: keyof Opts; label: string }[] = [
  { key: "sector", label: "Juring (daerah berwarna)" },
  { key: "segment", label: "Tembereng (daerah antara tali busur dan busur)" },
  { key: "chord", label: "Tali busur AB" },
  { key: "apothem", label: "Apotema (jarak pusat ke tali busur)" },
  { key: "tangent", label: "Garis singgung di A dan di B" },
  { key: "tpoint", label: "Titik potong garis singgung T" },
  { key: "angle", label: "Sudut pusat θ" },
];

/* ---------- Matematika ---------- */

function analyze(r: number, tDeg: number, pDeg: number) {
  const th = tDeg * DEG;
  const ph = pDeg * DEG;
  const half = th / 2;
  const mid = ph + half;

  const A: Vec = [r * Math.cos(ph), r * Math.sin(ph)];
  const B: Vec = [r * Math.cos(ph + th), r * Math.sin(ph + th)];
  const apothem = r * Math.cos(half); // bertanda: negatif bila θ > 180°
  const M: Vec = [apothem * Math.cos(mid), apothem * Math.sin(mid)];

  const tValid = tDeg < T_POINT_MAX;
  const tLen = r * Math.tan(half);
  const ot = r / Math.cos(half);
  const T: Vec = tValid
    ? [ot * Math.cos(mid), ot * Math.sin(mid)]
    : [Number.NaN, Number.NaN];

  const arc = r * th;
  const sector = 0.5 * r * r * th;
  return {
    r,
    tDeg,
    pDeg,
    th,
    ph,
    mid,
    A,
    B,
    M,
    T,
    tValid,
    tLen,
    ot,
    arc,
    sector,
    chord: 2 * r * Math.sin(half),
    apothem,
    segment: 0.5 * r * r * (th - Math.sin(th)),
    circumference: 2 * Math.PI * r,
    area: Math.PI * r * r,
    perimeter: 2 * r + arc,
    fraction: tDeg / 360,
    // garis singgung di A dan B: x·x0 + y·y0 = r²
    slopeA: Math.abs(A[1]) > 1e-9 ? -A[0] / A[1] : null,
    slopeB: Math.abs(B[1]) > 1e-9 ? -B[0] / B[1] : null,
  };
}

type Analysis = ReturnType<typeof analyze>;

/** Titik-titik busur berpusat di (0, 0): dari sudut a0 sepanjang span (derajat). */
function arcPoints(radius: number, a0Deg: number, spanDeg: number): Vec[] {
  const n = Math.max(24, Math.ceil(Math.abs(spanDeg) * 2));
  const out: Vec[] = [];
  for (let i = 0; i <= n; i += 1) {
    const a = (a0Deg + (spanDeg * i) / n) * DEG;
    out.push([radius * Math.cos(a), radius * Math.sin(a)]);
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
    className: "sc-nudge",
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
  const pct = ((clamp(value) - min) / (max - min)) * 100;
  const rangeStyle = {
    "--lo": bipolar ? `${Math.min(50, pct)}%` : "0%",
    "--hi": bipolar ? `${Math.max(50, pct)}%` : `${pct}%`,
    "--tone": tone,
  } as CSSProperties;

  return (
    <div className="sc-param" style={{ "--tone": tone } as CSSProperties}>
      <label htmlFor={id} title={title}>
        {label}
      </label>
      <button {...bind(-1)} aria-label={`Kurangi ${title}`}>
        <Minus size={12} aria-hidden="true" />
      </button>
      <input
        className="sc-range"
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
        className="sc-num"
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
          className="sc-icon-btn"
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
  <div className="sc-kv" key={key}>
    <span>{key}</span>
    <b>{value}</b>
  </div>
);

/* ---------- Komponen utama ---------- */

export function CircleSectorSimulation() {
  const baseId = useId().replace(/:/g, "");
  const boardId = `sc-board-${baseId}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const nativeFsRef = useRef(false);
  const syncSizeRef = useRef<(() => void) | null>(null);
  const { appearance, onStep } = useGraphAppearance([boardRef]);

  const [params, setParams] = useStoredSimulationState<Params>(
    "sector.params",
    DEFAULT_PARAMS,
  );
  const [opts, setOpts] = useStoredSimulationState<Opts>(
    "sector.opts",
    DEFAULT_OPTS,
  );
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
  const clickRef = useRef<(deg: number) => void>(() => undefined);
  clickRef.current = (deg: number) => {
    setAnim(null);
    setParams((prev) => ({ ...prev, t: deg }));
  };

  const an = analyze(params.r, params.t, params.p);

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
      if (!cache || cache.p !== p) cache = { p, v: analyze(p.r, p.t, p.p) };
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

    const O: Vec = [0, 0];

    // lingkaran penuh (tipis)
    makeCurve(COLOR_CIRCLE, 1.8, 0, 1, () =>
      show("circle") ? arcPoints(A().r, 0, 360) : null,
    );

    // juring: O → A → busur → B → O
    makeCurve(
      COLOR_ARC,
      0,
      0,
      1,
      () => {
        if (!show("sector")) return null;
        const a = A();
        return [O, ...arcPoints(a.r, a.pDeg, a.tDeg), O];
      },
      { color: COLOR_ARC, opacity: 0.22 },
    );

    // tembereng: busur lalu kembali ke A lewat tali busur
    makeCurve(
      COLOR_SEGMENT,
      0,
      0,
      1,
      () => {
        if (!show("segment")) return null;
        const a = A();
        return [...arcPoints(a.r, a.pDeg, a.tDeg), a.A];
      },
      { color: COLOR_SEGMENT, opacity: 0.32 },
    );

    // garis singgung di A dan B (tegak lurus jari-jari)
    ([0, 1] as const).forEach((k) => {
      makeCurve(COLOR_TAN, 2.2, 0, 1, () => {
        if (!show("tangent")) return null;
        const a = A();
        const pt = k === 0 ? a.A : a.B;
        const ang = k === 0 ? a.ph : a.ph + a.th;
        const d: Vec = [-Math.sin(ang), Math.cos(ang)];
        const s = extent();
        return [
          [pt[0] - d[0] * s, pt[1] - d[1] * s],
          [pt[0] + d[0] * s, pt[1] + d[1] * s],
        ];
      });
    });

    // OT (sumbu simetri layang-layang OATB)
    makeCurve(COLOR_GUIDE, 1.5, 2, 1, () => {
      const a = A();
      return show("tpoint") && show("tangent") && a.tValid ? [O, a.T] : null;
    });

    // jari-jari OA dan OB
    makeCurve(COLOR_RADIUS, 2, 0, 1, () => [O, A().A]);
    makeCurve(COLOR_RADIUS, 2, 0, 1, () => [O, A().B]);

    // tali busur dan apotema
    makeCurve(COLOR_CHORD, 2.8, 0, 1, () => {
      const a = A();
      return show("chord") ? [a.A, a.B] : null;
    });
    makeCurve(COLOR_GUIDE, 1.6, 2, 1, () => {
      const a = A();
      return show("apothem") ? [O, a.M] : null;
    });

    // busur kecil penanda sudut pusat θ
    makeCurve(COLOR_ANGLE, 2.5, 0, 1, () => {
      if (!show("angle")) return null;
      const a = A();
      const rr = Math.min(2, Math.max(0.7, a.r * 0.25));
      return arcPoints(rr, a.pDeg, a.tDeg);
    });

    // busur AB (utama)
    makeCurve(COLOR_ARC, 4.5, 0, 1, () => {
      const a = A();
      return arcPoints(a.r, a.pDeg, a.tDeg);
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

    dot(
      () => 0,
      () => 0,
      COLOR_RADIUS,
      4.5,
    );
    dot(
      () => A().A[0],
      () => A().A[1],
      COLOR_ARC,
      5.5,
    );
    dot(
      () => A().B[0],
      () => A().B[1],
      COLOR_ARC,
      5.5,
    );
    dot(
      () => (show("tpoint") && show("tangent") ? A().T[0] : Number.NaN),
      () => A().T[1],
      COLOR_TAN,
      5,
    );
    dot(
      () => (show("apothem") || show("chord") ? A().M[0] : Number.NaN),
      () => A().M[1],
      COLOR_GUIDE,
      3.5,
    );

    label(
      () => 0,
      () => 0,
      "O",
      COLOR_RADIUS,
      [-16, -16],
    );
    label(
      () => A().A[0],
      () => A().A[1],
      "A",
      COLOR_RADIUS,
    );
    label(
      () => A().B[0],
      () => A().B[1],
      "B",
      COLOR_RADIUS,
    );
    label(
      () => (show("tpoint") && show("tangent") ? A().T[0] : Number.NaN),
      () => A().T[1],
      "T",
      COLOR_TAN,
    );
    // θ di dalam busur kecil
    label(
      () => {
        const a = A();
        const rr = Math.min(2, Math.max(0.7, a.r * 0.25)) * 1.7;
        return show("angle") ? rr * Math.cos(a.mid) : Number.NaN;
      },
      () => {
        const a = A();
        const rr = Math.min(2, Math.max(0.7, a.r * 0.25)) * 1.7;
        return rr * Math.sin(a.mid);
      },
      () => `θ = ${fmt(pRef.current.t, 1)}°`,
      COLOR_ANGLE,
      [-14, -8],
    );
    // r pada OA, c pada tali busur, d pada apotema
    label(
      () => (A().A[0] * 0.5),
      () => (A().A[1] * 0.5),
      "r",
      COLOR_RADIUS,
      [-4, 6],
    );
    label(
      () => (show("chord") && A().chord > 0.3 ? A().M[0] : Number.NaN),
      () => A().M[1],
      "c",
      COLOR_CHORD,
      [8, -14],
    );
    label(
      () => (show("apothem") ? A().M[0] * 0.5 : Number.NaN),
      () => A().M[1] * 0.5,
      "d",
      COLOR_GUIDE,
      [-14, 4],
    );

    board.update();

    // ───── klik/ketuk lingkaran untuk memindahkan titik B (geser tetap lancar) ─────
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
      const rect = el.getBoundingClientRect();
      const [x1, y1, x2, y2] = board.getBoundingBox();
      const sx = rect.width / (x2 - x1);
      const ux = x1 + ((e.clientX - rect.left) / rect.width) * (x2 - x1);
      const uy = y1 - ((e.clientY - rect.top) / rect.height) * (y1 - y2);
      const a = A();
      const gap = Math.abs(Math.hypot(ux, uy) - a.r) * sx; // piksel
      if (gap > 30) return;
      const angle = (Math.atan2(uy, ux) / DEG - a.pDeg + 720) % 360;
      const value = Math.round(angle * 10) / 10;
      clickRef.current(Math.min(T_MAX, Math.max(T_MIN, value)));
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
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
    };
  }, [boardId]);

  // Perbarui papan setiap parameter atau pilihan berubah
  useEffect(() => {
    boardRef.current?.update();
  }, [params, opts]);

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

  // Animasi: θ bolak-balik 1° ↔ 360°, atau seluruh juring berputar (φ)
  useEffect(() => {
    if (!anim) return undefined;
    let raf = 0;
    let last = performance.now();
    let dir = 1;
    let t = pRef.current.t;
    let p = pRef.current.p;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (anim === "t") {
        t += dir * dt * 45;
        if (t >= T_MAX) {
          t = T_MAX;
          dir = -1;
        } else if (t <= T_MIN) {
          t = T_MIN;
          dir = 1;
        }
        const value = Math.round(t * 10) / 10;
        setParams((prev) => ({ ...prev, t: value }));
      } else {
        p += dt * 30;
        if (p > 180) p -= 360;
        const value = Math.round(p * 10) / 10;
        setParams((prev) => ({ ...prev, p: value }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim]);

  /* ---------- Turunan untuk tampilan ---------- */

  const tStr = fmt(params.t, 1);
  const rStr = fmt(params.r, 2);
  const tangentA = `${poly([
    [an.A[0], "x"],
    [an.A[1], "y"],
  ])} = ${fmt(params.r * params.r)}`;
  const tangentB = `${poly([
    [an.B[0], "x"],
    [an.B[1], "y"],
  ])} = ${fmt(params.r * params.r)}`;
  const isMajor = params.t > 180;
  const slopeText = (s: number | null) =>
    s === null ? "tegak lurus sumbu x" : fmt(s);

  return (
    <div
      ref={rootRef}
      className={`sector-simulation simulation-fullscreen-frame${
        tabbed ? " is-tabbed" : ""
      }${isFull ? " is-fullscreen" : ""}`}
    >
      <p className="sc-orientation-hint">
        <Smartphone size={14} aria-hidden="true" />
        <span>
          Miringkan ponsel ke mode lanskap agar grafik dan panel isian tampil
          berdampingan.
        </span>
      </p>

      <div className="sc-boards">
        {/* ───── Wilayah grafik (2 bagian) ───── */}
        <section className="sc-board-panel" aria-label="Grafik lingkaran">
          <div className="sc-stage">
            <div
              className="sc-board"
              id={boardId}
              ref={containerRef}
              tabIndex={0}
              aria-label="Grafik lingkaran dengan pusat di titik asal. Seret untuk menggeser, roda mouse atau cubit untuk zoom, klik atau ketuk lingkaran untuk memindahkan titik B."
            />

            <p
              className="sc-chip"
              style={{ borderLeftColor: COLOR_ARC }}
              aria-live="polite"
            >
              <b style={{ color: COLOR_ARC }}>
                {isMajor ? "Busur besar" : params.t === 180 ? "Setengah lingkaran" : "Busur kecil"}
              </b>
              <span>
                r = {rStr} · θ = {tStr}°
              </span>
            </p>

            <div className="sc-pinfo" aria-live="off">
              <span>
                <b>s</b> = {fmt(an.arc, 2)}
              </span>
              <span>
                <b>L</b> = {fmt(an.sector, 2)}
              </span>
              {opts.chord && (
                <span>
                  <b>c</b> = {fmt(an.chord, 2)}
                </span>
              )}
              {opts.tangent && opts.tpoint && an.tValid && (
                <span>
                  <b>AT</b> = {fmt(an.tLen, 2)}
                </span>
              )}
            </div>

            <div className="sc-tools" role="group" aria-label="Tampilan">
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
                  className="sc-toolbar-toggle"
                  onClick={() => setPanelOpen((open) => !open)}
                  aria-pressed={panelOpen}
                  aria-controls={`sc-column-${baseId}`}
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

          <div className="sc-legend" aria-label="Legenda grafik">
            <span>
              <i style={{ borderTopColor: COLOR_ARC }} /> busur AB
            </span>
            <span>
              <i className="line-radius" /> jari-jari
            </span>
            {opts.circle && (
              <span>
                <i className="line-circle" /> lingkaran
              </span>
            )}
            {opts.sector && (
              <span>
                <b className="sw-sector" /> juring
              </span>
            )}
            {opts.segment && (
              <span>
                <b className="sw-segment" /> tembereng
              </span>
            )}
            {opts.chord && (
              <span>
                <i className="line-chord" /> tali busur
              </span>
            )}
            {opts.apothem && (
              <span>
                <i className="line-apo" /> apotema
              </span>
            )}
            {opts.tangent && (
              <span>
                <i className="line-tan" /> garis singgung
              </span>
            )}
            {opts.angle && (
              <span>
                <i style={{ borderTopColor: COLOR_ANGLE }} /> sudut pusat
              </span>
            )}
          </div>
          <p className="sc-hint">
            Tahan klik kiri lalu seret untuk menggeser · roda mouse untuk zoom ·
            klik pada lingkaran untuk memindahkan titik B.
          </p>
        </section>

        {/* ───── Wilayah input (1 bagian) ───── */}
        <div
          id={`sc-column-${baseId}`}
          className={`sc-column${isFull ? " is-floating" : ""}${
            isFull && panelOpen ? " is-open" : ""
          }`}
          data-tab={tab}
        >
          <div className="sc-tabs" role="group" aria-label="Bagian panel">
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

          <section className="sc-controls" aria-label="Pengaturan">
            <div className="sc-pane" data-pane="par">
              <div
                className="sc-kinds"
                role="group"
                aria-label="Sudut pusat istimewa"
              >
                {PRESETS.map((item) => (
                  <button
                    key={item.t}
                    type="button"
                    aria-pressed={Math.abs(params.t - item.t) < 0.05}
                    style={{ "--kc": item.color } as CSSProperties}
                    onClick={() => setParam({ t: item.t })}
                  >
                    {item.t}°
                  </button>
                ))}
              </div>

              <div className="sc-params">
                <ParamRow
                  id={`sc-r-${baseId}`}
                  label="r"
                  title="jari-jari lingkaran r"
                  value={params.r}
                  min={R_MIN}
                  max={R_MAX}
                  step={0.1}
                  nudge={0.1}
                  digits={1}
                  tone={COLOR_RADIUS}
                  onChange={(v) => setParam({ r: v })}
                />
                <ParamRow
                  id={`sc-t-${baseId}`}
                  label="θ"
                  title="sudut pusat θ (derajat)"
                  value={params.t}
                  min={T_MIN}
                  max={T_MAX}
                  step={0.5}
                  nudge={1}
                  digits={1}
                  tone={COLOR_ARC}
                  playing={anim === "t"}
                  onChange={(v) => setParam({ t: v })}
                  onPlay={() => setAnim(anim === "t" ? null : "t")}
                />
                <ParamRow
                  id={`sc-p-${baseId}`}
                  label="φ"
                  title="arah titik A dari sumbu x (derajat)"
                  value={params.p}
                  min={-180}
                  max={180}
                  step={0.5}
                  nudge={1}
                  digits={1}
                  bipolar
                  tone={COLOR_TAN}
                  playing={anim === "p"}
                  onChange={(v) => setParam({ p: v })}
                  onPlay={() => setAnim(anim === "p" ? null : "p")}
                />
              </div>

              <label className="sc-check">
                <input
                  type="checkbox"
                  checked={opts.circle}
                  onChange={(event) =>
                    setOpt("circle", event.currentTarget.checked)
                  }
                />
                Tampilkan lingkaran penuh
              </label>

              <button type="button" className="sc-reset" onClick={reset}>
                <RotateCcw size={13} aria-hidden="true" />
                <span>Atur ulang</span>
              </button>
            </div>

            <div className="sc-pane" data-pane="opt">
              <div className="sc-options">
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

          <div className="sc-results">
            <div className="sc-pane" data-pane="res">
              <section
                className="sc-card sc-card-kind"
                aria-label="Ringkasan juring"
              >
                <h3 style={{ color: COLOR_ARC }}>
                  θ = {tStr}° · r = {rStr}
                </h3>
                <p>
                  {fmt(params.t / 360, 3)} bagian lingkaran (
                  {fmt((params.t / 360) * 100, 1)}%)
                  {params.t === 180 && " — tali busur menjadi diameter"}
                  {isMajor && " — busur besar, apotema berada di sisi lain"}
                </p>
              </section>

              <section className="sc-card" aria-label="Busur dan juring">
                <h4>Panjang busur dan luas juring</h4>
                <p className="sc-eq">s = θ/360° × 2πr</p>
                <p className="sc-eq-note">
                  {tStr}/360 × 2π × {rStr} = {fmt(an.arc)}
                </p>
                <p className="sc-eq">L = θ/360° × πr²</p>
                <p className="sc-eq-note">
                  {tStr}/360 × π × {rStr}² = {fmt(an.sector)}
                </p>
                <div className="sc-kvs">
                  {kv("Keliling juring 2r + s", fmt(an.perimeter))}
                  {kv("Keliling lingkaran 2πr", fmt(an.circumference))}
                  {kv("Luas lingkaran πr²", fmt(an.area))}
                </div>
              </section>

              <section className="sc-card" aria-label="Tali busur dan tembereng">
                <h4>Tali busur dan tembereng</h4>
                <p className="sc-eq">c = 2r sin(θ/2)</p>
                <p className="sc-eq-note">
                  2 × {rStr} × sin({fmt(params.t / 2, 2)}°) = {fmt(an.chord)}
                </p>
                <p className="sc-eq">d = r cos(θ/2)</p>
                <p className="sc-eq-note">
                  {rStr} × cos({fmt(params.t / 2, 2)}°) = {fmt(an.apothem)}
                </p>
                <p className="sc-eq">L tembereng = ½r²(θ − sin θ)</p>
                <p className="sc-eq-note">
                  juring − segitiga OAB = {fmt(an.segment)}
                </p>
                <div className="sc-kvs">
                  {kv("Titik A", fmtPt(an.A[0], an.A[1]))}
                  {kv("Titik B", fmtPt(an.B[0], an.B[1]))}
                  {kv("Titik tengah tali busur", fmtPt(an.M[0], an.M[1]))}
                </div>
              </section>

              <section className="sc-card" aria-label="Garis singgung">
                <h4>Garis singgung di A dan B</h4>
                <p className="sc-eq">{tangentA}</p>
                <p className="sc-eq-note">
                  singgung di A, gradien {slopeText(an.slopeA)}
                </p>
                <p className="sc-eq">{tangentB}</p>
                <p className="sc-eq-note">
                  singgung di B, gradien {slopeText(an.slopeB)}
                </p>
                <div className="sc-kvs">
                  {kv("Sudut tali busur–singgung θ/2", `${fmt(params.t / 2, 2)}°`)}
                  {an.tValid ? (
                    <>
                      {kv("Titik T", fmtPt(an.T[0], an.T[1]))}
                      {kv("AT = BT = r tan(θ/2)", fmt(an.tLen))}
                      {kv("OT = r / cos(θ/2)", fmt(an.ot))}
                      {kv("∠ATB = 180° − θ", `${fmt(180 - params.t, 2)}°`)}
                    </>
                  ) : (
                    kv(
                      "Titik T",
                      params.t === 180
                        ? "tidak ada (kedua singgung sejajar)"
                        : "terlalu jauh / di sisi lain",
                    )
                  )}
                </div>
              </section>
            </div>

            <div className="sc-pane" data-pane="info">
              <table className="sc-info-table">
                <thead>
                  <tr>
                    <th scope="col">Besaran</th>
                    <th scope="col">Rumus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Panjang busur</td>
                    <td>s = θ/360° × 2πr</td>
                  </tr>
                  <tr>
                    <td>Luas juring</td>
                    <td>L = θ/360° × πr²</td>
                  </tr>
                  <tr>
                    <td>Tali busur</td>
                    <td>c = 2r sin(θ/2)</td>
                  </tr>
                  <tr>
                    <td>Apotema</td>
                    <td>d = r cos(θ/2)</td>
                  </tr>
                  <tr>
                    <td>Luas tembereng</td>
                    <td>juring − segitiga OAB</td>
                  </tr>
                  <tr>
                    <td>Garis singgung</td>
                    <td>⊥ jari-jari di titik singgung</td>
                  </tr>
                </tbody>
              </table>
              <ul className="sc-insights">
                <li>
                  <strong style={{ color: COLOR_ARC }}>
                    Busur dan juring:
                  </strong>{" "}
                  panjang busur dan luas juring sebanding dengan sudut pusat.
                  Jika θ dilipatgandakan, s dan L ikut berlipat dua; jika r
                  dilipatgandakan, s berlipat dua tetapi L berlipat empat.
                </li>
                <li>
                  <strong style={{ color: COLOR_CHORD }}>Tali busur:</strong>{" "}
                  tali busur selalu lebih pendek daripada busurnya. Pada θ = 180°
                  tali busur menjadi diameter (c = 2r) dan apotema d = 0. Pada
                  θ kecil, c hampir sama dengan s.
                </li>
                <li>
                  <strong style={{ color: COLOR_SEGMENT }}>Apotema:</strong>{" "}
                  garis dari pusat yang tegak lurus tali busur selalu membagi
                  tali busur dan sudut pusat menjadi dua sama besar. Untuk
                  θ &gt; 180° nilai d menjadi negatif, artinya pusat berada di
                  sisi lain tali busur.
                </li>
                <li>
                  <strong style={{ color: COLOR_TAN }}>Garis singgung:</strong>{" "}
                  garis singgung di A dan B tegak lurus OA dan OB, sehingga
                  OATB berbentuk layang-layang dan AT = BT. Sudut antara tali
                  busur dan garis singgung sama dengan setengah sudut pusat
                  (θ/2).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
