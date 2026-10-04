import React from 'react';
import { Check, Lock, Sparkles, HelpCircle, Eye, RefreshCw, Video, Bot, Gamepad2, Code, Flame, Award, Heart } from 'lucide-react';
import { Topic, StepType } from '../../types/learning';
import toast from 'react-hot-toast';

interface LearningJourneyMapProps {
  topic: Topic;
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
}

const STEP_ICONS: Record<StepType, React.FC<{ className?: string }>> = {
  pemantik: HelpCircle,
  eksplorasi: Eye,
  interaksi: RefreshCw,
  video: Video,
  ai_tutor: Bot,
  simulasi: Gamepad2,
  coding: Code,
  hots: Flame,
  asesmen: Award,
  refleksi: Heart,
};

export const LearningJourneyMap: React.FC<LearningJourneyMapProps> = ({
  topic,
  activeStepIndex,
  onSelectStep,
}) => {
  const completedCount = topic.steps.filter((s) => s.isCompleted).length;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-pink-50 p-6 sm:p-8 rounded-[2rem] border-4 border-white shadow-2xl space-y-8">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-white/50 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/70 border-2 border-white text-xs font-black text-indigo-700 mb-2 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Petualangan Misi</span>
          </span>
          <h2 className="font-heading text-3xl font-black text-slate-900 drop-shadow-sm">
            {topic.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Progress:</span>
          <span className="px-5 py-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-black text-xs rounded-full shadow-lg">
            {completedCount} / {topic.steps.length} Misi
          </span>
        </div>
      </div>

      {/* Horizontal / Grid Mission Steps Roadmap */}
      <div className="relative py-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[750px] px-6 relative">
          
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-8 right-8 h-3 bg-white rounded-full shadow-inner" />
          <div
            className="absolute top-1/2 left-8 h-3 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 -translate-y-1/2 -z-0 transition-all duration-500 rounded-full shadow-md"
            style={{
              width: `${(activeStepIndex / Math.max(1, topic.steps.length - 1)) * 90}%`,
            }}
          />

          {topic.steps.map((step, idx) => {
            const IconComponent = STEP_ICONS[step.type] || HelpCircle;
            const isActive = idx === activeStepIndex;
            
            // To ensure 100% strict sequential unlocking, a step is unlocked only if ALL preceding steps are completed!
            const isUnlocked = idx === 0 || topic.steps.slice(0, idx).every(s => Boolean(s.isCompleted));
            const isCompleted = isUnlocked && Boolean(step.isCompleted);

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectStep(idx);
                  } else {
                    const firstIncompleteIdx = topic.steps.findIndex((s) => !s.isCompleted);
                    const targetIdx = firstIncompleteIdx !== -1 ? firstIncompleteIdx : 0;
                    const targetStepTitle = topic.steps[targetIdx]?.title || `Tahap ${targetIdx + 1}`;
                    const targetStepSubtitle = topic.steps[targetIdx]?.subtitle || '';
                    
                    toast.error(
                      `Misi ini Terkunci! 🔒 Wajib selesaikan secara berurutan. Selesaikan "${targetStepTitle}${targetStepSubtitle ? `: ${targetStepSubtitle}` : ''}" terlebih dahulu!`,
                      {
                        duration: 4000,
                        icon: '🔒',
                        style: {
                          borderRadius: '16px',
                          background: '#0f172a',
                          color: '#f8fafc',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          border: '1px solid #334155',
                        }
                      }
                    );
                    
                    // Auto-redirect to first incomplete step
                    onSelectStep(targetIdx);
                  }
                }}
                className={`relative z-10 flex flex-col items-center group shrink-0 ${!isUnlocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              >
                {/* Node Circle */}
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center font-heading font-black text-lg transition-all duration-300 shadow-xl ${
                    isActive
                      ? 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 text-white scale-125 ring-4 ring-white shadow-amber-500/50'
                      : isCompleted || isUnlocked
                      ? 'bg-gradient-to-tr from-emerald-400 to-cyan-500 text-white hover:scale-110 shadow-emerald-500/30'
                      : 'bg-slate-200 text-slate-500 border-4 border-slate-300/80 shadow-xs'
                  }`}
                >
                  {isCompleted || isUnlocked ? (
                    <Check className="w-8 h-8 stroke-[4]" />
                  ) : (
                    <Lock className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                {/* Step Title Label below */}
                <div className="mt-4 text-center max-w-[100px]">
                  <p
                    className={`text-[10px] font-black uppercase tracking-widest leading-tight transition-colors px-3 py-1 rounded-full flex items-center justify-center gap-1 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isUnlocked
                        ? 'text-slate-700 bg-white/70 border border-slate-200'
                        : 'text-slate-400 bg-slate-200/80'
                    }`}
                  >
                    {!isUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                    <span>{step.title}</span>
                  </p>
                </div>

              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
};
