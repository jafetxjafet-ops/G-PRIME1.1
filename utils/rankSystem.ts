
import { RankArchetype, ExerciseMetric } from '../types';

export interface RankInfo {
  level: number;
  name: string;
  color: string;
  icon: string;
  nextThreshold: number;
}

export const RANK_NAMES = [
  "Recluta de Hierro", "Aspirante", "Aprendiz de Fuerza", "Iniciado", "Practicante Fiel", // 1-5
  "Guerrero de Bronce", "Combatiente", "Veterano del Gym", "Atleta de Acero", "Especialista Plata", // 6-10
  "Maestro de Técnica", "Destructor de Límites", "Elite Carmín", "Comandante de Pesas", "Gran Maestro Oro", // 11-15
  "Leyenda Viviente", "Semidiós de la Fuerza", "Titán del Olimpo", "Avatar del Poder", "DIVINO" // 16-20
];

export const getRankColor = (rank: number): string => {
  if (rank <= 5) return '#8d6e63'; // Hierro Mate
  if (rank <= 10) return '#b0bec5'; // Plata Mate
  if (rank <= 15) return '#C5A059'; // Oro Mate
  return '#721c24'; // Carmín Diamante
};

export const getRankIcon = (rank: number): string => {
  if (rank <= 3) return 'fa-shield-halved';
  if (rank <= 5) return 'fa-shield';
  if (rank <= 8) return 'fa-shield-heart';
  if (rank <= 12) return 'fa-shield-virus';
  if (rank <= 15) return 'fa-award';
  if (rank <= 18) return 'fa-crown';
  return 'fa-gem';
};

export const getRankEffectClass = (rank: number): string => {
  if (rank >= 20) return 'border-2 border-[#721c24] shadow-[0_0_20px_rgba(114,28,36,0.4)] animate-pulse';
  if (rank >= 15) return 'border-2 border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.2)]';
  if (rank >= 10) return 'border-2 border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.2)]';
  return 'border border-white/5';
};

export const calculateEstimated1RM = (weight: number, reps: number): number => {
  if (reps === 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

export const calculateRank = (
  archetype: RankArchetype, 
  metricType: ExerciseMetric, 
  weight: number = 0, 
  reps: number = 1, 
  seconds: number = 0
): number => {
  let score = 0;
  let multiplier = 1;

  if (metricType === ExerciseMetric.REPS) {
    score = calculateEstimated1RM(weight, reps);
    switch (archetype) {
      case RankArchetype.STRENGTH: multiplier = 15; break; 
      case RankArchetype.ISOLATION: multiplier = 6; break; 
      case RankArchetype.BODYWEIGHT: multiplier = 10; break; 
      case RankArchetype.COMBAT: multiplier = 5; break;
    }
  } else if (metricType === ExerciseMetric.TIME) {
    score = seconds;
    multiplier = 15; // Threshold for rank increments for time
  } else if (metricType === ExerciseMetric.TIME_WEIGHT) {
    score = weight * (seconds / 30); // Normalized time/weight volume
    multiplier = 10;
  }
  
  const rank = Math.floor(score / multiplier) + 1;
  return Math.min(20, Math.max(1, rank));
};

export const getThresholdForRank = (archetype: RankArchetype, metricType: ExerciseMetric, rank: number): number => {
  let multiplier = 1;
  if (metricType === ExerciseMetric.REPS) {
    switch (archetype) {
      case RankArchetype.STRENGTH: multiplier = 15; break;
      case RankArchetype.ISOLATION: multiplier = 6; break;
      case RankArchetype.BODYWEIGHT: multiplier = 10; break;
      case RankArchetype.COMBAT: multiplier = 5; break;
    }
  } else if (metricType === ExerciseMetric.TIME) {
    multiplier = 15;
  } else if (metricType === ExerciseMetric.TIME_WEIGHT) {
    multiplier = 10;
  }
  return rank * multiplier;
};

export const getRankProgress = (
  archetype: RankArchetype, 
  metricType: ExerciseMetric, 
  weight: number = 0, 
  reps: number = 1, 
  seconds: number = 0
): number => {
  let score = 0;
  if (metricType === ExerciseMetric.REPS) {
    score = calculateEstimated1RM(weight, reps);
  } else if (metricType === ExerciseMetric.TIME) {
    score = seconds;
  } else if (metricType === ExerciseMetric.TIME_WEIGHT) {
    score = weight * (seconds / 30);
  }

  const currentRank = calculateRank(archetype, metricType, weight, reps, seconds);
  if (currentRank >= 20) return 100;

  const currentThreshold = getThresholdForRank(archetype, metricType, currentRank - 1);
  const nextThreshold = getThresholdForRank(archetype, metricType, currentRank);
  
  const progress = ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
};
