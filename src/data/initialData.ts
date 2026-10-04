import { User } from '../types/auth';
import {
  ClassRoom,
  Material,
  QuestionBankItem,
  Assessment,
  Announcement,
  AITutorConfig,
  ReflectionEntry,
} from '../types/learning';

export const DEMO_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Administrator PRIMA',
    username: 'admin',
    passwordHash: 'admin123',
    role: 'ADMIN',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'admin@prima.sch.id',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-guru-1',
    name: 'Dedy Meyga Saputra, S.Pd. M.Pd',
    username: 'guru',
    passwordHash: 'guru123',
    role: 'GURU',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'metropoliz00@gmail.com',
    nip: '198905202020121006',
    subjectsHandled: ['ipas', 'matematika', 'bahasa_indonesia'],
    classesHandled: ['cls-5a', 'cls-5b'],
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'usr-murid-1',
    name: 'Bintang Pratama',
    username: 'murid',
    passwordHash: 'murid123',
    role: 'MURID',
    status: 'ACTIVE',
    avatar: '/prima_avatar_1791033365222.jpg',
    email: 'bintang.murid@prima.sch.id',
    grade: 5,
    studentNumber: '08',
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'usr-murid-2',
    name: 'Siti Rahmawati',
    username: 'siti5a',
    passwordHash: 'murid123',
    role: 'MURID',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    email: 'siti.rahma@prima.sch.id',
    grade: 5,
    studentNumber: '12',
    createdAt: '2026-01-04T00:00:00Z',
    updatedAt: '2026-01-04T00:00:00Z',
  },
];

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'cls-4a',
    name: 'Kelas 4A',
    grade: 4,
    academicYear: '2026/2027',
    teacherId: 'usr-guru-2',
    studentIds: [],
    avgProgress: 35,
    avgScore: 76,
    lastActivity: '10 menit lalu',
  },
  {
    id: 'cls-5a',
    name: 'Kelas 5A',
    grade: 5,
    academicYear: '2026/2027',
    teacherId: 'usr-guru-1',
    studentIds: ['usr-murid-1', 'usr-murid-2'],
    avgProgress: 52,
    avgScore: 82,
    lastActivity: 'Baru saja',
  },
  {
    id: 'cls-5b',
    name: 'Kelas 5B',
    grade: 5,
    academicYear: '2026/2027',
    teacherId: 'usr-guru-1',
    studentIds: ['usr-murid-1'],
    avgProgress: 48,
    avgScore: 80,
    lastActivity: '30 menit lalu',
  },
  {
    id: 'cls-6a',
    name: 'Kelas 6A',
    grade: 6,
    academicYear: '2026/2027',
    teacherId: 'usr-guru-3',
    studentIds: [],
    avgProgress: 20,
    avgScore: 70,
    lastActivity: 'Kemarin',
  },
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    subjectId: 'ipas',
    grade: 5,
    topicTitle: 'Harmoni dalam Ekosistem',
    learningObjectives: 'Memahami peran produsen, konsumen, dan pengurai dalam menjaga keseimbangan alam.',
    description: 'Modul materi lengkap tentang rantai makanan, jaring-jaring makanan, dan interaksi biotik-abiotik.',
    contentBody: 'Ekosistem terdiri atas komponen biotik (makhluk hidup) dan abiotik (benda tak hidup). Dalam rantai makanan, tumbuhan berperan sebagai produsen karena mampu fotosintesis...',
    mediaType: 'SIMULATION',
    mediaUrl: '',
    status: 'TERBIT',
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'mat-2',
    subjectId: 'matematika',
    grade: 5,
    topicTitle: 'KPK dan FPB (Kelipatan & Faktor)',
    learningObjectives: 'Siswa mampu menentukan KPK dan FPB dua bilangan menggunakan pohon faktor.',
    description: 'Panduan visual konsep kelipatan persekutuan terkecil dan faktor persekutuan terbesar.',
    contentBody: 'Kelipatan adalah hasil perkalian suatu bilangan dengan bilangan asli. Faktor adalah bilangan-bilangan yang dapat membagi habis suatu bilangan...',
    mediaType: 'DOCUMENT',
    mediaUrl: '',
    status: 'TERBIT',
    createdAt: '2026-02-12T09:30:00Z',
  },
];

export const INITIAL_QUESTION_BANK: QuestionBankItem[] = [
  {
    id: 'qb-1',
    subjectId: 'ipas',
    grade: 5,
    type: 'PG',
    level: 'MOTS',
    stimulus: '🌾 Ekosistem Sawah Desa Sukamaju: Pada areal persawahan Desa Sukamaju, pak tani menanam rumpun padi. Di sela-sela rumpun padi terlihat belalang memakan daun muda, katak menangkap belalang, dan ular sawah memburu katak. Saat tumbuhan dan hewan mati, jamur dekomposer menguraikan sisa-sisa organik menjadi zat hara tanah.',
    questionText: 'Berdasarkan wacana stimulus di atas, manakah komponen ekosistem yang berperan sebagai produsen utama penyedia energi?',
    options: [
      'Belalang pemakan daun',
      'Tanaman Padi',
      'Katak hijau sawah',
      'Jamur dekomposer'
    ],
    correctAnswer: 1,
    explanation: 'Padi adalah tumbuhan hijau yang menghasilkan makanan sendiri melalui proses fotosintesis sehingga bertindak sebagai produsen utama.',
  },
  {
    id: 'qb-2',
    subjectId: 'ipas',
    grade: 5,
    type: 'PGK',
    level: 'HOTS',
    stimulus: '🌱 Eksperimen Pertumbuhan Tanaman: Dua kelompok siswa Kelas 5 melakukan pengamatan selama 7 hari. Tanaman A diletakkan di pekarangan sekolah (mendapat sinar matahari cukup dan disiram air teratur). Tanaman B diletakkan di dalam kardus tertutup rapat tanpa cahaya.',
    questionText: 'Berdasarkan fenomena pada eksperimen di atas, pilihlah semua pernyataan yang BENAR! (Jawaban benar dapat lebih dari satu)',
    options: [
      'Tanaman A dapat melakukan fotosintesis dengan baik karena mendapat sinar matahari.',
      'Tanaman B tumbuh sangat sehat, hijau rimbun, dan berbuah lebat.',
      'Air dan cahaya matahari merupakan komponen abiotik yang sangat krusial bagi kelangsungan hidup tumbuhan.',
      'Tanaman B menjadi pucat, layu, dan menguning karena tidak mendapatkan energi cahaya matahari.'
    ],
    correctAnswers: [0, 2, 3],
    explanation: 'Tanaman A fotosintesis normal (0). Cahaya dan air adalah faktor abiotik vital (2). Tanaman B layu/kuning karena etiolasi tanpa cahaya (3).',
  },
  {
    id: 'qb-3',
    subjectId: 'ipas',
    grade: 5,
    type: 'BS',
    level: 'HOTS',
    stimulus: '🌊 Pencemaran Limbah di Sungai Permai: Warga Desa Permai menemukan adanya pembuangan limbah industri ke dalam aliran sungai. Dalam waktu satu minggu, banyak ikan air tawar mati mengapung, permukaan air tertutup eceng gondok secara berlebihan, dan bau sungai menjadi sangat menyengat.',
    questionText: 'Tentukan apakah setiap pernyataan berikut BENAR atau SALAH berdasarkan peristiwa pencemaran sungai di atas!',
    statements: [
      {
        id: 'st-1',
        text: 'Pencemaran limbah mengganggu keseimbangan rantai makanan dan kelangsungan hidup komponen biotik sungai.',
        isTrue: true,
      },
      {
        id: 'st-2',
        text: 'Matinya ikan air tawar di sungai akan menyebabkan populasi burung pemakan ikan bertambah semakin banyak.',
        isTrue: false,
      },
      {
        id: 'st-3',
        text: 'Kondisi lingkungan abiotik yang bersih dan sehat sangat memengaruhi kelangsungan ekosistem.',
        isTrue: true,
      },
    ],
    explanation: 'Pernyataan 1 BENAR (limbah merusak biotik sungai). Pernyataan 2 SALAH (berkurangnya ikan justru menurunkan jumlah burung pemakan ikan). Pernyataan 3 BENAR (abiotik bersih penting bagi ekosistem).',
  },
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'ass-1',
    title: 'Asesmen Formatif Ekosistem & Literasi Sains',
    subjectId: 'ipas',
    grade: 5,
    durationMinutes: 30,
    totalQuestions: 3,
    kktpTarget: 75,
    randomizeQuestions: true,
    randomizeOptions: true,
    maxAttempts: 2,
    showScore: true,
    showExplanation: true,
    status: 'AKTIF',
    questions: INITIAL_QUESTION_BANK,
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: '📢 Persiapan Misi Simulasi Ekosistem Minggu Ini',
    content: 'Anak-anak Kelas 5, pastikan kamu telah mencoba Video Interaktif dan PRIMA AI sebelum masuk ke tantangan Laboratorium Simulasi Sawah ya!',
    targetClass: 'SEMUA',
    createdAt: '2026-03-01T07:00:00Z',
    authorName: 'Ibu Meyga, S.Pd.',
    status: 'TERBIT',
  },
];

export const INITIAL_REFLECTIONS: ReflectionEntry[] = [
  {
    id: 'ref-1',
    studentId: 'usr-murid-1',
    studentName: 'Bintang Pratama',
    topicTitle: 'Harmoni dalam Ekosistem',
    content: 'Saya baru sadar bahwa jamur yang bentuknya kecil ternyata sangat penting untuk menguraikan daun mati menjadi pupuk tanah!',
    createdAt: '2026-03-02T10:15:00Z',
    aiInsight: 'Siswa menunjukkan pemahaman mendalam tentang peran pengurai (dekomposer) dalam siklus nutrisi.',
  },
];

export const INITIAL_AI_CONFIGS: AITutorConfig[] = [
  {
    id: 'aic-1',
    subjectId: 'ipas',
    topicTitle: 'Harmoni dalam Ekosistem',
    tutorName: 'PRIMA AI Tutor Ekosistem',
    learningGoal: 'Membimbing siswa bernalar kritis mengenai ketergantungan antar komponen ekosistem.',
    communicationStyle: 'Ramah, mendorong rasa ingin tahu, santun, dan menggunakan bahasa SD Kelas 5.',
    rulesAndScaffolding: 'Jangan langsung memberikan jawaban akhir. Berikan pertanyaan pemandu, perumpamaan, dan dorongan bernalar.',
    starterPrompts: [
      'Mengapa tumbuhan hijau disebut produsen?',
      'Apa yang terjadi jika ulat hilang di taman?',
      'Mengapa jamur sangat berguna di alam?'
    ],
    maxTokensLimit: 1000,
  },
];
