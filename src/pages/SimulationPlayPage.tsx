import { lazy, Suspense, useEffect, useState } from "react";
import type { ComponentType } from "react";
import { ArrowLeft, BookOpen, Compass, Loader2 } from "lucide-react";
import type { Navigate } from "../types/navigation";
import { SIMULATIONS } from "../data/simulationsData";

const SIMULATION_COMPONENTS: Record<
  string,
  React.LazyExoticComponent<ComponentType<unknown>>
> = {
  trigonometry: lazy(() =>
    import("../components/simulation/TrigonometrySimulation").then((m) => ({
      default: m.TrigonometrySimulation,
    })),
  ),
  quadratic: lazy(() =>
    import("../components/simulation/QuadraticSimulation").then((m) => ({
      default: m.QuadraticSimulation,
    })),
  ),
  transformation: lazy(() =>
    import("../components/simulation/TransformationSimulation").then((m) => ({
      default: m.TransformationSimulation,
    })),
  ),
  "function-transformation": lazy(() =>
    import("../components/simulation/FunctionTransformationSimulation").then(
      (m) => ({
        default: m.FunctionTransformationSimulation,
      }),
    ),
  ),
  vector: lazy(() =>
    import("../components/simulation/VectorSimulation").then((m) => ({
      default: m.VectorSimulation,
    })),
  ),
  derivative: lazy(() =>
    import("../components/simulation/DerivativeSimulation").then((m) => ({
      default: m.DerivativeSimulation,
    })),
  ),
  integral: lazy(() =>
    import("../components/simulation/IntegralSimulation").then((m) => ({
      default: m.IntegralSimulation,
    })),
  ),
  "graph-plotter": lazy(() =>
    import("../components/simulation/GraphPlotterSimulation").then((m) => ({
      default: m.GraphPlotterSimulation,
    })),
  ),
  "linear-system": lazy(() =>
    import("../components/simulation/LinearSystemSimulation").then((m) => ({
      default: m.LinearSystemSimulation,
    })),
  ),
  "conic-sections": lazy(() =>
    import("../components/simulation/ConicSectionsSimulation").then((m) => ({
      default: m.ConicSectionsSimulation,
    })),
  ),
  "circle-sector": lazy(() =>
    import("../components/simulation/CircleSectorSimulation").then((m) => ({
      default: m.CircleSectorSimulation,
    })),
  ),
  "two-circle-tangents": lazy(() =>
    import("../components/simulation/TwoCircleTangentSimulation").then((m) => ({
      default: m.TwoCircleTangentSimulation,
    })),
  ),
  "matrix-transform": lazy(() =>
    import("../components/simulation/MatrixTransformSimulation").then((m) => ({
      default: m.MatrixTransformSimulation,
    })),
  ),
};

interface SimulationPlayPageProps {
  navigate?: Navigate;
}

export function SimulationPlayPage({ navigate }: SimulationPlayPageProps) {
  // Inisialisasi ID simulasi aktif dari URL query parameter atau sessionStorage
  const [selectedSimulationId, setSelectedSimulationId] = useState<string>(
    () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const queryTopic = params.get("topik");
        if (queryTopic && SIMULATIONS.some((s) => s.id === queryTopic)) {
          return queryTopic;
        }
      } catch {}

      try {
        const savedId = window.sessionStorage.getItem(
          "math1729.active-simulation",
        );
        if (savedId && SIMULATIONS.some((s) => s.id === savedId)) {
          return savedId;
        }
      } catch {}

      return SIMULATIONS[0].id;
    },
  );

  const activeSimulation =
    SIMULATIONS.find((s) => s.id === selectedSimulationId) ?? SIMULATIONS[0];
  const ActiveComponent =
    SIMULATION_COMPONENTS[activeSimulation.id] ??
    SIMULATION_COMPONENTS[SIMULATIONS[0].id];

  // Sinkronisasi ke sessionStorage dan URL query parameter
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        "math1729.active-simulation",
        selectedSimulationId,
      );
      window.history.replaceState(
        {},
        "",
        `/simulasi-interaktif?topik=${selectedSimulationId}`,
      );
    } catch {}
  }, [selectedSimulationId]);

  const handleNav = (
    event: React.MouseEvent<HTMLAnchorElement>,
    page: string,
  ) => {
    if (navigate) navigate(event, page);
  };

  const handleSwitchSimulation = (newId: string) => {
    setSelectedSimulationId(newId);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Rekomendasi simulasi berikutnya (selain simulasi aktif)
  const otherSimulations = SIMULATIONS.filter(
    (s) => s.id !== activeSimulation.id,
  ).slice(0, 3);

  return (
    <main className="site-width inner-page simulation-page">
      {/* 1. Breadcrumb Navigasi */}
      <div className="breadcrumb">
        <a href="/" onClick={(e) => handleNav(e, "home")}>
          Beranda
        </a>
        <span>/</span>
        <a href="/simulasi" onClick={(e) => handleNav(e, "simulation")}>
          Katalog Simulasi
        </a>
        <span>/</span>
        <span>{activeSimulation.title}</span>
      </div>

      {/* 2. Top Control Bar: Tombol Kembali + Dropdown Switcher */}
      <div className="sim-player-topbar">
        <a
          href="/simulasi"
          className="sim-player-back-btn"
          onClick={(e) => handleNav(e, "simulation")}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Kembali ke Katalog</span>
        </a>

        {/* Dropdown untuk berganti simulasi secara instan */}
        <div className="sim-player-switcher">
          <label htmlFor="sim-select-dropdown">
            <Compass
              size={14}
              aria-hidden="true"
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />
            Ganti Simulasi:
          </label>
          <select
            id="sim-select-dropdown"
            className="sim-player-select"
            value={selectedSimulationId}
            onChange={(e) => handleSwitchSimulation(e.target.value)}
          >
            <optgroup label="Kelas X (Fase E)">
              {SIMULATIONS.filter((s) => s.gradeKey === "fase-e").map((s) => (
                <option key={s.id} value={s.id}>
                  {s.index}. {s.title} ({s.category})
                </option>
              ))}
            </optgroup>
            <optgroup label="Kelas XI (Fase F)">
              {SIMULATIONS.filter((s) => s.gradeKey === "fase-f").map((s) => (
                <option key={s.id} value={s.id}>
                  {s.index}. {s.title} ({s.category})
                </option>
              ))}
            </optgroup>
            <optgroup label="Kelas XII (Fase F Lanjut)">
              {SIMULATIONS.filter((s) => s.gradeKey === "fase-f-lanjut").map(
                (s) => (
                  <option key={s.id} value={s.id}>
                    {s.index}. {s.title} ({s.category})
                  </option>
                ),
              )}
            </optgroup>
          </select>
        </div>
      </div>

      {/* 3. Section Simulasi Aktif */}
      <section
        className="simulation-section"
        aria-label={activeSimulation.title}
      >
        {/* Header Card Informasi Simulasi */}
        <div className="sim-player-header-card">
          <div className="sim-player-meta-row">
            <span className="sim-player-index-badge">
              SIMULASI {activeSimulation.index} · {activeSimulation.category}
            </span>
            <span className="sim-player-level-badge">
              {activeSimulation.level}
            </span>
          </div>

          <h1>{activeSimulation.title}</h1>
          <p>{activeSimulation.description}</p>

          {/* Panduan Eksplorasi / Coba Amati */}
          <div className="sim-player-prompt-box">
            <strong>Fokus Eksplorasi: Coba Amati</strong>
            <p>{activeSimulation.prompt}</p>
          </div>

          {/* Tautan ke Teori Materi di Web */}
          <a
            href={`/materi/${activeSimulation.relatedMaterialSlug}`}
            className="sim-player-quick-theory"
            onClick={(e) => handleNav(e, activeSimulation.relatedMaterialSlug)}
          >
            <BookOpen size={14} aria-hidden="true" />
            <span>
              Pelajari Teori Lengkap Modul:{" "}
              {activeSimulation.relatedMaterialTitle} →
            </span>
          </a>
        </div>

        {/* Kanvas Interaktif JSXGraph */}
        <div className="sim-player-canvas-container">
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "420px",
                  background: "#051f33",
                  color: "#cbd5e1",
                  gap: "0.75rem",
                  fontSize: "0.875rem",
                }}
              >
                <Loader2 className="animate-spin" size={28} color="#facc15" />
                <span>Memuat modul interaktif {activeSimulation.title}...</span>
              </div>
            }
          >
            <ActiveComponent />
          </Suspense>
        </div>
      </section>

      {/* 4. Rekomendasi Simulasi Lainnya untuk Eksplorasi Lanjutan */}
      <section className="sim-player-nav-bottom" aria-label="Simulasi Lainnya">
        <div className="sim-player-nav-heading">
          <span className="section-kicker">Eksplorasi Berikutnya</span>
          <h3>Simulasi Matematika Lainnya</h3>
        </div>

        <div className="sim-player-nav-grid">
          {otherSimulations.map((sim) => (
            <div
              key={sim.id}
              className="sim-player-nav-card"
              role="button"
              tabIndex={0}
              onClick={() => handleSwitchSimulation(sim.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSwitchSimulation(sim.id);
                }
              }}
            >
              <span>
                {sim.index} · {sim.level}
              </span>
              <strong>{sim.title}</strong>
              <small style={{ color: "var(--navy-bright)", fontWeight: 600 }}>
                Buka Simulasi Ini →
              </small>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
