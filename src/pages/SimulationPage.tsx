import { useState } from "react";
import { ArrowRight, BookOpen, Compass } from "lucide-react";
import type { Navigate } from "../types/navigation";
import { SIMULATIONS } from "../data/simulationsData";

interface SimulationPageProps {
  navigate?: Navigate;
}

type SimulationFilterKey = "all" | "fase-e" | "fase-f" | "fase-f-lanjut";

export function SimulationPage({ navigate }: SimulationPageProps) {
  const [activeFilter, setActiveFilter] = useState<SimulationFilterKey>("all");

  const filteredSimulations = SIMULATIONS.filter((sim) => {
    if (activeFilter === "all") return true;
    return sim.gradeKey === activeFilter;
  });

  const handleOpenSimulation = (
    simId: string,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    try {
      window.sessionStorage.setItem("math1729.active-simulation", simId);
    } catch {}
    if (navigate) {
      window.history.pushState({}, "", `/simulasi-interaktif?topik=${simId}`);
      navigate(event, "simulation-play");
    }
  };

  const handleNav = (
    event: React.MouseEvent<HTMLAnchorElement>,
    page: string,
  ) => {
    if (navigate) navigate(event, page);
  };

  return (
    <main className="site-width inner-page simulation-page">
      {/* 1. Breadcrumb Navigasi */}
      <div className="breadcrumb">
        <a href="/" onClick={(e) => handleNav(e, "home")}>
          Beranda
        </a>
        <span>/</span>
        <span>Katalog Simulasi</span>
      </div>

      {/* 2. Page Intro Header */}
      <div className="page-intro">
        <span className="section-kicker">Laboratorium Visual Matematika</span>
        <h1>Katalog Simulasi Matematika Interaktif</h1>
        <p>
          Model interaktif berbasis web untuk mengeksplorasi konsep aljabar,
          geometri, trigonometri, dan kalkulus secara dinamis. Geser parameter, amati
          perubahan grafik secara instan, dan bangun intuisi matematis yang kokoh.
        </p>
      </div>

      {/* 3. Filter Jenjang Kurikulum */}
      <div
        className="sim-catalog-filter-bar"
        role="tablist"
        aria-label="Filter Jenjang Simulasi"
      >
        <button
          type="button"
          className={`sim-catalog-filter-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          Semua Jenjang ({SIMULATIONS.length} Simulasi)
        </button>
        <button
          type="button"
          className={`sim-catalog-filter-btn ${activeFilter === "fase-e" ? "active" : ""}`}
          onClick={() => setActiveFilter("fase-e")}
        >
          Kelas X (Fase E)
        </button>
        <button
          type="button"
          className={`sim-catalog-filter-btn ${activeFilter === "fase-f" ? "active" : ""}`}
          onClick={() => setActiveFilter("fase-f")}
        >
          Kelas XI (Fase F)
        </button>
        <button
          type="button"
          className={`sim-catalog-filter-btn ${activeFilter === "fase-f-lanjut" ? "active" : ""}`}
          onClick={() => setActiveFilter("fase-f-lanjut")}
        >
          Kelas XII (Fase F Lanjut)
        </button>
      </div>

      {/* 4. Grid Kartu Katalog Simulasi */}
      <section
        className="sim-catalog-grid"
        aria-label="Daftar Kartu Simulasi Matematika"
      >
        {filteredSimulations.map((sim) => (
          <article key={sim.id} className="sim-catalog-card">
            <div className="sim-card-top">
              <span className="sim-card-index">
                {sim.index} · {sim.category}
              </span>
              <span className="sim-card-level">{sim.level}</span>
            </div>

            <h2 className="sim-card-title">{sim.title}</h2>
            <p className="sim-card-desc">{sim.description}</p>

            {/* Konsep Kunci */}
            <div className="sim-card-concepts" aria-label="Konsep Kunci">
              {sim.concepts.map((concept) => (
                <span key={concept} className="sim-concept-pill">
                  {concept}
                </span>
              ))}
            </div>

            {/* Cuplikan Panduan Coba Amati */}
            <div className="sim-card-prompt-box">
              <strong>Fokus Eksplorasi:</strong>
              {sim.prompt}
            </div>

            {/* Tombol Aksi */}
            <div className="sim-card-actions">
              <a
                href={`/simulasi-interaktif?topik=${sim.id}`}
                className="sim-card-play-btn"
                onClick={(e) => handleOpenSimulation(sim.id, e)}
              >
                <span>Buka Simulasi</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>

              <a
                href={`/materi/${sim.relatedMaterialSlug}`}
                className="sim-card-theory-link"
                onClick={(e) => handleNav(e, sim.relatedMaterialSlug)}
              >
                <BookOpen size={13} aria-hidden="true" />
                <span>Pelajari Teori: {sim.relatedMaterialTitle}</span>
              </a>
            </div>
          </article>
        ))}
      </section>

      {/* 5. Banner Informasi Mode Layar Penuh */}
      <section className="sim-catalog-banner" aria-label="Panduan Kelas">
        <div className="sim-catalog-banner-text">
          <h4>Dukungan Presentasi Interaktif di Kelas</h4>
          <p>
            Seluruh simulasi dilengkapi fitur <strong>Layar Penuh (Fullscreen)</strong>{" "}
            dan dirancang menggunakan grafik vektor SVG resolusi tinggi tanpa pecah,
            sehingga nyaman digunakan oleh guru di layar proyektor ruang kelas.
          </p>
        </div>
        <a
          href={`/simulasi-interaktif?topik=${SIMULATIONS[0].id}`}
          className="button button-primary"
          onClick={(e) => handleOpenSimulation(SIMULATIONS[0].id, e)}
        >
          <Compass size={16} aria-hidden="true" />
          <span>Coba Simulasi Pertama ({SIMULATIONS[0].title})</span>
        </a>
      </section>
    </main>
  );
}
