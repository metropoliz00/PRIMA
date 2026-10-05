import React from 'react';
import { ArrowRight, Video, Gamepad2, Code, Bot, Compass } from 'lucide-react';

interface HeroSectionProps {
  onStartLearning: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartLearning,
}) => {
  return (
    <div className="relative min-h-screen bg-landing-hero text-slate-800 flex flex-col justify-between overflow-hidden">
      
      {/* Background Subtle Pastel Gradient Blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-1/4 right-10 w-[30rem] h-[30rem] bg-sky-300/25 rounded-full blur-3xl pointer-events-none animate-float-delayed" />
      <div className="absolute top-10 right-1/3 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none animate-float" />

      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <img 
            src="https://www.image2url.com/r2/default/images/1791081900879-642df693-a14a-458c-af0d-5ed4e769b4d6.png" 
            alt="Logo" 
            className="w-12 h-12 rounded-2xl object-contain shadow-md transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 group-hover:brightness-105 group-active:scale-95"
          />
          <div>
            <div className="flex items-center gap-2">
              <img 
                src="https://www.image2url.com/r2/default/images/1791081393646-3204ca3c-0870-4596-9fe5-d9bccdc3686c.png" 
                alt="PRIMA" 
                className="h-8 w-auto object-contain transition-all duration-300 ease-out group-hover:scale-105 group-hover:translate-x-1 group-active:scale-95"
              />
            </div>
            <p className="text-[11px] font-semibold text-slate-600 leading-snug">
              <span>
                <span className="text-emerald-600 font-extrabold">P</span>embelajaran{' '}
                <span className="text-sky-600 font-extrabold">R</span>esponsif{' '}
                <span className="text-amber-600 font-extrabold">I</span>nteraktif
              </span>
              <br />
              <span>
                berbasis <span className="text-rose-500 font-extrabold">M</span>ultimedia dan{' '}
                <span className="text-indigo-600 font-extrabold">A</span>I
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Hero Center Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 my-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="bg-white/40 p-4 rounded-3xl border border-white/60 shadow-md backdrop-blur-md transition-all hover:scale-105 inline-block">
                  <img 
                    src="https://www.image2url.com/r2/default/images/1791081393646-3204ca3c-0870-4596-9fe5-d9bccdc3686c.png" 
                    alt="PRIMA" 
                    className="h-14 sm:h-16 lg:h-18 w-auto object-contain transition-all duration-500 ease-out hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.25)] active:scale-95 cursor-pointer"
                  />
                </div>
              </div>
              <p className="text-base sm:text-xl font-extrabold text-slate-800 tracking-wide leading-snug">
                <span>
                  <span className="text-emerald-600 font-black">P</span>embelajaran{' '}
                  <span className="text-sky-600 font-black">R</span>esponsif{' '}
                  <span className="text-amber-600 font-black">I</span>nteraktif
                </span>
                <br />
                <span className="text-slate-700">
                  berbasis <span className="text-rose-600 font-black">M</span>ultimedia dan{' '}
                  <span className="text-indigo-600 font-black">A</span>I
                </span>
              </p>
              <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-indigo-700 via-sky-600 to-emerald-600 bg-clip-text text-transparent italic pt-1">
                “Belajar. Bereksplorasi. Bernalar. Berkarya.”
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
              Platform pembelajaran interaktif yang menggabungkan multimedia, simulasi, game, coding, dan Artificial Intelligence untuk menciptakan pengalaman belajar yang aktif, menyenangkan, dan bermakna.
            </p>

            {/* Feature Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/90 border border-slate-200/90 shadow-md hover:shadow-lg transition-all p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md hover:scale-[1.02]">
                <Video className="w-5 h-5 text-sky-600 shrink-0" />
                <span className="text-xs font-black text-slate-800">Video Interaktif</span>
              </div>
              <div className="bg-white/90 border border-slate-200/90 shadow-md hover:shadow-lg transition-all p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md hover:scale-[1.02]">
                <Gamepad2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-black text-slate-800">Simulasi Digital</span>
              </div>
              <div className="bg-white/90 border border-slate-200/90 shadow-md hover:shadow-lg transition-all p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md hover:scale-[1.02]">
                <Code className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs font-black text-slate-800">Coding Logic</span>
              </div>
              <div className="bg-white/90 border border-slate-200/90 shadow-md hover:shadow-lg transition-all p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md hover:scale-[1.02]">
                <Bot className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-xs font-black text-slate-800">PRIMA AI Tutor</span>
              </div>
            </div>

            {/* Prominent CTA */}
            <div className="pt-2">
              <button
                onClick={onStartLearning}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:from-indigo-700 hover:via-sky-700 hover:to-emerald-700 text-white font-heading font-black text-lg shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Compass className="w-6 h-6 text-amber-300" />
                <span>Mulai Belajar Sekarang</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

          </div>

          {/* Right Featured Card Graphic */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-sky-400 via-emerald-400 to-amber-400 rounded-3xl opacity-30 blur-xl animate-pulse-subtle" />

              <div className="relative bg-white/95 p-3 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden backdrop-blur-md">
                <img
                  src="/prima_app_bg_1791034012905.jpg"
                  alt="PRIMA Interactive Space"
                  className="w-full h-auto object-cover rounded-2xl shadow-inner border border-slate-200/60"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Clean Bottom Subtle Branding Bar */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-6 w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 font-medium relative z-10 border-t border-slate-200/90 pt-4 gap-2 text-center sm:text-left">
        <span>© PRIMA | Ruang Belajar Digital Masa Depan</span>
        <span className="font-bold flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
          <span className="text-slate-400">Dev.</span>
          <span className="bg-gradient-to-r from-indigo-700 via-sky-700 to-emerald-700 bg-clip-text text-transparent font-black tracking-wide text-xs">
            Dedy Meyga Saputra, S.Pd. M.Pd
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">Educational Technology Developer</span>
        </span>
      </div>

    </div>
  );
};
