
import React, { useState, useMemo } from 'react';
import { MuscleGroup, Goal, Exercise, GoalExercise } from '../types';
import { EXERCISES_DATABASE } from '../constants';

interface GoalCreatorProps {
  onSave: (goal: Goal) => void;
  onCancel: () => void;
}

const GoalCreator: React.FC<GoalCreatorProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<GoalExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<MuscleGroup | 'Todos'>('Todos');

  const muscleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(MuscleGroup).forEach(group => {
      counts[group] = EXERCISES_DATABASE.filter(ex => ex.muscleGroup === group).length;
    });
    return counts;
  }, []);

  const filteredExercises = useMemo(() => {
    return EXERCISES_DATABASE.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'Todos' || ex.muscleGroup === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, selectedFilter]);

  const toggleExercise = (ex: Exercise) => {
    if (selectedExercises.find(item => item.id === ex.id)) {
      setSelectedExercises(prev => prev.filter(item => item.id !== ex.id));
    } else {
      setSelectedExercises(prev => [...prev, { ...ex, targetWeight: 0, targetReps: 0 }]);
    }
  };

  const updateTarget = (id: string, field: 'targetWeight' | 'targetReps', value: number) => {
    setSelectedExercises(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    if (!title || !deadline || selectedExercises.length === 0) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      deadline,
      exercises: selectedExercises,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    onSave(newGoal);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-[#F5F5F5]">NUEVA <span className="accent-text">META</span></h2>
        <button onClick={onCancel} className="text-white/20 hover:text-white transition-colors p-2">
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Título de la Meta</label>
            <input 
              type="text" 
              placeholder="Ej: Powerlifting 2025"
              className="w-full bg-white/5 border border-white/5 focus:matte-border-active outline-none p-5 rounded-2xl transition-all text-lg font-black uppercase text-[#F5F5F5] placeholder:text-white/10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Fecha Límite</label>
            <input 
              type="date" 
              className="w-full bg-white/5 border border-white/5 focus:matte-border-active outline-none p-5 rounded-2xl transition-all accent-text text-[#F5F5F5]"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Objetivos Seleccionados ({selectedExercises.length})</label>
            {selectedExercises.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-12 text-center text-white/20 text-xs font-bold uppercase tracking-widest border-dashed">
                Selecciona movimientos del panel
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedExercises.map(ex => (
                  <div key={ex.id} className="glass-card border border-white/5 p-5 rounded-2xl animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-black italic uppercase text-sm text-[#F5F5F5]">{ex.name}</span>
                      <button onClick={() => toggleExercise(ex)} className="text-white/20 hover:text-red-400 transition-colors">
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] text-white/20 uppercase font-black tracking-widest block ml-1">Peso (kg)</span>
                        <input 
                          type="number" 
                          className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-center font-black accent-text text-lg focus:matte-border-active outline-none"
                          value={ex.targetWeight || ''}
                          onChange={(e) => updateTarget(ex.id, 'targetWeight', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-white/20 uppercase font-black tracking-widest block ml-1">Reps</span>
                        <input 
                          type="number" 
                          className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-center font-black accent-text text-lg focus:matte-border-active outline-none"
                          value={ex.targetReps || ''}
                          onChange={(e) => updateTarget(ex.id, 'targetReps', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] border border-white/5 flex flex-col h-[600px] shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 space-y-5 bg-black/10">
              <h3 className="font-black italic uppercase text-white/50 text-sm tracking-widest">Añadir Movimientos</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filtrar..."
                  className="w-full bg-white/5 border border-white/5 outline-none pl-12 pr-4 py-3 rounded-xl text-xs font-bold text-[#F5F5F5]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/10"></i>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setSelectedFilter('Todos')}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedFilter === 'Todos' ? 'accent-bg text-white border-transparent' : 'bg-white/5 text-white/30 border-white/5'}`}
                >
                  TODOS ({EXERCISES_DATABASE.length})
                </button>
                {Object.values(MuscleGroup).map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedFilter(m as any)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedFilter === m ? 'accent-bg text-white border-transparent' : 'bg-white/5 text-white/30 border-white/5'}`}
                  >
                    {m} ({muscleCounts[m]})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid gap-2 custom-scrollbar">
              {filteredExercises.map(ex => {
                const isSelected = selectedExercises.some(s => s.id === ex.id);
                return (
                  <button 
                    key={ex.id}
                    onClick={() => toggleExercise(ex)}
                    className={`flex items-center justify-between p-5 rounded-2xl text-left transition-all border ${isSelected ? 'bg-white/10 border-white/20' : 'hover:bg-white/5 border-transparent'}`}
                  >
                    <div>
                      <p className={`font-black uppercase italic text-sm ${isSelected ? 'accent-text' : 'text-[#F5F5F5]'}`}>{ex.name}</p>
                      <p className="text-[9px] uppercase text-white/20 font-black tracking-widest">{ex.muscleGroup}</p>
                    </div>
                    <i className={`fa-solid ${isSelected ? 'fa-circle-check accent-text text-xl' : 'fa-circle-plus text-white/5 text-xl'}`}></i>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 pt-6 border-t border-white/5">
        <button onClick={onCancel} className="px-6 py-3 font-black uppercase text-xs text-white/20 hover:text-white transition-colors">Cancelar</button>
        <button onClick={handleSave} className="accent-btn text-white px-12 py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Registrar Meta</button>
      </div>
    </div>
  );
};

export default GoalCreator;
