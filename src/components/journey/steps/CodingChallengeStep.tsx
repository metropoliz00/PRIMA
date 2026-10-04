import React, { useState, useEffect } from 'react';
import { Code, Play, RotateCcw, CheckCircle2, ArrowRight, AlertCircle, Sparkles, Layers, Cpu, Zap } from 'lucide-react';
import { CodingBlock } from '../../../types/learning';
import { getStoredCodingChallenges, CodingChallengeItem } from '../../../data/learningData';

interface CodingChallengeStepProps {
  content: any;
  subjectId?: string;
  onNext: () => void;
}

export const CodingChallengeStep: React.FC<CodingChallengeStepProps> = ({ content, subjectId, onNext }) => {
  // Load coding challenges configured by teacher
  const [allChallenges, setAllChallenges] = useState<CodingChallengeItem[]>([]);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(0);

  useEffect(() => {
    const loaded = getStoredCodingChallenges();
    const filtered = loaded.filter(ch => {
      if (!subjectId) return true;
      return ch.subjectId?.toLowerCase() === subjectId.toLowerCase();
    });
    setAllChallenges(filtered.length > 0 ? filtered : loaded);
    setActiveChallengeIndex(0);
  }, [subjectId]);

  const currentChallenge = allChallenges[activeChallengeIndex];

  // Grid / challenge state computed safely
  const availableBlocks: CodingBlock[] = currentChallenge?.availableBlocks || [
    { id: 'b-maju', text: '🤖 Maju 1 Langkah', category: 'action', snippet: 'robot.maju()', color: 'bg-emerald-600' },
    { id: 'b-kanan', text: '↪️ Belok Kanan', category: 'action', snippet: 'robot.belokKanan()', color: 'bg-blue-600' },
    { id: 'b-kiri', text: '↩️ Belok Kiri', category: 'action', snippet: 'robot.belokKiri()', color: 'bg-indigo-600' },
    { id: 'b-siram', text: '💧 Siram Air Padi', category: 'action', snippet: 'robot.siram()', color: 'bg-sky-500' },
    { id: 'b-cek', text: '🔍 Cek Kelembapan < 40%', category: 'condition', snippet: 'if(kelembapan < 40)', color: 'bg-amber-500' },
    { id: 'b-loop', text: '🔄 Ulangi 3 Kali', category: 'control', snippet: 'repeat(3)', color: 'bg-purple-600' },
  ];

  const expectedSequence: string[] = currentChallenge?.expectedSequence || ['b-maju', 'b-kanan', 'b-maju', 'b-siram'];

  const gridSize = currentChallenge?.gridSize || 4;
  const startPos = currentChallenge?.startPos || { x: 0, y: 0 };
  const targetPos = currentChallenge?.targetPos || { x: 3, y: 3 };
  const obstacles = currentChallenge?.obstacles || [{ x: 1, y: 1 }, { x: 2, y: 0 }];
  const charIcon = currentChallenge?.characterIcon || '🤖';

  const [workspaceBlocks, setWorkspaceBlocks] = useState<CodingBlock[]>([]);
  const [attempts, setAttempts] = useState<{ id: number; timestamp: string; blocks: CodingBlock[]; success: boolean }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [charPos, setCharPos] = useState<{ x: number; y: number }>(startPos);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Reset grid and attempts when challenge changes
  useEffect(() => {
    if (currentChallenge) {
      setCharPos(currentChallenge.startPos || { x: 0, y: 0 });
      setWorkspaceBlocks([]);
      setAttempts([]);
      setTestResult(null);
      setExecutionLog([]);
    }
  }, [activeChallengeIndex, currentChallenge]);

  const handleAddBlock = (block: CodingBlock) => {
    // Unrestricted block limit so students can always reach the target!
    setWorkspaceBlocks((prev) => [...prev, block]);
    setTestResult(null);
  };

  const handleRemoveBlock = (blockId: string, index: number) => {
    setWorkspaceBlocks((prev) => prev.filter((_, idx) => idx !== index));
    setTestResult(null);
  };

  const handleRunCode = () => {
    if (workspaceBlocks.length === 0 || isRunning) return;
    setIsRunning(true);
    setTestResult(null);
    setCharPos(startPos);
    setExecutionLog(['🚀 Mulai Eksekusi Algoritma Visual...']);

    let currentX = startPos.x;
    let currentY = startPos.y;
    let direction = 'RIGHT'; // RIGHT, DOWN, LEFT, UP

    const userSeq = workspaceBlocks.map((b) => b.id);
    let stepCount = 0;

    const interval = setInterval(() => {
      if (stepCount >= workspaceBlocks.length) {
        clearInterval(interval);
        setIsRunning(false);

        const isMatched =
          userSeq.length >= expectedSequence.length &&
          expectedSequence.every((val) => userSeq.includes(val));

        const success = isMatched || (currentX === targetPos.x && currentY === targetPos.y);

        if (success) {
          setTestResult({
            success: true,
            message: `🎉 Luar Biasa! Algoritma Plug Coding berhasil mengeksekusi misi "${currentChallenge.title}" dan mencapai target dengan sempurna!`,
          });
        } else {
          setTestResult({
            success: false,
            message: 'Urutan balok belum tepat untuk mencapai target. Coba periksa petunjuk dan atur ulang balok instruksimu!',
          });
        }

        // Record this coding attempt so students can review, restore, and try again (1st attempt, 2nd attempt, etc.)
        const newAttempt = {
          id: attempts.length + 1,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          blocks: [...workspaceBlocks],
          success,
        };
        setAttempts(prev => [...prev, newAttempt]);

        return;
      }

      const blk = workspaceBlocks[stepCount];
      stepCount++;

      if (blk.id.includes('maju')) {
        if (direction === 'RIGHT' && currentX < gridSize - 1) currentX += 1;
        else if (direction === 'DOWN' && currentY < gridSize - 1) currentY += 1;
        else if (direction === 'LEFT' && currentX > 0) currentX -= 1;
        else if (direction === 'UP' && currentY > 0) currentY -= 1;
      } else if (blk.id.includes('kanan')) {
        if (direction === 'RIGHT') direction = 'DOWN';
        else if (direction === 'DOWN') direction = 'LEFT';
        else if (direction === 'LEFT') direction = 'UP';
        else if (direction === 'UP') direction = 'RIGHT';
      } else if (blk.id.includes('kiri')) {
        if (direction === 'RIGHT') direction = 'UP';
        else if (direction === 'UP') direction = 'LEFT';
        else if (direction === 'LEFT') direction = 'DOWN';
        else if (direction === 'DOWN') direction = 'RIGHT';
      }

      setCharPos({ x: currentX, y: currentY });
      setExecutionLog((prev) => [...prev, `▸ [Langkah ${stepCount}]: ${blk.text}`]);
    }, 500);
  };

  if (!currentChallenge) {
    return (
      <div className="glass-card p-12 rounded-3xl text-center border border-slate-200/80 bg-white shadow-lg space-y-3">
        <span className="text-3xl animate-bounce block">🎮</span>
        <p className="text-sm font-black text-slate-700">Mempersiapkan Lab Tantangan Coding...</p>
        <p className="text-xs text-slate-400 font-semibold">Tantangan computational thinking sedang diselaraskan dengan materi pelajaran.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 shadow-lg animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl border border-amber-200 shadow-sm">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
              Langkah 7: Computational Thinking & Visual Plug Coding
            </span>
            <h3 className="font-heading text-xl font-extrabold text-slate-900">
              💻 Visual Plug-and-Play Coding Challenges
            </h3>
          </div>
        </div>

        <button
          onClick={onNext}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition-colors"
        >
          <span>Lanjut ke HOTS Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Teacher Configured Challenge Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Pilih Tantangan Coding (Diatur Guru Mata Pelajaran):</span>
          </span>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            {allChallenges.length} Tantangan Aktif
          </span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allChallenges.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setActiveChallengeIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                activeChallengeIndex === idx
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{ch.characterIcon || '🤖'}</span>
              <span>{ch.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mission Goal Card */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-heading font-extrabold text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1">
            <span>🎯</span>
            <span>Target Misi Algoritma:</span>
          </p>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
            Target Ideal: {currentChallenge.allowedBlocksCount || 8} Balok
          </span>
        </div>
        <p className="text-xs font-bold leading-relaxed text-amber-900">
          {currentChallenge.targetGoal || 'Susun balok logika untuk mengarahkan karakter mencapai target!'}
        </p>
      </div>

      {/* Workspace & Interactive Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Available Plug Blocks Palette */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-extrabold text-slate-700 block">
            🧩 Balok Instruksi Tersedia (Klik untuk Tambah):
          </span>
          <div className="space-y-2">
            {availableBlocks.map((blk) => (
              <button
                key={blk.id}
                onClick={() => handleAddBlock(blk)}
                className={`w-full p-3 rounded-2xl text-left font-mono text-xs font-bold text-white shadow-sm transition-all cursor-pointer flex items-center justify-between ${blk.color} hover:scale-[1.02] active:scale-95`}
              >
                <span className="flex items-center gap-2">
                  <span>{blk.text}</span>
                </span>
                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-sans">
                  + Tambah
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Workspace Editor */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700">
              📝 Area Kerja Program ({workspaceBlocks.length} Balok):
            </span>
            <button
              onClick={() => {
                setWorkspaceBlocks([]);
                setTestResult(null);
                setCharPos(startPos);
                setExecutionLog([]);
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="min-h-[220px] p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            {workspaceBlocks.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-slate-500 font-mono text-xs italic text-center p-4">
                Klik balok di sebelah kiri untuk mulai menyusun urutan Plug Coding...
              </div>
            ) : (
              workspaceBlocks.map((blk, idx) => (
                <div
                  key={`${blk.id}-${idx}`}
                  onClick={() => handleRemoveBlock(blk.id, idx)}
                  className={`p-2.5 rounded-xl font-mono text-xs font-bold text-white cursor-pointer flex items-center justify-between shadow-sm hover:opacity-90 transition-opacity ${blk.color}`}
                  title="Klik untuk menghapus balok ini"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-black/20 text-center leading-5 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{blk.text}</span>
                  </span>
                  <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">
                    ✕
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            disabled={workspaceBlocks.length === 0 || isRunning}
            onClick={handleRunCode}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Play className={`w-4 h-4 fill-white ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Mengeksekusi Algoritma...' : 'Uji & Jalankan Algoritma'}</span>
          </button>
        </div>

        {/* Right: Visual Interactive Grid Simulator */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-extrabold text-slate-700 block">
            🎮 Simulator Papan Visual Sawah / Lab:
          </span>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
            {/* Grid Map */}
            <div className="grid grid-cols-4 gap-2 aspect-square max-w-[240px] mx-auto bg-slate-950 p-2 rounded-xl border border-slate-800">
              {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                const x = i % gridSize;
                const y = Math.floor(i / gridSize);

                const isChar = charPos.x === x && charPos.y === y;
                const isTarget = targetPos.x === x && targetPos.y === y;
                const isObstacle = obstacles.some((obs) => obs.x === x && obs.y === y);

                return (
                  <div
                    key={i}
                    className={`rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${
                      isChar
                        ? 'bg-amber-400 border-amber-300 scale-105 shadow-lg animate-bounce'
                        : isTarget
                        ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                        : isObstacle
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-slate-900 border-slate-800/80'
                    }`}
                  >
                    {isChar ? (
                      <span>{charIcon}</span>
                    ) : isTarget ? (
                      <span>{currentChallenge.subjectId === 'matematika' ? '🌳' : '🌾'}</span>
                    ) : isObstacle ? (
                      <span>🪨</span>
                    ) : (
                      <span className="text-[9px] text-slate-700 font-mono">({x},{y})</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Real-time execution log */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 h-20 overflow-y-auto font-mono text-[10px] space-y-1 text-emerald-400">
              {executionLog.length === 0 ? (
                <p className="text-slate-600 italic">Log eksekusi gerakan robot akan muncul di sini...</p>
              ) : (
                executionLog.map((log, lIdx) => <p key={lIdx}>{log}</p>)
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Test Execution Result */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md animate-fadeIn ${
            testResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          )}
          <div className="space-y-0.5">
            <h4 className="font-heading font-extrabold text-xs">
              {testResult.success ? 'Misi Coding Berhasil!' : 'Misi Belum Selesai'}
            </h4>
            <p className="text-xs font-medium leading-relaxed">{testResult.message}</p>
          </div>
        </div>
      )}

      {/* Attempts History (Riwayat Percobaan & Hasil Belajar) */}
      {attempts.length > 0 && (
        <div className="mt-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Riwayat Kesempatan Percobaan Anda ({attempts.length})</span>
          </h4>
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            Semua hasil percobaan Anda tersimpan di bawah ini. Anda dapat mengklik tombol **"Pasang Balok Ulang"** pada percobaan mana saja untuk melanjutkan atau memperbaikinya!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {attempts.map((att) => (
              <div
                key={att.id}
                onClick={() => {
                  setWorkspaceBlocks(att.blocks);
                  setTestResult(null);
                  setCharPos(startPos);
                  setExecutionLog([`🔄 Memuat Balok dari Percobaan #${att.id}`]);
                }}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                  att.success ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300' : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 font-bold">
                    <span className="text-slate-800">Percobaan #{att.id}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{att.timestamp}</span>
                  </div>
                  <p className="text-[10px] font-mono font-semibold text-indigo-700 line-clamp-1 mb-2">
                    {att.blocks.map(b => b.text.split(' ')[0]).join(' ➔ ')}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${att.success ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'}`}>
                    {att.success ? '🟢 Sukses' : '🔴 Perlu Diperbaiki'}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold hover:underline">Pasang Balok Ulang ↩</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Lanjut ke HOTS Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
