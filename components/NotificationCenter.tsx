
import React from 'react';
import { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  onBack: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onRemove, onBack }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-4 glass-card rounded-2xl text-white/30 hover:text-white transition-all">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">CENTRO DE <span className="accent-text">ALERTA</span></h2>
          <p className="text-white/40 font-medium text-sm">Registro cronológico de tu actividad social.</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="py-20 text-center glass-card rounded-[3rem] border-dashed border-2 border-white/5">
            <i className="fa-solid fa-bell-slash text-5xl text-white/5 mb-6"></i>
            <p className="text-white/20 text-xs font-black uppercase tracking-widest">No hay alertas en tu registro.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`glass-card p-6 rounded-[2rem] flex items-center justify-between group transition-all ${!notif.read ? 'border-l-4 matte-border-active' : 'opacity-60'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  notif.type === 'workout_finished' ? 'bg-indigo-500/10 text-indigo-400' :
                  notif.type === 'surpassed' ? 'bg-amber-500/10 text-amber-500' :
                  notif.type === 'rank_up' ? 'bg-emerald-500/10 text-emerald-500' :
                  'bg-white/5 text-white/30'
                }`}>
                   <i className={`fa-solid ${
                     notif.type === 'workout_finished' ? 'fa-dumbbell' :
                     notif.type === 'surpassed' ? 'fa-bolt' :
                     notif.type === 'rank_up' ? 'fa-trophy' :
                     'fa-bell'
                   }`}></i>
                </div>
                <div>
                   <p className="text-sm font-black text-[#F5F5F5] uppercase italic">{notif.message}</p>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">
                      {new Date(notif.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                   </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onRemove(notif.id)}
                  className="w-10 h-10 rounded-xl bg-white/5 text-white/10 hover:text-red-500 transition-all flex items-center justify-center"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
