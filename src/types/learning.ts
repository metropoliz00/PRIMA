export type StepType = 
  | 'pemantik'
  | 'eksplorasi'
  | 'interaksi'
  | 'video'
  | 'ai_tutor'
  | 'simulasi'
  | 'coding'
  | 'hots'
  | 'asesmen'
  | 'refleksi';

export interface Step {
  id: string;
  stepNumber: number;
  type: StepType;
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  content: any;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  grade: number;
  estimatedMinutes: number;
  steps: Step[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
  grade: number;
  status?: 'PUBLISHED' | 'DRAFT';
  topics: Topic[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'Universal' | 'IPAS' | 'Matematika' | 'Bahasa';
}

export interface StudentProgress {
  studentName: string;
  avatarUrl: string;
  xp: number;
  level: number;
  streakDays: number;
  completedTopicsCount: number;
  badges: Badge[];
  topicScores: Record<string, number>;
}

export interface VideoCheckpoint {
  id: string;
  timeInSeconds: number;
  question: string;
  type: 'mc' | 'true_false';
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface InteractiveVideo {
  id: string;
  title: string;
  subjectId: string;
  videoUrl: string;
  grade?: number;
  checkpointsCount?: number;
  checkpoints?: VideoCheckpoint[];
  createdAt?: string;
}

export interface CodingBlock {
  id: string;
  text: string;
  category: 'condition' | 'action' | 'control';
  snippet: string;
  color: string;
}

export interface StatementItem {
  id: string;
  text: string;
  isTrue: boolean;
}

export interface QuestionBankItem {
  id: string;
  subjectId: string;
  grade: number;
  type: 'PG' | 'PGK' | 'BS'; // Pilihan Ganda, Pilihan Ganda Kompleks, Benar/Salah Tabel
  level: 'LOTS' | 'MOTS' | 'HOTS';
  stimulus?: string; // Teks stimulus wacana
  questionText: string;
  options?: string[]; // Untuk PG & PGK
  correctAnswer?: number; // Untuk PG
  correctAnswers?: number[]; // Untuk PGK (misal: [0, 2])
  statements?: StatementItem[]; // Untuk BS (3 pernyataan tabel)
  explanation: string;
}

export interface AssessmentQuestion extends QuestionBankItem {
  hint?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: number;
  academicYear: string;
  teacherId?: string;
  studentIds: string[];
  avgProgress: number;
  avgScore: number;
  lastActivity: string;
}

export interface Material {
  id: string;
  subjectId: string;
  grade: number;
  topicTitle: string;
  learningObjectives: string;
  description: string;
  contentBody: string;
  mediaType: 'VIDEO' | 'IMAGE' | 'SIMULATION' | 'DOCUMENT';
  mediaUrl: string;
  status: 'DRAFT' | 'TERBIT' | 'ARSIP';
  createdAt: string;
}

export interface Assessment {
  id: string;
  title: string;
  subjectId: string;
  grade: number;
  durationMinutes: number;
  totalQuestions: number;
  kktpTarget: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  maxAttempts: number;
  showScore: boolean;
  showExplanation: boolean;
  status: 'DRAFT' | 'AKTIF' | 'SELESAI';
  questions: QuestionBankItem[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetClass: string;
  createdAt: string;
  authorName: string;
  status: 'TERBIT' | 'DRAFT';
}

export interface AITutorConfig {
  id: string;
  subjectId: string;
  topicTitle: string;
  tutorName: string;
  learningGoal: string;
  communicationStyle: string;
  rulesAndScaffolding: string;
  starterPrompts: string[];
  maxTokensLimit: number;
}

export interface ReflectionEntry {
  id: string;
  studentId: string;
  studentName: string;
  topicTitle: string;
  content: string;
  createdAt: string;
  aiInsight?: string;
  teacherFeedback?: string;
}

export interface TeacherAnalytics {
  totalStudents: number;
  activeToday: number;
  avgProgressPercent: number;
  avgAssessmentScore: number;
  strugglingTopicName: string;
  aiHelpCount: number;
  avgLearningTimeMinutes: number;
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
