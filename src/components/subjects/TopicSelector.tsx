import React from 'react';
import { ArrowLeft, Clock, Play, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { Subject, Topic } from '../../types/learning';

interface TopicSelectorProps {
  subject: Subject;
  onBack: () => void;
  onSelectTopic: (topic: Topic) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  subject,
  onBack,
  onSelectTopic,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Mata Pelajaran {subject.name}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
            Pilih Misi Belajar
          </h2>
        </div>
      </div>

      {/* Topics List */}
      {subject.topics.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <span className="text-4xl p-3 bg-slate-100 rounded-2xl inline-block">{subject.icon}</span>
          <h3 className="font-heading text-xl font-bold text-slate-800">
            Misi Belajar Belum Tersedia
          </h3>
          <p className="text-xs text-slate-500">
            Guru belum menambahkan topik pembelajaran untuk mata pelajaran ini. Silakan pilih mata pelajaran lain seperti IPAS atau Matematika untuk melihat demo interaktif lengkap.
          </p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Pilih Mata Pelajaran Lain
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subject.topics.map((top) => (
            <div
              key={top.id}
              onClick={() => onSelectTopic(top)}
              className="group glass-card p-6 rounded-3xl hover:shadow-xl transition-all border border-slate-200 cursor-pointer space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Topik Utama</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{top.estimatedMinutes} Menit</span>
                  </span>
                </div>

                <h3 className="font-heading text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {top.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {top.description}
                </p>
              </div>

              {/* Steps Indicator */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>10 Tahap Learning Journey</span>
                  </span>
                  <span className="text-indigo-600 font-extrabold">Siap Dimulai</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-500">
                    Pemantik → Eksplorasi → Video → AI → Simulasi → Coding → HOTS → Asesmen
                  </span>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <Play className="w-4 h-4 fill-indigo-600" />
                    <span>Mulai Misi</span>
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
