
import React, { useMemo } from 'react';
import { Goal, ViewType, Notification } from '../types';

interface DashboardProps {
  activeGoal: Goal | undefined;
  goalsCount: number;
  onNavigate: (view: ViewType) => void;
  notifications: Notification[];
  onRemoveNotification: (id: string) => void;
  streak: number;
}

const Dashboard: React.FC<DashboardProps> = ({ activeGoal, goalsCount, onNavigate, notifications, onRemoveNotification, streak }) => {
  const daysLeft = useMemo(() => {
    if (!activeGoal) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    const deadline = new Date(activeGoal.deadline);
    const diff = deadline.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [activeGoal]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {notifications.length > 0 && (
        <div className="space-y-3">
           {notifications.map(n => (
             <div key={n.id} className="p-5 glass-card rounded-2xl border-l-4 border-amber-500 flex items-center justify-between animate-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                     <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <p className="text-xs font-black uppercase text-[#F5F5F5]">{n.message}</p>
                </div>
                <button onClick={() => onRemoveNotification(n.id)} className="text-white/10 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
             </div>
           ))}
        </div>
      )}

      <section className="tutorial-goals relative overflow-hidden rounded-[2rem] glass-card p-8 md:p-12 shadow-lg group border-l-8 accent-border">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-transform duration-1000 group-hover:scale-105">
          <i className="fa-solid fa-dumbbell text-[12rem] -rotate-12"></i>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-[#F5F5F5]">
              {activeGoal ? (
                <>
                  <span className="block text-xl md:text-2xl not-italic font-bold text-white/30 mb-2">Meta Activa</span>
                  {activeGoal.title}
                </>
              ) : 'Sin metas activas'}
            </h2>
            <p className="text-lg text-white/60 max-w-lg leading-relaxed font-medium">
              {activeGoal 
                ? `Mantén la disciplina. Estás trabajando para superar tus marcas en ${activeGoal.exercises.length} movimientos seleccionados.` 
                : 'La constancia es la clave del progreso profesional. Define tu primer objetivo ahora.'}
            </p>
            <div className="flex flex-wrap gap-4">
              {activeGoal ? (
                  <button 
                    onClick={() => onNavigate('routines')}
                    className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-3 border border-white/5"
                  >
                    <i className="fa-solid fa-list-check accent-text"></i>
                    BIBLIOTECA
                  </button>
              ) : (
                <button 
                  onClick={() => onNavigate('create-goal')}
                  className="accent-btn text-white px-10 py-4 rounded-2xl font-black text-sm shadow-md flex items-center gap-3 uppercase tracking-wide"
                >
                  <i className="fa-solid fa-shield"></i>
                  Crear Mi Primera Meta
                </button>
              )}
              
              <button 
                onClick={() => onNavigate('cardio')}
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-3 border border-white/5"
              >
                <i className="fa-solid fa-person-running accent-text"></i>
                MODO CARDIO
              </button>
            </div>
          </div>

          {activeGoal && (
            <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-xl min-w-[200px] shadow-inner relative overflow-hidden group">
              <span className="text-7xl font-black accent-text mb-1 leading-none tracking-tighter">{daysLeft}</span>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Días Restantes</span>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <button 
          onClick={() => onNavigate('goals-list')}
          className="glass-card p-6 rounded-[1.5rem] flex flex-col gap-2 text-left glass-card-hover group transition-all"
        >
          <div className="p-3 w-fit rounded-xl bg-white/5 mb-2 text-white/40 group-hover:accent-text transition-colors">
            <i className="fa-solid fa-bullseye text-xl"></i>
          </div>
          <span className="text-3xl font-black tracking-tight text-[#F5F5F5]">{goalsCount}</span>
          <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Metas Totales</span>
        </button>
        
        <div className="glass-card p-6 rounded-[1.5rem] flex flex-col gap-2 glass-card-hover group transition-all">
          <div className="p-3 w-fit rounded-xl bg-white/5 mb-2 text-white/40 group-hover:accent-text transition-colors">
            <i className="fa-solid fa-dumbbell text-xl"></i>
          </div>
          <span className="text-3xl font-black tracking-tight text-[#F5F5F5]">{activeGoal?.exercises.length || 0}</span>
          <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Ejercicios Act.</span>
        </div>

        <button 
          onClick={() => onNavigate('statistics')}
          className="glass-card p-6 rounded-[1.5rem] flex flex-col gap-2 glass-card-hover group transition-all text-left"
        >
          <div className="p-3 w-fit rounded-xl bg-white/5 mb-2 text-white/40 group-hover:accent-text transition-colors">
            <i className="fa-solid fa-weight-hanging text-xl"></i>
          </div>
          <span className="text-3xl font-black tracking-tight text-[#F5F5F5]">ESTATS</span>
          <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Analítica G</span>
        </button>

        <div className={`glass-card p-6 rounded-[1.5rem] flex flex-col gap-2 glass-card-hover group transition-all ${streak > 0 ? 'border-amber-500/30' : ''}`}>
          <div className={`p-3 w-fit rounded-xl bg-white/5 mb-2 transition-colors ${streak > 0 ? 'accent-text' : 'text-white/10'}`}>
            <i className="fa-solid fa-fire text-xl"></i>
          </div>
          <span className={`text-3xl font-black tracking-tight ${streak > 0 ? 'text-[#F5F5F5]' : 'text-white/20'}`}>
            {streak} <span className="text-sm font-bold opacity-30">DÍAS</span>
          </span>
          <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Racha Actual</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
