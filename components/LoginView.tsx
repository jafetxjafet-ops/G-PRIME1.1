
import React, { useState } from 'react';
import { auth } from '../services/firebase';

interface LoginViewProps {
  onLogin: (user: any) => void;
  onGuest: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGuest }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Firebase requiere un formato email, usamos un dominio virtual interno
  const getVirtualEmail = (user: string) => `${user.trim().toLowerCase()}@gymg.app`;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Introduce credenciales de guerrero.");
      return;
    }
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    const email = getVirtualEmail(username);

    try {
      if (isRegistering) {
        // Updated to v8 compat style
        const result = await auth.createUserWithEmailAndPassword(email, password);
        onLogin(result.user);
      } else {
        // Updated to v8 compat style
        const result = await auth.signInWithEmailAndPassword(email, password);
        onLogin(result.user);
      }
    } catch (error: any) {
      console.error("Auth failed:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        alert("Credenciales incorrectas.");
      } else if (error.code === 'auth/email-already-in-use') {
        alert("Este nombre de usuario ya está reclamado.");
      } else {
        alert("Error de conexión con la Bóveda G.");
      }
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

      <div className="glass-card w-full max-w-sm p-10 md:p-12 rounded-[4rem] border-t-8 border-[#721c24] shadow-2xl relative z-10 animate-in zoom-in-95 duration-700">
        <div className="mb-10 text-center">
          <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase mb-2">GYM/G</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">{isRegistering ? 'CREAR PERFIL ÚNICO' : 'ACCESO A LA ARENA'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
           <div className="space-y-1">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">USUARIO</label>
              <input 
                type="text" 
                placeholder="Ej: Kratos_99"
                className="w-full bg-white/5 border border-white/10 p-5 rounded-[2rem] font-black text-white outline-none focus:matte-border-active transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
           </div>

           <div className="space-y-1">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">CONTRASEÑA</label>
              <input 
                type="password" 
                placeholder="••••••"
                className="w-full bg-white/5 border border-white/10 p-5 rounded-[2rem] font-black text-white outline-none focus:matte-border-active transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
           </div>

           <button 
            type="submit"
            disabled={isLoading}
            className="w-full accent-btn text-white p-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-4"
           >
              {isLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
              ) : (
                isRegistering ? 'FORJAR CUENTA' : 'ENTRAR AL SISTEMA'
              )}
           </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
           <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
           >
             {isRegistering ? '¿YA TIENES CUENTA? INICIA SESIÓN' : '¿NUEVO GUERRERO? REGÍSTRATE AQUÍ'}
           </button>

           <div className="flex items-center gap-4 w-full py-2">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">O</span>
              <div className="h-px flex-1 bg-white/5"></div>
           </div>

           <button 
            onClick={onGuest}
            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
           >
             Continuar sin sincronización
           </button>
        </div>

        <div className="mt-12 text-center">
           <div className="text-[8px] font-black text-white/5 uppercase tracking-[0.6em] flex items-center justify-center gap-2">
              <i className="fa-solid fa-cloud"></i> G-CLOUD SYNC ACTIVE v6.0
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
