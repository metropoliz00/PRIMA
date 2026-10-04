import React, { useState } from 'react';
import { Award, CheckCircle2, ArrowRight, RotateCcw, HelpCircle, AlertCircle, Sparkles, BookOpen, Check, X } from 'lucide-react';
import { AssessmentQuestion } from '../../../types/learning';

interface AsesmenStepProps {
  content: any;
  onComplete: (score: number) => void;
}

export const AsesmenStep: React.FC<AsesmenStepProps> = ({ content, onComplete }) => {
  const questions: AssessmentQuestion[] = content.questions || [];

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // PG Answer Handler
  const handleSelectPG = (qId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
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
  };

  const calculateScore = () => {
    if (questions.length === 0) return 0;
    let correctCount = 0;

    questions.forEach((q) => {
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

    return Math.round((correctCount / questions.length) * 100);
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
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Langkah 9: Asesmen Kompetensi SD</span>
          <h3 className="font-heading text-xl font-bold text-slate-900">Uji Pemahaman Adaptif Berbasis Stimulus 🧠</h3>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-8">
        {questions.map((q, idx) => {
          const userAns = answers[q.id];
          const isHintActive = showHints[q.id];

          return (
            <div key={q.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              
              {/* Question Header & Type Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {q.type === 'PGK' ? 'PGK' : q.type === 'BS' ? 'BS' : 'PG'}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    q.level === 'HOTS' ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {q.level || 'HOTS'}
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
