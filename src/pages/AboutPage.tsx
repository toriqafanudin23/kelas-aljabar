export function AboutPage() {
  return (
    <main className="site-width inner-page about-page">
      <div className="breadcrumb">
        <a href="/">Beranda</a>
        <span>/</span>
        <span>Tentang</span>
      </div>
      <div className="page-intro">
        <span className="section-kicker">
          Profil Penulis dan Tentang Platform
        </span>
        <h1>Tentang Math 1729</h1>
        <p>
          Media pembelajaran digital untuk mempelajari matematika secara
          praktis, terstruktur, dan akademis.
        </p>
      </div>
      <section className="profile-section">
        <div className="profile-card">
          <span className="profile-avatar">TA</span>
          <h2>Toriq Afanudin</h2>
          <p>Pengajar Matematika</p>
          <span className="profile-tag">Inisiator &amp; pengembang</span>
          <div className="profile-contact">
            <span>
              LOKASI<strong>Kalikajar, Wonosobo</strong>
            </span>
            <span>
              EMAIL
              <strong>
                <a href="mailto:toriqafanudin23@gmail.com">
                  toriqafanudin23@gmail.com
                </a>
              </strong>
            </span>
          </div>
        </div>
        <div className="profile-story">
          <span className="section-kicker">Catatan pengembang</span>
          <h2>Alasan dibuatnya website pembelajaran ini.</h2>
          <p>
            Berawal dari keresahan penulis terhadap standarisasi materi
            matematika di Indonesia, dan juga keterbatasan akses sumber belajar
            yang berkualitas di berbagai daerah.
          </p>
          <p>
            Penulis berikhtiar menyusun materi matematika sekolah yang lengkap,
            presisi, dan terstruktur sesuai alur prasyarat keilmuan, sehingga
            setiap siswa dapat belajar mandiri secara optimal.
          </p>
        </div>
      </section>
      <section className="method-note">
        <span className="section-kicker">Tentang nama platform</span>
        <h2>Mengapa 1729?</h2>
        <p>
          1729 dikenal sebagai bilangan taksi Ramanujan: bilangan positif
          terkecil yang dapat ditulis sebagai jumlah dua kubus positif dengan
          dua cara berbeda.
        </p>
        <p>
          <strong>
            1729 = 1<sup>3</sup> + 12<sup>3</sup> = 9<sup>3</sup> + 10
            <sup>3</sup>
          </strong>
        </p>
        <p>
          Keistimewaan ini muncul dalam kisah matematikawan Srinivasa Ramanujan
          dan G. H. Hardy. Saat Hardy menganggap nomor taksi 1729 biasa saja,
          Ramanujan segera menunjukkan pola jumlah kubus tersebut.
        </p>
        <p>
          <em>
            Hal yang tampak tak berguna terkadang menyimpan pola dan keindahan
            yang belum kita temukan. Dengan rasa ingin tahu, sesuatu yang biasa
            dapat membuka makna baru.
          </em>
        </p>
      </section>
      <section className="program-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Kurikulum dan program</span>
            <h2>Cakupan pembelajaran</h2>
          </div>
        </div>
        <div className="program-grid">
          <article>
            <span>01 / SMA</span>
            <h3>Matematika SMA</h3>
            <p>
              Kurikulum berjenjang dari kelas X hingga XII (Fase E dan Fase F),
              mulai dari aljabar fondasi, matriks, hingga kalkulus dan
              statistika.
            </p>
          </article>
          <article>
            <span>02 / OSN</span>
            <h3>Persiapan Olimpiade</h3>
            <p>
              Pemecahan masalah non-rutin dalam aljabar, teori bilangan,
              geometri analitik, dan kombinatorika diskrit.
            </p>
          </article>
          <article>
            <span>03 / UTBK</span>
            <h3>Persiapan UTBK-SNBT</h3>
            <p>
              Penguatan penalaran matematika, pemodelan masalah nyata, dan
              pengetahuan kuantitatif.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
