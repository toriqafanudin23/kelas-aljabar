import type { Navigate } from "../types/navigation";
import { Formula } from "../components/Formula";
import { materials } from "../materi";

interface AboutPageProps {
  navigate?: Navigate;
}

export function AboutPage({ navigate }: AboutPageProps) {
  const handleNav = (
    event: React.MouseEvent<HTMLAnchorElement>,
    page: string,
  ) => {
    if (navigate) {
      navigate(event, page);
    }
  };

  return (
    <main className="site-width inner-page about-page">
      {/* Breadcrumb Navigasi */}
      <div className="breadcrumb">
        <a href="/" onClick={(e) => handleNav(e, "home")}>
          Beranda
        </a>
        <span>/</span>
        <span>Tentang Math 1729</span>
      </div>

      {/* Page Intro / Header */}
      <div className="page-intro">
        <span className="section-kicker">
          Materi Matematika · Simulasi Interaktif · Produk Digital
        </span>
        <h1>
          Platform belajar matematika yang membantu siswa memahami konsep, bukan
          sekadar menghafal rumus.
        </h1>
        <p>
          Math 1729 menghadirkan materi matematika SMA, simulasi interaktif, dan
          produk digital yang siap dipakai oleh siswa maupun guru. Tujuan
          platform ini adalah membuat pembelajaran matematika terasa lebih
          terstruktur, visual, dan bermakna dalam setiap jenjang belajar.
        </p>
      </div>

      {/* Profil Pengajar & Catatan Inisiator */}
      <section
        className="profile-section"
        aria-label="Profil dan Manifesto Penulis"
      >
        <div className="profile-card">
          <div className="profile-avatar" aria-hidden="true">
            TA
          </div>
          <h2>Toriq Afanudin</h2>
          <p className="profile-role">Pengajar Matematika</p>
          <span className="profile-tag">Inisiator &amp; Kurator Materi</span>

          <div className="profile-contact">
            <div className="contact-item">
              <span className="contact-label">DOMISILI &amp; BASIS</span>
              <strong>Kalikajar, Wonosobo, Jawa Tengah</strong>
            </div>
            <div className="contact-item">
              <span className="contact-label">SUREL RESMI</span>
              <strong>
                <a href="mailto:pesan.math1729@gmail.com">
                  pesan.math1729@gmail.com
                </a>
              </strong>
            </div>
            <div className="contact-item">
              <span className="contact-label">FOKUS KEILMUAN</span>
              <strong>Matematika SMA, Materi Web &amp; Simulasi</strong>
            </div>
          </div>

          <div className="profile-badge-note">
            Dedikasi penuh pada penyusunan materi berbasis pembuktian ilmiah
            &amp; pemahaman mendalam.
          </div>
        </div>

        <div className="profile-story">
          <span className="section-kicker">
            Visi Platform &amp; Fokus Pembelajaran
          </span>
          <h2>Kenapa Math 1729 dibangun?</h2>
          <p className="story-lead">
            Banyak siswa merasa matematika sulit bukan karena tidak mampu,
            tetapi karena materi yang mereka temui sering kali terlalu cepat,
            tidak runtut, atau hanya menampilkan rumus tanpa konteks pemahaman.
          </p>
          <p>
            Math 1729 hadir untuk menjawab kebutuhan itu. Kami membangun materi
            yang mengutamakan alur konsep yang logis, contoh yang jelas, dan
            latihan yang mengasah cara berpikir, bukan sekadar menghafal cara
            menjawab.
          </p>
          <p>
            Dengan pendekatan yang terstruktur, siswa dapat belajar mandiri,
            memahami makna di balik setiap prosedur, dan merasa lebih percaya
            diri saat menghadapi ujian, tugas, maupun tantangan matematis di
            level yang lebih tinggi.
          </p>
          <div className="quote-box">
            <blockquote>
              &ldquo;Matematika bukan tentang mengingat langkah paling cepat,
              tetapi tentang melihat pola, membangun pemahaman, dan menyusun
              alasan dengan jelas.&rdquo;
            </blockquote>
            <cite>— Toriq Afanudin</cite>
          </div>
        </div>
      </section>

      {/* Filosofi Nama: Bilangan Taksi Ramanujan 1729 */}
      <section className="method-note" aria-label="Filosofi Nama Math 1729">
        <div className="method-header">
          <span className="section-kicker">
            Filosofi Nama &amp; Cara Pandang Kami
          </span>
          <h2>Mengapa Dinamai &ldquo;Math 1729&rdquo;?</h2>
        </div>

        <div className="method-content-grid">
          <div className="method-narrative">
            <p>
              Nama <strong>Math 1729</strong> diambil dari angka 1729, yang
              terkenal dalam sejarah matematika karena melambangkan keindahan di
              balik hal yang tampak biasa.
            </p>
            <p>
              Angka ini mengingatkan kami bahwa matematika tidak selalu tampak
              istimewa pada awalnya. Kadang, yang terlihat sederhana justru
              menyimpan struktur yang luar biasa ketika kita melihatnya dengan
              fokus, ketelitian, dan pola berpikir yang benar.
            </p>
            <p>
              Itulah juga yang kami usung dalam setiap materi: tidak hanya
              menyajikan jawaban, tetapi menuntun siswa untuk menemukan
              hubungan, memahami logika, dan menghargai keindahan dalam pola
              matematika.
            </p>
          </div>

          <div className="method-formula-panel">
            <span className="formula-panel-label">
              Representasi Matematika Ikonik
            </span>
            <div className="formula-box-large">
              <Formula math="1729 = 1^3 + 12^3 = 9^3 + 10^3" />
            </div>
            <div className="formula-breakdown">
              <div className="breakdown-row">
                <span>Cara Pertama:</span>
                <strong>1 + 1728 = 1729</strong>
              </div>
              <div className="breakdown-row">
                <span>Cara Kedua:</span>
                <strong>729 + 1000 = 1729</strong>
              </div>
            </div>
            <div className="method-lesson-quote">
              <em>
                &ldquo;Keindahan matematika bukan hanya ada pada hasil akhir,
                tetapi pada proses melihat keteraturan di balik rincian yang
                tampak rumit.&rdquo;
              </em>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Nilai & Prinsip Pedagogis Platform */}
      <section
        className="principles-section"
        aria-label="Prinsip Pedagogis Math 1729"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              Metodologi &amp; Prinsip Pembelajaran
            </span>
            <h2>Tiga Standar Utama Math 1729</h2>
            <p>
              Kami membangun platform ini dengan fokus pada pemahaman, struktur,
              dan penggunaan yang praktis bagi siswa maupun guru.
            </p>
          </div>
        </div>

        <div className="principles-grid">
          <article className="principle-card">
            <span className="principle-index">01</span>
            <h3>Konsep yang Jelas dan Runtut</h3>
            <p>
              Setiap materi disusun secara bertahap agar siswa tidak sekadar
              menerima rumus, tetapi memahami mengapa rumus itu muncul dan
              bagaimana cara menggunakannya dalam konteks yang benar.
            </p>
            <span className="principle-tag">Pemahaman, bukan hafalan</span>
          </article>

          <article className="principle-card">
            <span className="principle-index">02</span>
            <h3>Visualisasi dan Eksplorasi</h3>
            <p>
              Matematika menjadi lebih mudah dipahami ketika siswa dapat melihat
              hubungan antar konsep, membandingkan bentuk, dan mengamati pola
              secara langsung melalui simulasi maupun representasi visual.
            </p>
            <span className="principle-tag">Belajar lebih konkret</span>
          </article>

          <article className="principle-card">
            <span className="principle-index">03</span>
            <h3>Siap Digunakan dalam Kelas dan Belajar Mandiri</h3>
            <p>
              Platform ini dirancang agar materi dapat dipakai siswa untuk
              belajar mandiri, guru untuk bahan ajar, dan kelas untuk
              mengeksplorasi konsep matematika dengan lebih efektif dan efisien.
            </p>
            <span className="principle-tag">Fleksibel untuk pembelajaran</span>
          </article>
        </div>
      </section>

      {/* Program dan Cakupan Kurikulum */}
      <section
        className="program-section"
        aria-label="Materi dan Fitur Math 1729"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Yang Tersedia di Platform</span>
            <h2>Materi dan Fitur yang Mendukung Pembelajaran</h2>
            <p>
              Platform ini dirancang untuk menjembatani kebutuhan belajar siswa,
              bahan ajar guru, dan eksplorasi konsep matematika secara visual.
            </p>
          </div>
        </div>

        <div className="program-grid">
          <article>
            <span>01 / MATERI WEB</span>
            <h3>Modul Matematika SMA</h3>
            <p>
              Jelajahi {materials.length} modul yang disusun secara bertahap dan
              mudah diikuti, mulai dari konsep dasar hingga aplikasi dalam
              konteks yang lebih kompleks.
            </p>
            <div className="program-footer">
              <strong>Fase E, Fase F, dan Fase F Lanjut</strong>
            </div>
          </article>

          <article>
            <span>02 / SIMULASI</span>
            <h3>Eksplorasi Konsep Secara Interaktif</h3>
            <p>
              Simulasi membantu siswa memahami bagaimana perubahan parameter
              memengaruhi bentuk, grafik, maupun hubungan antar variabel dalam
              matematika.
            </p>
            <div className="program-footer">
              <strong>Visualisasi yang lebih intuitif</strong>
            </div>
          </article>

          <article>
            <span>03 / PRODUK DIGITAL</span>
            <h3>Paket Bahan Ajar Siap Pakai</h3>
            <p>
              Kami menyediakan paket soal, slide presentasi, dan bahan ajar yang
              dapat langsung dipakai guru maupun siswa untuk mendukung proses
              belajar mengajar.
            </p>
            <div className="program-footer">
              <strong>Format PDF dan TeX yang fleksibel</strong>
            </div>
          </article>
        </div>
      </section>

      {/* CTA Box Ajakan Belajar & Kolaborasi */}
      <section className="about-cta-section" aria-label="Ajakan Belajar">
        <div className="about-cta-inner">
          <h2>Siap mulai belajar matematika dengan cara yang lebih jernih?</h2>
          <p>
            Jelajahi materi yang sudah kami susun, gunakan simulasi untuk
            memahami konsep, atau pilih produk digital yang sesuai kebutuhan
            kelas dan pembelajaran Anda.
          </p>
          <div className="about-cta-buttons">
            <a
              href="/katalog"
              className="button button-primary"
              onClick={(e) => handleNav(e, "catalog")}
            >
              Jelajahi Katalog {materials.length} Modul{" "}
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="/beli"
              className="button button-quiet"
              onClick={(e) => handleNav(e, "shop")}
            >
              Lihat Produk Digital <span aria-hidden="true">→</span>
            </a>
            <a
              href="mailto:pesan.math1729@gmail.com"
              className="button button-quiet"
            >
              Hubungi Admin Math 1729 ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
