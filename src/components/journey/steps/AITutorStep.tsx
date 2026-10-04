import React, { useState } from 'react';
import { Bot, Send, Sparkles, ArrowRight, User } from 'lucide-react';
import { sendAiTutorMessage } from '../../../services/aiService';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

interface AITutorStepProps {
  content: any;
  topicTitle?: string;
  subjectName?: string;
  onNext: () => void;
}

export const AITutorStep: React.FC<AITutorStepProps> = ({
  content,
  topicTitle = 'Harmoni dalam Ekosistem',
  subjectName = 'IPAS',
  onNext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: content?.initialPrompt || `Halo Petualang! Saya PRIMA AI, pendamping belajarmu. Ada hal yang membingungkan atau ingin kamu diskusikan tentang topik ${topicTitle}? Tanya saya ya!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgText = input.trim();
    setInput('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const replyText = await sendAiTutorMessage(userMsgText, topicTitle, subjectName);
      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Mari kita ingat kembali komponen ekosistem. Informasi apa yang pertama kali kamu baca tadi? 💡',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'Saya belum paham tentang rantai makanan.',
    'Kenapa produsen sangat penting?',
    'Apa yang terjadi jika populasi ular punah?',
  ];

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://www.image2url.com/r2/default/images/1791081900879-642df693-a14a-458c-af0d-5ed4e769b4d6.png"
              alt="PRIMA AI Tutor"
              className="w-12 h-12 rounded-2xl object-contain ring-2 ring-indigo-300 shadow-md transition-all duration-300 hover:scale-115 hover:rotate-6 cursor-pointer"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-sky-500" />
              <span>Langkah 5: PRIMA AI Scaffolding Tutor</span>
            </span>
            <h3 className="font-heading text-xl font-bold text-slate-900">Diskusi Pembimbing AI 🤖</h3>
          </div>
        </div>

        <button
          onClick={onNext}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Lanjut ke Simulasi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Panel */}
      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 h-80 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-sky-500 text-white'}`}>
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`space-y-1 ${m.sender === 'user' ? 'text-right' : ''}`}>
              <div
                className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] font-semibold text-slate-400 px-1">{m.time}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-xs">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-500 rounded-tl-none flex items-center gap-2">
              <span>PRIMA AI sedang berpikir...</span>
              <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            </div>
          </div>
        )}
      </div>

      {/* Prompt Suggestions */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500">Contoh Pertanyaan Pemantik:</span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(q);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-indigo-600 transition-colors cursor-pointer"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Tanyakan hal yang membingungkan atau sampaikan pendapatmu..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-800"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span>Kirim</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
