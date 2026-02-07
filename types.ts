
export enum MuscleGroup {
  PECHO = 'Pecho',
  ESPALDA = 'Espalda',
  PIERNAS = 'Piernas',
  HOMBROS = 'Hombros',
  BRAZOS = 'Brazos',
  ABDOMEN = 'Abdomen',
  CORE = 'Core',
  AGARRE = 'Agarre',
  FULL_BODY = 'Full Body',
  CARDIO = 'Cardio'
}

export enum CombatSpecialty {
  BOXEO = 'Boxeo',
  MMA = 'MMA',
  JUDO_WRESTLING = 'Judo / Wrestling',
  BJJ = 'BJJ / Grappling',
  KICKBOXING = 'Kickboxing / Muay Thai',
  CALISTENIA = 'Calistenia'
}

export enum RankArchetype {
  STRENGTH = 'strength',
  ISOLATION = 'isolation',
  BODYWEIGHT = 'bodyweight',
  COMBAT = 'combat',
  ENDURANCE = 'endurance'
}

export enum ExerciseMetric {
  REPS = 'reps',
  TIME = 'time',
  TIME_WEIGHT = 'time_weight'
}

export type RequirementType = 
  | 'level' 
  | 'streak' 
  | 'volume_total' 
  | 'volume_daily' 
  | 'workouts_count' 
  | 'exercise_weight' 
  | 'cardio_time_total' 
  | 'cardio_sessions' 
  | 'prs_count' 
  | 'friends_count'
  | 'sum_big_three';

export interface Title {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'Fuerza' | 'Constancia' | 'Cardio' | 'Progreso' | 'Social';
  description: string;
  requirement: {
    type: RequirementType;
    value: number;
    exerciseName?: string; 
  };
}

export interface UnlockedTitle {
  id: string;
  unlockedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
  specialties?: CombatSpecialty[];
  rankArchetype: RankArchetype;
  metricType: ExerciseMetric;
  nivel: number;
  exp: number;
  exp_necesaria: number;
  rango: number;
  porcentaje: number;
}

export interface GoalExercise extends Exercise {
  targetWeight: number;
  targetReps: number;
  targetSeconds?: number;
}

export interface Goal {
  id: string;
  title: string;
  deadline: string;
  exercises: GoalExercise[];
  createdAt: string;
  isActive: boolean;
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  seconds?: number;
}

export interface WorkoutExercise extends Exercise {
  sets: WorkoutSet[];
}

export interface ExpBreakdown {
  volumeExp: number;
  goalsBonus: number;
  loadBonus: number;
  prBonus: number;
  goalProgressionBonus: number;
  streakMultiplier: number;
  totalExpEarned: number;
  exerciseSnapshots: ExerciseSnapshot[];
}

export interface ExerciseSnapshot {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  archetype: RankArchetype;
  metricType: ExerciseMetric;
  expEarned: number;
  oldWeight: number;
  newWeight: number;
  oldReps: number;
  newReps: number;
  oldSeconds: number;
  newSeconds: number;
  didRankUp: boolean;
  isPR: boolean;
  isGoalProgression: boolean;
}

export interface WorkoutRecord {
  id: string;
  date: string;
  totalVolume: number;
  exerciseCount: number;
  topExerciseName: string;
  topWeight: number;
  totalTimeUnderTension?: number;
  achievedRank?: number;
  expEarned?: number;
}

export interface Friend {
  id: string;
  name: string;
  phoneNumber?: string;
  level: number;
  topRank: string;
  streak: number;
  profileImage?: string;
  themeColor?: string;
  topExercises: { name: string; weight: number; rank?: number; muscleGroup?: MuscleGroup }[];
  history: WorkoutRecord[];
  strongestMuscle: MuscleGroup;
  lastActive: string;
  canSeeStats?: boolean;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromPhone: string;
  fromLevel: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Notification {
  id: string;
  message: string;
  date: string;
  type: 'surpassed' | 'request' | 'workout_finished' | 'rank_up' | 'streak' | 'routine_added' | 'pr_broken' | 'push_motivation' | 'title_unlocked';
  friendName?: string;
  read: boolean;
  encouraged?: boolean;
}

export interface Activity {
  id: string;
  friendId: string;
  friendName: string;
  type: 'workout' | 'rank' | 'streak' | 'routine' | 'pr';
  message: string;
  date: string;
  themeColor: string;
  encouragements: number;
  hasEncouraged: boolean;
}

export interface TimerConfig {
  id: string;
  name: string;
  workTime: number; 
  restTime: number; 
  rounds: number;
}

export type ThemeType = 'negro' | 'rojo' | 'amarillo' | 'verde' | 'azul' | 'lila' | 'morado' | 'gris' | 'cafe';

export type ExpBarStyle = 'classic' | 'cyber' | 'industrial' | 'radiant' | 'prestige';
export type ExpBarFillType = 'solid' | 'gradient' | 'segmented';

export interface AppSettings {
  accentColor: string;
  fontFamily: string;
  profileImage: string | null;
  userName: string;
  phoneNumber: string;
  theme: ThemeType;
  totalExp: number;
  expBarStyle: ExpBarStyle;
  expBarFillType: ExpBarFillType;
  expBarColor: string;
  isLoggedIn: boolean;
  accountEmail?: string;
  streak: number;
  lastWorkoutDate: string | null;
  height: number | null;
  weight: number | null;
  hasCompletedTutorial: boolean;
  viewedTutorials: string[];
  weeklyCardioDays: string[]; 
  weeklyExpAccumulated: number;
  currentWeekMonday: string;
  lastSentPushId: number | null;
  lastPushDate: string | null;
  trainingHourHabit: number | null;
  unlockedTitles: UnlockedTitle[];
  activeTitleId: string | null;
  totalWorkoutsCount: number;
  totalPRsCount: number;
}

export type ViewType = 'dashboard' | 'goals-list' | 'routines' | 'create-goal' | 'settings' | 'active-workout' | 'statistics' | 'friends' | 'timers' | 'notifications' | 'login' | 'achievements' | 'welcome' | 'cardio' | 'competitive' | 'titles';
