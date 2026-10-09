import { useEffect, useId, useRef, useState } from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./VectorSimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useGraphAppearance } from "./simulationBoard";
import { useStoredSimulationState } from "./useStoredSimulationState";

/* ---------- Tipe ---------- */

type Vec = [number, number];
type ProjectionMode = "a" | "b" | "off";
type FieldKey = "a1" | "a2" | "b1" | "b2";
type Fields = Record<FieldKey, string>;

type DataCurve = {
  dataX: number[];
  dataY: number[];
  updateDataArray: () => void;
};

/* ---------- Konstanta ---------- */

const EPS = 1e-9;
const LIMIT = 9.5;
const ARC_STEPS = 48;
const INITIAL_BOX: [number, number, number, number] = [-10, 10, 10, -10];

const colors = {
  a: "#087f8c",
  b: "#d16b36",
  sum: "#183e54",
  proj: "#c08a00",
};

const defaultA: Vec = [5, 1];
const defaultB: Vec = [2, 4];

const presets: { label: string; a: Vec; b: Vec }[] = [
  { label: "Lancip", a: [5, 1], b: [2, 4] },
  { label: "Tegak lurus", a: [4, 2], b: [-2, 4] },
  { label: "Tumpul", a: [4, 1], b: [-4, 3] },
  { label: "Searah", a: [4, 2], b: [2, 1] },
  { label: "Berlawanan", a: [4, 2], b: [-2, -1] },
];

const projectionOptions: { mode: ProjectionMode; label: string }[] = [
  { mode: "a", label: "a pada b" },
  { mode: "b", label: "b pada a" },
  { mode: "off", label: "Sembunyikan" },
];

/* ---------- Matematika ---------- */

const toDegrees = (radians: number) => (radians * 180) / Math.PI;
const length = ([x, y]: Vec) => Math.hypot(x, y);
const dotOf = (u: Vec, v: Vec) => u[0] * v[0] + u[1] * v[1];

/** Proyeksi `vec` pada `onto`; null jika `onto` adalah vektor nol. */
function projectOnto(vec: Vec, onto: Vec) {
  const lo = length(onto);
  if (lo < EPS) return null;
  const dot = dotOf(vec, onto);
  const k = dot / (lo * lo);
  const vector: Vec = [k * onto[0], k * onto[1]];
  return { scalar: dot / lo, vector, k };
}

function analyze(a: Vec, b: Vec) {
  const la = length(a);
  const lb = length(b);
  const dot = dotOf(a, b);
  const defined = la > EPS && lb > EPS;
  const cos = defined ? Math.max(-1, Math.min(1, dot / (la * lb))) : Number.NaN;
  return {
    la,
    lb,
    dot,
    defined,
    cos,
    angle: defined ? toDegrees(Math.acos(cos)) : Number.NaN,
    sum: [a[0] + b[0], a[1] + b[1]] as Vec,
    diff: [a[0] - b[0], a[1] - b[1]] as Vec,
    aOnB: projectOnto(a, b),
    bOnA: projectOnto(b, a),
  };
}

function relationText(info: ReturnType<typeof analyze>) {
  if (!info.defined) return "Salah satu vektor adalah vektor nol.";
  if (Math.abs(info.dot) < 1e-9) return "a · b = 0: kedua vektor tegak lurus.";
  if (info.cos > 1 - 1e-9) return "a · b > 0: kedua vektor searah (θ = 0°).";
  if (info.cos < -1 + 1e-9) {
    return "a · b < 0: kedua vektor berlawanan arah (θ = 180°).";
  }
  if (info.dot > 0) return "a · b > 0: sudut antara kedua vektor lancip.";
  return "a · b < 0: sudut antara kedua vektor tumpul.";
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
const par = (value: number) =>
  value < 0 ? `(${formatValue(value)})` : formatValue(value);

const toField = (value: number) => String(cleanNumber(value)).replace(".", ",");

const toFields = (a: Vec, b: Vec): Fields => ({
  a1: toField(a[0]),
  a2: toField(a[1]),
  b1: toField(b[0]),
  b2: toField(b[1]),
});

/** Teks angka valid → angka; selain itu null (mis. "−" yang belum selesai). */
function parseField(text: string): number | null {
  const normalized = text.trim().replace("−", "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value)
    ? Math.min(LIMIT, Math.max(-LIMIT, value))
    : null;
}

/* ---------- Komponen kecil ---------- */

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
    <label className="vs-field">
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

export function VectorSimulation() {
  const boardId = `vs-board-${useId().replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nativeFullscreenRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const boardRef = useRef<ReturnType<typeof JXG.JSXGraph.initBoard> | null>(
    null,
  );
  const { appearance, onStep } = useGraphAppearance([boardRef]);
  const pointsRef = useRef<JXG.Point[]>([]);

  const [vecA, setVecA] = useStoredSimulationState<Vec>("vector.a", defaultA);
  const [vecB, setVecB] = useStoredSimulationState<Vec>("vector.b", defaultB);
  const [fields, setFields] = useStoredSimulationState<Fields>(
    "vector.fields",
    toFields(defaultA, defaultB),
  );
  const [snap, setSnap] = useStoredSimulationState("vector.snap", true);
  const [showSum, setShowSum] = useStoredSimulationState(
    "vector.show-sum",
    true,
  );
  const [showAngle, setShowAngle] = useStoredSimulationState(
    "vector.show-angle",
    true,
  );
  const [projection, setProjection] = useStoredSimulationState<ProjectionMode>(
    "vector.projection",
    "a",
  );

  const vectorsRef = useRef<{ a: Vec; b: Vec }>({ a: vecA, b: vecB });
  const showSumRef = useRef(showSum);
  const showAngleRef = useRef(showAngle);
  const projectionRef = useRef(projection);
  const snapRef = useRef(snap);

  const refresh = () => boardRef.current?.update();

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

  /** Menetapkan vektor dari luar papan (contoh, reset, kolom angka). */
  const setVectors = (a: Vec, b: Vec, syncFields: boolean) => {
    vectorsRef.current = { a, b };
    setVecA(a);
    setVecB(b);
    if (syncFields) setFields(toFields(a, b));
    pointsRef.current[0]?.setPosition(JXG.COORDS_BY_USER, a);
    pointsRef.current[1]?.setPosition(JXG.COORDS_BY_USER, b);
    refresh();
  };

  const changeField = (key: FieldKey, text: string) => {
    setFields((current) => ({ ...current, [key]: text }));
    const value = parseField(text);
    if (value === null) return;
    const { a, b } = vectorsRef.current;
    const nextA: Vec = [...a];
    const nextB: Vec = [...b];
    if (key === "a1") nextA[0] = value;
    else if (key === "a2") nextA[1] = value;
    else if (key === "b1") nextB[0] = value;
    else nextB[1] = value;
    setVectors(nextA, nextB, false);
  };

  const toggleSum = (checked: boolean) => {
    showSumRef.current = checked;
    setShowSum(checked);
    refresh();
  };

  const toggleAngle = (checked: boolean) => {
    showAngleRef.current = checked;
    setShowAngle(checked);
    refresh();
  };

  const selectProjection = (mode: ProjectionMode) => {
    projectionRef.current = mode;
    setProjection(mode);
    refresh();
  };

  const resetAll = () => {
    showSumRef.current = true;
    setShowSum(true);
    showAngleRef.current = true;
    setShowAngle(true);
    projectionRef.current = "a";
    setProjection("a");
    setVectors([...defaultA], [...defaultB], true);
  };

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
      minTicksDistance: 36,
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

    /* Ujung vektor a dan b (bisa digeser) */
    const start = vectorsRef.current;
    const makePoint = (name: string, at: Vec, color: string) =>
      board.create("point", [at[0], at[1]], {
        name,
        withLabel: true,
        size: 3,
        fillColor: color,
        strokeColor: "#ffffff",
        strokeWidth: 2,
        snapToGrid: snapRef.current,
        snapSizeX: 1,
        snapSizeY: 1,
        highlight: false,
        label: { offset: [10, 10], fontSize: 14, strokeColor: color },
      }) as JXG.Point;
    const pa = makePoint("a", start.a, colors.a);
    const pb = makePoint("b", start.b, colors.b);
    pointsRef.current = [pa, pb];

    const A = (): Vec => [pa.X(), pa.Y()];
    const B = (): Vec => [pb.X(), pb.Y()];

    /* Kurva berdasarkan titik-titik; NaN menyembunyikannya */
    const makeCurve = (
      strokeColor: string,
      strokeWidth: number,
      dash: number,
      build: () => Vec[] | null,
    ) => {
      const curve = board.create("curve", [[0], [0]], {
        strokeColor,
        strokeWidth,
        dash,
        highlight: false,
        fixed: true,
      }) as unknown as DataCurve;
      curve.updateDataArray = () => {
        const points = build();
        if (
          !points ||
          points.length === 0 ||
          points.some((p) => !Number.isFinite(p[0]) || !Number.isFinite(p[1]))
        ) {
          curve.dataX = [Number.NaN];
          curve.dataY = [Number.NaN];
          return;
        }
        curve.dataX = points.map((p) => p[0]);
        curve.dataY = points.map((p) => p[1]);
      };
      return curve;
    };

    /* Penjumlahan: jajar genjang dan vektor a + b */
    const sumVisible = () => showSumRef.current;
    const sumPoint = (): Vec => {
      const a = A();
      const b = B();
      return [a[0] + b[0], a[1] + b[1]];
    };

    makeCurve(colors.sum, 1.8, 3, () =>
      sumVisible() ? [A(), sumPoint(), B()] : null,
    );

    const sumEnd = (coord: 0 | 1) => () =>
      sumVisible() && length(sumPoint()) > 1e-6 ? sumPoint()[coord] : 1000;
    board.create(
      "segment",
      [
        [0, 0],
        [sumEnd(0), sumEnd(1)],
      ],
      {
        strokeColor: colors.sum,
        strokeWidth: 3.5,
        lastArrow: { type: 2, size: 0.5 },
        highlight: false,
        fixed: true,
      },
    );
    board.create(
      "text",
      [
        () => (sumVisible() ? sumPoint()[0] + 0.3 : 1000),
        () => (sumVisible() ? sumPoint()[1] + 0.6 : 1000),
        "a + b",
      ],
      {
        fontSize: 13,
        strokeColor: colors.sum,
        highlight: false,
        fixed: true,
      },
    );

    /* Proyeksi */
    const projectionInfo = () => {
      const mode = projectionRef.current;
      if (mode === "off") return null;
      const vec = mode === "a" ? A() : B();
      const onto = mode === "a" ? B() : A();
      const result = projectOnto(vec, onto);
      if (!result) return null;
      return { vec, onto, foot: result.vector, k: result.k };
    };

    makeCurve(colors.proj, 1.2, 3, () => {
      const info = projectionInfo();
      if (!info) return null;
      const lo = length(info.onto);
      const u: Vec = [info.onto[0] / lo, info.onto[1] / lo];
      // Garis proyeksi dibuat cukup panjang untuk area yang terlihat.
      const reach =
        2 * Math.max(...board.getBoundingBox().map((v) => Math.abs(v))) + 10;
      return [
        [-reach * u[0], -reach * u[1]],
        [reach * u[0], reach * u[1]],
      ];
    });

    makeCurve(colors.proj, 2, 2, () => {
      const info = projectionInfo();
      if (!info) return null;
      return Math.hypot(
        info.vec[0] - info.foot[0],
        info.vec[1] - info.foot[1],
      ) > 1e-6
        ? [info.vec, info.foot]
        : null;
    });

    /* Tanda siku-siku di kaki proyeksi */
    makeCurve(colors.proj, 1.5, 0, () => {
      const info = projectionInfo();
      if (!info) return null;
      const lo = length(info.onto);
      const tip: Vec = [info.vec[0] - info.foot[0], info.vec[1] - info.foot[1]];
      const lt = length(tip);
      const lf = length(info.foot);
      if (lt < 1e-6 || lf < 1e-6) return null;
      const u: Vec = [info.onto[0] / lo, info.onto[1] / lo];
      const w: Vec = [tip[0] / lt, tip[1] / lt];
      const side = Math.min(0.5, lf * 0.4, lt * 0.4);
      const sign = info.k >= 0 ? -1 : 1;
      const d: Vec = [sign * u[0], sign * u[1]];
      const f = info.foot;
      return [
        [f[0] + side * d[0], f[1] + side * d[1]],
        [f[0] + side * (d[0] + w[0]), f[1] + side * (d[1] + w[1])],
        [f[0] + side * w[0], f[1] + side * w[1]],
      ];
    });

    const footCoord = (coord: 0 | 1) => () => {
      const info = projectionInfo();
      return info && length(info.foot) > 1e-6 ? info.foot[coord] : 1000;
    };
    board.create(
      "segment",
      [
        [0, 0],
        [footCoord(0), footCoord(1)],
      ],
      {
        strokeColor: colors.proj,
        strokeWidth: 5,
        strokeOpacity: 0.9,
        lastArrow: { type: 2, size: 4 },
        highlight: false,
        fixed: true,
      },
    );

    /* Sudut antara a dan b */
    const arcInfo = () => {
      if (!showAngleRef.current) return null;
      const a = A();
      const b = B();
      const la = length(a);
      const lb = length(b);
      if (la < EPS || lb < EPS) return null;
      const startAngle = Math.atan2(a[1], a[0]);
      let delta = Math.atan2(b[1], b[0]) - startAngle;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta <= -Math.PI) delta += 2 * Math.PI;
      if (Math.abs(delta) < 1e-6) return null;
      const radius = Math.min(1.5, Math.max(0.35, 0.45 * Math.min(la, lb)));
      return {
        startAngle,
        delta,
        radius,
        mid: startAngle + delta / 2,
        degrees: toDegrees(Math.abs(delta)),
      };
    };

    makeCurve(colors.sum, 2, 0, () => {
      const info = arcInfo();
      if (!info) return null;
      const points: Vec[] = [];
      for (let i = 0; i <= ARC_STEPS; i += 1) {
        const angle = info.startAngle + (info.delta * i) / ARC_STEPS;
        points.push([
          info.radius * Math.cos(angle),
          info.radius * Math.sin(angle),
        ]);
      }
      return points;
    });

    const angleLabel = (coord: 0 | 1) => () => {
      const info = arcInfo();
      if (!info) return 1000;
      const r = info.radius + 0.9;
      return coord === 0 ? r * Math.cos(info.mid) : r * Math.sin(info.mid);
    };
    board.create(
      "text",
      [
        angleLabel(0),
        angleLabel(1),
        () => {
          const info = arcInfo();
          return info ? `θ = ${formatValue(info.degrees)}°` : "";
        },
      ],
      {
        fontSize: 12,
        strokeColor: colors.sum,
        anchorX: "middle",
        anchorY: "middle",
        highlight: false,
        fixed: true,
      },
    );

    /* Anak panah vektor a dan b */
    const arrow = (end: JXG.Point, color: string) =>
      board.create(
        "segment",
        [
          [0, 0],
          [() => end.X(), () => end.Y()],
        ],
        {
          strokeColor: color,
          strokeWidth: 3.5,
          lastArrow: { type: 2, size: 4 },
          highlight: false,
          fixed: true,
        },
      );
    arrow(pa, colors.a);
    arrow(pb, colors.b);

    /* Sinkronisasi saat ujung vektor digeser */
    const syncFromBoard = () => {
      const a: Vec = [cleanNumber(pa.X()), cleanNumber(pa.Y())];
      const b: Vec = [cleanNumber(pb.X()), cleanNumber(pb.Y())];
      vectorsRef.current = { a, b };
      setVecA(a);
      setVecB(b);
      setFields(toFields(a, b));
    };
    pa.on("drag", syncFromBoard);
    pb.on("drag", syncFromBoard);

    board.update();

    // Saat ukuran kontainer berubah (mis. layar penuh), pertahankan skala
    // dan titik tengah tampilan agar grafik tidak melompat.
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
      if (last.w > 0 && last.h > 0 && spanX > 0 && spanY > 0) {
        const ux = last.w / spanX;
        const uy = last.h / spanY;
        const cx = (bb[0] + bb[2]) / 2;
        const cy = (bb[1] + bb[3]) / 2;
        board.resizeContainer(w, h, true, true);
        board.setBoundingBox(
          [cx - w / 2 / ux, cy + h / 2 / uy, cx + w / 2 / ux, cy - h / 2 / uy],
          true,
        );
      } else {
        board.resizeContainer(w, h, true);
      }
      last = { w, h };
      board.update();
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
      pointsRef.current = [];
    };
  }, [boardId]);

  /* Tempel ke grid */
  useEffect(() => {
    snapRef.current = snap;
    pointsRef.current.forEach((point) =>
      point.setAttribute({ snapToGrid: snap }),
    );
  }, [snap]);

  /* ---------- Turunan untuk tampilan ---------- */

  const info = analyze(vecA, vecB);
  const caption = `a${formatCoord(vecA)} · b${formatCoord(vecB)} = ${formatValue(info.dot)}${
    info.defined ? `, θ = ${formatValue(info.angle)}°` : ""
  }`;

  const tableRows: { name: string; vector: Vec | null; size: number }[] = [
    { name: "a", vector: vecA, size: info.la },
    { name: "b", vector: vecB, size: info.lb },
    { name: "a + b", vector: info.sum, size: length(info.sum) },
    { name: "a − b", vector: info.diff, size: length(info.diff) },
    {
      name: "Proyeksi a pada b",
      vector: info.aOnB?.vector ?? null,
      size: info.aOnB ? Math.abs(info.aOnB.scalar) : Number.NaN,
    },
    {
      name: "Proyeksi b pada a",
      vector: info.bOnA?.vector ?? null,
      size: info.bOnA ? Math.abs(info.bOnA.scalar) : Number.NaN,
    },
  ];

  return (
    <div
      ref={rootRef}
      className={`vector-simulation simulation-fullscreen-frame${isFullscreen ? " is-fullscreen" : ""}`}
    >
      <div className="vs-main">
        <section className="vs-board-panel" aria-labelledby="vs-board-title">
          <div className="vs-board-heading">
            <h3 id="vs-board-title">Bidang koordinat</h3>
            <span className="vs-board-hint">
              Seret ujung vektor a atau b · tahan klik kiri pada area kosong
              untuk menggeser · gulir untuk zoom
            </span>
            <div className="vs-view-tools" role="group" aria-label="Tampilan">
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
            <GraphAppearanceControls appearance={appearance} onStep={onStep} />
          </div>
          <div
            className="vs-board"
            id={boardId}
            ref={containerRef}
            aria-label="Bidang koordinat interaktif. Seret ujung vektor a (biru kehijauan) atau vektor b (oranye) untuk mengubah posisinya. Tahan klik kiri pada area kosong untuk menggeser bidang, gulir untuk memperbesar atau memperkecil."
          />
          <div className="vs-legend" aria-label="Legenda grafik">
            <span>
              <i className="legend-a" /> vektor a
            </span>
            <span>
              <i className="legend-b" /> vektor b
            </span>
            <span>
              <i className="legend-sum" /> a + b dan sudut θ
            </span>
            <span>
              <i className="legend-proj" /> proyeksi
            </span>
          </div>
          <p className="vs-caption" aria-live="polite">
            {caption}
          </p>
        </section>

        <div className="vs-column">
          <section className="vs-side" aria-label="Pengaturan vektor">
            <div className="vs-panel">
              <h3>Komponen vektor</h3>
              <div className="vs-vector-row">
                <strong className="vs-name vs-name-a">a</strong>
                <Field
                  label="a₁ (x)"
                  value={fields.a1}
                  onChange={(v) => changeField("a1", v)}
                />
                <Field
                  label="a₂ (y)"
                  value={fields.a2}
                  onChange={(v) => changeField("a2", v)}
                />
              </div>
              <div className="vs-vector-row">
                <strong className="vs-name vs-name-b">b</strong>
                <Field
                  label="b₁ (x)"
                  value={fields.b1}
                  onChange={(v) => changeField("b1", v)}
                />
                <Field
                  label="b₂ (y)"
                  value={fields.b2}
                  onChange={(v) => changeField("b2", v)}
                />
              </div>
              <label className="vs-check">
                <input
                  type="checkbox"
                  checked={snap}
                  onChange={(event) => setSnap(event.currentTarget.checked)}
                />
                Tempel ke titik bilangan bulat saat menyeret
              </label>
              <p className="vs-hint">
                Nilai komponen dibatasi antara −{formatValue(LIMIT)} dan{" "}
                {formatValue(LIMIT)} agar vektor tetap terlihat.
              </p>
            </div>

            <div className="vs-panel">
              <h3>Contoh posisi</h3>
              <div
                className="vs-segmented"
                role="group"
                aria-label="Contoh posisi dua vektor"
              >
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setVectors([...preset.a], [...preset.b], true)
                    }
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="vs-panel">
              <h3>Tampilan</h3>
              <label className="vs-check vs-check-first">
                <input
                  type="checkbox"
                  checked={showSum}
                  onChange={(event) => toggleSum(event.currentTarget.checked)}
                />
                Penjumlahan a + b (jajar genjang)
              </label>
              <label className="vs-check">
                <input
                  type="checkbox"
                  checked={showAngle}
                  onChange={(event) => toggleAngle(event.currentTarget.checked)}
                />
                Sudut θ antara a dan b
              </label>
              <p className="vs-subtitle">Proyeksi</p>
              <div
                className="vs-segmented"
                role="group"
                aria-label="Arah proyeksi"
              >
                {projectionOptions.map((option) => (
                  <button
                    key={option.mode}
                    type="button"
                    aria-pressed={projection === option.mode}
                    onClick={() => selectProjection(option.mode)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="vs-reset-row">
              <button
                type="button"
                className="vs-reset-button"
                onClick={resetAll}
              >
                Atur ulang semua
              </button>
            </div>
          </section>

          <div className="vs-results">
            <section
              className="vs-panel vs-wide"
              aria-labelledby="vs-calc-title"
            >
              <h3 id="vs-calc-title">Hasil perhitungan</h3>
              <div className="vs-card-grid">
                <article className="vs-card">
                  <h4>Penjumlahan vektor</h4>
                  <p className="vs-formula">
                    a + b = ({par(vecA[0])} + {par(vecB[0])}; {par(vecA[1])} +{" "}
                    {par(vecB[1])}) = {formatCoord(info.sum)}
                  </p>
                  <p>
                    |a + b| = {formatValue(length(info.sum))}; a − b ={" "}
                    {formatCoord(info.diff)}
                  </p>
                </article>

                <article className="vs-card vs-card-result">
                  <h4>Hasil kali titik</h4>
                  <p className="vs-formula">
                    a · b = {par(vecA[0])}·{par(vecB[0])} + {par(vecA[1])}·
                    {par(vecB[1])} = {formatValue(info.dot)}
                  </p>
                  <p>{relationText(info)}</p>
                  <p>
                    |a| = {formatValue(info.la)}; |b| = {formatValue(info.lb)}
                  </p>
                </article>

                <article className="vs-card">
                  <h4>Sudut antara a dan b</h4>
                  <p className="vs-formula">
                    cos θ = (a · b) / (|a| |b|) = {formatValue(info.cos)}
                  </p>
                  <p>
                    {info.defined
                      ? `θ = ${formatValue(info.angle)}°`
                      : "Sudut tidak terdefinisi karena ada vektor nol."}
                  </p>
                </article>

                <article
                  className={`vs-card${projection === "a" ? " is-active" : ""}`}
                >
                  <h4>Proyeksi a pada b</h4>
                  {info.aOnB ? (
                    <>
                      <p className="vs-formula">
                        skalar = (a · b) / |b| = {formatValue(info.aOnB.scalar)}
                      </p>
                      <p>
                        vektor = ((a · b) / |b|²) b ={" "}
                        {formatCoord(info.aOnB.vector)}
                      </p>
                    </>
                  ) : (
                    <p className="vs-formula">
                      Tidak terdefinisi (b adalah vektor nol).
                    </p>
                  )}
                </article>

                <article
                  className={`vs-card${projection === "b" ? " is-active" : ""}`}
                >
                  <h4>Proyeksi b pada a</h4>
                  {info.bOnA ? (
                    <>
                      <p className="vs-formula">
                        skalar = (a · b) / |a| = {formatValue(info.bOnA.scalar)}
                      </p>
                      <p>
                        vektor = ((a · b) / |a|²) a ={" "}
                        {formatCoord(info.bOnA.vector)}
                      </p>
                    </>
                  ) : (
                    <p className="vs-formula">
                      Tidak terdefinisi (a adalah vektor nol).
                    </p>
                  )}
                </article>
              </div>
            </section>

            <section
              className="vs-panel vs-wide"
              aria-labelledby="vs-table-title"
            >
              <h3 id="vs-table-title">Komponen dan panjang</h3>
              <div className="vs-table-wrap">
                <table className="vs-table">
                  <thead>
                    <tr>
                      <th scope="col">Vektor</th>
                      <th scope="col">Komponen</th>
                      <th scope="col">Panjang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.name}>
                        <th scope="row">{row.name}</th>
                        <td className="vs-cell-main">
                          {row.vector ? formatCoord(row.vector) : "—"}
                        </td>
                        <td className="vs-cell-muted">
                          {formatValue(row.size)}
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

      <ul className="vs-insights">
        <li>
          <strong>Penjumlahan</strong>: a + b = (a₁ + b₁; a₂ + b₂). Secara
          geometri, a + b adalah diagonal jajar genjang yang dibentuk a dan b.
        </li>
        <li>
          <strong>Hasil kali titik</strong>: a · b = a₁b₁ + a₂b₂ = |a| |b| cos
          θ. Hasilnya berupa bilangan, bukan vektor, dan a · b = b · a.
        </li>
        <li>
          <strong>Sudut</strong>: cos θ = (a · b) / (|a| |b|). Jika a · b = 0
          kedua vektor tegak lurus; jika positif θ lancip; jika negatif θ
          tumpul.
        </li>
        <li>
          <strong>Proyeksi</strong>: panjang proyeksi skalar a pada b adalah (a
          · b) / |b|, dan proyeksi vektornya ((a · b) / |b|²) b. Tandanya
          negatif bila θ tumpul.
        </li>
      </ul>
    </div>
  );
}
