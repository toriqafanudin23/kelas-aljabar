import { useState } from "react";
import { materials } from "../materi";
import type { Navigate } from "../types/navigation";
import { CourseCard } from "../components/CourseCard";

interface CatalogPageProps {
  navigate: Navigate;
}

const subjectFilters = [
  {
    name: "Aljabar",
    slugs: [
      "eksponensial",
      "barisan-deret",
      "sppl",
      "fungsi-kuadrat",
      "fungsi",
      "transformasi-fungsi",
      "komposisi-fungsi-dan-invers",
      "polinomial",
      "matriks",
    ],
  },
  {
    name: "Geometri",
    slugs: [
      "trigonometri",
      "vektor",
      "transformasi-geometri",
      "busur-dan-juring-lingkaran",
      "irisan-kerucut",
    ],
  },
  { name: "Statistika & Peluang", slugs: ["statistika", "peluang"] },
  { name: "Kombinatorika", slugs: ["kombinatorika"] },
  { name: "Kalkulus", slugs: ["limit", "turunan", "integral"] },
  { name: "Analisis", slugs: ["bilangan-kompleks"] },
  { name: "Olimpiade", slugs: ["teori-bilangan"] },
];

export function CatalogPage({ navigate }: CatalogPageProps) {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Semua");

  const filterOptions = [
    "Semua",
    "Kelas X (Fase E)",
    "Kelas XI (Fase F)",
    "Kelas XII (Fase F Lanjut)",
    ...subjectFilters.map((subject) => subject.name),
  ];

  const filteredMaterials = materials.filter((material) => {
    let matchesFilter = true;
    if (selectedFilter === "Kelas X (Fase E)") {
      matchesFilter = material.grade.includes("Kelas X");
    } else if (selectedFilter === "Kelas XI (Fase F)") {
      matchesFilter = material.grade.includes("Kelas XI");
    } else if (selectedFilter === "Kelas XII (Fase F Lanjut)") {
      matchesFilter = material.grade.includes("Kelas XII");
    } else {
      const selectedSubject = subjectFilters.find(
        (subject) => subject.name === selectedFilter,
      );
      if (selectedSubject) {
        matchesFilter = selectedSubject.slugs.includes(material.slug);
      }
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
      title: "1. Kelas X (Fase E) — Bilangan, Aljabar, Fungsi & Statistika",
      subtitle:
        "Eksponen dan logaritma, barisan dan deret, sistem linear, fungsi kuadrat, statistika dasar, serta trigonometri.",
      items: filteredMaterials.filter((m) =>
        [
          "eksponensial",
          "barisan-deret",
          "sppl",
          "fungsi-kuadrat",
          "statistika",
          "trigonometri",
        ].includes(m.slug),
      ),
    },
    {
      title: "2. Kelas XI (Fase F) — Aljabar, Geometri & Vektor",
      subtitle:
        "Komposisi fungsi dan invers, polinomial, matriks, vektor, transformasi geometri, serta lingkaran.",
      items: filteredMaterials.filter((m) =>
        [
          "komposisi-fungsi-dan-invers",
          "polinomial",
          "matriks",
          "vektor",
          "transformasi-geometri",
          "busur-dan-juring-lingkaran",
          "bilangan-kompleks",
          "fungsi",
        ].includes(m.slug),
      ),
    },
    {
      title:
        "3. Kelas XII (Fase F Lanjut) — Geometri, Fungsi, Pencacahan, Peluang & Kalkulus",
      subtitle:
        "Irisan kerucut, transformasi grafik fungsi, kombinatorika, peluang, serta limit, turunan, dan integral.",
      items: filteredMaterials.filter((m) =>
        [
          "limit",
          "turunan",
          "kombinatorika",
          "peluang",
          "transformasi-fungsi",
          "irisan-kerucut",
          "integral",
        ].includes(m.slug),
      ),
    },
    {
      title: "4. Materi Khusus Olimpiade Matematika",
      subtitle: "Pendalaman teori bilangan di luar cakupan pelajaran reguler.",
      items: filteredMaterials.filter((m) => m.slug === "teori-bilangan"),
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
                  {[...group.items]
                    .sort(
                      (firstMaterial, secondMaterial) =>
                        Number(firstMaterial.number) -
                        Number(secondMaterial.number),
                    )
                    .map((material) => (
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
        </div>
      ) : (
        <div className="course-grid">
          {[...filteredMaterials]
            .sort(
              (firstMaterial, secondMaterial) =>
                Number(firstMaterial.number) - Number(secondMaterial.number),
            )
            .map((material) => (
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
