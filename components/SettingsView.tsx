
import React, { useRef } from 'react';
import { AppSettings, ThemeType, ExpBarStyle, ExpBarFillType } from '../types';

interface SettingsProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onReset: () => void;
  onLogout: () => void;
}

const THEMES: { id: ThemeType, name: string, start: string, end: string, accent: string }[] = [
  { id: 'negro', name: 'Negro Mate', start: '#1A1A1A', end: '#121212', accent: '#721c24' },
  { id: 'gris', name: 'Gris Carbón', start: '#363636', end: '#262626', accent: '#94a3b8' },
  { id: 'rojo', name: 'Rojo Sangre', start: '#3a0f12', end: '#1a0708', accent: '#721c24' },
  { id: 'verde', name: 'Verde Militar', start: '#0d170d', end: '#050a05', accent: '#1b2e1b' },
  { id: 'azul', name: 'Azul Marino', start: '#2E4053', end: '#212F3C', accent: '#2E4053' },
  { id: 'amarillo', name: 'Amarillo Ocre', start: '#C5A059', end: '#9C7F46', accent: '#C5A059' },
  { id: 'cafe', name: 'Tabaco Mate', start: '#4b3621', end: '#2a1e12', accent: '#4b3621' },
  { id: 'morado', name: 'Ciruela Mate', start: '#5B3A6F', end: '#442B53', accent: '#5B3A6F' },
];

const PREMIUM_MODELS: { id: ExpBarStyle, name: string, desc: string }[] = [
  { id: 'classic', name: 'Elegante', desc: 'Minimalismo sólido de alto rendimiento.' },
  { id: 'cyber', name: 'Cibernético', desc: 'Estética futurista con aura de neón.' },
  { id: 'industrial', name: 'Industrial', desc: 'Diseño robusto dividido por bloques de fuerza.' },
  { id: 'radiant', name: 'Radiante', desc: 'Degradado animado que fluye con tu energía.' },
  { id: 'prestige', name: 'Prestigio', desc: 'Acabado cristalino con reflejos de victoria.' },
];

const FILL_TYPES: { id: ExpBarFillType, name: string }[] = [
  { id: 'solid', name: 'Sólida' },
  { id: 'gradient', name: 'Degradada' },
  { id: 'segmented', name: 'Segmentada (10%)' },
];

const EXP_BAR_COLORS = [
  { name: 'Oro Sagrado', hex: '#C5A059' },
  { name: 'Azul Eléctrico', hex: '#00BFFF' },
  { name: 'Verde Neón', hex: '#39FF14' },
  { name: 'Blanco Glaciar', hex: '#F0F8FF' },
  { name: 'Púrpura Real', hex: '#7851A9' },
  { name: 'Rojo Carmín', hex: '#721c24' }
];

const ACCENTS = ['#721c24', '#1b2e1b', '#2E4053', '#C5A059', '#4b3621', '#5B3A6F', '#363636', '#F5F5F5'];

const SettingsView: React.FC<SettingsProps> = ({ settings, setSettings, onReset, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSettings(prev => ({ ...prev, profileImage: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500 pb-20">
      <div>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">DISEÑO <span className="accent-text">& RENDIMIENTO</span></h2>
        <p className="text-white/50 font-medium">Personaliza tu entorno de entrenamiento élite.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <section className="glass-card rounded-[2.5rem] p-8 space-y-8 shadow-md">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full bg-white/5 overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105">
                {settings.profileImage ? (
                  <img src={settings.profileImage} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/5 text-6xl">
                    <i className="fa-solid fa-user"></i>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 accent-btn text-white p-4 rounded-full shadow-xl"
              >
                <i className="fa-solid fa-camera text-lg"></i>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
            
            <div className="w-full space-y-4">
              <input 
                type="text" 
                value={settings.userName}
                onChange={(e) => setSettings(prev => ({ ...prev, userName: e.target.value }))}
                className="w-full bg-white/5 border border-white/5 focus:matte-border-active outline-none p-5 rounded-2xl font-black uppercase tracking-wider text-center text-lg text-[#F5F5F5]"
                placeholder="TU NOMBRE"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase text-white/30 tracking-widest">SISTEMA DE EXPERIENCIA PREMIUM</h3>
                <i className="fa-solid fa-medal accent-text"></i>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase">Color de la Barra</label>
                <div className="flex flex-wrap gap-3">
                  {EXP_BAR_COLORS.map(color => (
                    <button
                      key={color.hex}
                      onClick={() => setSettings(prev => ({ ...prev, expBarColor: color.hex }))}
                      className={`w-10 h-10 rounded-xl border-2 transition-all shadow-md ${settings.expBarColor === color.hex ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase">Estilo Visual (5 Modelos)</label>
                <div className="grid grid-cols-1 gap-3">
                  {PREMIUM_MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSettings(prev => ({ ...prev, expBarStyle: model.id }))}
                      className={`w-full p-5 rounded-[1.5rem] border transition-all text-left group ${settings.expBarStyle === model.id ? 'matte-border-active bg-white/5' : 'border-white/5 bg-white/2 hover:bg-white/5'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-black uppercase text-white group-hover:accent-text transition-colors">{model.name}</span>
                        <div className={`w-3 h-3 rounded-full ${settings.expBarStyle === model.id ? 'accent-bg shadow-[0_0_8px_var(--accent-color)]' : 'bg-white/5'}`}></div>
                      </div>
                      <p className="text-[8px] font-medium text-white/30 uppercase tracking-widest">{model.desc}</p>
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
            <button onClick={onLogout} className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-black uppercase text-[10px] tracking-widest border border-white/5">CERRAR SESIÓN</button>
            <button onClick={onReset} className="w-full py-4 rounded-2xl border border-red-900/30 text-red-500/50 font-black uppercase text-[10px] tracking-widest">REINICIAR TODO</button>
          </div>
        </section>

        <section className="glass-card rounded-[2.5rem] p-8 space-y-10 shadow-md">
          <div className="space-y-6">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">Tema Mate General</label>
            <div className="grid grid-cols-4 gap-4">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSettings(prev => ({ ...prev, theme: theme.id, accentColor: theme.accent }))}
                  className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all ${settings.theme === theme.id ? 'matte-border-active bg-white/5 scale-105' : 'border-transparent hover:bg-white/5'}`}
                >
                  <div 
                    className="w-full aspect-square rounded-xl mb-2 border border-white/5" 
                    style={{ background: `linear-gradient(135deg, ${theme.start}, ${theme.end})` }}
                  ></div>
                  <span className="text-[8px] font-black text-white/40 uppercase truncate w-full text-center">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">Color de Acento (UI)</label>
            <div className="flex flex-wrap gap-4">
              {ACCENTS.map(color => (
                <button
                  key={color}
                  onClick={() => setSettings(prev => ({ ...prev, accentColor: color }))}
                  className={`w-10 h-10 rounded-xl border-2 transition-all shadow-md ${settings.accentColor === color ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                G-PRIME - Desarrollado por Ludwig Feria
             </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
