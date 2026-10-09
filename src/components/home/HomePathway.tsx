import { ArrowRight } from "lucide-react";
import { enrichmentModule, pathwayStages } from "../../data/learningPathways";
import type { Navigate } from "../../types/navigation";

interface HomePathwayProps {
  navigate: Navigate;
}

export function HomePathway({ navigate }: HomePathwayProps) {
  return (
    <section className="lp-pathway" aria-labelledby="lp-pathway-title">
      <div className="site-width">
        <header className="lp-section-head">
          <span className="section-kicker">Peta kurikulum</span>
          <h2 id="lp-pathway-title">
            Dua puluh satu modul berjenjang, dari fondasi hingga kalkulus.
          </h2>
          <p>
            Ikuti urutan kelas, atau langsung buka topik yang sedang Anda
            pelajari.
          </p>
        </header>

        <div className="lp-stages">
          {pathwayStages.map((stage) => (
            <div className="lp-stage" key={stage.id}>
              <div className="lp-stage-head">
                <span className="lp-stage-phase">{stage.phase}</span>
                <h3>{stage.grade}</h3>
                <p>{stage.summary}</p>
                <span className="lp-stage-count">
                  {stage.modules.length} modul
                </span>
              </div>
              <ol className="lp-stage-list">
                {stage.modules.map((module) => (
                  <li key={module.slug}>
                    <a
                      className="lp-module"
                      href={`/materi/${module.slug}`}
                      onClick={(event) => navigate(event, module.slug)}
                    >
                      <span className="lp-module-number">{module.number}</span>
                      <span className="lp-module-title">{module.title}</span>
                      <ArrowRight
                        className="lp-module-arrow"
                        size={13}
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="lp-pathway-foot">
          <a
            className="lp-pathway-enrichment"
            href={`/materi/${enrichmentModule.slug}`}
            onClick={(event) => navigate(event, enrichmentModule.slug)}
          >
            <span className="lp-module-number">{enrichmentModule.number}</span>
            {enrichmentModule.title}
            <ArrowRight size={13} aria-hidden="true" />
          </a>
          <a
            className="lp-pathway-catalog"
            href="/katalog"
            onClick={(event) => navigate(event, "catalog")}
          >
            Lihat seluruh katalog materi
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
