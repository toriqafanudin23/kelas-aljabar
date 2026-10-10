export interface SimulationItem {
  id: string;
  index: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  level: string;
  gradeKey: "fase-e" | "fase-f" | "fase-f-lanjut";
  relatedMaterialSlug: string;
  relatedMaterialTitle: string;
  concepts: string[];
}

export const SIMULATIONS: SimulationItem[] = [
  {
    id: "trigonometry",
    index: "01",
    category: "TRIGONOMETRI",
    title: "Lingkaran Satuan & Nilai Perbandingan",
    description:
      "Geser titik pada lingkaran satuan atau atur sudutnya. Koordinat titik menunjukkan nilai kosinus dan sinus; grafik memperlihatkan perubahan sinus, kosinus, dan tangen secara langsung.",
    prompt:
      "Pada sudut mana nilai sinus dan kosinus bernilai sama? Amati bagaimana tanda positif/negatif koordinat berubah saat titik melintasi tiap kuadran.",
    level: "Kelas X · Fase E",
    gradeKey: "fase-e",
    relatedMaterialSlug: "trigonometri",
    relatedMaterialTitle: "Perbandingan Trigonometri",
    concepts: [
      "Lingkaran Satuan",
      "Sinus",
      "Kosinus",
      "Tangen",
      "Kuadran I–IV",
    ],
  },
  {
    id: "quadratic",
    index: "02",
    category: "FUNGSI KUADRAT",
    title: "Eksplorasi Parameter Fungsi Kuadrat",
    description:
      "Ubah koefisien a, b, dan c untuk melihat pengaruhnya secara langsung terhadap kelengkungan parabola, titik puncak, sumbu simetri, akar persamaan, dan nilai diskriminan.",
    prompt:
      "Ubah satu koefisien dalam satu waktu. Bagaimana tanda koefisien 'a' menentukan arah keterbukaan parabola, dan bagaimana 'b' menggeser puncak grafik?",
    level: "Kelas X · Fase E",
    gradeKey: "fase-e",
    relatedMaterialSlug: "fungsi-kuadrat",
    relatedMaterialTitle: "Fungsi Kuadrat",
    concepts: ["Parabola", "Diskriminan (D)", "Titik Puncak", "Akar Persamaan"],
  },
  {
    id: "transformation",
    index: "03",
    category: "TRANSFORMASI GEOMETRI",
    title: "Eksplorasi Transformasi Geometri Bidang",
    description:
      "Geser bangun asal, lalu susun operasi translasi, refleksi, rotasi, atau dilatasi. Amati perubahan koordinat bayangan serta representasi matriks transformasinya.",
    prompt:
      "Terapkan satu transformasi pada satu waktu. Jenis transformasi mana yang mempertahankan panjang dan sudut (isometri), dan mana yang mengubah ukuran bangun?",
    level: "Kelas XI · Fase F",
    gradeKey: "fase-f",
    relatedMaterialSlug: "transformasi-geometri",
    relatedMaterialTitle: "Transformasi Geometri",
    concepts: [
      "Translasi",
      "Refleksi",
      "Rotasi",
      "Dilatasi",
      "Matriks Transformasi",
    ],
  },
  {
    id: "function-transformation",
    index: "04",
    category: "TRANSFORMASI FUNGSI",
    title: "Eksplorasi Transformasi Grafik Fungsi",
    description:
      "Pilih fungsi dasar aljabar, lalu ubah parameter pergeseran horizontal/vertikal, refleksi sumbu, dan peregangan grafik untuk memahami efek setiap pengali rumus.",
    prompt:
      "Prediksi arah pergeseran grafik sebelum mengubah nilai parameter. Bandingkan pengaruh penambahan di dalam kurung f(x + c) versus di luar kurung f(x) + c.",
    level: "Kelas XII · Fase F Lanjut",
    gradeKey: "fase-f-lanjut",
    relatedMaterialSlug: "transformasi-fungsi",
    relatedMaterialTitle: "Transformasi Fungsi",
    concepts: [
      "Translasi Grafik",
      "Refleksi",
      "Kompresi & Peregangan",
      "Fungsi Dasar",
    ],
  },
  {
    id: "vector",
    index: "05",
    category: "VEKTOR",
    title: "Eksplorasi Vektor Bidang & Hasil Kali Titik",
    description:
      "Atur besar dan arah dua vektor di bidang koordinat. Amati penjumlahan metode jajar genjang, pengurangan, sudut apit, proyeksi ortogonal, dan hasil kali titik (dot product).",
    prompt:
      "Bandingkan nilai hasil kali titik saat kedua vektor saling tegak lurus (90°) dengan saat keduanya searah. Apa hubungan antara dot product dan nilai kosinus sudut?",
    level: "Kelas X · Fase E",
    gradeKey: "fase-e",
    relatedMaterialSlug: "vektor",
    relatedMaterialTitle: "Vektor Dimensi 2 & 3",
    concepts: [
      "Besar & Arah",
      "Resultan Vektor",
      "Dot Product",
      "Proyeksi Ortogonal",
    ],
  },
  {
    id: "derivative",
    index: "06",
    category: "TURUNAN",
    title: "Eksplorasi Garis Singgung & Turunan",
    description:
      "Amati hubungan garis sekan (tali busur) dan garis tangen (garis singgung). Lihat bagaimana kemiringan gradien saat Δx mendekati 0 merepresentasikan turunan pertama fungsi.",
    prompt:
      "Perkecil nilai jarak h (Δx) menuju 0 untuk mendekatkan titik Q ke titik P. Amati bagaimana nilai gradien sekan stabil mendekati kemiringan garis singgung kurva.",
    level: "Kelas XII · Fase F Lanjut",
    gradeKey: "fase-f-lanjut",
    relatedMaterialSlug: "turunan",
    relatedMaterialTitle: "Turunan Fungsi & Optimasi",
    concepts: ["Garis Sekan", "Garis Tangen", "Limit Δx → 0", "Gradien f'(x)"],
  },
  {
    id: "integral",
    index: "07",
    category: "INTEGRAL",
    title: "Eksplorasi Luas Daerah & Jumlah Riemann",
    description:
      "Dekati perhitungan luas daerah di bawah kurva fungsi menggunakan partisi persegi panjang (Jumlah Riemann). Bandingkan akurasi saat jumlah partisi diperbanyak.",
    prompt:
      "Bandingkan metode titik sampel kiri, kanan, dan tengah. Mengapa nilai pendekatan semakin konvergen mendekati nilai integral tentu saat n bertambah besar?",
    level: "Kelas XII · Fase F Lanjut",
    gradeKey: "fase-f-lanjut",
    relatedMaterialSlug: "integral",
    relatedMaterialTitle: "Integral Tak Tentu & Luas Daerah",
    concepts: [
      "Jumlah Riemann",
      "Partisi (Δx)",
      "Integral Tentu",
      "Luas di Bawah Kurva",
    ],
  },
  {
    id: "graph-plotter",
    index: "08",
    category: "FUNGSI",
    title: "Penggambar Grafik Multi-Fungsi",
    description:
      "Gambarkan hingga tiga fungsi sekaligus dalam satu bidang koordinat. Amati titik potong antargrafik, perpotongan dengan sumbu koordinat, dan perilaku asimtot.",
    prompt:
      "Plot dua fungsi yang berbeda dan cari koordinat titik potongnya. Bagaimana koordinat titik potong tersebut berkaitan dengan himpunan penyelesaian persamaan f(x) = g(x)?",
    level: "Kelas X–XII · Semua Fase",
    gradeKey: "fase-e",
    relatedMaterialSlug: "fungsi-pemodelan",
    relatedMaterialTitle: "Fungsi dan Pemodelan",
    concepts: [
      "Plotting Grafik",
      "Titik Potong",
      "Sumbu Simetri",
      "Perilaku Asimtot",
    ],
  },
  {
    id: "linear-system",
    index: "09",
    category: "SISTEM LINEAR",
    title: "Eksplorasi Sistem Linear & Daerah Layak",
    description:
      "Jelajahi perpotongan garis-garis linear, daerah himpunan penyelesaian pertidaksamaan linear, dan uji titik pojok untuk optimasi fungsi objektif program linear.",
    prompt:
      "Ubah koefisien kendala pertidaksamaan dan amati perubahan daerah arsiran layak. Kapan suatu sistem garis memiliki solusi tunggal, tak hingga solusi, atau tidak konsisten?",
    level: "Kelas X–XI · Fase E & F",
    gradeKey: "fase-e",
    relatedMaterialSlug: "sppl",
    relatedMaterialTitle: "Sistem Persamaan & Pertidaksamaan Linear",
    concepts: [
      "Garis Sejajar & Berpotongan",
      "Daerah Layak",
      "Titik Pojok",
      "Program Linear",
    ],
  },
  {
    id: "conic-sections",
    index: "10",
    category: "IRISAN KERUCUT",
    title: "Eksplorasi Irisan Kerucut & Eksentrisitas",
    description:
      "Ubah eksentrisitas dan parameter kurva untuk membandingkan lingkaran, elips, parabola, dan hiperbola. Amati fokus, direktriks, titik pada kurva, serta garis singgungnya.",
    prompt:
      "Geser eksentrisitas melewati 1. Bagaimana bentuk kurva berubah dari elips menjadi parabola lalu hiperbola, dan bagaimana hubungan jarak titik ke fokus dengan jaraknya ke direktriks?",
    level: "Kelas XII · Fase F Lanjut",
    gradeKey: "fase-f-lanjut",
    relatedMaterialSlug: "irisan-kerucut",
    relatedMaterialTitle: "Irisan Kerucut",
    concepts: [
      "Eksentrisitas",
      "Fokus & Direktriks",
      "Elips",
      "Parabola",
      "Hiperbola",
    ],
  },
  {
    id: "circle-sector",
    index: "11",
    category: "LINGKARAN",
    title: "Eksplorasi Busur, Juring & Garis Singgung",
    description:
      "Atur jari-jari dan sudut pusat untuk mengamati panjang busur, luas juring, tali busur, apotema, tembereng, serta garis singgung lingkaran.",
    prompt:
      "Ubah sudut pusat dan jari-jari. Bagaimana perubahan keduanya memengaruhi panjang busur, luas juring, dan panjang tali busur?",
    level: "Kelas XI · Fase F",
    gradeKey: "fase-f",
    relatedMaterialSlug: "busur-dan-juring-lingkaran",
    relatedMaterialTitle: "Lingkaran",
    concepts: [
      "Sudut Pusat",
      "Panjang Busur",
      "Luas Juring",
      "Tali Busur",
      "Garis Singgung",
    ],
  },
];
