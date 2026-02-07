
import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';

interface WeeklyCardioSummaryProps {
  data: {
    days: number;
    bonus: number;
    bonusExp: number;
    oldTotal: number;
  };
  onClose: () => void;
  getLevelStats: (total: number) => any;
  settings: AppSettings;
}

const WeeklyCardioSummary: React.FC<WeeklyCardioSummaryProps> = ({ data, onClose, getLevelStats, settings }) => {
  const [show, setShow] = useState(false);
  const oldStats = getLevelStats(data.oldTotal);
  const newStats = getLevelStats(data.oldTotal + data.bonusExp);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 overflow-hidden animate-in fade-in duration-500">
      <div className={`w-full max-w-sm glass-card p-10 rounded-[4rem] border-t-8 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center transition-all duration-1000 transform ${show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        
        <div className="mb-8">
           <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-4xl text-emerald-500 mx-auto mb-6">
              <i className="fa-solid fa-calendar-check"></i>
           </div>
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">RESUMEN SEMANAL</p>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">BONUS DE <span className="text-emerald-500">RESISTENCIA</span></h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">DÍAS CARDIO</p>
              <p className="text-2xl font-black text-white">{data.days}/7</p>
           </div>
           <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">BONIFICACIÓN</p>
              <p className="text-2xl font-black text-emerald-500">+{data.bonus}%</p>
           </div>
        </div>

        <div className="mb-10 space-y-6">
           <div className="flex flex-col items-center">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">EXPERIENCIA EXTRA OBTENIDA</p>
              <p className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">+{data.bonusExp}</p>
              <p className="text-[10px] font-bold text-emerald-500/40 uppercase mt-2">G-CLOUD SYNC COMPLETE</p>
           </div>

           <div className="space-y-3">
              <div className="flex justify-between items-end px-2">
                 <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">PROGRESO DE NIVEL</span>
                 <span className="text-[9px] font-black text-emerald-500 uppercase">+{data.bonusExp} EXP</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                 <div 
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${newStats.expProgress}%` }}
                 ></div>
              </div>
              <div className="flex justify-between text-[8px] font-black text-white/10 uppercase tracking-widest">
                 <span>NV. {oldStats.level}</span>
                 <span>NV. {newStats.level}</span>
              </div>
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all active:scale-95"
        >
          ACEPTAR RECOMPENSA
        </button>

        <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em] mt-8 italic">
          RECUERDA: CADA LUNES SE REINICIA EL CONTADOR
        </p>
      </div>
    </div>
  );
};

export default WeeklyCardioSummary;
