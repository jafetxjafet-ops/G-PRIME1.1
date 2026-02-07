
import React from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockLevel: number;
  icon: string;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Hombre de Acero', description: 'Levanta un total de 1000kg en volumen acumulado.', unlockLevel: 2, icon: 'fa-shield-halved', color: 'text-cyan-400' },
  { id: '2', title: 'Titán del Olimpo', description: 'Registra una racha de 7 días consecutivos.', unlockLevel: 5, icon: 'fa-bolt', color: 'text-amber-400' },
  { id: '3', title: 'Elite Carmín', description: 'Alcanza el rango 20 en 5 ejercicios.', unlockLevel: 10, icon: 'fa-gem', color: 'text-rose-500' },
];

interface AchievementsViewProps {
  level: number;
  onBack: () => void;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ level, onBack }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-500 pb-20">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-4 glass-card rounded-2xl text-white/30 hover:text-white transition-all">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">LOGROS <span className="text-cyan-400 shadow-[0_0_10px_#22d3ee]">DE ÉLITE</span></h2>
          <p className="text-white/40 font-medium text-sm">Desbloquea insignias exclusivas al aumentar tu nivel de guerrero.</p>
        </div>
      </div>

      <div className="tutorial-achievement-importance grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {ACHIEVEMENTS.map((achievement) => {
          const isLocked = level < achievement.unlockLevel;
          return (
            <div key={achievement.id} className={`relative overflow-hidden rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all ${isLocked ? 'glass-card grayscale border-dashed border-2 border-white/5 opacity-40' : 'glass-card border-l-4 border-cyan-400'}`}>
              <div className={`w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 ${isLocked ? 'opacity-20' : achievement.color}`}><i className={`fa-solid ${achievement.icon} text-4xl`}></i></div>
              <h3 className={`text-2xl font-black uppercase italic tracking-tighter ${isLocked ? 'text-white/20' : 'text-[#F5F5F5]'}`}>{isLocked ? 'PRÓXIMAMENTE' : achievement.title}</h3>
              <p className={`text-xs font-medium leading-relaxed ${isLocked ? 'text-white/5' : 'text-white/40'}`}>{isLocked ? '???' : achievement.description}</p>
              <div className="pt-6 border-t border-white/5 mt-4"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A059]">{isLocked ? `NV. ${achievement.unlockLevel}` : 'DESBLOQUEADO'}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsView;
