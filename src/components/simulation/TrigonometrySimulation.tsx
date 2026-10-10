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
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import JXG from "jsxgraph";
import "../../../node_modules/jsxgraph/distrib/jsxgraph.css";
import "./TrigonometrySimulation.css";
import { GraphAppearanceControls } from "./GraphAppearanceControls";
import { useGraphAppearance, useSimulationFullscreen } from "./simulationBoard";
import { useStoredSimulationState } from "./useStoredSimulationState";

const initialAngle = 45;
const graphLimit = Math.PI * 2;
const specialAngles = [
  0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330,
];
const unitColors = {
  cosine: "#087f8c",
  sine: "#d16b36",
  tangent: "#527a41",
  guide: "#71808b",
};

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
  }).format(value);
}

export function TrigonometrySimulation() {
  const baseId = useId().replace(/:/g, "");
  const circleId = `trig-circle-${baseId}`;
  const graphId = `trig-graph-${baseId}`;
  const sliderId = `trig-angle-${baseId}`;
  const circleTitleId = `trig-circle-title-${baseId}`;
  const graphTitleId = `trig-graph-title-${baseId}`;
  const { rootRef, isFullscreen, toggleFullscreen } = useSimulationFullscreen();
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
  const specialRowRef = useRef<HTMLDivElement | null>(null);
  const holdRef = useRef<{ delay?: number; repeat?: number }>({});

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

  const stopHold = () => {
    window.clearTimeout(holdRef.current.delay);
    window.clearInterval(holdRef.current.repeat);
    holdRef.current = {};
  };

  // Tahan tombol −/+ untuk mengubah sudut terus-menerus.
  const startHold =
    (direction: 1 | -1) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      stopHold();
      updateAngle(angleRef.current + direction);
      holdRef.current.delay = window.setTimeout(() => {
        holdRef.current.repeat = window.setInterval(
          () => updateAngle(angleRef.current + direction),
          45,
        );
      }, 400);
    };

  useEffect(
    () => () => {
      window.clearTimeout(holdRef.current.delay);
      window.clearInterval(holdRef.current.repeat);
    },
    [],
  );

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

  // Jaga tombol sudut istimewa yang aktif tetap terlihat di baris yang bisa digeser.
  useEffect(() => {
    const row = specialRowRef.current;
    const active = row?.querySelector<HTMLButtonElement>("button.active");
    if (!row || !active || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({
      left: active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [angleDegrees]);

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
    circleBoard.create(
      "axis",
      [
        [0, 0],
        [1, 0],
      ],
      {
        ...axisStyle,
        ticks: {
          ticksDistance: 1,
          minorTicks: 0,
          majorHeight: 7,
          drawLabels: true,
          label: { fontSize: 10, strokeColor: "#63727d" },
        },
      },
    );
    circleBoard.create(
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
          label: { fontSize: 10, strokeColor: "#63727d" },
        },
      },
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
        size: 8,
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

  const radians = (angleDegrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const tangentIsDefined = Math.abs(cosine) > 0.0005;
  const tangent = tangentIsDefined ? Math.tan(radians) : null;

  const sliderStyle = {
    "--trig-fill": `${(angleDegrees / 359) * 100}%`,
  } as CSSProperties;

  const stepButtonProps = (direction: 1 | -1) => ({
    type: "button" as const,
    className: "trig-step-button",
    "aria-label":
      direction === 1 ? "Tambah sudut 1 derajat" : "Kurangi sudut 1 derajat",
    onPointerDown: startHold(direction),
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onPointerCancel: stopHold,
    onBlur: stopHold,
    onContextMenu: (event: { preventDefault: () => void }) =>
      event.preventDefault(),
    // detail === 0 → aktivasi lewat keyboard (Enter/Spasi)
    onClick: (event: { detail: number }) => {
      if (event.detail === 0) updateAngle(angleRef.current + direction);
    },
  });

  return (
    <div
      className={`trigonometry-simulation simulation-fullscreen-frame${isFullscreen ? " is-fullscreen" : ""}`}
      ref={rootRef}
    >
      <div className="trig-toolbar">
        <GraphAppearanceControls appearance={appearance} onStep={onStep} />
        <button
          className="trig-fullscreen-button"
          type="button"
          onClick={toggleFullscreen}
          aria-pressed={isFullscreen}
        >
          {isFullscreen ? (
            <>
              <Minimize2 size={16} aria-hidden="true" />
              <span>Keluar layar penuh</span>
            </>
          ) : (
            <>
              <Maximize2 size={16} aria-hidden="true" />
              <span>Layar penuh</span>
            </>
          )}
        </button>
      </div>

      <p className="trig-orientation-hint">
        <Smartphone size={16} aria-hidden="true" />
        <span>
          Di ponsel, tekan <strong>Layar penuh</strong> lalu miringkan ke mode
          lanskap agar lingkaran dan grafik tampil berdampingan.
        </span>
      </p>

      <div className="trig-boards">
        <section className="trig-board-panel" aria-labelledby={circleTitleId}>
          <div className="trig-board-heading">
            <h3 id={circleTitleId}>Lingkaran satuan</h3>
            <span>r = 1</span>
          </div>
          <div
            className="trig-board trig-circle-board"
            id={circleId}
            ref={circleContainerRef}
            aria-label="Lingkaran satuan interaktif. Seret titik pada keliling untuk mengubah sudut."
          />
          <p className="trig-board-caption">
            Koordinat titik <strong>(cos θ, sin θ)</strong>
          </p>
        </section>

        <section className="trig-board-panel" aria-labelledby={graphTitleId}>
          <div className="trig-board-heading">
            <h3 id={graphTitleId}>Grafik fungsi trigonometri</h3>
            <span>Seret untuk menggeser · −2π sampai 2π</span>
          </div>
          <div
            className="trig-board trig-function-board"
            id={graphId}
            ref={graphContainerRef}
            aria-label="Grafik sinus, kosinus, dan tangen. Garis putus-putus menunjukkan sudut terpilih."
          />
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

      <div className="trig-dock">
        <div className="trig-controls">
          <div className="trig-angle-control">
            <div className="trig-angle-head">
              <label htmlFor={sliderId}>Sudut θ</label>
              <output htmlFor={sliderId} aria-live="polite">
                {angleDegrees}° <span>({radiansLabel(angleDegrees)})</span>
              </output>
              <button
                className="trig-reset-button"
                type="button"
                onClick={() => updateAngle(initialAngle)}
                title="Kembalikan sudut ke 45 derajat"
                aria-label="Atur ulang sudut ke 45 derajat"
              >
                <RotateCcw size={15} aria-hidden="true" />
                <span>Atur ulang</span>
              </button>
            </div>

            <div className="trig-slider-row">
              <button {...stepButtonProps(-1)}>
                <Minus size={18} aria-hidden="true" />
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
              <button {...stepButtonProps(1)}>
                <Plus size={18} aria-hidden="true" />
              </button>
              <div className="trig-range-labels" aria-hidden="true">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
            </div>
          </div>

          <div
            className="trig-special-angles"
            role="group"
            aria-label="Sudut istimewa"
          >
            <span>Sudut istimewa</span>
            <div className="trig-special-angle-buttons" ref={specialRowRef}>
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
        </div>

        <dl className="trig-readouts" aria-live="polite">
          <div className="readout-angle">
            <dt>Sudut</dt>
            <dd>{angleDegrees}°</dd>
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
              {tangent === null ? "Tidak terdefinisi" : formatValue(tangent)}
            </dd>
          </div>
        </dl>
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
