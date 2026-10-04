import React, { useState } from 'react';
import { Flame, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';

interface HotsChallengeStepProps {
  content: any;
  onNext: () => void;
}

export const HotsChallengeStep: React.FC<HotsChallengeStepProps> = ({ content, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = selectedOption === content.correctAnswer;

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 shadow-lg">
      
      <div className="flex items-center gap-3">
        <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Langkah 8: HOTS Challenge</span>
          <h3 className="font-heading text-xl font-bold text-slate-900">Bernalar Kritis Analisis Kasus Nyata 🧠</h3>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
        <p className="font-heading font-bold text-xs uppercase tracking-wider text-rose-800">Skenario Kasus Studi Nyata:</p>
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
          {content.scenario || 'Sebuah kasus di mana keseimbangan terganggu karena intervensi manusia.'}
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
                if (!isSubmitted) setSelectedOption(idx);
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

      {/* Action / Result */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        {!isSubmitted ? (
          <button
            disabled={selectedOption === null}
            onClick={() => setIsSubmitted(true)}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Kirim Analisis HOTS
          </button>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>{isCorrect ? 'Analisis Kritis yang Luar Biasa! 🌟' : 'Mari cermati dampak rantai makanan.'}</span>
              </div>
              <p className="text-xs font-medium leading-relaxed">
                {content.explanation}
              </p>
            </div>

            <button
              onClick={onNext}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Asesmen Utama</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
