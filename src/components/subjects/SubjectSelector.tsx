import React, { useState } from 'react';
import { Plus, ArrowRight, ArrowLeft, Home, Sparkles, BookOpen, X } from 'lucide-react';
import { Subject } from '../../types/learning';

interface SubjectSelectorProps {
  subjects: Subject[];
  onSelectSubject: (subjectId: string) => void;
  onAddSubject: (newSubject: Subject) => void;
  onBackToHome?: () => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  onSelectSubject,
  onAddSubject,
  onBackToHome,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectIcon, setNewSubjectIcon] = useState('📘');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [newSubjectGrade, setNewSubjectGrade] = useState(5);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const created: Subject = {
      id: `custom-subj-${Date.now()}`,
      name: newSubjectName,
      icon: newSubjectIcon || '📚',
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-purple-600',
      description: newSubjectDesc || 'Mata pelajaran kustom yang ditambahkan guru.',
      grade: Number(newSubjectGrade),
      topics: [],
    };

    onAddSubject(created);
    setNewSubjectName('');
    setNewSubjectDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Navigation Row */}
      {onBackToHome && (
        <div>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200/80 shadow-xs transition-all flex items-center gap-2 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 fill-indigo-500" />
            <span>Multi-Mata Pelajaran PRIMA</span>
          </div>
          <h2 className="font-heading text-3xl font-black text-slate-900">
            Pilih Petualangan Belajarmu
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Eksplorasi berbagai mata pelajaran interaktif yang dilengkapi multimedia, simulasi, dan AI Tutor.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Tambah Mata Pelajaran</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subj) => (
          <div
            key={subj.id}
            onClick={() => onSelectSubject(subj.id)}
            className="group glass-card p-6 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-200/80 cursor-pointer flex flex-col justify-between space-y-5 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100/80 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {subj.icon}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {subj.name}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    Kelas {subj.grade} SD · {subj.topics.length} Misi
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {subj.description}
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>{subj.topics.length > 0 ? `${subj.topics.length} Misi Siap` : 'Belum Ada Misi'}</span>
              </span>
              <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Mulai Misi</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}

        {/* Dynamic Add Card Placeholder */}
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 p-6 rounded-3xl transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 bg-indigo-50/30 hover:bg-indigo-50/60 min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-slate-800">
              Tambah Mata Pelajaran Lain
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Guru dapat menambah mata pelajaran baru beserta topik & aktivitasnya secara fleksibel.
            </p>
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-heading text-xl font-bold text-slate-900">
                Tambah Mata Pelajaran Baru
              </h3>
              <p className="text-xs text-slate-500">
                Isi identitas mata pelajaran baru untuk ditambahkan ke platform PRIMA.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs font-medium text-slate-700">
              <div>
                <label className="block mb-1 font-semibold text-slate-800">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Pendidikan Jasmani & Kesehatan"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-slate-800">Ikon Emoji</label>
                  <input
                    type="text"
                    value={newSubjectIcon}
                    onChange={(e) => setNewSubjectIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-800">Kelas Target</label>
                  <select
                    value={newSubjectGrade}
                    onChange={(e) => setNewSubjectGrade(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={4}>Kelas 4 SD</option>
                    <option value={5}>Kelas 5 SD</option>
                    <option value={6}>Kelas 6 SD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-800">Deskripsi Singkat</label>
                <textarea
                  placeholder="Penjelasan singkat mengenai materi mata pelajaran ini..."
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20"
                >
                  Simpan Mata Pelajaran
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
