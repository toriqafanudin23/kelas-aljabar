import {
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
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./TrigonometrySimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useGraphAppearance, useSimulationFullscreen } from "./simulationBoard";
import { useStoredSimulationState } from "./useStoredSimulationState";

/* Simulasi trigonometri (versi disusun ulang, mengikuti simulasi vektor).
   Prioritas: ponsel lanskap → desktop → ponsel potret.
   Wilayah grafik (lingkaran satuan + grafik fungsi) : wilayah input = 2 : 1.
   - Layar kecil / layar penuh: panel kanan bertab (Sudut, Istimewa, Hasil)
     agar semuanya muat tanpa gulir panjang.
   - Desktop: panel sudut dan sudut istimewa bertumpuk di kanan, hasil di
     bawah. */

/* ---------- Tipe ---------- */

type PanelTab = "angle" | "special" | "result";

const panelTabs: { tab: PanelTab; label: string }[] = [
  { tab: "angle", label: "Sudut" },
  { tab: "special", label: "Istimewa" },
  { tab: "result", label: "Hasil" },
];

/* ---------- Konstanta ---------- */

const initialAngle = 45;
const graphLimit = Math.PI * 2;
/** Layar kecil atau pendek memakai panel bertab. */
const TABBED_QUERY = "(max-width: 899px), (max-height: 540px)";
const specialAngles = [
  0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330,
];
const unitColors = {
  cosine: "#087f8c",
  sine: "#d16b36",
  tangent: "#527a41",
  guide: "#71808b",
};

/* ---------- Matematika & format ---------- */

function normalizeDegrees(value: number) {
  return ((Math.round(value) % 360) + 360) % 360;
}

function greatestCommonDivisor(first: number, second: number): number {
  return second === 0 ? first : greatestCommonDivisor(second, first % second);
}

function radiansLabel(degrees: number) {
  if (degrees === 0) return "0";
  const divisor = greatestCommonDivisor(degrees, 180);
  const numerator = degrees / divisor;
  const denominator = 180 / divisor;
  const coefficient = numerator === 1 ? "" : String(numerator);
  return denominator === 1
    ? `${coefficient}π`
    : `${coefficient}π/${denominator}`;
}

function formatValue(value: number) {
  if (Math.abs(value) < 0.0005) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  })
    .format(value)
    .replace("-", "−");
}

/* ---------- Hook ---------- */

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
    className: "trig-step-button",
    "aria-label":
      direction === 1 ? "Tambah sudut 1 derajat" : "Kurangi sudut 1 derajat",
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      stop();
      stepRef.current(direction);
      timers.current.delay = window.setTimeout(() => {
        timers.current.repeat = window.setInterval(
          () => stepRef.current(direction),
          45,
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

/* ---------- Komponen utama ---------- */

export function TrigonometrySimulation() {
  const baseId = useId().replace(/:/g, "");
  const circleId = `trig-circle-${baseId}`;
  const graphId = `trig-graph-${baseId}`;
  const sliderId = `trig-angle-${baseId}`;
  const numId = `trig-angle-num-${baseId}`;
  const { rootRef, isFullscreen, toggleFullscreen } = useSimulationFullscreen();
  const [tab, setTab] = useState<PanelTab>("angle");
  const smallScreen = useMediaQuery(TABBED_QUERY);
  const tabbed = smallScreen || isFullscreen;
  const circleContainerRef = useRef<HTMLDivElement | null>(null);
  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const circleBoardRef = useRef<ReturnType<
    typeof JXG.JSXGraph.initBoard
  > | null>(null);
  const graphBoardRef = useRef<ReturnType<
    typeof JXG.JSXGraph.initBoard
  > | null>(null);
  const { appearance, onStep } = useGraphAppearance([
    circleBoardRef,
    graphBoardRef,
  ]);
  const anglePointRef = useRef<JXG.Point | null>(null);
  const [angleDegrees, setAngleDegrees] = useStoredSimulationState(
    "trigonometry.angle",
    initialAngle,
  );
  const angleRef = useRef(angleDegrees);
  const [angleText, setAngleText] = useState(String(angleDegrees));
  const angleFocused = useRef(false);

  const updateAngle = (value: number) => {
    const nextAngle = normalizeDegrees(value);
    angleRef.current = nextAngle;
    setAngleDegrees(nextAngle);

    const radians = (nextAngle * Math.PI) / 180;
    anglePointRef.current?.setPosition(JXG.COORDS_BY_USER, [
      Math.cos(radians),
      Math.sin(radians),
    ]);
    circleBoardRef.current?.update();
    graphBoardRef.current?.update();
  };

  const bind = useHoldRepeat((direction) =>
    updateAngle(angleRef.current + direction),
  );

  const changeAngleText = (text: string) => {
    setAngleText(text);
    const cleaned = text.trim().replace("°", "");
    if (!/^\d{1,3}$/.test(cleaned)) return;
    updateAngle(Number(cleaned));
  };

  // Kolom angka mengikuti sudut yang berubah dari slider atau lingkaran.
  useEffect(() => {
    if (!angleFocused.current) setAngleText(String(angleDegrees));
  }, [angleDegrees]);

  // Di ponsel, layar penuh dikunci ke lanskap bila browser mengizinkan.
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
    const angleRadians = () => (angleRef.current * Math.PI) / 180;
    const circleBoard = JXG.JSXGraph.initBoard(circleId, {
      boundingbox: [-1.4, 1.4, 1.4, -1.4],
      axis: false,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: true,
      pan: { enabled: false },
      zoom: { wheel: false },
    });
    circleBoardRef.current = circleBoard;

    const graphBoard = JXG.JSXGraph.initBoard(graphId, {
      boundingbox: [-graphLimit - 0.3, 2.4, graphLimit + 0.3, -2.4],
      axis: false,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: false,
      pan: { enabled: true, needShift: false, needTwoFingers: false },
      zoom: { wheel: false },
    });
    graphBoardRef.current = graphBoard;

    const axisStyle = {
      strokeColor: "#63727d",
      strokeWidth: 1.2,
      highlight: false,
    };
    const circleTicks = {
      ticksDistance: 1,
      minorTicks: 0,
      majorHeight: 7,
      drawLabels: true,
      label: { fontSize: 10, strokeColor: "#63727d" },
    };
    circleBoard.create(
      "axis",
      [
        [0, 0],
        [1, 0],
      ],
      { ...axisStyle, ticks: circleTicks },
    );
    circleBoard.create(
      "axis",
      [
        [0, 0],
        [0, 1],
      ],
      { ...axisStyle, ticks: circleTicks },
    );

    const unitCircle = circleBoard.create("circle", [[0, 0], 1], {
      strokeColor: "#b5c2c8",
      strokeWidth: 1.5,
      fillColor: "#eff5f3",
      fillOpacity: 0.18,
      fixed: true,
      highlight: false,
    });
    const anglePoint = circleBoard.create(
      "glider",
      [Math.cos(angleRadians()), Math.sin(angleRadians()), unitCircle],
      {
        name: "",
        withLabel: false,
        size: 6,
        fillColor: unitColors.cosine,
        strokeColor: "#ffffff",
        strokeWidth: 2,
        highlight: false,
        snapToGrid: false,
      },
    ) as JXG.Point;
    anglePointRef.current = anglePoint;

    circleBoard.create("segment", [[0, 0], anglePoint], {
      strokeColor: "#183e54",
      strokeWidth: 2,
      highlight: false,
      fixed: true,
    });
    circleBoard.create("segment", [anglePoint, [() => anglePoint.X(), 0]], {
      strokeColor: unitColors.sine,
      strokeWidth: 2.5,
      dash: 2,
      highlight: false,
      fixed: true,
    });
    circleBoard.create(
      "segment",
      [
        [0, 0],
        [() => anglePoint.X(), 0],
      ],
      {
        strokeColor: unitColors.cosine,
        strokeWidth: 3,
        highlight: false,
        fixed: true,
      },
    );
    circleBoard.create("point", [0, 0], {
      name: "",
      withLabel: false,
      size: 2,
      fillColor: "#183e54",
      strokeColor: "#183e54",
      fixed: true,
      highlight: false,
    });
    circleBoard.create(
      "text",
      [
        () => anglePoint.X() * 0.5,
        () => (anglePoint.Y() >= 0 ? -0.1 : 0.1),
        "cos θ",
      ],
      {
        fontSize: 12,
        strokeColor: unitColors.cosine,
        fixed: true,
        highlight: false,
      },
    );
    circleBoard.create(
      "text",
      [
        () => anglePoint.X() + (anglePoint.X() >= 0 ? 0.08 : -0.34),
        () => anglePoint.Y() * 0.5,
        "sin θ",
      ],
      {
        fontSize: 12,
        strokeColor: unitColors.sine,
        fixed: true,
        highlight: false,
      },
    );
    anglePoint.on("drag", () => {
      const degrees =
        (Math.atan2(anglePoint.Y(), anglePoint.X()) * 180) / Math.PI;
      const nextAngle = normalizeDegrees(degrees);
      angleRef.current = nextAngle;
      setAngleDegrees(nextAngle);
      graphBoardRef.current?.update();
    });

    graphBoard.create(
      "axis",
      [
        [0, 0],
        [1, 0],
      ],
      {
        ...axisStyle,
        ticks: {
          ticksDistance: Math.PI / 2,
          minTicksDistance: 50,
          minorTicks: 0,
          majorHeight: 7,
          drawLabels: false,
        },
      },
    );
    const graphAngleLabels = [
      [-2 * Math.PI, "−2π"],
      [-1.5 * Math.PI, "−3π/2"],
      [-Math.PI, "−π"],
      [-Math.PI / 2, "−π/2"],
      [0, "0"],
      [Math.PI / 2, "π/2"],
      [Math.PI, "π"],
      [1.5 * Math.PI, "3π/2"],
      [2 * Math.PI, "2π"],
    ] as const;
    graphAngleLabels.forEach(([x, label], index) => {
      graphBoard.create("text", [x, -0.16, label], {
        anchorX:
          index === 0
            ? "left"
            : index === graphAngleLabels.length - 1
              ? "right"
              : "middle",
        anchorY: "top",
        fontSize: 9,
        strokeColor: "#63727d",
        fixed: true,
        highlight: false,
      });
    });
    graphBoard.create(
      "axis",
      [
        [0, 0],
        [0, 1],
      ],
      {
        ...axisStyle,
        ticks: {
          ticksDistance: 1,
          minorTicks: 0,
          majorHeight: 7,
          drawLabels: true,
          label: { fontSize: 9, strokeColor: "#63727d" },
        },
      },
    );

    graphBoard.create("functiongraph", [(x: number) => Math.sin(x)], {
      strokeColor: unitColors.sine,
      strokeWidth: 2.5,
      highlight: false,
    });
    graphBoard.create("functiongraph", [(x: number) => Math.cos(x)], {
      strokeColor: unitColors.cosine,
      strokeWidth: 2.5,
      highlight: false,
    });
    graphBoard.create(
      "functiongraph",
      [
        (x: number) =>
          Math.abs(Math.cos(x)) < 0.06 ? Number.NaN : Math.tan(x),
      ],
      {
        strokeColor: unitColors.tangent,
        strokeWidth: 2,
        highlight: false,
      },
    );

    graphBoard.create(
      "segment",
      [
        [() => angleRadians(), -2.2],
        [() => angleRadians(), 2.2],
      ],
      {
        strokeColor: "#76848e",
        strokeWidth: 1,
        dash: 2,
        highlight: false,
        fixed: true,
      },
    );
    const graphPoint = (fn: (angle: number) => number, color: string) =>
      graphBoard.create(
        "point",
        [() => angleRadians(), () => fn(angleRadians())],
        {
          name: "",
          withLabel: false,
          size: 4,
          fillColor: color,
          strokeColor: "#ffffff",
          strokeWidth: 1.5,
          fixed: true,
          highlight: false,
        },
      );
    graphPoint(Math.sin, unitColors.sine);
    graphPoint(Math.cos, unitColors.cosine);
    graphPoint(
      (angle) =>
        Math.abs(Math.cos(angle)) < 0.08 ? Number.NaN : Math.tan(angle),
      unitColors.tangent,
    );

    // Saat ukuran kontainer berubah (putar layar, layar penuh, ganti mode),
    // papan mengikuti ukuran kontainernya.
    const observeBoard = (
      element: HTMLDivElement | null,
      board: ReturnType<typeof JXG.JSXGraph.initBoard>,
    ) => {
      if (!element) return null;
      const resizeObserver = new ResizeObserver(() => {
        if (element.clientWidth > 0 && element.clientHeight > 0) {
          board.resizeContainer(
            element.clientWidth,
            element.clientHeight,
            true,
          );
          board.update();
        }
      });
      resizeObserver.observe(element);
      return resizeObserver;
    };
    const observers = [
      observeBoard(circleContainerRef.current, circleBoard),
      observeBoard(graphContainerRef.current, graphBoard),
    ];

    return () => {
      observers.forEach((observer) => observer?.disconnect());
      JXG.JSXGraph.freeBoard(circleBoard);
      JXG.JSXGraph.freeBoard(graphBoard);
      circleBoardRef.current = null;
      graphBoardRef.current = null;
      anglePointRef.current = null;
    };
  }, [circleId, graphId]);

  /* ---------- Turunan untuk tampilan ---------- */

  const radians = (angleDegrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const tangentIsDefined = Math.abs(cosine) > 0.0005;
  const tangent = tangentIsDefined ? Math.tan(radians) : null;
  const caption = `θ = ${angleDegrees}° (${radiansLabel(angleDegrees)})`;
  const coordTag = `(cos θ; sin θ) = (${formatValue(cosine)}; ${formatValue(sine)})`;

  // Isi dari kiri (0°) menuju sudut terpilih.
  const sliderStyle = {
    "--trig-fill": `${(angleDegrees / 359) * 100}%`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`trigonometry-simulation simulation-fullscreen-frame${
        tabbed ? " is-tabbed" : ""
      }${isFullscreen ? " is-fullscreen" : ""}`}
    >
      <p className="trig-orientation-hint">
        <Smartphone size={14} aria-hidden="true" />
        <span>
          Miringkan ponsel ke mode lanskap agar lingkaran, grafik, dan panel
          isian tampil berdampingan.
        </span>
      </p>

      <div className="trig-main">
        {/* ───── Wilayah grafik (2 bagian): lingkaran + grafik fungsi ───── */}
        <section
          className="trig-board-panel trig-circle-panel"
          aria-label="Lingkaran satuan"
        >
          <div className="trig-stage">
            <div className="trig-board-cell">
              <div
                className="trig-board trig-circle-board"
                id={circleId}
                ref={circleContainerRef}
                aria-label="Lingkaran satuan interaktif. Seret titik pada keliling untuk mengubah sudut."
              />
              <p className="trig-caption" aria-live="polite">
                {caption}
              </p>
              <p className="trig-tag">{coordTag}</p>
            </div>
            <div className="trig-view-tools" role="group" aria-label="Tampilan">
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
            </div>
          </div>
        </section>

        {/* ───── Kolom kanan (2 bagian): input di atas, grafik di bawah (1 : 2) ───── */}
        <div className="trig-right">
          <div className="trig-column" data-tab={tab}>
            <div className="trig-tabs" role="group" aria-label="Bagian panel">
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

            <section className="trig-side" aria-label="Pengaturan sudut">
              <div className="trig-panel" data-pane="angle">
                <h3>Sudut θ</h3>
                <div className="trig-angle-row">
                  <label htmlFor={sliderId}>
                    θ<small>derajat</small>
                  </label>
                  <button {...bind(-1)}>
                    <Minus size={13} aria-hidden="true" />
                  </button>
                  <input
                    id={sliderId}
                    className="trig-angle-slider"
                    type="range"
                    min="0"
                    max="359"
                    step="1"
                    value={angleDegrees}
                    style={sliderStyle}
                    aria-valuetext={`${angleDegrees} derajat`}
                    onChange={(event) =>
                      updateAngle(Number(event.currentTarget.value))
                    }
                  />
                  <button {...bind(1)}>
                    <Plus size={13} aria-hidden="true" />
                  </button>
                  <input
                    id={numId}
                    className="trig-num"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    enterKeyHint="done"
                    aria-label="Sudut dalam derajat"
                    value={angleText}
                    onChange={(event) =>
                      changeAngleText(event.currentTarget.value)
                    }
                    onFocus={(event) => {
                      angleFocused.current = true;
                      event.currentTarget.select();
                    }}
                    onBlur={() => {
                      angleFocused.current = false;
                      setAngleText(String(angleDegrees));
                    }}
                  />
                </div>
                <p className="trig-angle-note">
                  {angleDegrees}° = {radiansLabel(angleDegrees)} radian
                </p>
                <p className="trig-hint">
                  Seret titik pada lingkaran, geser slider, atau ketik sudutnya
                  (0–359).
                </p>
              </div>

              <div className="trig-panel" data-pane="special">
                <h3>Sudut istimewa</h3>
                <div
                  className="trig-special-angle-buttons"
                  role="group"
                  aria-label="Sudut istimewa"
                >
                  {specialAngles.map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      className={angleDegrees === angle ? "active" : ""}
                      aria-pressed={angleDegrees === angle}
                      onClick={() => updateAngle(angle)}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>

              <div className="trig-reset-row" data-pane="angle">
                <button
                  type="button"
                  className="trig-reset-button"
                  onClick={() => updateAngle(initialAngle)}
                  title="Kembalikan sudut ke 45 derajat"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>Atur ulang</span>
                </button>
                <GraphAppearanceControls
                  appearance={appearance}
                  onStep={onStep}
                />
              </div>
            </section>

            <div className="trig-results" data-pane="result">
              <dl className="trig-readouts" aria-live="polite">
                <div className="readout-angle">
                  <dt>Sudut</dt>
                  <dd>
                    {angleDegrees}° <span>({radiansLabel(angleDegrees)})</span>
                  </dd>
                </div>
                <div className="readout-sine">
                  <dt>sin θ</dt>
                  <dd>{formatValue(sine)}</dd>
                </div>
                <div className="readout-cosine">
                  <dt>cos θ</dt>
                  <dd>{formatValue(cosine)}</dd>
                </div>
                <div className="readout-tangent">
                  <dt>tan θ</dt>
                  <dd>
                    {tangent === null
                      ? "Tidak terdefinisi"
                      : formatValue(tangent)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <section
            className="trig-board-panel trig-graph-panel"
            aria-label="Grafik fungsi trigonometri"
          >
            <div className="trig-stage">
              <div className="trig-board-cell">
                <div
                  className="trig-board trig-function-board"
                  id={graphId}
                  ref={graphContainerRef}
                  aria-label="Grafik sinus, kosinus, dan tangen dari −2π sampai 2π. Seret untuk menggeser. Garis putus-putus menunjukkan sudut terpilih."
                />
              </div>
            </div>
            <div className="trig-legend" aria-label="Legenda grafik">
              <span>
                <i className="legend-sine" /> sin θ
              </span>
              <span>
                <i className="legend-cosine" /> cos θ
              </span>
              <span>
                <i className="legend-tangent" /> tan θ
              </span>
            </div>
          </section>
        </div>
      </div>

      <p className="trig-explanation">
        Pada lingkaran satuan, titik untuk sudut θ memiliki koordinat
        <strong> (cos θ, sin θ)</strong>. Nilai tangen adalah
        <strong> sin θ / cos θ</strong>, sehingga tidak terdefinisi saat cos θ =
        0.
      </p>
    </div>
  );
}
