import React, { useState } from 'react';
import { X, Send, CheckCheck, MessageSquare, Phone, Globe, ShieldCheck, Sparkles, Copy, Check } from 'lucide-react';
import { sendAiTutorMessage } from '../../services/aiService';

interface MetaWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetaWhatsAppModal: React.FC<MetaWhatsAppModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'ai', text: 'Halo! Saya PRIMA AI Official WhatsApp Bot. Ada yang ingin didiskusikan seputar materi pembelajaran atau Kurikulum Merdeka? 📱✨', time: '09:00' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'config'>('simulator');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsLoading(true);

    try {
      const reply = await sendAiTutorMessage(userText, 'Integrasi Meta WhatsApp', 'Kurikulum & Pembelajaran Interaktif');
      setMessages(prev => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, sender: 'ai', text: 'PRIMA AI WhatsApp Bot siap membantu! Silakan tanyakan hal seputar pembelajaran ya 💡', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWhatsAppDirect = () => {
    const encoded = encodeURIComponent("Halo PRIMA AI, saya ingin berdiskusi mengenai materi pembelajaran hari ini. 🚀");
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const webhookUrl = "https://prima01.vercel.app/api/meta/webhook";

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <MessageSquare className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg flex items-center gap-2">
                <span>PRIMA AI & Meta WhatsApp Hub</span>
                <span className="text-[10px] bg-emerald-500/80 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Official Integration</span>
              </h3>
              <p className="text-xs text-emerald-100">Gandengkan chatbot PRIMA AI langsung dengan Meta WhatsApp Cloud API</p>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'simulator' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Simulasi Chat WhatsApp</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'config' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Panduan Webhook Meta Cloud API</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50">
          {activeTab === 'simulator' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Hubungkan ke WhatsApp Langsung</h5>
                    <p className="text-[11px] text-slate-600">Buka aplikasi WhatsApp di HP atau komputer dengan pesan otomatis.</p>
                  </div>
                </div>
                <button
                  onClick={handleOpenWhatsAppDirect}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Buka WhatsApp</span>
                </button>
              </div>

              {/* WhatsApp Mockup Window */}
              <div className="bg-[#efeae2] rounded-2xl border border-slate-300 shadow-inner overflow-hidden flex flex-col h-[380px]">
                {/* WA Header */}
                <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src="https://www.image2url.com/r2/default/images/1791081900879-642df693-a14a-458c-af0d-5ed4e769b4d6.png" className="w-9 h-9 rounded-full object-contain bg-white p-0.5 shadow" alt="Bot" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#075e54]"></span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">PRIMA AI Official Bot</h4>
                      <p className="text-[10px] text-emerald-200">Online · Meta Cloud API</p>
                    </div>
                  </div>
                </div>

                {/* WA Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:16px_16px]">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm text-xs relative ${m.sender === 'user' ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'}`}>
                        <p className="leading-relaxed">{m.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[9px] text-slate-400">{m.time}</span>
                          {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-sky-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none text-xs text-slate-500 shadow-sm flex items-center gap-2">
                        <span className="animate-pulse">PRIMA AI sedang mengetik...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* WA Input Bar */}
                <form onSubmit={handleSend} className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-slate-200">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ketik pesan WhatsApp ke PRIMA AI..."
                    className="flex-1 bg-white px-4 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  />
                  <button type="submit" className="p-2.5 bg-[#075e54] hover:bg-[#128c7e] text-white rounded-xl shadow transition-colors cursor-pointer">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Langkah Integrasi Meta WhatsApp Cloud API</span>
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
                  <li>Buat akun developer di <strong className="text-slate-900">Meta for Developers</strong> dan buat aplikasi jenis <strong>Business</strong>.</li>
                  <li>Tambahkan produk <strong>WhatsApp</strong> pada aplikasi Meta Anda untuk mendapatkan token akses sementara/permanen.</li>
                  <li>Masukkan URL Webhook di bawah ini ke panel konfigurasi WhatsApp Webhook Meta Anda:</li>
                </ol>

                <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <code className="text-xs text-emerald-700 font-mono flex-1 overflow-x-auto">{webhookUrl}</code>
                  <button
                    onClick={handleCopyWebhook}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  * Verify Token dapat diatur sesuai keinginan Anda (contoh: <code className="text-slate-700 font-mono">prima_meta_secure_token</code>).
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-slate-700 space-y-2">
                <h5 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Keunggulan Integrasi Meta WhatsApp</span>
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Siswa dan guru dapat berkonsultasi langsung dengan PRIMA AI melalui aplikasi WhatsApp di ponsel mereka kapan saja dan di mana saja tanpa harus membuka browser!
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
