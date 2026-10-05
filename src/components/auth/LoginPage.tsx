import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, Sparkles, ArrowRight, ShieldCheck, GraduationCap, Compass, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState('Menyiapkan ruang belajar Anda…');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username atau password tidak sesuai.');
      return;
    }

    setIsSubmitting(true);
    setLoadingText('Menyiapkan ruang belajar Anda…');

    const res = await login(username, password);

    if (res.success && res.role) {
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(res.role!);
      }, 500);
    } else {
      setIsSubmitting(false);
      setErrorMessage(res.error || 'Username atau password tidak sesuai.');
    }
  };

  return (
    <div className="min-h-screen bg-landing-hero flex flex-col justify-between items-center p-4 sm:p-8 relative overflow-hidden text-slate-800 font-sans">
      
      {/* Floating Animated Particles & Shapes */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-amber-300/20 rounded-full blur-2xl pointer-events-none animate-float" />

      {/* Floating Learning Icons Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15 flex justify-around items-center text-indigo-600">
        <Sparkles className="w-16 h-16 animate-float" />
        <GraduationCap className="w-20 h-20 animate-float-delayed" />
        <Compass className="w-16 h-16 animate-float" />
      </div>


      {/* Main Login Card */}
      <div className="w-full max-w-md my-auto relative z-10">
        
        {/* Glow halo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-3xl opacity-30 blur-xl animate-pulse-subtle" />

        <div className="relative bg-white/95 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/90 space-y-6 text-center backdrop-blur-xl">
          
          {/* Close 'X' Button at top right of card */}
          <button
            type="button"
            onClick={onBackToLanding}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-slate-200"
            title="Tutup Halaman Login"
          >
            <X className="w-5 h-5" />
          </button>

          {/* PRIMA Brand Header */}
          <div className="space-y-3 pt-2">
            <img 
              src="https://www.image2url.com/r2/default/images/1791081900879-642df693-a14a-458c-af0d-5ed4e769b4d6.png" 
              alt="Logo" 
              className="w-14 h-14 mx-auto rounded-2xl object-contain shadow-md transition-all duration-500 ease-out hover:scale-110 hover:rotate-6 hover:brightness-105 active:scale-95 cursor-pointer"
            />

            <h1 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
              MASUK
            </h1>
            <div className="flex flex-col items-center justify-center w-full text-center space-y-0.5">
              <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">
                <span className="text-emerald-600 font-black">P</span>embelajaran{' '}
                <span className="text-sky-600 font-black">R</span>esponsif{' '}
                <span className="text-amber-600 font-black">I</span>nteraktif
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">
                berbasis{' '}
                <span className="text-rose-600 font-black">M</span>ultimedia dan{' '}
                <span className="text-indigo-600 font-black">A</span>I
              </p>
            </div>
            <p className="text-xs text-slate-500 italic font-medium">
              “Belajar lebih interaktif. Berpikir lebih kritis. Berkarya bersama AI.”
            </p>
          </div>

          {/* Generic Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
              <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Lupa password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda..."
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:from-indigo-700 hover:via-sky-700 hover:to-emerald-700 text-white font-heading font-black text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Proses Masuk...</span>
                </div>
              ) : (
                <>
                  <span>MASUK</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <p className="text-[11px] text-slate-500 font-medium pt-2">
            Belum memiliki akun?{' '}
            <a
              href="https://wa.me/6285604431706?text=Halo%20Admin%20PRIMA%2C%20saya%20butuh%20bantuan%20terkait%20akun%20pembelajaran."
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              Hubungi Admin
            </a>
          </p>

        </div>
      </div>

      {/* Brief Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Spinning gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 via-emerald-400 to-amber-400 p-0.5 shadow-2xl animate-spin" />
            {/* Fixed central logo */}
            <div className="absolute inset-1.5 bg-white rounded-[12px] flex items-center justify-center shadow-inner">
              <img 
                src="https://www.image2url.com/r2/default/images/1791081900879-642df693-a14a-458c-af0d-5ed4e769b4d6.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain animate-pulse"
              />
            </div>
          </div>
          <p className="font-heading font-extrabold text-lg text-white">
            {loadingText}
          </p>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center border border-slate-200 shadow-2xl animate-fadeIn">
            <HelpCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-heading font-bold text-lg text-slate-900">Lupa Password Akun</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Untuk menjaga keamanan akun, reset password akun dilakukan langsung oleh Administrator atau Guru Pengampu sekolah Anda.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://wa.me/6285604431706?text=Halo%20Admin%20PRIMA%2C%20saya%20lupa%20password%20akun%20pembelajaran%20saya."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>💬 Hubungi Admin via WhatsApp</span>
              </a>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-[11px] text-slate-600 font-medium z-10 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center pt-4">
        <span>© PRIMA | Ruang Belajar Digital Masa Depan</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Dev.</span>
          <span className="font-extrabold bg-gradient-to-r from-indigo-700 via-sky-700 to-emerald-700 bg-clip-text text-transparent">
            Dedy Meyga Saputra, S.Pd. M.Pd
          </span>
        </div>
      </div>

    </div>
  );
};
