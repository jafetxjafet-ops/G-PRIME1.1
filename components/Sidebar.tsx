
import React from 'react';
import { ViewType, AppSettings } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  level: number;
  currentExp: number;
  missingExp: number;
  expProgress: number;
  userName: string;
  streak: number;
  onEditProfile: () => void;
  settings: AppSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, level, currentExp, missingExp, expProgress, userName, streak, onEditProfile, settings }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: 'fa-house' },
    { id: 'titles', label: 'Títulos Épicos', icon: 'fa-tag' },
    { id: 'competitive', label: 'Competitivo', icon: 'fa-fire-flame-curved' },
    { id: 'achievements', label: 'Logros', icon: 'fa-trophy' },
    { id: 'goals-list', label: 'Mis Metas', icon: 'fa-bullseye' },
    { id: 'active-workout', label: 'Entrenar', icon: 'fa-play' },
    { id: 'routines', label: 'Ejercicios', icon: 'fa-dumbbell' },
    { id: 'settings', label: 'Ajustes', icon: 'fa-gear' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 p-8 z-40 border-r border-white/5 bg-[#1A1A1A] backdrop-blur-3xl">
      <div className="mb-12 flex flex-col items-center">
        <div className="w-24 h-24 mb-3 flex items-center justify-center bg-black rounded-full shadow-2xl">
          <span className="text-4xl font-black italic tracking-tighter text-white">GYM/G</span>
        </div>
        <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">GYM/G</h1>
        <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.4em] mt-1 text-center">ELITE PERFORMANCE</p>
      </div>

      <div className="mb-10 p-5 glass-card rounded-[2rem] border border-white/5 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={onEditProfile}>
            <span className="text-[10px] font-black uppercase text-white/40 tracking-wider truncate max-w-[100px]">{userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={streak > 0 ? 'accent-text' : 'text-white/10'}>
              <i className="fa-solid fa-fire text-[10px]"></i>
              <span className="text-[10px] font-black ml-1">{streak}</span>
            </div>
            <span className="text-[10px] font-black accent-text bg-white/5 px-2 py-1 rounded-lg">
              NV. {level}
            </span>
          </div>
        </div>
        
        <div className={`exp-bar-container exp-style-${settings.expBarStyle}`}>
          <div 
            className={`exp-bar-fill exp-fill-${settings.expBarFillType}`} 
            style={{ 
              width: `${expProgress}%`, 
              backgroundColor: 'var(--exp-fill-color)'
            }}
          ></div>
        </div>

        <div className="mt-2 flex justify-between items-center">
           <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">
            EXP: <span className="text-white/60">{currentExp}</span> / <span className="accent-text opacity-70">{missingExp}</span>
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewType)}
            className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl font-black uppercase italic tracking-wider text-[10px] transition-all duration-300 ${
              activeView === item.id 
                ? 'accent-bg text-white shadow-lg scale-105 -rotate-1' 
                : 'text-white/30 hover:bg-white/5 hover:text-white/60'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg w-8 text-center`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="p-5 glass-card rounded-2xl text-center space-y-2 relative overflow-hidden group">
          <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Estado del Guerrero</p>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full accent-bg opacity-50 shadow-[0_0_5px_var(--accent-color)]"></span>
            <span className="text-[9px] font-black text-white/40 uppercase">SISTEMA ONLINE</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
