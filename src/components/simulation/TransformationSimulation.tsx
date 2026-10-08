import { useEffect, useId, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./TransformationSimulation.css";
import { useStoredSimulationState } from "./useStoredSimulationState";

/* ---------- Tipe ---------- */

type Vec = [number, number];
type Mat = number[][];
type ReflectionAxis = "x" | "y" | "yx" | "ynx";

type Step =
  | { id: number; type: "translation"; tx: number; ty: number }
  | { id: number; type: "reflection"; axis: ReflectionAxis }
  | { id: number; type: "rotation"; angle: number; cx: number; cy: number }
  | { id: number; type: "dilation"; k: number; cx: number; cy: number };

type StepType = Step["type"];

type Draft = {
  tx: string;
  ty: string;
  axis: ReflectionAxis;
  angle: string;
  rcx: string;
  rcy: string;
  k: string;
  dcx: string;
  dcy: string;
};

type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
};

/* ---------- Konstanta ---------- */

const MAX_STEPS = 5;
const STEP_MS = 1600;

const colors = {
  original: "#087f8c",
  image: "#d16b36",
  ghost: "#8d9ba3",
  guide: "#183e54",
};

const defaultVertices: Record<number, Vec[]> = {
  1: [[2, 1]],
  3: [
    [1, 1],
    [4, 1],
    [2, 3],
  ],
  4: [
    [1, 1],
    [4, 1],
    [4, 3],
    [2, 3],
  ],
};

const shapeOptions = [
  { count: 1, label: "Titik" },
  { count: 3, label: "Segitiga" },
  { count: 4, label: "Segiempat" },
];

const typeOptions: { type: StepType; label: string }[] = [
  { type: "translation", label: "Translasi" },
  { type: "reflection", label: "Refleksi" },
  { type: "rotation", label: "Rotasi" },
  { type: "dilation", label: "Dilatasi" },
];

const axisLabels: Record<ReflectionAxis, string> = {
  x: "sumbu x",
  y: "sumbu y",
  yx: "garis y = x",
  ynx: "garis y = −x",
};

const reflectionAngles: Record<ReflectionAxis, number> = {
  x: 0,
  y: 90,
  yx: 45,
  ynx: -45,
};

const exactReflections: Record<ReflectionAxis, Mat> = {
  x: [
    [1, 0, 0],
    [0, -1, 0],
    [0, 0, 1],
  ],
  y: [
    [-1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  yx: [
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ],
  ynx: [
    [0, -1, 0],
    [-1, 0, 0],
    [0, 0, 1],
  ],
};

const mirrorEnds: Record<ReflectionAxis, [Vec, Vec]> = {
  x: [
    [-30, 0],
    [30, 0],
  ],
  y: [
    [0, -30],
    [0, 30],
  ],
  yx: [
    [-30, -30],
    [30, 30],
  ],
  ynx: [
    [-30, 30],
    [30, -30],
  ],
};

const initialSteps: Step[] = [
  { id: 1, type: "rotation", angle: 90, cx: 0, cy: 0 },
  { id: 2, type: "translation", tx: 4, ty: -1 },
];

const initialDraft: Draft = {
  tx: "3",
  ty: "1",
  axis: "y",
  angle: "90",
  rcx: "0",
  rcy: "0",
  k: "2",
  dcx: "0",
  dcy: "0",
};

/* ---------- Matematika ---------- */

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const identity = (): Mat => [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

function multiply(a: Mat, b: Mat): Mat {
  return a.map((_, i) =>
    b[0].map(
      (__, j) => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j],
    ),
  );
}

const translationMatrix = (tx: number, ty: number): Mat => [
  [1, 0, tx],
  [0, 1, ty],
  [0, 0, 1],
];

const rotationMatrix = (rad: number): Mat => [
  [Math.cos(rad), -Math.sin(rad), 0],
  [Math.sin(rad), Math.cos(rad), 0],
  [0, 0, 1],
];

const scaleMatrix = (sx: number, sy: number): Mat => [
  [sx, 0, 0],
  [0, sy, 0],
  [0, 0, 1],
];

function aboutCenter(m: Mat, cx: number, cy: number): Mat {
  return multiply(
    translationMatrix(cx, cy),
    multiply(m, translationMatrix(-cx, -cy)),
  );
}

/**
 * Matriks satu langkah pada progres lokal t (0..1).
 * Pada t = 1 hasilnya adalah matriks transformasi yang sebenarnya.
 * Refleksi dianimasikan dengan "membalik" bidang melalui skala cos(πt).
 */
function stepMatrix(step: Step, t: number): Mat {
  switch (step.type) {
    case "translation":
      return translationMatrix(step.tx * t, step.ty * t);
    case "rotation":
      return aboutCenter(
        rotationMatrix(toRadians(step.angle * t)),
        step.cx,
        step.cy,
      );
    case "dilation": {
      const s = 1 + (step.k - 1) * t;
      return aboutCenter(scaleMatrix(s, s), step.cx, step.cy);
    }
    case "reflection": {
      if (t >= 1) return exactReflections[step.axis];
      const phi = toRadians(reflectionAngles[step.axis]);
      return multiply(
        rotationMatrix(phi),
        multiply(scaleMatrix(1, Math.cos(Math.PI * t)), rotationMatrix(-phi)),
      );
    }
  }
}

/** Komposisi: langkah ke-i selesai penuh jika progress ≥ i + 1. */
function compositeAt(steps: Step[], progress: number): Mat {
  return steps.reduce(
    (m, step, i) => multiply(stepMatrix(step, clamp01(progress - i)), m),
    identity(),
  );
}

function applyMat(m: Mat, [x, y]: Vec): Vec {
  return [
    m[0][0] * x + m[0][1] * y + m[0][2],
    m[1][0] * x + m[1][1] * y + m[1][2],
  ];
}

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

const subscript = (n: number) =>
  String(n)
    .split("")
    .map((digit) => "₀₁₂₃₄₅₆₇₈₉"[Number(digit)])
    .join("");

function vertexNames(count: number) {
  return count === 1 ? ["P"] : ["A", "B", "C", "D"].slice(0, count);
}

function describeStep(step: Step): { name: string; detail: string } {
  switch (step.type) {
    case "translation":
      return {
        name: "Translasi",
        detail: `T(${formatValue(step.tx)}; ${formatValue(step.ty)})`,
      };
    case "reflection":
      return { name: "Refleksi", detail: `terhadap ${axisLabels[step.axis]}` };
    case "rotation":
      return {
        name: "Rotasi",
        detail: `${formatValue(step.angle)}° berpusat di ${formatCoord([step.cx, step.cy])}`,
      };
    case "dilation":
      return {
        name: "Dilatasi",
        detail: `faktor ${formatValue(step.k)} berpusat di ${formatCoord([step.cx, step.cy])}`,
      };
  }
}

function parseNumber(text: string, fallback = 0) {
  const value = Number(text.trim().replace(",", "."));
  return Number.isFinite(value) ? value : fallback;
}

/* ---------- Komponen kecil ---------- */

function MatrixView({ rows, label }: { rows: Mat; label: string }) {
  const description = rows
    .map((row) => row.map(formatValue).join(" "))
    .join("; ");
  return (
    <div
      className="tf-matrix"
      role="img"
      aria-label={`${label}: ${description}`}
      style={{ gridTemplateColumns: `repeat(${rows[0].length}, auto)` }}
    >
      {rows.flat().map((value, index) => (
        <span key={index}>{formatValue(value)}</span>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="tf-field">
      <span>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

/* ---------- Komponen utama ---------- */

type BoardT = ReturnType<typeof JXG.JSXGraph.initBoard>;
const HOME_BOX: [number, number, number, number] = [-10, 10, 10, -10];

/** Zoom papan dengan faktor f (<1 memperbesar) terhadap titik (ux, uy); default pusat tampilan. */
function zoomBoard(board: BoardT, f: number, ux?: number, uy?: number) {
  const [x1, y1, x2, y2] = board.getBoundingBox();
  const cx = ux ?? (x1 + x2) / 2;
  const cy = uy ?? (y1 + y2) / 2;
  const nx1 = cx + (x1 - cx) * f;
  const nx2 = cx + (x2 - cx) * f;
  const ny1 = cy + (y1 - cy) * f;
  const ny2 = cy + (y2 - cy) * f;
  const w = nx2 - nx1;
  if (!(w >= 2 && w <= 400)) return;
  board.setBoundingBox([nx1, ny1, nx2, ny2], true);
}

export function TransformationSimulation() {
  const boardId = `tf-board-${useId().replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<ReturnType<typeof JXG.JSXGraph.initBoard> | null>(
    null,
  );
  const pointsRef = useRef<JXG.Point[]>([]);

  const [shape, setShape] = useStoredSimulationState("transformation.shape", 3);
  const [vertices, setVertices] = useStoredSimulationState<Vec[]>(
    "transformation.vertices",
    defaultVertices[3].map((v) => [...v]),
  );
  const [steps, setSteps] = useStoredSimulationState(
    "transformation.steps",
    initialSteps,
  );
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [speed, setSpeed] = useStoredSimulationState("transformation.speed", 1);
  const [snap, setSnap] = useStoredSimulationState("transformation.snap", true);
  const [draftType, setDraftType] = useStoredSimulationState<StepType>(
    "transformation.draft-type",
    "rotation",
  );
  const [draft, setDraft] = useStoredSimulationState<Draft>(
    "transformation.draft",
    initialDraft,
  );
  const [sampleIndex, setSampleIndex] = useStoredSimulationState(
    "transformation.sample-index",
    0,
  );

  const verticesRef = useRef<Vec[]>(vertices);
  const stepsRef = useRef<Step[]>(steps);
  const progressRef = useRef(0);
  const speedRef = useRef(speed);
  const snapRef = useRef(snap);
  const nextId = useRef(
    steps.reduce((next, step) => Math.max(next, step.id + 1), 3),
  );

  const setProgressValue = (value: number) => {
    const safe = Number.isFinite(value)
      ? Math.min(Math.max(0, value), stepsRef.current.length)
      : 0;
    progressRef.current = safe;
    setProgress(safe);
    boardRef.current?.update();
  };

  const updateSteps = (next: Step[]) => {
    stepsRef.current = next;
    setSteps(next);
    if (next.length === 0) setPlaying(false);
    setProgressValue(Math.min(progressRef.current, next.length));
  };

  const setField = (key: keyof Draft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const addStep = () => {
    if (stepsRef.current.length >= MAX_STEPS) return;
    const id = nextId.current++;
    let step: Step;
    switch (draftType) {
      case "translation":
        step = {
          id,
          type: "translation",
          tx: parseNumber(draft.tx),
          ty: parseNumber(draft.ty),
        };
        break;
      case "reflection":
        step = { id, type: "reflection", axis: draft.axis };
        break;
      case "rotation":
        step = {
          id,
          type: "rotation",
          angle: parseNumber(draft.angle),
          cx: parseNumber(draft.rcx),
          cy: parseNumber(draft.rcy),
        };
        break;
      default:
        step = {
          id,
          type: "dilation",
          k: parseNumber(draft.k, 1),
          cx: parseNumber(draft.dcx),
          cy: parseNumber(draft.dcy),
        };
    }
    updateSteps([...stepsRef.current, step]);
  };

  const removeStep = (id: number) =>
    updateSteps(stepsRef.current.filter((step) => step.id !== id));

  const changeShape = (count: number) => {
    if (count === shape) return;
    const next = defaultVertices[count].map((v) => [...v] as Vec);
    verticesRef.current = next;
    setVertices(next);
    setShape(count);
  };

  const resetPoints = () => {
    const next = defaultVertices[shape].map((v) => [...v] as Vec);
    verticesRef.current = next;
    setVertices(next);
    pointsRef.current.forEach((point, i) =>
      point.setPosition(JXG.COORDS_BY_USER, next[i]),
    );
    boardRef.current?.update();
  };

  const resetAll = () => {
    setPlaying(false);
    resetPoints();
    stepsRef.current = initialSteps;
    setSteps(initialSteps);
    setDraft(initialDraft);
    setProgressValue(0);
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    const total = stepsRef.current.length;
    if (total === 0) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setProgressValue(total);
      return;
    }
    if (progressRef.current >= total) setProgressValue(0);
    setPlaying(true);
  };

  /* Tampilan: zoom, reset, layar penuh */
  const zoomIn = () => {
    if (boardRef.current) zoomBoard(boardRef.current, 0.8);
  };
  const zoomOut = () => {
    if (boardRef.current) zoomBoard(boardRef.current, 1.25);
  };
  const resetView = () => {
    boardRef.current?.setBoundingBox(HOME_BOX, true);
  };
  const toggleFullscreen = () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  useEffect(() => {
    const onChange = () =>
      setIsFull(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* Papan JSXGraph */
  useEffect(() => {
    const count = shape;
    const names = vertexNames(count);
    const start = verticesRef.current;

    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: [-10, 10, 10, -10],
      axis: false,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: true,
      pan: { enabled: true, needShift: false, needTwoFingers: true },
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
      insertTicks: true,
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

    /* Titik asal (bisa digeser) */
    const originals = names.map(
      (name, i) =>
        board.create("point", [start[i][0], start[i][1]], {
          name,
          withLabel: true,
          size: 5,
          fillColor: colors.original,
          strokeColor: "#ffffff",
          strokeWidth: 2,
          snapToGrid: snapRef.current,
          snapSizeX: 1,
          snapSizeY: 1,
          highlight: false,
          label: { offset: [8, 8], fontSize: 12, strokeColor: colors.original },
        }) as JXG.Point,
    );
    pointsRef.current = originals;

    const originalPolygon =
      count >= 3
        ? board.create("polygon", originals, {
            hasInnerPoints: true,
            fillColor: colors.original,
            fillOpacity: 0.12,
            highlight: false,
            borders: {
              strokeColor: colors.original,
              strokeWidth: 2.5,
              highlight: false,
            },
          })
        : null;

    /* Posisi bayangan pada progres saat ini */
    const originOf = (i: number): Vec => [originals[i].X(), originals[i].Y()];
    const imagePos = (i: number): Vec =>
      applyMat(compositeAt(stepsRef.current, progressRef.current), originOf(i));

    /* Posisi hasil antara (setelah langkah ke-k selesai) */
    const ghostPos = (k: number, i: number): Vec => {
      const list = stepsRef.current;
      if (k >= list.length || progressRef.current < k) return [NaN, NaN];
      return applyMat(compositeAt(list, k), originOf(i));
    };

    /* Jejak hasil antara */
    for (let k = 1; k < MAX_STEPS; k += 1) {
      for (let i = 0; i < count; i += 1) {
        board.create(
          "point",
          [() => ghostPos(k, i)[0], () => ghostPos(k, i)[1]],
          {
            name: "",
            withLabel: false,
            size: 3,
            fillColor: colors.ghost,
            strokeColor: "#ffffff",
            strokeWidth: 1,
            fixed: true,
            highlight: false,
          },
        );
      }
      if (count >= 3) {
        const outline = board.create("curve", [[0], [0]], {
          strokeColor: colors.ghost,
          strokeWidth: 1.5,
          dash: 2,
          highlight: false,
          fixed: true,
        }) as unknown as DataCurve;
        outline.updateDataArray = () => {
          const points = originals.map((_, i) => ghostPos(k, i));
          if (Number.isNaN(points[0][0])) {
            outline.dataX = [NaN];
            outline.dataY = [NaN];
            return;
          }
          outline.dataX = [...points.map((p) => p[0]), points[0][0]];
          outline.dataY = [...points.map((p) => p[1]), points[0][1]];
        };
      }
    }

    if (count === 1) {
      const trail = board.create("curve", [[0], [0]], {
        strokeColor: colors.ghost,
        strokeWidth: 1.5,
        dash: 2,
        highlight: false,
        fixed: true,
      }) as unknown as DataCurve;
      trail.updateDataArray = () => {
        const path: Vec[] = [originOf(0)];
        for (let k = 1; k < MAX_STEPS; k += 1) {
          const g = ghostPos(k, 0);
          if (!Number.isNaN(g[0])) path.push(g);
        }
        path.push(imagePos(0));
        trail.dataX = path.map((p) => p[0]);
        trail.dataY = path.map((p) => p[1]);
      };
    }

    /* Bayangan */
    const images = names.map(
      (name, i) =>
        board.create("point", [() => imagePos(i)[0], () => imagePos(i)[1]], {
          name: `${name}′`,
          withLabel: true,
          size: 4,
          fillColor: colors.image,
          strokeColor: "#ffffff",
          strokeWidth: 1.5,
          fixed: true,
          highlight: false,
          label: { offset: [8, -14], fontSize: 12, strokeColor: colors.image },
        }) as JXG.Point,
    );
    if (count >= 3) {
      board.create("polygon", images, {
        hasInnerPoints: false,
        fixed: true,
        fillColor: colors.image,
        fillOpacity: 0.16,
        highlight: false,
        borders: {
          strokeColor: colors.image,
          strokeWidth: 2.5,
          highlight: false,
          fixed: true,
        },
      });
    }

    /* Penunjuk langkah aktif: cermin, pusat, dan vektor translasi */
    const guideStep = (): Step | null => {
      const list = stepsRef.current;
      if (list.length === 0) return null;
      return list[guideIndex()] ?? null;
    };
    function guideIndex() {
      return Math.max(
        0,
        Math.min(Math.floor(progressRef.current), stepsRef.current.length - 1),
      );
    }

    const mirrorCoord = (end: 0 | 1, coord: 0 | 1) => () => {
      const step = guideStep();
      return step && step.type === "reflection"
        ? mirrorEnds[step.axis][end][coord]
        : 1000 + end;
    };
    board.create(
      "segment",
      [
        [mirrorCoord(0, 0), mirrorCoord(0, 1)],
        [mirrorCoord(1, 0), mirrorCoord(1, 1)],
      ],
      {
        strokeColor: colors.guide,
        strokeWidth: 2,
        dash: 3,
        highlight: false,
        fixed: true,
      },
    );

    const centerCoord = (coord: "cx" | "cy") => () => {
      const step = guideStep();
      return step && (step.type === "rotation" || step.type === "dilation")
        ? step[coord]
        : Number.NaN;
    };
    board.create("point", [centerCoord("cx"), centerCoord("cy")], {
      name: "pusat",
      withLabel: true,
      size: 5,
      face: "cross",
      fillColor: colors.guide,
      strokeColor: colors.guide,
      strokeWidth: 2,
      fixed: true,
      highlight: false,
      label: { offset: [8, -14], fontSize: 11, strokeColor: colors.guide },
    });

    const vectorEnd = (which: "from" | "to", coord: 0 | 1) => () => {
      const step = guideStep();
      if (!step || step.type !== "translation")
        return 1000 + (which === "to" ? 1 : 0);
      const from = applyMat(
        compositeAt(stepsRef.current, guideIndex()),
        originOf(0),
      );
      const to = imagePos(0);
      if (Math.hypot(to[0] - from[0], to[1] - from[1]) < 1e-6) {
        return 1000 + (which === "to" ? 1 : 0);
      }
      return (which === "from" ? from : to)[coord];
    };
    board.create(
      "segment",
      [
        [vectorEnd("from", 0), vectorEnd("from", 1)],
        [vectorEnd("to", 0), vectorEnd("to", 1)],
      ],
      {
        strokeColor: colors.guide,
        strokeWidth: 2,
        lastArrow: { type: 2, size: 6 },
        highlight: false,
        fixed: true,
      },
    );

    /* Sinkronisasi koordinat saat titik/poligon digeser */
    const syncVertices = () => {
      const next = originals.map(
        (p) => [cleanNumber(p.X()), cleanNumber(p.Y())] as Vec,
      );
      verticesRef.current = next;
      setVertices(next);
    };
    originals.forEach((point) => point.on("drag", syncVertices));
    if (originalPolygon) {
      originalPolygon.on("drag", syncVertices);
      originalPolygon.on("up", () => {
        if (snapRef.current) {
          originals.forEach((p) =>
            p.setPosition(JXG.COORDS_BY_USER, [
              Math.round(p.X()),
              Math.round(p.Y()),
            ]),
          );
          board.update();
        }
        syncVertices();
      });
    }

    /* Zoom roda mouse ke posisi kursor */
    const wheelEl = containerRef.current;
    const onWheel = (e: WheelEvent) => {
      if (!wheelEl) return;
      e.preventDefault();
      let delta = e.deltaY || e.deltaX;
      if (e.deltaMode === 1) delta *= 33;
      if (e.deltaMode === 2) delta *= 400;
      const f = Math.exp(Math.max(-120, Math.min(120, delta)) * 0.0015);
      const r = wheelEl.getBoundingClientRect();
      const [x1, y1, x2, y2] = board.getBoundingBox();
      const ux = x1 + ((e.clientX - r.left) / r.width) * (x2 - x1);
      const uy = y1 - ((e.clientY - r.top) / r.height) * (y1 - y2);
      zoomBoard(board, f, ux, uy);
    };
    wheelEl?.addEventListener("wheel", onWheel, { passive: false });

    const observer = new ResizeObserver(() => {
      const el = containerRef.current;
      if (el && el.clientWidth > 0 && el.clientHeight > 0) {
        board.resizeContainer(el.clientWidth, el.clientHeight, true);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      wheelEl?.removeEventListener("wheel", onWheel);
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
      pointsRef.current = [];
    };
  }, [boardId, shape]);

  /* Tempel ke grid */
  useEffect(() => {
    snapRef.current = snap;
    pointsRef.current.forEach((point) =>
      point.setAttribute({ snapToGrid: snap }),
    );
  }, [snap, shape]);

  /* Animasi */
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      /* Timestamp rAF bisa lebih kecil dari performance.now() pada frame
         pertama sehingga delta negatif; jepit agar progres tidak mundur. */
      const delta = Math.max(0, Math.min(now - last, 64));
      last = now;
      const total = stepsRef.current.length;
      const next = Math.max(
        0,
        Math.min(
          total,
          progressRef.current + (delta / STEP_MS) * speedRef.current,
        ),
      );
      progressRef.current = next;
      setProgress(next);
      boardRef.current?.update();
      if (next >= total) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  /* ---------- Turunan untuk tampilan ---------- */

  const total = steps.length;
  const names = vertexNames(shape);
  const currentMatrix = compositeAt(steps, progress);
  const finalMatrix = compositeAt(steps, total);
  const activeIndex =
    total === 0
      ? -1
      : Math.max(0, Math.min(Math.floor(progress) || 0, total - 1));
  const isDone = total > 0 && progress >= total;
  const sample = Math.min(sampleIndex, shape - 1);
  const sampleStart: Vec = vertices[sample] ?? [0, 0];
  const sampleEnd = applyMat(finalMatrix, sampleStart);
  const compositeFormula =
    total === 0
      ? "M = I"
      : `M = ${steps
          .map((_, i) => `M${subscript(i + 1)}`)
          .reverse()
          .join(" · ")}`;

  let caption = "Belum ada transformasi. Tambahkan langkah di panel kanan.";
  if (total > 0 && steps[activeIndex]) {
    const info = describeStep(steps[activeIndex]);
    caption = isDone
      ? `Selesai: ${total} langkah diterapkan.`
      : `Langkah ${activeIndex + 1} dari ${total}: ${info.name} ${info.detail}`;
  }

  const boardEl = (
    <section className="tf-board-panel" aria-labelledby="tf-board-title">
      <div className="tf-board-heading">
        <h3 id="tf-board-title">Bidang koordinat</h3>
        <div className="tf-toolbar">
          <div className="tf-zoom" role="group" aria-label="Zoom tampilan">
            <button
              type="button"
              onClick={zoomIn}
              aria-label="Perbesar"
              title="Perbesar"
            >
              +
            </button>
            <button
              type="button"
              onClick={zoomOut}
              aria-label="Perkecil"
              title="Perkecil"
            >
              −
            </button>
            <button type="button" onClick={resetView} title="Tampilan awal">
              Reset
            </button>
          </div>
          <div className="tf-zoom" role="group" aria-label="Alat">
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Layar penuh"
            >
              {isFull ? "Tutup layar penuh" : "Layar penuh"}
            </button>
          </div>
        </div>
      </div>
      <div
        className="tf-board"
        id={boardId}
        ref={containerRef}
        aria-label="Bidang koordinat interaktif. Seret titik atau poligon asal untuk mengubah posisinya; bayangan hasil transformasi berwarna oranye."
      />
      <div className="tf-legend" aria-label="Legenda grafik">
        <span>
          <i className="legend-original" /> bangun asal
        </span>
        <span>
          <i className="legend-image" /> bayangan
        </span>
        <span>
          <i className="legend-ghost" /> hasil antara
        </span>
        <span>
          <i className="legend-guide" /> cermin / pusat / vektor
        </span>
      </div>
      <p className="tf-hint tf-board-hint">
        Seret titik atau poligon biru · tahan klik kiri pada ruang kosong untuk
        menggeser tampilan · roda mouse untuk zoom.
      </p>
      <div className="tf-playback">
        <button
          className="tf-play-button"
          type="button"
          onClick={togglePlay}
          disabled={total === 0}
        >
          {playing ? "Jeda" : isDone ? "Putar ulang" : "Mainkan"}
        </button>
        <div className="tf-progress">
          <label htmlFor="tf-progress-slider">Progres animasi</label>
          <span className="tf-progress-value" aria-hidden="true">
            {total === 0 ? "0%" : `${Math.round((progress / total) * 100)}%`}
          </span>
          <input
            id="tf-progress-slider"
            type="range"
            min="0"
            max={total}
            step="0.01"
            value={progress}
            disabled={total === 0}
            aria-valuetext={caption}
            onChange={(event) => {
              setPlaying(false);
              setProgressValue(Number(event.currentTarget.value));
            }}
          />
        </div>
        <label className="tf-speed">
          <span>Kecepatan</span>
          <select
            value={speed}
            onChange={(event) => {
              const value = Number(event.currentTarget.value);
              speedRef.current = value;
              setSpeed(value);
            }}
          >
            <option value={0.5}>0,5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      </div>
      <p className="tf-caption" aria-live="polite">
        {caption}
      </p>
    </section>
  );

  const sideEl = (
    <section className="tf-side" aria-label="Pengaturan transformasi">
      <div className="tf-panel">
        <h3>Bangun asal</h3>
        <div className="tf-segmented" role="group" aria-label="Bentuk bangun">
          {shapeOptions.map((option) => (
            <button
              key={option.count}
              type="button"
              aria-pressed={shape === option.count}
              onClick={() => changeShape(option.count)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="tf-check">
          <input
            type="checkbox"
            checked={snap}
            onChange={(event) => setSnap(event.currentTarget.checked)}
          />
          Tempel ke titik bilangan bulat
        </label>
      </div>

      <div className="tf-panel">
        <h3>
          Urutan transformasi{" "}
          <small>
            ({total}/{MAX_STEPS})
          </small>
        </h3>
        {total === 0 ? (
          <p className="tf-empty">Belum ada langkah.</p>
        ) : (
          <ol className="tf-steps">
            {steps.map((step, i) => {
              const info = describeStep(step);
              return (
                <li
                  key={step.id}
                  className={i === activeIndex ? "is-active" : undefined}
                >
                  <span className="tf-step-index">{i + 1}</span>
                  <button
                    type="button"
                    className="tf-step-label"
                    title="Tampilkan hasil sampai langkah ini"
                    onClick={() => {
                      setPlaying(false);
                      setProgressValue(i + 1);
                    }}
                  >
                    <b>{info.name}</b> {info.detail}
                  </button>
                  <button
                    type="button"
                    className="tf-step-remove"
                    aria-label={`Hapus langkah ${i + 1}: ${info.name}`}
                    onClick={() => removeStep(step.id)}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="tf-panel tf-builder">
        <h3>Tambah langkah</h3>
        <div
          className="tf-segmented"
          role="group"
          aria-label="Jenis transformasi"
        >
          {typeOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              aria-pressed={draftType === option.type}
              onClick={() => setDraftType(option.type)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="tf-fields">
          {draftType === "translation" && (
            <>
              <Field
                label="Geser x"
                value={draft.tx}
                onChange={(v) => setField("tx", v)}
              />
              <Field
                label="Geser y"
                value={draft.ty}
                onChange={(v) => setField("ty", v)}
              />
            </>
          )}
          {draftType === "reflection" && (
            <label className="tf-field tf-field-wide">
              <span>Cermin</span>
              <select
                value={draft.axis}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    axis: event.currentTarget.value as ReflectionAxis,
                  }))
                }
              >
                {(Object.keys(axisLabels) as ReflectionAxis[]).map((axis) => (
                  <option key={axis} value={axis}>
                    {axisLabels[axis]}
                  </option>
                ))}
              </select>
            </label>
          )}
          {draftType === "rotation" && (
            <>
              <Field
                label="Sudut (°)"
                value={draft.angle}
                onChange={(v) => setField("angle", v)}
              />
              <Field
                label="Pusat x"
                value={draft.rcx}
                onChange={(v) => setField("rcx", v)}
              />
              <Field
                label="Pusat y"
                value={draft.rcy}
                onChange={(v) => setField("rcy", v)}
              />
            </>
          )}
          {draftType === "dilation" && (
            <>
              <Field
                label="Faktor k"
                value={draft.k}
                onChange={(v) => setField("k", v)}
              />
              <Field
                label="Pusat x"
                value={draft.dcx}
                onChange={(v) => setField("dcx", v)}
              />
              <Field
                label="Pusat y"
                value={draft.dcy}
                onChange={(v) => setField("dcy", v)}
              />
            </>
          )}
        </div>
        {draftType === "rotation" && (
          <p className="tf-hint">Sudut positif berlawanan arah jarum jam.</p>
        )}
        <div className="tf-builder-actions">
          <button
            type="button"
            className="tf-add-button"
            onClick={addStep}
            disabled={total >= MAX_STEPS}
          >
            Tambah langkah
          </button>
          <button
            type="button"
            className="tf-reset-button"
            onClick={() => updateSteps([])}
            disabled={total === 0}
          >
            Kosongkan
          </button>
        </div>
        {total >= MAX_STEPS && (
          <p className="tf-hint">Maksimal {MAX_STEPS} langkah.</p>
        )}
      </div>

      <div className="tf-reset-row">
        <button type="button" className="tf-reset-button" onClick={resetPoints}>
          Posisi awal bangun
        </button>
        <button type="button" className="tf-reset-button" onClick={resetAll}>
          Atur ulang semua
        </button>
      </div>
    </section>
  );

  const coordsEl = (
    <section className="tf-panel tf-wide" aria-labelledby="tf-coords-title">
      <h3 id="tf-coords-title">Koordinat titik</h3>
      <div className="tf-table-wrap">
        <table className="tf-table">
          <thead>
            <tr>
              <th scope="col">Titik</th>
              <th scope="col">Awal</th>
              <th scope="col">Saat ini</th>
              <th scope="col">Hasil akhir</th>
            </tr>
          </thead>
          <tbody>
            {names.map((name, i) => {
              const origin: Vec = vertices[i] ?? [0, 0];
              return (
                <tr key={name}>
                  <th scope="row">
                    {name} → {name}′
                  </th>
                  <td className="cell-original">{formatCoord(origin)}</td>
                  <td className="cell-current">
                    {formatCoord(applyMat(currentMatrix, origin))}
                  </td>
                  <td className="cell-image">
                    {formatCoord(applyMat(finalMatrix, origin))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );

  const matrixEl = (
    <section className="tf-panel tf-wide" aria-labelledby="tf-matrix-title">
      <h3 id="tf-matrix-title">Matriks transformasi</h3>
      <p className="tf-hint">
        Dipakai matriks homogen 3 × 3 agar translasi, refleksi, rotasi, dan
        dilatasi dapat ditulis dalam satu bentuk. Kolom ketiga menyimpan
        pergeseran.
      </p>
      <div className="tf-matrix-grid">
        {steps.map((step, i) => {
          const info = describeStep(step);
          return (
            <article
              key={step.id}
              className={`tf-matrix-card${i === activeIndex ? " is-active" : ""}`}
            >
              <h4>
                M{subscript(i + 1)} · {info.name}
              </h4>
              <p>{info.detail}</p>
              <MatrixView
                rows={stepMatrix(step, 1)}
                label={`Matriks M${i + 1}`}
              />
            </article>
          );
        })}
        <article className="tf-matrix-card tf-composite">
          <h4>Matriks komposisi</h4>
          <p>
            {compositeFormula}
            {total > 1 && " (urutan dibaca dari kanan ke kiri)"}
          </p>
          <MatrixView rows={finalMatrix} label="Matriks komposisi" />
        </article>
      </div>

      <div className="tf-sample">
        <div className="tf-sample-head">
          <h4>Contoh perhitungan</h4>
          {shape > 1 && (
            <label className="tf-speed">
              <span>Titik</span>
              <select
                value={sample}
                onChange={(event) =>
                  setSampleIndex(Number(event.currentTarget.value))
                }
              >
                {names.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="tf-equation">
          <MatrixView
            rows={[[sampleEnd[0]], [sampleEnd[1]], [1]]}
            label={`Koordinat ${names[sample]}′`}
          />
          <span className="tf-operator">=</span>
          <MatrixView rows={finalMatrix} label="Matriks komposisi" />
          <span className="tf-operator">×</span>
          <MatrixView
            rows={[[sampleStart[0]], [sampleStart[1]], [1]]}
            label={`Koordinat ${names[sample]}`}
          />
        </div>
        <p className="tf-hint">
          {names[sample]}
          {formatCoord(sampleStart)} → {names[sample]}′{formatCoord(sampleEnd)}
        </p>
      </div>
    </section>
  );

  const insightsEl = (
    <ul className="tf-insights">
      <li>
        <strong>Translasi</strong> menggeser setiap titik sejauh vektor (a, b):
        (x, y) → (x + a, y + b).
      </li>
      <li>
        <strong>Refleksi</strong> mencerminkan titik terhadap garis cermin;
        terhadap sumbu x: (x, y) → (x, −y), terhadap sumbu y: (x, y) → (−x, y).
      </li>
      <li>
        <strong>Rotasi</strong> sebesar θ berpusat di O: (x, y) → (x cos θ − y
        sin θ, x sin θ + y cos θ).
      </li>
      <li>
        <strong>Dilatasi</strong> faktor k berpusat di O: (x, y) → (kx, ky).
        Jika |k| &gt; 1 bangun membesar, jika |k| &lt; 1 mengecil, dan jika k
        negatif bangun berbalik.
      </li>
      <li>
        <strong>Komposisi</strong> bergantung pada urutan: M = Mₙ · … · M₂ · M₁.
        Coba tukar urutan langkah untuk melihat hasil yang berbeda.
      </li>
    </ul>
  );

  return (
    <div className="transformation-simulation" ref={rootRef}>
      <div className="tf-main">
        {boardEl}
        {isFull ? (
          <div className="tf-rightcol">
            {sideEl}
            {coordsEl}
            {matrixEl}
            {insightsEl}
          </div>
        ) : (
          sideEl
        )}
      </div>

      {!isFull && coordsEl}
      {!isFull && matrixEl}
      {!isFull && insightsEl}
    </div>
  );
}
