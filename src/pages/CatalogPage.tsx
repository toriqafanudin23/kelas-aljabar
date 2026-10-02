import { useState } from "react";
import { materials } from "../materi";
import type { Navigate } from "../types/navigation";
import { CourseCard } from "../components/CourseCard";

interface CatalogPageProps {
  navigate: Navigate;
}

export function CatalogPage({ navigate }: CatalogPageProps) {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Semua");

  const filterOptions = [
    "Semua",
    "Kelas X (Fase E)",
    "Kelas XI (Fase F)",
    "Kelas XII (Fase F Lanjut)",
    "Aljabar",
    "Geometri Analitik",
  ];

  const filteredMaterials = materials.filter((material) => {
    let matchesFilter = true;
    if (selectedFilter === "Kelas X (Fase E)") {
      matchesFilter = material.grade.includes("Kelas X");
    } else if (selectedFilter === "Kelas XI (Fase F)") {
      matchesFilter = material.grade.includes("Kelas XI");
    } else if (selectedFilter === "Kelas XII (Fase F Lanjut)") {
      matchesFilter = material.grade.includes("Kelas XII");
    } else if (selectedFilter === "Aljabar") {
      matchesFilter =
        material.category.includes("Aljabar") ||
        material.slug === "barisan-deret";
    } else if (selectedFilter === "Geometri Analitik") {
      matchesFilter = material.category.includes("Geometri");
    }

    const matchesSearch =
      `${material.number} ${material.category} ${material.title} ${material.grade} ${material.phase} ${material.prerequisite} ${material.description}`
        .toLowerCase()
        .includes(query.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pengelompokan materi sesuai urutan prasyarat kurikulum sekolah
  const groups = [
    {
      title: "1. Fase E (Kelas X) — Fondasi Aljabar, Fungsi & Statistika",
      subtitle:
        "Materi awal prasyarat untuk seluruh konsep matematika lanjutan di SMA.",
      items: filteredMaterials.filter((m) =>
        ["eksponensial", "sppl", "fungsi-kuadrat", "statistika"].includes(
          m.slug,
        ),
      ),
    },
    {
      title:
        "2. Fase F (Kelas XI) — Aljabar Matriks, Deret & Geometri Analitik",
      subtitle:
        "Pengembangan kalkulus diskrit, aljabar linear, dan pemetaan koordinat berprasyarat matriks.",
      items: filteredMaterials.filter((m) =>
        [
          "barisan-deret",
          "komposisi-fungsi-dan-invers",
          "polinomial",
          "matriks",
          "vektor",
          "transformasi-geometri",
        ].includes(m.slug),
      ),
    },
    {
      title:
        "3. Fase F Tingkat Lanjut (Kelas XII) — Pencacahan Diskrit & Peluang",
      subtitle:
        "Kaidah pencacahan sebagai prasyarat mutlak dalam membangun aksioma teori peluang.",
      items: filteredMaterials.filter((m) =>
        ["kombinatorika", "peluang"].includes(m.slug),
      ),
    },
    {
      title: "4. Fase F Tingkat Lanjut (Kelas XII) — Kalkulus",
      subtitle:
        "Pelajari limit sebagai fondasi turunan dan penerapannya dalam kalkulus diferensial.",
      items: filteredMaterials.filter((m) =>
        ["limit", "turunan"].includes(m.slug),
      ),
    },
    {
      title: "5. Fase F Tingkat Lanjut (Kelas XII) — Geometri Lingkaran",
      subtitle:
        "Pelajari keliling, luas, busur, juring, tali busur, garis singgung, dan penerapan lingkaran.",
      items: filteredMaterials.filter(
        (m) => m.slug === "busur-dan-juring-lingkaran",
      ),
    },
  ];

  // Apakah kita menampilkan grup berurutan atau daftar pencarian langsung
  const isDefaultView = query.trim() === "" && selectedFilter === "Semua";

  return (
    <main className="site-width inner-page catalog-page">
      <div className="breadcrumb">
        <a href="/" onClick={(event) => navigate(event, "home")}>
          Beranda
        </a>
        <span>/</span>
        <span>Katalog Materi</span>
      </div>

      <div className="page-intro">
        <span className="section-kicker">Kurikulum Terstruktur</span>
        <h1>Katalog Materi Pembelajaran Matematika</h1>
        <p>
          Disusun berurutan berdasarkan prasyarat keilmuan dan jenjang sekolah
          (Fase E, Fase F, hingga Fase F Lanjut). Setiap modul dilengkapi
          definisi formal, pembuktian sifat, contoh aplikatif, serta latihan
          mandiri.
        </p>
      </div>

      <div className="catalog-toolbar">
        <div className="category-pills">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              className={`pill-btn ${selectedFilter === opt ? "active" : ""}`}
              onClick={() => setSelectedFilter(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        <label className="search-box">
          <span className="sr-only">Cari materi matematika</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Cari materi, rumus, prasyarat..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {isDefaultView ? (
        <div className="catalog-grouped-view">
          {groups.map((group) =>
            group.items.length > 0 ? (
              <section key={group.title} className="catalog-group-section">
                <div className="catalog-group-header">
                  <h3>{group.title}</h3>
                  <p>{group.subtitle}</p>
                </div>
                <div className="course-grid">
                  {group.items.map((material) => (
                    <CourseCard
                      key={material.slug}
                      material={material}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </section>
            ) : null,
          )}

          <div className="catalog-group-section">
            <article className="course-card coming-card">
              <div className="coming-content">
                <span className="coming-label">
                  <span /> Pembaruan berkala
                </span>
                <h3>Modul Berikutnya</h3>
                <p>
                  Topik mendatang mencakup Integral Tak Tentu/Tentu serta Teori
                  Graf Diskrit.
                </p>
                <div className="coming-status">
                  <span>Status kurikulum</span>
                  <strong>Aktif disusun</strong>
                </div>
              </div>
              <div className="course-footer">
                <span>HTML &amp; LaTeX</span>
                <span>Segera Hadir</span>
              </div>
            </article>
          </div>
        </div>
      ) : (
        <div className="course-grid">
          {filteredMaterials.map((material) => (
            <CourseCard
              key={material.slug}
              material={material}
              navigate={navigate}
            />
          ))}

          {filteredMaterials.length === 0 && (
            <div className="empty-state">
              <p>Tidak ada materi yang cocok dengan pencarian “{query}”.</p>
              <button
                className="button button-quiet"
                onClick={() => {
                  setQuery("");
                  setSelectedFilter("Semua");
                }}
              >
                Reset Filter &amp; Pencarian
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
