
import React, { useState, useEffect } from 'react';
import { TimerConfig } from '../types';

interface TimersViewProps {
  onStartTimer: (config: TimerConfig) => void;
}

const TimersView: React.FC<TimersViewProps> = ({ onStartTimer }) => {
  const [timers, setTimers] = useState<TimerConfig[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  
  const [name, setName] = useState('');
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(15);
  const [rounds, setRounds] = useState(8);

  useEffect(() => {
    const saved = localStorage.getItem('gym_timers');
    if (saved) setTimers(JSON.parse(saved));
    else {
      const defaultTimers: TimerConfig[] = [
        { id: 't1', name: 'Tabata Estándar', workTime: 20, restTime: 10, rounds: 8 },
        { id: 't2', name: 'Rounds de Boxeo', workTime: 180, restTime: 60, rounds: 12 },
      ];
      setTimers(defaultTimers);
      localStorage.setItem('gym_timers', JSON.stringify(defaultTimers));
    }
  }, []);

  const saveTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newTimer: TimerConfig = { id: crypto.randomUUID(), name, workTime, restTime, rounds };
    const updated = [newTimer, ...timers];
    setTimers(updated);
    localStorage.setItem('gym_timers', JSON.stringify(updated));
    setShowCreator(false);
    setName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">RELOJ <span className="accent-text">MULTIFUNCIÓN</span></h2>
          <p className="text-white/40 font-medium text-sm">Configura tus ciclos de trabajo y descanso.</p>
        </div>
        <button onClick={() => setShowCreator(!showCreator)} className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-white/50 hover:text-white transition-all">
          <i className={`fa-solid ${showCreator ? 'fa-xmark' : 'fa-plus'} text-lg`}></i>
        </button>
      </div>

      <div className="tutorial-timer-logic grid md:grid-cols-2 gap-6">
        {timers.map(timer => (
          <div key={timer.id} className="glass-card p-8 rounded-[2.5rem] flex items-center justify-between group hover:matte-border-active transition-all duration-300">
            <div className="space-y-4 flex-1">
              <h3 className="text-xl font-black italic uppercase text-[#F5F5F5] group-hover:accent-text">{timer.name}</h3>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase">TRABAJO</p>
                  <p className="text-sm font-black accent-text">{timer.workTime}s</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase">DESCANSO</p>
                  <p className="text-sm font-black text-white/30">{timer.restTime}s</p>
                </div>
              </div>
            </div>
            <button onClick={() => onStartTimer(timer)} className="w-12 h-12 rounded-full accent-bg text-white shadow-lg transition-all"><i className="fa-solid fa-play"></i></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimersView;
