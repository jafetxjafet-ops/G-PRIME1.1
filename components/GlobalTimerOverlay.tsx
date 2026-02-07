
import React, { useState, useEffect, useRef } from 'react';
import { TimerConfig } from '../types';

interface GlobalTimerOverlayProps {
  config: TimerConfig;
  onClose: () => void;
}

const GlobalTimerOverlay: React.FC<GlobalTimerOverlayProps> = ({ config, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(config.workTime);
  const [isWork, setIsWork] = useState(true);
  const [isActive, setIsActive] = useState(true);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Audio signals
  const playSound = (freq: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine', duration = 0.2) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playBeep = () => playSound(880, 'sine', 0.1);
  const playBell = () => {
    playSound(440, 'triangle', 0.5);
    setTimeout(() => playSound(660, 'triangle', 0.5), 100);
  };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Transition logic
          if (isWork) {
            if (currentRound >= config.rounds) {
              clearInterval(timer);
              playBell();
              setTimeout(onClose, 2000);
              return 0;
            }
            setIsWork(false);
            playBell();
            return config.restTime;
          } else {
            setCurrentRound(r => r + 1);
            setIsWork(true);
            playBell();
            return config.workTime;
          }
        }
        
        // Final countdown beeps
        if (prev <= 4) {
          playBeep();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isWork, currentRound, config]);

  const progress = isWork ? (timeLeft / config.workTime) * 100 : (timeLeft / config.restTime) * 100;
  const color = isWork ? 'var(--accent-color)' : '#444';

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-24 right-8 z-[100] glass-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer animate-in zoom-in-95 shadow-2xl border-l-4"
        style={{ borderColor: color }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">{isWork ? 'TRABAJO' : 'DESCANSO'}</span>
          <span className="text-xl font-black accent-text tabular-nums">{timeLeft}s</span>
        </div>
        <div className="h-8 w-px bg-white/5"></div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">RONDA</span>
          <span className="text-xs font-black text-white/60">{currentRound}/{config.rounds}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onClose(); }} className="text-white/20 hover:text-white ml-2">
           <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in">
      <div className="glass-card w-full max-w-sm p-12 rounded-[3.5rem] text-center space-y-10 border-t-8 accent-border shadow-2xl relative">
        <div className="absolute top-8 right-8 flex gap-4">
          <button onClick={() => setIsMinimized(true)} className="text-white/20 hover:text-white">
            <i className="fa-solid fa-compress"></i>
          </button>
          <button onClick={onClose} className="text-white/20 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black italic uppercase text-white/80">{config.name}</h3>
          <p className="text-[10px] font-black accent-text uppercase tracking-[0.3em]">RONDA {currentRound} DE {config.rounds}</p>
        </div>

        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="8"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray="753.98"
              strokeDashoffset={753.98 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-7xl font-black tabular-nums tracking-tighter text-[#F5F5F5]">{timeLeft}</span>
            <span className="text-xs font-black uppercase tracking-widest text-white/20">{isWork ? '¡DALE!' : 'DESCANSA'}</span>
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${isActive ? 'bg-white/5 text-white/40' : 'accent-bg text-white scale-110'}`}
          >
            <i className={`fa-solid ${isActive ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          <button 
            onClick={() => { setTimeLeft(isWork ? config.workTime : config.restTime); }}
            className="w-16 h-16 rounded-full bg-white/5 text-white/20 flex items-center justify-center text-xl hover:text-white transition-all"
          >
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalTimerOverlay;
