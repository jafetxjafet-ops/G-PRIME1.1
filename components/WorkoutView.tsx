
import { Exercise, WorkoutExercise, WorkoutSet, MuscleGroup, WorkoutRecord, Goal, ExpBreakdown, ExerciseSnapshot, ExerciseMetric } from '../types';
import React, { useState, useEffect, useMemo } from 'react';
import { EXERCISES_DATABASE } from '../constants';
import { calculateRank, RANK_NAMES, getRankIcon, getRankColor } from '../utils/rankSystem';

interface WorkoutViewProps {
  activeGoal?: Goal;
  streak: number;
  onFinish: (record: Omit<WorkoutRecord, 'id' | 'date'>, expBreakdown: ExpBreakdown) => void;
  onCancel: () => void;
  workoutHistory?: WorkoutRecord[];
}

const WorkoutView: React.FC<WorkoutViewProps> = ({ activeGoal, streak, onFinish, onCancel, workoutHistory = [] }) => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<MuscleGroup | 'Todos'>('Todos');
  const [startTime] = useState(Date.now());
  const [duration, setDuration] = useState('00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Date.now() - startTime;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const filteredLibrary = useMemo(() => {
    return EXERCISES_DATABASE.filter(ex => {
      const matchSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMuscle = selectedMuscleFilter === 'Todos' || ex.muscleGroup === selectedMuscleFilter;
      return matchSearch && matchMuscle;
    });
  }, [searchTerm, selectedMuscleFilter]);

  const addExercise = (ex: Exercise) => {
    if (exercises.find(item => item.id === ex.id)) return;
    setExercises(prev => [...prev, { ...ex, sets: [{ weight: 0, reps: 0, seconds: 0 }] }]);
  };

  const removeExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const addSet = (idx: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i === idx) {
        const lastSet = ex.sets[ex.sets.length - 1];
        // Duplicar exactamente la última serie registrada
        return { 
          ...ex, 
          sets: [...ex.sets, { ...lastSet }] 
        };
      }
      return ex;
    }));
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof WorkoutSet, val: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i === exIdx) {
        const newSets = [...ex.sets];
        newSets[setIdx] = { ...newSets[setIdx], [field]: val };
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const validateResults = () => {
    let volumeExp = 0;
    let loadBonusTotal = 0;
    let prBonusTotal = 0;
    let goalProgressionBonusTotal = 0;
    let totalTimeUnderTension = 0;
    const snapshots: ExerciseSnapshot[] = [];

    let metWeeklyGoalInThisWorkout = false;

    exercises.forEach(ex => {
      let bestWeight = 0;
      let bestReps = 0;
      let bestSeconds = 0;
      let exTotalReps = 0;
      let exSetsCount = ex.sets.length;
      let exTotalWeightWeightBonus = 0;

      ex.sets.forEach(s => {
        const w = s.weight || 0;
        const r = s.reps || 0;
        const sec = s.seconds || 0;
        
        exTotalReps += r;
        exTotalWeightWeightBonus += (w * 0.035);
        totalTimeUnderTension += sec;

        if (ex.metricType === ExerciseMetric.REPS) {
          if (w > bestWeight || (w === bestWeight && r > bestReps)) {
            bestWeight = w;
            bestReps = r;
          }
        } else if (ex.metricType === ExerciseMetric.TIME) {
          if (sec > bestSeconds) bestSeconds = sec;
        } else if (ex.metricType === ExerciseMetric.TIME_WEIGHT) {
          if (sec * w > bestSeconds * bestWeight) {
            bestWeight = w;
            bestSeconds = sec;
          }
        }
      });

      const historicalRecords = workoutHistory.filter(r => r.topExerciseName === ex.name);
      const absoluteMaxWeight = historicalRecords.reduce((max, r) => Math.max(max, r.topWeight), 0);
      
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const lastWeekRecords = historicalRecords.filter(r => new Date(r.date) <= sevenDaysAgo);
      const lastWeekMaxWeight = lastWeekRecords.length > 0 ? Math.max(...lastWeekRecords.map(r => r.topWeight)) : 0;

      let currentLoadBonus = 0;
      if (bestWeight > lastWeekMaxWeight && lastWeekMaxWeight > 0) {
        currentLoadBonus = (bestWeight - lastWeekMaxWeight) * 1.5;
        loadBonusTotal += currentLoadBonus;
      }

      let isPR = false;
      if (bestWeight > absoluteMaxWeight && absoluteMaxWeight > 0) {
        prBonusTotal += 5;
        isPR = true;
      }

      let isGoalProgression = false;
      if (activeGoal) {
        const isPartOfGoal = activeGoal.exercises.some(ge => ge.name === ex.name);
        if (isPartOfGoal && bestWeight > absoluteMaxWeight) {
          if (!metWeeklyGoalInThisWorkout) {
            goalProgressionBonusTotal += 10;
            metWeeklyGoalInThisWorkout = true;
          }
          isGoalProgression = true;
        }
      }

      const oldWeight = absoluteMaxWeight || 0;
      const oldRank = calculateRank(ex.rankArchetype, ex.metricType, oldWeight, 1, 0);
      const newRank = calculateRank(ex.rankArchetype, ex.metricType, bestWeight, bestReps, bestSeconds);
      
      let exBaseExp = (exTotalReps * 0.15) + (exSetsCount * 1.5) + exTotalWeightWeightBonus;
      volumeExp += exBaseExp;

      snapshots.push({
        exerciseId: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        archetype: ex.rankArchetype,
        metricType: ex.metricType,
        expEarned: Math.round(exBaseExp + currentLoadBonus + (isPR ? 5 : 0)),
        oldWeight,
        newWeight: bestWeight,
        oldReps: 1,
        newReps: bestReps,
        oldSeconds: 0,
        newSeconds: bestSeconds,
        didRankUp: newRank > oldRank,
        isPR,
        isGoalProgression
      });
    });

    let streakMult = 1;
    if (streak >= 5 && streak <= 10) streakMult = 1.1;
    else if (streak > 10) streakMult = 1.2;

    const routineBonus = 6;
    const totalExpEarned = Math.round((volumeExp + routineBonus + loadBonusTotal + prBonusTotal + goalProgressionBonusTotal) * streakMult);

    let totalVolume = 0;
    let topWeight = 0;
    let topExerciseName = "N/A";
    exercises.forEach(ex => {
      ex.sets.forEach(s => {
        const w = s.weight || 0;
        const r = s.reps || 0;
        totalVolume += (w * r);
        if (w > topWeight) {
          topWeight = w;
          topExerciseName = ex.name;
        }
      });
    });

    onFinish({
      totalVolume,
      exerciseCount: exercises.length,
      topExerciseName,
      topWeight,
      totalTimeUnderTension
    }, {
      volumeExp: Math.round(volumeExp),
      goalsBonus: routineBonus,
      loadBonus: Math.round(loadBonusTotal),
      prBonus: prBonusTotal,
      goalProgressionBonus: goalProgressionBonusTotal,
      streakMultiplier: streakMult,
      totalExpEarned,
      exerciseSnapshots: snapshots
    });
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#F5F5F5]">SESIÓN <span className="accent-text">ACTIVA</span></h2>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-clock accent-text"></i> DURACIÓN: {duration}
          </p>
        </div>
        <button onClick={onCancel} className="text-white/20 hover:text-white transition-colors">
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>
      </div>

      <div className="space-y-4">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <i className="fa-solid fa-magnifying-glass text-white/20"></i>
          <input 
            type="text" 
            placeholder="Buscar ejercicio..."
            className="bg-transparent border-none outline-none w-full font-bold text-sm text-[#F5F5F5] placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="tutorial-filters flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button onClick={() => setSelectedMuscleFilter('Todos')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedMuscleFilter === 'Todos' ? 'accent-bg text-white border-transparent' : 'bg-white/5 text-white/30 border-white/5'}`}>TODOS</button>
          {Object.values(MuscleGroup).map(m => (
            <button key={m} onClick={() => setSelectedMuscleFilter(m)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedMuscleFilter === m ? 'accent-bg text-white border-transparent' : 'bg-white/5 text-white/30 border-white/5'}`}>{m}</button>
          ))}
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {filteredLibrary.slice(0, 20).map(ex => {
            const isAdded = exercises.some(item => item.id === ex.id);
            return (
              <button key={ex.id} onClick={() => addExercise(ex)} className={`flex-shrink-0 w-48 p-4 rounded-2xl border transition-all text-left space-y-2 ${isAdded ? 'accent-border bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{ex.muscleGroup}</span>
                </div>
                <p className="font-black italic uppercase text-[11px] leading-tight text-white/80 h-8 line-clamp-2">{ex.name}</p>
                <p className="text-[8px] font-medium text-white/20 line-clamp-1 italic">{ex.description}</p>
                <div className={`mt-2 py-1.5 rounded-lg text-[8px] font-black uppercase text-center border ${isAdded ? 'accent-bg text-white border-transparent' : 'text-white/20 border-white/5'}`}>{isAdded ? 'AÑADIDO' : 'AÑADIR'}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {exercises.map((ex, exIdx) => (
          <div key={ex.id} className="glass-card rounded-[2rem] overflow-hidden border border-white/5 animate-in slide-in-from-bottom-4">
            <div className="bg-white/5 p-5 flex justify-between items-center border-b border-white/5">
              <div>
                <h4 className="font-black italic uppercase text-sm tracking-tight text-[#F5F5F5]">{ex.name}</h4>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">{ex.muscleGroup}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => addSet(exIdx)} className="text-[9px] font-black uppercase tracking-widest accent-text">+ SERIE (DUPLICAR)</button>
                <button onClick={() => removeExercise(ex.id)} className="text-white/10 hover:text-red-400 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="grid grid-cols-12 gap-3 items-center group">
                  <div className="col-span-1 text-center text-[10px] font-black text-white/10 italic">#{setIdx + 1}</div>
                  
                  {ex.metricType !== ExerciseMetric.TIME && (
                    <div className="col-span-4 flex items-center gap-2">
                       <input type="number" placeholder="KG" className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-center text-sm font-black text-[#F5F5F5] focus:matte-border-active outline-none placeholder:text-white/5" value={set.weight || ''} onChange={(e) => updateSet(exIdx, setIdx, 'weight', Number(e.target.value))} />
                    </div>
                  )}

                  {ex.metricType === ExerciseMetric.REPS ? (
                    <div className="col-span-4 flex items-center gap-2">
                      <input type="number" placeholder="REPS" className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-center text-sm font-black text-[#F5F5F5] focus:matte-border-active outline-none placeholder:text-white/5" value={set.reps || ''} onChange={(e) => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))} />
                    </div>
                  ) : (
                    <div className={ex.metricType === ExerciseMetric.TIME ? 'col-span-8' : 'col-span-4'}>
                      <input type="number" placeholder="SEG" className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-center text-sm font-black text-[#F5F5F5] focus:matte-border-active outline-none placeholder:text-white/5" value={set.seconds || ''} onChange={(e) => updateSet(exIdx, setIdx, 'seconds', Number(e.target.value))} />
                    </div>
                  )}
                  
                  <div className="col-span-3 flex justify-end">
                    <button onClick={() => updateSet(exIdx, setIdx, ex.metricType === ExerciseMetric.REPS ? 'reps' : 'seconds', 0)} className="w-10 h-10 rounded-xl bg-white/5 text-white/10 hover:bg-red-900/20 hover:text-red-500 transition-all flex items-center justify-center border border-white/5"><i className="fa-solid fa-rotate-left text-xs"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {exercises.length > 0 && (
        <div className="fixed bottom-10 left-0 right-0 px-6 flex flex-col items-center gap-4 z-40">
          <button onClick={validateResults} className="accent-btn text-white w-full max-w-sm py-4 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl border border-white/10">FINALIZAR ENTRENAMIENTO</button>
        </div>
      )}
    </div>
  );
};

export default WorkoutView;
