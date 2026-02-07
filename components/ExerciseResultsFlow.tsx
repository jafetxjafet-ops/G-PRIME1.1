
import React, { useState, useEffect } from 'react';
import { ExerciseSnapshot, AppSettings, ExerciseMetric } from '../types';
import { getRankIcon, getRankColor, RANK_NAMES, getRankProgress, calculateRank } from '../utils/rankSystem';

interface ExerciseResultsFlowProps {
  snapshots: ExerciseSnapshot[];
  settings: AppSettings;
  onComplete: () => void;
}

const ExerciseResultsFlow: React.FC<ExerciseResultsFlowProps> = ({ snapshots, settings, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [barProgress, setBarProgress] = useState(0);
  const [showRankUp, setShowRankUp] = useState(false);

  const currentSnapshot = snapshots[currentIndex];
  
  useEffect(() => {
    const oldProgress = getRankProgress(
      currentSnapshot.archetype, 
      currentSnapshot.metricType, 
      currentSnapshot.oldWeight, 
      currentSnapshot.oldReps, 
      currentSnapshot.oldSeconds
    );
    const newProgress = getRankProgress(
      currentSnapshot.archetype, 
      currentSnapshot.metricType, 
      currentSnapshot.newWeight, 
      currentSnapshot.newReps, 
      currentSnapshot.newSeconds
    );
    
    setBarProgress(oldProgress);
    setShowRankUp(false);

    const timer = setTimeout(() => {
      setBarProgress(newProgress);
      if (currentSnapshot.didRankUp) {
        setTimeout(() => setShowRankUp(true), 1000);
      }
    }, 500);

    const advanceTimer = setTimeout(() => {
        if (!currentSnapshot.didRankUp) {
            handleNext();
        }
    }, 6000);

    return () => {
        clearTimeout(timer);
        clearTimeout(advanceTimer);
    };
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < snapshots.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const currentRank = calculateRank(
    currentSnapshot.archetype, 
    currentSnapshot.metricType, 
    currentSnapshot.newWeight, 
    currentSnapshot.newReps, 
    currentSnapshot.newSeconds
  );

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 overflow-hidden">
      <div className="w-full max-w-sm animate-in zoom-in-95 duration-500">
        
        <div className={`glass-card p-10 rounded-[3.5rem] border-t-8 accent-border shadow-2xl relative text-center transition-all duration-700 ${showRankUp ? 'shadow-[0_0_50px_rgba(114,28,36,0.5)] scale-105' : ''}`}>
           
           {showRankUp && (
             <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[3.5rem]">
               <div className="absolute inset-0 bg-gradient-to-t from-accent-color/20 to-transparent animate-pulse"></div>
             </div>
           )}

           <div className="mb-8">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">PROGRESO DE FUERZA</p>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#F5F5F5] leading-tight">{currentSnapshot.name}</h2>
           </div>

           <div className="relative w-32 h-32 mx-auto mb-10">
              <div 
                className={`w-full h-full rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-5xl transition-all duration-700 ${showRankUp ? 'scale-125 border-accent-color' : ''}`}
                style={{ color: getRankColor(currentRank) }}
              >
                <i className={`fa-solid ${getRankIcon(currentRank)} ${showRankUp ? 'animate-bounce' : ''}`}></i>
              </div>
              
              {currentSnapshot.isPR && (
                <div className="absolute -bottom-2 -left-2 bg-amber-500 text-black text-[7px] font-black px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in zoom-in duration-700 delay-500">
                   NUEVO PR 🏆
                </div>
              )}

              {currentSnapshot.isGoalProgression && (
                <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-white text-[7px] font-black px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in zoom-in duration-700 delay-700">
                   META +10 🎯
                </div>
              )}

              {showRankUp && (
                <div className="absolute -top-4 -right-4 bg-accent-color text-white text-[8px] font-black px-3 py-1 rounded-full animate-bounce shadow-lg">
                  RANK UP!
                </div>
              )}
           </div>

           <div className="space-y-6 mb-10">
              <div className="flex justify-between items-end px-2">
                 <div className="text-left">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">EXP GANADA</p>
                    <p className="text-xl font-black accent-text">+{currentSnapshot.expEarned} EXP</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                      {currentSnapshot.metricType === ExerciseMetric.REPS ? 'MEJOR CARGA' : 'BAJO TENSIÓN'}
                    </p>
                    <p className="text-sm font-black text-white/80 italic">
                      {currentSnapshot.metricType === ExerciseMetric.REPS ? `${currentSnapshot.newWeight}kg x ${currentSnapshot.newReps}` : `${currentSnapshot.newSeconds} Seg`}
                    </p>
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ 
                        width: `${barProgress}%`, 
                        backgroundColor: settings.expBarColor 
                      }}
                    ></div>
                 </div>
                 <div className="flex justify-between text-[8px] font-black text-white/10 uppercase tracking-widest">
                    <span>{RANK_NAMES[currentRank-1]}</span>
                    <span>{currentRank < 20 ? RANK_NAMES[currentRank] : 'DIVINO'}</span>
                 </div>
              </div>
           </div>

           {showRankUp && (
             <div className="mb-8 animate-in fade-in slide-in-from-bottom-2">
                <h4 className="text-xl font-black accent-text italic uppercase tracking-tighter">¡POTENCIA INCREMENTADA!</h4>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Has alcanzado un nuevo rango técnico</p>
             </div>
           )}

           <button 
            onClick={handleNext}
            className="w-full accent-btn text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl"
           >
            {currentIndex === snapshots.length - 1 ? 'FINALIZAR RESUMEN' : 'SIGUIENTE EJERCICIO'}
           </button>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
             EJERCICIO {currentIndex + 1} DE {snapshots.length}
           </p>
           <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em] mt-2 italic">by Ludwig Feria</p>
        </div>

      </div>
    </div>
  );
};

export default ExerciseResultsFlow;
