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
  videosList?: InteractiveVideo[];
  topicTitle?: string;
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

export const VideoPlayerStep: React.FC<VideoPlayerStepProps> = ({
  content,
  subjectId,
  subjectName,
  videosList,
  topicTitle,
  onNext,
}) => {
  // Check stored videos from props or database
  const allVideos = (videosList && videosList.length > 0) ? videosList : getStoredVideos();
  
  // Find videos configured for this subject (case-insensitive and partial match support)
  const subjectVideos = subjectId
    ? allVideos.filter((v) => {
        const vSub = (v.subjectId || '').toLowerCase().trim();
        const curSub = subjectId.toLowerCase().trim();
        return vSub === curSub || curSub.includes(vSub) || vSub.includes(curSub);
      })
    : allVideos;

  // Fallback to all videos if no subject match
  const candidateVideos = subjectVideos.length > 0 ? subjectVideos : allVideos;

  const [selectedVideoId, setSelectedVideoId] = useState<string>('');

  useEffect(() => {
    if (candidateVideos.length > 0) {
      const matchTopic = topicTitle 
        ? candidateVideos.find(v => 
            v.title.toLowerCase().includes(topicTitle.toLowerCase()) || 
            topicTitle.toLowerCase().includes(v.title.toLowerCase())
          )
        : null;

      setSelectedVideoId((prev) => {
        if (prev && candidateVideos.some(v => v.id === prev)) return prev;
        return matchTopic ? matchTopic.id : candidateVideos[0].id;
      });
    }
  }, [candidateVideos, topicTitle, subjectId]);

  const activeVideo = candidateVideos.find(v => v.id === selectedVideoId) || candidateVideos[0] || null;

  // PRIORITY: Always prioritize video and checkpoints saved in the database by the teacher!
  const rawVideoUrl = (activeVideo && activeVideo.videoUrl && activeVideo.videoUrl.trim() !== '')
    ? activeVideo.videoUrl
    : (content?.videoUrl && content.videoUrl.trim() !== '')
    ? content.videoUrl
    : (allVideos[0]?.videoUrl || '');

  const videoTitle = activeVideo?.title || content?.title || 'Video Interaktif Pembelajaran';

  const hasVideo = !!(rawVideoUrl && rawVideoUrl.trim() !== '');
  const { embedUrl, type: videoType } = parseEmbedUrl(rawVideoUrl);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);

  // Initial Checkpoints resolution: Prefer database checkpoints first
  const initialCheckpoints: VideoCheckpoint[] =
    (activeVideo && activeVideo.checkpoints && activeVideo.checkpoints.length > 0)
      ? activeVideo.checkpoints
      : content?.checkpoints || [];

  const [localCheckpoints, setLocalCheckpoints] = useState<VideoCheckpoint[]>(initialCheckpoints);

  // Active playing checkpoint state
  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoCheckpoint | null>(null);
  const [answeredCheckpoints, setAnsweredCheckpoints] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Sync checkpoints if active video changes
  useEffect(() => {
    if (activeVideo && activeVideo.checkpoints && activeVideo.checkpoints.length > 0) {
      setLocalCheckpoints(activeVideo.checkpoints);
    } else if (content?.checkpoints && content.checkpoints.length > 0) {
      setLocalCheckpoints(content.checkpoints);
    } else {
      setLocalCheckpoints([]);
    }
    setAnsweredCheckpoints({});
    setActiveCheckpoint(null);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [activeVideo?.id, content]);

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
          <button
            onClick={onNext}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:scale-102"
          >
            <span>Lanjut → PRIMA AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Candidate Videos Switcher (from Teacher) */}
      {candidateVideos.length > 1 && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Daftar Video Interaktif dari Guru ({candidateVideos.length} Video):</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Pilih video untuk ditonton</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {candidateVideos.map((v) => {
              const isSelected = (activeVideo?.id === v.id);
              const cpCount = v.checkpoints?.length || v.checkpointsCount || 0;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVideoId(v.id);
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                  }`}
                >
                  <Play className={`w-3 h-3 ${isSelected ? 'fill-white' : 'fill-indigo-600 text-indigo-600'}`} />
                  <span className="max-w-[200px] truncate">{v.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cpCount} Soal
                  </span>
                </button>
              );
            })}
          </div>
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
