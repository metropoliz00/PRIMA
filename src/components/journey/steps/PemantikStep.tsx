import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';

interface PemantikStepProps {
  content: any;
  topicTitle?: string;
  subjectName?: string;
  onNext: () => void;
}

export const PemantikStep: React.FC<PemantikStepProps> = ({ content, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selectedOption === content.correctAnswer;

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 shadow-lg bg-white">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shadow-sm">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">Langkah 1: Pertanyaan Pemantik</span>
          <h3 className="font-heading text-xl font-bold text-slate-900">Uji Rasa Ingin Tahumu! 💡</h3>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
        <p className="text-base font-semibold text-slate-800 leading-relaxed">
          {content.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {content.options?.map((opt: string, idx: number) => {
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                if (!submitted) setSelectedOption(idx);
              }}
              className={`w-full p-4 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-indigo-200 text-slate-700'
              }`}
            >
              <span>{opt}</span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions & Feedback */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        {!submitted ? (
          <button
            disabled={selectedOption === null}
            onClick={() => setSubmitted(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            Kirim Jawaban Pemantik
          </button>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-950'}`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                <Lightbulb className={`w-5 h-5 ${isCorrect ? 'text-amber-500 animate-bounce' : 'text-rose-500'}`} />
                <span>{isCorrect ? 'Luar biasa! Pemikiran yang tajam! 🌟' : 'Jawabanmu kurang tepat! ❌'}</span>
              </div>
              <p className="text-xs font-medium leading-relaxed mt-1">
                {isCorrect ? content.explanation : 'Mari kita lihat penjelasan yang benar di bawah ini.'}
              </p>
              <div className={`mt-3 pt-3 border-t text-xs ${isCorrect ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-900'}`}>
                <span className="font-extrabold">Penjelasan:</span> <span className="font-medium">{content.explanation}</span>
              </div>
              {!isCorrect && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-rose-900 text-xs">
                  <span className="font-extrabold">Jawaban yang benar:</span> <span className="font-bold underline text-emerald-700">{content.options?.[content.correctAnswer]}</span>
                </div>
              )}
            </div>

            <button
              onClick={onNext}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Eksplorasi Materi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
