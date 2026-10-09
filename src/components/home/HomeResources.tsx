import {
  ArrowRight,
  ClipboardList,
  FileText,
  Layers,
  Presentation,
} from "lucide-react";
import type { Navigate } from "../../types/navigation";

interface HomeResourcesProps {
  navigate: Navigate;
}

const resourceItems = [
  {
    title: "Modul Ajar Terstruktur",
    detail: "Tujuan pembelajaran, materi esensial, dan asesmen.",
    icon: FileText,
  },
  {
    title: "Slide Presentasi Kelas",
    detail: "Tipografi jernih dan bagan alur siap tayang proyektor.",
    icon: Presentation,
  },
  {
    title: "Bank Soal & Pembahasan",
    detail: "Soal pilihan ganda dan uraian lengkap dengan kunci.",
    icon: Layers,
  },
  {
    title: "LKPD Discovery & PBL",
    detail: "Lembar kerja penemuan terbimbing, siap cetak.",
    icon: ClipboardList,
  },
];

const resourceSpecs = [
  { label: "Format berkas", value: "PDF siap cetak & sumber LaTeX (.tex)" },
  { label: "Cakupan", value: "Fase E, F, dan F Lanjut (Kelas X–XII)" },
  { label: "Bentuk", value: "Paket per jenjang atau pemesanan khusus" },
];

export function HomeResources({ navigate }: HomeResourcesProps) {
  return (
    <section className="lp-resources" aria-labelledby="lp-resources-title">
      <div className="site-width lp-resources-inner">
        <div className="lp-resources-copy">
          <span className="section-kicker">Perangkat ajar</span>
          <h2 id="lp-resources-title">
            Perangkat mengajar yang sudah siap dipakai besok pagi.
          </h2>
          <p>
            Seluruh dokumen disusun mengikuti capaian pembelajaran kurikulum
            nasional, dapat langsung dicetak, dan tetap dapat Anda sunting
            karena disertakan berkas sumbernya.
          </p>

          <ul className="lp-resources-list">
            {resourceItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title}>
                  <span className="lp-resources-icon" aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <a
            className="button button-primary"
            href="/beli"
            onClick={(event) => navigate(event, "shop")}
          >
            Lihat Katalog Bahan Ajar
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        <aside
          className="lp-resources-panel"
          aria-label="Spesifikasi bahan ajar"
        >
          <h3>Spesifikasi</h3>
          <dl>
            {resourceSpecs.map((spec) => (
              <div className="lp-resource-spec" key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
          <p className="lp-resources-note">
            Tersedia paket hemat per jenjang kelas serta pemesanan khusus sesuai
            indikator capaian di sekolah Anda.
          </p>
        </aside>
      </div>
    </section>
  );
}
