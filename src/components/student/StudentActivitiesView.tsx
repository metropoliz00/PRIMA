import React, { useState, useEffect } from 'react';
import {
  Gamepad2, Sparkles, ArrowLeft, Trophy, CheckCircle2, Play, Award, Filter, RefreshCw, Layers, Check, X, RotateCcw, AlertCircle, ArrowUp, ArrowDown, TestTube, Droplet, Sun, Wind, Flame, ShieldAlert, Cpu
} from 'lucide-react';
import { Subject, InteractiveActivity } from '../../types/learning';
import { getStoredActivities } from '../../data/learningData';
import toast from 'react-hot-toast';

interface StudentActivitiesViewProps {
  subjects: Subject[];
  activitiesList?: InteractiveActivity[];
  onBack: () => void;
  onRewardXp: (points: number, title: string) => void;
}

// Matching Pairs Templates
const DEFAULT_MATCHING_PAIRS = [
  { id: 'm1', left: '🌾 Tanaman Padi', right: '🌱 Produsen (Penghasil Makanan)' },
  { id: 'm2', left: '🦗 Belalang Sawah', right: '🥗 Konsumen I (Herbivora)' },
  { id: 'm3', left: '🐸 Katak Sawah', right: '🥩 Konsumen II (Karnivora)' },
  { id: 'm4', left: '🍄 Jamur & Bakteri', right: '♻️ Dekomposer (Pengurai Alami)' },
  { id: 'm5', left: '☀️ Cahaya Matahari', right: '⚡ Sumber Energi Utama Ekosistem' },
];

// Puzzle Sequence Template
const DEFAULT_PUZZLE_ITEMS = [
  { id: 'p1', label: '1. Energi Matahari ☀️', rank: 1 },
  { id: 'p2', label: '2. Produsen (Padi 🌾)', rank: 2 },
  { id: 'p3', label: '3. Konsumen I (Belalang 🦗)', rank: 3 },
  { id: 'p4', label: '4. Konsumen II (Katak 🐸)', rank: 4 },
  { id: 'p5', label: '5. Dekomposer (Jamur 🍄)', rank: 5 },
];

const shuffleDerangement = <T,>(array: T[], checkCorrect: (item: T, index: number) => boolean): T[] => {
  let shuffled = [...array];
  let attempts = 0;
  
  while (attempts < 100) {
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    
    // Ensure no element is in its original index/correct rank
    const hasCorrectRow = shuffled.some((item, idx) => checkCorrect(item, idx));
    if (!hasCorrectRow) {
      return shuffled;
    }
    attempts++;
  }
  return shuffled;
};

export const StudentActivitiesView: React.FC<StudentActivitiesViewProps> = ({
  subjects,
  activitiesList,
  onBack,
  onRewardXp,
}) => {
  const [activities, setActivities] = useState<InteractiveActivity[]>(activitiesList || getStoredActivities());
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [activePlayingActivity, setActivePlayingActivity] = useState<InteractiveActivity | null>(null);
  const [isPlayingCompleted, setIsPlayingCompleted] = useState<boolean>(false);

  // Sync when activitiesList prop updates
  useEffect(() => {
    if (activitiesList && activitiesList.length > 0) {
      setActivities(activitiesList);
    }
  }, [activitiesList]);

  // MATCHING GAME STATE
  const [activeMatchingPairs, setActiveMatchingPairs] = useState<Array<{ id: string; left: string; right: string }>>(DEFAULT_MATCHING_PAIRS);
  const [shuffledRightPairs, setShuffledRightPairs] = useState<Array<{ id: string; left: string; right: string }>>(DEFAULT_MATCHING_PAIRS);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);

  // SIMULATION GAME STATE (Live Ecosystem Variables & Math Simulator)
  const [simGrass, setSimGrass] = useState<number>(100);
  const [simGrasshopper, setSimGrasshopper] = useState<number>(50);
  const [simFrog, setSimFrog] = useState<number>(20);
  const [simSnake, setSimSnake] = useState<number>(6);
  const [mathA, setMathA] = useState<number>(12);
  const [mathB, setMathB] = useState<number>(18);

  // PUZZLE GAME STATE (Ordering Steps)
  const [puzzleItems, setPuzzleItems] = useState<Array<{ id: string; label: string; rank: number }>>([]);
  const [puzzleChecked, setPuzzleChecked] = useState<boolean>(false);

  // LAB GAME STATE (Apparatus & Filtration Layers)
  const [activeLabApparatus, setActiveLabApparatus] = useState<Array<{ id: string; name: string; score: number; icon?: string }>>([
    { id: 'l1', name: 'Kerikil & Pasir Kasar', score: 25, icon: '🪨' },
    { id: 'l2', name: 'Arang Aktif Karbon', score: 35, icon: '⬛' },
    { id: 'l3', name: 'Sabut Kelapa / Ijuk Alami', score: 20, icon: '🥥' },
    { id: 'l4', name: 'Kain Kasa Saringan Halus', score: 20, icon: '📜' },
  ]);
  const [labLayers, setLabLayers] = useState<string[]>([]);
  const [labClarity, setLabClarity] = useState<number>(20);
  const [labPoured, setLabPoured] = useState<boolean>(false);
  const [labTested, setLabTested] = useState<boolean>(false);

  const filteredActivities = selectedSubjectFilter === 'all'
    ? activities
    : activities.filter((a) => a.subjectId?.toLowerCase() === selectedSubjectFilter.toLowerCase());

  const handleStartPlay = (act: InteractiveActivity) => {
    setActivePlayingActivity(act);
    setIsPlayingCompleted(false);

    // Dynamic Matching configuration from Teacher
    const customPairs = act.config?.matchingPairs && act.config.matchingPairs.length > 0
      ? act.config.matchingPairs
      : act.subjectId?.toLowerCase() === 'matematika'
      ? [
          { id: 'mm1', left: '1/2 (Satu Per Dua)', right: '0,5 atau 50%' },
          { id: 'mm2', left: '1/4 (Satu Per Empat)', right: '0,25 atau 25%' },
          { id: 'mm3', left: '3/4 (Tiga Per Empat)', right: '0,75 atau 75%' },
          { id: 'mm4', left: '1/5 (Satu Per Lima)', right: '0,2 atau 20%' },
          { id: 'mm5', left: '4/5 (Empat Per Lima)', right: '0,8 atau 80%' },
        ]
      : DEFAULT_MATCHING_PAIRS;

    setActiveMatchingPairs(customPairs);
    // Shuffle right-side targets for fair challenge
    setShuffledRightPairs([...customPairs].sort(() => Math.random() - 0.5));
    setSelectedLeft(null);
    setMatchedPairs({});
    setWrongMatch(null);

    // Dynamic Simulation State
    if (act.config?.simVariables && act.config.simVariables.length > 0) {
      act.config.simVariables.forEach((v) => {
        if (v.key === 'grass') setSimGrass(v.initial);
        if (v.key === 'grasshopper') setSimGrasshopper(v.initial);
        if (v.key === 'frog') setSimFrog(v.initial);
        if (v.key === 'snake') setSimSnake(v.initial);
      });
    } else {
      setSimGrass(100);
      setSimGrasshopper(50);
      setSimFrog(20);
      setSimSnake(6);
    }
    setMathA(12);
    setMathB(18);

    // Dynamic Puzzle State from Teacher
    const customPuzzle = act.config?.puzzleItems && act.config.puzzleItems.length > 0
      ? act.config.puzzleItems
      : act.subjectId?.toLowerCase() === 'matematika'
      ? [
          { id: 'p1', label: '1. Tuliskan Bilangan (12 dan 18) 🔢', rank: 1 },
          { id: 'p2', label: '2. Tentukan Faktor Prima Tiap Bilangan 🌳', rank: 2 },
          { id: 'p3', label: '3. Buat Bentuk Faktorisasi Prima (2² x 3) 🧮', rank: 3 },
          { id: 'p4', label: '4. Ambil Semua Faktor Berpangkat Terbesar 📈', rank: 4 },
          { id: 'p5', label: '5. Kalikan Seluruh Faktor untuk Menemukan KPK (36) ✨', rank: 5 },
        ]
      : DEFAULT_PUZZLE_ITEMS;

    const shuffled = shuffleDerangement(customPuzzle, (item, idx) => item.rank === idx + 1);
    setPuzzleItems(shuffled);
    setPuzzleChecked(false);

    // Dynamic Lab State from Teacher
    const customLab = act.config?.labApparatus && act.config.labApparatus.length > 0
      ? act.config.labApparatus
      : [
          { id: 'l1', name: 'Kerikil & Pasir Kasar', score: 25, icon: '🪨' },
          { id: 'l2', name: 'Arang Aktif Karbon', score: 35, icon: '⬛' },
          { id: 'l3', name: 'Sabut Kelapa / Ijuk Alami', score: 20, icon: '🥥' },
          { id: 'l4', name: 'Kain Kasa Saringan Halus', score: 20, icon: '📜' },
        ];
    setActiveLabApparatus(customLab);
    setLabLayers([]);
    setLabClarity(20);
    setLabPoured(false);
    setLabTested(false);
  };

  const handleFinishPlay = () => {
    if (!activePlayingActivity) return;
    setIsPlayingCompleted(true);
    onRewardXp(activePlayingActivity.points, activePlayingActivity.title);
    toast.success(`Selamat! Kamu mendapatkan +${activePlayingActivity.points} XP dari aktivitas "${activePlayingActivity.title}"! 🌟`);
  };

  // Matching Logic
  const handleMatchLeftClick = (leftId: string) => {
    if (matchedPairs[leftId]) return;
    setSelectedLeft(leftId);
    setWrongMatch(null);
  };

  const handleMatchRightClick = (pair: { id: string; left: string; right: string }) => {
    if (!selectedLeft) return;

    if (selectedLeft === pair.id) {
      // Correct Match!
      const updated = { ...matchedPairs, [pair.id]: pair.right };
      setMatchedPairs(updated);
      setSelectedLeft(null);
      toast.success(`Cocok! ${pair.left} ➔ ${pair.right}`);

      if (Object.keys(updated).length === activeMatchingPairs.length) {
        toast.success('🎉 Hebat! Semua pasangan berhasil dicocokkan dengan sempurna!');
      }
    } else {
      // Incorrect Match
      setWrongMatch(pair.id);
      toast.error('Pasangan belum tepat! Coba lagi.');
      setTimeout(() => setWrongMatch(null), 800);
    }
  };

  // Math Helper Functions
  const getGcd = (a: number, b: number): number => (b === 0 ? a : getGcd(b, a % b));
  const getLcm = (a: number, b: number): number => ((a * b) / (getGcd(a, b) || 1));

  // Simulation Ecosystem Balance Calculator
  const getEcosystemHarmony = () => {
    let score = 100;
    let message = '🌿 Ekosistem Berada dalam Keseimbangan Harmonis & Sehat!';
    let status: 'balanced' | 'warning' | 'danger' = 'balanced';

    if (simGrass < 40) {
      score -= 40;
      message = '⚠️ Rumput terlalu sedikit! Hewan pemakan rumput mulai kelaparan.';
      status = 'warning';
    }
    if (simGrasshopper > 80) {
      score -= 35;
      message = '🚨 Ledakan Populasi Hama Belalang! Tanaman padi habis terancam.';
      status = 'danger';
    }
    if (simFrog < 10 && simGrasshopper > 60) {
      score -= 30;
      message = '⚠️ Predator katak sedikit, hama belalang tidak terkendali.';
      status = 'warning';
    }
    if (simSnake > 14) {
      score -= 25;
      message = '⚠️ Ular predator terlalu banyak, populasi katak menurun drastis.';
      status = 'warning';
    }

    score = Math.max(10, Math.min(100, score));
    return { score, message, status };
  };

  const ecosystemHarmony = getEcosystemHarmony();

  // Puzzle Move Up / Down
  const handleMovePuzzleItem = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= puzzleItems.length) return;

    const updated = [...puzzleItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPuzzleItems(updated);
    setPuzzleChecked(false);
  };

  const handleCheckPuzzle = () => {
    setPuzzleChecked(true);
    const isAllCorrect = puzzleItems.every((item, idx) => item.rank === idx + 1);
    if (isAllCorrect) {
      toast.success('🎉 Luar Biasa! Susunan urutan rantai makanan sudah 100% tepat!');
    } else {
      toast.error('Masih ada urutan yang belum pas. Periksa tanda silang merah dan atur kembali!');
    }
  };

  // Lab Tool Actions
  const handleAddLabLayer = (layerName: string) => {
    if (labLayers.includes(layerName)) {
      toast('Lapisan ini sudah ditambahkan.');
      return;
    }
    const updated = [...labLayers, layerName];
    setLabLayers(updated);

    // Calculate clarity percentage
    let clarity = 20;
    if (updated.includes('Kerikil & Pasir')) clarity += 25;
    if (updated.includes('Arang Aktif')) clarity += 35;
    if (updated.includes('Sabut Kelapa / Ijuk')) clarity += 20;
    setLabClarity(clarity);
    toast.success(`Lapisan "${layerName}" berhasil dipasang pada tabung penyaring!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pusat Eksplorasi Siswa</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                {activities.length} Aktivitas & Game Aktif Guru
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
              🎮 Aktivitas & Game Simulasi Interaktif
            </h2>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Mata Pelajaran</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.icon || '📚'} {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h4 className="font-heading font-bold text-slate-800 text-base">Belum Ada Aktivitas untuk Mapel Ini</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Guru belum menambahkan aktivitas interaktif untuk mata pelajaran yang dipilih. Silakan pilih "Semua Mata Pelajaran" atau tunggu guru menambahkan aktivitas baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const sub = subjects.find((s) => s.id?.toLowerCase() === act.subjectId?.toLowerCase());
            const subName = sub ? `${sub.icon || '📚'} ${sub.name}` : (act.subjectId?.toUpperCase() || 'UMUM');

            const typeColor =
              act.type === 'MATCHING'
                ? 'bg-purple-100 text-purple-800 border-purple-200'
                : act.type === 'SIMULATION'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : act.type === 'LAB'
                ? 'bg-sky-100 text-sky-800 border-sky-200'
                : 'bg-amber-100 text-amber-800 border-amber-200';

            const gameIcon =
              act.type === 'MATCHING' ? '🧩' : act.type === 'SIMULATION' ? '🌿' : act.type === 'LAB' ? '🧪' : '📐';

            return (
              <div
                key={act.id}
                className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${typeColor} flex items-center gap-1`}>
                      <span>{gameIcon}</span>
                      <span>{act.type} MODE</span>
                    </span>
                    <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                      <span>+{act.points} XP</span>
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{subName}</p>
                    <h3 className="font-heading font-extrabold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {act.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {act.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Level: <strong className="text-slate-800">{act.difficulty}</strong>
                  </span>
                  <button
                    onClick={() => handleStartPlay(act)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Mainkan Game</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Activity Player Modal */}
      {activePlayingActivity && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 border border-slate-200 my-8 animate-fadeIn shadow-2xl bg-white max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-xs">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      {activePlayingActivity.type} MODE
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      +{activePlayingActivity.points} XP
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-xl text-slate-900 mt-0.5">
                    {activePlayingActivity.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActivePlayingActivity(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {!isPlayingCompleted ? (
              <div className="space-y-6">
                
                {/* Petunjuk Guru */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed space-y-1 shadow-xs">
                  <p className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                    <span>🎯</span>
                    <span>Misi Eksperimen Guru:</span>
                  </p>
                  <p className="font-medium text-emerald-900">{activePlayingActivity.description}</p>
                </div>

                {/* 1. MATCHING GAME ENGINE */}
                {activePlayingActivity.type === 'MATCHING' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        🧩 Klik kartu kiri, lalu klik pasangannya di sebelah kanan:
                      </span>
                      <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        Cocok: {Object.keys(matchedPairs).length} / {activeMatchingPairs.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left Column: Concept Cards */}
                      <div className="space-y-2.5">
                        <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Pernyataan / Konsep Kiri</p>
                        {activeMatchingPairs.map((pair) => {
                          const isMatched = !!matchedPairs[pair.id];
                          const isSelected = selectedLeft === pair.id;

                          return (
                            <button
                              key={pair.id}
                              disabled={isMatched}
                              onClick={() => handleMatchLeftClick(pair.id)}
                              className={`w-full p-3.5 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
                                isMatched
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-80 cursor-default'
                                  : isSelected
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-102'
                                  : 'bg-white hover:bg-purple-50 text-slate-800 border-slate-200 hover:border-purple-300 shadow-xs'
                              }`}
                            >
                              <span>{pair.left}</span>
                              {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Column: Target Match Cards */}
                      <div className="space-y-2.5">
                        <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Pasangan Tepat Kanan</p>
                        {shuffledRightPairs.map((pair) => {
                          const isMatched = Object.values(matchedPairs).includes(pair.right);
                          const isWrong = wrongMatch === pair.id;

                          return (
                            <button
                              key={`r-${pair.id}`}
                              disabled={isMatched || !selectedLeft}
                              onClick={() => handleMatchRightClick(pair)}
                              className={`w-full p-3.5 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
                                isMatched
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-80 cursor-default'
                                  : isWrong
                                  ? 'bg-rose-100 border-rose-400 text-rose-800 animate-shake'
                                  : selectedLeft
                                  ? 'bg-white hover:bg-emerald-50 text-slate-800 border-indigo-300 shadow-xs hover:scale-102'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 opacity-70 cursor-not-allowed'
                              }`}
                            >
                              <span>{pair.right}</span>
                              {isMatched && <Check className="w-4 h-4 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SIMULATION ENGINE (Math vs Ecosystem) */}
                {activePlayingActivity.type === 'SIMULATION' && (
                  (activePlayingActivity.config?.simulationType === 'math' || activePlayingActivity.subjectId?.toLowerCase() === 'matematika') ? (
                    <div className="space-y-5">
                      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-4 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                            <Cpu className="w-4 h-4" />
                            <span>Laboratorium Simulasi Bilangan & Pohon Faktor (KPK & FPB)</span>
                          </span>
                          <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full text-white font-bold">
                            Matematika Interaktif
                          </span>
                        </div>
                        <p className="text-xs text-blue-100 leading-relaxed">
                          Ubah nilai angka A dan B untuk menguji kelipatan dan pembagian faktor prima secara langsung!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                            <span>Angka Pertama (A):</span>
                            <span className="text-indigo-600 font-mono text-base font-extrabold">{mathA}</span>
                          </div>
                          <input
                            type="range"
                            min={2}
                            max={60}
                            value={mathA}
                            onChange={(e) => setMathA(Number(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                            <span>Angka Kedua (B):</span>
                            <span className="text-emerald-600 font-mono text-base font-extrabold">{mathB}</span>
                          </div>
                          <input
                            type="range"
                            min={2}
                            max={60}
                            value={mathB}
                            onChange={(e) => setMathB(Number(e.target.value))}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Math Result Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-3xl text-center space-y-1">
                          <span className="text-[11px] font-bold uppercase text-indigo-700">Kelipatan Terkecil (KPK)</span>
                          <p className="font-heading font-black text-3xl text-indigo-900">{getLcm(mathA, mathB)}</p>
                          <p className="text-[10px] text-indigo-600">Titik temu kelipatan bersama</p>
                        </div>
                        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-1">
                          <span className="text-[11px] font-bold uppercase text-emerald-700">Faktor Terbesar (FPB)</span>
                          <p className="font-heading font-black text-3xl text-emerald-900">{getGcd(mathA, mathB)}</p>
                          <p className="text-[10px] text-emerald-600">Pembagi terbesar kedua angka</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Live Graphical Ecosystem Viewport */}
                      <div className="p-6 rounded-3xl bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 border border-emerald-300 shadow-inner relative overflow-hidden min-h-[160px] flex flex-col justify-between">
                        <div className="flex items-center justify-between z-10">
                          <span className="text-[11px] font-extrabold px-3 py-1 bg-white/90 text-emerald-900 rounded-full border shadow-xs">
                            📊 Arena Simulasi Interaktif
                          </span>
                          <span className="text-[11px] font-black px-3 py-1 bg-white/90 text-indigo-900 rounded-full border shadow-xs">
                            Skor Harmoni: {ecosystemHarmony.score}%
                          </span>
                        </div>

                        {/* Animated Living Entities */}
                        <div className="flex flex-wrap gap-2 justify-center items-center py-4 z-10">
                          {Array.from({ length: Math.min(12, Math.round(simGrass / 10)) }).map((_, i) => (
                            <span key={`g-${i}`} className="text-2xl animate-bounce" style={{ animationDuration: `${2 + (i % 3)}s` }}>🌾</span>
                          ))}
                          {Array.from({ length: Math.min(8, Math.round(simGrasshopper / 12)) }).map((_, i) => (
                            <span key={`gh-${i}`} className="text-2xl animate-pulse" style={{ animationDuration: `${1.5 + (i % 2)}s` }}>🦗</span>
                          ))}
                          {Array.from({ length: Math.min(6, Math.round(simFrog / 4)) }).map((_, i) => (
                            <span key={`f-${i}`} className="text-2xl animate-bounce" style={{ animationDuration: `${1.8 + (i % 2)}s` }}>🐸</span>
                          ))}
                          {Array.from({ length: Math.min(4, simSnake) }).map((_, i) => (
                            <span key={`s-${i}`} className="text-2xl animate-pulse">🐍</span>
                          ))}
                        </div>

                        {/* Balance Status Banner */}
                        <div className={`p-3 rounded-2xl text-xs font-bold border z-10 ${
                          ecosystemHarmony.status === 'balanced'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : ecosystemHarmony.status === 'warning'
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-rose-600 text-white border-rose-700'
                        }`}>
                          {ecosystemHarmony.message}
                        </div>
                      </div>

                      {/* Interactive Population Sliders */}
                      {(() => {
                        const grassVar = activePlayingActivity.config?.simVariables?.find((v) => v.key === 'grass');
                        const grasshopperVar = activePlayingActivity.config?.simVariables?.find((v) => v.key === 'grasshopper');
                        const frogVar = activePlayingActivity.config?.simVariables?.find((v) => v.key === 'frog');
                        const snakeVar = activePlayingActivity.config?.simVariables?.find((v) => v.key === 'snake');

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                <span>{grassVar?.label || '🌾 Tanaman Padi (Produsen)'}</span>
                                <span className="text-emerald-600">{simGrass} {grassVar?.unit || 'Unit'}</span>
                              </div>
                              <input
                                type="range"
                                min={grassVar?.min ?? 10}
                                max={grassVar?.max ?? 200}
                                value={simGrass}
                                onChange={(e) => setSimGrass(Number(e.target.value))}
                                className="w-full accent-emerald-600 cursor-pointer"
                              />
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                <span>{grasshopperVar?.label || '🦗 Hama Belalang (Konsumen I)'}</span>
                                <span className="text-green-600">{simGrasshopper} {grasshopperVar?.unit || 'Ekor'}</span>
                              </div>
                              <input
                                type="range"
                                min={grasshopperVar?.min ?? 5}
                                max={grasshopperVar?.max ?? 150}
                                value={simGrasshopper}
                                onChange={(e) => setSimGrasshopper(Number(e.target.value))}
                                className="w-full accent-green-600 cursor-pointer"
                              />
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                <span>{frogVar?.label || '🐸 Katak Sawah (Konsumen II)'}</span>
                                <span className="text-sky-600">{simFrog} {frogVar?.unit || 'Ekor'}</span>
                              </div>
                              <input
                                type="range"
                                min={frogVar?.min ?? 2}
                                max={frogVar?.max ?? 50}
                                value={simFrog}
                                onChange={(e) => setSimFrog(Number(e.target.value))}
                                className="w-full accent-sky-600 cursor-pointer"
                              />
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                <span>{snakeVar?.label || '🐍 Ular Predator (Konsumen III)'}</span>
                                <span className="text-purple-600">{simSnake} {snakeVar?.unit || 'Ekor'}</span>
                              </div>
                              <input
                                type="range"
                                min={snakeVar?.min ?? 1}
                                max={snakeVar?.max ?? 20}
                                value={simSnake}
                                onChange={(e) => setSimSnake(Number(e.target.value))}
                                className="w-full accent-purple-600 cursor-pointer"
                              />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Skenario Preset Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-500">Uji Skenario:</span>
                        <button
                          onClick={() => { setSimGrass(100); setSimGrasshopper(50); setSimFrog(20); setSimSnake(6); }}
                          className="px-3 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] cursor-pointer"
                        >
                          🌿 Keseimbangan Alami
                        </button>
                        <button
                          onClick={() => { setSimGrass(25); setSimGrasshopper(90); setSimFrog(8); setSimSnake(3); }}
                          className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] cursor-pointer"
                        >
                          ☀️ Musim Kemarau
                        </button>
                        <button
                          onClick={() => { setSimGrass(120); setSimGrasshopper(120); setSimFrog(4); setSimSnake(2); }}
                          className="px-3 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] cursor-pointer"
                        >
                          🚨 Ledakan Hama
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* 3. PUZZLE ORDERING GAME ENGINE */}
                {activePlayingActivity.type === 'PUZZLE' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        📐 Susun urutan langkah atau tahapan dari awal ke akhir:
                      </span>
                      <button
                        onClick={handleCheckPuzzle}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        🔍 Uji Susunan Logika
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {puzzleItems.map((item, idx) => {
                        const isCorrectPosition = item.rank === idx + 1;

                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                              puzzleChecked
                                ? isCorrectPosition
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : 'bg-rose-50 border-rose-300 text-rose-900'
                                : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-xl bg-slate-100 font-mono font-bold text-xs flex items-center justify-center text-slate-700 border">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-xs">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {puzzleChecked && (
                                <span className="text-xs font-bold">
                                  {isCorrectPosition ? '✅ Benar' : '❌ Salah'}
                                </span>
                              )}
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMovePuzzleItem(idx, 'UP')}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                                title="Geser ke Atas"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={idx === puzzleItems.length - 1}
                                onClick={() => handleMovePuzzleItem(idx, 'DOWN')}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                                title="Geser ke Bawah"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. LAB EXPERIMENT ENGINE */}
                {activePlayingActivity.type === 'LAB' && (
                  <div className="space-y-5">
                    {/* Visual Apparatus Simulation Container */}
                    <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-700 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                          <TestTube className="w-4 h-4" />
                          <span>Tabung Filtrasi & Pemurnian Air</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Tingkat Kejernihan: {labClarity}%
                        </span>
                      </div>

                      {/* Visual Beaker Container */}
                      <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-800/80 border border-slate-600 space-y-2 text-center">
                        <div className="h-28 rounded-xl border border-dashed border-sky-400/40 relative overflow-hidden flex flex-col justify-end p-2 bg-slate-950/60">
                          {labLayers.map((lay, i) => (
                            <div
                              key={i}
                              className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold text-center mb-1 shadow-sm ${
                                lay.includes('Kerikil')
                                  ? 'bg-amber-700/80 text-amber-100'
                                  : lay.includes('Arang')
                                  ? 'bg-slate-700 text-slate-100'
                                  : 'bg-yellow-800/80 text-yellow-100'
                              }`}
                            >
                              Lapisan {i + 1}: {lay}
                            </div>
                          ))}
                          {labLayers.length === 0 && (
                            <p className="text-[11px] text-slate-500 my-auto">Tabung filter masih kosong. Tambahkan lapisan di bawah!</p>
                          )}
                        </div>

                        <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 via-sky-400 to-emerald-400 h-full transition-all duration-500"
                            style={{ width: `${labClarity}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Lab Tools */}
                    <div className="space-y-2">
                      <p className="text-xs font-extrabold text-slate-700">🧪 Pasang Bahan Lapisan Filter:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {activeLabApparatus.map((app) => (
                          <button
                            key={app.id}
                            onClick={() => handleAddLabLayer(app.name)}
                            className={`p-3 rounded-2xl border font-bold text-xs transition-all cursor-pointer ${
                              labLayers.includes(app.name)
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                            }`}
                          >
                            {app.icon || '🧪'} + {app.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    onClick={() => setActivePlayingActivity(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs cursor-pointer transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={handleFinishPlay}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg cursor-pointer transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <span>Selesaikan & Klaim +{activePlayingActivity.points} XP</span>
                    <Trophy className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-2xl text-slate-900">
                    Aktivitas Berhasil Diselesaikan! 🎉
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Hebat sekali! Kamu berhasil menyelesaikan simulasi interaktif <strong className="text-emerald-600">{activePlayingActivity.title}</strong> dan mendapatkan tambahan XP.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 inline-flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Sparkles className="w-5 h-5 fill-amber-400 text-amber-600" />
                  <span>+{activePlayingActivity.points} XP Ditambahkan ke Akunmu!</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActivePlayingActivity(null)}
                    className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all hover:scale-105"
                  >
                    Kembali ke Daftar Aktivitas
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
