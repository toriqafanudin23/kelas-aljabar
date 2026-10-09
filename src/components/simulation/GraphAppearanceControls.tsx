import { Minus, Plus } from "lucide-react";
import type { GraphAppearance } from "./simulationBoard";
import "./GraphAppearanceControls.css";

type AppearanceKey = keyof GraphAppearance;

interface GraphAppearanceControlsProps {
  appearance: GraphAppearance;
  onStep: (key: AppearanceKey, delta: number) => void;
}

const controls: {
  key: AppearanceKey;
  label: string;
  min: number;
  max: number;
}[] = [
  { key: "curveWidth", label: "Ketebalan garis", min: 1, max: 8 },
  { key: "pointSize", label: "Ukuran titik", min: 2, max: 10 },
];

export function GraphAppearanceControls({
  appearance,
  onStep,
}: GraphAppearanceControlsProps) {
  return (
    <div
      className="sim-appearance-controls"
      role="group"
      aria-label="Gaya grafik"
    >
      {controls.map(({ key, label, min, max }) => (
        <div className="sim-appearance-stepper" key={key}>
          <span>{label}</span>
          <button
            type="button"
            onClick={() => onStep(key, -1)}
            disabled={appearance[key] <= min}
            aria-label={`Kurangi ukuran ${label.toLowerCase()}`}
            title={`Kurangi ukuran ${label.toLowerCase()}`}
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <output aria-live="polite">{appearance[key]}</output>
          <button
            type="button"
            onClick={() => onStep(key, 1)}
            disabled={appearance[key] >= max}
            aria-label={`Tambah ukuran ${label.toLowerCase()}`}
            title={`Tambah ukuran ${label.toLowerCase()}`}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
