
import React, { useMemo, useState } from 'react';
import { Title, AppSettings } from '../types';
import { TITLES_DATABASE } from '../constants';

interface TitlesViewProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onBack: () => void;
}

const TitlesView: React.FC<TitlesViewProps> = ({ settings, setSettings, onBack }) => {
  const [activeTab, setActiveTab] = useState<Title['category'] | 'Todos'>('Todos');
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);

  const categories: (Title['category'] | 'Todos')[] = ['Todos', 'Fuerza', 'Constancia', 'Cardio', 'Progreso', 'Social'];

  const filteredTitles = useMemo(() => {
    return TITLES_DATABASE.filter(t => activeTab === 'Todos' || t.category === activeTab);
  }, [activeTab]);

  const toggleTitle = (id: string) => {
    setSettings(prev => ({
      ...prev,
      activeTitleId: prev.activeTitleId === id ? null : id
    }));
  };

  const unlockedCount = settings.unlockedTitles.length;
  const totalCount = TITLES_DATABASE.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 pb-24">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-4 glass-card rounded-2xl text-white/30 hover:text-white transition-all">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">BÓVEDA DE <span className="accent-text">ALMAS</span></h2>
          <p className="text-white/40 font-medium text-sm">Prestigio acumulado: {unlockedCount} / {totalCount}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === cat ? 'accent-bg text-white border-transparent' : 'bg-white/5 text-white/20 border-white/5 hover:text-white/50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredTitles.map(title => {
          const isUnlocked = settings.unlockedTitles.some(ut => ut.id === title.id);
          const isActive = settings.activeTitleId === title.id;

          return (
            <button
              key={title.id}
              onClick={() => isUnlocked ? toggleTitle(title.id) : setSelectedTitle(title)}
              onContextMenu={(e) => { e.preventDefault(); setSelectedTitle(title); }}
              className={`relative aspect-square flex flex-col items-center justify-center p-4 rounded-[2rem] border transition-all duration-500 overflow-hidden group ${isUnlocked ? 'glass-card-hover cursor-pointer' : 'cursor-help border-white/5 bg-black/40'}`}
              style={{ 
                borderColor: isActive ? title.color : isUnlocked ? `${title.color}44` : 'rgba(255,255,255,0.03)',
                background: isActive ? `${title.color}10` : ''
              }}
            >
              {isActive && (
                <div className="absolute top-2 right-2 animate-in zoom-in">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: title.color, boxShadow: `0 0 8px ${title.color}` }}></div>
                </div>
              )}

              <div 
                className={`text-3xl mb-1 transition-all duration-700 ${isUnlocked ? 'group-hover:scale-110 rotate-0' : 'filter blur-sm grayscale opacity-20 scale-90 -rotate-12'}`}
                style={{ color: isUnlocked ? title.color : '#FFF' }}
              >
                <i className={`fa-solid ${title.icon}`}></i>
              </div>

              <span className={`text-[7px] font-black uppercase tracking-tighter text-center line-clamp-1 ${isUnlocked ? 'text-white/80' : 'text-white/5'}`}>
                {isUnlocked ? title.name : '??????'}
              </span>

              {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal Detallado de Título */}
      {selectedTitle && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in" onClick={() => setSelectedTitle(null)}>
           <div 
            className="glass-card w-full max-w-sm p-10 rounded-[4rem] text-center border-t-8 shadow-2xl relative animate-in zoom-in-95"
            style={{ borderColor: selectedTitle.color }}
            onClick={e => e.stopPropagation()}
           >
              <button onClick={() => setSelectedTitle(null)} className="absolute top-8 right-8 text-white/20 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>

              <div 
                className="w-32 h-32 rounded-[2.5rem] bg-white/5 border-2 mx-auto flex items-center justify-center text-6xl shadow-2xl mb-8"
                style={{ borderColor: `${selectedTitle.color}33`, color: selectedTitle.color, boxShadow: `0 0 30px ${selectedTitle.color}22` }}
              >
                 <i className={`fa-solid ${selectedTitle.icon}`}></i>
              </div>

              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">{selectedTitle.category}</p>
              <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-4">{selectedTitle.name}</h3>
              
              <div className="p-6 bg-black/20 rounded-3xl border border-white/5 mb-8">
                 <p className="text-xs font-medium text-white/40 leading-relaxed italic">"{selectedTitle.description}"</p>
              </div>

              <div className="space-y-4">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">REQUERIMIENTO</p>
                 <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/80 uppercase">
                    {selectedTitle.requirement.type === 'exercise_weight' && `${selectedTitle.requirement.exerciseName}: ${selectedTitle.requirement.value} KG`}
                    {selectedTitle.requirement.type === 'streak' && `${selectedTitle.requirement.value} DÍAS DE RACHA`}
                    {selectedTitle.requirement.type === 'level' && `NIVEL DE GUERRERO ${selectedTitle.requirement.value}`}
                    {selectedTitle.requirement.type === 'workouts_count' && `${selectedTitle.requirement.value} ENTRENAMIENTOS`}
                    {selectedTitle.requirement.type === 'volume_total' && `${selectedTitle.requirement.value.toLocaleString()} KG VOLUMEN`}
                    {selectedTitle.requirement.type === 'friends_count' && `${selectedTitle.requirement.value} ALIADOS`}
                    {selectedTitle.requirement.type === 'cardio_time_total' && `${Math.round(selectedTitle.requirement.value / 60)} MIN CARDIO`}
                    {selectedTitle.requirement.type === 'cardio_sessions' && `${selectedTitle.requirement.value} SESIONES CARDIO`}
                 </div>
              </div>

              {settings.unlockedTitles.some(ut => ut.id === selectedTitle.id) ? (
                <button 
                  onClick={() => { toggleTitle(selectedTitle.id); setSelectedTitle(null); }}
                  className="w-full mt-10 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] text-white shadow-xl transition-all"
                  style={{ backgroundColor: selectedTitle.color }}
                >
                  {settings.activeTitleId === selectedTitle.id ? 'DESEQUIPAR TÍTULO' : 'EQUIPAR TÍTULO'}
                </button>
              ) : (
                <div className="w-full mt-10 py-5 rounded-[2.5rem] bg-white/5 border border-white/10 text-white/10 font-black uppercase tracking-widest text-[10px]">
                  TÍTULO BLOQUEADO
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default TitlesView;
