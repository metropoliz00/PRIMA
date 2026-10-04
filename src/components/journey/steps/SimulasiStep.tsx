import React, { useState } from 'react';
import { Gamepad2, ArrowRight, RotateCcw, AlertCircle, CheckCircle2, Sliders } from 'lucide-react';

interface SimulasiStepProps {
  content: any;
  onNext: () => void;
}

export const SimulasiStep: React.FC<SimulasiStepProps> = ({ content, onNext }) => {
  const simType = content.type || 'ecosystem';

  // Ecosystem Simulation State
  const [grass, setGrass] = useState(content.initialData?.grass || 100);
  const [grasshopper, setGrasshopper] = useState(content.initialData?.grasshopper || 50);
  const [frog, setFrog] = useState(content.initialData?.frog || 20);
  const [snake, setSnake] = useState(content.initialData?.snake || 5);

  // Math Factors State
  const [numA, setNumA] = useState(content.initialData?.numA || 12);
  const [numB, setNumB] = useState(content.initialData?.numB || 18);

  // Calculate Ecosystem Status
  const calculateEcosystemBalance = () => {
    // Ideal ratio: Grass 80-120, Grasshopper 40-60, Frog 15-25, Snake 3-8
    if (grass < 30) return { status: 'danger', message: 'Rumput terlalu sedikit! Belalang kelaparan dan berkurang drastis.' };
    if (grasshopper > 90) return { status: 'warning', message: 'Populasi belalang terlalu banyak! Rumput habis gundul.' };
    if (frog < 5 && grasshopper > 70) return { status: 'warning', message: 'Katak berkurang, belalang melonjak tak terkendali!' };
    if (snake > 15) return { status: 'warning', message: 'Ular terlalu banyak, katak hampir punah.' };
    return { status: 'balanced', message: 'Ekosistem berada dalam Keseimbangan Harmonis! Semua populasi terjaga.' };
  };

  const simStatus = calculateEcosystemBalance();

  // Math Factors Helper
  const getGcd = (a: number, b: number): number => (b === 0 ? a : getGcd(b, a % b));
  const getLcm = (a: number, b: number): number => (a * b) / getGcd(a, b);

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Langkah 6: Simulasi Interaktif</span>
            <h3 className="font-heading text-xl font-bold text-slate-900">{content.title || 'Laboratorium Simulasi Digital'}</h3>
          </div>
        </div>

        <button
          onClick={onNext}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Lanjut ke Coding Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs font-semibold text-slate-600 leading-relaxed">
        {content.description || 'Simulasi interaktif modular ini memungkinkanmu bereksperimen dengan parameter secara langsung.'}
      </p>

      {/* RENDER SIMULATION MODULE BASED ON TYPE */}
      {simType === 'ecosystem' ? (
        <div className="space-y-6">
          
          {/* Status Indicator Banner */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            simStatus.status === 'balanced'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : simStatus.status === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {simStatus.status === 'balanced' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-heading font-extrabold text-sm">
                Status Ekosistem: {simStatus.status === 'balanced' ? 'Harmonis ✨' : 'Ketidakseimbangan Detected ⚠️'}
              </p>
              <p className="text-xs font-medium mt-0.5">{simStatus.message}</p>
            </div>
          </div>

          {/* Interactive Population Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">🌱 Rumput (Produsen)</span>
                <span className="text-emerald-600">{grass} Unit</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={grass}
                onChange={(e) => setGrass(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">🦗 Belalang (Konsumen I)</span>
                <span className="text-sky-600">{grasshopper} Ekor</span>
              </div>
              <input
                type="range"
                min={0}
                max={150}
                value={grasshopper}
                onChange={(e) => setGrasshopper(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">🐸 Katak (Konsumen II)</span>
                <span className="text-indigo-600">{frog} Ekor</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={frog}
                onChange={(e) => setFrog(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">🐍 Ular (Konsumen III)</span>
                <span className="text-amber-600">{snake} Ekor</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={snake}
                onChange={(e) => setSnake(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setGrass(100);
                setGrasshopper(50);
                setFrog(20);
                setSnake(5);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Parameter Ideal</span>
            </button>
          </div>

        </div>
      ) : (
        /* Math Factor Tree Simulator */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-4">
            <h4 className="font-heading font-bold text-base text-blue-900">
              Pohon Faktor & Kalkulator KPK / FPB
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Angka Pertama (A):</label>
                <input
                  type="number"
                  value={numA}
                  onChange={(e) => setNumA(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Angka Kedua (B):</label>
                <input
                  type="number"
                  value={numB}
                  onChange={(e) => setNumB(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-3 rounded-xl border border-blue-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500">KPK (Kelipatan Bersama)</span>
                <p className="font-heading font-black text-2xl text-indigo-600">{getLcm(numA, numB)}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500">FPB (Faktor Pembagi)</span>
                <p className="font-heading font-black text-2xl text-emerald-600">{getGcd(numA, numB)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span>Lanjut ke Coding Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
