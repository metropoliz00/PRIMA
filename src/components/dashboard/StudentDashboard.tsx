import React from 'react';
import { BookOpen, Video, Gamepad2, Bot, Code, Brain, Trophy, BarChart3, Sparkles, Flame, ChevronRight, Play } from 'lucide-react';
import { StudentProgress, Subject } from '../../types/learning';

interface StudentDashboardProps {
  progress: StudentProgress;
  subjects: Subject[];
  onSelectMenu: (menu: string) => void;
  onSelectSubject: (subjectId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  progress,
  subjects,
  onSelectMenu,
  onSelectSubject,
}) => {
  const totalTopics = subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
  const progressPercent = totalTopics > 0 ? Math.min(100, Math.round((progress.completedTopicsCount / totalTopics) * 100)) : 0;

  const menuItems: { id: string; label: string; icon: any; color: string; badge: string }[] = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner with Glassmorphism */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-200/40 via-sky-200/30 to-amber-200/40 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={progress.avatarUrl}
                alt="Avatar Petualang"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-white shadow">
                Lvl {progress.level}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Dashboard Siswa SD
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                Selamat datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">{progress.studentName}</span>! 👋
              </h2>
              <p className="text-sm font-medium text-slate-600">
                Siap melanjutkan petualangan belajar multi-mata pelajaran hari ini?
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            
            {/* XP */}
            <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-indigo-600 font-extrabold text-sm mb-0.5">
                <Sparkles className="w-4 h-4 fill-indigo-500" />
                <span>{progress.xp}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">Total XP</p>
            </div>

            {/* Badges */}
            <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-amber-600 font-extrabold text-sm mb-0.5">
                <span>🏆</span>
                <span>{progress.badges.filter(b => b.unlocked).length}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">Badge</p>
            </div>

            {/* Streak */}
            <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-rose-600 font-extrabold text-sm mb-0.5">
                <Flame className="w-4 h-4 fill-rose-500" />
                <span>{progress.streakDays} Hari</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">Streak</p>
            </div>

          </div>

        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Progress Belajar Misi Keseluruhan</span>
            <span className="text-indigo-600 font-extrabold">{progressPercent}% Selesai ({progress.completedTopicsCount}/{totalTopics} Topik)</span>
          </div>
          <div className="w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-amber-400 transition-all duration-1000 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Menu Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-slate-900">
            Menu Utama Petualangan
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Pilih aktivitas favoritmu
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMenu(item.id)}
                className="group glass-card p-5 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col justify-between border border-slate-200/80 relative overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <span>Mulai Aktivitas</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-indigo-500" />
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Access: Ongoing Subjects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-xl font-bold text-slate-900">
              Lanjutkan Belajar Mata Pelajaran
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Pilih mata pelajaran untuk melihat Misi Belajar
            </p>
          </div>
          <button
            onClick={() => onSelectMenu('subject-selector')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Subject
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {subjects.slice(0, 3).map((sub) => (
            <div
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all border border-slate-200 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-slate-100">{sub.icon}</span>
                  <div>
                    <h4 className="font-heading font-bold text-base text-slate-900">{sub.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">Kelas {sub.grade} SD</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                {sub.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {sub.topics.length} Misi Topik
                </span>
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 fill-indigo-600" />
                  Buka Misi
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
