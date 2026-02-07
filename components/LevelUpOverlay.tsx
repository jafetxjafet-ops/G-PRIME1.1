
import React, { useEffect, useState } from 'react';
import { getRankColor, RANK_NAMES } from '../utils/rankSystem';

interface LevelUpOverlayProps {
  level: number;
  onClose: () => void;
}

const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ level, onClose }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Feedback háptico (vibración)
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 30, 100, 30, 500]);
    }
    
    // Sonido (Opcional - AudioContext)
    
    setTimeout(() => setShowContent(true), 100);
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const rankColor = getRankColor(level);
  const rankName = RANK_NAMES[Math.min(19, level - 1)];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-3xl overflow-hidden">
      {/* Partículas de fondo (CSS pura) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white/10 rounded-full animate-pulse"
            style={{
              width: Math.random() * 4 + 'px',
              height: Math.random() * 4 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDuration: Math.random() * 3 + 2 + 's',
              animationDelay: Math.random() * 2 + 's'
            }}
          ></div>
        ))}
      </div>

      <div className={`relative z-10 transition-all duration-1000 transform ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div 
              className="w-48 h-48 rounded-[3rem] bg-black border-4 flex items-center justify-center text-7xl font-black italic shadow-2xl animate-bounce-slow"
              style={{ borderColor: rankColor, color: rankColor, boxShadow: `0 0 50px ${rankColor}44` }}
            >
              {level}
            </div>
            <div className="absolute -inset-4 border-2 border-white/5 rounded-[3.5rem] animate-ping opacity-20"></div>
          </div>

          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2">¡NIVEL <span className="accent-text">INCREMENTADO!</span></h2>
          <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.5em] mb-10">POTENCIA TÉCNICA NIVEL {level}</p>
          
          <div className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5 scale-110">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">NUEVO RANGO DESBLOQUEADO</p>
             <p className="text-2xl font-black italic uppercase tracking-tight text-white" style={{ color: rankColor }}>{rankName}</p>
          </div>

          <div className="mt-16 flex gap-2">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: i * 0.1 + 's' }}></div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Impacto de luz central */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-1000 pointer-events-none ${showContent ? 'opacity-0' : 'opacity-100'}`}></div>
    </div>
  );
};

export default LevelUpOverlay;
