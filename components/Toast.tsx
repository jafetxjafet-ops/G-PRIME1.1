
import React, { useEffect, useState } from 'react';
import { Notification } from '../types';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Wait for fade out animation
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
      <div className="glass-card p-5 rounded-2xl border-l-4 matte-border-active bg-black/80 backdrop-blur-2xl shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center accent-text">
              <i className="fa-solid fa-bolt text-lg"></i>
           </div>
           <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">ALERTA G</p>
              <p className="text-[11px] font-black text-[#F5F5F5] uppercase italic leading-tight">{notification.message}</p>
           </div>
        </div>
        <button onClick={() => { setIsVisible(false); setTimeout(onClose, 500); }} className="text-white/20 hover:text-white ml-4">
           <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;
