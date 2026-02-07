
import React, { useState, useEffect, useMemo } from 'react';
import { Friend, FriendRequest, Activity, WorkoutRecord } from '../types';
import { cloudService } from '../services/cloudService';
import { getRankColor, getRankIcon, RANK_NAMES } from '../utils/rankSystem';

interface FriendsViewProps {
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
  friendRequests: FriendRequest[];
  setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
  activityFeed: Activity[];
  onBack: () => void;
  onEncourage: (id: string) => void;
}

const FriendsView: React.FC<FriendsViewProps> = ({ 
  friends, 
  setFriends, 
  friendRequests, 
  setFriendRequests, 
  activityFeed,
  onBack,
  onEncourage
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'feed' | 'search' | 'requests'>('leaderboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewingFriend, setViewingFriend] = useState<Friend | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 3) {
        setIsSearching(true);
        const results = await cloudService.searchUsers(searchTerm);
        const filteredResults = results.filter(res => !friends.some(f => f.id === res.id));
        setSearchResults(filteredResults);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, friends]);

  const handleAcceptRequest = async (request: FriendRequest) => {
    await cloudService.respondToRequest(request.id, true);
    // En un entorno real, buscaríamos el perfil completo del usuario
    const newFriend: Friend = {
      id: request.fromId,
      name: request.fromName,
      level: request.fromLevel,
      topRank: RANK_NAMES[Math.min(19, request.fromLevel - 1)],
      streak: 0,
      topExercises: [],
      history: [],
      strongestMuscle: 'Pecho' as any,
      lastActive: new Date().toISOString()
    };
    setFriends(prev => [...prev, newFriend]);
    setFriendRequests(prev => prev.filter(r => r.id !== request.id));
  };

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => b.level - a.level);
  }, [friends]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 pb-20">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-4 glass-card rounded-2xl text-white/30 hover:text-white transition-all">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F5F5F5]">RED <span className="accent-text">SOCIAL G</span></h2>
          <p className="text-white/40 font-medium text-sm">Conéctate, compite y domina la legión sin barreras.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
        <button onClick={() => setActiveTab('leaderboard')} className={`px-6 py-3 rounded-t-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'leaderboard' ? 'bg-white/5 accent-text border-b-2 border-accent-color' : 'text-white/20'}`}>ALIADOS</button>
        <button onClick={() => setActiveTab('feed')} className={`px-6 py-3 rounded-t-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-white/5 accent-text border-b-2 border-accent-color' : 'text-white/20'}`}>FEED SOCIAL</button>
        <button onClick={() => setActiveTab('search')} className={`px-6 py-3 rounded-t-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'search' ? 'bg-white/5 accent-text border-b-2 border-accent-color' : 'text-white/20'}`}>BUSCAR</button>
        <button onClick={() => setActiveTab('requests')} className={`px-6 py-3 rounded-t-2xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'requests' ? 'bg-white/5 accent-text border-b-2 border-accent-color' : 'text-white/20'}`}>
          SOLICITUDES {friendRequests.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] flex items-center justify-center rounded-full border border-black font-black">{friendRequests.length}</span>}
        </button>
      </div>

      {activeTab === 'feed' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          {activityFeed.length === 0 ? (
            <div className="glass-card p-20 rounded-[3rem] text-center opacity-40">
               <i className="fa-solid fa-rss text-4xl mb-4"></i>
               <p className="font-black uppercase tracking-[0.2em]">El feed está en silencio. Motiva a tus amigos.</p>
            </div>
          ) : (
            activityFeed.map(act => (
              <div key={act.id} className="glass-card p-6 rounded-[2.5rem] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase text-white">{act.friendName}</p>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{new Date(act.date).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${act.type === 'pr' ? 'text-amber-500 bg-amber-500/10' : act.type === 'rank' ? 'text-emerald-500 bg-emerald-500/10' : 'text-white/10 bg-white/5'}`}>
                    <i className={`fa-solid ${act.type === 'pr' ? 'fa-crown' : act.type === 'rank' ? 'fa-trophy' : act.type === 'routine' ? 'fa-list-check' : 'fa-dumbbell'}`}></i>
                  </div>
                </div>
                <p className="text-sm font-bold text-white/70 italic leading-relaxed">"{act.message}"</p>
                <div className="pt-2 flex justify-between items-center">
                  <button 
                    onClick={() => onEncourage(act.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${act.hasEncouraged ? 'accent-bg text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                  >
                    <i className="fa-solid fa-fire"></i>
                    {act.hasEncouraged ? 'MOTIVADO' : 'MOTIVAR'} ({act.encouragements})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="grid gap-4 animate-in slide-in-from-bottom-4">
          {sortedFriends.map((f, idx) => (
            <div key={f.id} className="glass-card p-6 rounded-[2.5rem] flex items-center justify-between group hover:matte-border-active transition-all" onClick={() => setViewingFriend(f)}>
              <div className="flex items-center gap-6">
                <span className="text-xs font-black text-white/10 italic">#{idx + 1}</span>
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 overflow-hidden">
                  {f.profileImage ? <img src={f.profileImage} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-ninja"></i>}
                </div>
                <div>
                  <p className="text-lg font-black uppercase text-white italic">{f.name}</p>
                  <div className="flex gap-3">
                     <span className="text-[9px] font-black accent-text uppercase tracking-widest">NV. {f.level}</span>
                     <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{f.topRank}</span>
                  </div>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-white/10 group-hover:text-white transition-all"></i>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <input 
            type="text" 
            placeholder="ID de Guerrero o Nombre..."
            className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-black text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="grid gap-4">
            {searchResults.map(user => (
              <div key={user.id} className="glass-card p-6 rounded-[2.5rem] flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/10">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-white italic">{user.name}</h3>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">NV. {user.level} · {user.id}</p>
                  </div>
                </div>
                <button className="p-4 rounded-xl bg-white/5 text-white/40 hover:accent-bg hover:text-white transition-all">
                  <i className="fa-solid fa-user-plus"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Perfil de Amigo - Totalmente Público */}
      {viewingFriend && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6 overflow-y-auto">
           <div className="glass-card w-full max-w-2xl p-10 rounded-[4rem] border-t-8 accent-border shadow-2xl relative my-auto animate-in zoom-in-95">
              <button onClick={() => setViewingFriend(null)} className="absolute top-8 right-8 text-white/20 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-40 h-40 rounded-[3rem] bg-white/5 border-4 mb-6 flex items-center justify-center text-6xl overflow-hidden shadow-2xl" style={{ borderColor: getRankColor(viewingFriend.level <= 20 ? viewingFriend.level : 20) }}>
                    {viewingFriend.profileImage ? <img src={viewingFriend.profileImage} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-ninja text-white/5"></i>}
                  </div>
                  <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">{viewingFriend.name}</h3>
                  <p className="text-[10px] font-black accent-text uppercase tracking-[0.5em] mt-2">{viewingFriend.topRank}</p>
                  
                  <div className="flex gap-6 mt-8">
                    <div className="text-center">
                       <p className="text-[8px] font-black text-white/20 uppercase">FUERZA NV.</p>
                       <p className="text-2xl font-black text-white">{viewingFriend.level}</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[8px] font-black text-white/20 uppercase">RACHA</p>
                       <p className="text-2xl font-black text-amber-500">{viewingFriend.streak} D</p>
                    </div>
                  </div>

                  <div className="mt-8 w-full p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">MÚSCULO DOMINANTE</p>
                    <p className="text-xl font-black text-white uppercase italic">{viewingFriend.strongestMuscle || 'PECHO'}</p>
                  </div>
                </div>

                <div className="space-y-8 h-full">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-crown text-amber-500"></i> RÉCORDS PERSONALES
                    </p>
                    <div className="grid gap-3">
                      {viewingFriend.topExercises.map((ex, i) => (
                        <div key={i} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                           <div className="flex items-center gap-3">
                              <i className={`fa-solid ${getRankIcon(ex.rank || 1)} text-xs`} style={{ color: getRankColor(ex.rank || 1) }}></i>
                              <span className="text-[10px] font-black uppercase text-white/60">{ex.name}</span>
                           </div>
                           <span className="text-sm font-black text-white">{ex.weight}kg</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-clock-rotate-left"></i> ÚLTIMA ACTIVIDAD
                    </p>
                    <div className="grid gap-3">
                      {viewingFriend.history.slice(0, 3).map((h, i) => (
                        <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/5">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black uppercase text-white/40">{new Date(h.date).toLocaleDateString()}</span>
                              <span className="text-[10px] font-black accent-text">+{h.expEarned} EXP</span>
                           </div>
                           <p className="text-xs font-black uppercase text-white/80">{h.topExerciseName} @ {h.topWeight}kg</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                 <button className="py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white transition-all">Comparar Fuerza</button>
                 <button className="py-4 accent-btn rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl">Desafiar Guerrero</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FriendsView;
