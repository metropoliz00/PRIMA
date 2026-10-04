import React, { useRef, useState, useEffect } from 'react';
import {
  Video, Play, Pause, ArrowRight, CheckCircle2, HelpCircle, Database, AlertCircle, Settings, Plus, Trash2, Clock, Check, X, Sparkles, Save
} from 'lucide-react';
import { VideoCheckpoint, InteractiveVideo } from '../../../types/learning';
import { getStoredVideos, saveVideos } from '../../../data/learningData';
import toast from 'react-hot-toast';

interface VideoPlayerStepProps {
  content: any;
  subjectId?: string;
  subjectName?: string;
  onNext: () => void;
}

// YouTube & Google Drive Embed Resolver Helper
export function parseEmbedUrl(rawUrl: string): { embedUrl: string; type: 'youtube' | 'drive' | 'mp4' | 'other' } {
  if (!rawUrl || typeof rawUrl !== 'string') return { embedUrl: '', type: 'other' };

  // YouTube match (supports standard, short links, and shorts)
  const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&autoplay=1`, type: 'youtube' };
  }

  // Google Drive match
  const driveMatch = rawUrl.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+))/i);
  if (driveMatch && (driveMatch[1] || driveMatch[2])) {
    const fileId = driveMatch[1] || driveMatch[2];
    return { embedUrl: `https://drive.google.com/file/d/${fileId}/preview`, type: 'drive' };
  }

  if (rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm')) {
    return { embedUrl: rawUrl, type: 'mp4' };
  }

  return { embedUrl: rawUrl, type: 'other' };
}

export const VideoPlayerStep: React.FC<VideoPlayerStepProps> = ({ content, subjectId, subjectName, onNext }) => {
  // Check stored videos from database
  const storedVideos = getStoredVideos();
  const matchedDbVideo = subjectId
    ? storedVideos.find((v) => v.subjectId?.toLowerCase() === subjectId.toLowerCase()) || storedVideos[0]
    : storedVideos[0];

  const videoUrlFromContent = content?.videoUrl && content.videoUrl.trim() !== '' ? content.videoUrl : '';
  const rawVideoUrl = videoUrlFromContent || (matchedDbVideo ? matchedDbVideo.videoUrl : '');
  const videoTitle = (matchedDbVideo ? matchedDbVideo.title : '') || content?.title || 'Video Interaktif Pembelajaran';

  const hasVideo = !!(rawVideoUrl && rawVideoUrl.trim() !== '');
  const { embedUrl, type: videoType } = parseEmbedUrl(rawVideoUrl);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);

  // Initial Checkpoints resolution
  const initialCheckpoints: VideoCheckpoint[] =
    matchedDbVideo && matchedDbVideo.checkpoints && matchedDbVideo.checkpoints.length > 0
      ? matchedDbVideo.checkpoints
      : content?.checkpoints || [];

  const [localCheckpoints, setLocalCheckpoints] = useState<VideoCheckpoint[]>(initialCheckpoints);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Active playing checkpoint state
  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoCheckpoint | null>(null);
  const [answeredCheckpoints, setAnsweredCheckpoints] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Single Checkpoint Form State for Teacher Configuration Panel
  const [cpForm, setCpForm] = useState({
    timeInSeconds: 15,
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 0,
    explanation: '',
  });

  // Sync checkpoints if matched video changes
  useEffect(() => {
    if (matchedDbVideo && matchedDbVideo.checkpoints) {
      setLocalCheckpoints(matchedDbVideo.checkpoints);
    }
  }, [matchedDbVideo?.id]);

  // Virtual Timer for YouTube / Drive Embed Checkpoints
  useEffect(() => {
    let timer: any;
    if (isPlaying && localCheckpoints.length > 0) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }

          // Check for checkpoints
          localCheckpoints.forEach((cp) => {
            if (
              Math.abs(next - cp.timeInSeconds) < 1 &&
              answeredCheckpoints[cp.id] === undefined &&
              !activeCheckpoint
            ) {
              setIsPlaying(false);
              setActiveCheckpoint(cp);
            }
          });

          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration, localCheckpoints, answeredCheckpoints, activeCheckpoint]);

  const handleAnswerSubmit = () => {
    if (!activeCheckpoint || selectedOption === null) return;
    setShowFeedback(true);
  };

  const handleContinueVideo = () => {
    if (activeCheckpoint && selectedOption !== null) {
      setAnsweredCheckpoints((prev) => ({ ...prev, [activeCheckpoint.id]: selectedOption }));
    }
    setActiveCheckpoint(null);
    setSelectedOption(null);
    setShowFeedback(false);
    setIsPlaying(true);
  };

  // Teacher Add Checkpoint Handler
  const handleAddCheckpoint = () => {
    if (!cpForm.question.trim() || !cpForm.optionA.trim() || !cpForm.optionB.trim()) {
      toast.error('Mohon lengkapi teks pertanyaan kuis dan minimal Pilihan A dan B!');
      return;
    }

    const options = [cpForm.optionA, cpForm.optionB];
    if (cpForm.optionC.trim()) options.push(cpForm.optionC);
    if (cpForm.optionD.trim()) options.push(cpForm.optionD);

    const newCp: VideoCheckpoint = {
      id: `cp-${Date.now()}`,
      timeInSeconds: Number(cpForm.timeInSeconds) || 15,
      question: cpForm.question,
      type: 'mc',
      options: options,
      correctAnswer: Number(cpForm.correctAnswer) || 0,
      explanation: cpForm.explanation || 'Jawaban Anda telah dicatat dengan benar.',
    };

    const updated = [...localCheckpoints, newCp].sort((a, b) => a.timeInSeconds - b.timeInSeconds);
    setLocalCheckpoints(updated);

    // Save to database
    if (matchedDbVideo) {
      const allVideos = getStoredVideos();
      const updatedVideos = allVideos.map((v) =>
        v.id === matchedDbVideo.id ? { ...v, checkpoints: updated, checkpointsCount: updated.length } : v
      );
      saveVideos(updatedVideos);
    }

    setCpForm({
      timeInSeconds: (Number(cpForm.timeInSeconds) || 15) + 30,
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 0,
      explanation: '',
    });

    toast.success(`📍 Checkpoint kuis pada detik ke-${newCp.timeInSeconds} berhasil ditambahkan!`);
  };

  // Teacher Remove Checkpoint Handler
  const handleRemoveCheckpoint = (cpId: string) => {
    const updated = localCheckpoints.filter((c) => c.id !== cpId);
    setLocalCheckpoints(updated);

    if (matchedDbVideo) {
      const allVideos = getStoredVideos();
      const updatedVideos = allVideos.map((v) =>
        v.id === matchedDbVideo.id ? { ...v, checkpoints: updated, checkpointsCount: updated.length } : v
      );
      saveVideos(updatedVideos);
    }

    toast.success('Checkpoint berhasil dihapus.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 shadow-lg font-sans">
      
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shadow-xs">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Langkah 4: Video Interaktif</span>
              {hasVideo ? (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>{videoType === 'youtube' ? 'YouTube Embed' : videoType === 'drive' ? 'Google Drive Embed' : 'MP4 Video'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Belum Diatur di Database</span>
                </span>
              )}
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900 mt-0.5">{videoTitle}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Teacher Checkpoint Config UI */}
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-102"
            title="Kelola Checkpoint & Soal Interaktif"
          >
            <Settings className="w-4 h-4 text-amber-700" />
            <span>{isConfigOpen ? 'Tutup Pengaturan' : '⚙️ Atur Checkpoint Kuis Guru'}</span>
          </button>

          <button
            onClick={onNext}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:scale-102"
          >
            <span>Lanjut → PRIMA AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TEACHER CHECKPOINT CONFIGURATION PANEL */}
      {isConfigOpen && (
        <div className="p-6 rounded-3xl bg-amber-50/90 border border-amber-300 space-y-5 animate-fadeIn shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-200 text-amber-900 rounded-xl font-bold text-sm">📍</span>
              <div>
                <h4 className="font-heading font-black text-slate-900 text-base">
                  Pengaturan Checkpoint & Soal Pilihan Ganda (Otomatis Pausa Video)
                </h4>
                <p className="text-xs text-amber-900">
                  Tentukan detik tertentu saat video diputar di mana pemutar video akan <strong>otomatis PAUSE</strong> untuk menampilkan kuis buatan Anda.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-900 bg-amber-200 px-3 py-1 rounded-full border border-amber-300 shrink-0">
              {localCheckpoints.length} Checkpoint Aktif
            </span>
          </div>

          {/* Form to Add New Checkpoint */}
          <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-3 shadow-xs">
            <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-600" />
              <span>Tambah Checkpoint Kuis Baru pada Video Ini:</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 text-xs">Waktu Pausa (Detik)</label>
                  <button
                    type="button"
                    onClick={() => setCpForm({ ...cpForm, timeInSeconds: Math.max(1, currentTime) })}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded cursor-pointer"
                  >
                    ⏱️ Gunakan Waktu Saat Ini ({currentTime}s)
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  max={3600}
                  value={cpForm.timeInSeconds}
                  onChange={(e) => setCpForm({ ...cpForm, timeInSeconds: Number(e.target.value) })}
                  placeholder="Contoh: 15"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">Kunci Jawaban Benar</label>
                <select
                  value={cpForm.correctAnswer}
                  onChange={(e) => setCpForm({ ...cpForm, correctAnswer: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs bg-white"
                >
                  <option value={0}>A (Pilihan 1)</option>
                  <option value={1}>B (Pilihan 2)</option>
                  <option value={2}>C (Pilihan 3)</option>
                  <option value={3}>D (Pilihan 4)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">Teks Pertanyaan Kuis</label>
              <input
                type="text"
                value={cpForm.question}
                onChange={(e) => setCpForm({ ...cpForm, question: e.target.value })}
                placeholder="Contoh: Apakah fungsi utama tanaman padi dalam rantai makanan sawah?"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-600 text-[11px] block mb-0.5">Pilihan A *</label>
                <input
                  type="text"
                  value={cpForm.optionA}
                  onChange={(e) => setCpForm({ ...cpForm, optionA: e.target.value })}
                  placeholder="Contoh: Produsen (Penghasil Makanan)"
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 text-[11px] block mb-0.5">Pilihan B *</label>
                <input
                  type="text"
                  value={cpForm.optionB}
                  onChange={(e) => setCpForm({ ...cpForm, optionB: e.target.value })}
                  placeholder="Contoh: Konsumen I (Herbivora)"
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 text-[11px] block mb-0.5">Pilihan C (Opsional)</label>
                <input
                  type="text"
                  value={cpForm.optionC}
                  onChange={(e) => setCpForm({ ...cpForm, optionC: e.target.value })}
                  placeholder="Contoh: Konsumen II (Karnivora)"
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 text-[11px] block mb-0.5">Pilihan D (Opsional)</label>
                <input
                  type="text"
                  value={cpForm.optionD}
                  onChange={(e) => setCpForm({ ...cpForm, optionD: e.target.value })}
                  placeholder="Contoh: Dekomposer (Pengurai)"
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-600 text-[11px] block mb-0.5">Penjelasan & Pembahasan Kuis</label>
              <input
                type="text"
                value={cpForm.explanation}
                onChange={(e) => setCpForm({ ...cpForm, explanation: e.target.value })}
                placeholder="Penjelasan ringkas yang muncul setelah siswa menjawab..."
                className="w-full p-2 rounded-xl border border-slate-300 text-xs text-slate-800"
              />
            </div>

            <button
              onClick={handleAddCheckpoint}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs shadow-md cursor-pointer transition-all hover:scale-101 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Checkpoint Ini Ke Video</span>
            </button>
          </div>

          {/* List of Configured Checkpoints */}
          {localCheckpoints.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                📌 Daftar Checkpoint Pausa Terpasang:
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {localCheckpoints.map((cp, idx) => (
                  <div
                    key={cp.id}
                    className="p-3.5 bg-white rounded-2xl border border-amber-200 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-extrabold text-[10px] border border-amber-300">
                          ⏱️ Detik ke-{cp.timeInSeconds} ({formatTime(cp.timeInSeconds)})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Jawaban Benar: Opsi #{cp.correctAnswer + 1}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-xs">
                        {idx + 1}. {cp.question}
                      </p>
                      <p className="text-[10px] text-slate-500 italic">
                        Pilihan: {cp.options.join(' | ')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveCheckpoint(cp.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                      title="Hapus Checkpoint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Video Player or Empty State */}
      {!hasVideo ? (
        <div className="p-10 text-center bg-slate-50/90 rounded-3xl border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-inner">
            <Video className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-black text-slate-800 text-base">
              🎬 Video Interaktif Belum Tersedia di Database
            </h4>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              Guru belum menambahkan link video interaktif (YouTube / Google Drive) untuk mata pelajaran{' '}
              <strong className="text-indigo-600">{subjectName || 'ini'}</strong> pada database Google Spreadsheet.
            </p>
          </div>

          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 max-w-lg mx-auto text-left space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-sky-800">
              <Database className="w-4 h-4 text-sky-600" />
              <span>Informasi Pengelolaan Video Guru:</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Bapak/Ibu Guru dapat menambahkan tautan video melalui menu <strong>Dashboard Guru → 🎬 Kelola Video Interaktif</strong>. Data tautan video akan otomatis tersimpan di Google Spreadsheet (Sheet <code>Videos</code>).
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onNext}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <span>Lanjut ke Langkah 5: AI Tutor PRIMA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800 aspect-video flex flex-col justify-between">
          {/* Render YouTube or Google Drive Iframe OR HTML5 Video */}
          {videoType === 'youtube' || videoType === 'drive' || videoType === 'other' ? (
            <iframe
              src={embedUrl}
              title="Interactive Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={embedUrl}
              className="w-full h-full object-cover"
              controls
            />
          )}

          {/* Custom Interactive Checkpoints Control Overlay if checkpoints available */}
          {localCheckpoints.length > 0 && (
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex flex-col gap-2 z-20">
              {/* Progress Bar with Checkpoint Markers */}
              <div className="relative w-full h-2.5 bg-slate-700/80 rounded-full cursor-pointer overflow-visible">
                <div
                  className="h-full bg-indigo-500 rounded-full relative transition-all"
                  style={{ width: `${(currentTime / Math.max(1, duration)) * 100}%` }}
                />

                {localCheckpoints.map((cp) => {
                  const posPercent = (cp.timeInSeconds / Math.max(1, duration)) * 100;
                  const isDone = answeredCheckpoints[cp.id] !== undefined;

                  return (
                    <div
                      key={cp.id}
                      title={`Checkpoint (${cp.timeInSeconds}s): ${cp.question}`}
                      className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md z-20 cursor-pointer ${
                        isDone ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
                      }`}
                      style={{ left: `${posPercent}%` }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-white text-xs font-semibold pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    <span>{isPlaying ? 'Pause' : 'Mulai Simulasi Player'}</span>
                  </button>
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-amber-400 text-amber-950">
                    📍 {localCheckpoints.length} Checkpoints Terpasang
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Question Overlay Checkpoint Modal */}
          {activeCheckpoint && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md p-6 z-30 flex flex-col justify-center items-center text-white space-y-5 animate-fadeIn">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Interactive Checkpoint Pause</span>
              </div>

              <h4 className="font-heading font-extrabold text-lg sm:text-xl text-center max-w-xl">
                {activeCheckpoint.question}
              </h4>

              {/* Options */}
              <div className="w-full max-w-md space-y-2.5">
                {activeCheckpoint.options.map((opt, idx) => {
                  const isSel = selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      disabled={showFeedback}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                          : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Feedback / Submit button */}
              {!showFeedback ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleAnswerSubmit}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Kirim Jawaban & Lanjutkan Video
                </button>
              ) : (
                <div className="w-full max-w-md bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      {selectedOption === activeCheckpoint.correctAnswer
                        ? 'Jawabanmu Tepat Sekali! 🌟'
                        : 'Hampir Tepat! Mari pelajari bersama.'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    {activeCheckpoint.explanation}
                  </p>
                  <button
                    onClick={handleContinueVideo}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Lanjutkan Video Player</span>
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
