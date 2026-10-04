import React from 'react';
import { LogOut, AlertCircle } from 'lucide-react';

interface LogoutDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutDialog: React.FC<LogoutDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-sm w-full space-y-5 text-center shadow-2xl border border-slate-200">
        
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
          <LogOut className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="font-heading font-black text-xl text-slate-900">
            Konfirmasi Keluar Sesi
          </h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Apakah Anda yakin ingin keluar dari akun Anda?
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            Ya, Keluar
          </button>
        </div>

      </div>
    </div>
  );
};
