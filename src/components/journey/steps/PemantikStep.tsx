import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Bot,
  RotateCcw,
  Mic,
  MicOff,
  Award,
  Star,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import {
  evaluatePemantikAnswer,
  PemantikEvaluationResult,
  generatePemantikQuestion,
  getClientDynamicPemantikFallback,
} from '../../../services/aiService';
import { getStoredTtsSetting } from '../../../data/learningData';
import { useAuth } from '../../../context/AuthContext';

interface PemantikStepProps {
  content: any;
  topicTitle?: string;
  subjectName?: string;
  onNext: () => void;
}

export const PemantikStep: React.FC<PemantikStepProps> = ({
  content,
  topicTitle = 'Misi Belajar',
  subjectName = 'IPAS',
  onNext
}) => {
  const { user } = useAuth();

  // Initialize with topic-aware dynamic question immediately so there is no layout jump
  const [initialData] = useState(() =>
    getClientDynamicPemantikFallback({
      topicTitle,
      subjectName,
      baseQuestion: content?.question,
      learningObjectives: content?.learningObjectives || content?.explanation,
      studentName: user?.name || '',
      studentGrade: user?.grade || 5,
      variationSeed: `${Date.now()}_${Math.random()}`,
    })
  );

  const [dynamicQuestion, setDynamicQuestion] = useState(initialData.question);
  const [dynamicClue, setDynamicClue] = useState(initialData.clue);
  const [dynamicIdealAnswer, setDynamicIdealAnswer] = useState(initialData.idealAnswer);
  const [dynamicExplanation, setDynamicExplanation] = useState(initialData.explanation);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [questionSeed, setQuestionSeed] = useState(1);
  const [changeCount, setChangeCount] = useState<number>(0);

  const [studentAnswer, setStudentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<PemantikEvaluationResult | null>(null);
  const [showClue, setShowClue] = useState(false);
  const evaluationRef = useRef<HTMLDivElement>(null);

  // Automatically fetch/generate a fresh AI question each time student enters or switches topic/seed
  useEffect(() => {
    let isMounted = true;
    const fetchFreshAiQuestion = async () => {
      setIsGeneratingQuestion(true);
      try {
        const fresh = await generatePemantikQuestion({
          topicTitle,
          subjectName,
          baseQuestion: content?.question,
          learningObjectives: content?.learningObjectives || content?.explanation,
          studentName: user?.name || '',
          studentGrade: user?.grade || 5,
          variationSeed: `${Date.now()}_${questionSeed}_${Math.random()}`,
        });
        if (isMounted && fresh?.question) {
          setDynamicQuestion(fresh.question);
          setDynamicClue(fresh.clue);
          setDynamicIdealAnswer(fresh.idealAnswer);
          setDynamicExplanation(fresh.explanation);
          setIsAiGenerated(fresh.isAiGenerated);
        }
      } catch (err) {
        console.warn('AI question generation error:', err);
      } finally {
        if (isMounted) {
          setIsGeneratingQuestion(false);
        }
      }
    };

    fetchFreshAiQuestion();

    return () => {
      isMounted = false;
    };
  }, [topicTitle, subjectName, questionSeed]);

  // Handler to manually refresh or randomize question on demand
  const handleRefreshQuestion = () => {
    setEvaluation(null);
    setStudentAnswer('');
    setShowClue(false);
    setQuestionSeed((prev) => prev + 1);
    setChangeCount((prev) => prev + 1);
  };

  // Pre-load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll to evaluation when ready
  useEffect(() => {
    if (evaluation && evaluationRef.current) {
      evaluationRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [evaluation]);

  // Speak AI Evaluation Text (Activated strictly if Teacher has turned on TTS)
  const speakEvaluationIfAllowed = (evalData: PemantikEvaluationResult) => {
    const isTtsAllowed = getStoredTtsSetting();
    if (!isTtsAllowed || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const textToSpeak = `
      ${evalData.statusLabel}.
      Umpan balik dari PRIMA AI:
      ${evalData.feedback}.
      Kunci jawaban yang benar:
      ${evalData.idealAnswer}.
      Penjelasan konsep materi:
      ${evalData.explanation}.
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    utterance.rate = 0.98;

    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(
      (v) => v.lang.startsWith('id') || v.lang.startsWith('in') || v.name.toLowerCase().includes('indonesia')
    );
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Submit Answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    const trimmed = studentAnswer.trim();
    if (!trimmed || trimmed.length < 3) return;

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSubmitting(true);
    try {
      const result = await evaluatePemantikAnswer({
        question: dynamicQuestion,
        studentAnswer: trimmed,
        topicTitle,
        subjectName,
        referenceExplanation: dynamicExplanation || content?.explanation || '',
        referenceCorrectAnswer: dynamicIdealAnswer || content?.idealAnswer || '',
      });

      setEvaluation(result);

      // Automatically speak evaluation in background if teacher turned on TTS
      setTimeout(() => {
        speakEvaluationIfAllowed(result);
      }, 400);
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow student to edit/revise their answer
  const handleResetForRevision = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setEvaluation(null);
  };

  const wordCount = studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0;
  const isInputValid = studentAnswer.trim().length >= 3;

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 shadow-lg bg-white">
      {/* 1. Header Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-md shadow-amber-500/20">
            <Lightbulb className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/60">
                Langkah 1: Pertanyaan Pemantik
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Uji Rasa Ingin Tahumu & Bernalar Kritis! 💡
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
            Materi: <strong className="text-slate-800">{topicTitle}</strong>
          </span>
        </div>
      </div>

      {/* 2. Stimulus & Dynamic Question Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-yellow-50/80 border border-amber-200/90 shadow-inner space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Pertanyaan Berpikir Kritis Siswa</span>
            {isGeneratingQuestion && (
              <span className="text-[10px] font-black bg-white/90 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600 animate-spin" />
                <span>Merumuskan Pertanyaan Baru...</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefreshQuestion}
            disabled={isGeneratingQuestion || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/80 text-amber-900 font-extrabold text-xs border border-amber-300 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 group"
            title="Klik untuk meminta AI membuatkan variasi pertanyaan pemantik baru tentang materi ini"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-amber-700 group-hover:rotate-180 transition-transform ${isGeneratingQuestion ? 'animate-spin' : ''}`} />
            <span>{isGeneratingQuestion ? 'Memuat Variasi...' : `Ganti Pertanyaan AI 🔄 (${changeCount}/3)`}</span>
          </button>
        </div>

        {/* Progress Tracker: Ganti Pertanyaan Minimal 3x */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/95 border border-amber-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black text-slate-800">Syarat Lanjut Eksplorasi:</span>
            <span
              className={`px-3 py-1 rounded-full font-black text-xs inline-flex items-center gap-1.5 transition-all ${
                changeCount >= 3
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {changeCount >= 3 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Syarat Terpenuhi ({changeCount}/3) - Siap Lanjut! 🎉</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Ganti Pertanyaan: {changeCount}/3 Kali</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((step) => {
              const isDone = changeCount >= step;
              return (
                <div
                  key={step}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <span>{isDone ? '✓' : step}</span>
                  <span className="text-[10px]">Ganti {step}x</span>
                </div>
              );
            })}
          </div>
        </div>

        {isGeneratingQuestion ? (
          <div className="py-4 flex items-center gap-3 text-amber-900 font-bold text-sm animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
            <span>PRIMA AI sedang menyiapkan pertanyaan pemantik baru untuk topik {topicTitle}...</span>
          </div>
        ) : (
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {dynamicQuestion}
          </p>
        )}

        {/* Collapsible Clue / Hint */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowClue(!showClue)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs"
          >
            <span>💡 {showClue ? 'Tutup Petunjuk Awal' : 'Butuh Petunjuk Berpikir?'}</span>
            {showClue ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showClue && (
            <div className="mt-2.5 p-3.5 rounded-xl bg-white border border-amber-200 text-xs text-slate-700 leading-relaxed shadow-sm animate-fadeIn">
              <strong className="text-amber-800">Petunjuk Berpikir:</strong>{' '}
              {dynamicClue || 'Pikirkan hubungan sebab-akibat yang terjadi pada fenomena materi ini. Tuliskan apa yang terlintas di pikiranmu secara jujur dan mandiri!'}
            </div>
          )}
        </div>
      </div>

      {/* 3. Input Section (Isian Siswa) */}
      {!evaluation ? (
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span>Tuliskan Jawaban atau Pendapatmu Sendiri:</span>
            </label>

            {/* Voice Dictation (Mic) for speaking input (REMOVED) */}
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              rows={4}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              disabled={isSubmitting}
              placeholder="Tuliskan jawaban atau pendapatmu di sini..."
              className="w-full p-4 text-xs sm:text-sm font-medium text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-hidden resize-y placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>{studentAnswer.length} karakter</span>
              <span>•</span>
              <span>{wordCount} kata</span>
              {!isInputValid && studentAnswer.length > 0 && (
                <span className="text-amber-600 font-semibold">(Tulis minimal 3 karakter)</span>
              )}
            </div>

            <button
              type="button"
              disabled={!isInputValid || isSubmitting}
              onClick={handleSubmitAnswer}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>PRIMA AI Sedang Menilai & Mengoreksi... 🤖</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-sky-200" />
                  <span>Kirim & Minta Koreksi AI 🤖</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </>
              )}
            </button>
          </div>

          {/* Banner Syarat Lanjut ke Eksplorasi jika sudah ganti 3x */}
          {changeCount >= 3 ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2.5 text-xs font-black text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Target Tercapai! Kamu sudah mengganti dan mengeksplorasi 3 variasi pertanyaan ({changeCount}/3). Tombol lanjut ke Eksplorasi aktif!</span>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Lanjut ke Eksplorasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold flex items-center gap-2">
                <span>🔒</span>
                <span>Tombol lanjut ke Eksplorasi Materi akan aktif setelah kamu mengganti pertanyaan sebanyak 3x.</span>
              </span>
              <span className="font-black text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300 self-start sm:self-auto">
                Progres: {changeCount}/3x
              </span>
            </div>
          )}
        </div>
      ) : (
        /* 4. AI Evaluation & Feedback Display (Clean, no TTS navigation) */
        <div ref={evaluationRef} className="space-y-6 pt-2 animate-fadeIn">
          {/* Answer Preview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Jawaban yang Kamu Tulis:</span>
              <button
                type="button"
                onClick={handleResetForRevision}
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Ubah Jawaban</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 italic bg-white p-3 rounded-xl border border-slate-200/80">
              "{studentAnswer}"
            </p>
          </div>

          {/* AI Score & Status Header */}
          <div
            className={`p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              evaluation.score >= 80
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950'
                : evaluation.score >= 60
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-950'
                : 'bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-300 text-indigo-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-black text-xl shadow-md ${
                  evaluation.score >= 80
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                    : evaluation.score >= 60
                    ? 'bg-amber-500 text-white shadow-amber-500/30'
                    : 'bg-indigo-600 text-white shadow-indigo-500/30'
                }`}
              >
                {evaluation.score}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span className="font-heading font-black text-base sm:text-lg">
                    {evaluation.statusLabel}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Skor Penalaran Pemantik: <strong className="text-slate-900">{evaluation.score} / 100</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white/90 border border-slate-200/80 rounded-xl shadow-xs text-xs font-black text-amber-600">
                <Award className="w-4 h-4 text-amber-500" />
                <span>+15 XP Terkumpul 🎉</span>
              </div>
            </div>
          </div>

          {/* Section A: AI Feedback Box */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs sm:text-sm">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Umpan Balik Cerdas dari PRIMA AI:</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-indigo-100">
              {evaluation.feedback}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                  <span>🌟 Yang Sudah Bagus:</span>
                </span>
                <p className="text-emerald-900 font-medium leading-relaxed">
                  {evaluation.strengths}
                </p>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1">
                <span className="font-extrabold text-amber-800 flex items-center gap-1">
                  <span>💡 Saran Penyempurnaan:</span>
                </span>
                <p className="text-amber-900 font-medium leading-relaxed">
                  {evaluation.suggestion}
                </p>
              </div>
            </div>
          </div>

          {/* Section B: Correct Answer & Concept Explanation */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Kunci Konsep & Jawaban yang Benar:</span>
            </div>

            {/* Ideal Answer */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-1 shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                🎯 Jawaban Ideal / Kunci Jawaban:
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                {evaluation.idealAnswer || dynamicIdealAnswer || 'Keterkaitan langsung antara komponen pembelajaran.'}
              </p>
            </div>

            {/* Concept Explanation */}
            <div className="bg-emerald-100/50 p-4 rounded-xl border border-emerald-200/80 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                📖 Penjelasan Konsep Lengkap:
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                {evaluation.explanation || dynamicExplanation || 'Setiap konsep memiliki peran berkesinambungan dalam pemahaman materi.'}
              </p>
            </div>
          </div>

          {/* Actions: Re-answer, Change Question, or Advance to Exploration */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetForRevision}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>✍️ Jawab Ulang</span>
              </button>

              <button
                type="button"
                onClick={handleRefreshQuestion}
                disabled={isGeneratingQuestion}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-xs"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-amber-700 group-hover:rotate-180 transition-transform ${isGeneratingQuestion ? 'animate-spin' : ''}`} />
                <span>🔄 Ganti Pertanyaan Baru ({changeCount}/3)</span>
              </button>
            </div>

            <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-1">
              <button
                type="button"
                onClick={changeCount >= 3 ? onNext : undefined}
                disabled={changeCount < 3}
                className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  changeCount >= 3
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-80'
                }`}
              >
                {changeCount >= 3 ? (
                  <>
                    <span>Lanjut ke Eksplorasi Materi 🎉</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>🔒 Lanjut ke Eksplorasi ({changeCount}/3)</span>
                  </>
                )}
              </button>
              {changeCount < 3 && (
                <span className="text-[11px] font-bold text-amber-700 text-center sm:text-right">
                  ⚠️ Ganti pertanyaan {3 - changeCount}x lagi agar tombol aktif!
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
