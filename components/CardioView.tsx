
import React, { useState } from 'react';
import { MuscleGroup, Exercise, ExpBreakdown, ExerciseSnapshot } from '../types';
import { EXERCISES_DATABASE } from '../constants';

interface CardioViewProps {
  onFinish: (record: any, exp: ExpBreakdown) => void;
  onCancel: () => void;
  streak: number;
}

const CARDIO_EXERCISES = EXERCISES_DATABASE.filter(ex => ex.muscleGroup === MuscleGroup.CARDIO);

const CardioView: React.FC<CardioViewProps> = ({ onFinish, onCancel, streak }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');

  const getCardioIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('trotar')) return 'fa-person-running';
    if (n.includes('caminadora')) return 'fa-person-walking';
    if (n.includes('nadar') || n.includes('natación')) return 'fa-person-swimming';
    if (n.includes('bicicleta')) return 'fa-bicycle';
    return 'fa-bolt';
  };

  const handleFinish = () => {
    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    const totalSeconds = (mins * 60) + secs;

    if (!selectedExercise || totalSeconds <= 0) {
      alert("Por favor introduce un tiempo válido.");
      return;
    }

    // Fórmula: exp = (segundos) × 0.025
    const expEarned = Math.round(totalSeconds * 0.025);
    
    let streakMult = 1;
    if (streak >= 5 && streak <= 10) streakMult = 1.1;
    else if (streak > 10) streakMult = 1.2;

    const totalExp = Math.round(expEarned * streakMult);

    const snapshot: ExerciseSnapshot = {
      exerciseId: selectedExercise.id,
      name: selectedExercise.name,
      muscleGroup: selectedExercise.muscleGroup,
      archetype: selectedExercise.rankArchetype,
      metricType: selectedExercise.metricType,
      expEarned: totalExp,
      oldWeight: 0,
      newWeight: 0,
      oldReps: 0,
      newReps: 0,
      oldSeconds: 0, 
      newSeconds: totalSeconds,
      didRankUp: false, 
      isPR: false,
      isGoalProgression: false
    };

    onFinish({
      totalVolume: 0,
      exerciseCount: 1,
      topExerciseName: selectedExercise.name,
      topWeight: 0,
      totalTimeUnderTension: totalSeconds
    }, {
      volumeExp: expEarned,
      goalsBonus: 0,
      loadBonus: 0,
      prBonus: 0,
      goalProgressionBonus: 0,
      streakMultiplier: streakMult,
      totalExpEarned: totalExp,
      exerciseSnapshots: [snapshot]
    });
  };

  if (!selectedExercise) {
    return (
      <div className="space-y-8 animate-in fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-[#F5F5F5]">REGISTRO <span className="accent-text">CARDIO</span></h2>
          <button onClick={onCancel} className="text-white/20 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>
        
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Selecciona tu disciplina de resistencia</p>
        
        <div className="grid grid-cols-2 gap-4">
          {CARDIO_EXERCISES.map(ex => (
            <button 
              key={ex.id} 
              onClick={() => setSelectedExercise(ex)}
              className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center gap-4 group hover:matte-border-active transition-all border border-white/5"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-3xl text-white/20 group-hover:accent-text transition-colors">
                 <i className={`fa-solid ${getCardioIcon(ex.name)}`}></i>
              </div>
              <p className="font-black italic uppercase text-sm text-white/80">{ex.name}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in zoom-in-95 duration-500 flex flex-col items-center py-10">
      <div className="text-center space-y-2">
         <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">{selectedExercise.name}</h2>
         <p className="text-[10px] font-black accent-text uppercase tracking-[0.5em]">REGISTRO MANUAL DE TIEMPO</p>
      </div>

      <div className="glass-card p-10 rounded-[3rem] w-full max-w-sm space-y-8 border-t-4 accent-border">
         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block text-center">MINUTOS</label>
               <input 
                  type="number" 
                  placeholder="00" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-center text-3xl font-black text-white focus:matte-border-active outline-none placeholder:text-white/5"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  min="0"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block text-center">SEGUNDOS</label>
               <input 
                  type="number" 
                  placeholder="00" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-center text-3xl font-black text-white focus:matte-border-active outline-none placeholder:text-white/5"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  min="0"
                  max="59"
               />
            </div>
         </div>

         <div className="pt-4">
            <button 
              onClick={handleFinish}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95"
            >
              TERMINAR CARDIO
            </button>
         </div>
      </div>

      <button 
        onClick={() => setSelectedExercise(null)} 
        className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
      >
        <i className="fa-solid fa-rotate-left mr-2"></i> CAMBIAR EJERCICIO
      </button>

      <button 
        onClick={onCancel} 
        className="text-[10px] font-black text-red-500/40 uppercase tracking-widest hover:text-red-500 transition-colors"
      >
        CANCELAR REGISTRO
      </button>
    </div>
  );
};

export default CardioView;
