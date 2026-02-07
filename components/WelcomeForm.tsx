
import React, { useState } from 'react';

interface WelcomeFormProps {
  onComplete: (data: { height: number; weight: number; userName: string }) => void;
}

const WelcomeForm: React.FC<WelcomeFormProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const nextStep = () => {
    if (step === 1 && height && weight) setStep(2);
    else if (step === 2 && userName) {
      onComplete({ height: Number(height), weight: Number(weight), userName });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black p-6">
      {/* Background Decorative */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#721c24] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C5A059] blur-[120px] rounded-full"></div>
      </div>

      <div className="glass-card w-full max-w-md p-10 md:p-12 rounded-[3.5rem] border-t-8 border-[#721c24] shadow-2xl relative z-10 animate-in zoom-in-95 duration-700 text-center">
        <div className="mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#721c24]">G-<span className="text-white">PRIME</span></h1>
          <div className="flex justify-center gap-2 mt-4">
             <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 1 ? 'accent-bg' : 'bg-white/10'}`}></div>
             <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 2 ? 'accent-bg' : 'bg-white/10'}`}></div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
            <h2 className="text-2xl font-black italic uppercase text-white/90">BIENVENIDO GUERRERO</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Ingresa tus datos físicos actuales</p>
            
            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-4">Altura (cm)</label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ej: 180"
                  className="w-full bg-white/5 border border-white/5 focus:matte-border-active outline-none p-5 rounded-2xl font-black text-center text-lg text-[#F5F5F5] placeholder:text-white/5"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-4">Peso (kg)</label>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej: 85"
                  className="w-full bg-white/5 border border-white/5 focus:matte-border-active outline-none p-5 rounded-2xl font-black text-center text-lg text-[#F5F5F5] placeholder:text-white/5"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
            <h2 className="text-2xl font-black italic uppercase text-white/90">IDENTIDAD G-PRIME</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">¿Cómo quieres que te llamemos?</p>
            
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-4">Tu Apodo 🔥</label>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej: Iron_Warrior ⚔️"
                className="w-full bg-white/5 border border-white/5 focus:matte-border-active outline-none p-5 rounded-2xl font-black text-center text-lg text-[#F5F5F5] placeholder:text-white/5"
              />
            </div>
            <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">Puedes usar emojis y símbolos especiales.</p>
          </div>
        )}

        <button 
          onClick={nextStep}
          disabled={step === 1 ? (!height || !weight) : !userName}
          className="w-full mt-12 accent-btn text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-xl transition-all disabled:opacity-50"
        >
          {step === 1 ? 'CONTINUAR' : 'DESBLOQUEAR SISTEMA'}
        </button>
      </div>
    </div>
  );
};

export default WelcomeForm;
