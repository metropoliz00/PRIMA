import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, ArrowRight, RotateCcw, Sparkles, Trophy, Star, Gamepad2, Heart, Award } from 'lucide-react';

interface InteraksiStepProps {
  content: any;
  onNext: () => void;
}

const getItemEmoji = (itemName: string): string => {
  const lower = itemName.toLowerCase();
  if (lower.includes('padi')) return '🌾';
  if (lower.includes('rumput')) return '🌱';
  if (lower.includes('belalang')) return '🦗';
  if (lower.includes('katak') || lower.includes('kodok')) return '🐸';
  if (lower.includes('jamur') || lower.includes('bakteri')) return '🍄';
  if (lower.includes('elang') || lower.includes('burung')) return '🦅';
  if (lower.includes('ulat')) return '🐛';
  if (lower.includes('ular')) return '🐍';
  if (lower.includes('merah') || lower.includes('ronda 4')) return '🔴';
  if (lower.includes('biru') || lower.includes('ronda 6')) return '🔵';
  if (lower.includes('kunci') || lower.includes('key')) return '🔑';
  if (lower.includes('kalimat') || lower.includes('teks') || lower.includes('bahasa')) return '✍️';
  if (lower.includes('ronda') || lower.includes('pos')) return '🔔';
  if (lower.includes('detik') || lower.includes('menit') || lower.includes('waktu')) return '⏱️';
  if (lower.includes('faktor')) return '🧮';
  if (lower.includes('kelipatan')) return '🔢';
  return '⭐';
};

const getCategoryEmoji = (categoryName: string): string => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('produsen')) return '🌱';
  if (lower.includes('konsumen i') || lower.includes('herbivora')) return '🦗';
  if (lower.includes('konsumen ii') || lower.includes('karnivora')) return '🐸';
  if (lower.includes('konsumen iii') || lower.includes('predator')) return '🦅';
  if (lower.includes('pengurai') || lower.includes('dekomposer')) return '🍄';
  if (lower.includes('kpk') || lower.includes('kelipatan')) return '⏱️';
  if (lower.includes('fpb') || lower.includes('faktor')) return '🧩';
  if (lower.includes('iklan') || lower.includes('media')) return '📢';
  if (lower.includes('visual') || lower.includes('gambar')) return '🎨';
  if (lower.includes('sasaran') || lower.includes('pembaca')) return '🎯';
  return '📦';
};

export const InteraksiStep: React.FC<InteraksiStepProps> = ({ content, onNext }) => {
  const [selectedPairs, setSelectedPairs] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = Array.from(
    new Set(content.pairs?.map((p: any) => p.correctCategory) || ['Produsen', 'Konsumen I', 'Konsumen II', 'Pengurai'])
  ) as string[];

  const handleSelect = (itemId: string, category: string) => {
    if (isSubmitted) return;
    setSelectedPairs((prev) => ({ ...prev, [itemId]: category }));
  };

  const calculateScore = () => {
    let correct = 0;
    content.pairs?.forEach((p: any) => {
      if (selectedPairs[p.id] === p.correctCategory) correct++;
    });
    return correct;
  };

  const total = content.pairs?.length || 4;
  const score = calculateScore();
  const matchedCount = Object.keys(selectedPairs).length;
  const isAllMatched = matchedCount === total;

  return (
    <div className="glass-card p-6 sm:p-8 rounded-[2rem] space-y-8 border-4 border-white shadow-2xl bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50">
      
      {/* Game Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-white pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-3xl shadow-lg shadow-purple-500/20 animate-bounce">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-wider border border-purple-200">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Misi 3: Arena Bermain</span>
            </span>
            <h3 className="font-heading text-2xl font-black text-slate-900 mt-1">Game Pencocokan Peran 🎮</h3>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="bg-white/80 p-3 rounded-2xl border-2 border-white shadow-inner flex items-center gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Slot Terisi</span>
              <span>{matchedCount} / {total}</span>
            </div>
            <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden border">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${(matchedCount / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gamified Instruction Banner */}
      <div className="p-4 rounded-2xl bg-white/70 border-2 border-white shadow-inner text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-3">
        <span className="text-2xl">💡</span>
        <p className="leading-relaxed">
          {content.instruction || 'Pasangkan setiap elemen petualangan di bawah dengan kategori yang tepat! Klik tombol kategori untuk menaruhnya dalam wadah.'}
        </p>
      </div>

      {/* Playful Interactive Matching Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.pairs?.map((item: any) => {
          const userCat = selectedPairs[item.id];
          const isItemCorrect = userCat === item.correctCategory;
          const itemEmoji = getItemEmoji(item.item);

          return (
            <div
              key={item.id}
              className={`p-6 rounded-[2rem] border-4 transition-all duration-300 flex flex-col justify-between gap-5 relative overflow-hidden bg-white shadow-lg group ${
                userCat
                  ? isSubmitted
                    ? isItemCorrect
                      ? 'border-emerald-400 bg-emerald-50/20 shadow-emerald-200/50 scale-[1.01]'
                      : 'border-rose-400 bg-rose-50/20 shadow-rose-200/50'
                    : 'border-purple-400 bg-purple-50/10 shadow-purple-200/30'
                  : 'border-slate-100 hover:border-purple-200'
              }`}
            >
              {/* Correct/Incorrect Glow Backdrop or Badge */}
              {isSubmitted && (
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest shadow-md text-white ${
                  isItemCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                }`}>
                  {isItemCorrect ? '✨ Tepat!' : '❌ Salah'}
                </div>
              )}

              {/* Item Card Head */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {itemEmoji}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-heading font-black text-slate-900 text-base">
                    {item.item}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {userCat ? `Terpasang: ${userCat}` : 'Belum Berpasangan ❓'}
                  </p>
                </div>
              </div>

              {/* Interactive Category Selector (Role Capsule Buttons) */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pilih Wadah Peran:</span>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = userCat === cat;
                    const catEmoji = getCategoryEmoji(cat);
                    
                    return (
                      <button
                        key={cat}
                        disabled={isSubmitted}
                        onClick={() => handleSelect(item.id, cat)}
                        className={`py-3 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 border-2 cursor-pointer ${
                          isSelected
                            ? isSubmitted
                              ? isItemCorrect
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                : 'bg-rose-500 border-rose-500 text-white shadow-md'
                              : 'bg-purple-600 border-purple-600 text-white shadow-md scale-95'
                            : 'bg-slate-50 border-slate-100 text-slate-700 hover:border-purple-300 hover:bg-purple-50/30'
                        } disabled:cursor-not-allowed`}
                      >
                        <span className="text-sm shrink-0">{catEmoji}</span>
                        <span className="truncate">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Correct Feedback on Card */}
              {isSubmitted && !isItemCorrect && (
                <div className="text-[10px] font-bold text-rose-700 bg-rose-100/60 p-2.5 rounded-xl border border-rose-200 leading-normal">
                  💡 Jawaban tepat: <span className="underline">{item.correctCategory}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Game Verdict and Actions */}
      <div className="pt-6 border-t-2 border-white flex flex-col items-center justify-center gap-4">
        {!isSubmitted ? (
          <button
            disabled={!isAllMatched}
            onClick={() => setIsSubmitted(true)}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-heading font-black text-sm shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            <Award className="w-5 h-5" />
            <span>Kunci Jawaban & Cek Hasil Game</span>
          </button>
        ) : (
          <div className="w-full space-y-6 text-center animate-slideUp">
            
            {/* Celebration Card */}
            <div className={`p-6 sm:p-8 rounded-[2.5rem] border-4 shadow-xl max-w-xl mx-auto ${
              score === total 
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950 shadow-emerald-100' 
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-950 shadow-amber-100'
            }`}>
              {score === total ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-4xl shadow-md animate-bounce">
                    🏆
                  </div>
                  <h4 className="font-heading text-xl sm:text-2xl font-black text-emerald-900">
                    Sempurna! Kamu Hebat! 🎉
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-emerald-800 leading-relaxed max-w-md mx-auto">
                    Skor: {score} / {total} Pasang Tepat! Kamu telah berhasil merakit kecocokan rantai makanan secara sempurna tanpa kesalahan sedikitpun!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-4xl shadow-md animate-pulse">
                    ✨
                  </div>
                  <h4 className="font-heading text-xl sm:text-2xl font-black text-amber-900">
                    Bagus Sekali Usahamu!
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-amber-800 leading-relaxed max-w-md mx-auto">
                    Skor: {score} / {total} Tepat. Beberapa elemen masih tertukar letaknya. Jangan menyerah, ayo raih nilai sempurna dengan mencoba lagi!
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              {score < total && (
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedPairs({});
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow hover:shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Main Ulang Game</span>
                </button>
              )}
              <button
                onClick={onNext}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-heading font-black text-xs sm:text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Lanjut ke Video Interaktif</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
