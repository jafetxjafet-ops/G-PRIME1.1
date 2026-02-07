
import React, { useEffect, useState } from 'react';
import { Title } from '../types';

interface TitleUnlockOverlayProps {
  title: Title;
  onClose: () => void;
}

const TitleUnlockOverlay: React.FC<TitleUnlockOverlayProps> = ({ title, onClose }) => {
  const [show, setShow] = useState(false);
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 800]);
    }
    
    const startTimer = setTimeout(() => {
      setShow(true);
      setTimeout(() => setSparkle(true), 600);
    }, 50);
    
    const autoCloseTimer = setTimeout(onClose, 6000);
    
    return () => {
      clearTimeout(startTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [title, onClose]);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/98 backdrop-blur-3xl overflow-hidden animate-in fade-in duration-700">
      {/* Luz de fondo expansiva */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${show ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white opacity-5 blur-[150px] rounded-full animate-pulse-slow"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[80px]" style={{ backgroundColor: `${title.color}33` }}></div>
      </div>

      <div className="relative z-10 text-center flex flex-col items-center">
        <div className={`mb-10 transition-all duration-1000 ease-out transform ${show ? 'scale-100 rotate-[360deg] opacity-100' : 'scale-0 rotate-0 opacity-0'}`}>
           <div 
             className="w-40 h-40 rounded-[3rem] bg-black/40 backdrop-blur-xl border-2 flex items-center justify-center text-7xl shadow-2xl transition-all duration-500"
             style={{ borderColor: title.color, color: title.color, boxShadow: sparkle ? `0 0 60px ${title.color}88` : `0 0 20px ${title.color}22` }}
           >
              <i className={`fa-solid ${title.icon}`}></i>
           </div>
           
           {sparkle && (
             <div className="absolute -inset-4 border border-white/10 rounded-[3.5rem] animate-ping opacity-10"></div>
           )}
        </div>

        <div className={`space-y-4 transition-all duration-700 delay-500 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
           <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em]">LOGRO DE PRESTIGIO OBTENIDO</p>
           <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">TÍTULO <span style={{ color: title.color }}>REVELADO</span></h2>
           
           <div className="mt-8 p-10 glass-card rounded-[3rem] border border-white/5 bg-black/40 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-20"></div>
              <h3 className="text-5xl font-black italic uppercase text-white tracking-tight relative z-10">{title.name}</h3>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-3 relative z-10">LEGADO G-PRIME · CATEGORÍA: {title.category}</p>
           </div>

           <p className="text-sm font-bold text-white/40 italic max-w-xs mx-auto mt-8 leading-relaxed">
             "{title.description}"
           </p>
        </div>

        <button 
          onClick={onClose}
          className={`mt-16 px-12 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all transform duration-700 delay-1000 ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          EQUIPAR Y CONTINUAR
        </button>
      </div>

      {/* Flash inicial de impacto */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-300 pointer-events-none ${show ? 'opacity-0' : 'opacity-100'}`}></div>
    </div>
  );
};

export default TitleUnlockOverlay;
