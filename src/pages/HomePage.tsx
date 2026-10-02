import { materials } from "../materi";
import type { Navigate } from "../types/navigation";
import { CourseCard } from "../components/CourseCard";

interface HomePageProps {
  navigate: Navigate;
}

export function HomePage({ navigate }: HomePageProps) {
  const featuredSlugs = ["matriks", "kombinatorika", "turunan"];
  const featuredMaterials = featuredSlugs
    .map((slug) => materials.find((m) => m.slug === slug))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <>
      <section className="hero-band">
        <div className="site-width hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Kurikulum Matematika SMA Terstruktur
            </span>
            <h1>
              Kuasai matematika SMA dalam <em>30 hari.</em>
            </h1>
            <p>
              Sumber terbuka pelajaran matematika SMA yang disusun secara
              ilmiah, runtut berdasarkan urutan prasyarat, serta disesuaikan
              untuk persiapan OSN dan UTBK-SNBT.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href="/katalog"
                onClick={(event) => navigate(event, "catalog")}
              >
                Jelajahi Katalog Materi <span aria-hidden="true">→</span>
              </a>
              <a
                className="button button-quiet"
                href="/tentang"
                onClick={(event) => navigate(event, "about")}
              >
                Tentang Portal <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <aside className="focus-panel">
            <div className="panel-heading">
              <span>Fokus pembelajaran</span>
              <span className="panel-index">01 — 03</span>
            </div>
            <div className="focus-row">
              <span className="focus-number">01</span>
              <p>
                <strong>Matematika SMA</strong>
                <small>
                  Materi berjenjang Fase E, Fase F, dan Fase F Lanjut
                </small>
              </p>
            </div>
            <div className="focus-row">
              <span className="focus-number">02</span>
              <p>
                <strong>Persiapan Olimpiade</strong>
                <small>
                  Pendalaman konsep teoritis dan pembuktian matematis
                </small>
              </p>
            </div>
            <div className="focus-row">
              <span className="focus-number">03</span>
              <p>
                <strong>Persiapan UTBK-SNBT</strong>
                <small>
                  Penalaran matematika analitis dan pemecahan masalah
                  kuantitatif
                </small>
              </p>
            </div>
            <div className="panel-credit">
              <span>Disusun oleh</span>
              <strong>Toriq Afanudin</strong>
            </div>
          </aside>
        </div>
      </section>

      {/* Bagian Alur Prasyarat Belajar */}
      <section className="site-width learning-pathway-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Rekomendasi Alur Belajar</span>
            <h2>Urutan Pembelajaran Berdasarkan Prasyarat</h2>
            <p>
              Materi matematika saling berkesinambungan. Kuasai konsep fondasi
              sebelum melanjutkan ke topik tingkat lanjut:
            </p>
          </div>
        </div>

        <div className="pathway-grid">
          <div className="pathway-card">
            <div className="pathway-step">Tahap 1</div>
            <h4>Kelas X (Fase E)</h4>
            <p className="pathway-desc">
              Bangun dasar aljabar, fungsi, dan literasi data sebelum masuk ke
              materi lanjutan.
            </p>
            <ul className="pathway-list">
              <li>
                <strong>Modul 01:</strong> Eksponensial &amp; Logaritma
              </li>
              <li>
                <strong>Modul 02:</strong> Barisan &amp; Deret
              </li>
              <li>
                <strong>Modul 03:</strong> Sistem Persamaan &amp; Pertidaksamaan
                Linear
              </li>
              <li>
                <strong>Modul 04:</strong> Fungsi Kuadrat
              </li>
              <li>
                <strong>Modul 05:</strong> Statistika
              </li>
              <li>
                <strong>Modul 06:</strong> Trigonometri
              </li>
            </ul>
          </div>

          <div className="pathway-card">
            <div className="pathway-step">Tahap 2</div>
            <h4>Kelas XI (Fase F)</h4>
            <p className="pathway-desc">
              Perkuat fungsi dan aljabar, lalu lanjutkan ke aljabar linear serta
              geometri analitik.
            </p>
            <ul className="pathway-list">
              <li>
                <strong>Modul 07:</strong> Komposisi Fungsi &amp; Invers
              </li>
              <li>
                <strong>Modul 08:</strong> Polinomial
              </li>
              <li>
                <strong>Modul 09:</strong> Matriks
              </li>
              <li>
                <strong>Modul 10:</strong> Lingkaran
              </li>
              <li>
                <strong>Modul 11:</strong> Transformasi Geometri (Prasyarat:
                Matriks)
              </li>
              <li>
                <strong>Modul 12:</strong> Vektor
              </li>
              <li>
                <strong>Modul 13:</strong> Bilangan Kompleks
              </li>
              <li>
                <strong>Modul 14:</strong> Fungsi dan Pemodelan
              </li>
            </ul>
          </div>

          <div className="pathway-card">
            <div className="pathway-step">Tahap 3</div>
            <h4>Kelas XII (Fase F Lanjut)</h4>
            <p className="pathway-desc">
              Pelajari geometri analitik, transformasi grafik fungsi,
              pencacahan, peluang, serta kalkulus diferensial.
            </p>
            <ul className="pathway-list">
              <li>
                <strong>Modul 15:</strong> Limit Fungsi
              </li>
              <li>
                <strong>Modul 16:</strong> Turunan Fungsi (Prasyarat: Limit)
              </li>
              <li>
                <strong>Modul 17:</strong> Kombinatorika (Kaidah Pencacahan)
              </li>
              <li>
                <strong>Modul 18:</strong> Teori Peluang (Prasyarat:
                Kombinatorika)
              </li>
              <li>
                <strong>Modul 19:</strong> Transformasi Fungsi
              </li>
              <li>
                <strong>Modul 20:</strong> Irisan Kerucut
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Modul Pilihan */}
      <section id="materi" className="site-width catalog-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Modul Pilihan</span>
            <h2>Contoh Materi Unggulan</h2>
            <p>
              Pilih modul untuk mempelajari teori formal, sifat-sifat matematis,
              dan latihan soal.
            </p>
          </div>
          <a
            className="button button-quiet"
            href="/katalog"
            onClick={(event) => navigate(event, "catalog")}
          >
            Lihat Semua {materials.length} Modul di Katalog{" "}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="course-grid">
          {featuredMaterials.map((material) => (
            <CourseCard
              key={material.slug}
              material={material}
              navigate={navigate}
            />
          ))}
        </div>
      </section>

      <section className="about-band">
        <div className="site-width about-preview">
          <div className="about-copy">
            <span className="section-kicker">Informasi dan pengembang</span>
            <h2>Motivasi dan Harapan</h2>
            <p>
              Saya berharap di masa depan seluruh siswa Indonesia mendapat akses
              pendidikan yang sama dan sederajat, agar terealisasi kemajuan
              peradaban yang merata di seluruh negeri.
            </p>
            <a
              className="text-link"
              href="/tentang"
              onClick={(event) => navigate(event, "about")}
            >
              Kenali portal dan pengembang <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="profile-signature">
            <span className="initials">TA</span>
            <div>
              <strong>Toriq Afanudin</strong>
              <span>Pengajar Matematika · Wonosobo</span>
            </div>
            <a
              href="mailto:toriqafanudin23@gmail.com"
              aria-label="Kirim email ke Toriq Afanudin"
            >
              ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
