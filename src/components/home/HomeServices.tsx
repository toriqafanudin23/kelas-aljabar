import { ArrowRight, BookOpen, ListChecks, Sliders } from "lucide-react";
import type { Page, Navigate } from "../../types/navigation";

interface ServiceItem {
  number: string;
  title: string;
  description: string;
  page: Page;
  href: string;
  linkLabel: string;
  icon: typeof BookOpen;
}

const services: ServiceItem[] = [
  {
    number: "01",
    title: "Materi Berjenjang",
    description:
      "Dua puluh satu modul kurikulum Fase E hingga F Lanjut, ditulis dengan notasi matematika presisi dan alur pembahasan bertahap.",
    page: "catalog",
    href: "/katalog",
    linkLabel: "Buka katalog materi",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Latihan Soal Interaktif",
    description:
      "Uji pemahaman topik per topik dengan penilaian otomatis dan pembahasan langkah demi langkah untuk persiapan ulangan hingga UTBK.",
    page: "practice",
    href: "/latihan-soal",
    linkLabel: "Mulai latihan soal",
    icon: ListChecks,
  },
  {
    number: "03",
    title: "Simulasi Visual",
    description:
      "Eksplorasi konsep abstrak — lingkaran satuan, transformasi, hingga limit — melalui grafik yang dapat Anda ubah sendiri.",
    page: "simulation",
    href: "/simulasi",
    linkLabel: "Jelajahi simulasi",
    icon: Sliders,
  },
];

interface HomeServicesProps {
  navigate: Navigate;
}

export function HomeServices({ navigate }: HomeServicesProps) {
  return (
    <section className="lp-services" aria-labelledby="lp-services-title">
      <div className="site-width">
        <header className="lp-section-head">
          <span className="section-kicker">Tiga cara belajar</span>
          <h2 id="lp-services-title">
            Pahami konsepnya, uji pemahaman, lalu lihat visualisasinya.
          </h2>
          <p>
            Setiap bagian saling melengkapi: materi menjelaskan, latihan
            mengukur, dan simulasi membangun intuisi.
          </p>
        </header>

        <div className="lp-services-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className="lp-service" key={service.number}>
                <div className="lp-service-top">
                  <span className="lp-service-number">{service.number}</span>
                  <span className="lp-service-icon" aria-hidden="true">
                    <Icon size={20} />
                  </span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a
                  className="lp-service-link"
                  href={service.href}
                  onClick={(event) => navigate(event, service.page)}
                >
                  {service.linkLabel}
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
