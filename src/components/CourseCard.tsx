import type { Material } from "../materi";
import type { Navigate } from "../types/navigation";
import { getPathFromPage } from "../types/navigation";
import { Formula } from "./Formula";

interface CourseCardProps {
  material: Material;
  navigate: Navigate;
}

export function CourseCard({ material, navigate }: CourseCardProps) {
  return (
    <article className="course-card" key={material.slug}>
      <div className="course-meta">
        <span>{material.category}</span>
        <span>Modul {material.number}</span>
      </div>
      <div className="course-content">
        <div className="course-header-row">
          <p className="course-grade">
            {material.grade} <span>·</span> {material.phase}
          </p>
          {material.prerequisite && (
            <span className="course-prerequisite" title={`Prasyarat: ${material.prerequisite}`}>
              <small>Prasyarat:</small> {material.prerequisite}
            </span>
          )}
        </div>
        <h3>
          <a
            href={getPathFromPage(material.slug)}
            onClick={(event) => navigate(event, material.slug)}
          >
            {material.title}
          </a>
        </h3>
        <div className="formula-preview">
          <Formula math={material.formula} />
        </div>
        <p className="course-description">{material.description}</p>
      </div>
      <div className="course-footer">
        <span>Akses terbuka</span>
        <a
          href={getPathFromPage(material.slug)}
          onClick={(event) => navigate(event, material.slug)}
        >
          Baca modul <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
