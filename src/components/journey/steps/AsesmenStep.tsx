import React, { useState } from 'react';
import { Award, CheckCircle2, ArrowRight, RotateCcw, HelpCircle, AlertCircle, Sparkles, BookOpen, Check, X, Sliders, Settings, RefreshCw, Cpu, CheckSquare } from 'lucide-react';
import { AssessmentQuestion } from '../../../types/learning';
import { generateAssessmentQuestions } from '../../../services/aiService';
import toast from 'react-hot-toast';

interface AsesmenStepProps {
  content: any;
  onComplete: (score: number) => void;
}

export const AsesmenStep: React.FC<AsesmenStepProps> = ({ content, onComplete }) => {
  const initialQuestions: AssessmentQuestion[] = content.questions || [];
  const [questionsList, setQuestionsList] = useState<AssessmentQuestion[]>(initialQuestions);

  // Teacher AI Assessment Generation Config States
  const [showTeacherConfig, setShowTeacherConfig] = useState<boolean>(false);
  const [numMudah, setNumMudah] = useState<number>(1); // LOTS
  const [numSedang, setNumSedang] = useState<number>(2); // MOTS
  const [numSulit, setNumSulit] = useState<number>(2); // HOTS
  const [stimulusStyle, setStimulusStyle] = useState<'REAL_WORLD' | 'SCIENTIFIC' | 'STORY'>('REAL_WORLD');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiGenError, setAiGenError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recentlyAnsweredId, setRecentlyAnsweredId] = useState<string | null>(null);

  // Trigger feedback flash and ripple on answer
  const triggerAnswerFeedback = (qId: string) => {
    setRecentlyAnsweredId(qId);
    setTimeout(() => {
      setRecentlyAnsweredId((current) => (current === qId ? null : current));
    }, 700);
  };

  // AI Generator Handler for Assessment
  const handleGenerateQuestionsAi = async () => {
    const totalCount = numMudah + numSedang + numSulit;
    if (totalCount === 0) {
      toast.error('Pilih minimal 1 butir soal pada salah satu kategori (Mudah, Sedang, atau Sulit)!');
      return;
    }

    setIsAiGenerating(true);
    setAiGenError(null);
    const toastId = toast.loading(`🤖 Merumuskan ${totalCount} butir soal asesmen AI (${numMudah} Mudah, ${numSedang} Sedang, ${numSulit} Sulit)...`);

    try {
      const topicTitle = content.topicTitle || content.title || 'Harmoni dalam Ekosistem';
      const subjectId = content.subjectId || 'ipas';

      // Distribute PG, PGK, and BS based on difficulty categories
      const numPG = Math.max(1, Math.round(totalCount * 0.5));
      const numPGK = Math.max(0, Math.round(totalCount * 0.3));
      const numBS = Math.max(0, totalCount - numPG - numPGK);

      const generated = await generateAssessmentQuestions({
        subjectId,
        topicTitle,
        grade: content.grade || 5,
        numPG,
        numPGK,
        numBS,
        numMudah,
        numSedang,
        numSulit,
        stimulusStyle,
      });

      if (generated && generated.length > 0) {
        // Tag difficulty levels according to user distribution
        const formatted: AssessmentQuestion[] = generated.map((q: any, idx: number) => {
          let assignedLevel: 'LOTS' | 'MOTS' | 'HOTS' = q.level || 'MOTS';
          if (idx < numMudah) {
            assignedLevel = 'LOTS';
          } else if (idx < numMudah + numSedang) {
            assignedLevel = 'MOTS';
          } else {
            assignedLevel = 'HOTS';
          }

          return {
            ...q,
            level: assignedLevel,
          };
        });

        setQuestionsList(formatted);
        setAnswers({});
        setIsSubmitted(false);
        toast.dismiss(toastId);
        toast.success(`✨ Berhasil menghasilkan ${formatted.length} butir soal Asesmen AI baru!`);
      } else {
        throw new Error('Gagal merumuskan butir soal.');
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      console.error('AI question generation error in AsesmenStep:', err);
      // Fallback guarantees questions are never empty
      toast.error('Gagal memuat soal AI, silakan coba lagi.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleResetToDefault = () => {
    setQuestionsList(initialQuestions);
    setAnswers({});
    setIsSubmitted(false);
    toast('Soal asesmen dikembalikan ke susunan awal.');
  };

  // PG Answer Handler
  const handleSelectPG = (qId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    triggerAnswerFeedback(qId);
  };

  // PGK Answer Handler (Checkbox Toggle)
  const handleTogglePGK = (qId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => {
      const currentSelected: number[] = Array.isArray(prev[qId]) ? prev[qId] : [];
      if (currentSelected.includes(optionIdx)) {
        return { ...prev, [qId]: currentSelected.filter((idx) => idx !== optionIdx) };
      } else {
        return { ...prev, [qId]: [...currentSelected, optionIdx].sort() };
      }
    });
    triggerAnswerFeedback(qId);
  };

  // BS Table Answer Handler (Radio Per Statement)
  const handleSelectBS = (qId: string, statementId: string, isTrueChoice: boolean) => {
    if (isSubmitted) return;
    setAnswers((prev) => {
      const currentMap: Record<string, boolean> = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...currentMap,
          [statementId]: isTrueChoice,
        },
      };
    });
    triggerAnswerFeedback(qId);
  };

  const calculateScore = () => {
    if (questionsList.length === 0) return 0;
    let correctCount = 0;

    questionsList.forEach((q) => {
      const userAns = answers[q.id];

      if (q.type === 'PG' || (q.type as string) === 'mc' || (!q.type && q.options)) {
        if (userAns === q.correctAnswer) {
          correctCount++;
        }
      } else if (q.type === 'PGK') {
        const userArr: number[] = Array.isArray(userAns) ? userAns : [];
        const correctArr: number[] = q.correctAnswers || [];
        if (
          userArr.length === correctArr.length &&
          userArr.every((val) => correctArr.includes(val))
        ) {
          correctCount++;
        }
      } else if (q.type === 'BS') {
        const userMap: Record<string, boolean> = userAns || {};
        const allCorrect = q.statements?.every((st) => userMap[st.id] === st.isTrue);
        if (allCorrect && q.statements && q.statements.length > 0) {
          correctCount++;
        }
      }
    });

    return Math.round((correctCount / questionsList.length) * 100);
  };

  const score = calculateScore();

  const getAdaptiveResult = () => {
    if (score >= 80) {
      return {
        category: 'master',
        title: 'Luar Biasa! Skor Kategori Unggul (>= 80%) ✨',
        badgeTitle: 'PRIMA Master Candidate',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        message: 'Kamu menguasai konsep ini dengan sangat matang! Tantangan HOTS dan Medali Master menantimu.',
      };
    } else if (score >= 60) {
      return {
        category: 'reinforcement',
        title: 'Bagus! Skor Kategori Penguatan (60% - 79%) 👍',
        badgeTitle: 'Perlu Sedikit Penguatan',
        color: 'bg-sky-50 border-sky-200 text-sky-900',
        message: 'Pemahamanmu sudah baik. Mari periksa pembahasan di bawah untuk memantapkan konsep.',
      };
    } else {
      return {
        category: 'remedial',
        title: 'Semangat! Kategori Remedial Interaktif (< 60%) 💪',
        badgeTitle: 'Panduan Scaffolded Aktif',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        message: 'Jangan berkecil hati! Gunakan petunjuk scaffolding dan ulas kembali materi bersama AI.',
      };
    }
  };

  const adaptiveInfo = getAdaptiveResult();

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 shadow-lg font-sans">
      
      {/* Header with Teacher Configuration Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shadow-xs">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Langkah 9: Asesmen Kompetensi SD</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                {questionsList.length} Butir Soal Aktif
              </span>
            </div>
            <h3 className="font-heading text-xl font-black text-slate-900">Uji Pemahaman Adaptif Berbasis Stimulus 🧠</h3>
          </div>
        </div>

        {/* Teacher Config Toggle Button */}
        <button
          type="button"
          onClick={() => setShowTeacherConfig(!showTeacherConfig)}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all ${
            showTeacherConfig
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Buka panel konfigurasi jumlah soal per kategori"
        >
          <Sliders className="w-4 h-4" />
          <span>{showTeacherConfig ? 'Tutup Pengaturan Guru ▲' : '⚙️ Atur Jumlah Soal Kategori AI ▼'}</span>
        </button>
      </div>

      {/* TEACHER CONFIGURATION PANEL */}
      {showTeacherConfig && (
        <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-slate-50 rounded-3xl border-2 border-indigo-200 shadow-sm space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-600 text-white">
                <Cpu className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-heading font-black text-sm text-slate-900">
                  Panel Konfigurasi Guru: Generator Asesmen AI
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  Tentukan jumlah butir soal untuk masing-masing kategori kesulitan sebelum di-generate oleh AI.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white text-indigo-900 rounded-full text-xs font-black border border-indigo-200 shadow-xs">
                Total Target: {numMudah + numSedang + numSulit} Soal
              </span>
            </div>
          </div>

          {/* Categories Grid (Mudah, Sedang, Sulit) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. Kategori MUDAH (LOTS) */}
            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-100 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                    <span>🟢</span>
                    <span>Kategori Mudah</span>
                  </span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    LOTS (C1-C2)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Pemahaman fakta dasar, istilah, dan identifikasi komponen materi.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNumMudah(Math.max(0, numMudah - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-black flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={numMudah}
                    onChange={(e) => setNumMudah(Math.min(10, Math.max(0, Number(e.target.value))))}
                    className="w-10 p-1 border border-slate-300 rounded-lg text-center font-black font-mono text-sm text-emerald-900 bg-emerald-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setNumMudah(Math.min(10, numMudah + 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-black flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] font-bold text-slate-500">Soal</span>
              </div>
            </div>

            {/* 2. Kategori SEDANG (MOTS) */}
            <div className="bg-white p-4 rounded-2xl border-2 border-amber-100 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                    <span>🟡</span>
                    <span>Kategori Sedang</span>
                  </span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    MOTS (C3)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Penerapan konsep pada situasi nyata, perbandingan, dan relasi sebab-akibat.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNumSedang(Math.max(0, numSedang - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 font-black flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={numSedang}
                    onChange={(e) => setNumSedang(Math.min(10, Math.max(0, Number(e.target.value))))}
                    className="w-10 p-1 border border-slate-300 rounded-lg text-center font-black font-mono text-sm text-amber-900 bg-amber-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setNumSedang(Math.min(10, numSedang + 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 font-black flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] font-bold text-slate-500">Soal</span>
              </div>
            </div>

            {/* 3. Kategori SULIT (HOTS) */}
            <div className="bg-white p-4 rounded-2xl border-2 border-purple-100 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-800 flex items-center gap-1.5">
                    <span>🔴</span>
                    <span>Kategori Sulit</span>
                  </span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                    HOTS (C4-C6)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Analisis kritis, prediksi dampak fenomena baru, dan evaluasi solusi ilmiah.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNumSulit(Math.max(0, numSulit - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 font-black flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={numSulit}
                    onChange={(e) => setNumSulit(Math.min(10, Math.max(0, Number(e.target.value))))}
                    className="w-10 p-1 border border-slate-300 rounded-lg text-center font-black font-mono text-sm text-purple-900 bg-purple-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setNumSulit(Math.min(10, numSulit + 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 font-black flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] font-bold text-slate-500">Soal</span>
              </div>
            </div>

          </div>

          {/* Preset Buttons & Stimulus Style */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-600 mr-1">Preset Cepat:</span>
              <button
                type="button"
                onClick={() => { setNumMudah(1); setNumSedang(2); setNumSulit(2); }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-[10px] cursor-pointer"
              >
                Standar AKM (1M, 2S, 2H)
              </button>
              <button
                type="button"
                onClick={() => { setNumMudah(0); setNumSedang(2); setNumSulit(3); }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[10px] cursor-pointer"
              >
                Fokus Tantangan HOTS (0M, 2S, 3H)
              </button>
              <button
                type="button"
                onClick={() => { setNumMudah(3); setNumSedang(2); setNumSulit(0); }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] cursor-pointer"
              >
                Penguatan Dasar (3M, 2S, 0H)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-700 shrink-0">Gaya Stimulus:</label>
              <select
                value={stimulusStyle}
                onChange={(e) => setStimulusStyle(e.target.value as any)}
                className="p-1.5 rounded-xl border border-slate-300 bg-white text-[11px] font-bold text-slate-800"
              >
                <option value="REAL_WORLD">Kontekstual Sehari-hari</option>
                <option value="SCIENTIFIC">Eksperimen & Observasi Sains</option>
                <option value="STORY">Cerita Narasi Petualangan</option>
              </select>
            </div>
          </div>

          {aiGenError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold text-center">
              ⚠️ {aiGenError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-indigo-100">
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isAiGenerating}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer disabled:opacity-50"
            >
              ↩️ Pulihkan Soal Asli
            </button>
            <button
              type="button"
              onClick={handleGenerateQuestionsAi}
              disabled={isAiGenerating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-102 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${isAiGenerating ? 'animate-spin' : ''}`} />
              <span>{isAiGenerating ? 'Sedang Merumuskan Soal...' : '🪄 Generate Soal AI dengan Konfigurasi Ini'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-8">
        {questionsList.map((q, idx) => {
          const userAns = answers[q.id];
          const isHintActive = showHints[q.id];

          const levelBadgeColor =
            q.level === 'LOTS'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : q.level === 'MOTS'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-purple-100 text-purple-900 border border-purple-300';

          const levelLabel =
            q.level === 'LOTS'
              ? '🟢 Kategori Mudah (LOTS)'
              : q.level === 'MOTS'
              ? '🟡 Kategori Sedang (MOTS)'
              : '🔴 Kategori Sulit (HOTS)';

          return (
            <div key={q.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              
              {/* Question Header & Type Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {q.type === 'PGK' ? 'Pilihan Ganda Kompleks' : q.type === 'BS' ? 'Benar / Salah' : 'Pilihan Ganda'}
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${levelBadgeColor}`}>
                    {levelLabel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                  className="text-amber-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{isHintActive ? 'Tutup Petunjuk' : 'Petunjuk'}</span>
                </button>
              </div>

              {/* Stimulus Section (If present) */}
              {q.stimulus && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs">
                    <BookOpen className="w-4 h-4" />
                    <span>TEKS STIMULUS / WACANA BACAAN:</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed italic text-indigo-900">
                    {q.stimulus}
                  </p>
                </div>
              )}

              {/* Main Question Text */}
              <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900 leading-snug">
                {q.questionText || (q as any).question}
              </h4>

              {/* Hint Box */}
              {isHintActive && q.hint && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span><strong>Petunjuk Scaffolding:</strong> {q.hint}</span>
                </div>
              )}

              {/* RENDER TYPE 1: PG (Pilihan Ganda Single Answer) */}
              {(q.type === 'PG' || (q.type as string) === 'mc' || (!q.type && q.options)) && (
                <div className="space-y-2 pt-1">
                  {q.options?.map((opt: string, oIdx: number) => {
                    const isSelected = userAns === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSelectPG(q.id, oIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left font-medium text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold shadow-sm ring-2 ring-indigo-400/30'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* RENDER TYPE 2: PGK (Pilihan Ganda Kompleks - Checkboxes > 1 Correct) */}
              {q.type === 'PGK' && (
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>💡 Pilihan Ganda Kompleks: Kamu dapat memilih lebih dari satu jawaban yang benar!</span>
                  </div>

                  {q.options?.map((opt: string, oIdx: number) => {
                    const selectedList: number[] = Array.isArray(userAns) ? userAns : [];
                    const isChecked = selectedList.includes(oIdx);

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleTogglePGK(q.id, oIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left font-medium text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold shadow-sm ring-2 ring-sky-400/30'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* RENDER TYPE 3: BS (Benar / Salah Tabel dengan 3 Pernyataan) */}
              {q.type === 'BS' && q.statements && (
                <div className="space-y-3 pt-1">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5 w-12 text-center">No</th>
                          <th className="p-3.5">Pernyataan</th>
                          <th className="p-3.5 w-24 text-center">Benar</th>
                          <th className="p-3.5 w-24 text-center">Salah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {q.statements.map((st, sIdx) => {
                          const currentMap: Record<string, boolean> = userAns || {};
                          const userChoice = currentMap[st.id];

                          return (
                            <tr key={st.id} className="hover:bg-slate-50">
                              <td className="p-3.5 text-center font-bold text-slate-500">{sIdx + 1}</td>
                              <td className="p-3.5 font-semibold text-slate-800 leading-relaxed">{st.text}</td>
                              
                              {/* Option BENAR */}
                              <td className="p-3.5 text-center">
                                <button
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() => handleSelectBS(q.id, st.id, true)}
                                  className={`w-7 h-7 rounded-full border-2 mx-auto flex items-center justify-center transition-all cursor-pointer ${
                                    userChoice === true
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-110'
                                      : 'bg-white border-slate-300 hover:border-emerald-400'
                                  }`}
                                >
                                  {userChoice === true && <Check className="w-4 h-4" />}
                                </button>
                              </td>

                              {/* Option SALAH */}
                              <td className="p-3.5 text-center">
                                <button
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() => handleSelectBS(q.id, st.id, false)}
                                  className={`w-7 h-7 rounded-full border-2 mx-auto flex items-center justify-center transition-all cursor-pointer ${
                                    userChoice === false
                                      ? 'bg-rose-600 border-rose-600 text-white shadow-md scale-110'
                                      : 'bg-white border-slate-300 hover:border-rose-400'
                                  }`}
                                >
                                  {userChoice === false && <X className="w-4 h-4" />}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Explanation Box after Submit */}
              {isSubmitted && q.explanation && (
                <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 space-y-1 text-xs">
                  <strong className="text-indigo-800 block">💡 Pembahasan Soal:</strong>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Action Submit / Score Results */}
      {!isSubmitted ? (
        <button
          onClick={() => setIsSubmitted(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 text-white font-heading font-black text-base shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>KIRIM & PERIKSA JAWABAN</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      ) : (
        <div className="space-y-6 pt-4 border-t border-slate-200">
          
          <div className={`p-6 rounded-3xl border ${adaptiveInfo.color} space-y-3`}>
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-black text-lg">{adaptiveInfo.title}</h4>
              <span className="text-2xl font-black">{score} / 100</span>
            </div>
            <p className="text-xs leading-relaxed">{adaptiveInfo.message}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setAnswers({});
              }}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>

            <button
              onClick={() => onComplete(score)}
              className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Langkah Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
