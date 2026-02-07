
import React, { useState, useMemo } from 'react';
import { MuscleGroup, Exercise, CombatSpecialty, WorkoutRecord } from '../types';
import { EXERCISES_DATABASE } from '../constants';
import { getRankColor, getRankIcon, calculateRank, getThresholdForRank, getRankEffectClass, RANK_NAMES } from '../utils/rankSystem';

interface ExerciseLibraryProps {
  workoutHistory?: WorkoutRecord[];
}

const SpecialtyIcons: Record<CombatSpecialty, string> = {
  [CombatSpecialty.BOXEO]: 'fa-hand-fist',
  [CombatSpecialty.MMA]: 'fa-hand-back-fist',
  [CombatSpecialty.JUDO_WRESTLING]: 'fa-user-ninja',
  [CombatSpecialty.BJJ]: 'fa-person-half-dress',
  [CombatSpecialty.KICKBOXING]: 'fa-shoe-prints',
  [CombatSpecialty.CALISTENIA]: 'fa-person-pull-up'
};

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ workoutHistory = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'Todos'>('Todos');
  const [specialtyFilter, setSpecialtyFilter] = useState<CombatSpecialty | 'Todos'>('Todos');

  const muscleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(MuscleGroup).forEach(group => {
      counts[group] = EXERCISES_DATABASE.filter(ex => ex.muscleGroup === group).length;
    });
    return counts;
  }, []);

  const specialtyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(CombatSpecialty).forEach(s => {
      counts[s] = EXERCISES_DATABASE.filter(ex => ex.specialties?.includes(s)).length;
    });
    return counts;
  }, []);

  const getExerciseStats = (name: string) => {
    const records = workoutHistory.filter(r => r.topExerciseName === name);
    const maxWeight = records.reduce((max, r) => Math.max(max, r.topWeight), 0);
    return { maxWeight };
  };

  const filtered = useMemo(() => {
    return EXERCISES_DATABASE.filter(ex => {
      const matchSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = filter === 'Todos' || ex.muscleGroup === filter;
      const matchSpecialty = specialtyFilter === 'Todos' || ex.specialties?.includes(specialtyFilter as CombatSpecialty);
      return matchSearch && matchFilter && matchSpecialty;
    });
  }, [searchTerm, filter, specialtyFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">ENCICLOPEDIA <span className="accent-text">G</span></h2>
          <p className="text-white/40 font-medium">Buscador técnico especializado en fuerza y combate.</p>
        </div>
        <div className="relative min-w-[300px]">
          <input 
            type="text" 
            placeholder="Buscar ejercicio..."
            className="w-full bg-white/5 border border-white/10 focus:matte-border-active outline-none pl-12 pr-4 py-4 rounded-2xl transition-all font-bold text-[#F5F5F5] placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-white/20"></i>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block ml-2">Grupo Muscular</label>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setFilter('Todos')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filter === 'Todos' ? 'accent-bg text-white border-transparent shadow-md' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
          >
            TODOS ({EXERCISES_DATABASE.length})
          </button>
          {Object.values(MuscleGroup).map(m => (
            <button
              key={m}
              onClick={() => setFilter(m as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filter === m ? 'accent-bg text-white border-transparent shadow-md' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
            >
              {m} ({muscleCounts[m]})
            </button>
          ))}
        </div>

        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block ml-2">Especialidad de Combate</label>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSpecialtyFilter('Todos')}
            className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${specialtyFilter === 'Todos' ? 'matte-border-active bg-white/5 text-white' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'}`}
          >
            TODOS
          </button>
          {Object.values(CombatSpecialty).map(s => (
            <button
              key={s}
              onClick={() => setSpecialtyFilter(s)}
              className={`px-6 py-3 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${specialtyFilter === s ? 'matte-border-active bg-white/5 text-white' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'}`}
            >
              <i className={`fa-solid ${SpecialtyIcons[s]} text-xs ${specialtyFilter === s ? 'accent-text' : 'opacity-40'}`}></i>
              {s} ({specialtyCounts[s]})
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(ex => {
          const stats = getExerciseStats(ex.name);
          const rankLevel = calculateRank(ex.rankArchetype, ex.metricType, stats.maxWeight);
          const nextRankThreshold = getThresholdForRank(ex.rankArchetype, ex.metricType, rankLevel);
          const currentProgress = (stats.maxWeight / nextRankThreshold) * 100;
          const rankColor = getRankColor(rankLevel);
          const rankName = RANK_NAMES[rankLevel - 1];
          const effectClass = getRankEffectClass(rankLevel);

          return (
            <div key={ex.id} className={`glass-card p-8 rounded-[2rem] glass-card-hover group relative overflow-hidden transition-all duration-300 ${effectClass}`}>
              <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                <i className={`fa-solid ${getRankIcon(rankLevel)} text-8xl`} style={{ color: rankColor }}></i>
              </div>
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-3">
                      <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 transition-colors" style={{ color: rankColor }}>
                        <i className={`fa-solid ${getRankIcon(rankLevel)} text-xl`}></i>
                      </div>
                      <div>
                         <p className="text-[8px] font-black uppercase tracking-widest text-white/30">RANGO TÉCNICO {rankLevel}</p>
                         <p className="text-sm font-black italic uppercase text-[#F5F5F5]">{rankName}</p>
                      </div>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-white/10 uppercase tracking-widest border border-white/5">{ex.muscleGroup}</span>
                </div>
              </div>
              
              <h4 className="text-2xl font-black italic uppercase tracking-tight mb-3 text-[#F5F5F5] group-hover:accent-text transition-colors">{ex.name}</h4>
              <p className="text-[10px] text-white/40 font-medium mb-4 italic line-clamp-2">{ex.description}</p>
              
              <div className="mt-4 space-y-2">
                 <div className="flex justify-between items-end px-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Progreso al Rango {rankLevel + 1}</span>
                    <span className="text-[10px] font-black text-white/50">{stats.maxWeight} / {nextRankThreshold} KG</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(100, currentProgress)}%`, backgroundColor: rankColor }}
                    ></div>
                 </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 mb-6">
                 {ex.specialties?.map(s => (
                   <span key={s} className="px-2 py-1 bg-black/40 text-[8px] font-black text-white/30 rounded-md border border-white/5 uppercase">
                      {s}
                   </span>
                 ))}
              </div>

              <button className="w-full py-4 bg-white/5 text-white/30 hover:accent-bg hover:text-white rounded-2xl font-black text-[9px] transition-all flex items-center justify-center gap-3 uppercase tracking-widest border border-white/5">
                DETALLES TÉCNICOS
                <i className="fa-solid fa-circle-info text-base"></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
