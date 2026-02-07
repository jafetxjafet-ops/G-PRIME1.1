
import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface LoginViewProps {
  onLogin: (user: any) => void;
  onGuest: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGuest }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Error al conectar con la nube. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#721c24] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C5A059] blur-[120px] rounded-full"></div>
      </div>

      <div className="glass-card w-full max-w-sm p-12 rounded-[4rem] border-t-8 border-[#721c24] shadow-2xl relative z-10 animate-in zoom-in-95 duration-700">
        <div className="mb-12 flex flex-col items-center">
          <div className="text-center">
            <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase mb-2">GYM/G</h1>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">SISTEMA DE ENTRENAMIENTO ÉLITE</p>
            <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] italic mt-2 font-serif">by Ludwig Feria</p>
          </div>
        </div>

        <div className="space-y-6">
           <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all group active:scale-95 disabled:opacity-50"
           >
              {isLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin text-xl text-white/40"></i>
              ) : (
                <>
                  <i className="fa-brands fa-google text-2xl text-white/20 group-hover:text-red-500 transition-colors"></i>
                  <div className="text-left">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Sincronizar con</p>
                    <p className="text-xs font-black uppercase text-white/60 group-hover:text-white transition-colors">CUENTA DE GOOGLE</p>
                  </div>
                </>
              )}
           </button>

           <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">O continúa como</span>
              <div className="h-px flex-1 bg-white/5"></div>
           </div>

           <button 
            onClick={onGuest}
            disabled={isLoading}
            className="w-full p-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5 transition-all"
           >
             Acceder como Invitado
           </button>
        </div>

        <div className="mt-16 text-center">
           <div className="text-[8px] font-black text-white/5 uppercase tracking-[0.6em]">
              G-CLOUD SYNC ACTIVE v5.3
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
