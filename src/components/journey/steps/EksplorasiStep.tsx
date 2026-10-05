import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  ArrowRight, 
  BookOpen, 
  Globe, 
  Bot, 
  Sparkles, 
  User, 
  Send, 
  Info,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  TreePine,
  Waves,
  Fish,
  Sun,
  Droplets,
  Wind,
  Mountain,
  Volume2,
  VolumeX,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { sendAiTutorMessage } from '../../../services/aiService';

interface EksplorasiStepProps {
  content: any;
  topicTitle?: string;
  subjectName?: string;
  onNext: () => void;
}

interface EcosystemData {
  id: string;
  name: string;
  badge: string;
  type: string;
  icon: string;
  imagePath: string;
  description: string;
  characteristics: string[];
  biotik: { role: string; examples: string; icon: string }[];
  abiotik: { factor: string; description: string; icon: string }[];
  foodChain: { step: string; subject: string; role: string; icon: string }[];
  realCaseTitle: string;
  realCaseText: string;
  hotFact: string;
}

const ECOSYSTEMS_DATA: EcosystemData[] = [
  {
    id: 'sawah',
    name: 'Ekosistem Sawah',
    badge: 'Ekosistem Buatan Manusia',
    type: 'Lahan Basah Pertanian',
    icon: '🌾',
    imagePath: '/ekosistem_sawah_1791082640304.jpg',
    description: 'Sawah adalah ekosistem buatan manusia berupa lahan basah yang dirancang khusus untuk budidaya tanaman padi dengan sistem irigasi teratur.',
    characteristics: [
      'Memiliki sistem pengairan (irigasi) buatan manusia',
      'Keanekaragaman hayati lebih sederhana karena didominasi tanaman padi',
      'Kondisi tanah berlumpur subur dan kaya air saat musim tanam',
      'Sangat dipengaruhi oleh campur tangan dan perawatan petani'
    ],
    biotik: [
      { role: 'Produsen', examples: 'Tanaman padi, tanaman gulma, eceng gondok sawah, lumut air.', icon: '🌾' },
      { role: 'Konsumen I (Herbivora)', examples: 'Belalang sawah, tikus sawah, keong mas/siput murbei, ulat daun.', icon: '🦗' },
      { role: 'Konsumen II (Karnivora)', examples: 'Katak sawah, burung gereja, kadal sawah.', icon: '🐸' },
      { role: 'Konsumen III / Puncak', examples: 'Ular sawah, burung elang, burung blekok.', icon: '🐍' },
      { role: 'Pengurai (Dekomposer)', examples: 'Bakteri tanah dan jamur pengurai sisa jerami dan bangkai.', icon: '🍄' }
    ],
    abiotik: [
      { factor: 'Air Irigasi', description: 'Mengalir teratur untuk menggenangi akar padi dan melarutkan unsur hara.', icon: '💧' },
      { factor: 'Tanah Lumpur', description: 'Tanah liat berhumus tebal yang menahan air dan memberi nutrisi bagi padi.', icon: '🌱' },
      { factor: 'Cahaya Matahari', description: 'Sinar matahari terbuka penuh yang dibutuhkan tanaman padi untuk berfotosintesis.', icon: '☀️' },
      { factor: 'Udara & Suhu', description: 'Udara hangat tropis yang mempercepat pematangan bulir-bulir padi.', icon: '🌤️' }
    ],
    foodChain: [
      { step: '1', subject: 'Tanaman Padi', role: 'Produsen (Fotosintesis)', icon: '🌾' },
      { step: '2', subject: 'Tikus / Belalang', role: 'Konsumen I (Herbivora)', icon: '🐀' },
      { step: '3', subject: 'Ular Sawah / Katak', role: 'Konsumen II (Karnivora)', icon: '🐍' },
      { step: '4', subject: 'Burung Elang', role: 'Konsumen Puncak (Predator)', icon: '🦅' },
      { step: '5', subject: 'Jamur & Bakteri Tanah', role: 'Pengurai (Dekomposer)', icon: '🍄' }
    ],
    realCaseTitle: 'Kasus Nyata: Mengapa Ular Sawah Tidak Boleh Diburu?',
    realCaseText: 'Di banyak desa pertanian, ketika ular sawah diburu manusia secara berlebihan untuk diambil kulitnya, populasi tikus sawah langsung melonjak ribuan ekor. Akibatnya, tikus memakan habis batang dan bulir padi petani, menyebabkan gagal panen massal.',
    hotFact: 'Satu ekor ular sawah dewasa mampu memangsa 2–3 ekor tikus setiap minggunya, menjadi sahabat alami petani paling efektif!'
  },
  {
    id: 'hutan',
    name: 'Ekosistem Hutan Tropis',
    badge: 'Ekosistem Alami Darat',
    type: 'Hutan Hujan Tropis',
    icon: '🌲',
    imagePath: '/ekosistem_hutan.jpg',
    description: 'Hutan hujan tropis adalah ekosistem darat alami dengan keanekaragaman hayati tertinggi di bumi, ditandai oleh pohon-pohon raksasa berkanopi lebat dan curah hujan tinggi.',
    characteristics: [
      'Memiliki tingkatan tajuk (kanopi) pohon yang bertingkat-tingkat dari lantai hutan hingga puncak pohon',
      'Keanekaragaman flora dan fauna paling kaya di dunia',
      'Berperan sebagai paru-paru dunia penghasil oksigen dan penyerap gas karbon dioksida',
      'Lantai hutan selalu lembap dengan lapisan seresah daun tebal tempat hidup pengurai'
    ],
    biotik: [
      { role: 'Produsen', examples: 'Pohon meranti, pohon ulin, rotan, paku-pakuan, anggrek hutan, semak belukar.', icon: '🌳' },
      { role: 'Konsumen I (Herbivora)', examples: 'Rusa, kancil, monyet ekor panjang, burung pemakan buah, tapir, kelinci hutan.', icon: '🦌' },
      { role: 'Konsumen II (Karnivora/Omnivora)', examples: 'Kucing hutan, musang, burung hantu, ular piton.', icon: '🦉' },
      { role: 'Konsumen Puncak', examples: 'Harimau sumatera, macan tutul, elang jawa.', icon: '🐅' },
      { role: 'Pengurai (Dekomposer)', examples: 'Jamur kayu, cacing tanah, bakteri pembusuk daun, rayap.', icon: '🪱' }
    ],
    abiotik: [
      { factor: 'Tanah Humus', description: 'Tanah subur kaya bahan organik dari dedaunan gugur yang lapuk.', icon: '🍂' },
      { factor: 'Kelembapan Tinggi', description: 'Uap air di bawah kanopi yang menjaga kesejukan dan kelembapan hutan.', icon: '💧' },
      { factor: 'Naungan Cahaya', description: 'Sinar matahari tersaring tajuk pohon sehingga lantai hutan agak temaram.', icon: '⛅' },
      { factor: 'Mata Air Gunung', description: 'Akar pohon hutan mengikat jutaan liter air hujan menjadi sumber air bersih.', icon: '🏞️' }
    ],
    foodChain: [
      { step: '1', subject: 'Dedaunan & Buah Hutan', role: 'Produsen Utama', icon: '🌳' },
      { step: '2', subject: 'Rusa / Kancil', role: 'Konsumen I (Pemakan Tumbuhan)', icon: '🦌' },
      { step: '3', subject: 'Harimau Sumatera', role: 'Konsumen Puncak (Pemangsa)', icon: '🐅' },
      { step: '4', subject: 'Cacing & Jamur Hutan', role: 'Pengurai Hara Organik', icon: '🍄' }
    ],
    realCaseTitle: 'Kasus Nyata: Dampak Penebangan Pohon Liar (Deforestasi)',
    realCaseText: 'Saat hutan ditebang secara liar, tidak ada lagi akar-akar pohon besar yang mengikat air hujan dan tanah. Akibatnya, air hujan langsung meluncur memicu bencana banjir bandang dan tanah longsor di pemukiman hilir.',
    hotFact: 'Satu hektar hutan hujan tropis dapat menyimpan ratusan spesies pohon yang menyerap puluhan ton karbon dioksida setiap tahunnya!'
  },
  {
    id: 'sungai',
    name: 'Ekosistem Sungai',
    badge: 'Ekosistem Air Tawar Mengalir (Lotik)',
    type: 'Perairan Tawar Berarus',
    icon: '🌊',
    imagePath: '/ekosistem_sungai.jpg',
    description: 'Sungai adalah ekosistem air tawar yang airnya mengalir terus-menerus dari hulu pegunungan menuju hilir atau muara laut, kaya oksigen terlarut dan bebatuan kali.',
    characteristics: [
      'Arus air mengalir searah dari dataran tinggi menuju dataran rendah',
      'Kadar oksigen terlarut sangat tinggi karena pergerakan air yang beriak di bebatuan',
      'Dasar sungai bervariasi mulai dari bebatuan kali kasar, kerikil, hingga pasir halus',
      'Organisme sungai memiliki adaptasi khusus seperti tubuh ramping pemecah arus atau pengait pada batu'
    ],
    biotik: [
      { role: 'Produsen', examples: 'Lumut bebatuan, alga hijau, tanaman kangkung air, eceng gondok pinggir kali.', icon: '🌿' },
      { role: 'Konsumen I (Herbivora/Detritivor)', examples: 'Jentik serangga air, udang kali kecil, keong sungai, ikan wader.', icon: '🦐' },
      { role: 'Konsumen II (Karnivora)', examples: 'Ikan nila, ikan lele lokal, kepiting sungai, katak air.', icon: '🐟' },
      { role: 'Konsumen Puncak', examples: 'Ikan gabus besar, burung raja udang, berang-berang sungai.', icon: '🦅' },
      { role: 'Pengurai (Dekomposer)', examples: 'Bakteri aerob pengurai air tawar dan mikroba lumpur.', icon: '🦠' }
    ],
    abiotik: [
      { factor: 'Arus Aliran Air', description: 'Membawa nutrisi dan oksigen serta menentukan jenis ikan yang mampu hidup.', icon: '🌊' },
      { factor: 'Bebatuan Kali', description: 'Tempat menempelnya lumut dan tempat persembunyian telur-telur ikan.', icon: '🪨' },
      { factor: 'Oksigen Terlarut', description: 'Dibutuhkan insang ikan sungai untuk bernapas dengan segar.', icon: '🫧' },
      { factor: 'Kejernihan Air', description: 'Memungkinkan cahaya matahari menembus ke dasar sungai agar lumut dapat berfotosintesis.', icon: '✨' }
    ],
    foodChain: [
      { step: '1', subject: 'Lumut Bebatuan Kali', role: 'Produsen Air Tawar', icon: '🌿' },
      { step: '2', subject: 'Jentik Air & Udang Kali', role: 'Konsumen I (Herbivora)', icon: '🦐' },
      { step: '3', subject: 'Ikan Wader / Nila', role: 'Konsumen II (Karnivora Kecil)', icon: '🐟' },
      { step: '4', subject: 'Burung Raja Udang / Ikan Gabus', role: 'Konsumen Puncak', icon: '🪶' },
      { step: '5', subject: 'Mikroba Pengurai Dasar Kali', role: 'Dekomposer Air', icon: '🦠' }
    ],
    realCaseTitle: 'Kasus Nyata: Mengapa Sampah Plastik & Detergen Merusak Sungai?',
    realCaseText: 'Busa detergen dan limbah pabrik yang dibuang ke sungai membentuk lapisan yang menghalangi oksigen masuk ke dalam air. Akibatnya, lumut mati, udang kali musnah, dan ikan-ikan mengapung mati karena kehabisan nafas.',
    hotFact: 'Burung Raja Udang (Kingfisher) memiliki penglihatan luar biasa yang dapat memperhitungkan pembiasan air saat menukik menangkap ikan sungai!'
  },
  {
    id: 'laut',
    name: 'Ekosistem Laut & Terumbu Karang',
    badge: 'Ekosistem Air Asin (Bahari)',
    type: 'Perairan Laut Dalam & Pesisir',
    icon: '🐠',
    imagePath: '/ekosistem_laut.jpg',
    description: 'Laut adalah ekosistem terluas di bumi yang menutupi lebih dari 70% permukaan planet, memiliki kadar garam (salinitas) tinggi, dan terumbu karang yang menjadi rumah bagi jutaan biota laut.',
    characteristics: [
      'Memiliki salinitas (kadar garam) rata-rata 3,5% yang tinggi',
      'Terdiri dari zona fotik (zona terang tembus matahari) hingga zona abisal (laut dalam yang gelap gulita)',
      'Dipengaruhi oleh arus laut samudra dan pasang surut gravitasi bulan',
      'Terumbu karang berfungsi sebagai benteng alami pemecah gelombang tsunami dan badai pesisir'
    ],
    biotik: [
      { role: 'Produsen Utama', examples: 'Fitoplankton (mikroorganisme fotosintetik), rumput laut (alga makro), lamun.', icon: '🌱' },
      { role: 'Konsumen I (Herbivora/Planktivor)', examples: 'Zooplankton, udang krill, ikan teri, kima/kerang raksasa, bulu babi.', icon: '🦐' },
      { role: 'Konsumen II (Karnivora Menengah)', examples: 'Ikan badut (clownfish), ikan kupu-kupu karang, cumi-cumi, penyu hijau.', icon: '🐠' },
      { role: 'Konsumen III / Puncak', examples: 'Ikan tongkol, ikan tuna, ikan hiu karang, paus pembunuh (orca).', icon: '🦈' },
      { role: 'Pengurai (Dekomposer)', examples: 'Bakteri laut bentik dan teripang pemakan endapan dasar samudera.', icon: '🪱' }
    ],
    abiotik: [
      { factor: 'Kadar Garam (Salinitas)', description: 'Menciptakan daya apung dan lingkungan kimia khusus bagi hewan laut.', icon: '🧂' },
      { factor: 'Arus & Gelombang', description: 'Mengalirkan plankton dan menyebarkan telur-telur ikan ke seluruh samudra.', icon: '🌊' },
      { factor: 'Cahaya Zona Fotik', description: 'Sinar matahari di kedalaman 0–200 meter yang memberi makan fitoplankton & karang.', icon: '☀️' },
      { factor: 'Terumbu Karang Kalsium', description: 'Struktur kapur hidup tempat ikan bertelur, berlindung, dan mencari makan.', icon: '🪸' }
    ],
    foodChain: [
      { step: '1', subject: 'Fitoplankton Samudra', role: 'Produsen Mikroskopis (O2 Dunia)', icon: '🌱' },
      { step: '2', subject: 'Zooplankton & Ikan Teri', role: 'Konsumen I (Planktivor)', icon: '🦐' },
      { step: '3', subject: 'Ikan Kembung / Tongkol', role: 'Konsumen II (Karnivora)', icon: '🐟' },
      { step: '4', subject: 'Ikan Hiu Karang', role: 'Konsumen Puncak (Predator Laut)', icon: '🦈' },
      { step: '5', subject: 'Bakteri Pengurai Dasar Laut', role: 'Dekomposer Laut Dalam', icon: '🦠' }
    ],
    realCaseTitle: 'Kasus Nyata: Mengapa Penggunaan Bom Ikan Sangat Berbahaya?',
    realCaseText: 'Menangkap ikan menggunakan bom atau potasium meremukkan terumbu karang yang membutuhkan ratusan tahun untuk tumbuh. Ketika karang hancur, ikan tidak lagi memiliki rumah untuk berkembang biak dan laut menjadi gurun mati.',
    hotFact: 'Fitoplankton di lautan menyumbang lebih dari 50% dari total oksigen yang kita hirup setiap hari di bumi—melebihi seluruh hutan daratan digabungkan!'
  },
  {
    id: 'danau',
    name: 'Ekosistem Danau & Kolam',
    badge: 'Ekosistem Air Tawar Tenang (Lentik)',
    type: 'Perairan Tawar Tergenang',
    icon: '🏞️',
    imagePath: '/ekosistem_sungai.jpg',
    description: 'Danau dan kolam adalah cekungan daratan terisi air tawar yang tergenang tenang tanpa arus deras, kaya akan tanaman air terapung dan beragam ikan air tawar.',
    characteristics: [
      'Perairan tenang dengan sirkulasi vertikal (atas dan bawah)',
      'Banyak ditumbuhi tanaman air berdaun lebar seperti teratai dan eceng gondok',
      'Lapisan dasar berupa lumpur halus kaya bahan organik terurai',
      'Menjadi tempat singgah burung-burung air yang bermigrasi'
    ],
    biotik: [
      { role: 'Produsen', examples: 'Bunga teratai, lumut danau, eceng gondok, alga hijau terapung.', icon: '🪷' },
      { role: 'Konsumen I', examples: 'Kutu air (Daphnia), jentik nyamuk, siput air, ikan pemakan lumut.', icon: '🐌' },
      { role: 'Konsumen II', examples: 'Ikan mas, ikan gurame, ikan mujair, kura-kura air tawar.', icon: '🐢' },
      { role: 'Konsumen Puncak', examples: 'Ikan gabus besar, burung bangau putih, ular air.', icon: '🦩' },
      { role: 'Pengurai', examples: 'Bakteri anaerob lumpur dasar dan cacing lumpur.', icon: '🪱' }
    ],
    abiotik: [
      { factor: 'Air Tenang', description: 'Menyediakan habitat stabil bagi tanaman terapung dan larva serangga.', icon: '💧' },
      { factor: 'Lumpur Dasar', description: 'Kaya akan nutrisi pupuk alami hasil pembusukan daun teratai dan kotoran ikan.', icon: '🌱' },
      { factor: 'Sinar Matahari Lapisan Atas', description: 'Membuat tanaman air berbunga indah dan menghasilkan nektar bagi serangga.', icon: '☀️' },
      { factor: 'Suhu Bertingkat', description: 'Permukaan air hangat dan dasar danau lebih sejuk.', icon: '🌡️' }
    ],
    foodChain: [
      { step: '1', subject: 'Tanaman Teratai & Alga Danau', role: 'Produsen Air Tenang', icon: '🪷' },
      { step: '2', subject: 'Kutu Air & Siput Danau', role: 'Konsumen I (Herbivora)', icon: '🐌' },
      { step: '3', subject: 'Ikan Gurame / Ikan Mas', role: 'Konsumen II (Omnivora Air)', icon: '🐟' },
      { step: '4', subject: 'Burung Bangau Putih', role: 'Konsumen Puncak', icon: '🦩' },
      { step: '5', subject: 'Bakteri Lumpur Dasar Danau', role: 'Pengurai Alami', icon: '🦠' }
    ],
    realCaseTitle: 'Kasus Nyata: Fenomena Eutrofikasi (Ledakan Eceng Gondok)',
    realCaseText: 'Pupuk kimia dari pertanian yang hanyut ke danau menyebabkan eceng gondok tumbuh meledak menutupi seluruh permukaan danau. Sinar matahari tidak bisa menembus air, oksigen habis, dan ikan-ikan di bawahnya mati lemas.',
    hotFact: 'Bunga teratai memiliki daun dengan lapisan lilin khusus kedap air dan tangkai berongga udara yang berfungsi seperti selang pernapasan menuju akar di dasar lumpur!'
  }
];

interface TopicExtra {
  realSituationTitle: string;
  realSituationText: string;
  imagePath: string;
  summaryTitle: string;
  summaryPoints: string[];
  botWelcome: string;
}

const TOPIC_EXTRAS: Record<string, TopicExtra> = {
  'Harmoni dalam Ekosistem': {
    realSituationTitle: 'Kisah Keseimbangan Alam: Sawah, Hutan, Sungai & Laut 🌍',
    realSituationText: 'Ekosistem adalah rumah besar bagi makhluk hidup (biotik) yang saling berinteraksi dengan lingkungannya (abiotik). Di sawah, padi memberi makan belalang dan tikus. Di hutan, pohon tinggi menghasilkan oksigen dan mata air. Di sungai dan laut, jutaan biota hidup selaras dalam aliran rantai makanan. Jika salah satu komponen rusak, seluruh ekosistem akan terguncang!',
    imagePath: '/ekosistem_sawah_1791082640304.jpg',
    summaryTitle: 'Prinsip Keseimbangan Ekosistem ⚖️',
    summaryPoints: [
      'Pengertian: Ekosistem adalah kesatuan interaksi timbal balik antara makhluk hidup (biotik) dengan benda tak hidup (abiotik).',
      'Komponen Biotik: Produsen (tumbuhan), Konsumen (hewan herbivora, karnivora, omnivora), dan Pengurai (dekomposer jamur & bakteri).',
      'Komponen Abiotik: Sinar matahari, air, tanah, udara, dan suhu yang menopang kehidupan.',
      'Rantai Makanan: Aliran energi yang mengalir dari matahari -> produsen -> konsumen tingkat I -> tingkat II -> puncak -> pengurai.',
      'Dekomposisi: Pengurai mendaur ulang sisa makhluk hidup menjadi unsur hara yang menyuburkan kembali tanah dan air.'
    ],
    botWelcome: 'Halo Peneliti Cilik! Aku PRIMA AI. Yuk, tanyakan apa saja seputar ekosistem sawah, hutan, sungai, laut, atau rantai makanan yang ingin kamu ketahui! 🌾🌲🌊🐠✨'
  },
  'KPK dan FPB (Kelipatan & Faktor)': {
    realSituationTitle: 'Lampu Kelap-Kelip Taman Kota 💡',
    realSituationText: 'Budi memperhatikan dua lampu hias di gerbang taman bermain. Lampu merah berkedip setiap 4 detik sekali, sedangkan lampu biru berkedip setiap 6 detik sekali. Dengan menggunakan Kelipatan Persekutuan Terkecil (KPK), kita tahu mereka akan menyala bersamaan setiap 12 detik sekali!',
    imagePath: '/kpk_lampu_1791082656052.jpg',
    summaryTitle: 'Poin Kunci Kelipatan & Faktor 🧮',
    summaryPoints: [
      'KPK (Kelipatan Persekutuan Terkecil): Nilai terkecil yang habis dibagi oleh kedua bilangan tersebut. Sangat berguna untuk menghitung jadwal berkala.',
      'FPB (Faktor Persekutuan Terbesar): Faktor pembagi terbesar yang sama dari dua bilangan atau lebih. Berguna untuk membagi barang secara rata.'
    ],
    botWelcome: 'Halo! Aku PRIMA AI pendamping matematikamu. Mau tahu trik cepat menghitung FPB atau KPK tanpa pusing? Silakan tanyakan di sini! 💡✨'
  },
  'Iklan dan Informasi Media': {
    realSituationTitle: 'Baliho Buah Segar Dekat Sekolah Budi 🍏',
    realSituationText: 'Saat pulang sekolah, Budi melihat sebuah baliho besar bergambar buah-buahan segar dengan tulisan mencolok: "Tubuh Sehat, Otak Cerdas dengan Makan Buah Setiap Hari!". Baliho ini menarik perhatian Budi karena gambarnya yang penuh warna dan kalimatnya yang membujuknya untuk langsung membeli buah di pasar!',
    imagePath: '/iklan_sehat_1791082675372.jpg',
    summaryTitle: 'Kekuatan Iklan Media Efektif 📢',
    summaryPoints: [
      'Tujuan Utama: Membujuk, mengedukasi, atau memperkenalkan barang/jasa kepada pembaca.',
      'Bahasa Persuasif: Menggunakan kata-kata ajakan positif seperti "Ayo", "Mari", atau "Dapatkan".',
      'Daya Tarik Visual: Warna kontras dan ilustrasi tajam mendukung penyampaian pesan iklan.'
    ],
    botWelcome: 'Halo Sahabat Kreatif! Aku PRIMA AI. Mau tahu cara menyusun kata-kata iklan yang paling menarik atau unsur-unsur penting iklan media cetak? Tanyakan langsung ya! 🚀📖'
  }
};

const getGenericExtra = (topicTitle: string, subjectName?: string): TopicExtra => {
  return {
    realSituationTitle: `Aplikasi Nyata: ${topicTitle} 🌍`,
    realSituationText: `Dalam kehidupan sehari-hari, konsep mengenai "${topicTitle}" sangatlah penting! Pemahaman materi ini membantu kita bernalar lebih kritis, memecahkan masalah praktis di lingkungan sekitar kita, dan melihat keterkaitan ilmu pengetahuan dengan dunia luar.`,
    imagePath: '/ekosistem_sawah_1791082640304.jpg',
    summaryTitle: 'Prinsip Dasar Konsep 📝',
    summaryPoints: [
      'Logika Teori: Memahami dasar-dasar konseptual, istilah, dan fungsi materi ini.',
      'Penerapan Kritis: Mengidentifikasi masalah nyata di sekitar kita yang dapat diselesaikan dengan teori ini.',
      'Eksplorasi Mandiri: Terus mengeksplorasi pertanyaan "mengapa" dan "bagaimana" suatu konsep bekerja.'
    ],
    botWelcome: `Halo! Aku PRIMA AI, asisten belajarmu untuk mata pelajaran ${subjectName || 'pilihanmu'}. Mari kita bahas lebih mendalam tentang "${topicTitle}". Tanyakan apa saja yang membuatmu penasaran! 💡`
  };
};

interface Message {
  sender: 'student' | 'bot';
  text: string;
}

const speakSingleWord = (word: string) => {
  const cleanedWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim();
  if (!cleanedWord) return;

  const utterance = new SpeechSynthesisUtterance(cleanedWord);
  utterance.lang = 'id-ID';
  utterance.rate = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const indonesianVoice = voices.find(v => v.lang.startsWith('id') || v.lang.startsWith('in'));
  if (indonesianVoice) {
    utterance.voice = indonesianVoice;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

interface InteractiveTextProps {
  text: string;
  enabled: boolean;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({ text, enabled }) => {
  if (!enabled) return <span>{text}</span>;

  const parts = text.split(/(\s+)/);

  return (
    <span>
      {parts.map((part, idx) => {
        if (part.trim() === '') {
          return <span key={idx}>{part}</span>;
        }
        return (
          <span
            key={idx}
            onMouseEnter={() => speakSingleWord(part)}
            className="hover:text-indigo-600 hover:scale-[1.10] hover:bg-amber-100/90 px-0.5 rounded transition-all inline-block cursor-pointer select-none font-medium"
            title="Arahkan kursor untuk mendengar suara 🔊"
          >
            {part}
          </span>
        );
      })}
    </span>
  );
};

export const EksplorasiStep: React.FC<EksplorasiStepProps> = ({ 
  content, 
  topicTitle = 'Misi Belajar', 
  subjectName = 'IPAS', 
  onNext 
}) => {
  const isEcosystemTopic = (topicTitle || '').toLowerCase().includes('ekosistem') || 
                           (subjectName || '').toLowerCase().includes('ipas') ||
                           (topicTitle || '').toLowerCase().includes('harmoni');

  const [activeEcosystemTab, setActiveEcosystemTab] = useState<string>('sawah');
  const [activeDetailCard, setActiveDetailCard] = useState<number | null>(null);

  const extra: TopicExtra = TOPIC_EXTRAS[topicTitle] || getGenericExtra(topicTitle, subjectName);

  const [chatMessages, setChatMessages] = useState<Message[]>(() => [
    { sender: 'bot', text: extra.botWelcome }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isTtsAllowed, setIsTtsAllowed] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userHasChatted = useRef(false);

  const currentEcosystem = ECOSYSTEMS_DATA.find((e) => e.id === activeEcosystemTab) || ECOSYSTEMS_DATA[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const val = localStorage.getItem('prima_tts_enabled');
    if (val !== null) {
      setIsTtsAllowed(val === 'true');
    }
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    setChatMessages([
      { sender: 'bot', text: extra.botWelcome }
    ]);
    userHasChatted.current = false;
  }, [extra.botWelcome]);

  useEffect(() => {
    if (userHasChatted.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAiLoading]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isAiLoading) return;

    userHasChatted.current = true;
    const studentMessage = userInput.trim();
    setUserInput('');
    setChatMessages((prev) => [...prev, { sender: 'student', text: studentMessage }]);
    setIsAiLoading(true);

    try {
      const contextStr = `Siswa sedang mengeksplorasi materi: "${topicTitle}". Ekosistem aktif: "${currentEcosystem.name}" (${currentEcosystem.description}). Komponen Biotik: ${currentEcosystem.biotik.map(b => `${b.role}: ${b.examples}`).join('; ')}. Komponen Abiotik: ${currentEcosystem.abiotik.map(a => a.factor).join(', ')}. Kasus nyata: ${currentEcosystem.realCaseTitle} (${currentEcosystem.realCaseText}).`;
      const replyText = await sendAiTutorMessage(studentMessage, topicTitle, subjectName, contextStr);
      setChatMessages((prev) => [...prev, { sender: 'bot', text: replyText }]);
    } catch (err) {
      console.error('Error contacting AI Tutor:', err);
      setChatMessages((prev) => [
        ...prev, 
        { sender: 'bot', text: 'Koneksiku terputus sejenak, mari coba tanyakan lagi, atau kita baca kembali materi di atas! 💡' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* 1. Header Information Bar */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 shadow-md bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl shadow-inner">
            <Eye className="w-6 h-6 text-sky-600 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/50">Langkah 2: Eksplorasi Konsep</span>
            <h3 className="font-heading text-xl font-black text-slate-900 mt-1">Pengertian & Ragam Ekosistem Dunia 🌍</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Materi Lengkap Kurikulum Merdeka</span>
        </div>
      </div>

      {/* 2. DEFINISI EKOSISTEM & KOMPONEN POKOK */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg bg-white space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Pondasi Konsep</span>
            <h4 className="font-heading text-xl font-black text-slate-900">Apa Itu Ekosistem?</h4>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/70 shadow-sm space-y-3">
          <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
            <InteractiveText 
              text="Ekosistem adalah hubungan timbal balik dan saling ketergantungan yang tidak terpisahkan antara makhluk hidup (komponen biotik) dengan lingkungan fisiknya (komponen abiotik)." 
              enabled={isTtsAllowed} 
            />
          </p>
          <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
            Di dalam ekosistem, tidak ada makhluk hidup yang bisa bertahan hidup sendirian. Semua saling membutuhkan makanan, tempat tinggal, dan energi yang mengalir tiada henti dari sinar matahari.
          </p>
        </div>

        {/* 2 Komponen Pokok Ekosistem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          
          {/* Biotik Card */}
          <div className="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500 text-white rounded-xl font-black text-base shadow">
                🌿
              </div>
              <div>
                <h5 className="font-heading font-black text-slate-900 text-base">1. Komponen Biotik (Makhluk Hidup)</h5>
                <span className="text-[10px] font-bold text-emerald-700">Semua organisme bernyawa di lingkungan</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">🌱 Produsen:</span>
                <span>Tumbuhan hijau penghasil makanan sendiri lewat fotosintesis (Padi, Pohon, Lumut, Fitoplankton).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">🐇 Konsumen I (Herbivora):</span>
                <span>Hewan pemakan tumbuhan (Belalang, Ulat, Tikus, Rusa, Zooplankton).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">🦅 Konsumen II & Puncak (Karnivora/Omnivora):</span>
                <span>Pemakan daging atau pemangsa (Katak, Ular, Harimau, Elang, Hiu).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">🍄 Pengurai (Dekomposer):</span>
                <span>Jamur dan bakteri yang membusukkan bangkai menjadi pupuk hara tanah.</span>
              </li>
            </ul>
          </div>

          {/* Abiotik Card */}
          <div className="p-5 rounded-2xl bg-white border-2 border-sky-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-500 text-white rounded-xl font-black text-base shadow">
                ☀️
              </div>
              <div>
                <h5 className="font-heading font-black text-slate-900 text-base">2. Komponen Abiotik (Benda Tak Hidup)</h5>
                <span className="text-[10px] font-bold text-sky-700">Unsur fisik penopang kehidupan</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-sky-600 font-bold">☀️ Cahaya Matahari:</span>
                <span>Sumber energi utama bagi produsen untuk membuat makanan dan menghangatkan bumi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-600 font-bold">💧 Air & Kelembapan:</span>
                <span>Cairan vital untuk metabolisme sel, minum, dan habitat hewan air.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-600 font-bold">💨 Udara (Oksigen & CO2):</span>
                <span>Oksigen untuk bernapas hewan/tumbuhan, CO2 untuk fotosintesis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-600 font-bold">🌱 Tanah & Bebatuan:</span>
                <span>Tempat berpijak akar, penyimpan air tanah, dan penyedia zat mineral.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. JELAJAH INTERAKTIF BERBAGAI EKOSISTEM (SAWAH, HUTAN, SUNGAI, LAUT, DANAU) */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl bg-white space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <Globe className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Jelajah Ragam Ekosistem</span>
              <h4 className="font-heading text-xl font-black text-slate-900">Contoh & Penjelasan Lengkap Ekosistem</h4>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 italic">Pilih tab di bawah untuk menjelajah 🔍</span>
        </div>

        {/* Tab Navigator */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {ECOSYSTEMS_DATA.map((eco) => {
            const isActive = activeEcosystemTab === eco.id;
            return (
              <button
                key={eco.id}
                onClick={() => setActiveEcosystemTab(eco.id)}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isActive
                    ? 'bg-gradient-to-tr from-indigo-600 via-sky-600 to-emerald-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.03] border-transparent'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{eco.icon}</span>
                  {isActive && <CheckCircle className="w-4 h-4 text-emerald-300" />}
                </div>
                <div>
                  <h5 className={`font-heading font-black text-xs sm:text-sm ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {eco.name}
                  </h5>
                  <p className={`text-[10px] font-bold ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                    {eco.type}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Ecosystem Detail Panel */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/70 border-2 border-slate-200/90 space-y-6 animate-fadeIn">
          
          {/* Header of Active Ecosystem */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Image with Badge */}
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border-4 border-white shadow-lg group">
              <img 
                src={currentEcosystem.imagePath} 
                alt={currentEcosystem.name}
                className="w-full h-56 sm:h-72 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white font-black text-[10px] rounded-full uppercase tracking-wider shadow">
                {currentEcosystem.badge}
              </div>
              <div className="absolute bottom-3 right-3 px-3 py-1 bg-indigo-600/90 backdrop-blur-md text-white font-bold text-xs rounded-xl shadow">
                {currentEcosystem.icon} {currentEcosystem.name}
              </div>
            </div>

            {/* Right: Description & Key Characteristics */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  {currentEcosystem.type}
                </span>
                <h4 className="font-heading text-2xl font-black text-slate-900 mt-2">
                  {currentEcosystem.name} {currentEcosystem.icon}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed pt-1">
                  <InteractiveText text={currentEcosystem.description} enabled={isTtsAllowed} />
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <h6 className="font-heading font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Ciri Khas Lingkungan:
                </h6>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-600">
                  {currentEcosystem.characteristics.map((char, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <span>{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Rantai Makanan & Aliran Energi Visual */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-heading font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Aliran Energi & Rantai Makanan Khas {currentEcosystem.name}
              </h5>
              <span className="text-[10px] font-bold text-slate-400">Dari Produsen ke Pengurai</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {currentEcosystem.foodChain.map((chain, fIdx) => (
                <div 
                  key={fIdx} 
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all flex flex-col justify-between items-center text-center space-y-1 relative"
                >
                  <span className="text-3xl">{chain.icon}</span>
                  <div>
                    <h6 className="font-heading font-black text-xs text-slate-900">{chain.subject}</h6>
                    <p className="text-[10px] font-bold text-indigo-600">{chain.role}</p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Tingkat {chain.step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Komponen Biotik vs Abiotik di Ekosistem Ini */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Biotik List */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <h5 className="font-heading font-black text-xs sm:text-sm text-emerald-950 flex items-center gap-2">
                <span className="text-lg">🌿</span>
                Komponen Biotik (Makhluk Hidup):
              </h5>
              <div className="space-y-2">
                {currentEcosystem.biotik.map((b, bIdx) => (
                  <div key={bIdx} className="p-2.5 rounded-xl bg-white border border-emerald-150 flex items-start gap-2.5">
                    <span className="text-xl shrink-0">{b.icon}</span>
                    <div>
                      <span className="text-xs font-black text-emerald-900">{b.role}: </span>
                      <span className="text-xs font-semibold text-slate-700">{b.examples}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abiotik List */}
            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
              <h5 className="font-heading font-black text-xs sm:text-sm text-sky-950 flex items-center gap-2">
                <span className="text-lg">🌤️</span>
                Komponen Abiotik (Benda Tak Hidup):
              </h5>
              <div className="space-y-2">
                {currentEcosystem.abiotik.map((a, aIdx) => (
                  <div key={aIdx} className="p-2.5 rounded-xl bg-white border border-sky-150 flex items-start gap-2.5">
                    <span className="text-xl shrink-0">{a.icon}</span>
                    <div>
                      <span className="text-xs font-black text-sky-900">{a.factor}: </span>
                      <span className="text-xs font-semibold text-slate-700">{a.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Studi Kasus & Fakta Menarik */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
            
            <div className="md:col-span-7 p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <h6 className="font-heading font-black text-xs uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {currentEcosystem.realCaseTitle}
              </h6>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                <InteractiveText text={currentEcosystem.realCaseText} enabled={isTtsAllowed} />
              </p>
            </div>

            <div className="md:col-span-5 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 flex flex-col justify-center">
              <h6 className="font-heading font-black text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Tahukah Kamu? 💡
              </h6>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                {currentEcosystem.hotFact}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* 4. Detailed Concept Cards Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-indigo-600 rounded-full" />
          <h4 className="font-heading text-lg font-black text-slate-900">Penjelasan Ringkas Kartu Konsep</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.cards?.map((card: any, idx: number) => {
            const isExpanded = activeDetailCard === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveDetailCard(isExpanded ? null : idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                  isExpanded
                    ? 'bg-gradient-to-tr from-indigo-50 via-sky-50 to-emerald-50 border-indigo-400 shadow-md scale-[1.01]'
                    : 'bg-white border-slate-200/80 hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 bg-slate-100/80 rounded-2xl shadow-sm">{card.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                      {card.tag}
                    </span>
                  </div>
                  <h5 className="font-heading font-black text-slate-900 text-sm sm:text-base mt-3">
                    {card.title}
                  </h5>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Interactive Chatbot AI Section */}
      <div className="glass-card rounded-3xl border border-slate-200/80 shadow-lg bg-white overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-heading font-black text-sm sm:text-base">Teman Belajar PRIMA AI</h4>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full shadow-inner">Online</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-100 font-semibold opacity-95">Tanyakan apa saja seputar ekosistem sawah, hutan, sungai, laut, atau materi lainnya!</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
        </div>

        {/* Chat Bubble Container */}
        <div ref={chatContainerRef} className="p-5 h-72 overflow-y-auto bg-slate-50 space-y-4 no-scrollbar">
          {chatMessages.map((msg, index) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={index}
                className={`flex items-start gap-2.5 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
              >
                <div className={`p-2 rounded-xl shrink-0 shadow-sm ${isBot ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'}`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold leading-relaxed shadow-sm ${
                  isBot 
                    ? 'bg-white border border-slate-150 text-slate-800 rounded-tl-none' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isAiLoading && (
            <div className="flex items-start gap-2.5 mr-auto max-w-[85%]">
              <div className="p-2 rounded-xl shrink-0 bg-indigo-100 text-indigo-700 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-150 rounded-tl-none flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Chat Form */}
        <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-3">
          <input 
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={`Tanyakan pada PRIMA AI, contoh: Apa bedanya ekosistem sungai dan laut?`}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isAiLoading}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 fill-white" />
          </button>
        </form>

      </div>

      {/* 6. Next Step Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-heading font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>Lanjut ke Mini Game Interaksi</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};
