import React from 'react';
import { Sparkles, GraduationCap, LayoutDashboard, Compass, Trophy, User, LogOut } from 'lucide-react';

interface NavbarProps {
  role: 'student' | 'teacher';
  onSwitchRole: (role: 'student' | 'teacher') => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onRequestLogout: () => void;
  xp?: number;
  streak?: number;
  studentName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  onSwitchRole,
  currentView,
  onNavigate,
  onRequestLogout,
  xp = 0,
  streak = 1,
  studentName = '',
}) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Vibrant Multi-Color Brand Wordmark */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('landing')}>
          <img 
            src="https://www.image2url.com/r2/default/images/1791081900879-642df693-a14a-458c-af0d-5ed4e769b4d6.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-xl object-contain shadow-md transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 group-hover:brightness-110 group-active:scale-95"
          />
          <div>
            <div className="flex items-center gap-2">
              <img 
                src="https://www.image2url.com/r2/default/images/1791081393646-3204ca3c-0870-4596-9fe5-d9bccdc3686c.png" 
                alt="PRIMA" 
                className="h-7 w-auto object-contain transition-all duration-300 ease-out group-hover:scale-105 group-hover:translate-x-1 group-hover:brightness-110 group-active:scale-95"
              />
            </div>
            <p className="text-[10px] font-semibold text-slate-600 hidden lg:block leading-tight mt-0.5">
              <span className="text-emerald-600 font-extrabold">P</span>embelajaran{' '}
              <span className="text-sky-600 font-extrabold">R</span>esponsif{' '}
              <span className="text-amber-500 font-extrabold">I</span>nteraktif berbasis{' '}
              <span className="text-rose-500 font-extrabold">M</span>ultimedia dan{' '}
              <span className="text-indigo-600 font-extrabold">A</span>I
            </p>
          </div>
        </div>

        {/* Zone 2: Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          
          {role === 'teacher' && (
            <button
              onClick={() => onNavigate('teacher-dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${currentView === 'teacher-dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Dashboard Guru</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Realtime Gamification */}
        <div className="flex items-center gap-3">
          {role === 'student' && (
            <>
              {studentName && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-200/80 text-xs font-black text-indigo-950 rounded-full shadow-sm">
                  <User className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" />
                  <span>{studentName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1 rounded-full border border-slate-200/80 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-rose-600">
                  🔥 <span>{streak}d</span>
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-indigo-600">
                  <Sparkles className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                  <span>{xp} XP</span>
                </span>
              </div>
              <button
                onClick={onRequestLogout}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
