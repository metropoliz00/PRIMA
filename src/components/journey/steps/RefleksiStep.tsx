import React, { useState } from 'react';
import { Heart, Send, Sparkles, Trophy, ArrowRight, Bot } from 'lucide-react';

interface RefleksiStepProps {
  content: any;
  topicTitle?: string;
  subjectName?: string;
  onFinishTopic: () => void;
}

export const RefleksiStep: React.FC<RefleksiStepProps> = ({
  content,
  topicTitle = 'Harmoni dalam Ekosistem',
  subjectName = 'IPAS',
  onFinishTopic,
}) => {
  const [reflectionText, setReflectionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ai/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reflectionText,
          topic: topicTitle,
          subject: subjectName,
        }),
      });
      const data = await res.json();
      setAiFeedback(
        data.feedback ||
          'Refleksi belajarmu luar biasa! Kamu belajar bernalar kritis dan siap melangkah ke Misi berikutnya dengan percaya diri. 🌟'
      );
    } catch (err) {
      setAiFeedback(
        'Refleksi yang sangat bagus! Teruslah bereksplorasi dan bernalar kritis di setiap petualangan PRIMA! 🚀'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 shadow-lg">
      
      <div className="flex items-center gap-3">
        <div className="p-3 bg-pink-100 text-pink-700 rounded-2xl">
          <Heart className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Langkah 10: Refleksi Perjalanan</span>
          <h3 className="font-heading text-xl font-bold text-slate-900">Jurnal Refleksi Petualang 📝</h3>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-600 leading-relaxed">
        Merefleksikan proses belajarmu membantu mengunci pemahaman dan mengasah kemampuan bernalar kritis. Sampaikan pemikiranmu kepada PRIMA AI!
      </p>

      {/* Prompts Guide */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs font-medium text-slate-700">
        <span className="font-bold text-indigo-900 block mb-1">Panduan Refleksi:</span>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>Apa hal paling penting yang kamu pelajari tentang {topicTitle}?</li>
          <li>Bagian aktivitas atau game mana yang paling menantang?</li>
          <li>Bagaimana kamu berhasil menemukan solusinya?</li>
        </ul>
      </div>

      {/* Form */}
      {!aiFeedback ? (
        <form onSubmit={handleSubmitReflection} className="space-y-4">
          <textarea
            required
            rows={4}
            placeholder="Tuliskan catatan refleksi belajarmu di sini..."
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-800"
          />

          <button
            type="submit"
            disabled={!reflectionText.trim() || isSubmitting}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'PRIMA AI Mengulas Refleksi...' : 'Kirim Refleksi ke PRIMA AI'}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* AI Response Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-heading font-extrabold text-sm text-indigo-900">Ulasan & Feedback PRIMA AI</span>
            </div>

            <p className="text-xs font-medium text-slate-800 leading-relaxed italic">
              "{aiFeedback}"
            </p>
          </div>

          {/* Mission Complete Card */}
          <div className="p-6 rounded-3xl bg-amber-400 text-amber-950 text-center space-y-3 shadow-xl">
            <div className="text-4xl">🏆</div>
            <h4 className="font-heading text-2xl font-black">SELAMAT! MISI BELAJAR SELESAI!</h4>
            <p className="text-xs font-bold opacity-90">
              Kamu telah menyelesaikan 10 Langkah Misi Pembelajaran pada {topicTitle}! Medali MASTER & +250 XP telah ditambahkan ke profilmu.
            </p>

            <button
              onClick={onFinishTopic}
              className="mt-2 px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-heading font-bold text-sm hover:bg-slate-800 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Kembali ke Dashboard & Klaim XP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
