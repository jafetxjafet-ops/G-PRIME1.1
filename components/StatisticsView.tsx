
import React, { useMemo } from 'react';
import { WorkoutRecord, MuscleGroup, AppSettings } from '../types';
import { EXERCISES_DATABASE } from '../constants';

interface StatisticsViewProps {
  workoutHistory: WorkoutRecord[];
  onBack: () => void;
  settings: AppSettings;
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ workoutHistory, onBack, settings }) => {
  const stats = useMemo(() => {
    const totalVolume = workoutHistory.reduce((acc, curr) => acc + curr.totalVolume, 0);
    const totalWorkouts = workoutHistory.length;
    
    const muscleMaxWeights: Record<string, number> = {
      [MuscleGroup.PECHO]: 0,
      [MuscleGroup.ESPALDA]: 0,
      [MuscleGroup.PIERNAS]: 0,
      [MuscleGroup.HOMBROS]: 0,
      [MuscleGroup.BRAZOS]: 0,
      [MuscleGroup.ABDOMEN]: 0,
    };

    workoutHistory.forEach(record => {
      const exercise = EXERCISES_DATABASE.find(ex => ex.name === record.topExerciseName);
      if (exercise) {
        const group = exercise.muscleGroup;
        if (record.topWeight > muscleMaxWeights[group]) muscleMaxWeights[group] = record.topWeight;
      }
    });

    const maxWeightOverall = Math.max(...Object.values(muscleMaxWeights), 1);
    const symmetryData = Object.entries(muscleMaxWeights).map(([group, weight]) => ({
      group,
      weight,
      percentage: (weight / maxWeightOverall) * 100
    }));

    const prRecord = workoutHistory.reduce((prev, curr) => 
      (curr.topWeight > prev.topWeight) ? curr : prev, 
      { topWeight: 0, topExerciseName: 'N/A' } as any
    );

    const userWeight = settings.weight || 70;
    const avgVolume = totalWorkouts > 0 ? totalVolume / totalWorkouts : 0;
    const gPowerIndex = (avgVolume / userWeight).toFixed(2);

    return {
      totalVolume,
      totalWorkouts,
      prWeight: prRecord.topWeight,
      prExercise: prRecord.topExerciseName,
      gPowerIndex,
      symmetryData,
      dominantGroup: symmetryData.reduce((prev, current) => 
        (current.weight > prev.weight) ? current : prev, symmetryData[0]
      )
    };
  }, [workoutHistory, settings.weight]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 pb-20">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-4 glass-card rounded-2xl text-white/30 hover:text-white transition-all">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">ESTADÍSTICAS <span className="accent-text">G-PRIME</span></h2>
          <p className="text-white/40 font-medium text-sm">Análisis biomecánico y fuerza relativa.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] border-l-4 accent-border flex flex-col gap-2">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">G-POWER INDEX</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-[#F5F5F5]">{stats.gPowerIndex}</span>
            <span className="text-sm font-bold text-white/20 uppercase">PTS</span>
          </div>
        </div>
        <div className="tutorial-rank-evolution glass-card p-8 rounded-[2.5rem] flex flex-col gap-2">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">RÉCORD MÁXIMO</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black accent-text tracking-tighter">{stats.prWeight}</span>
            <span className="text-sm font-bold text-white/20 uppercase">KG</span>
          </div>
        </div>
      </div>

      <div className="tutorial-symmetry-graph glass-card p-10 rounded-[3rem] space-y-8">
        <h3 className="text-xl font-black italic uppercase text-white/80">Balance Muscular</h3>
        <div className="space-y-6">
          {stats.symmetryData.map((item) => (
            <div key={item.group} className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{item.group}</span>
                <span className="text-xs font-black text-[#F5F5F5]">{item.weight} kg</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full accent-bg rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
