
import React from 'react';
import { AppSettings, ViewType, Title } from '../types';

interface ProfileDrawerProps {
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
  settings: AppSettings;
  level: number;
  currentExp: number;
  missingExp: number;
  expProgress: number;
  goalsCount: number;
  hasNewRequests?: boolean;
  onEditProfile: () => void;
  activeTitle?: Title;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ 
  onClose, 
  onNavigate, 
  settings, 
  level, 
  currentExp, 
  missingExp, 
  expProgress,
  goalsCount,
  hasNewRequests,
  onEditProfile,
  activeTitle
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: 'fa-house', color: 'accent-text', badge: false },
    { id: 'titles', label: 'Títulos Épicos', icon: 'fa-tag', color: 'text-rose-400', badge: false },
    { id: 'competitive', label: 'Competitivo', icon: 'fa-fire-flame-curved', color: 'text-red-500', badge: false },
    { id: 'achievements', label: 'Logros', icon: 'fa-trophy', color: 'text-cyan-400', badge: false },
    { id: 'statistics', label: 'Estadísticas', icon: 'fa-chart-simple', color: 'text-amber-400', badge: false },
    { id: 'friends', label: 'Amigos', icon: 'fa-users', color: 'text-indigo-400', badge: hasNewRequests },
    { id: 'timers', label: 'Reloj Multifunciones', icon: 'fa-stopwatch', color: 'text-rose-500', badge: false },
    { id: 'goals-list', label: 'Mis Metas', icon: 'fa-bullseye', color: 'text-blue-400', badge: false },
    { id: 'routines', label: 'Ejercicios', icon: 'fa-dumbbell', color: 'text-orange-400', badge: false },
    { id: 'settings', label: 'Ajustes', icon: 'fa-gear', color: 'text-slate-400', badge: false },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex drawer-overlay" onClick={onClose}>
      <div 
        className="w-full max-w-[320px] h-full bg-[#1A1A1A] border-r border-white/5 shadow-2xl drawer-content flex flex-col p-8 overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: `'${settings.fontFamily}', sans-serif` }}
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black italic tracking-tighter accent-text">MI <span className="text-white">PERFIL</span></h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-white/5 overflow-hidden shadow-xl mb-4 group relative">
              {settings.profileImage ? (
                <img src={settings.profileImage} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10 text-4xl">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
              {hasNewRequests && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-red-600 rounded-full border-2 border-[#1A1A1A] z-10"></div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={onEditProfile}>
                  <i className="fa-solid fa-camera accent-text text-2xl"></i>
              </div>
            </div>
            <button 
                onClick={onEditProfile}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-all shadow-md"
            >
                <i className="fa-solid fa-pencil text-[10px]"></i>
            </button>
          </div>
          
          <div className="flex flex-col items-center mt-4">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={onEditProfile}>
              <h3 className="text-xl font-black uppercase text-[#F5F5F5] mb-0.5 tracking-tight">{settings.userName}</h3>
              <i className="fa-solid fa-pencil text-[10px] text-white/5 group-hover:accent-text transition-colors"></i>
            </div>
            {activeTitle && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 mb-2 animate-in zoom-in">
                 <i className={`fa-solid ${activeTitle.icon} text-[8px]`} style={{ color: activeTitle.color }}></i>
                 <span className="text-[8px] font-black uppercase tracking-widest italic" style={{ color: activeTitle.color }}>{activeTitle.name}</span>
              </div>
            )}
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">{settings.phoneNumber || 'TEL: SIN REGISTRAR'}</p>
          </div>

          <div className="flex items-center gap-2 mb-6">
             <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black accent-text border border-white/5">
                NV. {level}
             </span>
             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{goalsCount} METAS</span>
          </div>

          <div className="w-full p-5 glass-card rounded-2xl text-left border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase text-white/40">PROGRESO DE EXP</span>
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
            <p className="text-[9px] font-black text-white/30 uppercase mt-2 tracking-widest leading-relaxed">
               EXP: <span className="text-white/60">{currentExp}</span> / <span className="accent-text opacity-70">{missingExp}</span>
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewType)}
              className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <i className={`fa-solid ${item.icon} text-base w-8 text-center ${item.color} group-hover:scale-110 transition-transform`}></i>
                <span className="font-black uppercase italic tracking-wider text-[10px] text-white/60 group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] mb-4">G-PRIME ELITE - V5.2</p>
            <button 
                onClick={onClose}
                className="text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors"
            >
                CERRAR MENÚ
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDrawer;
