import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./GraphPlotterSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useGraphAppearance } from "./simulationBoard";
import { useStoredSimulationState } from "./useStoredSimulationState";
import {
  PARAM_NAMES,
  derivative,
  findExtrema,
  findRoots,
  parseLatex,
  type Extremum,
  type Params,
} from "./latexMath";

type Slot = { src: string; on: boolean; der: boolean };
type Pt = { x: number; y: number };
type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;
type PairResult = { i: number; j: number; pts: Pt[]; coincident: boolean };
type AxisResult = { i: number; yInt: Pt | null; xInts: Pt[]; ext: Extremum[] };
type Results = { pairs: PairResult[]; axes: AxisResult[] };
type Pin = {
  id: number;
  x: number;
  y: number;
  slot: number | null;
  slope: number | null;
};
type TraceRow = { i: number; y: number; dy: number };
type Trace = { x: number; rows: TraceRow[] };
type View = [number, number, number, number];
type Shared = {
  slots: Slot[];
  params: Params;
  view: View | null;
  lock: boolean;
};

const MAX_SLOTS = 6;
const MAX_PINS = 12;
const SLOT_COLORS = [
  "#087f8c",
  "#d16b36",
  "#6b4e9b",
  "#3c8d2f",
  "#2f6bd0",
  "#8a5a2b",
];
const INTER_COLOR = "#b23a48";
const PIN_COLOR = "#183e54";
const INTER_POOL = 40;
const AXIS_POOL = 7; // 1 titik potong sumbu y + maksimal 6 akar per grafik
const EXT_POOL = 6;
const HOME_BOX: View = [-10, 10, 10, -10];
const PARAM_MIN = -10;
const PARAM_MAX = 10;
const PARAM_SPEED = 2; // satuan per detik saat animasi parameter
const DEFAULT_PARAMS: Params = { a: 1, b: 1, c: 1, k: 1 };

const initialSlots: Slot[] = [
  { src: "x^{2}", on: true, der: false },
  { src: "2x+3", on: true, der: false },
  { src: "", on: true, der: false },
];

const PLACEHOLDERS = [
  "x^{2}-2",
  "\\frac{x+1}{2}",
  "e^{-x}",
  "a\\sin(kx)",
  "|x-1|",
  "\\sqrt{x}",
];

type Preset = { label: string; srcs: string[]; params?: Params; der?: boolean };
const PRESETS: Preset[] = [
  { label: "Parabola & garis", srcs: ["x^{2}", "2x+3"] },
  { label: "eˣ, ln x, y = x", srcs: ["e^{x}", "\\ln x", "x"] },
  { label: "sin, cos, ½", srcs: ["\\sin x", "\\cos x", "\\frac{1}{2}"] },
  {
    label: "1/x, parabola, akar",
    srcs: ["\\frac{1}{x}", "x^{2}-2", "\\sqrt{x}"],
  },
  {
    label: "Parabola ax²+bx+c",
    srcs: ["ax^{2}+bx+c", "0"],
    params: { a: 1, b: -2, c: -3 },
  },
  {
    label: "Gelombang a·sin(kx)",
    srcs: ["a\\sin(kx)", "a\\sin(kx+b)"],
    params: { a: 2, k: 1, b: 1 },
  },
  {
    label: "Fungsi & turunannya",
    srcs: ["x^{3}-3x"],
    der: true,
  },
  {
    label: "Transformasi |x|",
    srcs: ["|x|", "a|x-b|+c"],
    params: { a: 2, b: 3, c: -1 },
  },
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

// ───────────── tautan yang dapat dibagikan (?grafik=...) ─────────────
function toB64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64(text: string) {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

function readShared(): Shared | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = new URLSearchParams(window.location.search).get("grafik");
    if (!raw) return null;
    const data = JSON.parse(fromB64(raw)) as {
      s?: unknown;
      p?: unknown;
      v?: unknown;
      r?: unknown;
    };
    if (!Array.isArray(data.s) || data.s.length === 0) return null;
    const slots: Slot[] = data.s.slice(0, MAX_SLOTS).map((row: unknown) => {
      const r = Array.isArray(row) ? row : [];
      return {
        src: typeof r[0] === "string" ? r[0].slice(0, 300) : "",
        on: r[1] !== 0,
        der: r[2] === 1,
      };
    });
    const params: Params = { ...DEFAULT_PARAMS };
    if (data.p && typeof data.p === "object") {
      PARAM_NAMES.forEach((name) => {
        const v = (data.p as Record<string, unknown>)[name];
        if (typeof v === "number" && Number.isFinite(v)) params[name] = v;
      });
    }
    let view: View | null = null;
    if (
      Array.isArray(data.v) &&
      data.v.length === 4 &&
      data.v.every((n) => typeof n === "number" && Number.isFinite(n)) &&
      data.v[0] < data.v[2] &&
      data.v[3] < data.v[1]
    ) {
      view = data.v as View;
    }
    return { slots, params, view, lock: data.r !== 0 };
  } catch {
    return null;
  }
}

export function GraphPlotterSimulation() {
  const boardId = `plot-board-${useId().replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);
  const { appearance, onStep } = useGraphAppearance([boardRef]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sharedRef = useRef<Shared | null | undefined>(undefined);
  if (sharedRef.current === undefined) sharedRef.current = readShared();
  const shared = sharedRef.current;

  // data yang dibaca papan JSXGraph (selalu lewat ref agar tidak basi)
  const fnsRef = useRef<(((x: number) => number) | null)[]>(
    Array(MAX_SLOTS).fill(null),
  );
  const derRef = useRef<boolean[]>(Array(MAX_SLOTS).fill(false));
  const interRef = useRef<Pt[]>([]);
  const axisRef = useRef<Pt[][]>(Array.from({ length: MAX_SLOTS }, () => []));
  const extRef = useRef<Pt[][]>(Array.from({ length: MAX_SLOTS }, () => []));
  const pinRef = useRef<Pin[]>([]);
  const traceXRef = useRef(Number.NaN);
  const tanRef = useRef<({ x: number; y: number; m: number } | null)[]>([]);
  const pinIdRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const lastKeyRef = useRef("");

  const [slots, setSlots] = useStoredSimulationState<Slot[]>(
    "graph-plotter.slots",
    shared?.slots ?? initialSlots,
    !shared,
  );
  const [params, setParams] = useStoredSimulationState<Params>(
    "graph-plotter.params",
    shared?.params ?? DEFAULT_PARAMS,
    !shared,
  );
  const [active, setActive] = useStoredSimulationState(
    "graph-plotter.active-slot",
    0,
    !shared,
  );
  const [showInter, setShowInter] = useStoredSimulationState(
    "graph-plotter.intersections",
    true,
    !shared,
  );
  const [showAxis, setShowAxis] = useStoredSimulationState(
    "graph-plotter.axis-intercepts",
    false,
    !shared,
  );
  const [showExt, setShowExt] = useStoredSimulationState(
    "graph-plotter.extrema",
    false,
    !shared,
  );
  const [showTan, setShowTan] = useStoredSimulationState(
    "graph-plotter.tangents",
    false,
    !shared,
  );
  const [lockRatio, setLockRatio] = useStoredSimulationState(
    "graph-plotter.lock-ratio",
    shared?.lock ?? true,
    !shared,
  );
  const [anim, setAnim] = useState<string | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [results, setResults] = useState<Results>({ pairs: [], axes: [] });
  const [message, setMessage] = useState("");
  const [isFull, setIsFull] = useState(false);

  const pRef = useRef<Params>({ ...params });
  const showInterRef = useRef(showInter);
  const showAxisRef = useRef(showAxis);
  const showExtRef = useRef(showExt);
  const showTanRef = useRef(showTan);
  const lockRef = useRef(lockRatio);

  const parsed = useMemo(
    () => slots.map((slot) => parseLatex(slot.src, pRef.current)),
    [slots],
  );

  const drawn = slots.map((slot, i) => {
    const result = parsed[i];
    return slot.on && !!result && result.ok;
  });
  const drawnCount = drawn.filter(Boolean).length;

  const usedParams = useMemo(() => {
    const set = new Set<string>();
    parsed.forEach((result, i) => {
      if (slots[i]?.on && result && result.ok)
        result.params.forEach((name) => set.add(name));
    });
    return PARAM_NAMES.filter((name) => set.has(name));
  }, [parsed, slots]);

  const setSlot = (index: number, patch: Partial<Slot>) =>
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)),
    );

  const flash = (text: string) => setMessage(text);

  // Nilai f(x) dan gradien semua grafik pada satu x (juga menyiapkan garis singgung)
  const traceRows = (x: number): TraceRow[] => {
    const rows: TraceRow[] = [];
    const tans: ({ x: number; y: number; m: number } | null)[] = [];
    fnsRef.current.forEach((fn, i) => {
      if (!fn) {
        tans[i] = null;
        return;
      }
      const y = fn(x);
      const dy = derivative(fn, x);
      tans[i] =
        Number.isFinite(y) && Number.isFinite(dy) ? { x, y, m: dy } : null;
      rows.push({ i, y, dy });
    });
    tanRef.current = tans;
    return rows;
  };

  const applyTrace = (x: number | null) => {
    const board = boardRef.current;
    if (!board) return;
    if (x === null || !Number.isFinite(x)) {
      traceXRef.current = Number.NaN;
      tanRef.current = [];
      board.update();
      setTrace(null);
      return;
    }
    traceXRef.current = x;
    const rows = traceRows(x);
    board.update();
    setTrace({ x, rows });
  };

  // Hitung titik potong, ekstrem, dan titik potong sumbu pada rentang yang sedang terlihat
  const recompute = () => {
    const board = boardRef.current;
    if (!board) return;
    const [x1, y1, x2, y2] = board.getBoundingBox();
    const ySpan = Math.abs(y1 - y2);
    const cx = (x1 + x2) / 2;
    const fns = fnsRef.current;

    const pairs: PairResult[] = [];
    const flat: Pt[] = [];
    for (let i = 0; i < MAX_SLOTS; i += 1) {
      for (let j = i + 1; j < MAX_SLOTS; j += 1) {
        const fi = fns[i];
        const fj = fns[j];
        if (!fi || !fj) continue;
        const { roots, coincident } = findRoots(
          (x) => fi(x) - fj(x),
          x1,
          x2,
          2500,
        );
        const pts = roots
          .map((x) => ({ x, y: (fi(x) + fj(x)) / 2 }))
          .filter((p) => Number.isFinite(p.y));
        pairs.push({ i, j, pts, coincident });
        pts.forEach((p) => flat.push(p));
      }
    }

    const axes: AxisResult[] = [];
    const axisPts: Pt[][] = Array.from({ length: MAX_SLOTS }, () => []);
    const extPts: Pt[][] = Array.from({ length: MAX_SLOTS }, () => []);
    fns.forEach((fn, i) => {
      if (!fn) return;
      const y0 = fn(0);
      const yInt = Number.isFinite(y0) ? { x: 0, y: y0 } : null;
      const { roots, coincident } = findRoots(fn, x1, x2, 2500);
      const xInts = coincident ? [] : roots.map((x) => ({ x, y: 0 }));
      let ext: Extremum[] = [];
      if (showExtRef.current) {
        ext = findExtrema(fn, x1, x2, ySpan)
          .sort((p, q) => Math.abs(p.x - cx) - Math.abs(q.x - cx))
          .slice(0, EXT_POOL)
          .sort((p, q) => p.x - q.x);
      }
      axes.push({ i, yInt, xInts, ext });
      if (yInt) axisPts[i].push(yInt);
      xInts.slice(0, AXIS_POOL - 1).forEach((p) => axisPts[i].push(p));
      ext.forEach((p) => extPts[i].push({ x: p.x, y: p.y }));
    });

    interRef.current = flat.slice(0, INTER_POOL);
    axisRef.current = axisPts;
    extRef.current = extPts;
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

  // ───────────── navigasi tampilan ─────────────
  const zoomIn = () => {
    boardRef.current?.zoomIn();
    scheduleRecompute();
  };
  const zoomOut = () => {
    boardRef.current?.zoomOut();
    scheduleRecompute();
  };
  const resetView = () => {
    boardRef.current?.setBoundingBox(HOME_BOX, lockRef.current);
    scheduleRecompute();
  };
  const panBy = (fx: number, fy: number) => {
    const board = boardRef.current;
    if (!board) return;
    const [x1, y1, x2, y2] = board.getBoundingBox();
    const dx = (x2 - x1) * fx;
    const dy = (y1 - y2) * fy;
    board.setBoundingBox([x1 + dx, y1 + dy, x2 + dx, y2 + dy], lockRef.current);
    scheduleRecompute();
  };

  // Sesuaikan tinggi jendela dengan nilai grafik (kebal terhadap asimtot)
  const fitView = () => {
    const board = boardRef.current;
    if (!board) return;
    const [x1, , x2] = board.getBoundingBox();
    const ys: number[] = [];
    fnsRef.current.forEach((fn) => {
      if (!fn) return;
      for (let k = 0; k <= 400; k += 1) {
        const v = fn(x1 + ((x2 - x1) * k) / 400);
        if (Number.isFinite(v)) ys.push(v);
      }
    });
    if (ys.length < 2) return;
    ys.sort((p, q) => p - q);
    const lo = ys[Math.floor(ys.length * 0.03)];
    const hi = ys[Math.ceil(ys.length * 0.97) - 1];
    const span = hi - lo < 1e-6 ? 2 : hi - lo;
    const mid = (hi + lo) / 2;
    const half = span * 0.65;
    lockRef.current = false;
    setLockRatio(false);
    board.setBoundingBox([x1, mid + half, x2, mid - half], false);
    scheduleRecompute();
  };

  const toggleFullscreen = () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  const exportPng = () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(w));
    clone.setAttribute("height", String(h));
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          flash("Gagal membuat gambar.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "grafik.png";
        link.click();
        URL.revokeObjectURL(url);
        flash("Gambar diunduh.");
      }, "image/png");
    };
    img.onerror = () => flash("Gagal membuat gambar.");
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  };

  const copyLink = () => {
    const board = boardRef.current;
    const view = board
      ? (board
          .getBoundingBox()
          .map((n: number) => Math.round(n * 1e4) / 1e4) as View)
      : undefined;
    const payload = {
      s: slots.map((slot) => [slot.src, slot.on ? 1 : 0, slot.der ? 1 : 0]),
      p: params,
      v: view,
      r: lockRatio ? 1 : 0,
    };
    const url = new URL(window.location.href);
    url.searchParams.set("grafik", toB64(JSON.stringify(payload)));
    const text = url.toString();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => flash("Tautan disalin."),
        () => window.prompt("Salin tautan ini:", text),
      );
    } else {
      window.prompt("Salin tautan ini:", text);
    }
  };

  const onBoardKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.shiftKey ? 0.4 : 0.1;
    switch (event.key) {
      case "ArrowLeft":
        panBy(-step, 0);
        break;
      case "ArrowRight":
        panBy(step, 0);
        break;
      case "ArrowUp":
        panBy(0, step);
        break;
      case "ArrowDown":
        panBy(0, -step);
        break;
      case "+":
      case "=":
        zoomIn();
        break;
      case "-":
      case "_":
        zoomOut();
        break;
      case "0":
        resetView();
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  // ───────────── masukan fungsi ─────────────
  const insertSnippet = (snippet: string) => {
    const index = Math.min(active, slots.length - 1);
    const el = inputRefs.current[index];
    const cursor = snippet.indexOf("§");
    const clean = snippet.replace("§", "");
    const src = slots[index].src;
    const start = el?.selectionStart ?? src.length;
    const end = el?.selectionEnd ?? start;
    setSlot(index, {
      src: src.slice(0, start) + clean + src.slice(end),
      on: true,
    });
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + (cursor >= 0 ? cursor : clean.length);
      el?.setSelectionRange(pos, pos);
    });
  };

  const applyPreset = (preset: Preset) => {
    setSlots(
      preset.srcs
        .slice(0, MAX_SLOTS)
        .map((src) => ({ src, on: true, der: !!preset.der })),
    );
    if (preset.params) setParams((prev) => ({ ...prev, ...preset.params }));
    setPins([]);
    setActive(0);
    setAnim(null);
    resetView();
  };

  const addSlot = () => {
    if (slots.length >= MAX_SLOTS) return;
    setSlots((prev) => [...prev, { src: "", on: true, der: false }]);
    setActive(slots.length);
    requestAnimationFrame(() => inputRefs.current[slots.length]?.focus());
  };

  const removeSlot = (index: number) => {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, i) => i !== index));
    setActive((a) =>
      Math.max(0, Math.min(a > index ? a - 1 : a, slots.length - 2)),
    );
    setPins((prev) =>
      prev.map((pin) =>
        pin.slot === null
          ? pin
          : pin.slot === index
            ? { ...pin, slot: null, slope: null }
            : pin.slot > index
              ? { ...pin, slot: pin.slot - 1 }
              : pin,
      ),
    );
  };

  const setParam = (name: string, value: number) =>
    setParams((prev) => ({ ...prev, [name]: value }));

  // ───────────── papan JSXGraph ─────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: HOME_BOX,
      axis: false,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: lockRef.current,
      // geser dengan klik kiri + seret (tanpa Shift); satu jari tetap menggulir halaman
      pan: { enabled: true, needShift: false, needTwoFingers: true },
      // zoom roda mouse ditangani sendiri di bawah (zoom ke posisi kursor)
      zoom: { wheel: false, factorX: 1.25, factorY: 1.25 },
    });
    boardRef.current = board;
    if (shared?.view) board.setBoundingBox(shared.view, lockRef.current);

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

    // turunan (garis putus-putus)
    SLOT_COLORS.forEach((color, i) => {
      board.create(
        "functiongraph",
        [
          (x: number) => {
            const fn = fnsRef.current[i];
            return fn && derRef.current[i] ? derivative(fn, x) : Number.NaN;
          },
        ],
        {
          strokeColor: color,
          strokeWidth: 2,
          dash: 3,
          strokeOpacity: 0.75,
          highlight: false,
        },
      );
    });

    // garis singgung di posisi pelacak
    SLOT_COLORS.forEach((color, i) => {
      board.create(
        "functiongraph",
        [
          (x: number) => {
            const t = tanRef.current[i];
            if (
              !showTanRef.current ||
              !t ||
              !Number.isFinite(traceXRef.current)
            )
              return Number.NaN;
            return t.y + t.m * (x - t.x);
          },
        ],
        {
          strokeColor: color,
          strokeWidth: 1.6,
          dash: 1,
          strokeOpacity: 0.9,
          highlight: false,
        },
      );
    });

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
      face = "o",
    ) =>
      board.create("point", [x, y], {
        name: "",
        withLabel: false,
        size,
        face,
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
          () =>
            showAxisRef.current
              ? (axisRef.current[i][k]?.x ?? Number.NaN)
              : Number.NaN,
          () =>
            showAxisRef.current
              ? (axisRef.current[i][k]?.y ?? Number.NaN)
              : Number.NaN,
          color,
          3.5,
          true,
        );
      }
    });
    // titik ekstrem (belah ketupat)
    SLOT_COLORS.forEach((color, i) => {
      for (let k = 0; k < EXT_POOL; k += 1) {
        marker(
          () =>
            showExtRef.current
              ? (extRef.current[i][k]?.x ?? Number.NaN)
              : Number.NaN,
          () =>
            showExtRef.current
              ? (extRef.current[i][k]?.y ?? Number.NaN)
              : Number.NaN,
          color,
          5,
          true,
          "<>",
        );
      }
    });
    // titik potong antargrafik
    for (let k = 0; k < INTER_POOL; k += 1) {
      marker(
        () =>
          showInterRef.current
            ? (interRef.current[k]?.x ?? Number.NaN)
            : Number.NaN,
        () =>
          showInterRef.current
            ? (interRef.current[k]?.y ?? Number.NaN)
            : Number.NaN,
        INTER_COLOR,
        5,
        true,
      );
    }
    // titik tersemat (klik)
    for (let k = 0; k < MAX_PINS; k += 1) {
      marker(
        () => pinRef.current[k]?.x ?? Number.NaN,
        () => pinRef.current[k]?.y ?? Number.NaN,
        PIN_COLOR,
        4.5,
        true,
        "[]",
      );
    }

    // pelacak: garis tegak + titik pada tiap grafik
    board.create(
      "curve",
      [
        () => traceXRef.current,
        (t: number) => t,
        () => board.getBoundingBox()[3],
        () => board.getBoundingBox()[1],
      ],
      { strokeColor: "#63727d", strokeWidth: 1, dash: 2, highlight: false },
    );
    SLOT_COLORS.forEach((color, i) => {
      marker(
        () => (fnsRef.current[i] ? traceXRef.current : Number.NaN),
        () => {
          const fn = fnsRef.current[i];
          return fn && Number.isFinite(traceXRef.current)
            ? fn(traceXRef.current)
            : Number.NaN;
        },
        color,
        4,
        false,
      );
    });

    board.on("boundingbox", scheduleRecompute);

    // ───── interaksi pointer: pelacak, klik untuk menyematkan, zoom roda ─────
    const toUsr = (e: { clientX: number; clientY: number }) => {
      const r = el.getBoundingClientRect();
      const [x1, y1, x2, y2] = board.getBoundingBox();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      return {
        x: x1 + (px / r.width) * (x2 - x1),
        y: y1 - (py / r.height) * (y1 - y2),
        w: r.width,
        h: r.height,
        x1,
        y1,
        x2,
        y2,
      };
    };

    let traceRaf: number | null = null;
    let pendingX: number | null = null;
    const queueTrace = (x: number | null) => {
      pendingX = x;
      if (traceRaf !== null) return;
      traceRaf = requestAnimationFrame(() => {
        traceRaf = null;
        applyTrace(pendingX);
      });
    };

    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.buttons !== 0) {
        if (!Number.isNaN(traceXRef.current)) queueTrace(null); // sembunyikan saat menggeser
        return;
      }
      queueTrace(toUsr(e).x);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "touch") queueTrace(null);
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved >= 5) return;
      handleClick(e);
    };

    const handleClick = (e: PointerEvent) => {
      const u = toUsr(e);
      const sx = u.w / (u.x2 - u.x1);
      const sy = u.h / (u.y1 - u.y2);
      type Cand = { x: number; y: number; slot: number | null; d: number };
      const specials: Cand[] = [];
      const curves: Cand[] = [];
      const consider = (
        list: Cand[],
        x: number,
        y: number,
        slot: number | null,
        tol: number,
      ) => {
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        const d = Math.hypot((x - u.x) * sx, (y - u.y) * sy);
        if (d <= tol) list.push({ x, y, slot, d });
      };
      if (showInterRef.current)
        interRef.current.forEach((p) => consider(specials, p.x, p.y, null, 16));
      if (showAxisRef.current)
        axisRef.current.forEach((arr, i) =>
          arr.forEach((p) => consider(specials, p.x, p.y, i, 14)),
        );
      if (showExtRef.current)
        extRef.current.forEach((arr, i) =>
          arr.forEach((p) => consider(specials, p.x, p.y, i, 14)),
        );
      fnsRef.current.forEach((fn, i) => {
        if (!fn) return;
        const y = fn(u.x);
        if (!Number.isFinite(y)) return;
        const d = Math.abs(y - u.y) * sy;
        if (d <= 26) curves.push({ x: u.x, y, slot: i, d });
      });
      const pool = specials.length > 0 ? specials : curves;
      if (pool.length === 0) {
        if (e.pointerType === "touch") queueTrace(u.x);
        return;
      }
      const best = pool.reduce((p, q) => (q.d < p.d ? q : p));
      const fn = best.slot !== null ? fnsRef.current[best.slot] : null;
      const slope = fn ? derivative(fn, best.x) : null;
      if (e.pointerType === "touch") queueTrace(best.x);
      setPins((prev) => {
        const dup = prev.some(
          (p) => Math.abs(p.x - best.x) < 1e-9 && Math.abs(p.y - best.y) < 1e-9,
        );
        if (dup) return prev;
        const next = [
          ...prev,
          {
            id: pinIdRef.current++,
            x: best.x,
            y: best.y,
            slot: best.slot,
            slope: slope !== null && Number.isFinite(slope) ? slope : null,
          },
        ];
        return next.slice(-MAX_PINS);
      });
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      let delta = e.deltaY || e.deltaX;
      if (e.deltaMode === 1) delta *= 33;
      if (e.deltaMode === 2) delta *= 400;
      const k = Math.exp(Math.max(-120, Math.min(120, delta)) * 0.0015);
      const u = toUsr(e);
      let fx = k;
      let fy = k;
      if (!lockRef.current) {
        if (e.ctrlKey || e.metaKey)
          fy = 1; // hanya sumbu x
        else if (e.shiftKey) fx = 1; // hanya sumbu y
      }
      const nx1 = u.x + (u.x1 - u.x) * fx;
      const nx2 = u.x + (u.x2 - u.x) * fx;
      const ny1 = u.y + (u.y1 - u.y) * fy;
      const ny2 = u.y + (u.y2 - u.y) * fy;
      const w = nx2 - nx1;
      const h = ny1 - ny2;
      if (!(w > 1e-9 && w < 1e9 && h > 1e-9 && h < 1e9)) return;
      board.setBoundingBox([nx1, ny1, nx2, ny2], lockRef.current);
      scheduleRecompute();
      if (!Number.isNaN(traceXRef.current)) queueTrace(toUsr(e).x);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    const observer = new ResizeObserver(() => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        board.resizeContainer(el.clientWidth, el.clientHeight, true);
        scheduleRecompute();
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (traceRaf !== null) cancelAnimationFrame(traceRaf);
      rafRef.current = null;
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  // Sinkronkan fungsi yang aktif ke papan lalu hitung ulang
  useEffect(() => {
    Object.assign(pRef.current, params);
    fnsRef.current = Array.from({ length: MAX_SLOTS }, (_, i) => {
      const slot = slots[i];
      const result = parsed[i];
      return slot && slot.on && result && result.ok ? result.fn : null;
    });
    derRef.current = Array.from(
      { length: MAX_SLOTS },
      (_, i) => !!slots[i]?.der,
    );
    showInterRef.current = showInter;
    showAxisRef.current = showAxis;
    showExtRef.current = showExt;
    showTanRef.current = showTan;
    boardRef.current?.update();
    recompute();
    if (Number.isFinite(traceXRef.current)) {
      setTrace({ x: traceXRef.current, rows: traceRows(traceXRef.current) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, parsed, params, showInter, showAxis, showExt, showTan]);

  useEffect(() => {
    pinRef.current = pins;
    boardRef.current?.update();
  }, [pins]);

  // Kunci / lepas rasio 1:1
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    lockRef.current = lockRatio;
    const raw = board as unknown as {
      keepaspectratio?: boolean;
      attr?: { keepaspectratio?: boolean };
    };
    raw.keepaspectratio = lockRatio;
    if (raw.attr) raw.attr.keepaspectratio = lockRatio;
    if (lockRatio) board.setBoundingBox(board.getBoundingBox(), true);
    scheduleRecompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockRatio]);

  // Animasi parameter (bolak-balik antara PARAM_MIN dan PARAM_MAX)
  useEffect(() => {
    if (!anim) return undefined;
    let raf = 0;
    let last = performance.now();
    let dir = 1;
    let value = pRef.current[anim] ?? 1;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      value += dir * dt * PARAM_SPEED;
      if (value >= PARAM_MAX) {
        value = PARAM_MAX;
        dir = -1;
      } else if (value <= PARAM_MIN) {
        value = PARAM_MIN;
        dir = 1;
      }
      const rounded = Math.round(value * 100) / 100;
      setParams((prev) => ({ ...prev, [anim]: rounded }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [anim]);

  useEffect(() => {
    if (anim && !usedParams.includes(anim as (typeof PARAM_NAMES)[number]))
      setAnim(null);
  }, [anim, usedParams]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(""), 2400);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const onChange = () =>
      setIsFull(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const pairList = results.pairs.filter(
    (pair) => drawn[pair.i] && drawn[pair.j],
  );
  const anyDerivative = slots.some((slot, i) => slot.der && drawn[i]);
  const tableAxes = results.axes.filter((axis) => drawn[axis.i]);

  return (
    <div
      className={`plotter-simulation simulation-fullscreen-frame${isFull ? " is-fullscreen" : ""}`}
      ref={rootRef}
    >
      <div className="plot-boards">
        <section className="plot-board-panel" aria-labelledby="plot-title">
          <div className="plot-board-heading">
            <h3 id="plot-title">Penggambar grafik</h3>
            <div className="plot-toolbar">
              <div
                className="plot-zoom"
                role="group"
                aria-label="Zoom tampilan"
              >
                <button
                  type="button"
                  onClick={zoomIn}
                  aria-label="Perbesar"
                  title="Perbesar (+)"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={zoomOut}
                  aria-label="Perkecil"
                  title="Perkecil (−)"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  title="Kembali ke tampilan awal (0)"
                >
                  Reset
                </button>
              </div>
              <div
                className="plot-zoom plot-tools"
                role="group"
                aria-label="Alat"
              >
                <button
                  type="button"
                  onClick={fitView}
                  title="Sesuaikan tinggi jendela dengan nilai grafik"
                >
                  Sesuaikan
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  title="Layar penuh"
                >
                  {isFull ? "Tutup layar penuh" : "Layar penuh"}
                </button>
                <button
                  type="button"
                  onClick={exportPng}
                  title="Unduh gambar grafik (PNG)"
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  title="Salin tautan berisi grafik ini"
                >
                  Tautan
                </button>
              </div>
              <GraphAppearanceControls
                appearance={appearance}
                onStep={onStep}
              />
            </div>
          </div>
          <div
            className="plot-board"
            id={boardId}
            ref={containerRef}
            tabIndex={0}
            onKeyDown={onBoardKey}
            aria-label="Grafik hingga enam fungsi. Seret untuk menggeser, roda mouse untuk zoom, klik untuk menyematkan titik. Tombol panah menggeser, plus dan minus memperbesar atau memperkecil, nol mengembalikan tampilan."
          />

          <div className="plot-trace" aria-live="off">
            {trace && trace.rows.length > 0 ? (
              <>
                <b>x = {fmt(trace.x)}</b>
                {trace.rows.map((row) => (
                  <span key={row.i}>
                    <i
                      className="plot-swatch"
                      style={{ background: SLOT_COLORS[row.i] }}
                    />
                    y = {fmt(row.y)} <small>gradien {fmt(row.dy)}</small>
                  </span>
                ))}
              </>
            ) : (
              <span className="plot-trace-idle">
                {drawnCount === 0
                  ? "Ketik rumus untuk mulai menggambar."
                  : "Arahkan kursor ke grafik untuk melihat nilai y dan gradiennya (di layar sentuh: ketuk)."}
              </span>
            )}
          </div>

          {pins.length > 0 && (
            <div className="plot-pins">
              <div className="plot-pins-head">
                <span>Titik tersemat</span>
                <button type="button" onClick={() => setPins([])}>
                  Hapus semua
                </button>
              </div>
              <ul>
                {pins.map((pin) => (
                  <li key={pin.id}>
                    <i
                      className="plot-swatch"
                      style={{
                        background:
                          pin.slot === null
                            ? INTER_COLOR
                            : SLOT_COLORS[pin.slot],
                      }}
                    />
                    <span>{ptText(pin)}</span>
                    {pin.slope !== null && (
                      <small>gradien {fmt(pin.slope)}</small>
                    )}
                    <button
                      type="button"
                      aria-label={`Hapus titik ${ptText(pin)}`}
                      onClick={() =>
                        setPins((prev) => prev.filter((p) => p.id !== pin.id))
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="plot-legend" aria-label="Legenda grafik">
            {slots.map((_, i) =>
              drawn[i] ? (
                <span key={`g${i}`}>
                  <i style={{ borderTopColor: SLOT_COLORS[i] }} /> Grafik{" "}
                  {i + 1}
                </span>
              ) : null,
            )}
            {anyDerivative && (
              <span>
                <i className="line-dash" /> turunan f′(x)
              </span>
            )}
            <span>
              <b className="dot-inter" /> titik potong antargrafik
            </span>
            {showAxis && (
              <span>
                <b className="dot-axis" /> titik potong sumbu
              </span>
            )}
            {showExt && (
              <span>
                <b className="dot-ext" /> maksimum / minimum
              </span>
            )}
            {pins.length > 0 && (
              <span>
                <b className="dot-pin" /> titik tersemat
              </span>
            )}
          </div>
          <p className="plot-hint" role="status">
            {message ||
              "Seret untuk menggeser · roda mouse untuk zoom · klik grafik atau titik istimewa untuk menyematkannya · fokuskan papan lalu pakai panah, +, −, 0."}
          </p>
        </section>

        <aside className="plot-side" aria-label="Kontrol dan hasil grafik">
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
                      <span
                        className="plot-swatch"
                        style={{ background: SLOT_COLORS[i] }}
                      />
                      Grafik {i + 1}: <em>y =</em>
                    </label>
                    <span className="plot-slot-actions">
                      <label className="plot-toggle">
                        <input
                          type="checkbox"
                          checked={slot.on}
                          onChange={(event) =>
                            setSlot(i, { on: event.currentTarget.checked })
                          }
                        />
                        tampil
                      </label>
                      <label
                        className="plot-toggle"
                        title="Gambar turunan f′(x) sebagai garis putus-putus"
                      >
                        <input
                          type="checkbox"
                          checked={slot.der}
                          onChange={(event) =>
                            setSlot(i, { der: event.currentTarget.checked })
                          }
                        />
                        f′
                      </label>
                      {slots.length > 1 && (
                        <button
                          type="button"
                          className="plot-icon-btn"
                          aria-label={`Hapus grafik ${i + 1}`}
                          title="Hapus grafik ini"
                          onClick={() => removeSlot(i)}
                        >
                          ×
                        </button>
                      )}
                    </span>
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
                    onChange={(event) =>
                      setSlot(i, { src: event.currentTarget.value })
                    }
                  />
                  <p
                    id={statusId}
                    className={`plot-status${isError ? " is-error" : ""}`}
                  >
                    {!result
                      ? "Kosong: grafik tidak digambar."
                      : result.ok
                        ? `Terbaca: y = ${result.text}`
                        : result.error}
                  </p>
                </div>
              );
            })}

            {slots.length < MAX_SLOTS && (
              <button type="button" className="plot-add" onClick={addSlot}>
                + Tambah grafik
              </button>
            )}

            {usedParams.length > 0 && (
              <div className="plot-params">
                <span>Parameter: geser untuk melihat pengaruhnya</span>
                {usedParams.map((name) => {
                  const value = params[name] ?? 1;
                  return (
                    <div className="plot-param" key={name}>
                      <label htmlFor={`plot-par-${name}`}>
                        <em>{name}</em> =
                      </label>
                      <input
                        id={`plot-par-${name}`}
                        type="range"
                        min={PARAM_MIN}
                        max={PARAM_MAX}
                        step={0.05}
                        value={Math.max(PARAM_MIN, Math.min(PARAM_MAX, value))}
                        onChange={(event) => {
                          setAnim(null);
                          setParam(name, Number(event.currentTarget.value));
                        }}
                      />
                      <input
                        className="plot-param-num"
                        type="number"
                        step={0.1}
                        value={value}
                        aria-label={`Nilai ${name}`}
                        onChange={(event) => {
                          const v = parseFloat(event.currentTarget.value);
                          if (Number.isFinite(v)) {
                            setAnim(null);
                            setParam(name, v);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="plot-icon-btn"
                        aria-pressed={anim === name}
                        aria-label={
                          anim === name
                            ? `Hentikan animasi ${name}`
                            : `Animasikan ${name}`
                        }
                        title={
                          anim === name
                            ? "Hentikan animasi"
                            : "Animasikan parameter"
                        }
                        onClick={() => setAnim(anim === name ? null : name)}
                      >
                        {anim === name ? "❚❚" : "▶"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="plot-palette">
              <span id="plot-palette-label">
                Sisipkan ke Grafik {Math.min(active, slots.length - 1) + 1}
              </span>
              <div
                className="plot-palette-buttons"
                role="group"
                aria-labelledby="plot-palette-label"
              >
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
                  onChange={(event) =>
                    setShowInter(event.currentTarget.checked)
                  }
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
              <label>
                <input
                  type="checkbox"
                  checked={showExt}
                  onChange={(event) => setShowExt(event.currentTarget.checked)}
                />
                Titik maksimum / minimum
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showTan}
                  onChange={(event) => setShowTan(event.currentTarget.checked)}
                />
                Garis singgung di posisi kursor
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={lockRatio}
                  onChange={(event) =>
                    setLockRatio(event.currentTarget.checked)
                  }
                />
                Kunci skala sumbu x : y = 1 : 1
              </label>
            </div>

            <div className="plot-presets">
              <span id="plot-presets-label">Contoh cepat</span>
              <div
                className="plot-presets-buttons"
                role="group"
                aria-labelledby="plot-presets-label"
              >
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {drawnCount < 2 && (
            <p className="plot-warning" role="status">
              Aktifkan dan isi minimal dua grafik untuk melihat titik potong
              antargrafik.
            </p>
          )}

          {pairList.length > 0 && (
            <dl className="plot-readouts" aria-live="polite">
              {pairList.map((pair) => (
                <div className="readout-pair" key={`${pair.i}-${pair.j}`}>
                  <dt>
                    <span
                      className="plot-swatch"
                      style={{ background: SLOT_COLORS[pair.i] }}
                    />
                    <span
                      className="plot-swatch"
                      style={{ background: SLOT_COLORS[pair.j] }}
                    />
                    Grafik {pair.i + 1} ∩ Grafik {pair.j + 1}
                  </dt>
                  {pair.coincident ? (
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
                  {!pair.coincident && (
                    <small>
                      {pair.pts.length > 8
                        ? `${pair.pts.length} titik (8 pertama ditampilkan)`
                        : `${pair.pts.length} titik pada tampilan`}
                    </small>
                  )}
                </div>
              ))}
            </dl>
          )}

          {(showAxis || showExt) && tableAxes.length > 0 && (
            <div className="plot-axis-table-wrap">
              <table className="plot-axis-table">
                <caption>Titik istimewa (pada rentang x yang terlihat)</caption>
                <thead>
                  <tr>
                    <th scope="col">Grafik</th>
                    {showAxis && <th scope="col">Sumbu y</th>}
                    {showAxis && <th scope="col">Sumbu x</th>}
                    {showExt && <th scope="col">Maks / min</th>}
                  </tr>
                </thead>
                <tbody>
                  {tableAxes.map((axis) => (
                    <tr key={axis.i}>
                      <th scope="row">
                        <span
                          className="plot-swatch"
                          style={{ background: SLOT_COLORS[axis.i] }}
                        />
                        {axis.i + 1}
                      </th>
                      {showAxis && (
                        <td>{axis.yInt ? ptText(axis.yInt) : "tidak ada"}</td>
                      )}
                      {showAxis && (
                        <td>
                          {axis.xInts.length === 0
                            ? "tidak ada"
                            : axis.xInts
                                .slice(0, 6)
                                .map((p) => ptText(p))
                                .join("  ")}
                        </td>
                      )}
                      {showExt && (
                        <td>
                          {axis.ext.length === 0
                            ? "tidak ada"
                            : axis.ext
                                .map(
                                  (p) =>
                                    `${p.kind === "max" ? "maks" : "min"} ${ptText(p)}`,
                                )
                                .join("  ")}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <details className="plot-guide">
            <summary>Panduan notasi dan cara pakai</summary>
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
                    <code>{"e^{x}"}</code>, <code>{"e^{-x^2}"}</code>,{" "}
                    <code>{"\\pi"}</code>
                  </td>
                </tr>
                <tr>
                  <td>Trigonometri (radian)</td>
                  <td>
                    <code>{"\\sin x"}</code>, <code>{"\\sin^2 x"}</code>,{" "}
                    <code>{"\\cos(2x)"}</code>, <code>{"\\sin^{-1} x"}</code>
                  </td>
                </tr>
                <tr>
                  <td>Logaritma</td>
                  <td>
                    <code>{"\\ln x"}</code>, <code>{"\\log x"}</code> (basis
                    10), <code>{"\\log_{2} x"}</code>
                  </td>
                </tr>
                <tr>
                  <td>Nilai mutlak</td>
                  <td>
                    <code>{"|x-3|"}</code> atau{" "}
                    <code>{"\\left|x-3\\right|"}</code>
                  </td>
                </tr>
                <tr>
                  <td>Perkalian</td>
                  <td>
                    <code>2x</code>, <code>(x+1)(x-1)</code>,{" "}
                    <code>{"x\\cdot 2"}</code>
                  </td>
                </tr>
                <tr>
                  <td>Parameter (slider)</td>
                  <td>
                    <code>ax^2+bx+c</code>, <code>{"a\\sin(kx)"}</code>; huruf
                    a, b, c, k otomatis menjadi slider
                  </td>
                </tr>
                <tr>
                  <td>Mouse</td>
                  <td>
                    seret = geser, roda = zoom ke posisi kursor, klik = sematkan
                    titik. Bila skala tidak dikunci: Ctrl + roda = zoom sumbu x
                    saja, Shift + roda = sumbu y saja.
                  </td>
                </tr>
                <tr>
                  <td>Papan fokus</td>
                  <td>
                    panah = geser (Shift = lebih jauh), <code>+</code> /{" "}
                    <code>−</code> = zoom, <code>0</code> = reset
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              Gunakan kurung kurawal untuk pangkat lebih dari satu karakter,
              misalnya <code>{"x^{10}"}</code>. Variabel utama adalah x; awalan{" "}
              <code>y =</code> atau <code>f(x) =</code> boleh ditulis. Akar
              ganjil bilangan negatif dihitung, jadi <code>{"x^{1/3}"}</code>{" "}
              terdefinisi untuk x negatif. Turunan dan gradien dihitung secara
              numerik. Tombol “Tautan” menyalin alamat halaman berisi rumus,
              nilai parameter, dan tampilan saat ini.
            </p>
          </details>

          <ul className="plot-insights">
            <li>
              <strong style={{ color: INTER_COLOR }}>Titik potong</strong>{" "}
              adalah nilai x yang memenuhi f₁(x) = f₂(x). Program mencarinya
              secara numerik pada rentang x yang sedang terlihat, jadi geser
              atau zoom out untuk menemukan titik di luar layar.
            </li>
            <li>
              <strong style={{ color: SLOT_COLORS[0] }}>
                Parameter dan turunan:
              </strong>{" "}
              coba y = ax² + bx + c lalu animasikan a, atau centang f′ untuk
              melihat bagaimana tanda turunan menentukan fungsi naik atau turun,
              dan f′ = 0 di titik maksimum/minimum.
            </li>
            <li>
              <strong style={{ color: SLOT_COLORS[1] }}>
                Asimtot dan lubang:
              </strong>{" "}
              titik tidak ditandai di tempat fungsi tidak terdefinisi, misalnya
              x = 0 pada 1/x atau x = π/2 pada tan x.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
