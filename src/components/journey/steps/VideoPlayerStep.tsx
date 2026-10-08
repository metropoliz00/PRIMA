import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Video, Play, Pause, ArrowRight, CheckCircle2, HelpCircle, Database, AlertCircle,
  Sparkles, Maximize2, Minimize2, RotateCcw, Volume2, VolumeX, Award, Check,
  ChevronRight, ExternalLink, Lock
} from 'lucide-react';
import { VideoCheckpoint, InteractiveVideo } from '../../../types/learning';
import { getStoredVideos, parseCheckpoints } from '../../../data/learningData';
import toast from 'react-hot-toast';

// Global declaration for YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Error Boundary for Video Player
export class VideoErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Terjadi kesalahan saat memuat player video.',
    };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('VideoErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3 text-white">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mx-auto flex items-center justify-center font-bold text-xl">
            ⚠️
          </div>
          <h4 className="font-heading font-extrabold text-white text-base">Gagal Memuat Video Interaktif</h4>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Terjadi kendala teknis saat memproses format video: <span className="font-mono text-amber-300">{this.state.errorMessage}</span>
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer hover:bg-indigo-500 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface VideoPlayerStepProps {
  content: any;
  subjectId?: string;
  subjectName?: string;
  videosList?: InteractiveVideo[];
  topicTitle?: string;
  onNext: () => void;
}

// YouTube & Google Drive Embed Resolver Helper
export function parseEmbedUrl(rawUrl: string): {
  embedUrl: string;
  type: 'youtube' | 'drive' | 'mp4' | 'other';
  videoId?: string;
  fileId?: string;
} {
  if (!rawUrl || typeof rawUrl !== 'string') return { embedUrl: '', type: 'other' };

  // YouTube match (supports standard, short links, embed, shorts, live)
  const ytMatch = rawUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`,
      type: 'youtube',
      videoId,
    };
  }

  // Google Drive match
  const driveMatch = rawUrl.match(
    /drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+)|uc\?id=([a-zA-Z0-9_-]+))/i
  );
  if (driveMatch && (driveMatch[1] || driveMatch[2] || driveMatch[3])) {
    const fileId = driveMatch[1] || driveMatch[2] || driveMatch[3];
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      type: 'drive',
      fileId,
    };
  }

  if (rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm') || rawUrl.includes('.mp4?')) {
    return { embedUrl: rawUrl, type: 'mp4' };
  }

  return { embedUrl: rawUrl, type: 'other' };
}

// Load YouTube IFrame API script once globally
function loadYouTubeIframeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();

    if (window.YT && window.YT.Player) {
      return resolve();
    }

    const existingScript = document.getElementById('youtube-iframe-api-script');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousOnReady === 'function') previousOnReady();
      resolve();
    };

    // Polling fallback in case onYouTubeIframeAPIReady fired earlier
    const checkInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 150);

    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 4000);
  });
}

export const VideoPlayerStep: React.FC<VideoPlayerStepProps> = ({
  content,
  subjectId,
  subjectName,
  videosList,
  topicTitle,
  onNext,
}) => {
  // Load candidate videos from props or storage
  const allVideos = videosList && videosList.length > 0 ? videosList : getStoredVideos();

  // Find videos configured for this subject with strict deduplication
  const candidateVideos = React.useMemo(() => {
    const rawList = Array.isArray(videosList) && videosList.length > 0 ? videosList : getStoredVideos();
    const subjectList = subjectId
      ? rawList.filter((v) => {
          if (!v) return false;
          const vSub = String(v.subjectId || '').toLowerCase().trim();
          const curSub = String(subjectId || '').toLowerCase().trim();
          return vSub === curSub || curSub.includes(vSub) || vSub.includes(curSub);
        })
      : rawList;

    const baseList = subjectList.length > 0 ? subjectList : rawList;
    const seen = new Set<string>();
    const unique: InteractiveVideo[] = [];

    for (const v of baseList) {
      if (!v) continue;
      const vidKey = v.id || v.videoUrl || `vid-idx-${unique.length}`;
      if (seen.has(vidKey)) continue;
      seen.add(vidKey);
      unique.push({ ...v, id: vidKey });
    }

    return unique;
  }, [videosList, subjectId]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');

  useEffect(() => {
    if (candidateVideos.length > 0) {
      const topicStr = String(topicTitle || '').toLowerCase();
      const matchTopic = topicTitle
        ? candidateVideos.find((v) => {
            if (!v || !v.title) return false;
            const vtStr = String(v.title).toLowerCase();
            return vtStr.includes(topicStr) || topicStr.includes(vtStr);
          })
        : null;

      setSelectedVideoId((prev) => {
        if (prev && candidateVideos.some((v) => v && v.id === prev)) return prev;
        return matchTopic ? matchTopic.id : candidateVideos[0].id;
      });
    }
  }, [candidateVideos, topicTitle, subjectId]);

  const activeVideo = candidateVideos.find((v) => v.id === selectedVideoId) || candidateVideos[0] || null;

  // Video URL resolution
  const rawVideoUrl =
    activeVideo && activeVideo.videoUrl && activeVideo.videoUrl.trim() !== ''
      ? activeVideo.videoUrl
      : content?.videoUrl && content.videoUrl.trim() !== ''
      ? content.videoUrl
      : allVideos[0]?.videoUrl || 'https://www.youtube.com/watch?v=LqgYLUaigYU';

  const videoTitle = activeVideo?.title || content?.title || 'Video Interaktif Pembelajaran';
  const hasVideo = !!(rawVideoUrl && rawVideoUrl.trim() !== '');
  const { embedUrl, type: videoType, videoId: ytVideoId } = parseEmbedUrl(rawVideoUrl);

  // Initial Checkpoints resolution with safe parsing
  const initialCheckpoints: VideoCheckpoint[] = React.useMemo(() => {
    if (activeVideo && activeVideo.checkpoints) {
      const parsed = parseCheckpoints(activeVideo.checkpoints);
      if (parsed.length > 0) return parsed;
    }
    if (content?.checkpoints) {
      return parseCheckpoints(content.checkpoints);
    }
    return [];
  }, [activeVideo, content]);

  const [localCheckpoints, setLocalCheckpoints] = useState<VideoCheckpoint[]>(initialCheckpoints);

  // Player state
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerMountRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const videoHtmlRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(120);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTheaterFullscreen, setIsTheaterFullscreen] = useState<boolean>(false);
  const [hasStartedInitialPlay, setHasStartedInitialPlay] = useState<boolean>(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoCheckpoint | null>(null);
  const [answeredCheckpoints, setAnsweredCheckpoints] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Reference flags
  const hasAutoFullscreenTriggered = useRef<boolean>(false);
  const answeredCheckpointsRef = useRef<Record<string, number>>({});
  answeredCheckpointsRef.current = answeredCheckpoints;
  const activeCheckpointRef = useRef<VideoCheckpoint | null>(null);
  activeCheckpointRef.current = activeCheckpoint;
  const maxWatchedTimeRef = useRef<number>(0);
  maxWatchedTimeRef.current = maxWatchedTime;

  // Sync checkpoints on video switch
  useEffect(() => {
    const cps = parseCheckpoints(activeVideo?.checkpoints || content?.checkpoints);
    setLocalCheckpoints(cps);
    setAnsweredCheckpoints({});
    setActiveCheckpoint(null);
    setSelectedOption(null);
    setShowFeedback(false);
    setCurrentTime(0);
    setMaxWatchedTime(0);
    maxWatchedTimeRef.current = 0;
    setIsPlaying(false);
    setHasStartedInitialPlay(false);
    hasAutoFullscreenTriggered.current = false;
  }, [activeVideo?.id, activeVideo?.checkpoints, content]);

  // Request Fullscreen Helper: Enters real OS Fullscreen + in-app Cinema Overlay
  const enterFullscreen = useCallback(() => {
    setIsTheaterFullscreen(true);
    const elem = playerContainerRef.current;
    if (elem) {
      try {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        } else if ((elem as any).webkitRequestFullscreen) {
          (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          (elem as any).msRequestFullscreen();
        }
      } catch (e) {
        // Fallback to in-app cinema overlay
      }
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsTheaterFullscreen(false);
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitFullscreenElement) {
        (document as any).webkitExitFullscreen();
      }
    } catch (e) {
      // Ignored
    }
  }, []);

  // Listen to browser fullscreen changes & escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement
      );
      if (!isFs && isTheaterFullscreen) {
        // User exited via ESC key
        setIsTheaterFullscreen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTheaterFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTheaterFullscreen, exitFullscreen]);

  // Check and trigger checkpoints logic
  const checkCheckpoints = useCallback(
    (curTime: number, pauseFn: () => void) => {
      if (activeCheckpointRef.current) return;

      for (const cp of localCheckpoints) {
        const isAnswered = answeredCheckpointsRef.current[cp.id] !== undefined;
        // Trigger checkpoint if current time matches or is slightly past the checkpoint second
        if (!isAnswered && curTime >= cp.timeInSeconds && curTime < cp.timeInSeconds + 1.8) {
          pauseFn();
          setIsPlaying(false);
          setActiveCheckpoint(cp);
          setSelectedOption(null);
          setShowFeedback(false);
          toast(
            (t) => (
              <span className="flex items-center gap-2 font-bold text-xs">
                <span>🎯</span>
                <span>Video dijeda otomatis! Jawab pertanyaan kuis untuk melanjutkan.</span>
              </span>
            ),
            { icon: '⏸️', duration: 3500 }
          );
          break;
        }
      }
    },
    [localCheckpoints]
  );

  // Initialize YouTube Player if videoType === 'youtube'
  useEffect(() => {
    if (videoType !== 'youtube' || !ytVideoId) return;

    let isMounted = true;
    let timeInterval: any = null;

    loadYouTubeIframeApi().then(() => {
      if (!isMounted || !ytPlayerMountRef.current || !window.YT || !window.YT.Player) return;

      // Clean up previous instance
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        ytPlayerRef.current = null;
      }

      // Generate a unique ID for the iframe container
      const mountId = `yt-player-${Math.random().toString(36).substring(2, 9)}`;
      ytPlayerMountRef.current.id = mountId;

      try {
        const originUrl = typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http')
          ? window.location.origin
          : undefined;

        const playerVarsConfig: any = {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          fs: 1,
          iv_load_policy: 3,
        };
        if (originUrl) {
          playerVarsConfig.origin = originUrl;
        }

        ytPlayerRef.current = new window.YT.Player(mountId, {
          videoId: ytVideoId,
          playerVars: playerVarsConfig,
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              const dur = event.target.getDuration();
              if (dur && dur > 0) setDuration(Math.floor(dur));
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              const state = event.data;

              // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0
              if (state === 1) {
                setIsPlaying(true);
                setHasStartedInitialPlay(true);

                // Auto Fullscreen on initial play
                if (!hasAutoFullscreenTriggered.current) {
                  hasAutoFullscreenTriggered.current = true;
                  enterFullscreen();
                  toast.success('🎬 Layar Penuh Diaktifkan untuk Pengalaman Belajar Maksimal!');
                }

                // Poll real playback time
                clearInterval(timeInterval);
                timeInterval = setInterval(() => {
                  if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
                    const cur = ytPlayerRef.current.getCurrentTime();
                    setCurrentTime(cur);

                    if (cur > maxWatchedTimeRef.current) {
                      setMaxWatchedTime(cur);
                      maxWatchedTimeRef.current = cur;
                    }

                    checkCheckpoints(cur, () => {
                      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
                        ytPlayerRef.current.pauseVideo();
                      }
                    });
                  }
                }, 250);
              } else if (state === 2) {
                setIsPlaying(false);
                clearInterval(timeInterval);
              } else if (state === 0) {
                setIsPlaying(false);
                setIsCompleted(true);
                clearInterval(timeInterval);
                toast.success('🎉 Hebat! Kamu telah menyelesaikan video interaktif ini!');
              }
            },
          },
        });
      } catch (err) {
        console.error('Error creating YouTube player:', err);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(timeInterval);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        ytPlayerRef.current = null;
      }
    };
  }, [ytVideoId, videoType, checkCheckpoints, enterFullscreen]);

  // Handle Play toggle
  const handlePlayToggle = () => {
    if (!hasStartedInitialPlay) {
      setHasStartedInitialPlay(true);
      if (!hasAutoFullscreenTriggered.current) {
        hasAutoFullscreenTriggered.current = true;
        enterFullscreen();
      }
    }

    if (videoType === 'youtube' && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo?.();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo?.();
        setIsPlaying(true);
      }
    } else if (videoType === 'mp4' && videoHtmlRef.current) {
      if (isPlaying) {
        videoHtmlRef.current.pause();
        setIsPlaying(false);
      } else {
        videoHtmlRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Initial Fullscreen Start Handler
  const handleStartInitialFullscreen = () => {
    setHasStartedInitialPlay(true);
    hasAutoFullscreenTriggered.current = true;
    enterFullscreen();

    if (videoType === 'youtube' && ytPlayerRef.current) {
      ytPlayerRef.current.playVideo?.();
      setIsPlaying(true);
    } else if (videoType === 'mp4' && videoHtmlRef.current) {
      videoHtmlRef.current.play();
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
    toast.success('🎬 Video Interaktif Berjalan dalam Layar Penuh!');
  };

  // Seek video with Anti-Skip protection
  const handleSeek = (seconds: number) => {
    const target = Math.max(0, Math.min(seconds, duration));

    // Prevent skipping forward ahead of watched progress
    if (target > maxWatchedTimeRef.current + 3) {
      toast('Tonton video secara tuntas dan berurutan agar materi dipahami utuh! 📺', {
        icon: '🔒',
        duration: 3000,
      });
      return;
    }

    setCurrentTime(target);

    if (videoType === 'youtube' && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo?.(target, true);
    } else if (videoType === 'mp4' && videoHtmlRef.current) {
      videoHtmlRef.current.currentTime = target;
    }
  };

  // Volume toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (videoType === 'youtube' && ytPlayerRef.current) {
      if (nextMuted) {
        ytPlayerRef.current.mute?.();
      } else {
        ytPlayerRef.current.unMute?.();
      }
    } else if (videoType === 'mp4' && videoHtmlRef.current) {
      videoHtmlRef.current.muted = nextMuted;
    }
  };

  // Checkpoint Quiz Submission
  const handleAnswerSubmit = () => {
    if (!activeCheckpoint || selectedOption === null) return;
    setShowFeedback(true);
  };

  // Resume video playback after answering
  const handleContinueVideo = () => {
    if (activeCheckpoint && selectedOption !== null) {
      setAnsweredCheckpoints((prev) => ({ ...prev, [activeCheckpoint.id]: selectedOption }));
    }

    const nextSeek = activeCheckpoint ? activeCheckpoint.timeInSeconds + 1 : currentTime;

    setActiveCheckpoint(null);
    setSelectedOption(null);
    setShowFeedback(false);

    // Resume video
    setTimeout(() => {
      if (videoType === 'youtube' && ytPlayerRef.current) {
        ytPlayerRef.current.seekTo?.(nextSeek, true);
        ytPlayerRef.current.playVideo?.();
        setIsPlaying(true);
      } else if (videoType === 'mp4' && videoHtmlRef.current) {
        videoHtmlRef.current.currentTime = nextSeek;
        videoHtmlRef.current.play();
        setIsPlaying(true);
      } else {
        setCurrentTime(nextSeek);
        setIsPlaying(true);
      }
    }, 100);
  };

  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const mins = Math.floor(s / 60);
    const remainder = s % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Step Header (Normal Mode) */}
      {!isTheaterFullscreen && (
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shadow-xs">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Langkah 4: Video Interaktif
                  </span>
                  {hasVideo ? (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span>
                        {videoType === 'youtube'
                          ? 'YouTube Live Stream'
                          : videoType === 'drive'
                          ? 'Google Drive Video'
                          : 'MP4 Video Stream'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Belum Diatur di Database</span>
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                    <span>🎯</span>
                    <span>Video Interaktif Aktif</span>
                  </span>
                </div>
                <h3 className="font-heading text-xl font-extrabold text-slate-900 mt-0.5">{videoTitle}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onNext}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <span>Lanjut → PRIMA AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Candidate Videos Switcher */}
          {candidateVideos.length > 1 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pilih Video Pembelajaran ({candidateVideos.length} Video Tersedia):</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">Klik video untuk mengganti</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {candidateVideos.map((v, vIdx) => {
                  const isSelected = activeVideo?.id === v.id;
                  return (
                    <button
                      key={`candidate-vid-${v.id}-${vIdx}`}
                      onClick={() => {
                        setSelectedVideoId(v.id);
                        setIsPlaying(false);
                        setCurrentTime(0);
                        setMaxWatchedTime(0);
                        maxWatchedTimeRef.current = 0;
                        setHasStartedInitialPlay(false);
                        hasAutoFullscreenTriggered.current = false;
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-[1.02]'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                      }`}
                    >
                      <Play className={`w-3 h-3 ${isSelected ? 'fill-white' : 'fill-indigo-600 text-indigo-600'}`} />
                      <span className="max-w-[220px] truncate">{v.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Video Player Container (Supports Normal Mode & Fullscreen Theater Mode) */}
      {!hasVideo ? (
        <div className="glass-card p-10 text-center rounded-3xl border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-inner">
            <Video className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-black text-slate-800 text-base">
              🎬 Video Interaktif Belum Tersedia di Database
            </h4>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              Guru belum menambahkan link video interaktif (YouTube / Google Drive) untuk mata pelajaran{' '}
              <strong className="text-indigo-600">{subjectName || 'ini'}</strong> pada database.
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
        <div
          ref={playerContainerRef}
          className={`${
            isTheaterFullscreen
              ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-3 sm:p-6 overflow-hidden'
              : 'relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800 aspect-video flex flex-col justify-between'
          }`}
        >
          {/* Top Bar (Active in Fullscreen Mode) */}
          {isTheaterFullscreen && (
            <div className="relative z-30 flex items-center justify-between gap-4 p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 text-white shadow-xl animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow">
                  ▶
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                      Video Interaktif PRIMA
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      🎯 Belajar Tuntas
                    </span>
                  </div>
                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-white max-w-xl truncate">
                    {videoTitle}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exitFullscreen}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Perkecil Layar (Esc)"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Perkecil Layar</span>
                </button>
                <button
                  onClick={() => {
                    exitFullscreen();
                    onNext();
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  <span>Lanjut AI</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Central Video Viewport */}
          <div className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center overflow-hidden">
            {videoType === 'youtube' && (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div ref={ytPlayerMountRef} className="w-full h-full aspect-video" />
              </div>
            )}

            {videoType === 'mp4' && (
              <video
                ref={videoHtmlRef}
                src={embedUrl}
                className="w-full h-full object-contain"
                onLoadedMetadata={() => {
                  if (videoHtmlRef.current) setDuration(Math.floor(videoHtmlRef.current.duration));
                }}
                onTimeUpdate={() => {
                  if (videoHtmlRef.current) {
                    const cur = videoHtmlRef.current.currentTime;
                    setCurrentTime(cur);
                    if (cur > maxWatchedTimeRef.current) {
                      setMaxWatchedTime(cur);
                      maxWatchedTimeRef.current = cur;
                    }
                    checkCheckpoints(cur, () => videoHtmlRef.current?.pause());
                  }
                }}
                onPlay={() => {
                  setIsPlaying(true);
                  if (!hasAutoFullscreenTriggered.current) {
                    hasAutoFullscreenTriggered.current = true;
                    enterFullscreen();
                  }
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setIsCompleted(true);
                  toast.success('🎉 Video Selesai!');
                }}
              />
            )}

            {videoType === 'drive' && (
              <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center">
                <iframe
                  src={embedUrl}
                  title="Google Drive Video Player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {videoType === 'other' && (
              <iframe
                src={embedUrl}
                title="Interactive Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {/* Initial Play Splash Overlay with Auto-Fullscreen Prompt */}
            {!hasStartedInitialPlay && (
              <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                <div className="relative group cursor-pointer" onClick={handleStartInitialFullscreen}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-600 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 shadow-indigo-600/50">
                    <Play className="w-9 h-9 sm:w-11 sm:h-11 fill-white translate-x-1" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-400/40 animate-ping pointer-events-none" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                    {videoTitle}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Video interaktif pembelajaran otomatis berjalan dalam <strong>Layar Penuh</strong>. Tonton video
                    hingga tuntas, pertanyaan kuis interaktif akan otomatis muncul di tengah video!
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleStartInitialFullscreen}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Putar Video Layar Penuh (Mulai)</span>
                  </button>

                  {videoType === 'drive' && (
                    <a
                      href={rawVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka Google Drive</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Checkpoint Question Modal Overlay (Landscape Layout) */}
            {activeCheckpoint && (
              <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center text-white animate-fadeIn overflow-y-auto">
                <div className="w-full max-w-4xl bg-slate-900/95 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
                  {/* Landscape 2-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
                    {/* Left Column: Question Statement & Explanation Feedback */}
                    <div className="md:col-span-5 space-y-3.5">
                      <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4" />
                        <span>Kuis Interaktif</span>
                      </div>

                      <h4 className="font-heading font-extrabold text-base sm:text-lg text-white leading-snug">
                        {activeCheckpoint.question}
                      </h4>

                      {/* Feedback Explanation Card on Left Side when answered */}
                      {showFeedback && (
                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 animate-fadeIn">
                          <div className="flex items-center gap-2 font-extrabold text-xs">
                            {selectedOption === activeCheckpoint.correctAnswer ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-emerald-400">Jawaban Tepat! (+25 XP)</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="text-amber-400">Penjelasan:</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            {activeCheckpoint.explanation}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Question Options & Actions */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeCheckpoint.options.map((opt, idx) => {
                          const isSel = selectedOption === idx;
                          const isCorrect = idx === activeCheckpoint.correctAnswer;
                          let btnStyle = 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200';

                          if (showFeedback) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50';
                            } else if (isSel && !isCorrect) {
                              btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 ring-2 ring-rose-500/50';
                            } else {
                              btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                            }
                          } else if (isSel) {
                            btnStyle = 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400';
                          }

                          return (
                            <button
                              key={idx}
                              disabled={showFeedback}
                              onClick={() => setSelectedOption(idx)}
                              className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-start justify-between gap-2.5 ${btnStyle}`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                                    isSel ? 'bg-white text-indigo-900' : 'bg-slate-700 text-slate-300'
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="leading-snug break-words">{opt}</span>
                              </div>
                              {showFeedback && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 flex justify-end">
                        {!showFeedback ? (
                          <button
                            disabled={selectedOption === null}
                            onClick={handleAnswerSubmit}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-102 flex items-center justify-center gap-2"
                          >
                            <span>Kirim Jawaban</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={handleContinueVideo}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-102"
                          >
                            <span>Lanjutkan Video</span>
                            <Play className="w-4 h-4 fill-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clean Interactive Player Controls & Seamless Timeline Bar (No Checkpoint Spoilers/Pins) */}
          <div className="relative z-20 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-col gap-2.5">
            {/* Seamless Timeline Bar (Anti-Skip Protected) */}
            <div className="relative w-full group py-2">
              <div
                className="relative w-full h-2.5 bg-slate-800 rounded-full cursor-pointer overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  handleSeek(ratio * duration);
                }}
              >
                {/* Watched Buffer (Gray/Subtle Indigo) */}
                <div
                  className="h-full bg-indigo-900/60 absolute left-0 top-0 transition-all duration-100"
                  style={{ width: `${(maxWatchedTime / Math.max(1, duration)) * 100}%` }}
                />

                {/* Current Played Progress Bar */}
                <div
                  className="h-full bg-indigo-500 rounded-full relative transition-all duration-100"
                  style={{ width: `${(currentTime / Math.max(1, duration)) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between text-white text-xs font-semibold gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayToggle}
                  className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
                  title={isPlaying ? 'Pause Video' : 'Putar Video'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Putar'}</span>
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Mulai dari awal"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleMute}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="font-mono text-xs text-slate-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span>Mode Tonton Berurutan</span>
                </div>

                {/* Fullscreen Toggle Button */}
                <button
                  onClick={isTheaterFullscreen ? exitFullscreen : enterFullscreen}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  title={isTheaterFullscreen ? 'Perkecil Layar (Esc)' : 'Layar Penuh'}
                >
                  {isTheaterFullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Perkecil</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Layar Penuh</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Learning Instruction Guide (No Spoilers of Checkpoint Seconds) */}
      {!isTheaterFullscreen && (
        <div className="p-4 sm:p-5 rounded-3xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3.5 shadow-xs">
          <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-sm shrink-0 mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h5 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
              <span>🎯 Petunjuk Belajar Video Interaktif</span>
            </h5>
            <p className="text-slate-600 leading-relaxed font-medium">
              Simak video penjelasan materi di atas dengan saksama dari awal hingga selesai. Video akan{' '}
              <strong className="text-indigo-900">otomatis dijeda (pause)</strong> saat mencapai checkpoint materi untuk menampilkan kuis interaktif yang menguji pemahamanmu.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
