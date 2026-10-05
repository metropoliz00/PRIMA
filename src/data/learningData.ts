import { Subject, StudentProgress, Badge, TeacherAnalytics, CodingBlock, InteractiveVideo, QuestionBankItem, Assessment, Material, Topic } from '../types/learning';
import { INITIAL_QUESTION_BANK, INITIAL_ASSESSMENTS, INITIAL_MATERIALS } from './initialData';
import { getRemoteSubjects, createRemoteSubject, updateRemoteSubject, getRemoteVideos, createRemoteVideo, updateRemoteVideo, pushAppData, fetchAppData, cleanupRemoteDuplicates } from '../services/appscript';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Menjelajahi babak awal petualangan belajar.',
    icon: '🌟',
    unlocked: true,
    unlockedAt: 'Hari ini',
    category: 'Universal',
  },
  {
    id: 'critical_thinker',
    title: 'Critical Thinker',
    description: 'Menjawab pertanyaan tantangan HOTS dengan bernalar kritis.',
    icon: '🧠',
    unlocked: false,
    category: 'Universal',
  },
  {
    id: 'problem_solver',
    title: 'Problem Solver',
    description: 'Memecahkan simulasi dan asesmen dengan nilai tinggi.',
    icon: '💡',
    unlocked: false,
    category: 'Universal',
  },
  {
    id: 'ai_learner',
    title: 'AI Learner',
    description: 'Berdiskusi aktif dan berrefleksi bersama PRIMA AI.',
    icon: '🤖',
    unlocked: false,
    category: 'Universal',
  },
  {
    id: 'code_creator',
    title: 'Code Creator',
    description: 'Menyusun logika blok coding untuk menyelesaikan simulasi.',
    icon: '💻',
    unlocked: false,
    category: 'Universal',
  },
  {
    id: 'prima_master',
    title: 'PRIMA Master',
    description: 'Menyelesaikan seluruh 10 langkah Misi Belajar dengan baik.',
    icon: '🏆',
    unlocked: false,
    category: 'Universal',
  },
];

export const DEFAULT_STUDENT_PROGRESS: StudentProgress = {
  studentName: 'Petualang Cilik',
  avatarUrl: '/prima_avatar_1791033365222.jpg',
  xp: 0,
  level: 1,
  streakDays: 1,
  completedTopicsCount: 0,
  badges: INITIAL_BADGES,
  topicScores: {},
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'ipas',
    name: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    icon: '🌱',
    color: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    description: 'Eksplorasi rahasia alam, makhluk hidup, dan dinamika lingkungan di sekitarmu.',
    grade: 5,
    topics: [
      {
        id: 'ipas-ekosistem',
        subjectId: 'ipas',
        title: 'Harmoni dalam Ekosistem',
        description: 'Memahami hubungan saling ketergantungan antara komponen abiotik, produsen, konsumen, dan pengurai.',
        grade: 5,
        estimatedMinutes: 30,
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            type: 'pemantik',
            title: 'PEMANTIK',
            subtitle: 'Mengapa Belalang Butuh Rumput?',
            isCompleted: false,
            isUnlocked: true,
            content: {
              question: 'Bayangkan jika semua rumput di taman mendadak hilang! Apa yang akan terjadi pada populasi belalang dan burung pemakan belalang?',
              options: [
                'Belalang akan bertambah banyak',
                'Belalang kehilangan makanan lalu berkurang, burung pemakan belalang ikut kesulitan',
                'Semua hewan akan berubah makan batu',
                'Tidak terjadi pengaruh apa-apa'
              ],
              correctAnswer: 1,
              explanation: 'Hebat! Rumput adalah produsen utama. Tanpa produsen, konsumen tingkat pertama (belalang) tidak dapat bertahan hidup, mempengaruhi rantai makanan!'
            }
          },
          {
            id: 'step-2',
            stepNumber: 2,
            type: 'eksplorasi',
            title: 'EKSPLORASI',
            subtitle: 'Pengertian & Ragam Ekosistem (Sawah, Hutan, Sungai, Laut)',
            isCompleted: false,
            isUnlocked: false,
            content: {
              cards: [
                {
                  title: 'Pengertian Ekosistem & Komponen',
                  description: 'Ekosistem adalah hubungan timbal balik antara makhluk hidup (komponen biotik: produsen, konsumen, pengurai) dengan benda tak hidup (komponen abiotik: air, tanah, udara, cahaya matahari).',
                  tag: 'Konsep Dasar',
                  icon: '🌍'
                },
                {
                  title: 'Ekosistem Sawah (Buatan)',
                  description: 'Lahan basah buatan manusia untuk padi dengan irigasi teratur. Rantai makanan: Padi -> Belalang/Tikus -> Katak/Ular -> Burung Elang -> Jamur Pengurai.',
                  tag: 'Ekosistem Buatan',
                  icon: '🌾'
                },
                {
                  title: 'Ekosistem Hutan Tropis (Darat)',
                  description: 'Ekosistem darat alami terlebat dengan pohon tinggi, paku-pakuan, rusa, burung, dan harimau. Menjadi paru-paru dunia penyimpan cadangan air bersih.',
                  tag: 'Ekosistem Darat',
                  icon: '🌲'
                },
                {
                  title: 'Ekosistem Sungai (Air Tawar)',
                  description: 'Aliran air tawar berarus dengan bebatuan kali dan kaya oksigen. Rantai makanan: Lumut -> Jentik/Udang -> Ikan Kecil -> Ikan Gabus/Burung Raja Udang.',
                  tag: 'Air Tawar Mengalir',
                  icon: '🌊'
                },
                {
                  title: 'Ekosistem Laut & Pesisir (Air Asin)',
                  description: 'Ekosistem air asin terluas di bumi dengan terumbu karang indah. Rantai makanan: Fitoplankton -> Zooplankton/Ikan Teri -> Ikan Tongkol -> Ikan Hiu Karang.',
                  tag: 'Ekosistem Bahari',
                  icon: '🐠'
                },
                {
                  title: 'Peran Pengurai (Dekomposer)',
                  description: 'Jamur dan bakteri pengurai mendaur ulang bangkai hewan dan tumbuhan mati menjadi unsur hara penyubur tanah agar tanaman baru dapat tumbuh subur.',
                  tag: 'Daur Ulang Alami',
                  icon: '🍄'
                }
              ]
            }
          },
          {
            id: 'step-3',
            stepNumber: 3,
            type: 'interaksi',
            title: 'INTERAKSI',
            subtitle: 'Pencocokan Rantai Makanan',
            isCompleted: false,
            isUnlocked: false,
            content: {
              instruction: 'Pasangkan komponen ekosistem dengan perannya secara tepat!',
              pairs: [
                { id: '1', item: 'Padi', correctCategory: 'Produsen' },
                { id: '2', item: 'Tikus', correctCategory: 'Konsumen I' },
                { id: '3', item: 'Ular', correctCategory: 'Konsumen II' },
                { id: '4', item: 'Jamur', correctCategory: 'Pengurai' }
              ]
            }
          },
          {
            id: 'step-4',
            stepNumber: 4,
            type: 'video',
            title: 'VIDEO INTERAKTIF',
            subtitle: 'Petualangan Harmoni Ekosistem',
            isCompleted: false,
            isUnlocked: false,
            content: {
              videoUrl: 'https://www.youtube.com/watch?v=LqgYLUaigYU',
              title: 'Rantai Makanan dan Jaring-Jaring Makanan Ekosistem',
              durationInSeconds: 180,
              checkpoints: [
                {
                  id: 'cp1',
                  timeInSeconds: 25,
                  question: 'Komponen apakah yang berperan sebagai Produsen utama pada rantai makanan di sawah?',
                  type: 'mc',
                  options: [
                    'Tanaman Padi 🌾',
                    'Belalang Sawah 🦗',
                    'Katak Sawah 🐸',
                    'Ular Sawah 🐍'
                  ],
                  correctAnswer: 0,
                  explanation: 'Tepat sekali! Tanaman padi berperan sebagai Produsen karena mampu memproduksi makanan sendiri melalui proses fotosintesis.'
                },
                {
                  id: 'cp2',
                  timeInSeconds: 65,
                  question: 'Dalam susunan rantai makanan: Padi -> Belalang -> Katak -> Ular, siapakah yang berperan sebagai Konsumen Tingkat II (Konsumen Sekunder)?',
                  type: 'mc',
                  options: [
                    'Katak 🐸',
                    'Belalang 🦗',
                    'Tanaman Padi 🌾',
                    'Jamur / Dekomposer 🍄'
                  ],
                  correctAnswer: 0,
                  explanation: 'Tepat sekali! Belalang adalah konsumen tingkat 1 (pemakan produsen), sedangkan katak adalah konsumen tingkat 2 yang memangsa belalang.'
                }
              ]
            }
          },
          {
            id: 'step-5',
            stepNumber: 5,
            type: 'ai_tutor',
            title: 'PRIMA AI',
            subtitle: 'Diskusi Saling Ketergantungan Bersama AI',
            isCompleted: false,
            isUnlocked: false,
            content: {
              initialPrompt: 'Halo Petualang! Coba bayangkan jika di sebuah kolam, eceng gondok tumbuh terlalu banyak menutupi permukaan air. Apa perkiraanmu tentang nasib ikan-ikan di dasar kolam?'
            }
          },
          {
            id: 'step-6',
            stepNumber: 6,
            type: 'simulasi',
            title: 'SIMULASI',
            subtitle: 'Laboratorium Keseimbangan Ekosistem',
            isCompleted: false,
            isUnlocked: false,
            content: {
              type: 'ecosystem',
              title: 'Simulasi Keseimbangan Populasi Sawah',
              description: 'Geser slider populasi rumput, belalang, katak, dan ular untuk melihat simulasi dampak interaktif terhadap ekosistem!',
              initialData: {
                grass: 100,
                grasshopper: 50,
                frog: 20,
                snake: 5
              }
            }
          },
          {
            id: 'step-7',
            stepNumber: 7,
            type: 'coding',
            title: 'CODING CHALLENGE',
            subtitle: 'Logika Algoritma Rantai Makanan',
            isCompleted: false,
            isUnlocked: false,
            content: {
              goal: 'Susun urutan blok logika IF/THEN untuk mensimulasikan dampak jika terjadi kemarau panjang pada tumbuhan!',
              availableBlocks: [
                { id: 'b1', text: 'JIKA (Terjadi Kemarau Panjang)', category: 'condition', snippet: 'if(kemarau)', color: 'bg-amber-500' },
                { id: 'b2', text: 'MAKA (Tumbuhan Layu & Produksi Makanan Turun)', category: 'action', snippet: 'tumbuhan.turun()', color: 'bg-emerald-500' },
                { id: 'b3', text: 'MAKA (Populasi Herbivora Berkurang)', category: 'action', snippet: 'herbivora.turun()', color: 'bg-sky-500' },
                { id: 'b4', text: 'LAINNYA (Ekosistem Tetap Seimbang)', category: 'control', snippet: 'else()', color: 'bg-purple-500' }
              ],
              expectedSequence: ['b1', 'b2', 'b3'],
              hint: 'Mulai dengan kondisi kemarau, ikuti dampaknya pada produsen, lalu pada konsumen!'
            }
          },
          {
            id: 'step-8',
            stepNumber: 8,
            type: 'hots',
            title: 'HOTS CHALLENGE',
            subtitle: 'Analisis Masalah Lingkungan Nyata',
            isCompleted: false,
            isUnlocked: false,
            content: {
              scenario: 'Sebuah desa mengalami penyemprotan pestisida berlebihan untuk membasmi ulat. Bulan berikutnya, hasil panen justru gagal total karena ledakan hama tikus. Mengapa hal ini bisa terjadi?',
              options: [
                'Pestisida membunuh katak dan burung pemangsa, sehingga tikus kehilangan pemangsa alaminya',
                'Pestisida justru membuat tikus menjadi semakin kuat dan tidak bisa mati',
                'Tikus menyukai bau pestisida di ladang',
                'Tidak ada hubungannya sama sekali'
              ],
              correctAnswer: 0,
              explanation: 'Analisis kritis yang luar biasa! Penyemprotan obat kimia berlebih merusak rantai makanan dan membunuh musuh alami hama (predator).'
            }
          },
          {
            id: 'step-9',
            stepNumber: 9,
            type: 'asesmen',
            title: 'ASESMEN',
            subtitle: 'Uji Pemahaman Kompetensi Ekosistem',
            isCompleted: false,
            isUnlocked: false,
            content: {
              questions: [
                {
                  id: 'q1',
                  type: 'mc',
                  question: 'Manakah di bawah ini yang merupakan rantai makanan yang tepat di ekosistem hutan?',
                  options: [
                    'Matahari -> Harimau -> Rusa -> Tumbuhan',
                    'Rumput -> Rusa -> Serigala -> Bakteri Pengurai',
                    'Elang -> Tikus -> Padi -> Jamur',
                    'Ular -> Katak -> Belalang -> Padi'
                  ],
                  correctAnswer: 1,
                  hint: 'Selalu mulai dengan produsen (tumbuhan hijau) disusul hewan pemakan tumbuhan!',
                  explanation: 'Rumput (produsen) dimakan Rusa (konsumen I), dimakan Serigala (konsumen II), lalu diuraikan Bakteri saat mati.'
                },
                {
                  id: 'q2',
                  type: 'true_false',
                  question: 'Pengurai seperti jamur dan bakteri mengembalikan unsur hara ke tanah sehingga tumbuhan dapat tumbuh subur kembali.',
                  options: ['Benar', 'Salah'],
                  correctAnswer: 0,
                  hint: 'Pikirkan peran jamur saat menguraikan daun ganti/hewan mati.',
                  explanation: 'Benar! Dekomposer menutup siklus materi dalam ekosistem.'
                },
                {
                  id: 'q3',
                  type: 'short_answer',
                  question: 'Sebutkan sebutan untuk organisme yang mampu membuat makanannya sendiri melalui fotosintesis!',
                  correctAnswer: 'produsen',
                  hint: 'Diawali huruf P...',
                  explanation: 'Produsen (seperti tumbuhan) menghasilkan energi primer dalam ekosistem.'
                }
              ]
            }
          },
          {
            id: 'step-10',
            stepNumber: 10,
            type: 'refleksi',
            title: 'REFLEKSI',
            subtitle: 'Jurnal Jejak Pembelajaran',
            isCompleted: false,
            isUnlocked: false,
            content: {
              prompts: [
                'Apa hal paling penting yang kamu pelajari tentang menjaga harmoni ekosistem?',
                'Tindakan sederhana apa di rumah/sekolah yang bisa kamu lakukan untuk menjaga lingkungan?'
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'matematika',
    name: 'Matematika',
    icon: '🔢',
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    description: 'Petualangan angka, kelipatan, faktor, pola, dan pemecahan masalah logis.',
    grade: 5,
    topics: [
      {
        id: 'math-kpk-fpb',
        subjectId: 'matematika',
        title: 'KPK dan FPB (Kelipatan & Faktor)',
        description: 'Menentukan Kelipatan Persekutuan Terkecil dan Faktor Persekutuan Terbesar melalui metode pohon faktor dan tabel.',
        grade: 5,
        estimatedMinutes: 25,
        steps: [
          {
            id: 'mstep-1',
            stepNumber: 1,
            type: 'pemantik',
            title: 'PEMANTIK',
            subtitle: 'Jadwal Ronda Bersama',
            isCompleted: false,
            isUnlocked: true,
            content: {
              question: 'Pak Andi bertugas ronda setiap 4 hari sekali, sedangkan Pak Budi ronda setiap 6 hari sekali. Jika hari ini mereka ronda bersama, berapa hari lagi mereka akan ronda bersama lagi?',
              options: ['8 hari lagi', '10 hari lagi', '12 hari lagi', '24 hari lagi'],
              correctAnswer: 2,
              explanation: 'Hebat! Ini adalah konsep KPK (Kelipatan Persekutuan Terkecil). Kelipatan 4 = 4, 8, 12, 16... Kelipatan 6 = 6, 12, 18... KPK terkeilnya adalah 12!'
            }
          },
          {
            id: 'mstep-2',
            stepNumber: 2,
            type: 'eksplorasi',
            title: 'EKSPLORASI',
            subtitle: 'Pohon Faktor & Perbedaan KPK vs FPB',
            isCompleted: false,
            isUnlocked: false,
            content: {
              cards: [
                {
                  title: 'KPK (Kelipatan Persekutuan Terkecil)',
                  description: 'Digunakan untuk mencari waktu/peristiwa yang terjadi bersamaan di masa depan.',
                  tag: 'Kelipatan Bersama',
                  icon: '🔄'
                },
                {
                  title: 'FPB (Faktor Persekutuan Terbesar)',
                  description: 'Digunakan untuk membagi barang/benda menjadi kelompok sama banyak tanpa tersisa.',
                  tag: 'Pembagian Sama Rata',
                  icon: '📐'
                }
              ]
            }
          },
          {
            id: 'mstep-6',
            stepNumber: 3,
            type: 'simulasi',
            title: 'SIMULASI',
            subtitle: 'Pohon Faktor Interaktif',
            isCompleted: false,
            isUnlocked: false,
            content: {
              type: 'math_factors',
              title: 'Kalkulator Simulasi Pohon Faktor Interaktif',
              description: 'Masukkan dua angka untuk melihat pemfaktoran prima, KPK, dan FPB secara visual!',
              initialData: { numA: 12, numB: 18 }
            }
          },
          {
            id: 'mstep-9',
            stepNumber: 4,
            type: 'asesmen',
            title: 'ASESMEN',
            subtitle: 'Kuis Keterampilan KPK & FPB',
            isCompleted: false,
            isUnlocked: false,
            content: {
              questions: [
                {
                  id: 'mq1',
                  type: 'mc',
                  question: 'Ibu memiliki 24 kue cokelat dan 36 kue keju. Ibu ingin membagikannya ke dalam piring dengan jumlah sama banyak tanpa sisa. Berapa piring paling banyak yang dibutuhkan?',
                  options: ['6 piring', '12 piring', '18 piring', '24 piring'],
                  correctAnswer: 1,
                  hint: 'Gunakan FPB dari 24 dan 36!',
                  explanation: 'FPB dari 24 dan 36 adalah 12. Jadi paling banyak dibutuhkan 12 piring.'
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'bahasa_indonesia',
    name: 'Bahasa Indonesia',
    icon: '📘',
    color: 'amber',
    bgGradient: 'from-amber-500 to-orange-600',
    description: 'Mengasah literasi, analisis iklan, struktur teks, dan kemampuan berkomunikasi efektif.',
    grade: 5,
    topics: []
  },
  {
    id: 'pendidikan_pancasila',
    name: 'Pendidikan Pancasila',
    icon: '🇮🇩',
    color: 'red',
    bgGradient: 'from-red-500 to-rose-600',
    description: 'Memahami norma, hak dan kewajiban, kebinekaan, serta musyawarah mufakat.',
    grade: 5,
    topics: []
  },
  {
    id: 'seni',
    name: 'Seni Budaya & Prakarya',
    icon: '🎨',
    color: 'purple',
    bgGradient: 'from-purple-500 to-pink-600',
    description: 'Mengembangkan kreativitas visual, ritme musik, dan apresiasi karya seni nusantara.',
    grade: 5,
    topics: []
  },
  {
    id: 'bahasa_inggris',
    name: 'Bahasa Inggris',
    icon: '🌏',
    color: 'sky',
    bgGradient: 'from-sky-500 to-blue-600',
    description: 'Interactive English vocabulary, daily conversations, and fun storybooks.',
    grade: 5,
    topics: []
  }
];

export const TEACHER_ANALYTICS: TeacherAnalytics = {
  totalStudents: 28,
  activeToday: 24,
  avgProgressPercent: 45,
  avgAssessmentScore: 78,
  strugglingTopicName: 'Jaring-jaring Makanan',
  aiHelpCount: 42,
  avgLearningTimeMinutes: 20
};

/**
 * Normalizes subject ID to canonical keys to prevent duplicates
 * e.g. 'bahasa-indonesia' vs 'bahasa_indonesia', 'IPAS' vs 'ipas'
 */
export function normalizeSubjectId(id: string): string {
  if (!id) return '';
  const clean = id.trim().toLowerCase().replace(/_/g, '-');
  if (clean === 'bahasa-indonesia' || clean === 'bahasaindonesia' || clean === 'bi' || clean.includes('indonesia')) return 'bahasa-indonesia';
  if (clean === 'bahasa-inggris' || clean === 'bahasainggris' || clean === 'bing' || clean.includes('inggris')) return 'bahasa-inggris';
  if (clean === 'pancasila' || clean === 'ppkn' || clean === 'pendidikan-pancasila') return 'pancasila';
  if (clean === 'seni' || clean === 'seni-budaya' || clean === 'sbk' || clean === 'sbdp' || clean.includes('seni')) return 'seni';
  if (clean === 'pjok' || clean === 'penjas' || clean.includes('pjok') || clean.includes('jasmani')) return 'pjok';
  if (clean === 'matematika' || clean === 'math' || clean.includes('matematika')) return 'matematika';
  if (clean === 'ipas' || clean === 'ipa' || clean === 'ips' || clean.includes('ipas')) return 'ipas';
  return clean;
}

/**
 * Deduplicates an array of subjects based on normalized ID or normalized Name.
 * If duplicate is found, merges topics and preserves the most complete metadata.
 */
export function deduplicateSubjects(list: Subject[]): Subject[] {
  if (!Array.isArray(list)) return [];
  const map = new Map<string, Subject>();

  for (const s of list) {
    if (!s || (!s.id && !s.name)) continue;
    const rawId = s.id || s.name || '';
    const normId = normalizeSubjectId(rawId);
    const normName = (s.name || '').trim().toLowerCase();

    // Check if duplicate exists either by normId or by identical clean name
    let foundKey: string | undefined;
    for (const [key, existing] of map.entries()) {
      if (key === normId || (existing.name && existing.name.trim().toLowerCase() === normName)) {
        foundKey = key;
        break;
      }
    }

    if (foundKey) {
      const existing = map.get(foundKey)!;
      // Merge unique topics
      const existingTopics = [...(existing.topics || [])];
      (s.topics || []).forEach((t) => {
        if (!existingTopics.some((et) => et.id === t.id || et.title.toLowerCase() === t.title.toLowerCase())) {
          existingTopics.push(t);
        }
      });

      map.set(foundKey, {
        ...existing,
        id: foundKey, // use canonical id
        name: existing.name || s.name,
        description: existing.description || s.description,
        icon: existing.icon || s.icon || '📚',
        color: existing.color || s.color || 'blue',
        bgGradient: existing.bgGradient || s.bgGradient || 'from-blue-500 to-indigo-600',
        grade: existing.grade || s.grade || 5,
        status: existing.status || s.status || 'PUBLISHED',
        topics: existingTopics,
      });
    } else {
      map.set(normId, {
        ...s,
        id: normId,
        grade: s.grade || 5,
        status: s.status || 'PUBLISHED',
      });
    }
  }

  return Array.from(map.values());
}

export function getStoredSubjects(): Subject[] {
  try {
    const data = localStorage.getItem('prima_subjects');
    if (data) {
      const parsed: Subject[] = JSON.parse(data);
      const cleaned = deduplicateSubjects(parsed);
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('prima_subjects', JSON.stringify(cleaned));
      }
      return cleaned.map((s) => {
        if (s.id === 'bahasa_indonesia' && s.topics?.some((t) => t.id === 'bi-iklan')) {
          return { ...s, topics: [] };
        }
        return s;
      });
    }
  } catch (e) {
    console.error('Error reading subjects from localStorage', e);
  }
  return deduplicateSubjects(INITIAL_SUBJECTS);
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    const cleaned = deduplicateSubjects(subjects);
    localStorage.setItem('prima_subjects', JSON.stringify(cleaned));
    // Asynchronously update remote subjects in Google Sheets
    cleaned.forEach((sub) => {
      updateRemoteSubject({
        id: sub.id,
        name: sub.name,
        icon: sub.icon,
        color: sub.color,
        bgGradient: sub.bgGradient,
        description: sub.description,
        grade: sub.grade,
        status: sub.status || 'PUBLISHED',
      }).catch(() => {});
    });
  } catch (e) {
    console.error('Error saving subjects to localStorage', e);
  }
}

/**
 * Organizes and permanently cleans up duplicates both in localStorage and in Google Spreadsheet
 */
export async function organizeAndCleanAllSubjects(): Promise<{ subjects: Subject[]; duplicatesRemoved: number }> {
  const current = getStoredSubjects();
  const initialCount = current.length;
  const cleaned = deduplicateSubjects(current);
  const duplicatesRemoved = Math.max(0, initialCount - cleaned.length);

  // Save clean data locally
  localStorage.setItem('prima_subjects', JSON.stringify(cleaned));

  // Clean remote Google Spreadsheet
  try {
    await cleanupRemoteDuplicates('Subjects');
    // Ensure every clean unique subject is updated
    for (const sub of cleaned) {
      await updateRemoteSubject({
        id: sub.id,
        name: sub.name,
        icon: sub.icon,
        color: sub.color,
        bgGradient: sub.bgGradient,
        description: sub.description,
        grade: sub.grade,
        status: sub.status || 'PUBLISHED',
      });
    }
  } catch (err) {
    console.warn('[Sync] Cleanup remote failed:', err);
  }

  return { subjects: cleaned, duplicatesRemoved };
}

export async function syncSubjectsWithGAS(): Promise<Subject[]> {
  try {
    const remote = await getRemoteSubjects();
    if (remote && Array.isArray(remote) && remote.length > 0) {
      const validRemote = remote.filter((s: any) => s.id && s.name);
      if (validRemote.length > 0) {
        const dedupedRemote = deduplicateSubjects(validRemote as any);
        const local = getStoredSubjects();
        const merged = local.map((l) => {
          const matched = dedupedRemote.find((r: any) => normalizeSubjectId(r.id) === normalizeSubjectId(l.id));
          if (matched) {
            return {
              ...l,
              status: (matched.status as any) || l.status || 'PUBLISHED',
              name: matched.name || l.name,
              description: matched.description || l.description,
            };
          }
          return l;
        });
        const finalClean = deduplicateSubjects(merged);
        localStorage.setItem('prima_subjects', JSON.stringify(finalClean));
        return finalClean;
      }
    } else {
      // If remote is empty, seed initial subjects into Google Sheets
      const local = getStoredSubjects();
      for (const s of local) {
        createRemoteSubject({
          id: s.id,
          name: s.name,
          icon: s.icon,
          color: s.color,
          bgGradient: s.bgGradient,
          description: s.description,
          grade: s.grade,
          status: s.status || 'PUBLISHED',
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync subjects with Google Apps Script', err);
  }
  return getStoredSubjects();
}

export const INITIAL_VIDEOS: InteractiveVideo[] = [
  {
    id: 'vid-ipas-1',
    title: 'Rantai Makanan & Jaring-Jaring Makanan Ekosistem Sawah',
    subjectId: 'ipas',
    videoUrl: 'https://www.youtube.com/watch?v=LqgYLUaigYU',
    grade: 5,
    checkpointsCount: 2,
    checkpoints: [
      {
        id: 'cp-1',
        timeInSeconds: 25,
        question: 'Komponen apakah yang bertindak sebagai Produsen utama dalam rantai makanan ekosistem sawah?',
        type: 'mc',
        options: ['Tanaman Padi 🌾', 'Belalang Sawah 🦗', 'Katak Sawah 🐸', 'Ular Sawah 🐍'],
        correctAnswer: 0,
        explanation: 'Tanaman padi adalah produsen karena mampu memproduksi makanan sendiri melalui fotosintesis dengan bantuan sinar matahari.',
      },
      {
        id: 'cp-2',
        timeInSeconds: 65,
        question: 'Dalam susunan rantai makanan: Padi -> Belalang -> Katak -> Ular, siapakah yang berperan sebagai Konsumen Tingkat II (Konsumen Sekunder)?',
        type: 'mc',
        options: [
          'Katak Sawah 🐸',
          'Belalang Sawah 🦗',
          'Tanaman Padi 🌾',
          'Jamur / Dekomposer 🍄',
        ],
        correctAnswer: 0,
        explanation: 'Katak adalah konsumen tingkat II karena ia memangsa konsumen tingkat I (belalang pemakan padi).',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid-mat-1',
    title: 'Bab 1 KPK dan FPB Kurikulum Merdeka Kelas 5',
    subjectId: 'matematika',
    videoUrl: 'https://www.youtube.com/watch?v=4jI9QzXzU5I',
    grade: 5,
    checkpointsCount: 2,
    checkpoints: [
      {
        id: 'cp-mat-1',
        timeInSeconds: 20,
        question: 'Apa kepanjangan dari KPK dalam konsep matematika?',
        type: 'mc',
        options: ['Kelipatan Persekutuan Terkecil', 'Kelompok Pecahan Kecil', 'Komposisi Pola Kunci', 'Kombinasi Pengurangan Kelompok'],
        correctAnswer: 0,
        explanation: 'KPK merupakan singkatan dari Kelipatan Persekutuan Terkecil dari dua bilangan atau lebih.',
      },
      {
        id: 'cp-mat-2',
        timeInSeconds: 60,
        question: 'Berapakah Nilai Kelipatan Persekutuan Terkecil (KPK) dari angka 4 dan 6?',
        type: 'mc',
        options: ['12', '24', '8', '2'],
        correctAnswer: 0,
        explanation: 'Kelipatan 4: 4, 8, 12, 16... dan Kelipatan 6: 6, 12, 18... Kelipatan persekutuan terkecil yang sama adalah 12.',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid-ipas-2',
    title: 'Food Chains for Kids: Jaring Makanan & Aliran Energi',
    subjectId: 'ipas',
    videoUrl: 'https://www.youtube.com/watch?v=hLq2datPo5M',
    grade: 5,
    checkpointsCount: 2,
    checkpoints: [
      {
        id: 'cp-fc-1',
        timeInSeconds: 30,
        question: 'Dari manakah tumbuhan hijau (produsen) memperoleh energi utama untuk membuat makanannya sendiri?',
        type: 'mc',
        options: ['Sinar Matahari ☀️', 'Angin 💨', 'Bebatuan 🪨', 'Bangkai hewan 🦴'],
        correctAnswer: 0,
        explanation: 'Produsen menyerap energi cahaya matahari melalui klorofil daun untuk fotosintesis.',
      },
      {
        id: 'cp-fc-2',
        timeInSeconds: 90,
        question: 'Apa peran penting organisme Pengurai (Dekomposer) seperti jamur dan bakteri?',
        type: 'mc',
        options: ['Mendaur ulang zat hara ke tanah untuk tumbuhan', 'Memakan tumbuhan secara langsung', 'Menghalangi sinar matahari', 'Menghentikan siklus hidup'],
        correctAnswer: 0,
        explanation: 'Pengurai memecah sisa organisme mati menjadi nutrisi penyubur tanah yang diserap kembali oleh tumbuhan.',
      }
    ],
    createdAt: new Date().toISOString(),
  }
];

export function getStoredVideos(): InteractiveVideo[] {
  try {
    const data = localStorage.getItem('prima_interactive_videos');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Auto-fix broken old sample URLs in localStorage
        const needsUpdate = parsed.some(
          (v: any) =>
            v.videoUrl?.includes('kYJ_f_Y_vS4') ||
            v.videoUrl?.includes('344M7R9L730') ||
            !v.videoUrl
        );
        if (needsUpdate) {
          const updated = parsed.map((v: any) => {
            if (v.id === 'vid-ipas-1' || v.videoUrl?.includes('kYJ_f_Y_vS4')) {
              return { ...v, videoUrl: 'https://www.youtube.com/watch?v=LqgYLUaigYU', title: 'Rantai Makanan & Jaring-Jaring Makanan Ekosistem Sawah', checkpoints: INITIAL_VIDEOS[0].checkpoints };
            }
            if (v.id === 'vid-mat-1' || v.videoUrl?.includes('344M7R9L730')) {
              return { ...v, videoUrl: 'https://www.youtube.com/watch?v=4jI9QzXzU5I', title: 'Bab 1 KPK dan FPB Kurikulum Merdeka Kelas 5', checkpoints: INITIAL_VIDEOS[1].checkpoints };
            }
            return v;
          });
          localStorage.setItem('prima_interactive_videos', JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading videos from localStorage', e);
  }
  return INITIAL_VIDEOS;
}

export function saveVideos(videos: InteractiveVideo[]): void {
  try {
    localStorage.setItem('prima_interactive_videos', JSON.stringify(videos));
    // Asynchronously update remote Videos in Google Sheets via GAS
    videos.forEach((vid) => {
      createRemoteVideo({
        id: vid.id,
        title: vid.title,
        subjectId: vid.subjectId,
        videoUrl: vid.videoUrl,
        grade: vid.grade || 5,
        checkpointsCount: vid.checkpointsCount || (vid.checkpoints?.length || 1),
        createdAt: vid.createdAt || new Date().toISOString(),
      }).catch(() => {});
    });
  } catch (e) {
    console.error('Error saving videos to localStorage', e);
  }
}

export async function syncVideosWithGAS(): Promise<InteractiveVideo[]> {
  try {
    const remote = await getRemoteVideos();
    if (remote && Array.isArray(remote) && remote.length > 0) {
      const validRemote = remote.filter((v: any) => v.id && v.title && v.videoUrl);
      if (validRemote.length > 0) {
        const local = getStoredVideos();
        // Merge remote with local checkpoints
        const merged = validRemote.map((r: any) => {
          const l = local.find((x) => x.id === r.id);
          return {
            ...r,
            checkpoints: (l && l.checkpoints && l.checkpoints.length > 0) ? l.checkpoints : (r.checkpoints || []),
          };
        });
        // Retain local videos that might not be on remote yet
        local.forEach((l) => {
          if (!merged.some((m) => m.id === l.id)) {
            merged.push(l);
          }
        });
        localStorage.setItem('prima_interactive_videos', JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync videos with Google Apps Script', err);
  }
  return getStoredVideos();
}

export function getStoredStudentProgress(): StudentProgress {
  try {
    const data = localStorage.getItem('prima_student_progress');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading progress', e);
  }
  return DEFAULT_STUDENT_PROGRESS;
}

export function saveStudentProgress(progress: StudentProgress): void {
  try {
    localStorage.setItem('prima_student_progress', JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress', e);
  }
}

export function getAllStudentsProgress(): Record<string, StudentProgress> {
  try {
    const data = localStorage.getItem('prima_all_students_progress');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading all students progress', e);
  }
  return {};
}

export function getStudentProgressForId(studentId: string, studentName: string, avatarUrl?: string): StudentProgress {
  const all = getAllStudentsProgress();
  if (all[studentId]) {
    return all[studentId];
  }
  // Initialize default for this student (clean starting values, starting at 0 XP, level 1, streak 1, 0 completed topics)
  const def: StudentProgress = {
    ...DEFAULT_STUDENT_PROGRESS,
    studentName: studentName || 'Petualang',
    avatarUrl: avatarUrl || DEFAULT_STUDENT_PROGRESS.avatarUrl,
    xp: 0,
    level: 1,
    streakDays: 1,
    completedTopicsCount: 0,
  };
  all[studentId] = def;
  saveAllStudentsProgress(all);
  return def;
}

export async function syncProgressWithGAS(studentId: string, studentName: string, avatarUrl?: string): Promise<StudentProgress> {
  try {
    const remoteProgress = await fetchAppData<any>('Progress');
    if (remoteProgress && Array.isArray(remoteProgress) && remoteProgress.length > 0) {
      const matched = remoteProgress.find(p => String(p.id) === String(studentId));
      if (matched) {
        const syncedProg: StudentProgress = {
          studentName: matched.studentName || studentName,
          avatarUrl: avatarUrl || matched.avatarUrl || DEFAULT_STUDENT_PROGRESS.avatarUrl,
          xp: Number(matched.xp) || 0,
          level: Number(matched.level) || 1,
          streakDays: Number(matched.streakDays) || 1,
          completedTopicsCount: Number(matched.completedTopicsCount) || 0,
          badges: DEFAULT_STUDENT_PROGRESS.badges, // maintain local badges
          topicScores: DEFAULT_STUDENT_PROGRESS.topicScores,
        };
        // Save to local storage for persistence
        const all = getAllStudentsProgress();
        all[studentId] = syncedProg;
        saveAllStudentsProgress(all);
        localStorage.setItem('prima_student_progress', JSON.stringify(syncedProg));
        return syncedProg;
      }
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync progress from Google Sheets:', err);
  }
  return getStudentProgressForId(studentId, studentName, avatarUrl);
}

export function saveStudentProgressForId(studentId: string, progress: StudentProgress): void {
  try {
    const all = getAllStudentsProgress();
    all[studentId] = progress;
    saveAllStudentsProgress(all);
    localStorage.setItem('prima_student_progress', JSON.stringify(progress));

    // Sync student learning outcomes to Google Sheets "Progress" sheet automatically
    const payload = {
      id: studentId,
      studentName: progress.studentName,
      xp: progress.xp,
      level: progress.level,
      streakDays: progress.streakDays,
      completedTopicsCount: progress.completedTopicsCount,
      lastUpdated: new Date().toISOString()
    };
    pushAppData('Progress', 'create', payload).catch(e => console.warn('[GAS Sync] Progress push failed:', e));
  } catch (e) {
    console.error('Error saving student progress for id', e);
  }
}

export function saveAllStudentsProgress(all: Record<string, StudentProgress>): void {
  try {
    localStorage.setItem('prima_all_students_progress', JSON.stringify(all));
  } catch (e) {
    console.error('Error saving all students progress', e);
  }
}

export interface CodingChallengeItem {
  id: string;
  title: string;
  subjectId: string;
  allowedBlocksCount: number;
  targetGoal: string;
  characterIcon?: string;
  gridSize?: number;
  startPos?: { x: number; y: number };
  targetPos?: { x: number; y: number };
  obstacles?: { x: number; y: number }[];
  availableBlocks?: CodingBlock[];
  expectedSequence?: string[];
}

export const INITIAL_CODING_CHALLENGES: CodingChallengeItem[] = [
  {
    id: 'cod-1',
    title: '🤖 Algoritma Robot Penyiram Padi Sawah',
    subjectId: 'ipas',
    allowedBlocksCount: 5,
    characterIcon: '🤖',
    gridSize: 4,
    startPos: { x: 0, y: 0 },
    targetPos: { x: 3, y: 3 },
    obstacles: [{ x: 1, y: 1 }, { x: 2, y: 0 }],
    targetGoal: 'Gerakkan Robot Penyiram 🤖 dari posisi awal (0,0) melewati rintangan 🪨 untuk menyiram 3 petak Padi 🌾 saat kelembapan < 40%!',
    availableBlocks: [
      { id: 'b-maju', text: '🤖 Maju 1 Langkah', category: 'action', snippet: 'robot.maju()', color: 'bg-emerald-600' },
      { id: 'b-kanan', text: '↪️ Belok Kanan', category: 'action', snippet: 'robot.belokKanan()', color: 'bg-blue-600' },
      { id: 'b-kiri', text: '↩️ Belok Kiri', category: 'action', snippet: 'robot.belokKiri()', color: 'bg-indigo-600' },
      { id: 'b-siram', text: '💧 Siram Air Padi', category: 'action', snippet: 'robot.siram()', color: 'bg-sky-500' },
      { id: 'b-cek', text: '🔍 Cek Kelembapan < 40%', category: 'condition', snippet: 'if(kelembapan < 40)', color: 'bg-amber-500' },
      { id: 'b-loop', text: '🔄 Ulangi 3 Kali', category: 'control', snippet: 'repeat(3)', color: 'bg-purple-600' },
    ],
    expectedSequence: ['b-maju', 'b-maju', 'b-kanan', 'b-maju', 'b-siram'],
  },
  {
    id: 'cod-2',
    title: '🌾 Rantai Makanan & Harmoni Ekosistem',
    subjectId: 'ipas',
    allowedBlocksCount: 5,
    characterIcon: '🦗',
    gridSize: 4,
    startPos: { x: 0, y: 3 },
    targetPos: { x: 3, y: 0 },
    obstacles: [{ x: 1, y: 2 }],
    targetGoal: 'Susun urutan rantai makanan ekosistem sawah yang seimbang: Produsen (Padi 🌾) -> Hama Belalang 🦗 -> Katak 🐸 -> Dekomposer Jamur 🍄!',
    availableBlocks: [
      { id: 'b-padi', text: '🌾 Produsen (Tanaman Padi)', category: 'action', snippet: 'ekosistem.padi()', color: 'bg-emerald-600' },
      { id: 'b-belalang', text: '🦗 Konsumen I (Belalang Hama)', category: 'action', snippet: 'ekosistem.belalang()', color: 'bg-green-600' },
      { id: 'b-katak', text: '🐸 Konsumen II (Katak Pengendali)', category: 'action', snippet: 'ekosistem.katak()', color: 'bg-sky-600' },
      { id: 'b-jamur', text: '🍄 Dekomposer (Jamur Pengurai)', category: 'action', snippet: 'ekosistem.jamur()', color: 'bg-amber-600' },
      { id: 'b-loop', text: '🔄 Siklus Aliran Energi', category: 'control', snippet: 'siklus.berulang()', color: 'bg-purple-600' },
    ],
    expectedSequence: ['b-padi', 'b-belalang', 'b-katak', 'b-jamur', 'b-loop'],
  },
  {
    id: 'cod-3',
    title: '🧮 Robot Pencari Pohon Faktor KPK & FPB',
    subjectId: 'matematika',
    allowedBlocksCount: 5,
    characterIcon: '🧮',
    gridSize: 4,
    startPos: { x: 0, y: 0 },
    targetPos: { x: 2, y: 2 },
    obstacles: [{ x: 1, y: 0 }],
    targetGoal: 'Gerakkan Robot Matematika 🧮 untuk mengambil Pohon Faktor Prima 🌳 pada angka 12 dan 18!',
    availableBlocks: [
      { id: 'b-maju', text: '🧮 Maju 1 Langkah', category: 'action', snippet: 'step()', color: 'bg-blue-600' },
      { id: 'b-kanan', text: '↪️ Belok Kanan', category: 'action', snippet: 'turnRight()', color: 'bg-indigo-600' },
      { id: 'b-faktor', text: '🌳 Ambil Faktor Prima (2, 3)', category: 'action', snippet: 'getFactor()', color: 'bg-emerald-600' },
      { id: 'b-kpk', text: '✨ Hitung Kelipatan KPK', category: 'action', snippet: 'calcKPK()', color: 'bg-purple-600' },
    ],
    expectedSequence: ['b-maju', 'b-kanan', 'b-maju', 'b-faktor'],
  },
];

export function getStoredCodingChallenges(): CodingChallengeItem[] {
  try {
    const data = localStorage.getItem('prima_coding_challenges');
    if (data) {
      const parsed = JSON.parse(data);
      const hasOldChallenge = parsed.some((ch: any) => ch.title && (ch.title.includes('Daur Air') || ch.title.includes('Evaporasi')));
      if (!hasOldChallenge) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading coding challenges from localStorage', e);
  }
  try {
    localStorage.setItem('prima_coding_challenges', JSON.stringify(INITIAL_CODING_CHALLENGES));
  } catch (err) {}
  return INITIAL_CODING_CHALLENGES;
}

export function saveCodingChallenges(challenges: CodingChallengeItem[]): void {
  try {
    localStorage.setItem('prima_coding_challenges', JSON.stringify(challenges));
    challenges.forEach((ch) => {
      const payload = {
        id: ch.id,
        title: ch.title,
        subjectId: ch.subjectId,
        allowedBlocksCount: ch.allowedBlocksCount,
        characterIcon: ch.characterIcon,
        gridSize: ch.gridSize,
        startPos: JSON.stringify(ch.startPos),
        targetPos: JSON.stringify(ch.targetPos),
        obstacles: JSON.stringify(ch.obstacles),
        availableBlocks: JSON.stringify(ch.availableBlocks),
        expectedSequence: JSON.stringify(ch.expectedSequence),
        targetGoal: ch.targetGoal,
      };
      pushAppData('CodingChallenges', 'create', payload).catch(e => console.warn('[GAS Sync] CodingChallenges sync failed:', e));
    });
  } catch (e) {
    console.error('Error saving coding challenges to localStorage', e);
  }
}

export interface InteractiveActivity {
  id: string;
  title: string;
  subjectId: string;
  type: 'MATCHING' | 'SIMULATION' | 'PUZZLE' | 'LAB';
  difficulty: 'LOTS' | 'MOTS' | 'HOTS';
  points: number;
  description: string;
  createdAt?: string;
}

export const INITIAL_ACTIVITIES: InteractiveActivity[] = [
  {
    id: 'act-1',
    title: 'Simulasi Populasi Sawah (Pemangsa vs Hama)',
    subjectId: 'ipas',
    type: 'SIMULATION',
    difficulty: 'HOTS',
    points: 150,
    description: 'Eksperimen variabel kontrol tikus, ular, dan tanaman padi dalam ekosistem sawah.',
  },
  {
    id: 'act-2',
    title: 'Matching Game: Pengelompokan Biotik & Abiotik',
    subjectId: 'ipas',
    type: 'MATCHING',
    difficulty: 'MOTS',
    points: 100,
    description: 'Pasangkan komponen lingkungan dengan kelompok yang tepat secara cepat dan cermat.',
  },
  {
    id: 'act-3',
    title: 'Laboratorium Maya: Penjernih Air Sederhana',
    subjectId: 'ipas',
    type: 'LAB',
    difficulty: 'MOTS',
    points: 120,
    description: 'Susun lapisan kerikil, ijuk, arang, dan pasir untuk menyaring air keruh.',
  },
];

export function getStoredActivities(): InteractiveActivity[] {
  try {
    const data = localStorage.getItem('prima_interactive_activities');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading activities', e);
  }
  return INITIAL_ACTIVITIES;
}

export function saveActivities(activities: InteractiveActivity[]): void {
  try {
    localStorage.setItem('prima_interactive_activities', JSON.stringify(activities));
  } catch (e) {
    console.error('Error saving activities', e);
  }
}

export function getStoredQuestionBank(): QuestionBankItem[] {
  try {
    const data = localStorage.getItem('prima_question_bank');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading question bank', e);
  }
  return INITIAL_QUESTION_BANK;
}

export function saveQuestionBank(questions: QuestionBankItem[]): void {
  try {
    localStorage.setItem('prima_question_bank', JSON.stringify(questions));
  } catch (e) {
    console.error('Error saving question bank', e);
  }
}

export function getStoredAssessments(): Assessment[] {
  try {
    const data = localStorage.getItem('prima_assessments');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading assessments', e);
  }
  return INITIAL_ASSESSMENTS;
}

export function saveAssessments(assessments: Assessment[]): void {
  try {
    localStorage.setItem('prima_assessments', JSON.stringify(assessments));
  } catch (e) {
    console.error('Error saving assessments', e);
  }
}

export function getStoredMaterials(): Material[] {
  try {
    const data = localStorage.getItem('prima_materials');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading materials from localStorage', e);
  }
  return INITIAL_MATERIALS;
}

export function saveMaterials(materials: Material[]): void {
  try {
    localStorage.setItem('prima_materials', JSON.stringify(materials));
    materials.forEach((mat) => {
      const payload = {
        id: mat.id,
        subjectId: mat.subjectId,
        grade: mat.grade || 5,
        topicTitle: mat.topicTitle,
        learningObjectives: mat.learningObjectives,
        description: mat.description,
        contentBody: mat.contentBody || '',
        mediaType: mat.mediaType || 'DOCUMENT',
        mediaUrl: mat.mediaUrl || '',
        status: mat.status || 'TERBIT',
      };
      pushAppData('Materials', 'create', payload).catch((e) =>
        console.warn('[GAS Sync] Materials sync failed:', e)
      );
    });
  } catch (e) {
    console.error('Error saving materials to localStorage', e);
  }
}

export function createTopicFromMaterial(mat: Material, subjectGrade: number = 5): Topic {
  return {
    id: `top-${mat.id}`,
    subjectId: mat.subjectId,
    title: mat.topicTitle,
    description: mat.description || mat.learningObjectives,
    grade: mat.grade || subjectGrade,
    estimatedMinutes: 25,
    steps: [
      {
        id: `step-1-${mat.id}`,
        stepNumber: 1,
        type: 'pemantik',
        title: 'PEMANTIK',
        subtitle: `Eksplorasi Awal: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: true,
        content: {
          question: `Dalam topik "${mat.topicTitle}", manakah yang paling sesuai dengan tujuan pembelajaran: "${mat.learningObjectives}"?`,
          options: [
            `Memahami dan menguasai konsep: ${mat.learningObjectives}`,
            'Hanya menghafal tanpa memahami penerapan',
            'Tidak berkaitan dengan materi pelajaran',
            'Mengabaikan keterkaitan dengan kehidupan sehari-hari',
          ],
          correctAnswer: 0,
          explanation: `Tepat sekali! Fokus utama kita adalah: ${mat.learningObjectives}`,
        },
      },
      {
        id: `step-2-${mat.id}`,
        stepNumber: 2,
        type: 'eksplorasi',
        title: 'EKSPLORASI',
        subtitle: `Konsep Kunci: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: false,
        content: {
          cards: [
            {
              title: 'Tujuan Capaian Pembelajaran',
              description: mat.learningObjectives,
              tag: 'Target Belajar',
              icon: '🎯',
            },
            {
              title: 'Konsep Inti Materi',
              description: mat.description,
              tag: 'Materi Pokok',
              icon: '📖',
            },
            {
              title: 'Uraian & Penjelasan Lengkap',
              description: mat.contentBody || mat.description,
              tag: 'Fakta Kunci',
              icon: '💡',
            },
          ],
        },
      },
      {
        id: `step-3-${mat.id}`,
        stepNumber: 3,
        type: 'interaksi',
        title: 'INTERAKSI',
        subtitle: `Pencocokan Konsep: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: false,
        content: {
          title: `Pencocokan Konsep ${mat.topicTitle}`,
          description: 'Pasangkan konsep dengan penjelasannya secara tepat!',
          pairs: [
            { left: 'Topik Utama', right: mat.topicTitle },
            {
              left: 'Tujuan Belajar',
              right:
                mat.learningObjectives.length > 40
                  ? mat.learningObjectives.substring(0, 40) + '...'
                  : mat.learningObjectives,
            },
          ],
        },
      },
      {
        id: `step-4-${mat.id}`,
        stepNumber: 4,
        type: 'video',
        title: 'VIDEO INTERAKTIF',
        subtitle: `Video Edukasi: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: false,
        content: {
          videoUrl: mat.mediaUrl || 'https://www.youtube.com/watch?v=LqgYLUaigYU',
          title: `Video Pembelajaran: ${mat.topicTitle}`,
        },
      },
      {
        id: `step-5-${mat.id}`,
        stepNumber: 5,
        type: 'ai_tutor',
        title: 'PRIMA AI',
        subtitle: `Bimbingan AI: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: false,
        content: {
          initialPrompt: `Halo Petualang Cilik! Kita sedang mempelajari "${mat.topicTitle}". Apa yang ingin kamu ketahui atau tanyakan tentang "${mat.learningObjectives}"?`,
        },
      },
      {
        id: `step-6-${mat.id}`,
        stepNumber: 6,
        type: 'simulasi',
        title: 'SIMULASI',
        subtitle: `Laboratorium Interaktif: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: false,
        content: {
          type: 'ecosystem',
          title: `Laboratorium Simulasi: ${mat.topicTitle}`,
          description: mat.description,
        },
      },
      {
        id: `step-7-${mat.id}`,
        stepNumber: 7,
        type: 'coding',
        title: 'CODING CHALLENGE',
        subtitle: `Logika Algoritma: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: false,
        content: {
          goal: `Susun urutan balok logika algoritma untuk menerapkan konsep ${mat.topicTitle}!`,
        },
      },
      {
        id: `step-8-${mat.id}`,
        stepNumber: 8,
        type: 'hots',
        title: 'HOTS CHALLENGE',
        subtitle: `Tantangan Bernalar Kritis: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: false,
        content: {
          scenario: `Bagaimana cara terbaik menerapkan pemahaman tentang "${mat.topicTitle}" dalam kehidupan sehari-hari?`,
          options: [
            'Menerapkannya secara kritis, bijak, dan bertanggung jawab di lingkungan sekitar',
            'Hanya menghafal saat ujian lalu melupakannya',
            'Mengabaikannya karena tidak penting',
          ],
          correctAnswer: 0,
          explanation:
            'Luar biasa! Pembelajaran yang bermakna adalah yang diterapkan secara positif dalam kehidupan nyata.',
        },
      },
      {
        id: `step-9-${mat.id}`,
        stepNumber: 9,
        type: 'asesmen',
        title: 'ASESMEN',
        subtitle: `Uji Pemahaman: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: false,
        content: {
          questions: [
            {
              id: `q-${mat.id}-1`,
              type: 'mc',
              question: `Berdasarkan materi "${mat.topicTitle}", manakah kesimpulan yang paling tepat mengenai capaian belajar?`,
              options: [
                mat.learningObjectives,
                'Pembelajaran tidak menghasilkan pemahaman baru',
                'Hanya materi hafalan tanpa makna',
              ],
              correctAnswer: 0,
              hint: 'Ingat kembali ringkasan materi dan eksplorasi!',
              explanation: `Tepat sekali! Kesimpulan materi adalah: ${mat.learningObjectives}`,
            },
          ],
        },
      },
      {
        id: `step-10-${mat.id}`,
        stepNumber: 10,
        type: 'refleksi',
        title: 'REFLEKSI',
        subtitle: `Jurnal Refleksi: ${mat.topicTitle}`,
        isCompleted: false,
        isUnlocked: false,
        content: {
          prompt: `Tuliskan hal paling menarik dan bermakna yang kamu pelajari dari materi "${mat.topicTitle}"!`,
        },
      },
    ],
  };
}

export function syncMaterialsWithSubjects(subjects: Subject[], materials: Material[]): Subject[] {
  const publishedMaterials = materials.filter((m) => m.status === 'TERBIT');

  return subjects.map((sub) => {
    const subMaterials = publishedMaterials.filter(
      (m) => m.subjectId?.toLowerCase() === sub.id?.toLowerCase()
    );

    // Keep existing comprehensive topics
    const existingTopics = [...sub.topics];

    subMaterials.forEach((mat) => {
      const existingIdx = existingTopics.findIndex(
        (t) =>
          t.id === `top-${mat.id}` ||
          t.title.toLowerCase() === mat.topicTitle.toLowerCase()
      );

      if (existingIdx >= 0) {
        // Update existing topic description
        existingTopics[existingIdx] = {
          ...existingTopics[existingIdx],
          title: mat.topicTitle,
          description: mat.description || mat.learningObjectives,
        };
      } else {
        // Add new dynamic topic from teacher's published material
        const newTopic = createTopicFromMaterial(mat, sub.grade);
        existingTopics.push(newTopic);
      }
    });

    return {
      ...sub,
      topics: existingTopics,
    };
  });
}

export function getStoredTtsSetting(): boolean {
  try {
    const val = localStorage.getItem('prima_tts_enabled');
    if (val !== null) {
      return val === 'true';
    }
    localStorage.setItem('prima_tts_enabled', 'true');
  } catch (e) {
    console.error('Error reading TTS setting', e);
  }
  return true; // Default ON for accessibility
}

export function saveTtsSetting(enabled: boolean): void {
  try {
    localStorage.setItem('prima_tts_enabled', String(enabled));
    // Push settings to remote Google Sheet
    const payload = {
      id: 'tts_setting',
      key: 'tts_enabled',
      value: String(enabled),
      lastUpdated: new Date().toISOString()
    };
    pushAppData('Settings', 'create', payload).catch(e =>
      console.warn('[GAS Sync] Settings sync failed:', e)
    );
  } catch (e) {
    console.error('Error saving TTS setting', e);
  }
}
