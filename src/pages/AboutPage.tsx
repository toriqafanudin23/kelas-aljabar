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
          Belajar Matematika Lewat Materi Web, Simulasi, dan Bahan Ajar Digital
        </h1>
        <p>
          Math 1729 menyediakan {materials.length} modul matematika SMA berbasis
          web, simulasi interaktif, serta produk digital berupa paket soal,
          slide presentasi, dan bahan ajar per materi. Materi web dapat
          dipelajari langsung, sementara produk digital tersedia melalui halaman
          toko.
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
            Catatan Inisiator &amp; Manifesto
          </span>
          <h2>Alasan Dibangunnya Platform Ini</h2>
          <p className="story-lead">
            Berawal dari keresahan mendalam terhadap kesenjangan kualitas
            pendidikan matematika di Indonesia, khususnya perbedaan akses materi
            berkualitas antara kota-kota metropolitan dengan daerah.
          </p>
          <p>
            Banyak siswa berbakat dan berpotensi tinggi mengalami kesulitan
            memahami matematika bukan karena mereka kekurangan kemampuan logika,
            melainkan karena sebagian besar sumber belajar yang beredar sekadar
            menyodorkan rumus instan tanpa penurunan konsep, lompat-lompat tanpa
            prasyarat runtut, atau dijejali materi hafalan yang membingungkan.
          </p>
          <p>
            Oleh karena itu, Math 1729 hadir sebagai ikhtiar nyata: menyusun
            materi matematika sekolah secara lengkap, presisi, dan terstruktur
            berdasarkan alur prasyarat keilmuan yang kokoh. Dengan demikian,
            setiap siswa di mana pun mereka berada dapat belajar mandiri secara
            optimal dan memiliki daya saing yang setara.
          </p>
          <div className="quote-box">
            <blockquote>
              &ldquo;Pendidikan matematika yang benar bukan tentang menghafal
              rumus paling cepat, melainkan tentang melatih ketajaman akal budi
              untuk mengenali struktur, pola, dan kebenaran logis secara
              jernih.&rdquo;
            </blockquote>
            <cite>— Toriq Afanudin</cite>
          </div>
        </div>
      </section>

      {/* Filosofi Nama: Bilangan Taksi Ramanujan 1729 */}
      <section className="method-note" aria-label="Filosofi Nama Math 1729">
        <div className="method-header">
          <span className="section-kicker">
            Filosofi Keilmuan &amp; Nama Platform
          </span>
          <h2>Mengapa Dinamai &ldquo;Math 1729&rdquo;?</h2>
        </div>

        <div className="method-content-grid">
          <div className="method-narrative">
            <p>
              Nama portal ini terinspirasi dari percakapan legendaris pada tahun
              1918 antara matematikawan asal Inggris <strong>G.H. Hardy</strong>{" "}
              dan jenius matematika asal India{" "}
              <strong>Srinivasa Ramanujan</strong>.
            </p>
            <p>
              Saat Hardy mengunjungi Ramanujan yang terbaring sakit di Putney,
              London, Hardy menceritakan bahwa ia baru saja menaiki taksi dengan
              nomor pelat <strong>1729</strong>, yang menurut Hardy terasa
              sangat membosankan dan pertanda yang kurang menguntungkan.
              Mendengar hal itu, Ramanujan seketika menyanggah:
            </p>
            <div className="dialogue-card">
              <span className="speaker">Srinivasa Ramanujan:</span>
              <p>
                &ldquo;Tidak, Hardy! Itu adalah angka yang sangat istimewa. 1729
                adalah bilangan bulat positif terkecil yang dapat dinyatakan
                sebagai jumlah dari dua kubus positif dengan dua cara
                berbeda!&rdquo;
              </p>
            </div>
            <p>
              Kisah ini mengabadikan angka 1729 sebagai{" "}
              <em>Hardy-Ramanujan Taxicab Number</em> dan menjadi simbol abadi
              tentang bagaimana rasa ingin tahu intelektual mampu melihat
              keindahan luar biasa di balik hal yang dianggap remeh oleh orang
              lain.
            </p>
          </div>

          <div className="method-formula-panel">
            <span className="formula-panel-label">
              Notasi Matematika Taksi Ramanujan
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
                &ldquo;Hal yang tampak biasa terkadang menyimpan keteraturan
                yang menakjubkan. Dengan penalaran yang tepat, matematika tidak
                lagi menjadi beban, melainkan jendela untuk menyaksikan
                keindahan logika murni.&rdquo;
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
              Setiap bab dan latihan soal dirancang berdasarkan pedoman
              pedagogis yang ketat untuk menjamin kedalaman pemahaman siswa.
            </p>
          </div>
        </div>

        <div className="principles-grid">
          <article className="principle-card">
            <span className="principle-index">01</span>
            <h3>Rigoritas Konsep &amp; Pembuktian Formal</h3>
            <p>
              Kami menolak doktrin &ldquo;hafal rumus tanpa paham&rdquo;. Setiap
              rumus, teorema, dan sifat aljabar selalu dilengkapi bukti logis,
              penurunan matematis bertahap, dan visualisasi geometris agar
              konsep menancap kuat dalam memori jangka panjang.
            </p>
            <span className="principle-tag">Bukan Trik Cepat Sesaat</span>
          </article>

          <article className="principle-card">
            <span className="principle-index">02</span>
            <h3>Alur Prasyarat Runtut (Zero Gaps)</h3>
            <p>
              Matematika bersifat hierarkis dan kumulatif. Kami memetakan
              seluruh modul berdasarkan ketergantungan logika prasyaratnya.
              Siswa tidak akan dibiarkan tersesat di kalkulus atau polinomial
              tingkat tinggi tanpa fondasi aljabar dan fungsi yang matang.
            </p>
            <span className="principle-tag">Tangga Pemahaman Sistematis</span>
          </article>

          <article className="principle-card">
            <span className="principle-index">03</span>
            <h3>Penalaran Abstraksi &amp; Soal Non-Rutin</h3>
            <p>
              Untuk menguasai UTBK-SNBT dan seleksi Olimpiade (OSN), siswa
              membutuhkan fleksibilitas berpikir, bukan hafalan tipe soal.
              Kurikulum Math 1729 melatih abstraksi tingkat tinggi agar siswa
              siap menghadapi permasalahan matematika yang belum pernah dilihat
              sebelumnya.
            </p>
            <span className="principle-tag">Kesiapan Kompetisi Nasional</span>
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
            <h2>Materi dan Fitur Math 1729</h2>
            <p>
              Pilih materi untuk dipelajari langsung di web, gunakan simulasi
              untuk mengeksplorasi konsep, atau pesan bahan ajar digital.
            </p>
          </div>
        </div>

        <div className="program-grid">
          <article>
            <span>01 / MATERI WEB</span>
            <h3>Modul Matematika SMA</h3>
            <p>
              Jelajahi {materials.length} modul kelas X hingga XII dengan materi
              konsep, contoh, dan pembahasan yang tersusun berjenjang. Semua
              materi dapat dibuka langsung melalui katalog website.
            </p>
            <div className="program-footer">
              <strong>Fase E, Fase F, dan Fase F Lanjut</strong>
            </div>
          </article>

          <article>
            <span>02 / SIMULASI</span>
            <h3>Eksplorasi Matematika Interaktif</h3>
            <p>
              Gunakan visualisasi interaktif untuk mengamati perubahan konsep
              matematika secara langsung, termasuk simulasi trigonometri dan
              lingkaran satuan.
            </p>
            <div className="program-footer">
              <strong>Visualisasi konsep matematika</strong>
            </div>
          </article>

          <article>
            <span>03 / PRODUK DIGITAL</span>
            <h3>Paket Bahan Ajar Siap Pakai</h3>
            <p>
              Pesan paket soal per kelas, slide presentasi, atau paket bahan
              ajar per materi. Produk tersedia dalam format PDF dan TeX.
            </p>
            <div className="program-footer">
              <strong>Pesanan melalui halaman toko</strong>
            </div>
          </article>
        </div>
      </section>

      {/* CTA Box Ajakan Belajar & Kolaborasi */}
      <section className="about-cta-section" aria-label="Ajakan Belajar">
        <div className="about-cta-inner">
          <h2>Siap Menyelami Matematika yang Sesungguhnya?</h2>
          <p>
            Mulailah menjelajahi seluruh {materials.length} modul yang telah
            kami susun secara terstruktur, atau hubungi pengajar untuk
            pertanyaan dan kolaborasi keilmuan.
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
              Hubungi Toriq Afanudin (Surel) ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
