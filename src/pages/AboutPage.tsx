import type { Navigate } from "../types/navigation";
import { materials } from "../materi";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  FileText,
  Layers,
  Mail,
  MessageSquare,
  Presentation,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { ORDER_EMAIL, PHONE_WA, WHATSAPP_LINK } from "../data/shopProducts";

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
      {/* 1. Breadcrumb Navigasi */}
      <div className="breadcrumb">
        <a href="/" onClick={(e) => handleNav(e, "home")}>
          Beranda
        </a>
        <span>/</span>
        <span>Tentang Math 1729</span>
      </div>

      {/* 2. Page Intro / Header */}
      <div className="page-intro">
        <span className="section-kicker">
          Profil Platform &amp; Ekosistem Pembelajaran
        </span>
        <h1>
          Portal Pembelajaran &amp; Perangkat Ajar Matematika SMA
        </h1>
        <p>
          Math 1729 adalah platform edukasi matematika yang dirancang untuk mendukung
          pembelajaran tingkat SMA/MA. Kami mengintegrasikan materi kurikulum lengkap,
          latihan soal interaktif, simulasi visual, serta bahan ajar siap pakai
          untuk guru dalam satu ekosistem yang terstruktur, presisi, dan mudah diakses.
        </p>
      </div>

      {/* 3. Fokus, Misi & Standar Pengembangan Platform */}
      <section
        className="about-overview-section"
        aria-label="Fokus dan Standar Pembelajaran"
      >
        <div className="about-overview-grid">
          <div className="about-overview-text">
            <span className="section-kicker">Tujuan &amp; Pendekatan</span>
            <h2>Menjembatani Pemahaman Konsep &amp; Efisiensi Kelas</h2>
            <p>
              Pembelajaran matematika sering kali terhambat oleh penyampaian yang
              terburu-buru, hafalan rumus tanpa alur pembuktian logis, serta
              keterbatasan media visual yang membantu intuisi konsep siswa.
            </p>
            <p>
              Di saat yang sama, guru dan pengajar kerap menghadapi keterbatasan
              waktu dalam menyusun perangkat ajar berkualitas tinggi mulai dari
              modul ajar, slide tayang proyektor, bank soal evaluasi, hingga lembar kerja
              peserta didik (LKPD) yang terstruktur.
            </p>
            <p>
              Math 1729 hadir untuk menjawab kedua kebutuhan tersebut: menyediakan
              jalur belajar mandiri yang runtut dan interaktif bagi siswa, sekaligus
              menyediakan perangkat ajar siap pakai berstandar akademis bagi guru di kelas.
            </p>
          </div>

          <aside
            className="about-standards-card"
            aria-label="Standar Mutu Platform"
          >
            <h3>Standar Pengembangan Math 1729</h3>
            <div className="about-standards-list">
              <div className="about-standard-item">
                <div className="about-standard-item-icon" aria-hidden="true">
                  <ShieldCheck size={16} />
                </div>
                <div className="about-standard-item-content">
                  <strong>Kurikulum Merdeka</strong>
                  <span>
                    Selaras dengan capaian Fase E (Kelas X), Fase F (Kelas XI), dan
                    Fase F Lanjut (Kelas XII).
                  </span>
                </div>
              </div>

              <div className="about-standard-item">
                <div className="about-standard-item-icon" aria-hidden="true">
                  <BookOpen size={16} />
                </div>
                <div className="about-standard-item-content">
                  <strong>Presisi Notasi KaTeX &amp; LaTeX</strong>
                  <span>
                    Formula matematis baku berstandar jurnal ilmiah pada tampilan web
                    serta dokumen cetak.
                  </span>
                </div>
              </div>

              <div className="about-standard-item">
                <div className="about-standard-item-icon" aria-hidden="true">
                  <Sliders size={16} />
                </div>
                <div className="about-standard-item-content">
                  <strong>Intuisi Berbasis Visual</strong>
                  <span>
                    Didukung simulasi interaktif untuk memperjelas konsep abstrak
                    secara nyata dan dinamis.
                  </span>
                </div>
              </div>

              <div className="about-standard-item">
                <div className="about-standard-item-icon" aria-hidden="true">
                  <Layers size={16} />
                </div>
                <div className="about-standard-item-content">
                  <strong>Format PDF &amp; LaTeX (.tex)</strong>
                  <span>
                    Bahan ajar siap cetak dan berkas sumber terbuka yang dapat
                    disesuaikan dengan kebutuhan sekolah.
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 4. Empat Pilar Layanan Platform */}
      <section
        className="principles-section"
        aria-label="4 Pilar Layanan Math 1729"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Ekosistem Terpadu</span>
            <h2>4 Pilar Utama Platform Math 1729</h2>
            <p>
              Seluruh komponen dirancang saling melengkapi untuk membangun pemahaman
              matematika yang utuh bagi siswa dan mempermudah tugas pengajaran guru.
            </p>
          </div>
        </div>

        <div className="about-pillars-grid">
          {/* Pilar 1 */}
          <article className="about-pillar-card">
            <span className="about-pillar-badge">01 · Silabus Lengkap</span>
            <h3>Materi Kurikulum SMA</h3>
            <p>
              {materials.length} modul pembelajaran berjenjang dari Fase E hingga
              Fase F Lanjut. Memuat definisi runtut, penurunan rumus matematis,
              dan contoh soal kontekstual.
            </p>
            <a
              href="/katalog"
              className="about-pillar-footer"
              onClick={(e) => handleNav(e, "catalog")}
            >
              Buka Katalog Materi <ArrowRight size={13} aria-hidden="true" />
            </a>
          </article>

          {/* Pilar 2 */}
          <article className="about-pillar-card">
            <span className="about-pillar-badge">02 · Evaluasi Mandiri</span>
            <h3>Latihan Soal Interaktif</h3>
            <p>
              Paket soal latihan per topik dengan koreksi otomatis, umpan balik
              langsung, dan pembahasan langkah demi langkah untuk persiapan ulangan
              serta UTBK-SNBT.
            </p>
            <a
              href="/latihan-soal"
              className="about-pillar-footer"
              onClick={(e) => handleNav(e, "practice")}
            >
              Mulai Latihan Soal <ArrowRight size={13} aria-hidden="true" />
            </a>
          </article>

          {/* Pilar 3 */}
          <article className="about-pillar-card">
            <span className="about-pillar-badge">03 · Eksplorasi Visual</span>
            <h3>Simulasi Dinamis</h3>
            <p>
              Eksplorasi visual interaktif berbasis web untuk konsep lingkaran
              satuan trigonometri, fungsi kuadrat, transformasi geometri, dan kalkulus
              agar pemahaman konsep lebih kokoh.
            </p>
            <a
              href="/simulasi"
              className="about-pillar-footer"
              onClick={(e) => handleNav(e, "simulation")}
            >
              Jelajahi Simulasi <ArrowRight size={13} aria-hidden="true" />
            </a>
          </article>

          {/* Pilar 4 */}
          <article className="about-pillar-card">
            <span className="about-pillar-badge">04 · Solusi Pendidik</span>
            <h3>Bahan Ajar Siap Pakai</h3>
            <p>
              Perangkat ajar siap pakai untuk guru: modul ajar kurikulum merdeka,
              slide presentasi kelas, bank soal asesmen, dan LKPD Discovery
              Learning dalam format PDF &amp; LaTeX (.tex).
            </p>
            <a
              href="/beli"
              className="about-pillar-footer"
              onClick={(e) => handleNav(e, "shop")}
            >
              Katalog Bahan Ajar <ArrowRight size={13} aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>

      {/* 5. Spesifikasi Bahan Ajar Siap Pakai untuk Guru & Sekolah */}
      <section
        className="about-specs-section"
        aria-label="Spesifikasi Bahan Ajar Guru"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Perangkat Pengajaran Kelas</span>
            <h2>Spesifikasi Bahan Ajar Siap Pakai</h2>
            <p>
              Disusun secara sistematis untuk menghemat waktu persiapan mengajar dan
              menjaga mutu akademik pembelajaran di kelas.
            </p>
          </div>
        </div>

        <div className="about-specs-grid">
          <div className="about-spec-card">
            <div className="about-spec-icon" aria-hidden="true">
              <FileText size={18} />
            </div>
            <h3>Modul Ajar Terstruktur</h3>
            <p>
              Memuat tujuan pembelajaran (TP/ATP), ringkasan konsep esensial,
              contoh soal bertingkat, dan rubrik asesmen capaian belajar siswa.
            </p>
            <span className="about-spec-meta">Format .pdf &amp; .tex editable</span>
          </div>

          <div className="about-spec-card">
            <div className="about-spec-icon" aria-hidden="true">
              <Presentation size={18} />
            </div>
            <h3>Slide Presentasi Kelas</h3>
            <p>
              Bahan tayang proyektor dengan tipografi jernih, bagan alir konsep, dan
              grafik fungsi beresolusi tinggi tanpa elemen distraksi visual.
            </p>
            <span className="about-spec-meta">Format .pdf siap proyektor</span>
          </div>

          <div className="about-spec-card">
            <div className="about-spec-icon" aria-hidden="true">
              <Layers size={18} />
            </div>
            <h3>Bank Soal &amp; Pembahasan</h3>
            <p>
              Kumpulan paket soal latihan harian, ujian semester, dan paket TKA
              SMP/SMA lengkap dengan kunci jawaban serta pembahasan mendalam.
            </p>
            <span className="about-spec-meta">Pilihan Ganda &amp; Uraian</span>
          </div>

          <div className="about-spec-card">
            <div className="about-spec-icon" aria-hidden="true">
              <ClipboardList size={18} />
            </div>
            <h3>LKPD Discovery &amp; PBL</h3>
            <p>
              Lembar Kerja Peserta Didik berbasis metode penemuan terbimbing untuk
              memandu siswa menemukan konsep secara mandiri melalui diskusi kelompok.
            </p>
            <span className="about-spec-meta">Aktivitas Berbasis Diskusi</span>
          </div>
        </div>
      </section>

      {/* 6. Pusat Layanan & Kontak Resmi (Institusional) */}
      <section
        className="about-contact-section"
        aria-label="Kontak dan Layanan Resmi"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Layanan &amp; Komunikasi</span>
            <h2>Pusat Layanan &amp; Informasi Resmi</h2>
            <p>
              Untuk pertanyaan seputar modul materi, permintaan pratinjau dokumen,
              maupun pemesanan paket bahan ajar sekolah, silakan hubungi kanal resmi kami:
            </p>
          </div>
        </div>

        <div className="about-contact-grid">
          <div className="about-contact-card">
            <strong>
              <Mail size={16} aria-hidden="true" style={{ verticalAlign: "middle", marginRight: 6, color: "var(--navy)" }} />
              Surat Elektronik Resmi
            </strong>
            <span>Pertanyaan materi, konfirmasi pesanan, dan kerja sama:</span>
            <a href={`mailto:${ORDER_EMAIL}`}>{ORDER_EMAIL}</a>
          </div>

          <div className="about-contact-card">
            <strong>
              <MessageSquare size={16} aria-hidden="true" style={{ verticalAlign: "middle", marginRight: 6, color: "var(--navy)" }} />
              Layanan WhatsApp
            </strong>
            <span>Konsultasi cepat kebutuhan bahan ajar dan konfirmasi admin:</span>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              +62 {PHONE_WA} ↗
            </a>
          </div>

          <div className="about-contact-card">
            <strong>
              <ArrowRight size={16} aria-hidden="true" style={{ verticalAlign: "middle", marginRight: 6, color: "var(--navy)" }} />
              Katalog Produk &amp; Pratinjau
            </strong>
            <span>Lihat daftar lengkap bahan ajar dan unduh pratinjau dokumen:</span>
            <a
              href="/beli"
              onClick={(e) => handleNav(e, "shop")}
            >
              Katalog Bahan Ajar Lengkap →
            </a>
          </div>
        </div>
      </section>

      {/* 7. CTA Penutup */}
      <section className="about-cta-section" aria-label="Ajakan Belajar">
        <div className="about-cta-inner">
          <h2>Kuasai Matematika Lebih Mendalam. Mengajar Lebih Efektif.</h2>
          <p>
            Mulai pelajari materi kurikulum SMA dan coba latihan soal interaktif
            secara cuma-cuma, atau lengkapi perangkat kelas Anda dengan paket
            bahan ajar siap pakai hari ini.
          </p>
          <div className="about-cta-buttons">
            <a
              href="/katalog"
              className="button button-primary"
              onClick={(e) => handleNav(e, "catalog")}
            >
              Buka Katalog Materi ({materials.length} Modul){" "}
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="/latihan-soal"
              className="button button-quiet"
              onClick={(e) => handleNav(e, "practice")}
            >
              Latihan Soal Interaktif <span aria-hidden="true">→</span>
            </a>
            <a
              href="/beli"
              className="button button-quiet"
              onClick={(e) => handleNav(e, "shop")}
            >
              Pilih Bahan Ajar Siap Pakai <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
