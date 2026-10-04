import React, { useState } from 'react';
import { Gamepad2, Sparkles, ArrowLeft, Trophy, CheckCircle2, Play, Award, Filter, RefreshCw, Layers } from 'lucide-react';
import { Subject, InteractiveActivity } from '../../types/learning';
import { getStoredActivities } from '../../data/learningData';
import toast from 'react-hot-toast';

interface StudentActivitiesViewProps {
  subjects: Subject[];
  onBack: () => void;
  onRewardXp: (points: number, title: string) => void;
}

export const StudentActivitiesView: React.FC<StudentActivitiesViewProps> = ({ subjects, onBack, onRewardXp }) => {
  const [activities, setActivities] = useState<InteractiveActivity[]>(getStoredActivities());
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [activePlayingActivity, setActivePlayingActivity] = useState<InteractiveActivity | null>(null);
  const [isPlayingCompleted, setIsPlayingCompleted] = useState<boolean>(false);

  // Simulation state for interactive play
  const [simStep, setSimStep] = useState<number>(0);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});

  const filteredActivities = selectedSubjectFilter === 'all'
    ? activities
    : activities.filter((a) => a.subjectId === selectedSubjectFilter);

  const handleStartPlay = (act: InteractiveActivity) => {
    setActivePlayingActivity(act);
    setIsPlayingCompleted(false);
    setSimStep(0);
    setMatchingAnswers({});
  };

  const handleFinishPlay = () => {
    if (!activePlayingActivity) return;
    setIsPlayingCompleted(true);
    onRewardXp(activePlayingActivity.points, activePlayingActivity.title);
    toast.success(`Selamat! Kamu mendapatkan +${activePlayingActivity.points} XP dari aktivitas "${activePlayingActivity.title}"! 🌟`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pusat Eksplorasi Siswa</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                {activities.length} Aktivitas Aktif Guru
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
              🎮 Aktivitas & Game Simulasi Interaktif
            </h2>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Mata Pelajaran</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.icon || '📚'} {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h4 className="font-heading font-bold text-slate-800 text-base">Belum Ada Aktivitas untuk Mapel Ini</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Guru belum menambahkan aktivitas interaktif untuk mata pelajaran yang dipilih. Silakan pilih "Semua Mata Pelajaran" atau tunggu guru menambahkan aktivitas baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const sub = subjects.find((s) => s.id === act.subjectId);
            const subName = sub ? `${sub.icon || '📚'} ${sub.name}` : act.subjectId.toUpperCase();

            const typeColor =
              act.type === 'MATCHING'
                ? 'bg-purple-100 text-purple-800 border-purple-200'
                : act.type === 'SIMULATION'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : act.type === 'LAB'
                ? 'bg-sky-100 text-sky-800 border-sky-200'
                : 'bg-amber-100 text-amber-800 border-amber-200';

            return (
              <div
                key={act.id}
                className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${typeColor}`}>
                      {act.type}
                    </span>
                    <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                      <span>+{act.points} XP</span>
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{subName}</p>
                    <h3 className="font-heading font-extrabold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {act.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {act.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Level: <strong className="text-slate-800">{act.difficulty}</strong>
                  </span>
                  <button
                    onClick={() => handleStartPlay(act)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Mainkan Simulasi</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Activity Player Modal */}
      {activePlayingActivity && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-xl w-full space-y-6 border border-slate-200 my-8 animate-fadeIn shadow-2xl bg-white">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {activePlayingActivity.type} Mode
                  </span>
                  <h3 className="font-heading font-black text-xl text-slate-900 mt-0.5">
                    {activePlayingActivity.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActivePlayingActivity(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!isPlayingCompleted ? (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                  <p className="font-bold text-slate-900">📌 Petunjuk Aktivitas:</p>
                  <p>{activePlayingActivity.description}</p>
                </div>

                {/* Simulated Interactive Game Board */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-4 shadow-inner text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
                    Simulasi Berjalan Interaktif 🚀
                  </div>

                  <h4 className="font-heading font-extrabold text-lg text-white">
                    {activePlayingActivity.type === 'MATCHING'
                      ? 'Cocokkan Komponen dengan Kategori yang Tepat!'
                      : activePlayingActivity.type === 'LAB'
                      ? 'Laboratorium Maya: Atur Variabel Percobaan'
                      : 'Tantangan Logika & Eksperimen Simulasi'}
                  </h4>

                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    {activePlayingActivity.type === 'MATCHING'
                      ? 'Klik tombol di bawah untuk menyusun pasangan komponen ekosistem dengan benar.'
                      : 'Geser slider atau pilih opsi untuk menjalankan simulasi laboratorium ini.'}
                  </p>

                  <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setSimStep((prev) => prev + 1)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow cursor-pointer transition-transform hover:scale-105"
                    >
                      ▶️ Jalankan Simulasi Step ({simStep + 1})
                    </button>
                    <span className="text-xs font-mono text-amber-300">Status: Berjalan Normal</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActivePlayingActivity(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs cursor-pointer"
                  >
                    Keluar
                  </button>
                  <button
                    onClick={handleFinishPlay}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg cursor-pointer transition-all hover:scale-105"
                  >
                    Selesaikan & Klaim +{activePlayingActivity.points} XP 🏆
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-2xl text-slate-900">
                    Aktivitas Berhasil Diselesaikan! 🎉
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Hebat sekali! Kamu berhasil menyelesaikan simulasi <strong className="text-emerald-600">{activePlayingActivity.title}</strong> dan mendapatkan tambahan XP.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 inline-flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Sparkles className="w-5 h-5 fill-amber-400 text-amber-600" />
                  <span>+{activePlayingActivity.points} XP Ditambahkan ke Akunmu!</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActivePlayingActivity(null)}
                    className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all hover:scale-105"
                  >
                    Kembali ke Daftar Aktivitas
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
