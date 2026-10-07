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
    prompt:
      "Pada sudut mana nilai sinus dan kosinus sama? Amati bagaimana koordinat berubah saat titik melewati kuadran.",
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
    prompt:
      "Ubah satu koefisien setiap kali. Bagaimana a mengubah bentuk parabola, dan bagaimana b atau c memengaruhi letak titik puncak serta akar?",
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
    prompt:
      "Terapkan satu transformasi setiap langkah. Transformasi mana yang mempertahankan panjang dan sudut, dan mana yang mengubah ukuran?",
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
    prompt:
      "Prediksi perubahan grafik sebelum menggeser parameter. Bandingkan pengaruh pergeseran horizontal dengan pergeseran vertikal.",
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
    prompt:
      "Bandingkan hasil kali titik saat kedua vektor searah, tegak lurus, dan berlawanan arah. Apa yang terjadi pada sudutnya?",
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
    prompt:
      "Dekatkan garis sekan ke garis tangen dengan mengecilkan h. Lalu tambah persegi panjang Riemann dan amati pendekatan luasnya.",
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
    prompt:
      "Gambarkan dua fungsi dan cari titik potongnya. Bagaimana titik-titik itu berkaitan dengan solusi persamaan saat kedua fungsi disamakan?",
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
    prompt:
      "Ubah kendala dan amati daerah layak. Kapan sistem memiliki satu solusi, banyak solusi, atau tidak memiliki solusi?",
    level: "KELAS X–XI",
    component: LinearSystemSimulation,
  },
];

export function SimulationPage({ navigate }: SimulationPageProps) {
  const simulationSectionRef = useRef<HTMLElement>(null);
  const [selectedSimulationId, setSelectedSimulationId] = useState(() => {
    try {
      const savedId = window.sessionStorage.getItem(
        "math1729.active-simulation",
      );
      return simulations.some(({ id }) => id === savedId)
        ? savedId!
        : simulations[0].id;
    } catch {
      return simulations[0].id;
    }
  });
  const [isSimulationFullscreen, setIsSimulationFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const activeSimulation =
    simulations.find(({ id }) => id === selectedSimulationId) ?? simulations[0];
  const ActiveSimulation = activeSimulation.component;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        "math1729.active-simulation",
        selectedSimulationId,
      );
    } catch {}
  }, [selectedSimulationId]);

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
    setFullscreenError("");

    if (
      document.fullscreenElement !== simulationSection &&
      (!document.fullscreenEnabled || !simulationSection.requestFullscreen)
    ) {
      setFullscreenError("Layar penuh tidak didukung oleh browser ini.");
      return;
    }

    try {
      if (document.fullscreenElement === simulationSection) {
        await document.exitFullscreen();
      } else {
        await simulationSection.requestFullscreen();
      }
    } catch {
      setIsSimulationFullscreen(false);
      setFullscreenError("Tidak dapat membuka layar penuh. Coba lagi.");
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
        <div className="simulation-picker-heading">
          <span className="simulation-picker-label">Pilih simulasi</span>
          <span className="simulation-picker-count">
            {simulations.length} topik
          </span>
        </div>
        <div
          className="simulation-options"
          role="group"
          aria-label="Pilih simulasi"
        >
          {simulations.map((simulation) => (
            <button
              key={simulation.id}
              className={`simulation-option ${selectedSimulationId === simulation.id ? "active" : ""}`}
              type="button"
              aria-pressed={selectedSimulationId === simulation.id}
              onClick={() => setSelectedSimulationId(simulation.id)}
            >
              <span className="simulation-option-category">
                {simulation.category}
              </span>
              <span className="simulation-option-title">
                {simulation.title}
              </span>
              <span className="simulation-option-level">
                {simulation.level}
              </span>
            </button>
          ))}
        </div>
      </div>

      <section
        ref={simulationSectionRef}
        className="simulation-section"
        id="active-simulation-content"
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
            <aside
              className="simulation-prompt"
              aria-label="Pertanyaan eksplorasi"
            >
              <strong>Coba amati</strong>
              <p>{activeSimulation.prompt}</p>
            </aside>
          </div>
          <div className="simulation-heading-actions">
            <span className="simulation-level">{activeSimulation.level}</span>
            <button
              className="simulation-fullscreen-button"
              type="button"
              aria-pressed={isSimulationFullscreen}
              aria-controls="active-simulation-content"
              onClick={toggleSimulationFullscreen}
            >
              {isSimulationFullscreen ? "Keluar layar penuh" : "Layar penuh"}
            </button>
          </div>
        </div>
        {fullscreenError && (
          <p
            className="simulation-fullscreen-error"
            role="status"
            aria-live="polite"
          >
            {fullscreenError}
          </p>
        )}

        <ActiveSimulation />
      </section>
    </main>
  );
}
