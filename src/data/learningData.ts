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
  getRemoteVideos,
  createRemoteVideo,
  updateRemoteVideo,
  getRemoteMaterials,
  createRemoteMaterial,
  getRemoteAssessments,
  createRemoteAssessment,
  updateRemoteAssessment,
  getRemoteQuestions,
  createRemoteQuestion,
  updateRemoteQuestion,
  getRemoteCodingChallenges,
  createRemoteCodingChallenge,
  getRemoteActivities,
  createRemoteActivity,
  getRemoteClasses,
  createRemoteClass,
  getRemoteAnnouncements,
  createRemoteAnnouncement,
  getRemoteReflections,
  createRemoteReflection,
  getRemoteAITutorConfigs,
  createRemoteAITutorConfig,
  getRemoteSettings,
  createRemoteSetting,
  updateRemoteSetting,
  pushAppData,
  fetchAppData,
  cleanupRemoteDuplicates,
} from '../services/appscript';

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
export const INITIAL_VIDEOS: InteractiveVideo[] = [];
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
        return deduplicateSubjects(parsed);
      }
    }
  } catch (e) {
    console.error('Error reading subjects from localStorage', e);
  }
  return [];
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    const cleaned = deduplicateSubjects(subjects);
    localStorage.setItem('prima_subjects', JSON.stringify(cleaned));
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
    const remote = await getRemoteSubjects();
    if (remote && Array.isArray(remote)) {
      const validRemote = remote.filter((s: any) => s && (s.id || s.name));
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
export function getStoredVideos(): InteractiveVideo[] {
  try {
    const data = localStorage.getItem('prima_interactive_videos');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading videos from localStorage', e);
  }
  return [];
}

export function saveVideos(videos: InteractiveVideo[]): void {
  try {
    const seenIds = new Set<string>();
    const cleanVideos: InteractiveVideo[] = [];

    (videos || []).filter(Boolean).forEach((v) => {
      const vidId = v.id || `vid-${Date.now()}`;
      if (seenIds.has(vidId)) return;
      seenIds.add(vidId);

      const cps = Array.isArray(v.checkpoints) ? v.checkpoints : [];
      cleanVideos.push({
        ...v,
        id: vidId,
        title: v.title || 'Video Pembelajaran',
        subjectId: v.subjectId || 'ipas',
        videoUrl: v.videoUrl || '',
        grade: v.grade !== undefined ? Number(v.grade) : 5,
        checkpointsCount: cps.length || Number(v.checkpointsCount) || 0,
        checkpoints: cps,
        createdAt: v.createdAt || new Date().toISOString(),
      });
    });

    localStorage.setItem('prima_interactive_videos', JSON.stringify(cleanVideos));
    cleanVideos.forEach((vid) => {
      createRemoteVideo({
        id: vid.id,
        title: vid.title,
        subjectId: vid.subjectId,
        videoUrl: vid.videoUrl,
        grade: vid.grade,
        checkpointsCount: vid.checkpointsCount,
        checkpoints: JSON.stringify(vid.checkpoints || []),
        createdAt: vid.createdAt,
      }).catch(() => {});
    });
  } catch (e) {
    console.error('Error saving videos to localStorage', e);
  }
}

export async function syncVideosWithGAS(): Promise<InteractiveVideo[]> {
  try {
    const remote = await getRemoteVideos();
    if (remote && Array.isArray(remote)) {
      const validRemote = remote.filter((v: any) => v && (v.id || v.title));
      const seenIds = new Set<string>();
      const cleanList: InteractiveVideo[] = [];

      validRemote.forEach((r: any) => {
        const vidId = r.id || `vid-${Date.now()}-${cleanList.length}`;
        if (seenIds.has(vidId)) return;
        seenIds.add(vidId);

        let parsedCheckpoints: VideoCheckpoint[] = [];
        if (Array.isArray(r.checkpoints)) {
          parsedCheckpoints = r.checkpoints;
        } else if (typeof r.checkpoints === 'string') {
          try {
            const p = JSON.parse(r.checkpoints);
            if (Array.isArray(p)) parsedCheckpoints = p;
          } catch (e) {}
        }

        cleanList.push({
          id: vidId,
          title: r.title || 'Video Interaktif',
          subjectId: r.subjectId || 'ipas',
          videoUrl: r.videoUrl || '',
          grade: r.grade !== undefined ? Number(r.grade) : 5,
          checkpointsCount: parsedCheckpoints.length || Number(r.checkpointsCount) || 0,
          checkpoints: parsedCheckpoints,
          createdAt: r.createdAt || new Date().toISOString(),
        });
      });

      localStorage.setItem('prima_interactive_videos', JSON.stringify(cleanList));
      return cleanList;
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync videos with Google Apps Script', err);
  }
  return getStoredVideos();
}

// ==================== MATERIALS ====================
export function getStoredMaterials(): Material[] {
  try {
    const data = localStorage.getItem('prima_materials');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading materials from localStorage', e);
  }
  return [];
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
      createRemoteMaterial(payload).catch((e) =>
        console.warn('[GAS Sync] Materials sync failed:', e)
      );
    });
  } catch (e) {
    console.error('Error saving materials to localStorage', e);
  }
}

export async function syncMaterialsWithGAS(): Promise<Material[]> {
  try {
    const remote = await getRemoteMaterials();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((m: any) => m && (m.id || m.topicTitle));
      const cleanList: Material[] = valid.map((m: any) => ({
        id: m.id || `mat-${Date.now()}`,
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
      }));
      localStorage.setItem('prima_materials', JSON.stringify(cleanList));
      return cleanList;
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading question bank', e);
  }
  return [];
}

export function saveQuestionBank(questions: QuestionBankItem[]): void {
  try {
    localStorage.setItem('prima_question_bank', JSON.stringify(questions));
    questions.forEach((q) => {
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

export async function syncQuestionsWithGAS(): Promise<QuestionBankItem[]> {
  try {
    const remote = await getRemoteQuestions();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((q: any) => q && (q.id || q.questionText));
      const cleanList: QuestionBankItem[] = valid.map((q: any) => {
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

        return {
          id: q.id || `qb-${Date.now()}`,
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
        };
      });
      localStorage.setItem('prima_question_bank', JSON.stringify(cleanList));
      return cleanList;
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading assessments', e);
  }
  return [];
}

export function saveAssessments(assessments: Assessment[]): void {
  try {
    localStorage.setItem('prima_assessments', JSON.stringify(assessments));
    assessments.forEach((ass) => {
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

export async function syncAssessmentsWithGAS(): Promise<Assessment[]> {
  try {
    const remote = await getRemoteAssessments();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((a: any) => a && (a.id || a.title));
      const cleanList: Assessment[] = valid.map((a: any) => {
        let qs = a.questions;
        if (typeof qs === 'string') {
          try { qs = JSON.parse(qs); } catch (e) { qs = []; }
        }
        return {
          id: a.id || `ass-${Date.now()}`,
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
        };
      });
      localStorage.setItem('prima_assessments', JSON.stringify(cleanList));
      return cleanList;
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading coding challenges from localStorage', e);
  }
  return [];
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
      createRemoteCodingChallenge(payload).catch((e) =>
        console.warn('[GAS Sync] CodingChallenges sync failed:', e)
      );
    });
  } catch (e) {
    console.error('Error saving coding challenges to localStorage', e);
  }
}

export async function syncCodingChallengesWithGAS(): Promise<CodingChallengeItem[]> {
  try {
    const remote = await getRemoteCodingChallenges();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((c: any) => c && (c.id || c.title));
      const cleanList: CodingChallengeItem[] = valid.map((c: any) => {
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

        return {
          id: c.id || `cod-${Date.now()}`,
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
        };
      });
      localStorage.setItem('prima_coding_challenges', JSON.stringify(cleanList));
      return cleanList;
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading activities', e);
  }
  return [];
}

export function saveActivities(activities: InteractiveActivity[]): void {
  try {
    localStorage.setItem('prima_interactive_activities', JSON.stringify(activities));
    activities.forEach((act) => {
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

export async function syncActivitiesWithGAS(): Promise<InteractiveActivity[]> {
  try {
    const remote = await getRemoteActivities();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((a: any) => a && (a.id || a.title));
      const cleanList: InteractiveActivity[] = valid.map((a: any) => {
        let config = a.config;
        if (typeof config === 'string') {
          try { config = JSON.parse(config); } catch (e) { config = {}; }
        }
        return {
          id: a.id || `act-${Date.now()}`,
          title: a.title || 'Aktivitas Interaktif',
          subjectId: a.subjectId || 'ipas',
          type: a.type || 'SIMULATION',
          difficulty: a.difficulty || 'MOTS',
          points: Number(a.points) || 100,
          description: a.description || '',
          config: config || {},
        };
      });
      localStorage.setItem('prima_interactive_activities', JSON.stringify(cleanList));
      return cleanList;
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveClasses(classes: ClassRoom[]): void {
  try {
    localStorage.setItem('prima_classes', JSON.stringify(classes));
    classes.forEach((cls) => {
      createRemoteClass(cls).catch(() => {});
    });
  } catch (e) {}
}

export async function syncClassesWithGAS(): Promise<ClassRoom[]> {
  try {
    const remote = await getRemoteClasses();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((c: any) => c && (c.id || c.name));
      const cleanList: ClassRoom[] = valid.map((c: any) => {
        let studentIds = c.studentIds;
        if (typeof studentIds === 'string') {
          try { studentIds = JSON.parse(studentIds); } catch (e) { studentIds = []; }
        }
        return {
          id: c.id || `cls-${Date.now()}`,
          name: c.name || 'Kelas',
          grade: Number(c.grade) || 5,
          academicYear: c.academicYear || '2026/2027',
          teacherId: c.teacherId || '',
          studentIds: Array.isArray(studentIds) ? studentIds : [],
          avgProgress: Number(c.avgProgress) || 0,
          avgScore: Number(c.avgScore) || 0,
          lastActivity: c.lastActivity || '',
        };
      });
      localStorage.setItem('prima_classes', JSON.stringify(cleanList));
      return cleanList;
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAnnouncements(announcements: Announcement[]): void {
  try {
    localStorage.setItem('prima_announcements', JSON.stringify(announcements));
    announcements.forEach((anc) => {
      createRemoteAnnouncement(anc).catch(() => {});
    });
  } catch (e) {}
}

export async function syncAnnouncementsWithGAS(): Promise<Announcement[]> {
  try {
    const remote = await getRemoteAnnouncements();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((a: any) => a && (a.id || a.title));
      const cleanList: Announcement[] = valid.map((a: any) => ({
        id: a.id || `anc-${Date.now()}`,
        title: a.title || 'Pengumuman',
        content: a.content || '',
        targetClass: a.targetClass || 'SEMUA',
        createdAt: a.createdAt || new Date().toISOString(),
        authorName: a.authorName || 'Pengajar',
        status: a.status || 'TERBIT',
      }));
      localStorage.setItem('prima_announcements', JSON.stringify(cleanList));
      return cleanList;
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAiConfigs(configs: AITutorConfig[]): void {
  try {
    localStorage.setItem('prima_ai_configs', JSON.stringify(configs));
    configs.forEach((cfg) => {
      createRemoteAITutorConfig(cfg).catch(() => {});
    });
  } catch (e) {}
}

export async function syncAiConfigsWithGAS(): Promise<AITutorConfig[]> {
  try {
    const remote = await getRemoteAITutorConfigs();
    if (remote && Array.isArray(remote)) {
      const valid = remote.filter((c: any) => c && (c.id || c.tutorName));
      const cleanList: AITutorConfig[] = valid.map((c: any) => {
        let starterPrompts = c.starterPrompts;
        if (typeof starterPrompts === 'string') {
          try { starterPrompts = JSON.parse(starterPrompts); } catch (e) { starterPrompts = []; }
        }
        return {
          id: c.id || `aic-${Date.now()}`,
          subjectId: c.subjectId || 'ipas',
          topicTitle: c.topicTitle || 'Materi',
          tutorName: c.tutorName || 'PRIMA AI Tutor',
          learningGoal: c.learningGoal || '',
          communicationStyle: c.communicationStyle || '',
          rulesAndScaffolding: c.rulesAndScaffolding || '',
          starterPrompts: Array.isArray(starterPrompts) ? starterPrompts : [],
          maxTokensLimit: Number(c.maxTokensLimit) || 1000,
        };
      });
      localStorage.setItem('prima_ai_configs', JSON.stringify(cleanList));
      return cleanList;
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
