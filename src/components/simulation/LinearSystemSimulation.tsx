import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./LinearSystemSimulation.css";
import { useStoredSimulationState } from "./useStoredSimulationState";
import {
  OP_SYMBOL,
  boxPoly,
  clipByCons,
  clipToBox,
  feasibleRegion,
  fmtN,
  formatEq,
  handlePoints,
  lineFromPoints,
  normalizeLine,
  optimize,
  ptText,
  sameLine,
  solve2,
  validLine,
  type Box,
  type Cons,
  type Goal,
  type Line,
  type Op,
  type Opt,
  type Pt,
  type Sol,
} from "./linearMath";

type Mode = "spldv" | "ptlsv" | "lp";
type Board = ReturnType<typeof JXG.JSXGraph.initBoard>;
type JEl = {
  X(): number;
  Y(): number;
  setPosition(method: number, coords: number[]): unknown;
  setAttribute(attrs: Record<string, unknown>): unknown;
  hide(): void;
  show(): void;
  on(event: string, handler: () => void): unknown;
};
type CurveLike = {
  updateDataArray: () => void;
  dataX: number[];
  dataY: number[];
};
type Analysis = {
  sol: Sol | null;
  verts: Pt[];
  empty: boolean;
  unbounded: boolean;
  opt: Opt | null;
  zLo: number;
  zHi: number;
  zAllMin: number;
  zAllMax: number;
};
type Preset = {
  label: string;
  cons: Cons[];
  p?: number;
  q?: number;
  goal?: Goal;
};

const MAX_LINES = 4;
const VERT_POOL = 8;
const OPT_POOL = 4;
const LINE_COLORS = ["#087f8c", "#d16b36", "#6b4e9b", "#3c8d2f"];
const REGION_COLOR = "#4f9fd1";
const INTER_COLOR = "#b23a48";
const OPT_COLOR = "#e0a100";
const VERT_COLOR = "#183e54";
const HOME: Record<Mode, Box> = {
  spldv: [-8, 8, 8, -8],
  ptlsv: [-2, 12, 12, -2],
  lp: [-2, 12, 12, -2],
};
const COORDS_BY_USER: number =
  (JXG as unknown as { COORDS_BY_USER?: number }).COORDS_BY_USER ?? 1;

const C = (a: number, b: number, c: number, op: Op): Cons => ({ a, b, c, op });

const SPLDV_PRESETS: Preset[] = [
  { label: "Satu titik potong", cons: [C(1, 1, 5, "="), C(1, -1, 1, "=")] },
  { label: "Soal cerita 2x+3y=12", cons: [C(2, 3, 12, "="), C(1, -1, 1, "=")] },
  {
    label: "Sejajar (tanpa penyelesaian)",
    cons: [C(1, 1, 4, "="), C(1, 1, 1, "=")],
  },
  { label: "Berimpit (tak hingga)", cons: [C(1, 1, 4, "="), C(2, 2, 8, "=")] },
];

const LP_PRESETS: Preset[] = [
  {
    label: "Maksimum dasar",
    cons: [C(1, 1, 4, "<="), C(1, 3, 6, "<=")],
    p: 2,
    q: 3,
    goal: "max",
  },
  {
    label: "Pabrik roti",
    cons: [C(2, 1, 8, "<="), C(1, 2, 10, "<=")],
    p: 3,
    q: 4,
    goal: "max",
  },
  {
    label: "Tiga kendala",
    cons: [C(1, 0, 4, "<="), C(0, 1, 3, "<="), C(1, 1, 5, "<=")],
    p: 5,
    q: 4,
    goal: "max",
  },
  {
    label: "Minimum biaya",
    cons: [C(1, 1, 4, ">="), C(1, 3, 6, ">=")],
    p: 2,
    q: 3,
    goal: "min",
  },
  {
    label: "Tidak ada daerah layak",
    cons: [C(1, 1, 2, "<="), C(1, 1, 5, ">=")],
    p: 1,
    q: 1,
    goal: "max",
  },
];

const MODES: { id: Mode; label: string }[] = [
  { id: "spldv", label: "Sistem persamaan (SPLDV)" },
  { id: "ptlsv", label: "Pertidaksamaan linear" },
  { id: "lp", label: "Program linear" },
];

const OPS: Op[] = ["<=", ">=", "<", ">"];

const fmtInput = (v: number) => String(Math.round(v * 1000) / 1000);

function NumField({
  value,
  onChange,
  label,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
}) {
  const [text, setText] = useState(fmtInput(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(fmtInput(value));
  }, [value, focused]);
  return (
    <input
      className={`lin-num ${className ?? ""}`}
      type="text"
      autoComplete="off"
      spellCheck={false}
      aria-label={label}
      value={text}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(event) => {
        const t = event.currentTarget.value;
        setText(t);
        const v = parseFloat(t.replace(",", "."));
        if (Number.isFinite(v) && /^-?\d*[.,]?\d*$/.test(t.trim())) onChange(v);
      }}
    />
  );
}

export function LinearSystemSimulation() {
  const boardId = `lin-board-${useId().replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<Board | null>(null);

  // objek papan
  const objsRef = useRef<{ line: JEl; p1: JEl; p2: JEl }[]>([]);
  const levelRef = useRef<JEl | null>(null);
  const levelLineRef = useRef<JEl | null>(null);
  const levelTextRef = useRef<JEl | null>(null);
  const testRef = useRef<JEl | null>(null);
  const vertTextRef = useRef<JEl[]>([]);
  const interTextRef = useRef<JEl | null>(null);

  // data yang dibaca papan (selalu lewat ref)
  const linesRef = useRef<Cons[]>([]);
  const handleAbcRef = useRef<(Line | null)[]>([]);
  const dragRef = useRef<{ i: number; kind: "line" | "handle" } | null>(null);
  const dashRef = useRef<number[]>([]);
  const regionDataRef = useRef<Pt[]>([]);
  const halfDataRef = useRef<Pt[][]>([[], [], [], []]);
  const vertsRef = useRef<Pt[]>([]);
  const optPtsRef = useRef<Pt[]>([]);
  const solRef = useRef<Sol | null>(null);
  const visTextRef = useRef<boolean[]>([]);
  const analysisRef = useRef<Analysis | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastKeyRef = useRef("");

  const [mode, setMode] = useStoredSimulationState<Mode>(
    "linear-system.mode",
    "lp",
  );
  const [eq, setEq] = useStoredSimulationState<Cons[]>(
    "linear-system.equations",
    SPLDV_PRESETS[0].cons,
  );
  const [ineq, setIneq] = useStoredSimulationState<Cons[]>(
    "linear-system.inequalities",
    LP_PRESETS[0].cons,
  );
  const [nonneg, setNonneg] = useStoredSimulationState(
    "linear-system.nonnegative",
    true,
  );
  const [showHalf, setShowHalf] = useStoredSimulationState(
    "linear-system.show-regions",
    true,
  );
  const [snap, setSnap] = useStoredSimulationState("linear-system.snap", true);
  const [p, setP] = useStoredSimulationState("linear-system.objective-p", 2);
  const [q, setQ] = useStoredSimulationState("linear-system.objective-q", 3);
  const [goal, setGoal] = useStoredSimulationState<Goal>(
    "linear-system.goal",
    "max",
  );
  const [k, setK] = useStoredSimulationState("linear-system.level", 0);
  const [anim, setAnim] = useState(false);
  const [testPt, setTestPt] = useStoredSimulationState<Pt>(
    "linear-system.test-point",
    { x: 1, y: 1 },
  );
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [message, setMessage] = useState("");

  const modeRef = useRef<Mode>(mode);
  const nonnegRef = useRef(nonneg);
  const showHalfRef = useRef(showHalf);
  const snapRef = useRef(snap);
  const pqRef = useRef({ p, q, goal });
  const kRef = useRef(k);

  const lines = mode === "spldv" ? eq : ineq;

  const scheduleRecompute = () => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      recompute();
    });
  };

  const buildCons = (list: Cons[], nonneg: boolean): Cons[] => {
    const out = list.filter(validLine);
    if (nonneg) out.push(C(1, 0, 0, ">="), C(0, 1, 0, ">="));
    return out;
  };

  const recompute = () => {
    const board = boardRef.current;
    if (!board) return;
    const mode = modeRef.current;
    const list = linesRef.current;
    const [x1, y1, x2, y2] = board.getBoundingBox();
    const mx = (x2 - x1) * 0.02;
    const my = (y1 - y2) * 0.02;
    const vbox: Box = [x1 - mx, y1 + my, x2 + mx, y2 - my];
    const vpoly = boxPoly(vbox[0], vbox[1], vbox[2], vbox[3]);

    const next: Analysis = {
      sol: null,
      verts: [],
      empty: false,
      unbounded: false,
      opt: null,
      zLo: -20,
      zHi: 20,
      zAllMin: -Infinity,
      zAllMax: Infinity,
    };
    regionDataRef.current = [];
    halfDataRef.current = [[], [], [], []];
    optPtsRef.current = [];

    if (mode === "spldv") {
      const [l1, l2] = list;
      if (l1 && l2 && validLine(l1) && validLine(l2)) next.sol = solve2(l1, l2);
    } else {
      const region = feasibleRegion(buildCons(list, nonnegRef.current));
      next.verts = region.vertices;
      next.empty = region.empty;
      next.unbounded = region.unbounded;
      if (!region.empty) regionDataRef.current = clipToBox(region.poly, vbox);
      if (showHalfRef.current) {
        list.forEach((c, i) => {
          if (validLine(c)) halfDataRef.current[i] = clipByCons(vpoly, c);
        });
      }
      const { p, q, goal } = pqRef.current;
      if (mode === "lp") {
        next.opt = optimize(region, p, q, goal);
        if (next.opt.status === "optimal")
          optPtsRef.current = next.opt.points.slice(0, OPT_POOL);
        const zs = region.vertices.map((v) => p * v.x + q * v.y);
        if (zs.length > 0) {
          const lo = Math.min(...zs);
          const hi = Math.max(...zs);
          const pad = Math.max(1, (hi - lo) * 0.3);
          next.zLo = lo - pad;
          next.zHi = hi + pad;
        }
        if (!region.empty) {
          const all = region.poly.map((v) => p * v.x + q * v.y);
          next.zAllMin = Math.min(...all);
          next.zAllMax = Math.max(...all);
        }
      }
    }
    solRef.current = next.sol;
    vertsRef.current = next.verts.slice(0, VERT_POOL);
    analysisRef.current = next;

    // label titik sudut / titik potong: tampil hanya bila ada datanya
    const wantVisible: boolean[] = [];
    for (let i = 0; i < VERT_POOL; i += 1)
      wantVisible[i] = i < vertsRef.current.length && mode !== "spldv";
    wantVisible[VERT_POOL] = mode === "spldv" && next.sol?.kind === "unique";
    wantVisible.forEach((want, i) => {
      if (visTextRef.current[i] === want) return;
      visTextRef.current[i] = want;
      const el = i < VERT_POOL ? vertTextRef.current[i] : interTextRef.current;
      if (!el) return;
      if (want) el.show();
      else el.hide();
    });

    board.update();

    const key = JSON.stringify(next);
    if (key !== lastKeyRef.current) {
      lastKeyRef.current = key;
      setAnalysis(next);
    }
  };

  // ───────────── tingkat garis selidik ─────────────
  const moveLevel = (value: number) => {
    const { p, q } = pqRef.current;
    const s = p * p + q * q;
    kRef.current = value;
    setK(value);
    const h = levelRef.current;
    if (h && s > 1e-12) {
      h.setPosition(COORDS_BY_USER, [(value * p) / s, (value * q) / s]);
      boardRef.current?.update();
    }
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
    boardRef.current?.setBoundingBox(HOME[modeRef.current], true);
    scheduleRecompute();
  };
  const panBy = (fx: number, fy: number) => {
    const board = boardRef.current;
    if (!board) return;
    const [x1, y1, x2, y2] = board.getBoundingBox();
    const dx = (x2 - x1) * fx;
    const dy = (y1 - y2) * fy;
    board.setBoundingBox([x1 + dx, y1 + dy, x2 + dx, y2 + dy], true);
    scheduleRecompute();
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
      const canvas = document.createElement("canvas");
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          setMessage("Gagal membuat gambar.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "grafik-linear.png";
        link.click();
        URL.revokeObjectURL(url);
        setMessage("Gambar diunduh.");
      }, "image/png");
    };
    img.onerror = () => setMessage("Gagal membuat gambar.");
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  };

  // ───────────── masukan ─────────────
  const updateLine = (i: number, patch: Partial<Cons>) => {
    const apply = (prev: Cons[]) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
    if (mode === "spldv") setEq(apply);
    else setIneq(apply);
  };

  const changeMode = (next: Mode) => {
    if (next === mode) return;
    setAnim(false);
    setMode(next);
  };

  const applyPreset = (preset: Preset) => {
    setAnim(false);
    if (mode === "spldv") {
      setEq(preset.cons.map((c) => ({ ...c })));
    } else {
      setIneq(preset.cons.map((c) => ({ ...c })));
      setNonneg(true);
      if (preset.p !== undefined) setP(preset.p);
      if (preset.q !== undefined) setQ(preset.q);
      if (preset.goal) setGoal(preset.goal);
      pqRef.current = {
        p: preset.p ?? pqRef.current.p,
        q: preset.q ?? pqRef.current.q,
        goal: preset.goal ?? pqRef.current.goal,
      };
      moveLevel(0);
    }
    handleAbcRef.current = [];
    resetView();
  };

  const addConstraint = () => {
    if (ineq.length >= MAX_LINES) return;
    setIneq((prev) => [...prev, C(1, 1, 6, "<=")]);
  };
  const removeConstraint = (i: number) => {
    if (ineq.length <= 1) return;
    handleAbcRef.current = [];
    setIneq((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ───────────── papan JSXGraph ─────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: HOME.lp,
      axis: false,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: true,
      pan: { enabled: true, needShift: false, needTwoFingers: true },
      zoom: { wheel: false, factorX: 1.25, factorY: 1.25 },
    });
    boardRef.current = board;
    const rawCreate = board as unknown as {
      create: (
        type: string,
        parents: unknown[],
        attrs: Record<string, unknown>,
      ) => unknown;
    };
    const create = (
      type: string,
      parents: unknown[],
      attrs: Record<string, unknown>,
    ) => rawCreate.create(type, parents, attrs) as JEl;

    const axisStyle = {
      strokeColor: "#63727d",
      strokeWidth: 1.4,
      highlight: false,
    };
    const ticks = {
      insertTicks: true,
      minorTicks: 0,
      majorHeight: -1,
      drawZero: false,
      strokeColor: "rgba(72, 101, 103, 0.14)",
      strokeWidth: 1,
      label: { fontSize: 9, strokeColor: "#63727d" },
    };
    create(
      "axis",
      [
        [0, 0],
        [1, 0],
      ],
      { ...axisStyle, ticks },
    );
    create(
      "axis",
      [
        [0, 0],
        [0, 1],
      ],
      { ...axisStyle, ticks },
    );

    // isian poligon (kurva tertutup) yang datanya dibaca dari ref
    const fill = (color: string, opacity: number, get: () => Pt[]) => {
      const curve = create("curve", [[0], [0]], {
        strokeWidth: 0,
        strokeColor: color,
        fillColor: color,
        fillOpacity: opacity,
        highlight: false,
        fixed: true,
      }) as unknown as CurveLike;
      curve.updateDataArray = function (this: CurveLike) {
        const pts = get();
        if (pts.length === 0) {
          this.dataX = [0];
          this.dataY = [0];
        } else {
          this.dataX = [...pts.map((pt) => pt.x), pts[0].x];
          this.dataY = [...pts.map((pt) => pt.y), pts[0].y];
        }
      };
    };
    LINE_COLORS.forEach((color, i) =>
      fill(color, 0.07, () => halfDataRef.current[i] ?? []),
    );
    fill(REGION_COLOR, 0.38, () => regionDataRef.current);

    const marker = (
      x: () => number,
      y: () => number,
      color: string,
      size: number,
      opts: Record<string, unknown> = {},
    ) =>
      create("point", [x, y], {
        name: "",
        withLabel: false,
        size: size * 0.75,
        fillColor: color,
        strokeColor: "#ffffff",
        strokeWidth: 1.5,
        highlightFillColor: color,
        highlightStrokeColor: "#ffffff",
        fixed: true,
        highlight: false,
        showInfobox: false,
        ...opts,
      });

    // cincin titik optimum (di bawah titik sudut)
    for (let i = 0; i < OPT_POOL; i += 1) {
      marker(
        () => optPtsRef.current[i]?.x ?? Number.NaN,
        () => optPtsRef.current[i]?.y ?? Number.NaN,
        OPT_COLOR,
        10,
        { strokeColor: "#8a6200", strokeWidth: 2, fillOpacity: 0.9 },
      );
    }

    // garis kendala: melalui dua titik pegangan
    const objs: { line: JEl; p1: JEl; p2: JEl }[] = [];
    LINE_COLORS.forEach((color) => {
      const handle = () =>
        create("point", [0, 0], {
          name: "",
          withLabel: false,
          size: 4,
          fillColor: "#ffffff",
          strokeColor: color,
          strokeWidth: 2.5,
          highlightFillColor: "#ffffff",
          highlightStrokeColor: color,
          snapToGrid: true,
          snapSizeX: 1,
          snapSizeY: 1,
          showInfobox: false,
        });
      const p1 = handle();
      const p2 = handle();
      const line = create("line", [p1, p2], {
        strokeColor: color,
        strokeWidth: 3,
        highlightStrokeColor: color,
        highlightStrokeWidth: 4,
        highlightStrokeOpacity: 1,
      });
      objs.push({ line, p1, p2 });
    });
    objsRef.current = objs;

    // garis selidik z = k dengan pegangan H
    const level = create("point", [0, 0], {
      name: "",
      withLabel: false,
      size: 5,
      fillColor: OPT_COLOR,
      strokeColor: "#ffffff",
      strokeWidth: 2,
      highlightFillColor: OPT_COLOR,
      highlightStrokeColor: "#ffffff",
      showInfobox: false,
    });
    levelRef.current = level;
    const levelLine = create(
      "line",
      [
        () => -(pqRef.current.p * level.X() + pqRef.current.q * level.Y()),
        () => pqRef.current.p,
        () => pqRef.current.q,
      ],
      {
        strokeColor: OPT_COLOR,
        strokeWidth: 3,
        dash: 2,
        highlight: false,
        fixed: true,
      },
    );
    levelLineRef.current = levelLine;
    const levelText = create(
      "text",
      [
        () => level.X(),
        () => level.Y(),
        () =>
          `z = ${fmtN(pqRef.current.p * level.X() + pqRef.current.q * level.Y())}`,
      ],
      {
        fontSize: 13,
        strokeColor: "#7a5600",
        anchorX: "left",
        anchorY: "bottom",
        offset: [10, 8],
        highlight: false,
        fixed: true,
      },
    );
    levelTextRef.current = levelText;

    // titik sudut dan titik potong
    for (let i = 0; i < VERT_POOL; i += 1) {
      marker(
        () => vertsRef.current[i]?.x ?? Number.NaN,
        () => vertsRef.current[i]?.y ?? Number.NaN,
        VERT_COLOR,
        4.5,
      );
    }
    marker(
      () => {
        const s = solRef.current;
        return s && s.kind === "unique" ? s.x : Number.NaN;
      },
      () => {
        const s = solRef.current;
        return s && s.kind === "unique" ? s.y : Number.NaN;
      },
      INTER_COLOR,
      7,
    );

    // label koordinat
    const textAttrs = {
      fontSize: 12,
      strokeColor: "#183e54",
      anchorX: "left",
      anchorY: "bottom",
      offset: [8, 6],
      highlight: false,
      fixed: true,
    };
    vertTextRef.current = [];
    for (let i = 0; i < VERT_POOL; i += 1) {
      const t = create(
        "text",
        [
          () => vertsRef.current[i]?.x ?? 0,
          () => vertsRef.current[i]?.y ?? 0,
          () => (vertsRef.current[i] ? ptText(vertsRef.current[i]) : ""),
        ],
        textAttrs,
      );
      t.hide();
      vertTextRef.current.push(t);
    }
    const interText = create(
      "text",
      [
        () => {
          const s = solRef.current;
          return s && s.kind === "unique" ? s.x : 0;
        },
        () => {
          const s = solRef.current;
          return s && s.kind === "unique" ? s.y : 0;
        },
        () => {
          const s = solRef.current;
          return s && s.kind === "unique" ? ptText({ x: s.x, y: s.y }) : "";
        },
      ],
      { ...textAttrs, strokeColor: INTER_COLOR, fontSize: 13 },
    );
    interText.hide();
    interTextRef.current = interText;

    // titik uji (hanya pada mode pertidaksamaan)
    const test = create("point", [testPt.x, testPt.y], {
      name: "",
      withLabel: false,
      size: 4,
      face: "[]",
      fillColor: "#ffffff",
      strokeColor: "#183e54",
      strokeWidth: 2.5,
      highlightFillColor: "#ffffff",
      highlightStrokeColor: "#183e54",
      snapToGrid: true,
      snapSizeX: 0.5,
      snapSizeY: 0.5,
      showInfobox: false,
    });
    testRef.current = test;
    test.on("drag", () => setTestPt({ x: test.X(), y: test.Y() }));

    // pegangan paling atas
    objs.forEach((o) => {
      o.p1.setAttribute({ layer: 9 });
      o.p2.setAttribute({ layer: 9 });
    });
    level.setAttribute({ layer: 9 });
    test.setAttribute({ layer: 9 });

    // ───── interaksi garis ─────
    const pushLine = (i: number) => {
      const cur = linesRef.current[i];
      const o = objs[i];
      if (!cur || !o) return;
      const raw = lineFromPoints(
        { x: o.p1.X(), y: o.p1.Y() },
        { x: o.p2.X(), y: o.p2.Y() },
      );
      if (!validLine(raw)) return;
      const l = normalizeLine(raw, cur);
      handleAbcRef.current[i] = l;
      linesRef.current = linesRef.current.map((c, idx) =>
        idx === i ? { ...c, ...l } : c,
      );
      const apply = (prev: Cons[]) =>
        prev.map((c, idx) => (idx === i ? { ...c, ...l } : c));
      if (modeRef.current === "spldv") setEq(apply);
      else setIneq(apply);
      scheduleRecompute();
    };

    objs.forEach((o, i) => {
      o.p1.on("drag", () => {
        dragRef.current = { i, kind: "handle" };
        pushLine(i);
      });
      o.p2.on("drag", () => {
        dragRef.current = { i, kind: "handle" };
        pushLine(i);
      });
      o.line.on("drag", () => {
        dragRef.current = { i, kind: "line" };
        pushLine(i);
      });
    });
    board.on("up", () => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d || d.kind !== "line" || !snapRef.current) return;
      const o = objs[d.i];
      [o.p1, o.p2].forEach((pt) =>
        pt.setPosition(COORDS_BY_USER, [
          Math.round(pt.X()) + 0,
          Math.round(pt.Y()) + 0,
        ]),
      );
      board.update();
      pushLine(d.i);
    });

    level.on("drag", () => {
      const { p, q } = pqRef.current;
      const value = p * level.X() + q * level.Y();
      kRef.current = value;
      setK(value);
    });

    board.on("boundingbox", scheduleRecompute);

    // ───── zoom roda mouse ke posisi kursor ─────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      let delta = e.deltaY || e.deltaX;
      if (e.deltaMode === 1) delta *= 33;
      if (e.deltaMode === 2) delta *= 400;
      const f = Math.exp(Math.max(-120, Math.min(120, delta)) * 0.0015);
      const r = el.getBoundingClientRect();
      const [x1, y1, x2, y2] = board.getBoundingBox();
      const ux = x1 + ((e.clientX - r.left) / r.width) * (x2 - x1);
      const uy = y1 - ((e.clientY - r.top) / r.height) * (y1 - y2);
      const nx1 = ux + (x1 - ux) * f;
      const nx2 = ux + (x2 - ux) * f;
      const ny1 = uy + (y1 - uy) * f;
      const ny2 = uy + (y2 - uy) * f;
      const w = nx2 - nx1;
      if (!(w > 1e-6 && w < 1e7)) return;
      board.setBoundingBox([nx1, ny1, nx2, ny2], true);
      scheduleRecompute();
    };
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
      el.removeEventListener("wheel", onWheel);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  // Ganti mode: tampilan awal dan penempatan ulang pegangan
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    modeRef.current = mode;
    handleAbcRef.current = [];
    board.setBoundingBox(HOME[mode], true);
  }, [mode]);

  // Sinkronkan state ke papan
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    modeRef.current = mode;
    linesRef.current = lines;
    nonnegRef.current = nonneg;
    showHalfRef.current = showHalf;
    snapRef.current = snap;
    pqRef.current = { p, q, goal };

    const box = board.getBoundingBox() as Box;
    objsRef.current.forEach((o, i) => {
      const c = lines[i];
      if (!c) {
        o.line.hide();
        o.p1.hide();
        o.p2.hide();
        return;
      }
      o.line.show();
      o.p1.show();
      o.p2.show();
      [o.p1, o.p2].forEach((pt) => pt.setAttribute({ snapToGrid: snap }));
      const strict = c.op === "<" || c.op === ">";
      const dash = strict ? 2 : 0;
      if (dashRef.current[i] !== dash) {
        dashRef.current[i] = dash;
        o.line.setAttribute({ dash });
      }
      const known = handleAbcRef.current[i];
      if (validLine(c) && (!known || !sameLine(known, c))) {
        const [a, b] = handlePoints(c, box);
        o.p1.setPosition(COORDS_BY_USER, [a.x, a.y]);
        o.p2.setPosition(COORDS_BY_USER, [b.x, b.y]);
        handleAbcRef.current[i] = normalizeLine(lineFromPoints(a, b), c);
      }
    });

    const lp = mode === "lp";
    const hasObj = Math.abs(p) > 1e-12 || Math.abs(q) > 1e-12;
    const level = levelRef.current;
    if (lp && hasObj) {
      levelLineRef.current?.show();
      levelTextRef.current?.show();
      level?.show();
      const s = p * p + q * q;
      level?.setPosition(COORDS_BY_USER, [
        (kRef.current * p) / s,
        (kRef.current * q) / s,
      ]);
    } else {
      levelLineRef.current?.hide();
      levelTextRef.current?.hide();
      level?.hide();
    }
    if (mode === "ptlsv") testRef.current?.show();
    else testRef.current?.hide();

    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, eq, ineq, nonneg, showHalf, snap, p, q, goal]);

  // Animasi: garis selidik meluncur dari luar daerah sampai menyentuh titik optimum
  useEffect(() => {
    if (!anim) return undefined;
    const a = analysisRef.current;
    if (!a || !a.opt || a.opt.status !== "optimal") {
      setAnim(false);
      return undefined;
    }
    const target = a.opt.z;
    const span = Math.max(1, a.zHi - a.zLo);
    const from =
      pqRef.current.goal === "max" ? target + span * 0.6 : target - span * 0.6;
    const start = performance.now();
    const duration = 3200;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      moveLevel(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setAnim(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim]);

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

  // ───────────── turunan tampilan ─────────────
  const sol = analysis?.sol ?? null;
  const verts = analysis?.verts ?? [];
  const opt = analysis?.opt ?? null;
  const zAt = (pt: Pt) => p * pt.x + q * pt.y;
  const goalWord = goal === "max" ? "maksimum" : "minimum";

  const resultText = useMemo(() => {
    if (!analysis) return "";
    if (mode === "spldv") {
      if (!analysis.sol)
        return "Atur kedua garis agar terdefinisi (a dan b tidak boleh sama-sama 0).";
      if (analysis.sol.kind === "unique")
        return `Kedua garis berpotongan di ${ptText(analysis.sol)} → x = ${fmtN(analysis.sol.x)}, y = ${fmtN(analysis.sol.y)}`;
      if (analysis.sol.kind === "parallel")
        return "Kedua garis sejajar: tidak ada penyelesaian.";
      return "Kedua garis berimpit: penyelesaian tak hingga banyak.";
    }
    if (analysis.empty)
      return "Tidak ada daerah penyelesaian: kendalanya saling bertentangan.";
    if (mode === "ptlsv") {
      const n = analysis.verts.length;
      if (analysis.unbounded)
        return `Daerah penyelesaian tak terbatas, dengan ${n} titik sudut.`;
      if (n === 1)
        return `Daerah penyelesaian hanya satu titik: ${ptText(analysis.verts[0])}.`;
      if (n === 2) return "Daerah penyelesaian berupa ruas garis.";
      return `Daerah penyelesaian berbentuk poligon dengan ${n} titik sudut.`;
    }
    const o = analysis.opt;
    if (!o) return "";
    if (o.status === "unbounded")
      return `Daerah tak terbatas ke arah yang membuat z terus membesar/mengecil: tidak ada nilai ${goalWord}.`;
    if (o.status === "constant")
      return "Fungsi tujuan bernilai 0 di mana-mana (p = q = 0).";
    if (o.status === "optimal") {
      const where = o.points.map(ptText).join(" dan ");
      return o.points.length > 1
        ? `Nilai ${goalWord} z = ${fmtN(o.z)} tercapai di seluruh ruas antara ${where}.`
        : `Nilai ${goalWord} z = ${fmtN(o.z)} di titik ${where}.`;
    }
    return "";
  }, [analysis, mode, goalWord]);

  const levelNote = useMemo(() => {
    if (mode !== "lp" || !analysis) return "";
    if (analysis.empty) return "Tidak ada daerah layak.";
    const o = analysis.opt;
    if (
      o &&
      o.status === "optimal" &&
      Math.abs(k - o.z) < 1e-4 * (1 + Math.abs(o.z))
    )
      return `Garis menyentuh titik ${goalWord}: z = ${fmtN(o.z)}.`;
    const inside = k >= analysis.zAllMin - 1e-9 && k <= analysis.zAllMax + 1e-9;
    return inside
      ? "Garis memotong daerah penyelesaian: ada titik layak dengan nilai z ini."
      : "Garis di luar daerah penyelesaian: tidak ada titik layak dengan nilai z ini.";
  }, [analysis, k, mode, goalWord]);

  const checks = lines.map((c) => {
    const v = c.a * testPt.x + c.b * testPt.y;
    const eps = 1e-9;
    const ok =
      c.op === "<="
        ? v <= c.c + eps
        : c.op === ">="
          ? v >= c.c - eps
          : c.op === "<"
            ? v < c.c - eps
            : c.op === ">"
              ? v > c.c + eps
              : Math.abs(v - c.c) < 1e-6;
    return { v, ok };
  });
  const nnOk = testPt.x >= -1e-9 && testPt.y >= -1e-9;
  const allOk = checks.every((c) => c.ok) && (!nonneg || nnOk);

  const presets = mode === "spldv" ? SPLDV_PRESETS : LP_PRESETS;
  const sliderMin = analysis ? analysis.zLo : -20;
  const sliderMax = analysis ? analysis.zHi : 20;

  const tabsEl = (
    <div className="lin-tabs" role="tablist" aria-label="Jenis simulasi">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={mode === m.id}
          className={mode === m.id ? "is-active" : ""}
          onClick={() => changeMode(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );

  const panelEl = (
    <section
      className="lin-board-panel"
      aria-labelledby="lin-title"
      ref={(node) => {
        panelRef.current = node;
      }}
    >
      <div className="lin-board-heading">
        <h3 id="lin-title">
          {mode === "spldv"
            ? "Titik potong dua garis"
            : mode === "ptlsv"
              ? "Daerah penyelesaian"
              : "Program linear"}
        </h3>
        <div className="lin-toolbar">
          <div className="lin-zoom" role="group" aria-label="Zoom tampilan">
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
            <button type="button" onClick={resetView} title="Tampilan awal (0)">
              Reset
            </button>
          </div>
          <div className="lin-zoom" role="group" aria-label="Alat">
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
              title="Unduh gambar (PNG)"
            >
              PNG
            </button>
          </div>
        </div>
      </div>

      <div
        className="lin-board"
        id={boardId}
        ref={containerRef}
        tabIndex={0}
        onKeyDown={onBoardKey}
        aria-label="Grafik garis linear. Seret garis atau titik pegangan untuk menggesernya. Seret ruang kosong untuk menggeser tampilan, roda mouse untuk zoom."
      />

      <p className="lin-result" role="status" aria-live="polite">
        {resultText}
      </p>

      <div className="lin-legend" aria-label="Legenda">
        {lines.map((c, i) => (
          <span key={i}>
            <i style={{ borderTopColor: LINE_COLORS[i] }} /> {formatEq(c)}
          </span>
        ))}
        {mode === "spldv" && sol?.kind === "unique" && (
          <span>
            <b className="dot-inter" /> titik potong
          </span>
        )}
        {mode !== "spldv" && (
          <>
            <span>
              <b className="dot-region" /> daerah penyelesaian
            </span>
            <span>
              <b className="dot-vertex" /> titik sudut
            </span>
          </>
        )}
        {mode === "lp" && (
          <span>
            <b className="dot-opt" /> garis selidik / titik optimum
          </span>
        )}
        {mode === "ptlsv" && (
          <span>
            <b className="dot-test" /> titik uji
          </span>
        )}
      </div>
      <p className="lin-hint" role="status">
        {message ||
          "Seret garis atau titik putihnya untuk menggeser · seret ruang kosong untuk menggeser tampilan · roda mouse untuk zoom."}
      </p>
    </section>
  );

  const controlsEl = (
    <section className="lin-controls" aria-label="Pengaturan">
      <div className="lin-group">
        <span className="lin-group-title">
          {mode === "spldv" ? "Sistem persamaan" : "Kendala (pertidaksamaan)"}
        </span>
        {lines.map((c, i) => (
          <div className="lin-row" key={i}>
            <span
              className="lin-swatch"
              style={{ background: LINE_COLORS[i] }}
            />
            <NumField
              value={c.a}
              label={`Koefisien x garis ${i + 1}`}
              onChange={(v) => updateLine(i, { a: v })}
            />
            <span className="lin-sym">x +</span>
            <NumField
              value={c.b}
              label={`Koefisien y garis ${i + 1}`}
              onChange={(v) => updateLine(i, { b: v })}
            />
            <span className="lin-sym">y</span>
            {mode === "spldv" ? (
              <span className="lin-op-static">=</span>
            ) : (
              <select
                className="lin-op"
                aria-label={`Tanda garis ${i + 1}`}
                value={c.op}
                onChange={(event) =>
                  updateLine(i, { op: event.currentTarget.value as Op })
                }
              >
                {OPS.map((op) => (
                  <option key={op} value={op}>
                    {OP_SYMBOL[op]}
                  </option>
                ))}
              </select>
            )}
            <NumField
              value={c.c}
              label={`Konstanta garis ${i + 1}`}
              onChange={(v) => updateLine(i, { c: v })}
            />
            {mode !== "spldv" && lines.length > 1 && (
              <button
                type="button"
                className="lin-icon-btn"
                aria-label={`Hapus kendala ${i + 1}`}
                onClick={() => removeConstraint(i)}
              >
                ×
              </button>
            )}
          </div>
        ))}
        {mode !== "spldv" && (
          <div className="lin-inline">
            {lines.length < MAX_LINES && (
              <button type="button" className="lin-btn" onClick={addConstraint}>
                + Tambah kendala
              </button>
            )}
            <label className="lin-check">
              <input
                type="checkbox"
                checked={nonneg}
                onChange={(event) => setNonneg(event.currentTarget.checked)}
              />
              Syarat x ≥ 0 dan y ≥ 0
            </label>
          </div>
        )}
      </div>

      {mode === "lp" && (
        <div className="lin-group">
          <span className="lin-group-title">Fungsi tujuan</span>
          <div className="lin-row lin-objective">
            <span className="lin-sym">z =</span>
            <NumField value={p} label="Koefisien x pada z" onChange={setP} />
            <span className="lin-sym">x +</span>
            <NumField value={q} label="Koefisien y pada z" onChange={setQ} />
            <span className="lin-sym">y</span>
          </div>
          <div
            className="lin-inline"
            role="radiogroup"
            aria-label="Tujuan optimasi"
          >
            {(["max", "min"] as Goal[]).map((g) => (
              <label className="lin-check" key={g}>
                <input
                  type="radio"
                  name="lin-goal"
                  checked={goal === g}
                  onChange={() => setGoal(g)}
                />
                {g === "max" ? "Maksimumkan" : "Minimumkan"}
              </label>
            ))}
          </div>
          <label className="lin-slider">
            <span>
              Garis selidik: z = <b>{fmtN(k)}</b>
            </span>
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step="any"
              value={Math.max(sliderMin, Math.min(sliderMax, k))}
              onChange={(event) => {
                setAnim(false);
                moveLevel(Number(event.currentTarget.value));
              }}
            />
          </label>
          <div className="lin-inline">
            <button
              type="button"
              className="lin-btn"
              disabled={!opt || opt.status !== "optimal"}
              onClick={() => setAnim((a) => !a)}
            >
              {anim ? "Hentikan" : "▶ Geser sampai menyentuh optimum"}
            </button>
          </div>
          <p className="lin-note">{levelNote}</p>
        </div>
      )}

      <div className="lin-group">
        <span className="lin-group-title">Tampilan</span>
        <div className="lin-options">
          <label className="lin-check">
            <input
              type="checkbox"
              checked={snap}
              onChange={(event) => setSnap(event.currentTarget.checked)}
            />
            Tempel titik pegangan ke bilangan bulat
          </label>
          {mode !== "spldv" && (
            <label className="lin-check">
              <input
                type="checkbox"
                checked={showHalf}
                onChange={(event) => setShowHalf(event.currentTarget.checked)}
              />
              Warnai sisi tiap pertidaksamaan
            </label>
          )}
        </div>
      </div>

      <div className="lin-group">
        <span className="lin-group-title" id="lin-presets-label">
          Contoh cepat
        </span>
        <div
          className="lin-presets"
          role="group"
          aria-labelledby="lin-presets-label"
        >
          {presets.map((preset) => (
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
  );

  const infoEl = (
    <>
      {mode === "spldv" && (
        <div className="lin-cards">
          <section className="lin-card">
            <h4>Sistem persamaan</h4>
            {eq.map((c, i) => (
              <p key={i} className="lin-eq">
                <span
                  className="lin-swatch"
                  style={{ background: LINE_COLORS[i] }}
                />
                {formatEq(c)}
                {validLine(c) && Math.abs(c.b) > 1e-9 && (
                  <small>gradien m = {fmtN(-c.a / c.b)}</small>
                )}
                {validLine(c) && Math.abs(c.b) <= 1e-9 && (
                  <small>garis tegak</small>
                )}
              </p>
            ))}
          </section>
          <section className="lin-card">
            <h4>Penyelesaian</h4>
            {!sol && <p className="lin-muted">Garis belum terdefinisi.</p>}
            {sol?.kind === "unique" && (
              <>
                <p>
                  D = a₁b₂ − a₂b₁ = <b>{fmtN(sol.D)}</b>
                </p>
                <p>
                  Dx = {fmtN(sol.Dx)}, Dy = {fmtN(sol.Dy)}
                </p>
                <p>
                  x = Dx/D = <b>{fmtN(sol.x)}</b>, y = Dy/D ={" "}
                  <b>{fmtN(sol.y)}</b>
                </p>
              </>
            )}
            {sol?.kind === "parallel" && (
              <p>
                D = 0 dan konstantanya tidak sebanding → garis sejajar,{" "}
                <b>tidak ada penyelesaian</b>.
              </p>
            )}
            {sol?.kind === "same" && (
              <p>
                D = 0 dan semua perbandingannya sama → garis berimpit,{" "}
                <b>tak hingga banyak penyelesaian</b>.
              </p>
            )}
          </section>
          <section className="lin-card">
            <h4>Pemeriksaan</h4>
            {sol?.kind === "unique" ? (
              eq.map((c, i) => {
                const v = c.a * sol.x + c.b * sol.y;
                return (
                  <p key={i}>
                    <span
                      className="lin-swatch"
                      style={{ background: LINE_COLORS[i] }}
                    />
                    {fmtN(c.a)}({fmtN(sol.x)}) + {fmtN(c.b)}({fmtN(sol.y)}) ={" "}
                    {fmtN(v)}{" "}
                    <b className="lin-ok">
                      {Math.abs(v - c.c) < 1e-6 ? "✓" : "✗"}
                    </b>
                  </p>
                );
              })
            ) : (
              <p className="lin-muted">
                Tersedia bila garis berpotongan di satu titik.
              </p>
            )}
          </section>
        </div>
      )}

      {mode === "ptlsv" && (
        <div className="lin-cards">
          <section className="lin-card">
            <h4>Titik sudut daerah</h4>
            {analysis?.empty ? (
              <p className="lin-muted">Tidak ada.</p>
            ) : verts.length === 0 ? (
              <p className="lin-muted">
                Tidak ada titik sudut (daerah berupa bidang atau pita).
              </p>
            ) : (
              <p className="lin-points">
                {verts.map((v, i) => (
                  <span key={i}>{ptText(v)}</span>
                ))}
              </p>
            )}
          </section>
          <section className="lin-card">
            <h4>
              Titik uji {ptText(testPt)}{" "}
              <b className={allOk ? "lin-ok" : "lin-bad"}>
                {allOk ? "memenuhi" : "tidak memenuhi"}
              </b>
            </h4>
            {lines.map((c, i) => (
              <p key={i}>
                <span
                  className="lin-swatch"
                  style={{ background: LINE_COLORS[i] }}
                />
                {fmtN(c.a)}({fmtN(testPt.x)}) + {fmtN(c.b)}({fmtN(testPt.y)}) ={" "}
                {fmtN(checks[i].v)} {OP_SYMBOL[c.op]} {fmtN(c.c)}{" "}
                <b className={checks[i].ok ? "lin-ok" : "lin-bad"}>
                  {checks[i].ok ? "✓" : "✗"}
                </b>
              </p>
            ))}
            {nonneg && (
              <p>
                x ≥ 0 dan y ≥ 0{" "}
                <b className={nnOk ? "lin-ok" : "lin-bad"}>
                  {nnOk ? "✓" : "✗"}
                </b>
              </p>
            )}
            <p className="lin-muted">
              Seret kotak putih di grafik untuk menguji titik lain.
            </p>
          </section>
        </div>
      )}

      {mode === "lp" && (
        <div className="lin-table-wrap">
          <table className="lin-table">
            <caption>
              Uji titik sudut: z = {fmtN(p)}x + {fmtN(q)}y (
              {goal === "max" ? "dicari maksimum" : "dicari minimum"})
            </caption>
            <thead>
              <tr>
                <th scope="col">Titik sudut</th>
                <th scope="col">z</th>
                <th scope="col">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {verts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="lin-muted">
                    {analysis?.empty
                      ? "Daerah penyelesaian kosong."
                      : "Tidak ada titik sudut."}
                  </td>
                </tr>
              ) : (
                verts.map((v, i) => {
                  const best =
                    opt?.status === "optimal" &&
                    Math.abs(zAt(v) - opt.z) < 1e-6 * (1 + Math.abs(opt.z));
                  return (
                    <tr key={i} className={best ? "is-best" : ""}>
                      <th scope="row">{ptText(v)}</th>
                      <td>{fmtN(zAt(v))}</td>
                      <td>{best ? `← ${goalWord}` : ""}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const guideEl = (
    <details className="lin-guide">
      <summary>Cara pakai dan konsep singkat</summary>
      <ul>
        <li>
          <b>Menggeser garis:</b> seret garisnya untuk menggeser sejajar, atau
          seret salah satu titik putih pada garis untuk memutarnya. Koefisien di
          panel kanan ikut berubah, dan sebaliknya Anda bisa mengetik koefisien
          langsung.
        </li>
        <li>
          <b>SPLDV:</b> titik potong dua garis adalah penyelesaian sistem. Bila
          gradien sama, garis sejajar (tanpa penyelesaian) atau berimpit (tak
          hingga penyelesaian).
        </li>
        <li>
          <b>Pertidaksamaan:</b> tiap garis membagi bidang menjadi dua sisi.
          Daerah penyelesaian adalah irisan semua sisi yang memenuhi, dan garis
          putus-putus (&lt; atau &gt;) berarti batasnya tidak termasuk.
        </li>
        <li>
          <b>Program linear:</b> nilai optimum fungsi tujuan pada daerah
          berbatas selalu terjadi di titik sudut. Geser garis selidik z = k
          sejajar sampai tepat menyentuh daerah untuk melihat titik optimumnya;
          ubah kendala atau fungsi tujuan untuk melihat titik optimum berpindah.
        </li>
        <li>
          <b>Navigasi:</b> seret ruang kosong untuk menggeser tampilan, roda
          mouse untuk zoom. Saat papan difokus: panah menggeser, +/− zoom, 0
          reset.
        </li>
      </ul>
    </details>
  );

  return (
    <div className="linear-simulation" ref={rootRef}>
      {tabsEl}

      <div className="lin-boards">
        {panelEl}
        {isFull ? (
          <div className="lin-side">
            {controlsEl}
            {infoEl}
            {guideEl}
          </div>
        ) : (
          controlsEl
        )}
      </div>

      {!isFull && infoEl}
      {!isFull && guideEl}
    </div>
  );
}
