import {
  Subject,
  StudentProgress,
  Badge,
  TeacherAnalytics,
  CodingBlock,
  InteractiveVideo,
  VideoCheckpoint,
  InteractiveActivity,
  InteractiveActivityConfig,
  QuestionBankItem,
  Assessment,
  Material,
  Topic,
  ClassRoom,
  Announcement,
  ReflectionEntry,
  AITutorConfig,
} from '../types/learning';
export type { InteractiveActivity, InteractiveActivityConfig };

import {
  getRemoteSubjects,
  createRemoteSubject,
  updateRemoteSubject,
  deleteRemoteSubject,
  getRemoteVideos,
  createRemoteVideo,
  updateRemoteVideo,
  deleteRemoteVideo,
  getRemoteMaterials,
  createRemoteMaterial,
  deleteRemoteMaterial,
  getRemoteAssessments,
  createRemoteAssessment,
  updateRemoteAssessment,
  deleteRemoteAssessment,
  getRemoteQuestions,
  createRemoteQuestion,
  updateRemoteQuestion,
  deleteRemoteQuestion,
  getRemoteCodingChallenges,
  createRemoteCodingChallenge,
  deleteRemoteCodingChallenge,
  getRemoteActivities,
  createRemoteActivity,
  updateRemoteActivity,
  deleteRemoteActivity,
  getRemoteClasses,
  createRemoteClass,
  deleteRemoteClass,
  getRemoteAnnouncements,
  createRemoteAnnouncement,
  deleteRemoteAnnouncement,
  getRemoteReflections,
  createRemoteReflection,
  getRemoteAITutorConfigs,
  createRemoteAITutorConfig,
  deleteRemoteAITutorConfig,
  getRemoteSettings,
  createRemoteSetting,
  updateRemoteSetting,
  pushAppData,
  fetchAppData,
  cleanupRemoteDuplicates,
} from '../services/appscript';
import {
  isRecordDeleted,
  markRecordDeletedClient,
  unmarkRecordDeletedClient,
  syncDeletedRecordsWithServer,
} from '../services/storageService';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Menjelajahi babak awal petualangan belajar.',
    icon: '🌟',
    unlocked: false,
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

export const INITIAL_SUBJECTS: Subject[] = [];
export const INITIAL_VIDEOS: InteractiveVideo[] = [
  {
    id: 'vid-ipas-1',
    title: 'Rantai Makanan & Jaring-Jaring Makanan Ekosistem Sawah',
    subjectId: 'ipas',
    videoUrl: 'https://www.youtube.com/watch?v=LqgYLUaigYU',
    grade: 5,
    checkpointsCount: 3,
    checkpoints: [
      {
        id: 'cp-ipas-1',
        timeInSeconds: 35,
        question: 'Dalam rantai makanan di ekosistem sawah, tanaman padi berperan sebagai apa?',
        type: 'mc',
        options: [
          'Produsen (Penghasil Makanan Sendiri)',
          'Konsumen Tingkat I (Herbivora)',
          'Konsumen Tingkat II (Karnivora)',
          'Dekomposer (Pengurai)'
        ],
        correctAnswer: 0,
        explanation: 'Tanaman padi memiliki klorofil dan memanfaatkan sinar matahari untuk fotosintesis, sehingga bertindak sebagai Produsen utama.'
      },
      {
        id: 'cp-ipas-2',
        timeInSeconds: 75,
        question: 'Jika populasi ular sawah diburu hingga habis, apa dampak langsung bagi petani?',
        type: 'mc',
        options: [
          'Tanaman padi tumbuh lebih subur',
          'Populasi tikus melonjak tajam dan merusak tanaman padi',
          'Katak sawah bertambah sedikit',
          'Tidak ada dampak sama sekali pada ekosistem'
        ],
        correctAnswer: 1,
        explanation: 'Ular adalah predator alami tikus. Tanpa ular, tikus berkembang biak sangat cepat dan menjadi hama perusak tanaman padi petani.'
      },
      {
        id: 'cp-ipas-3',
        timeInSeconds: 120,
        question: 'Apa fungsi jamur dan bakteri pengurai pada akhir siklus rantai makanan?',
        type: 'mc',
        options: [
          'Memangsa hewan yang masih hidup',
          'Mengurangi kesuburan tanah sawah',
          'Menguraikan sisa makhluk hidup menjadi zat hara penyubur tanah',
          'Menghalangi pertumbuhan tanaman baru'
        ],
        correctAnswer: 2,
        explanation: 'Dekomposer (pengurai) bertugas membusukkan materi organik sisa menjadi unsur hara yang kembali diserap oleh tanaman produsen.'
      }
    ],
    createdAt: '2026-10-07T00:00:00.000Z'
  },
  {
    id: 'vid-1791121258381',
    title: 'Harmoni dalam Ekosistem Hutan Tropis',
    subjectId: 'ipas',
    videoUrl: 'https://youtu.be/GyUbwk9uqzM?si=WsY9RdghEg5fam0Y',
    grade: 5,
    checkpointsCount: 2,
    checkpoints: [
      {
        id: 'cp-hutan-1',
        timeInSeconds: 30,
        question: 'Mengapa hutan hujan tropis dijuluki sebagai paru-paru dunia?',
        type: 'mc',
        options: [
          'Karena memiliki curah hujan sangat tinggi sepanjang tahun',
          'Karena pepohonan lebat menghasilkan oksigen melimpah dan menyerap karbon dioksida',
          'Karena merupakan habitat hewan karnivora terbesar',
          'Karena tidak pernah terkena sinar matahari'
        ],
        correctAnswer: 1,
        explanation: 'Proses fotosintesis vegetasi pohon di hutan tropis menghasilkan pasokan oksigen global yang sangat masif bagi bumi.'
      },
      {
        id: 'cp-hutan-2',
        timeInSeconds: 65,
        question: 'Hubungan saling menguntungkan antara lebah dan bunga tanaman hutan disebut simbiosis apa?',
        type: 'mc',
        options: [
          'Mutualisme (Keduanya saling diuntungkan)',
          'Komensalisme (Satu untung, satu tidak rugi)',
          'Parasitisme (Satu untung, satu dirugikan)',
          'Predasi (Hubungan mangsa dan pemangsa)'
        ],
        correctAnswer: 0,
        explanation: 'Lebah mendapatkan nektar manis dari bunga, sementara bunga terbantu proses penyerbukannya oleh lebah (simbiosis mutualisme).'
      }
    ],
    createdAt: '2026-10-07T00:00:00.000Z'
  },
  {
    id: 'vid-math-kpk',
    title: 'Konsep Menyenangkan KPK dan FPB dalam Kehidupan Sehari-hari',
    subjectId: 'matematika',
    videoUrl: 'https://www.youtube.com/watch?v=k_lP21R_q3M',
    grade: 5,
    checkpointsCount: 2,
    checkpoints: [
      {
        id: 'cp-kpk-1',
        timeInSeconds: 30,
        question: 'Lampu merah menyala tiap 4 detik dan lampu kuning tiap 6 detik. Kapan keduanya menyala serentak pertama kali?',
        type: 'mc',
        options: [
          'Detik ke-10',
          'Detik ke-12 (KPK dari 4 dan 6)',
          'Detik ke-24',
          'Detik ke-18'
        ],
        correctAnswer: 1,
        explanation: 'Kelipatan 4: 4, 8, 12... dan kelipatan 6: 6, 12... Kelipatan Persekutuan Terkecilnya (KPK) adalah pada detik ke-12.'
      },
      {
        id: 'cp-fpb-2',
        timeInSeconds: 80,
        question: 'Ibu membagi 12 kue donat dan 18 kue bolu ke piring sama rata tanpa sisa. Berapa piring terbanyak yang dibutuhkan?',
        type: 'mc',
        options: [
          '6 Piring (FPB dari 12 dan 18)',
          '4 Piring',
          '3 Piring',
          '12 Piring'
        ],
        correctAnswer: 0,
        explanation: 'Faktor persekutuan terbesar (FPB) dari 12 dan 18 adalah 6. Setiap piring berisi 2 donat dan 3 bolu.'
      }
    ],
    createdAt: '2026-10-07T00:00:00.000Z'
  }
];
export const INITIAL_ACTIVITIES: InteractiveActivity[] = [];
export const INITIAL_QUESTION_BANK: QuestionBankItem[] = [];
export const INITIAL_ASSESSMENTS: Assessment[] = [];
export const INITIAL_MATERIALS: Material[] = [];

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

export const INITIAL_CODING_CHALLENGES: CodingChallengeItem[] = [];

export const TEACHER_ANALYTICS: TeacherAnalytics = {
  totalStudents: 0,
  activeToday: 0,
  avgProgressPercent: 0,
  avgAssessmentScore: 0,
  strugglingTopicName: '-',
  aiHelpCount: 0,
  avgLearningTimeMinutes: 0,
};

/**
 * Normalizes subject ID to canonical keys to prevent duplicates
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
 */
export function deduplicateSubjects(list: Subject[]): Subject[] {
  if (!Array.isArray(list)) return [];
  const map = new Map<string, Subject>();

  for (const s of list) {
    if (!s || (!s.id && !s.name)) continue;
    const rawId = s.id || s.name || '';
    const normId = normalizeSubjectId(rawId);
    const normName = (s.name || '').trim().toLowerCase();

    let foundKey: string | undefined;
    for (const [key, existing] of map.entries()) {
      if (key === normId || (existing.name && existing.name.trim().toLowerCase() === normName)) {
        foundKey = key;
        break;
      }
    }

    if (foundKey) {
      const existing = map.get(foundKey)!;
      const existingTopics = [...(existing.topics || [])];
      (s.topics || []).forEach((t) => {
        if (!existingTopics.some((et) => et.id === t.id || et.title.toLowerCase() === t.title.toLowerCase())) {
          existingTopics.push(t);
        }
      });

      map.set(foundKey, {
        ...existing,
        id: foundKey,
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
        topics: s.topics || [],
      });
    }
  }

  return Array.from(map.values());
}

// ==================== SUBJECTS ====================
export function getStoredSubjects(): Subject[] {
  try {
    const data = localStorage.getItem('prima_subjects');
    if (data) {
      const parsed: Subject[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const active = parsed.filter((s) => s && s.id && !isRecordDeleted('subjects', s.id) && (s.status as any) !== 'DELETED');
        return deduplicateSubjects(active);
      }
    }
  } catch (e) {
    console.error('Error reading subjects from localStorage', e);
  }
  return [];
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    const cleaned = deduplicateSubjects(subjects).filter((s) => !isRecordDeleted('subjects', s.id));
    localStorage.setItem('prima_subjects', JSON.stringify(cleaned));

    // Persist to Server JSON Database (/api/subjects)
    fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjects: cleaned }),
    }).catch(() => {});

    cleaned.forEach((sub) => {
      unmarkRecordDeletedClient('subjects', sub.id);
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

export function deleteSubject(id: string): void {
  markRecordDeletedClient('subjects', id);
  const current = getStoredSubjects();
  const filtered = current.filter((s) => s.id !== id);
  localStorage.setItem('prima_subjects', JSON.stringify(filtered));

  fetch(`/api/subjects/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteSubject({ id }).catch(() => {});
}

export async function organizeAndCleanAllSubjects(): Promise<{ subjects: Subject[]; duplicatesRemoved: number }> {
  const current = getStoredSubjects();
  const initialCount = current.length;
  const cleaned = deduplicateSubjects(current);
  const duplicatesRemoved = Math.max(0, initialCount - cleaned.length);

  localStorage.setItem('prima_subjects', JSON.stringify(cleaned));

  try {
    await cleanupRemoteDuplicates('Subjects');
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
    await syncDeletedRecordsWithServer().catch(() => {});
    const remote = await getRemoteSubjects();
    if (remote && Array.isArray(remote)) {
      const validRemote = remote.filter(
        (s: any) => s && (s.id || s.name) && !isRecordDeleted('subjects', s.id) && s.status !== 'DELETED'
      );
      const dedupedRemote = deduplicateSubjects(validRemote as any);
      localStorage.setItem('prima_subjects', JSON.stringify(dedupedRemote));
      return dedupedRemote;
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync subjects with Google Apps Script', err);
  }
  return getStoredSubjects();
}

// ==================== VIDEOS ====================
export function parseCheckpoints(raw: any): VideoCheckpoint[] {
  if (!raw) return [];
  let list = raw;
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];

  const result: VideoCheckpoint[] = [];

  for (let idx = 0; idx < list.length; idx++) {
    const cp = list[idx];
    if (!cp || typeof cp !== 'object') continue;

    const question = String(cp.question || '').trim();
    if (!question) continue;

    let safeOptions: string[] = ['Pilihan A', 'Pilihan B'];
    if (Array.isArray(cp.options)) {
      safeOptions = cp.options.map((opt: any) => String(opt ?? '').trim()).filter(Boolean);
    } else if (typeof cp.options === 'string') {
      try {
        const parsedOpts = JSON.parse(cp.options);
        if (Array.isArray(parsedOpts)) {
          safeOptions = parsedOpts.map((opt: any) => String(opt ?? '').trim()).filter(Boolean);
        } else {
          safeOptions = cp.options.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      } catch (e) {
        safeOptions = cp.options.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    if (safeOptions.length < 2) {
      safeOptions = ['Pilihan A', 'Pilihan B'];
    }

    result.push({
      id: cp.id ? String(cp.id) : `cp-${idx}-${Date.now()}`,
      timeInSeconds: Math.max(1, Number(cp.timeInSeconds) || 30),
      question,
      type: (cp.type === 'true_false' ? 'true_false' : 'mc') as VideoCheckpoint['type'],
      options: safeOptions,
      correctAnswer: Math.max(0, Math.min(safeOptions.length - 1, Number(cp.correctAnswer) || 0)),
      explanation: String(cp.explanation || 'Jawaban Anda telah dicatat.').trim(),
    });
  }

  return result;
}

export function sanitizeVideosList(videos: any[]): InteractiveVideo[] {
  if (!Array.isArray(videos)) return [];
  const seenIds = new Set<string>();
  const cleanVideos: InteractiveVideo[] = [];

  videos.filter(Boolean).forEach((v, idx) => {
    const vidId = v.id || `vid-${Date.now()}-${idx}`;
    if (seenIds.has(vidId)) return;
    seenIds.add(vidId);

    const cps = parseCheckpoints(v.checkpoints);
    cleanVideos.push({
      id: vidId,
      title: v.title || 'Video Pembelajaran',
      subjectId: v.subjectId || v.subjectid || 'ipas',
      videoUrl: v.videoUrl || '',
      grade: v.grade !== undefined && !isNaN(Number(v.grade)) ? Number(v.grade) : 5,
      checkpointsCount: cps.length,
      checkpoints: cps,
      createdAt: v.createdAt || new Date().toISOString(),
    });
  });

  return cleanVideos;
}

export function getStoredVideos(): InteractiveVideo[] {
  try {
    const data = localStorage.getItem('prima_interactive_videos');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const active = parsed.filter((v) => v && v.id && !isRecordDeleted('videos', v.id));
        return sanitizeVideosList(active);
      }
    }
  } catch (e) {
    console.error('Error reading videos from localStorage', e);
  }
  return INITIAL_VIDEOS.filter((v) => !isRecordDeleted('videos', v.id));
}

export function saveVideos(videos: InteractiveVideo[]): void {
  try {
    const cleanVideos = sanitizeVideosList(videos).filter((v) => !isRecordDeleted('videos', v.id));
    localStorage.setItem('prima_interactive_videos', JSON.stringify(cleanVideos));

    // Persist to Server JSON Database (/api/videos)
    fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videos: cleanVideos }),
    }).catch((err) => {
      console.warn('[Server DB] saveVideos sync warning:', err);
    });

    // Asynchronously push each video to Google Apps Script Spreadsheet
    cleanVideos.forEach((vid) => {
      unmarkRecordDeletedClient('videos', vid.id);
      const payload = {
        id: vid.id,
        title: vid.title,
        subjectId: vid.subjectId,
        subjectid: vid.subjectId,
        videoUrl: vid.videoUrl,
        grade: vid.grade,
        checkpointsCount: vid.checkpointsCount,
        checkpoints: JSON.stringify(vid.checkpoints || []),
        createdAt: vid.createdAt,
      };

      // Push to Google Sheets via GAS (updateRemoteVideo updates existing or appends if new)
      updateRemoteVideo(payload).catch((err) => {
        console.warn('[GAS Sync] Failed to push video to Google Sheets:', err);
      });
    });
  } catch (e) {
    console.error('Error saving videos to localStorage', e);
  }
}

export function deleteVideo(id: string): void {
  markRecordDeletedClient('videos', id);
  const current = getStoredVideos();
  const filtered = current.filter((v) => v.id !== id);
  localStorage.setItem('prima_interactive_videos', JSON.stringify(filtered));

  fetch(`/api/videos/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteVideo({ id }).catch(() => {});
}

export async function syncVideosWithGAS(): Promise<InteractiveVideo[]> {
  await syncDeletedRecordsWithServer().catch(() => {});
  const currentLocal = getStoredVideos();
  const localMap = new Map<string, InteractiveVideo>();
  currentLocal.forEach((v) => {
    if (v && v.id && !isRecordDeleted('videos', v.id)) {
      localMap.set(v.id, v);
      if (v.videoUrl) localMap.set(v.videoUrl, v);
    }
  });

  // 1. Fetch from server-side database first
  try {
    const sRes = await fetch('/api/videos');
    if (sRes.ok) {
      const sData = await sRes.json();
      if (sData.success && Array.isArray(sData.videos) && sData.videos.length > 0) {
        const serverVideos = sanitizeVideosList(sData.videos);
        serverVideos.forEach((sv) => {
          if (sv && sv.id && !isRecordDeleted('videos', sv.id)) {
            localMap.set(sv.id, sv);
            if (sv.videoUrl) localMap.set(sv.videoUrl, sv);
          }
        });
      }
    }
  } catch (sErr) {
    console.warn('[Sync] Failed to fetch server videos:', sErr);
  }

  // 2. Fetch from Google Apps Script Spreadsheet
  try {
    const remote = await getRemoteVideos();
    if (remote && Array.isArray(remote) && remote.length > 0) {
      const validRemote = remote.filter((v: any) => v && (v.id || v.title || v.videoUrl) && !isRecordDeleted('videos', v.id));

      validRemote.forEach((r: any) => {
        const vidId = r.id || `vid-${Date.now()}`;
        if (isRecordDeleted('videos', vidId)) return;
        const existing = localMap.get(vidId) || (r.videoUrl ? localMap.get(r.videoUrl) : undefined);

        let parsedCps = parseCheckpoints(r.checkpoints);
        // CRITICAL PROTECTION: If remote sheet has NO checkpoints, but local/server has checkpoints, PRESERVE THEM!
        if (parsedCps.length === 0 && existing && Array.isArray(existing.checkpoints) && existing.checkpoints.length > 0) {
          parsedCps = existing.checkpoints;
        }

        const mergedVideo: InteractiveVideo = {
          id: vidId,
          title: r.title || existing?.title || 'Video Interaktif',
          subjectId: r.subjectId || r.subjectid || existing?.subjectId || 'ipas',
          videoUrl: r.videoUrl || existing?.videoUrl || '',
          grade: r.grade !== undefined && !isNaN(Number(r.grade)) ? Number(r.grade) : (existing?.grade || 5),
          checkpointsCount: parsedCps.length,
          checkpoints: parsedCps,
          createdAt: r.createdAt || existing?.createdAt || new Date().toISOString(),
        };

        localMap.set(vidId, mergedVideo);
        if (mergedVideo.videoUrl) localMap.set(mergedVideo.videoUrl, mergedVideo);
      });
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync videos with Google Apps Script:', err);
  }

  // Deduplicate and get clean unique list
  const seenIds = new Set<string>();
  const mergedList: InteractiveVideo[] = [];
  localMap.forEach((v) => {
    if (!v || !v.id) return;
    if (isRecordDeleted('videos', v.id)) return;
    if (seenIds.has(v.id)) return;
    seenIds.add(v.id);
    mergedList.push(v);
  });

  const finalList = mergedList.length > 0 ? mergedList : (INITIAL_VIDEOS.length > 0 ? INITIAL_VIDEOS.filter((v) => !isRecordDeleted('videos', v.id)) : currentLocal);

  try {
    localStorage.setItem('prima_interactive_videos', JSON.stringify(finalList));
    fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videos: finalList }),
    }).catch(() => {});
  } catch (e) {}

  return finalList;
}

// ==================== MATERIALS ====================
export function getStoredMaterials(): Material[] {
  try {
    const data = localStorage.getItem('prima_materials');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((m) => m && m.id && !isRecordDeleted('materials', m.id) && m.status !== 'DELETED');
      }
    }
  } catch (e) {
    console.error('Error reading materials from localStorage', e);
  }
  return [];
}

export function saveMaterials(materials: Material[]): void {
  try {
    const cleanList = materials.filter((m) => m && m.id && !isRecordDeleted('materials', m.id));
    localStorage.setItem('prima_materials', JSON.stringify(cleanList));

    // Persist to Server JSON Database (/api/materials)
    fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materials: cleanList }),
    }).catch(() => {});

    cleanList.forEach((mat) => {
      unmarkRecordDeletedClient('materials', mat.id);
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
      createRemoteMaterial(payload).catch((e) =>
        console.warn('[GAS Sync] Materials sync failed:', e)
      );
    });
  } catch (e) {
    console.error('Error saving materials to localStorage', e);
  }
}

export function deleteMaterial(id: string): void {
  markRecordDeletedClient('materials', id);
  const current = getStoredMaterials();
  const filtered = current.filter((m) => m.id !== id);
  localStorage.setItem('prima_materials', JSON.stringify(filtered));

  fetch(`/api/materials/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteMaterial({ id }).catch(() => {});
}

export async function syncMaterialsWithGAS(): Promise<Material[]> {
  try {
    await syncDeletedRecordsWithServer().catch(() => {});

    // Try server first
    const map = new Map<string, Material>();
    getStoredMaterials().forEach((m) => {
      if (m && m.id && !isRecordDeleted('materials', m.id)) map.set(m.id, m);
    });

    try {
      const sRes = await fetch('/api/materials');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.materials)) {
          sData.materials.forEach((sm: any) => {
            if (sm && sm.id && !isRecordDeleted('materials', sm.id) && sm.status !== 'DELETED') {
              map.set(sm.id, sm);
            }
          });
        }
      }
    } catch {}

    const remote = await getRemoteMaterials();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((m: any) => m && (m.id || m.topicTitle) && !isRecordDeleted('materials', m.id) && m.status !== 'DELETED');
      valid.forEach((m: any) => {
        const id = m.id || `mat-${Date.now()}`;
        if (isRecordDeleted('materials', id)) return;
        const cleanMat: Material = {
          id,
          subjectId: m.subjectId || 'ipas',
          grade: Number(m.grade) || 5,
          topicTitle: m.topicTitle || 'Materi Pembelajaran',
          learningObjectives: m.learningObjectives || '',
          description: m.description || '',
          contentBody: m.contentBody || '',
          mediaType: m.mediaType || 'DOCUMENT',
          mediaUrl: m.mediaUrl || '',
          status: m.status || 'TERBIT',
          createdAt: m.createdAt || new Date().toISOString(),
        };
        map.set(id, cleanMat);
      });

      const finalMaterials = Array.from(map.values()).filter((m) => !isRecordDeleted('materials', m.id));
      localStorage.setItem('prima_materials', JSON.stringify(finalMaterials));
      return finalMaterials;
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync materials with Google Apps Script', err);
  }
  return getStoredMaterials();
}

// ==================== QUESTIONS ====================
export function getStoredQuestionBank(): QuestionBankItem[] {
  try {
    const data = localStorage.getItem('prima_question_bank');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((q) => q && q.id && !isRecordDeleted('questions', q.id));
      }
    }
  } catch (e) {
    console.error('Error reading question bank', e);
  }
  return [];
}

export function saveQuestionBank(questions: QuestionBankItem[]): void {
  try {
    const cleanList = questions.filter((q) => q && q.id && !isRecordDeleted('questions', q.id));
    localStorage.setItem('prima_question_bank', JSON.stringify(cleanList));

    // Persist to Server JSON Database (/api/questions)
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: cleanList }),
    }).catch(() => {});

    cleanList.forEach((q) => {
      unmarkRecordDeletedClient('questions', q.id);
      const payload = {
        id: q.id,
        subjectId: q.subjectId,
        grade: q.grade || 5,
        type: q.type,
        level: q.level,
        stimulus: q.stimulus || '',
        questionText: q.questionText || '',
        options: JSON.stringify(q.options || []),
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
        correctAnswers: JSON.stringify(q.correctAnswers || []),
        statements: JSON.stringify(q.statements || []),
        explanation: q.explanation || '',
      };
      createRemoteQuestion(payload).catch((e) =>
        console.warn('[GAS Sync] Questions sync failed:', e)
      );
    });
  } catch (e) {
    console.error('Error saving question bank', e);
  }
}

export function deleteQuestion(id: string): void {
  markRecordDeletedClient('questions', id);
  const current = getStoredQuestionBank();
  const filtered = current.filter((q) => q.id !== id);
  localStorage.setItem('prima_question_bank', JSON.stringify(filtered));

  fetch(`/api/questions/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteQuestion({ id }).catch(() => {});
}

export async function syncQuestionsWithGAS(): Promise<QuestionBankItem[]> {
  try {
    await syncDeletedRecordsWithServer().catch(() => {});

    const map = new Map<string, QuestionBankItem>();
    getStoredQuestionBank().forEach((q) => {
      if (q && q.id && !isRecordDeleted('questions', q.id)) map.set(q.id, q);
    });

    try {
      const sRes = await fetch('/api/questions');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.questions)) {
          sData.questions.forEach((sq: any) => {
            if (sq && sq.id && !isRecordDeleted('questions', sq.id)) {
              map.set(sq.id, sq);
            }
          });
        }
      }
    } catch {}

    const remote = await getRemoteQuestions();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((q: any) => q && (q.id || q.questionText) && !isRecordDeleted('questions', q.id));
      valid.forEach((q: any) => {
        const id = q.id || `qb-${Date.now()}`;
        if (isRecordDeleted('questions', id)) return;
        let opts = q.options;
        if (typeof opts === 'string') {
          try { opts = JSON.parse(opts); } catch (e) { opts = []; }
        }
        let correctAnswers = q.correctAnswers;
        if (typeof correctAnswers === 'string') {
          try { correctAnswers = JSON.parse(correctAnswers); } catch (e) { correctAnswers = []; }
        }
        let stmts = q.statements;
        if (typeof stmts === 'string') {
          try { stmts = JSON.parse(stmts); } catch (e) { stmts = []; }
        }

        map.set(id, {
          id,
          subjectId: q.subjectId || 'ipas',
          grade: Number(q.grade) || 5,
          type: q.type || 'PG',
          level: q.level || 'MOTS',
          stimulus: q.stimulus || '',
          questionText: q.questionText || '',
          options: Array.isArray(opts) ? opts : [],
          correctAnswer: q.correctAnswer !== undefined ? Number(q.correctAnswer) : 0,
          correctAnswers: Array.isArray(correctAnswers) ? correctAnswers : [],
          statements: Array.isArray(stmts) ? stmts : [],
          explanation: q.explanation || '',
        });
      });

      const finalQuestions = Array.from(map.values()).filter((q) => !isRecordDeleted('questions', q.id));
      localStorage.setItem('prima_question_bank', JSON.stringify(finalQuestions));
      return finalQuestions;
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync questions with Google Apps Script', err);
  }
  return getStoredQuestionBank();
}

// ==================== ASSESSMENTS ====================
export function getStoredAssessments(): Assessment[] {
  try {
    const data = localStorage.getItem('prima_assessments');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((a) => a && a.id && !isRecordDeleted('assessments', a.id) && a.status !== 'DELETED');
      }
    }
  } catch (e) {
    console.error('Error reading assessments', e);
  }
  return [];
}

export function saveAssessments(assessments: Assessment[]): void {
  try {
    const cleanList = assessments.filter((a) => a && a.id && !isRecordDeleted('assessments', a.id));
    localStorage.setItem('prima_assessments', JSON.stringify(cleanList));

    // Persist to Server JSON Database (/api/assessments)
    fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessments: cleanList }),
    }).catch(() => {});

    cleanList.forEach((ass) => {
      unmarkRecordDeletedClient('assessments', ass.id);
      const payload = {
        id: ass.id,
        title: ass.title,
        subjectId: ass.subjectId,
        grade: ass.grade || 5,
        durationMinutes: ass.durationMinutes,
        totalQuestions: ass.questions?.length || ass.totalQuestions || 0,
        kktpTarget: ass.kktpTarget,
        randomizeQuestions: ass.randomizeQuestions,
        randomizeOptions: ass.randomizeOptions,
        maxAttempts: ass.maxAttempts,
        showScore: ass.showScore,
        showExplanation: ass.showExplanation,
        status: ass.status,
        questions: JSON.stringify(ass.questions || []),
      };
      createRemoteAssessment(payload).catch((e) =>
        console.warn('[GAS Sync] Assessments sync failed:', e)
      );
    });
  } catch (e) {
    console.error('Error saving assessments', e);
  }
}

export function deleteAssessment(id: string): void {
  markRecordDeletedClient('assessments', id);
  const current = getStoredAssessments();
  const filtered = current.filter((a) => a.id !== id);
  localStorage.setItem('prima_assessments', JSON.stringify(filtered));

  fetch(`/api/assessments/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteAssessment({ id }).catch(() => {});
}

export async function syncAssessmentsWithGAS(): Promise<Assessment[]> {
  try {
    await syncDeletedRecordsWithServer().catch(() => {});

    const map = new Map<string, Assessment>();
    getStoredAssessments().forEach((a) => {
      if (a && a.id && !isRecordDeleted('assessments', a.id)) map.set(a.id, a);
    });

    try {
      const sRes = await fetch('/api/assessments');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.assessments)) {
          sData.assessments.forEach((sa: any) => {
            if (sa && sa.id && !isRecordDeleted('assessments', sa.id) && sa.status !== 'DELETED') {
              map.set(sa.id, sa);
            }
          });
        }
      }
    } catch {}

    const remote = await getRemoteAssessments();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((a: any) => a && (a.id || a.title) && !isRecordDeleted('assessments', a.id) && a.status !== 'DELETED');
      valid.forEach((a: any) => {
        const id = a.id || `ass-${Date.now()}`;
        if (isRecordDeleted('assessments', id)) return;
        let qs = a.questions;
        if (typeof qs === 'string') {
          try { qs = JSON.parse(qs); } catch (e) { qs = []; }
        }
        map.set(id, {
          id,
          title: a.title || 'Asesmen Formatif',
          subjectId: a.subjectId || 'ipas',
          grade: Number(a.grade) || 5,
          durationMinutes: Number(a.durationMinutes) || 30,
          totalQuestions: Array.isArray(qs) ? qs.length : (Number(a.totalQuestions) || 0),
          kktpTarget: Number(a.kktpTarget) || 75,
          randomizeQuestions: a.randomizeQuestions !== false,
          randomizeOptions: a.randomizeOptions !== false,
          maxAttempts: Number(a.maxAttempts) || 2,
          showScore: a.showScore !== false,
          showExplanation: a.showExplanation !== false,
          status: a.status || 'AKTIF',
          questions: Array.isArray(qs) ? qs : [],
        });
      });

      const finalAssessments = Array.from(map.values()).filter((a) => !isRecordDeleted('assessments', a.id));
      localStorage.setItem('prima_assessments', JSON.stringify(finalAssessments));
      return finalAssessments;
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync assessments with Google Apps Script', err);
  }
  return getStoredAssessments();
}

// ==================== CODING CHALLENGES ====================
export function getStoredCodingChallenges(): CodingChallengeItem[] {
  try {
    const data = localStorage.getItem('prima_coding_challenges');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => c && c.id && !isRecordDeleted('coding', c.id));
      }
    }
  } catch (e) {
    console.error('Error reading coding challenges from localStorage', e);
  }
  return [];
}

export function saveCodingChallenges(challenges: CodingChallengeItem[]): void {
  try {
    const cleanList = challenges.filter((c) => c && c.id && !isRecordDeleted('coding', c.id));
    localStorage.setItem('prima_coding_challenges', JSON.stringify(cleanList));

    // Persist to Server JSON Database (/api/coding)
    fetch('/api/coding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coding: cleanList }),
    }).catch(() => {});

    cleanList.forEach((ch) => {
      unmarkRecordDeletedClient('coding', ch.id);
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
      createRemoteCodingChallenge(payload).catch((e) =>
        console.warn('[GAS Sync] CodingChallenges sync failed:', e)
      );
    });
  } catch (e) {
    console.error('Error saving coding challenges to localStorage', e);
  }
}

export function deleteCodingChallenge(id: string): void {
  markRecordDeletedClient('coding', id);
  const current = getStoredCodingChallenges();
  const filtered = current.filter((c) => c.id !== id);
  localStorage.setItem('prima_coding_challenges', JSON.stringify(filtered));

  fetch(`/api/coding/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteCodingChallenge({ id }).catch(() => {});
}

export async function syncCodingChallengesWithGAS(): Promise<CodingChallengeItem[]> {
  try {
    await syncDeletedRecordsWithServer().catch(() => {});

    const map = new Map<string, CodingChallengeItem>();
    getStoredCodingChallenges().forEach((c) => {
      if (c && c.id && !isRecordDeleted('coding', c.id)) map.set(c.id, c);
    });

    try {
      const sRes = await fetch('/api/coding');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.coding)) {
          sData.coding.forEach((sc: any) => {
            if (sc && sc.id && !isRecordDeleted('coding', sc.id)) {
              map.set(sc.id, sc);
            }
          });
        }
      }
    } catch {}

    const remote = await getRemoteCodingChallenges();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((c: any) => c && (c.id || c.title) && !isRecordDeleted('coding', c.id));
      valid.forEach((c: any) => {
        const id = c.id || `cod-${Date.now()}`;
        if (isRecordDeleted('coding', id)) return;
        let startPos = c.startPos;
        if (typeof startPos === 'string') {
          try { startPos = JSON.parse(startPos); } catch (e) { startPos = { x: 0, y: 0 }; }
        }
        let targetPos = c.targetPos;
        if (typeof targetPos === 'string') {
          try { targetPos = JSON.parse(targetPos); } catch (e) { targetPos = { x: 3, y: 3 }; }
        }
        let obstacles = c.obstacles;
        if (typeof obstacles === 'string') {
          try { obstacles = JSON.parse(obstacles); } catch (e) { obstacles = []; }
        }
        let availableBlocks = c.availableBlocks;
        if (typeof availableBlocks === 'string') {
          try { availableBlocks = JSON.parse(availableBlocks); } catch (e) { availableBlocks = []; }
        }
        let expectedSequence = c.expectedSequence;
        if (typeof expectedSequence === 'string') {
          try { expectedSequence = JSON.parse(expectedSequence); } catch (e) { expectedSequence = []; }
        }

        map.set(id, {
          id,
          title: c.title || 'Tantangan Coding',
          subjectId: c.subjectId || 'ipas',
          allowedBlocksCount: Number(c.allowedBlocksCount) || 5,
          characterIcon: c.characterIcon || '🤖',
          gridSize: Number(c.gridSize) || 4,
          startPos: startPos || { x: 0, y: 0 },
          targetPos: targetPos || { x: 3, y: 3 },
          obstacles: Array.isArray(obstacles) ? obstacles : [],
          availableBlocks: Array.isArray(availableBlocks) ? availableBlocks : [],
          expectedSequence: Array.isArray(expectedSequence) ? expectedSequence : [],
          targetGoal: c.targetGoal || '',
        });
      });

      const finalChallenges = Array.from(map.values()).filter((c) => !isRecordDeleted('coding', c.id));
      localStorage.setItem('prima_coding_challenges', JSON.stringify(finalChallenges));
      return finalChallenges;
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync coding challenges with GAS', err);
  }
  return getStoredCodingChallenges();
}

// ==================== ACTIVITIES ====================
export function getStoredActivities(): InteractiveActivity[] {
  try {
    const data = localStorage.getItem('prima_interactive_activities');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((a) => a && a.id && !isRecordDeleted('activities', a.id));
      }
    }
  } catch (e) {
    console.error('Error reading activities', e);
  }
  return [];
}

export function saveActivities(activities: InteractiveActivity[]): void {
  try {
    const cleanList = activities.filter((a) => a && a.id && !isRecordDeleted('activities', a.id));
    localStorage.setItem('prima_interactive_activities', JSON.stringify(cleanList));

    // Persist to Server JSON Database (/api/activities)
    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activities: cleanList }),
    }).catch(() => {});

    cleanList.forEach((act) => {
      unmarkRecordDeletedClient('activities', act.id);
      const payload = {
        id: act.id,
        title: act.title,
        subjectId: act.subjectId,
        type: act.type,
        difficulty: act.difficulty,
        points: act.points,
        description: act.description,
        config: JSON.stringify(act.config || {}),
        lastUpdated: new Date().toISOString(),
      };
      createRemoteActivity(payload).catch((e) =>
        console.warn('[GAS Sync] Activities sync failed:', e)
      );
    });
  } catch (e) {
    console.error('Error saving activities', e);
  }
}

export function deleteActivity(id: string): void {
  markRecordDeletedClient('activities', id);
  const current = getStoredActivities();
  const filtered = current.filter((a) => a.id !== id);
  localStorage.setItem('prima_interactive_activities', JSON.stringify(filtered));

  fetch(`/api/activities/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteActivity({ id }).catch(() => {});
}

export async function syncActivitiesWithGAS(): Promise<InteractiveActivity[]> {
  try {
    await syncDeletedRecordsWithServer().catch(() => {});

    const map = new Map<string, InteractiveActivity>();
    getStoredActivities().forEach((a) => {
      if (a && a.id && !isRecordDeleted('activities', a.id)) map.set(a.id, a);
    });

    try {
      const sRes = await fetch('/api/activities');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.activities)) {
          sData.activities.forEach((sa: any) => {
            if (sa && sa.id && !isRecordDeleted('activities', sa.id)) {
              map.set(sa.id, sa);
            }
          });
        }
      }
    } catch {}

    const remote = await getRemoteActivities();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((a: any) => a && (a.id || a.title) && !isRecordDeleted('activities', a.id));
      valid.forEach((a: any) => {
        const id = a.id || `act-${Date.now()}`;
        if (isRecordDeleted('activities', id)) return;
        let config = a.config;
        if (typeof config === 'string') {
          try { config = JSON.parse(config); } catch (e) { config = {}; }
        }
        map.set(id, {
          id,
          title: a.title || 'Aktivitas Interaktif',
          subjectId: a.subjectId || 'ipas',
          type: a.type || 'SIMULATION',
          difficulty: a.difficulty || 'MOTS',
          points: Number(a.points) || 100,
          description: a.description || '',
          config: config || {},
        });
      });

      const finalActivities = Array.from(map.values()).filter((a) => !isRecordDeleted('activities', a.id));
      localStorage.setItem('prima_interactive_activities', JSON.stringify(finalActivities));
      return finalActivities;
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync activities with GAS', err);
  }
  return getStoredActivities();
}

// ==================== CLASSES ====================
export function getStoredClasses(): ClassRoom[] {
  try {
    const data = localStorage.getItem('prima_classes');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => c && c.id && !isRecordDeleted('classes', c.id));
      }
    }
  } catch (e) {}
  return [];
}

export function saveClasses(classes: ClassRoom[]): void {
  try {
    const cleanList = classes.filter((c) => c && c.id && !isRecordDeleted('classes', c.id));
    localStorage.setItem('prima_classes', JSON.stringify(cleanList));

    // Persist to Server JSON Database (/api/classes)
    fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classes: cleanList }),
    }).catch(() => {});

    cleanList.forEach((cls) => {
      unmarkRecordDeletedClient('classes', cls.id);
      createRemoteClass(cls).catch(() => {});
    });
  } catch (e) {}
}

export function deleteClass(id: string): void {
  markRecordDeletedClient('classes', id);
  const current = getStoredClasses();
  const filtered = current.filter((c) => c.id !== id);
  localStorage.setItem('prima_classes', JSON.stringify(filtered));

  fetch(`/api/classes/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteClass({ id }).catch(() => {});
}

export async function syncClassesWithGAS(): Promise<ClassRoom[]> {
  try {
    await syncDeletedRecordsWithServer().catch(() => {});

    const map = new Map<string, ClassRoom>();
    getStoredClasses().forEach((c) => {
      if (c && c.id && !isRecordDeleted('classes', c.id)) map.set(c.id, c);
    });

    try {
      const sRes = await fetch('/api/classes');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.classes)) {
          sData.classes.forEach((sc: any) => {
            if (sc && sc.id && !isRecordDeleted('classes', sc.id)) {
              map.set(sc.id, sc);
            }
          });
        }
      }
    } catch {}

    const remote = await getRemoteClasses();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((c: any) => c && (c.id || c.name) && !isRecordDeleted('classes', c.id));
      valid.forEach((c: any) => {
        const id = c.id || `cls-${Date.now()}`;
        if (isRecordDeleted('classes', id)) return;
        let studentIds = c.studentIds;
        if (typeof studentIds === 'string') {
          try { studentIds = JSON.parse(studentIds); } catch (e) { studentIds = []; }
        }
        map.set(id, {
          id,
          name: c.name || 'Kelas',
          grade: Number(c.grade) || 5,
          academicYear: c.academicYear || '2026/2027',
          teacherId: c.teacherId || '',
          studentIds: Array.isArray(studentIds) ? studentIds : [],
          avgProgress: Number(c.avgProgress) || 0,
          avgScore: Number(c.avgScore) || 0,
          lastActivity: c.lastActivity || '',
        });
      });

      const finalClasses = Array.from(map.values()).filter((c) => !isRecordDeleted('classes', c.id));
      localStorage.setItem('prima_classes', JSON.stringify(finalClasses));
      return finalClasses;
    }
  } catch (e) {}
  return getStoredClasses();
}

// ==================== ANNOUNCEMENTS ====================
export function getStoredAnnouncements(): Announcement[] {
  try {
    const data = localStorage.getItem('prima_announcements');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((a) => a && a.id && !isRecordDeleted('announcements', a.id));
      }
    }
  } catch (e) {}
  return [];
}

export function saveAnnouncements(announcements: Announcement[]): void {
  try {
    const cleanList = announcements.filter((a) => a && a.id && !isRecordDeleted('announcements', a.id));
    localStorage.setItem('prima_announcements', JSON.stringify(cleanList));

    // Persist to Server JSON Database (/api/announcements)
    fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcements: cleanList }),
    }).catch(() => {});

    cleanList.forEach((anc) => {
      unmarkRecordDeletedClient('announcements', anc.id);
      createRemoteAnnouncement(anc).catch(() => {});
    });
  } catch (e) {}
}

export function deleteAnnouncement(id: string): void {
  markRecordDeletedClient('announcements', id);
  const current = getStoredAnnouncements();
  const filtered = current.filter((a) => a.id !== id);
  localStorage.setItem('prima_announcements', JSON.stringify(filtered));

  fetch(`/api/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteAnnouncement({ id }).catch(() => {});
}

export async function syncAnnouncementsWithGAS(): Promise<Announcement[]> {
  try {
    await syncDeletedRecordsWithServer().catch(() => {});

    const map = new Map<string, Announcement>();
    getStoredAnnouncements().forEach((a) => {
      if (a && a.id && !isRecordDeleted('announcements', a.id)) map.set(a.id, a);
    });

    try {
      const sRes = await fetch('/api/announcements');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.announcements)) {
          sData.announcements.forEach((sa: any) => {
            if (sa && sa.id && !isRecordDeleted('announcements', sa.id)) {
              map.set(sa.id, sa);
            }
          });
        }
      }
    } catch {}

    const remote = await getRemoteAnnouncements();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((a: any) => a && (a.id || a.title) && !isRecordDeleted('announcements', a.id));
      valid.forEach((a: any) => {
        const id = a.id || `anc-${Date.now()}`;
        if (isRecordDeleted('announcements', id)) return;
        map.set(id, {
          id,
          title: a.title || 'Pengumuman',
          content: a.content || '',
          targetClass: a.targetClass || 'SEMUA',
          createdAt: a.createdAt || new Date().toISOString(),
          authorName: a.authorName || 'Pengajar',
          status: a.status || 'TERBIT',
        });
      });

      const finalAnnouncements = Array.from(map.values()).filter((a) => !isRecordDeleted('announcements', a.id));
      localStorage.setItem('prima_announcements', JSON.stringify(finalAnnouncements));
      return finalAnnouncements;
    }
  } catch (e) {}
  return getStoredAnnouncements();
}

// ==================== REFLECTIONS ====================
export function getStoredReflections(): ReflectionEntry[] {
  try {
    const data = localStorage.getItem('prima_reflections');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveReflections(reflections: ReflectionEntry[]): void {
  try {
    localStorage.setItem('prima_reflections', JSON.stringify(reflections));
    reflections.forEach((ref) => {
      createRemoteReflection(ref).catch(() => {});
    });
  } catch (e) {}
}

export async function syncReflectionsWithGAS(): Promise<ReflectionEntry[]> {
  try {
    const remote = await getRemoteReflections();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((r: any) => r && (r.id || r.content));
      const cleanList: ReflectionEntry[] = valid.map((r: any) => ({
        id: r.id || `ref-${Date.now()}`,
        studentId: r.studentId || '',
        studentName: r.studentName || 'Murid',
        topicTitle: r.topicTitle || 'Topik',
        content: r.content || '',
        createdAt: r.createdAt || new Date().toISOString(),
        aiInsight: r.aiInsight || '',
      }));
      localStorage.setItem('prima_reflections', JSON.stringify(cleanList));
      return cleanList;
    }
  } catch (e) {}
  return getStoredReflections();
}

// ==================== AI TUTOR CONFIGS ====================
export function getStoredAiConfigs(): AITutorConfig[] {
  try {
    const data = localStorage.getItem('prima_ai_configs');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => c && c.id && !isRecordDeleted('ai_configs', c.id));
      }
    }
  } catch (e) {}
  return [];
}

export function saveAiConfigs(configs: AITutorConfig[]): void {
  try {
    const cleanList = configs.filter((c) => c && c.id && !isRecordDeleted('ai_configs', c.id));
    localStorage.setItem('prima_ai_configs', JSON.stringify(cleanList));

    // Persist to Server JSON Database (/api/ai-configs)
    fetch('/api/ai-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configs: cleanList }),
    }).catch(() => {});

    cleanList.forEach((cfg) => {
      unmarkRecordDeletedClient('ai_configs', cfg.id);
      createRemoteAITutorConfig(cfg).catch(() => {});
    });
  } catch (e) {}
}

export function deleteAiConfig(id: string): void {
  markRecordDeletedClient('ai_configs', id);
  const current = getStoredAiConfigs();
  const filtered = current.filter((c) => c.id !== id);
  localStorage.setItem('prima_ai_configs', JSON.stringify(filtered));

  fetch(`/api/ai-configs/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  deleteRemoteAITutorConfig({ id }).catch(() => {});
}

export async function syncAiConfigsWithGAS(): Promise<AITutorConfig[]> {
  try {
    await syncDeletedRecordsWithServer().catch(() => {});

    const map = new Map<string, AITutorConfig>();
    getStoredAiConfigs().forEach((c) => {
      if (c && c.id && !isRecordDeleted('ai_configs', c.id)) map.set(c.id, c);
    });

    try {
      const sRes = await fetch('/api/ai-configs');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.configs)) {
          sData.configs.forEach((sc: any) => {
            if (sc && sc.id && !isRecordDeleted('ai_configs', sc.id)) {
              map.set(sc.id, sc);
            }
          });
        }
      }
    } catch {}

    const remote = await getRemoteAITutorConfigs();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((c: any) => c && (c.id || c.tutorName) && !isRecordDeleted('ai_configs', c.id));
      valid.forEach((c: any) => {
        const id = c.id || `aic-${Date.now()}`;
        if (isRecordDeleted('ai_configs', id)) return;
        let starterPrompts = c.starterPrompts;
        if (typeof starterPrompts === 'string') {
          try { starterPrompts = JSON.parse(starterPrompts); } catch (e) { starterPrompts = []; }
        }
        map.set(id, {
          id,
          subjectId: c.subjectId || 'ipas',
          topicTitle: c.topicTitle || 'Materi',
          tutorName: c.tutorName || 'PRIMA AI Tutor',
          learningGoal: c.learningGoal || '',
          communicationStyle: c.communicationStyle || '',
          rulesAndScaffolding: c.rulesAndScaffolding || '',
          starterPrompts: Array.isArray(starterPrompts) ? starterPrompts : [],
          maxTokensLimit: Number(c.maxTokensLimit) || 1000,
        });
      });

      const finalConfigs = Array.from(map.values()).filter((c) => !isRecordDeleted('ai_configs', c.id));
      localStorage.setItem('prima_ai_configs', JSON.stringify(finalConfigs));
      return finalConfigs;
    }
  } catch (e) {}
  return getStoredAiConfigs();
}

// ==================== STUDENT PROGRESS ====================
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
          badges: DEFAULT_STUDENT_PROGRESS.badges,
          topicScores: DEFAULT_STUDENT_PROGRESS.topicScores,
        };
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

// ==================== MATERIAL TO TOPIC BUILDER ====================
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
          videoUrl: mat.mediaUrl || '',
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
          type: (mat.subjectId?.toLowerCase() === 'matematika' || mat.topicTitle.toLowerCase().includes('kpk') || mat.topicTitle.toLowerCase().includes('fpb') || mat.topicTitle.toLowerCase().includes('faktor') || mat.topicTitle.toLowerCase().includes('angka')) ? 'math' : 'ecosystem',
          title: `Laboratorium Simulasi: ${mat.topicTitle}`,
          description: mat.description || `Uji coba dan manipulasi variabel interaktif untuk memahami konsep ${mat.topicTitle}.`,
          initialData: (mat.subjectId?.toLowerCase() === 'matematika' || mat.topicTitle.toLowerCase().includes('kpk')) ? { numA: 12, numB: 18 } : { grass: 100, grasshopper: 50, frog: 20, snake: 6 },
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

    const existingTopics = [...(sub.topics || [])];

    subMaterials.forEach((mat) => {
      const existingIdx = existingTopics.findIndex(
        (t) =>
          t.id === `top-${mat.id}` ||
          t.title.toLowerCase() === mat.topicTitle.toLowerCase()
      );

      if (existingIdx >= 0) {
        existingTopics[existingIdx] = {
          ...existingTopics[existingIdx],
          title: mat.topicTitle,
          description: mat.description || mat.learningObjectives,
        };
      } else {
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

// ==================== SETTINGS ====================
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
  return true;
}

export function saveTtsSetting(enabled: boolean): void {
  try {
    localStorage.setItem('prima_tts_enabled', String(enabled));
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
