import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  ArrowRight, 
  BookOpen, 
  Globe, 
  Bot, 
  Sparkles, 
  User, 
  Send, 
  Info,
  CheckCircle,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { sendAiTutorMessage } from '../../../services/aiService';

interface EksplorasiStepProps {
  content: any;
  topicTitle?: string;
  subjectName?: string;
  onNext: () => void;
}

interface TopicExtra {
  realSituationTitle: string;
  realSituationText: string;
  imagePath: string;
  summaryTitle: string;
  summaryPoints: string[];
  botWelcome: string;
}

const TOPIC_EXTRAS: Record<string, TopicExtra> = {
  'Harmoni dalam Ekosistem': {
    realSituationTitle: 'Kisah Rantai Makanan Sawah Desa Sukamakmur 🌾',
    realSituationText: 'Di sebuah desa di Jawa Tengah, para petani bingung karena panen padi mereka habis dimakan kawanan belalang kembung. Setelah diselidiki, ternyata populasi ular sawah dan burung pemangsa belalang berkurang drastis karena sering diburu manusia. Hal ini membuktikan bahwa jika satu mata rantai makanan terganggu, seluruh ekosistem sawah akan ikut kacau dan merugikan manusia!',
    imagePath: '/ekosistem_sawah_1791082640304.jpg',
    summaryTitle: 'Prinsip Keseimbangan Alam ⚖️',
    summaryPoints: [
      'Aliran Energi: Energi berpindah dari matahari -> produsen -> konsumen I -> konsumen II -> pengurai.',
      'Saling Ketergantungan: Punahnya satu spesies dapat menyebabkan ledakan populasi spesies lain atau kelaparan massal.',
      'Dekomposisi: Pengurai bertugas menyuburkan kembali tanah agar produsen baru bisa tumbuh sehat.'
    ],
    botWelcome: 'Halo Sahabat Peneliti Cilik! Aku PRIMA AI. Yuk, tanyakan apa saja tentang ketergantungan makhluk hidup, rantai makanan, atau ekosistem yang ingin kamu ketahui! 🤖✨'
  },
  'KPK dan FPB (Kelipatan & Faktor)': {
    realSituationTitle: 'Lampu Kelap-Kelip Taman Kota 💡',
    realSituationText: 'Budi memperhatikan dua lampu hias di gerbang taman bermain. Lampu merah berkedip setiap 4 detik sekali, sedangkan lampu biru berkedip setiap 6 detik sekali. Budi penasaran, pada detik keberapa kedua lampu tersebut akan berkedip bersamaan kembali? Ternyata dengan menggunakan Kelipatan Persekutuan Terkecil (KPK), kita tahu mereka akan menyala bersamaan setiap 12 detik sekali!',
    imagePath: '/kpk_lampu_1791082656052.jpg',
    summaryTitle: 'Poin Kunci Kelipatan & Faktor 🧮',
    summaryPoints: [
      'KPK (Kelipatan Persekutuan Terkecil): Nilai terkecil yang habis dibagi oleh kedua bilangan tersebut. Sangat berguna untuk menghitung jadwal berkala.',
      'FPB (Faktor Persekutuan Terbesar): Faktor pembagi terbesar yang sama dari dua bilangan atau lebih. Berguna untuk membagi barang secara rata.'
    ],
    botWelcome: 'Halo! Aku PRIMA AI pendamping matematikamu. Mau tahu trik cepat menghitung FPB atau KPK tanpa pusing? Silakan tanyakan di sini! 💡✨'
  },
  'Iklan dan Informasi Media': {
    realSituationTitle: 'Baliho Buah Segar Dekat Sekolah Budi 🍏',
    realSituationText: 'Saat pulang sekolah, Budi melihat sebuah baliho besar bergambar buah-buahan segar dengan tulisan mencolok: "Tubuh Sehat, Otak Cerdas dengan Makan Buah Setiap Hari!". Baliho ini menarik perhatian Budi karena gambarnya yang penuh warna dan kalimatnya yang membujuknya untuk langsung membeli buah di pasar!',
    imagePath: '/iklan_sehat_1791082675372.jpg',
    summaryTitle: 'Kekuatan Iklan Media Efektif 📢',
    summaryPoints: [
      'Tujuan Utama: Membujuk, mengedukasi, atau memperkenalkan barang/jasa kepada pembaca.',
      'Bahasa Persuasif: Menggunakan kata-kata ajakan positif seperti "Ayo", "Mari", atau "Dapatkan".',
      'Daya Tarik Visual: Warna kontras dan ilustrasi tajam mendukung penyampaian pesan iklan.'
    ],
    botWelcome: 'Halo Sahabat Kreatif! Aku PRIMA AI. Mau tahu cara menyusun kata-kata iklan yang paling menarik atau unsur-unsur penting iklan media cetak? Tanyakan langsung ya! 🚀📖'
  }
};

const getGenericExtra = (topicTitle: string, subjectName?: string): TopicExtra => {
  return {
    realSituationTitle: `Aplikasi Nyata: ${topicTitle} 🌍`,
    realSituationText: `Dalam kehidupan sehari-hari, konsep mengenai "${topicTitle}" sangatlah penting! Pemahaman materi ini membantu kita bernalar lebih kritis, memecahkan masalah praktis di lingkungan sekitar kita, dan melihat keterkaitan ilmu pengetahuan dengan dunia luar.`,
    imagePath: '/ekosistem_sawah_1791082640304.jpg',
    summaryTitle: 'Prinsip Dasar Konsep 📝',
    summaryPoints: [
      'Logika Teori: Memahami dasar-dasar konseptual, istilah, dan fungsi materi ini.',
      'Penerapan Kritis: Mengidentifikasi masalah nyata di sekitar kita yang dapat diselesaikan dengan teori ini.',
      'Eksplorasi Mandiri: Terus mengeksplorasi pertanyaan "mengapa" dan "bagaimana" suatu konsep bekerja.'
    ],
    botWelcome: `Halo! Aku PRIMA AI, asisten belajarmu untuk mata pelajaran ${subjectName || 'pilihanmu'}. Mari kita bahas lebih mendalam tentang "${topicTitle}". Tanyakan apa saja yang membuatmu penasaran! 💡`
  };
};

interface Message {
  sender: 'student' | 'bot';
  text: string;
}

export const EksplorasiStep: React.FC<EksplorasiStepProps> = ({ 
  content, 
  topicTitle = 'Misi Belajar', 
  subjectName = 'IPAS', 
  onNext 
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeDetailCard, setActiveDetailCard] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const extra: TopicExtra = TOPIC_EXTRAS[topicTitle] || getGenericExtra(topicTitle, subjectName);

  // Initialize chatbot messages
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        { sender: 'bot', text: extra.botWelcome }
      ]);
    }
  }, [extra, chatMessages]);

  // Scroll chat to bottom (only on subsequent updates, so it doesn't force page scroll on mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isAiLoading) return;

    const studentMessage = userInput.trim();
    setUserInput('');
    setChatMessages((prev) => [...prev, { sender: 'student', text: studentMessage }]);
    setIsAiLoading(true);

    try {
      const contextStr = `Siswa sedang membaca Situasi Nyata di Eksplorasi: "${extra.realSituationTitle}" (${extra.realSituationText}), ringkasan materi: ${extra.summaryTitle} (${extra.summaryPoints.join('; ')}), dan detail kartu konsep: ${content.cards?.map((c: any) => c.title).join(', ')}.`;
      const replyText = await sendAiTutorMessage(studentMessage, topicTitle, subjectName, contextStr);
      setChatMessages((prev) => [...prev, { sender: 'bot', text: replyText }]);
    } catch (err) {
      console.error('Error contacting AI Tutor:', err);
      setChatMessages((prev) => [
        ...prev, 
        { sender: 'bot', text: 'Koneksiku terputus sejenak, mari coba tanyakan lagi, atau kita baca kembali ringkasan materi hebat di atas! 💡' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Header Information Bar */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 shadow-md bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl shadow-inner">
            <Eye className="w-6 h-6 text-sky-600 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/50">Langkah 2: Eksplorasi Konsep</span>
            <h3 className="font-heading text-xl font-black text-slate-900 mt-1">Pahami Konsep Kunci & Hubungan Nyata 🌍</h3>
          </div>
        </div>

        <button
          onClick={onNext}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-black text-xs shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Lanjut ke Mini Game</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Real-World Situation & Concept Summary Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Real-World Situation (Teks & Gambar) */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg bg-white flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Globe className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-heading text-lg font-black text-slate-900">
                {extra.realSituationTitle}
              </h4>
            </div>

            {/* Narrative text */}
            <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
              {extra.realSituationText}
            </p>

            {/* Educational Illustration */}
            <div className="relative rounded-2xl overflow-hidden border-4 border-slate-100 shadow-md group">
              <img 
                src={extra.imagePath} 
                alt={extra.realSituationTitle}
                className="w-full h-52 sm:h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-600/95 backdrop-blur-sm text-white font-black text-[10px] rounded-full uppercase tracking-wider shadow">
                Aplikasi Nyata
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Concept Summary */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg bg-white flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-heading text-lg font-black text-slate-900">
                Ringkasan Konsep Utama 📑
              </h4>
            </div>

            {/* Summary Title */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/60">
              <h5 className="font-heading font-black text-xs sm:text-sm text-indigo-950 flex items-center gap-2">
                <Lightbulb className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                {extra.summaryTitle}
              </h5>
            </div>

            {/* Bulleted Points */}
            <div className="space-y-3.5">
              {extra.summaryPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 stroke-[3]" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt banner */}
          <div className="mt-6 p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-center gap-3 text-xs font-bold text-sky-800">
            <Info className="w-5 h-5 text-sky-500 shrink-0 animate-bounce" />
            <span>Klik kartu konsep di bawah untuk mempelajari setiap bagian secara mendalam!</span>
          </div>
        </div>

      </div>

      {/* 3. Detailed Concept Cards Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-indigo-600 rounded-full" />
          <h4 className="font-heading text-lg font-black text-slate-900">Penjelasan Detail Konsep Materi</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.cards?.map((card: any, idx: number) => {
            const isExpanded = activeDetailCard === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveDetailCard(isExpanded ? null : idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none text-left ${
                  isExpanded
                    ? 'bg-gradient-to-tr from-indigo-50 to-pink-50 border-indigo-400 shadow-md scale-[1.01]'
                    : 'bg-white border-slate-200/80 hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-100/80 rounded-2xl shadow-sm">{card.icon}</span>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        {card.tag}
                      </span>
                      <h5 className="font-heading font-black text-slate-900 text-sm sm:text-base mt-1">
                        {card.title}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className={`mt-3.5 border-t border-slate-100/50 pt-3 transition-all duration-300 ${isExpanded ? 'block opacity-100' : 'hidden opacity-0'}`}>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                    {card.description}
                  </p>
                  <p className="text-[10px] text-indigo-600 font-bold mt-2.5 italic">
                    💡 Klik untuk menutup penjelasan detail
                  </p>
                </div>

                {!isExpanded && (
                  <p className="text-[10px] text-slate-400 font-bold mt-3 text-right">
                    Klik untuk baca detail konsep 🔍
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Chatbot AI Section */}
      <div className="glass-card rounded-3xl border border-slate-200/80 shadow-lg bg-white overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-heading font-black text-sm sm:text-base">Teman Belajar PRIMA AI</h4>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full shadow-inner">Online</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-100 font-semibold opacity-95">Tanya apa saja seputar materi ini jika kamu ingin tahu lebih banyak!</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
        </div>

        {/* Chat Bubble Container */}
        <div className="p-5 h-72 overflow-y-auto bg-slate-50 space-y-4 no-scrollbar">
          {chatMessages.map((msg, index) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={index}
                className={`flex items-start gap-2.5 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
              >
                {/* Icon Avatar */}
                <div className={`p-2 rounded-xl shrink-0 shadow-sm ${isBot ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'}`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message bubble */}
                <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold leading-relaxed shadow-sm ${
                  isBot 
                    ? 'bg-white border border-slate-150 text-slate-800 rounded-tl-none' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isAiLoading && (
            <div className="flex items-start gap-2.5 mr-auto max-w-[85%]">
              <div className="p-2 rounded-xl shrink-0 bg-indigo-100 text-indigo-700 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-150 rounded-tl-none flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Form */}
        <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-3">
          <input 
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Tanyakan padaku, contoh: Apa peran katak dalam rantai makanan sawah?"
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isAiLoading}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 fill-white" />
          </button>
        </form>

      </div>

      {/* 5. Next Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-heading font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>Lanjut ke Mini Game Interaksi</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};
