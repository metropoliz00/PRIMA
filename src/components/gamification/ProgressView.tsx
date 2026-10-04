import React from 'react';
import { Trophy, Sparkles, Flame, CheckCircle2, ArrowLeft, Star, Award, Shield } from 'lucide-react';
import { StudentProgress } from '../../types/learning';

interface ProgressViewProps {
  progress: StudentProgress;
  onBack: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ progress, onBack }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Pencapaian Petualang</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
            Progress Saya & Collection Badge
          </h2>
        </div>
      </div>

      {/* Stats Summary Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="flex items-center gap-4 bg-white/80 p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl text-2xl">
            <Sparkles className="w-7 h-7 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Pengalaman</p>
            <p className="font-heading font-black text-2xl text-slate-900">{progress.xp} XP</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl text-2xl">
            <Award className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Tingkat Level</p>
            <p className="font-heading font-black text-2xl text-slate-900">Level {progress.level}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl text-2xl">
            <Flame className="w-7 h-7 fill-rose-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Hari Beruntun</p>
            <p className="font-heading font-black text-2xl text-slate-900">{progress.streakDays} Hari</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl text-2xl">
            <Trophy className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Misi Selesai</p>
            <p className="font-heading font-black text-2xl text-slate-900">{progress.completedTopicsCount} Topik</p>
          </div>
        </div>

      </div>

      {/* Badges Collection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-slate-900">
            Koleksi Badge & Lencana Universal PRIMA
          </h3>
          <span className="text-xs font-bold text-indigo-600">
            {progress.badges.filter((b) => b.unlocked).length} dari {progress.badges.length} Terbuka
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {progress.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                badge.unlocked
                  ? 'glass-card border-slate-200 shadow-md'
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                {badge.icon}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold text-base text-slate-900">{badge.title}</h4>
                  {badge.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />}
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {badge.description}
                </p>

                <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60 mt-1">
                  {badge.unlocked ? `Unlocking ${badge.unlockedAt}` : 'Terkunci'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
