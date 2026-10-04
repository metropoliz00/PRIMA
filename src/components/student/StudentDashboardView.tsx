import React, { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Video, Gamepad2, Bot, Code, Brain, Trophy, BarChart3, User, Sparkles, Flame, Play, MessageSquare
} from 'lucide-react';
import { StudentProgress, Subject } from '../../types/learning';
import { User as UserType } from '../../types/auth';

interface StudentDashboardViewProps {
  currentUser: UserType;
  progress: StudentProgress;
  subjects: Subject[];
  onSelectMenu: (menuId: string) => void;
  onSelectSubject: (subjectId: string) => void;
  onRequestLogout: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  currentUser,
  progress,
  subjects,
  onSelectMenu,
  onSelectSubject,
  onRequestLogout,
}) => {
  const [activeTab, setActiveTab] = useState('beranda');

  const totalTopics = subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
  const progressPercent = totalTopics > 0 ? Math.min(100, Math.round((progress.completedTopicsCount / totalTopics) * 100)) : 0;

  const studentMenus = [
    { id: 'beranda', label: '🏠 Beranda', icon: LayoutDashboard },
    { id: 'subject-selector', label: '📚 Belajar', icon: BookOpen },
    { id: 'video-menu', label: '🎬 Video', icon: Video },
    { id: 'simulation-menu', label: '🎮 Aktivitas', icon: Gamepad2 },
    { id: 'ai-tutor-menu', label: '🤖 PRIMA AI', icon: Bot },
    { id: 'coding-menu', label: '💻 Coding', icon: Code },
    { id: 'assessment-menu', label: '🧠 Asesmen', icon: Brain },
    { id: 'badges-menu', label: '🏆 Badge', icon: Trophy },
    { id: 'progress-view', label: '📊 Progress', icon: BarChart3 },
    { id: 'refleksi', label: '🪞 Refleksi', icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={currentUser.avatar || progress.avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md"
            />

            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Ruang Belajar Siswa SD Kelas {currentUser.grade || 5}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Selamat datang, {currentUser.name}! 👋
              </h2>
              <p className="text-sm font-medium text-slate-600">
                Ayo teruskan petualangan belajarmu bersama PRIMA AI & Simulasi!
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-3 w-full md:w-auto">
            {/* Stats Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
              <div className="bg-white/90 p-2.5 sm:p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="flex items-center justify-center gap-1 text-indigo-600 font-extrabold text-xs sm:text-sm mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 fill-indigo-500" />
                  <span>{progress.xp} XP</span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Total XP</p>
              </div>

              <div className="bg-white/90 p-2.5 sm:p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="flex items-center justify-center gap-1 text-amber-600 font-extrabold text-xs sm:text-sm mb-0.5">
                  <span>🏆</span>
                  <span>{progress.badges.filter(b => b.unlocked).length}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Badges</p>
              </div>

              <div className="bg-white/90 p-2.5 sm:p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="flex items-center justify-center gap-1 text-rose-600 font-extrabold text-xs sm:text-sm mb-0.5">
                  <Flame className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{progress.streakDays}d</span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Progress Misi Belajar Kamu</span>
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

      {/* Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {studentMenus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => onSelectMenu(menu.id)}
            className="px-4 py-2.5 rounded-2xl glass-card hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold text-slate-700 shrink-0 border border-slate-200 shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span>{menu.label}</span>
          </button>
        ))}
      </div>

      {/* Ongoing Subjects */}
      <div className="space-y-4">
        <h3 className="font-heading text-xl font-bold text-slate-900">
          Pilih Mata Pelajaran
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {subjects.filter(sub => sub.status !== 'DRAFT').map((sub) => (
            <div
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className="glass-card p-5 rounded-2xl hover:shadow-xl transition-all border border-slate-200 cursor-pointer flex flex-col justify-between space-y-4"
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
                  Mulai Misi
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
