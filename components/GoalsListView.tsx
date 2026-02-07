
import React from 'react';
import { Goal } from '../types';

interface GoalsListViewProps {
  goals: Goal[];
  activeGoalId: string | null;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onBack: () => void;
}

const GoalsListView: React.FC<GoalsListViewProps> = ({ goals, activeGoalId, onToggleGoal, onDeleteGoal, onBack }) => {
  const calculateDaysLeft = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const deadline = new Date(deadlineStr);
    const diff = deadline.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <button 
          onClick={onBack}
          className="p-4 glass-card rounded-2xl text-white/30 hover:text-white hover:accent-border transition-all"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">HISTORIAL <span className="accent-text">MATE</span></h2>
          <p className="text-white/40 font-medium">Gestiona tu rendimiento sin distracciones visuales.</p>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-20 text-center border-dashed border-2 border-white/5 flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10 text-4xl">
            <i className="fa-solid fa-box-open"></i>
          </div>
          <p className="font-bold text-white/30 uppercase tracking-widest">No hay metas archivadas</p>
          <button 
            onClick={onBack}
            className="accent-text hover:underline font-black text-xs uppercase tracking-widest mt-4"
          >
            VOLVER AL INICIO
          </button>
        </div>
      ) : (
        <div className="grid gap-8">
          {goals.map(goal => {
            const isActive = goal.id === activeGoalId;
            const daysLeft = calculateDaysLeft(goal.deadline);
            
            return (
              <div 
                key={goal.id} 
                className={`glass-card rounded-[2rem] transition-all overflow-hidden ${isActive ? 'matte-border-active' : 'border-white/5'}`}
              >
                <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between gap-8 bg-black/10">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="text-3xl font-black italic uppercase tracking-tight text-[#F5F5F5]">{goal.title}</h3>
                      {isActive && (
                        <span className="px-4 py-1.5 accent-bg text-white text-[10px] font-black uppercase rounded-xl shadow-md">ACTIVA</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-calendar accent-text"></i>
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                      <span className={`flex items-center gap-2 ${daysLeft < 7 ? 'text-red-300' : 'text-white/40'}`}>
                        <i className="fa-solid fa-clock"></i>
                        {daysLeft} DÍAS RESTANTES
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {!isActive && (
                      <button 
                        onClick={() => onToggleGoal(goal.id)}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border border-white/5"
                      >
                        ACTIVAR
                      </button>
                    )}
                    <button 
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-5 bg-white/5 text-white/20 hover:bg-red-900/40 hover:text-red-200 rounded-2xl transition-all border border-white/5"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                <div className="p-8 md:p-10 bg-black/20 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goal.exercises.map((ex, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-[1.5rem] space-y-4 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="font-black italic uppercase tracking-tight text-[#F5F5F5]">{ex.name}</span>
                        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">{ex.muscleGroup}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/5 flex-1 text-center">
                          <p className="text-[8px] font-black text-white/10 uppercase mb-1">PESO</p>
                          <p className="text-xl font-black accent-text">{ex.targetWeight}<span className="text-xs ml-1 opacity-20">kg</span></p>
                        </div>
                        <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/5 flex-1 text-center">
                          <p className="text-[8px] font-black text-white/10 uppercase mb-1">REPS</p>
                          <p className="text-xl font-black accent-text">{ex.targetReps}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsListView;
