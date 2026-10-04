import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-sm py-6 mt-16 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="font-heading font-bold text-slate-800 text-xs sm:text-sm">
            © PRIMA | Ruang Belajar Digital Masa Depan
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Dev.</span>
          <span className="font-extrabold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            Dedy Meyga Saputra, S.Pd. M.Pd
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">Educational Technology Developer</span>
        </div>
      </div>
    </footer>
  );
};
