
import React, { useState, useMemo } from 'react';
import { Friend, WorkoutRecord, MuscleGroup, AppSettings } from '../types';
import { getRankColor, getRankIcon } from '../utils/rankSystem';
import { EXERCISES_DATABASE } from '../constants';

interface CompetitiveViewProps {
  friends: Friend[];
  workoutHistory: WorkoutRecord[];
  settings: AppSettings;
  onBack: () => void;
}

const CompetitiveView: React.FC<CompetitiveViewProps> = ({ friends, workoutHistory, settings, onBack }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | '1vs1'>('leaderboard');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<MuscleGroup | 'Fuerza Total'>('Fuerza Total');
  const [comparisonFriendId, setComparisonFriendId] = useState<string | null>(null);

  // Calcular mis estadísticas actuales
  const myStats = useMemo(() => {
    const muscleMaxWeights: Record<string, number> = {};
    Object.values(MuscleGroup).forEach(m => muscleMaxWeights[m] = 0);

    workoutHistory.forEach(record => {
      const ex = EXERCISES_DATABASE.find(e => e.name === record.topExerciseName);
      if (ex && record.topWeight > (muscleMaxWeights[ex.muscleGroup] || 0)) {
        muscleMaxWeights[ex.muscleGroup] = record.topWeight;
      }
    });

    const totalFuerza = Object.values(muscleMaxWeights).reduce((a, b) => a + b, 0);
    const strongestMuscle = Object.entries(muscleMaxWeights).reduce((a, b) => b[1] > a[1] ? b : a, ['N/A', 0]);

    return {
      name: settings.userName,
      level: 1, // Este debería venir del motor de niveles de App.tsx, simplificado aquí
      totalFuerza,
      muscleMaxWeights,
      strongestMuscle: strongestMuscle[0] as MuscleGroup,
      topWeight: Math.max(...Object.values(muscleMaxWeights))
    };
  }, [workoutHistory, settings.userName]);

  // Filtrar y ordenar amigos (solo los que tienen canSeeStats: true)
  const rankings = useMemo(() => {
    const validFriends = friends.filter(f => f.canSeeStats);
    const allPlayers = [
      { id: 'me', name: settings.userName, level: settings.totalExp, muscleWeights: myStats.muscleMaxWeights, total: myStats.totalFuerza, isMe: true },
      ...validFriends.map(f => ({
        id: f.id,
        name: f.name,
        level: f.level,
        muscleWeights: f.topExercises.reduce((acc, ex) => {
          if (ex.muscleGroup) acc[ex.muscleGroup] = ex.weight;
          return acc;
        }, {} as Record<string, number>),
        total: f.topExercises.reduce((a, b) => a + b.weight, 0),
        isMe: false
      }))
    ];

    if (selectedMuscleFilter === 'Fuerza Total') {
      return allPlayers.sort((a, b) => b.total - a.total);
    } else {
      return allPlayers.sort((a, b) => (b.muscleWeights[selectedMuscleFilter] || 0) - (a.muscleWeights[selectedMuscleFilter] || 0));
    }
  }, [friends, myStats, selectedMuscleFilter, settings]);

  const selectedFriend = useMemo(() => friends.find(f => f.id === comparisonFriendId), [friends, comparisonFriendId]);

  const motivationalMessage = useMemo(() => {
    const myRank = rankings.findIndex(r => r.isMe) + 1;
    const totalPlayers = rankings.length;
    const percentile = Math.round(((totalPlayers - myRank) / totalPlayers) * 100);

    if (myRank === 1) return "ERES EL ALPHA DOMINANTE. MANTÉN EL TRONO 💪";
    if (percentile >= 70) return `Estás más fuerte que el ${percentile}% de tus aliados.`;
    return "Sigue entrenando. El hierro no miente, la constancia sí.";
  }, [rankings]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 pb-24">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-4 glass-card rounded-2xl text-white/30 hover:text-white transition-all">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">ARENA <span className="accent-text">COMPETITIVA</span></h2>
          <p className="text-white/40 font-medium text-sm">Compara tu rendimiento contra la legión G-Prime.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/5">
        <button onClick={() => setActiveTab('leaderboard')} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'leaderboard' ? 'accent-text border-b-2 border-accent-color' : 'text-white/20'}`}>RÁNKINGS</button>
        <button onClick={() => setActiveTab('1vs1')} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === '1vs1' ? 'accent-text border-b-2 border-accent-color' : 'text-white/20'}`}>DUELO 1 VS 1</button>
      </div>

      {activeTab === 'leaderboard' && (
        <div className="space-y-8">
          <div className="p-6 glass-card rounded-[2rem] border-l-4 border-amber-500 bg-amber-500/5 flex items-center gap-4">
             <i className="fa-solid fa-bolt text-amber-500 text-2xl"></i>
             <p className="text-xs font-black uppercase text-amber-500/80">{motivationalMessage}</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            <button 
              onClick={() => setSelectedMuscleFilter('Fuerza Total')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${selectedMuscleFilter === 'Fuerza Total' ? 'accent-bg text-white' : 'bg-white/5 text-white/20 border-white/5'}`}
            >
              FUERZA TOTAL
            </button>
            {Object.values(MuscleGroup).filter(m => m !== MuscleGroup.CARDIO).map(m => (
              <button 
                key={m}
                onClick={() => setSelectedMuscleFilter(m)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${selectedMuscleFilter === m ? 'accent-bg text-white' : 'bg-white/5 text-white/20 border-white/5'}`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {rankings.map((player, idx) => (
              <div key={player.id} className={`glass-card p-6 rounded-[2.5rem] flex items-center justify-between group transition-all ${player.isMe ? 'matte-border-active' : 'border-white/5'}`}>
                <div className="flex items-center gap-6">
                   <span className={`text-xl font-black italic ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-white/10'}`}>#{idx + 1}</span>
                   <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                      <i className={`fa-solid ${player.isMe ? 'fa-user-ninja' : 'fa-user'}`}></i>
                   </div>
                   <div>
                      <h4 className={`text-lg font-black uppercase italic ${player.isMe ? 'accent-text' : 'text-[#F5F5F5]'}`}>{player.name}</h4>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Nivel {player.level}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-[#F5F5F5] tabular-nums">
                    {selectedMuscleFilter === 'Fuerza Total' ? player.total : (player.muscleWeights[selectedMuscleFilter] || 0)}
                    <span className="text-[10px] ml-1 opacity-20">KG</span>
                   </p>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{selectedMuscleFilter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === '1vs1' && (
        <div className="space-y-10 animate-in zoom-in-95">
          {!comparisonFriendId ? (
            <div className="grid md:grid-cols-2 gap-6">
              {friends.filter(f => f.canSeeStats).length === 0 ? (
                <div className="col-span-2 glass-card p-20 rounded-[3rem] text-center border-dashed border-2 border-white/5">
                   <i className="fa-solid fa-lock text-4xl mb-4 opacity-20"></i>
                   <p className="font-black uppercase tracking-[0.2em] text-white/20">No tienes amigos con visibilidad compartida.</p>
                </div>
              ) : (
                friends.filter(f => f.canSeeStats).map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setComparisonFriendId(f.id)}
                    className="glass-card p-10 rounded-[3rem] group hover:matte-border-active transition-all flex flex-col items-center gap-6"
                  >
                     <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl text-white/10 group-hover:accent-text">
                        <i className="fa-solid fa-user-shield"></i>
                     </div>
                     <div className="text-center">
                        <h3 className="text-2xl font-black italic uppercase text-white">{f.name}</h3>
                        <p className="text-[10px] font-black text-white/20 uppercase mt-1">Rango: {f.topRank}</p>
                     </div>
                     <span className="px-6 py-2 bg-white/5 rounded-full text-[9px] font-black uppercase text-white/40 group-hover:bg-accent-color group-hover:text-white transition-all">DESAFIAR</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-12">
               <div className="flex items-center justify-center gap-8 md:gap-16">
                  <div className="flex flex-col items-center gap-4 text-center">
                     <div className="w-24 h-24 rounded-[2rem] border-2 border-accent-color bg-accent-color/5 flex items-center justify-center text-3xl accent-text shadow-[0_0_20px_rgba(114,28,36,0.3)]">
                        <i className="fa-solid fa-user-ninja"></i>
                     </div>
                     <p className="text-sm font-black uppercase italic text-white">{settings.userName}</p>
                  </div>

                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 italic font-black text-white/20">VS</div>

                  <div className="flex flex-col items-center gap-4 text-center">
                     <div className="w-24 h-24 rounded-[2rem] border-2 border-white/10 bg-white/5 flex items-center justify-center text-3xl text-white/20">
                        <i className="fa-solid fa-user"></i>
                     </div>
                     <p className="text-sm font-black uppercase italic text-white">{selectedFriend?.name}</p>
                  </div>
               </div>

               <div className="grid gap-6 max-w-2xl mx-auto">
                  {Object.values(MuscleGroup).filter(m => m !== MuscleGroup.CARDIO).map(m => {
                    const myW = myStats.muscleMaxWeights[m] || 0;
                    const friendW = selectedFriend?.topExercises.find(ex => ex.muscleGroup === m)?.weight || 0;
                    const diff = Math.abs(myW - friendW);
                    const iWin = myW > friendW;
                    const draw = myW === friendW && myW > 0;

                    return (
                      <div key={m} className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                         <div className="flex justify-between items-center relative z-10">
                            <div className="flex-1 text-left">
                               <p className="text-2xl font-black text-white tabular-nums">{myW}<span className="text-[10px] ml-1 opacity-20">KG</span></p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                               <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{m}</span>
                               <div className="flex items-center gap-4">
                                  {iWin ? <i className="fa-solid fa-trophy text-amber-500 animate-bounce"></i> : (draw ? <i className="fa-solid fa-handshake text-white/20"></i> : <div className="w-4"></div>)}
                                  <div className="px-3 py-1 rounded-md bg-white/5 text-[9px] font-black uppercase text-white/30">
                                     {diff > 0 ? (iWin ? `+${diff} KG` : `-${diff} KG`) : 'IGUAL'}
                                  </div>
                                  {!iWin && !draw && friendW > 0 ? <i className="fa-solid fa-trophy text-amber-500/20"></i> : <div className="w-4"></div>}
                               </div>
                            </div>
                            <div className="flex-1 text-right">
                               <p className="text-2xl font-black text-white/40 tabular-nums">{friendW}<span className="text-[10px] ml-1 opacity-10">KG</span></p>
                            </div>
                         </div>
                         {/* Barra visual central */}
                         <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
                            <div className="h-full accent-bg transition-all duration-1000" style={{ width: `${(myW / (myW + friendW || 1)) * 100}%` }}></div>
                            <div className="h-full bg-white/10 transition-all duration-1000" style={{ width: `${(friendW / (myW + friendW || 1)) * 100}%` }}></div>
                         </div>
                      </div>
                    );
                  })}
               </div>

               <div className="text-center">
                  <button 
                    onClick={() => setComparisonFriendId(null)}
                    className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    <i className="fa-solid fa-rotate-left mr-2"></i> CAMBIAR OPONENTE
                  </button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitiveView;
