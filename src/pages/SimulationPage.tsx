import { useEffect, useRef, useState } from "react";
import { TrigonometrySimulation } from "../components/simulation/TrigonometrySimulation";
import { QuadraticSimulation } from "../components/simulation/QuadraticSimulation";
import { TransformationSimulation } from "../components/simulation/TransformationSimulation";
import { FunctionTransformationSimulation } from "../components/simulation/FunctionTransformationSimulation";
import { VectorSimulation } from "../components/simulation/VectorSimulation";
import { CalculusSimulation } from "../components/simulation/CalculusSimulation";
import { GraphPlotterSimulation } from "../components/simulation/GraphPlotterSimulation";
import { LinearSystemSimulation } from "../components/simulation/LinearSystemSimulation";
import type { Navigate } from "../types/navigation";

interface SimulationPageProps {
  navigate?: Navigate;
}

const simulations = [
  {
    id: "trigonometry",
    index: "01",
    category: "TRIGONOMETRI",
    title: "Lingkaran satuan",
    description:
      "Geser titik pada lingkaran atau atur sudutnya. Koordinat titik menunjukkan nilai kosinus dan sinus; grafik memperlihatkan nilai sinus, kosinus, dan tangen untuk sudut yang sama.",
    level: "KELAS X",
    component: TrigonometrySimulation,
  },
  {
    id: "quadratic",
    index: "02",
    category: "FUNGSI KUADRAT",
    title: "Eksplorasi fungsi kuadrat",
    description:
      "Ubah koefisien a, b, dan c untuk melihat pengaruhnya terhadap bentuk parabola, titik puncak, akar, dan diskriminan.",
    level: "KELAS X",
    component: QuadraticSimulation,
  },
  {
    id: "transformation",
    index: "03",
    category: "TRANSFORMASI GEOMETRI",
    title: "Eksplorasi transformasi geometri",
    description:
      "Geser bangun asal, susun translasi, refleksi, rotasi, atau dilatasi, lalu amati bayangan, koordinat, dan matriks transformasinya.",
    level: "KELAS XI",
    component: TransformationSimulation,
  },
  {
    id: "function-transformation",
    index: "04",
    category: "TRANSFORMASI FUNGSI",
    title: "Eksplorasi transformasi fungsi",
    description:
      "Pilih fungsi dasar, lalu ubah pergeseran, refleksi, dan peregangan grafik untuk melihat pengaruh setiap parameter.",
    level: "KELAS XII",
    component: FunctionTransformationSimulation,
  },
  {
    id: "vector",
    index: "05",
    category: "VEKTOR",
    title: "Eksplorasi vektor",
    description:
      "Atur dua vektor untuk menjelajahi penjumlahan, pengurangan, hasil kali titik, sudut antara vektor, dan proyeksinya.",
    level: "KELAS X",
    component: VectorSimulation,
  },
  {
    id: "calculus",
    index: "06",
    category: "KALKULUS",
    title: "Eksplorasi kalkulus",
    description:
      "Amati hubungan garis sekan dan tangen dengan turunan, lalu dekati luas daerah di bawah kurva menggunakan jumlah Riemann.",
    level: "KELAS XI–XII",
    component: CalculusSimulation,
  },
  {
    id: "graph-plotter",
    index: "07",
    category: "FUNGSI",
    title: "Penggambar grafik fungsi",
    description:
      "Gambarkan hingga tiga fungsi sekaligus, lalu amati titik potong antargrafik serta titik potong terhadap sumbu.",
    level: "KELAS X–XII",
    component: GraphPlotterSimulation,
  },
  {
    id: "linear-system",
    index: "08",
    category: "SISTEM LINEAR",
    title: "Eksplorasi sistem linear",
    description:
      "Jelajahi titik potong dua garis, daerah penyelesaian pertidaksamaan, dan optimasi program linear melalui grafik interaktif.",
    level: "KELAS X–XI",
    component: LinearSystemSimulation,
  },
];

export function SimulationPage({ navigate }: SimulationPageProps) {
  const simulationSectionRef = useRef<HTMLElement>(null);
  const [selectedSimulationId, setSelectedSimulationId] = useState(
    simulations[0].id,
  );
  const [isSimulationFullscreen, setIsSimulationFullscreen] = useState(false);
  const activeSimulation =
    simulations.find(({ id }) => id === selectedSimulationId) ?? simulations[0];
  const ActiveSimulation = activeSimulation.component;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsSimulationFullscreen(
        document.fullscreenElement === simulationSectionRef.current,
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleSimulationFullscreen = async () => {
    const simulationSection = simulationSectionRef.current;
    if (!simulationSection) return;

    try {
      if (document.fullscreenElement === simulationSection) {
        await document.exitFullscreen();
      } else {
        await simulationSection.requestFullscreen();
      }
    } catch {
      setIsSimulationFullscreen(false);
    }
  };

  const handleHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (navigate) navigate(event, "home");
  };

  return (
    <main className="site-width inner-page simulation-page">
      <div className="breadcrumb">
        <a href="/" onClick={handleHome}>
          Beranda
        </a>
        <span>/</span>
        <span>Simulasi</span>
      </div>

      <div className="page-intro">
        <span className="section-kicker">Eksplorasi Matematika Interaktif</span>
        <h1>Simulasi</h1>
        <p>
          Ubah parameter, amati hubungan antarbesaran, dan bangun intuisi
          matematika melalui model yang dapat dijelajahi langsung.
        </p>
      </div>

      <div className="simulation-picker">
        <label htmlFor="simulation-choice">Pilih simulasi</label>
        <select
          id="simulation-choice"
          value={selectedSimulationId}
          onChange={(event) => setSelectedSimulationId(event.target.value)}
        >
          {simulations.map((simulation) => (
            <option key={simulation.id} value={simulation.id}>
              {simulation.index}. {simulation.title}
            </option>
          ))}
        </select>
      </div>

      <section
        ref={simulationSectionRef}
        className="simulation-section"
        aria-labelledby={`simulation-${activeSimulation.id}-title`}
      >
        <div className="simulation-heading">
          <div>
            <span className="simulation-index">
              SIMULASI {activeSimulation.index} / {activeSimulation.category}
            </span>
            <h2 id={`simulation-${activeSimulation.id}-title`}>
              {activeSimulation.title}
            </h2>
            <p>{activeSimulation.description}</p>
          </div>
          <div className="simulation-heading-actions">
            <span className="simulation-level">{activeSimulation.level}</span>
            <button
              className="simulation-fullscreen-button"
              type="button"
              aria-expanded={isSimulationFullscreen}
              onClick={toggleSimulationFullscreen}
            >
              {isSimulationFullscreen ? "Keluar layar penuh" : "Layar penuh"}
            </button>
          </div>
        </div>

        <ActiveSimulation />
      </section>
    </main>
  );
}
