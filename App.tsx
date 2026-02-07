
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ViewType, Goal, AppSettings, ThemeType, WorkoutRecord, TimerConfig, FriendRequest, Friend, Notification, Activity, ExpBreakdown, MuscleGroup, Title, RequirementType, ExerciseSnapshot } from './types';
import Dashboard from './components/Dashboard';
import ExerciseLibrary from './components/ExerciseLibrary';
import Sidebar from './components/Sidebar';
import SettingsView from './components/SettingsView';
import GoalsListView from './components/GoalsListView';
import WorkoutView from './components/WorkoutView';
import ProfileDrawer from './components/ProfileDrawer';
import StatisticsView from './components/StatisticsView';
import FriendsView from './components/FriendsView';
import TimersView from './components/TimersView';
import GlobalTimerOverlay from './components/GlobalTimerOverlay';
import NotificationCenter from './components/NotificationCenter';
import EditProfileModal from './components/EditProfileModal';
import LoginView from './components/LoginView';
import AchievementsView from './components/AchievementsView';
import WelcomeForm from './components/WelcomeForm';
import TutorialOverlay from './components/TutorialOverlay';
import SectionTutorial, { TutorialStep } from './components/SectionTutorial';
import ExerciseResultsFlow from './components/ExerciseResultsFlow';
import LevelUpOverlay from './components/LevelUpOverlay';
import CardioView from './components/CardioView';
import CompetitiveView from './components/CompetitiveView';
import WeeklyCardioSummary from './components/WeeklyCardioSummary';
import TitlesView from './components/TitlesView';
import TitleUnlockOverlay from './components/TitleUnlockOverlay';
import GoalCreator from './components/GoalCreator';
// Updated imports to use services/firebase which now exports auth and firebase (v8 style)
import { auth, firebase } from './services/firebase';
import { cloudService, GlobalState } from './services/cloudService';
import { TITLES_DATABASE } from './constants';

const THEME_CONFIGS: Record<ThemeType, { start: string, end: string, accent: string }> = {
  negro: { start: '#1A1A1A', end: '#121212', accent: '#721c24' }, 
  gris: { start: '#363636', end: '#262626', accent: '#94a3b8' },
  rojo: { start: '#3a0f12', end: '#1a0708', accent: '#721c24' },
  verde: { start: '#0d170d', end: '#050a05', accent: '#1b2e1b' },
  azul: { start: '#2E4053', end: '#212F3C', accent: '#2E4053' },
  amarillo: { start: '#C5A059', end: '#9C7F46', accent: '#C5A059' },
  lila: { start: '#967BB6', end: '#7A6296', accent: '#967BB6' },
  morado: { start: '#5B3A6F', end: '#442B53', accent: '#5B3A6F' },
  cafe: { start: '#4b3621', end: '#2a1e12', accent: '#4b3621' }
};

const getMonday = (d: Date) => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0,0,0,0);
  return monday.toISOString().split('T')[0];
};

const DEFAULT_SETTINGS: AppSettings = {
  accentColor: '#721c24',
  fontFamily: 'Inter',
  profileImage: null,
  userName: 'Guerrero',
  phoneNumber: '',
  theme: 'negro',
  totalExp: 0,
  expBarStyle: 'classic',
  expBarFillType: 'solid',
  expBarColor: '#C5A059',
  isLoggedIn: false,
  streak: 0,
  lastWorkoutDate: null,
  height: null,
  weight: null,
  hasCompletedTutorial: false,
  viewedTutorials: [],
  weeklyCardioDays: [],
  weeklyExpAccumulated: 0,
  currentWeekMonday: getMonday(new Date()),
  lastSentPushId: null,
  lastPushDate: null,
  trainingHourHabit: null,
  unlockedTitles: [],
  activeTitleId: null,
  totalWorkoutsCount: 0,
  totalPRsCount: 0
};

const getExpNeededForLevel = (lvl: number) => {
  return Math.round((50 + (Math.pow(lvl, 1.5) * 15)) * 0.85);
};

const App: React.FC = () => {
  // Use firebase.User for compatibility
  const [user, setUser] = useState<firebase.User | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('login');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // Missing states required by FriendsView
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpValue, setLevelUpValue] = useState(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [finishedWorkoutData, setFinishedWorkoutData] = useState<{ record: any, exp: ExpBreakdown } | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<{ days: number, bonus: number, bonusExp: number, oldTotal: number } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState<TimerConfig | null>(null);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [titlesQueue, setTitlesQueue] = useState<Title[]>([]);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const isSyncingRef = useRef(false);

  // CARGA INICIAL DESDE NUBE - Updated to v8 auth style
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const cloudData = await cloudService.loadUserData(firebaseUser.uid);
        if (cloudData) {
          setSettings(cloudData.settings);
          setWorkoutHistory(cloudData.workoutHistory || []);
          setGoals(cloudData.goals || []);
          setFriends(cloudData.friends || []);
          setActiveView(cloudData.settings.height ? 'dashboard' : 'welcome');
        } else {
          setActiveView('welcome');
        }
      } else {
        setUser(null);
        setActiveView('login');
      }
    });
    return () => unsubscribe();
  }, []);

  const syncToCloud = useCallback(async (stateToSync?: any) => {
    if (!user || isSyncingRef.current) return;
    
    isSyncingRef.current = true;
    setIsCloudSyncing(true);

    const state: GlobalState = {
      settings: stateToSync?.settings || settings,
      workoutHistory: stateToSync?.workoutHistory || workoutHistory,
      goals: stateToSync?.goals || goals,
      friends: stateToSync?.friends || friends,
      lastUpdated: new Date().toISOString()
    };

    await cloudService.syncUserData(user.uid, state);
    
    setTimeout(() => {
      isSyncingRef.current = false;
      setIsCloudSyncing(false);
    }, 1500);
  }, [user, settings, workoutHistory, goals, friends]);

  const getLevelStats = (totalExp: number) => {
    let currentTotalExp = totalExp;
    let lvl = 1;
    let needed = getExpNeededForLevel(lvl);
    while (currentTotalExp >= needed) {
      currentTotalExp -= needed;
      lvl++;
      needed = getExpNeededForLevel(lvl);
    }
    return { level: lvl, currentLevelExp: currentTotalExp, expNeededForNext: needed, expProgress: (currentTotalExp / needed) * 100 };
  };

  const levelStats = useMemo(() => getLevelStats(settings.totalExp), [settings.totalExp]);

  const evaluateTitles = (snapshots: ExerciseSnapshot[], currentHistory: WorkoutRecord[], currentLevel: number): Title[] => {
    const newlyUnlocked: Title[] = [];
    const totalVolume = currentHistory.reduce((acc, curr) => acc + curr.totalVolume, 0);
    const cardioSeconds = currentHistory.reduce((acc, curr) => acc + (curr.totalTimeUnderTension || 0), 0);
    const cardioSessions = currentHistory.filter(h => h.topWeight === 0 && (h.totalTimeUnderTension || 0) > 0).length;
    const prsCount = snapshots.filter(s => s.isPR).length;

    const getMaxWeight = (name: string) => {
      const todayMax = snapshots.find(s => s.name === name)?.newWeight || 0;
      const historyMax = Math.max(...currentHistory.filter(h => h.topExerciseName === name).map(h => h.topWeight), 0);
      return Math.max(todayMax, historyMax);
    };

    const bigThreeSum = getMaxWeight('Press banca plano') + getMaxWeight('Sentadilla') + getMaxWeight('Peso muerto');
    const lockedTitles = TITLES_DATABASE.filter(t => !settings.unlockedTitles.some(ut => ut.id === t.id));

    for (const title of lockedTitles) {
      let isMet = false;
      const { type, value, exerciseName } = title.requirement;
      switch (type) {
        case 'level': isMet = currentLevel >= value; break;
        case 'streak': isMet = settings.streak >= value; break;
        case 'volume_total': isMet = totalVolume >= value; break;
        case 'workouts_count': isMet = settings.totalWorkoutsCount + 1 >= value; break;
        case 'prs_count': isMet = (settings.totalPRsCount + prsCount) >= value; break;
        case 'cardio_time_total': isMet = cardioSeconds >= value; break;
        case 'cardio_sessions': isMet = cardioSessions >= value; break;
        case 'exercise_weight': if (exerciseName) isMet = getMaxWeight(exerciseName) >= value; break;
        case 'sum_big_three': isMet = bigThreeSum >= value; break;
        case 'friends_count': isMet = friends.length >= value; break;
      }
      if (isMet) newlyUnlocked.push(title);
    }
    return newlyUnlocked;
  };

  const applyTheme = useCallback((config: AppSettings) => {
    const root = document.documentElement;
    const themeConfig = THEME_CONFIGS[config.theme] || THEME_CONFIGS.negro;
    root.style.setProperty('--bg-start', themeConfig.start);
    root.style.setProperty('--bg-end', themeConfig.end);
    root.style.setProperty('--accent-color', config.accentColor);
    root.style.setProperty('--exp-fill-color', config.expBarColor);
    root.style.setProperty('--app-font', `'${config.fontFamily}', sans-serif`);
    document.body.style.background = `linear-gradient(135deg, ${themeConfig.start}, ${themeConfig.end})`;
  }, []);

  useEffect(() => {
    applyTheme(settings);
  }, [settings, applyTheme]);

  const finalizeWorkoutResults = async () => {
    if (!finishedWorkoutData) return;
    const { record, exp } = finishedWorkoutData;
    const newUnlocked = evaluateTitles(exp.exerciseSnapshots, workoutHistory, levelStats.level);
    const now = new Date();
    const todayID = now.toISOString().split('T')[0];
    const lastWorkoutID = settings.lastWorkoutDate ? new Date(settings.lastWorkoutDate).toISOString().split('T')[0] : null;
    
    let newStreak = settings.streak;
    if (lastWorkoutID !== todayID) {
      if (lastWorkoutID) {
        const lastDate = new Date(lastWorkoutID);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
      } else {
        newStreak = 1;
      }
    }

    const newRecord = { ...record, id: crypto.randomUUID(), date: now.toISOString(), expEarned: exp.totalExpEarned };
    const prsThisWorkout = exp.exerciseSnapshots.filter(s => s.isPR).length;
    const oldLevelStats = getLevelStats(settings.totalExp);
    const newTotalExp = settings.totalExp + exp.totalExpEarned;
    const newLevelStats = getLevelStats(newTotalExp);

    const updatedUnlockedTitles = [...settings.unlockedTitles, ...newUnlocked.map(t => ({ id: t.id, unlockedAt: now.toISOString() }))];

    const updatedSettings = { 
      ...settings, 
      totalExp: newTotalExp, 
      streak: newStreak, 
      lastWorkoutDate: now.toISOString(),
      totalWorkoutsCount: settings.totalWorkoutsCount + 1,
      totalPRsCount: settings.totalPRsCount + prsThisWorkout,
      unlockedTitles: updatedUnlockedTitles
    };

    const newHistory = [newRecord, ...workoutHistory];
    setWorkoutHistory(newHistory);
    setSettings(updatedSettings);

    if (newUnlocked.length > 0) {
      const newNotifs = newUnlocked.map(t => ({ id: crypto.randomUUID(), message: `👑 TÍTULO DESBLOQUEADO: ${t.name}`, date: now.toISOString(), type: 'title_unlocked' as const, read: false }));
      setNotifications(prev => [...newNotifs, ...prev]);
      setTitlesQueue(newUnlocked);
    }

    if (newLevelStats.level > oldLevelStats.level) { 
      setLevelUpValue(newLevelStats.level); 
      setShowLevelUp(true); 
    }
    
    setFinishedWorkoutData(null);
    setActiveView('dashboard');
    
    // Auto-Sync tras entrenamiento
    syncToCloud({ settings: updatedSettings, workoutHistory: newHistory, goals, friends });
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    syncToCloud({ settings: newSettings, workoutHistory, goals, friends });
  };

  const updateGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    syncToCloud({ settings, workoutHistory, goals: newGoals, friends });
  };

  const handleEncourage = (id: string) => {
    setActivityFeed(prev => prev.map(act => act.id === id ? { ...act, encouragements: act.encouragements + 1, hasEncouraged: true } : act));
  };

  const navigateTo = (view: ViewType) => { setActiveView(view); setIsDrawerOpen(false); };
  const activeTitle = useMemo(() => TITLES_DATABASE.find(t => t.id === settings.activeTitleId), [settings.activeTitleId]);
  const activeGoal = useMemo(() => goals.find(g => g.id === activeGoalId), [goals, activeGoalId]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  if (activeView === 'login') return <LoginView onLogin={() => {}} onGuest={() => setActiveView('welcome')} />;
  
  if (activeView === 'welcome') return (
    <WelcomeForm onComplete={(data) => { 
      const updated = { ...settings, ...data }; 
      setSettings(updated); 
      setActiveView('dashboard'); 
      setShowTutorial(true); 
      syncToCloud({ settings: updated, workoutHistory, goals, friends }); 
    }} />
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {showLevelUp && <LevelUpOverlay level={levelUpValue} onClose={() => setShowLevelUp(false)} />}
      {titlesQueue.length > 0 && <TitleUnlockOverlay title={titlesQueue[0]} onClose={() => setTitlesQueue(prev => prev.slice(1))} />}
      {weeklySummary && <WeeklyCardioSummary data={weeklySummary} onClose={() => setWeeklySummary(null)} getLevelStats={getLevelStats} settings={settings} />}
      
      <Sidebar activeView={activeView} onNavigate={navigateTo} level={levelStats.level} currentExp={levelStats.currentLevelExp} missingExp={levelStats.expNeededForNext - levelStats.currentLevelExp} expProgress={levelStats.expProgress} userName={settings.userName} streak={settings.streak} onEditProfile={() => setIsEditProfileOpen(true)} settings={settings} />
      
      <main className="flex-1 overflow-y-auto scroll-smooth relative">
        {/* INDICADOR DE NUBE CLOUD */}
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-black/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 transition-all duration-500 ${isCloudSyncing ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
           <i className="fa-solid fa-cloud-arrow-up text-emerald-500 animate-pulse"></i>
           <span className="text-[10px] font-black uppercase text-white tracking-widest">Progreso guardado en la nube ☁️</span>
        </div>

        {showTutorial && <TutorialOverlay onComplete={() => { const updated = {...settings, hasCompletedTutorial: true}; setSettings(updated); setShowTutorial(false); syncToCloud({settings: updated, workoutHistory, goals, friends}); }} />}
        {finishedWorkoutData && <ExerciseResultsFlow snapshots={finishedWorkoutData.exp.exerciseSnapshots} settings={settings} onComplete={finalizeWorkoutResults} />}
        
        <header className="p-4 md:px-8 border-b border-white/5 flex gap-4 items-center sticky top-0 z-30 bg-black/40 backdrop-blur-xl">
          <div className="relative">
            <button onClick={() => setIsDrawerOpen(true)} className="tutorial-profile w-14 h-14 rounded-full bg-white/5 overflow-hidden shadow-xl relative z-10 hover:scale-105 transition-transform">
              {settings.profileImage ? <img src={settings.profileImage} alt="P" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><i className="fa-solid fa-user text-xl"></i></div>}
            </button>
            {activeTitle && (
              <>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center z-20 shadow-lg animate-pulse-slow overflow-hidden">
                   <i className={`fa-solid ${activeTitle.icon} text-[10px]`} style={{ color: activeTitle.color }}></i>
                   <div className="absolute inset-0 opacity-20 bg-current" style={{ backgroundColor: activeTitle.color }}></div>
                </div>
                <div className="absolute -inset-1 rounded-full pointer-events-none z-0" style={{ boxShadow: `0 0 15px ${activeTitle.color}33` }}></div>
              </>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-white/60 truncate max-w-[120px]">{settings.userName}</span>
                {activeTitle && <span className="text-[8px] font-black uppercase tracking-[0.2em] italic" style={{ color: activeTitle.color }}>{activeTitle.name}</span>}
              </div>
              <div className="tutorial-exp space-y-1">
                <div className="flex justify-between items-end"><span className="text-[9px] font-black accent-text uppercase tracking-widest leading-none">NV. {levelStats.level}</span><span className="text-[7px] font-bold text-white/20 uppercase leading-none">{levelStats.currentLevelExp}/{levelStats.expNeededForNext} EXP</span></div>
                <div className={`exp-bar-container exp-style-${settings.expBarStyle}`}>
                  <div 
                    className={`exp-bar-fill exp-fill-${settings.expBarFillType}`} 
                    style={{ width: `${levelStats.expProgress}%`, backgroundColor: 'var(--exp-fill-color)' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => navigateTo('notifications')} className="relative p-3 glass-card rounded-xl">
            <i className="fa-solid fa-bell text-white/20"></i>
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border border-black text-[8px] font-black flex items-center justify-center">{unreadCount}</span>}
          </button>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto view-transition-enter mb-24">
          {activeView === 'dashboard' && <Dashboard activeGoal={activeGoal} goalsCount={goals.length} onNavigate={navigateTo} notifications={notifications.filter(n => !n.read).slice(0, 2)} onRemoveNotification={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))} streak={settings.streak} />}
          {activeView === 'friends' && (
            <FriendsView 
              friends={friends} 
              setFriends={setFriends} 
              friendRequests={friendRequests}
              setFriendRequests={setFriendRequests}
              activityFeed={activityFeed}
              onBack={() => navigateTo('dashboard')}
              onEncourage={handleEncourage}
            />
          )}
          {activeView === 'notifications' && <NotificationCenter notifications={notifications} onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} onBack={() => navigateTo('dashboard')} />}
          {activeView === 'active-workout' && <WorkoutView activeGoal={activeGoal} workoutHistory={workoutHistory} streak={settings.streak} onFinish={(record, exp) => setFinishedWorkoutData({ record, exp })} onCancel={() => navigateTo('dashboard')} />}
          {activeView === 'cardio' && <CardioView onFinish={(record, exp) => setFinishedWorkoutData({ record, exp })} onCancel={() => navigateTo('dashboard')} streak={settings.streak} />}
          {activeView === 'competitive' && <CompetitiveView friends={friends} workoutHistory={workoutHistory} settings={settings} onBack={() => navigateTo('dashboard')} />}
          {activeView === 'settings' && <SettingsView settings={settings} setSettings={updateSettings} onLogout={() => auth.signOut()} onReset={() => { localStorage.clear(); window.location.reload(); }} />}
          {activeView === 'achievements' && <AchievementsView level={levelStats.level} onBack={() => navigateTo('dashboard')} />}
          {activeView === 'timers' && <TimersView onStartTimer={setActiveTimer} />}
          {activeView === 'goals-list' && <GoalsListView goals={goals} activeGoalId={activeGoalId} onToggleGoal={setActiveGoalId} onDeleteGoal={(id) => updateGoals(goals.filter(g => g.id !== id))} onBack={() => navigateTo('dashboard')} />}
          {activeView === 'routines' && <ExerciseLibrary workoutHistory={workoutHistory} />}
          {activeView === 'statistics' && <StatisticsView workoutHistory={workoutHistory} settings={settings} onBack={() => navigateTo('dashboard')} />}
          {activeView === 'titles' && <TitlesView settings={settings} setSettings={updateSettings} onBack={() => navigateTo('dashboard')} />}
          {activeView === 'create-goal' && <GoalCreator onSave={(g) => { const n = [g, ...goals]; setGoals(n); navigateTo('dashboard'); syncToCloud({settings, workoutHistory, goals: n, friends}); }} onCancel={() => navigateTo('dashboard')} />}
        </div>
        
        {activeView !== 'active-workout' && activeView !== 'cardio' && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-4 items-end z-40">
            <button onClick={() => navigateTo('cardio')} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl text-white shadow-2xl flex items-center justify-center border border-white/10 hover:accent-bg transition-all animate-in slide-in-from-bottom-2">
              <i className="fa-solid fa-person-running text-xl"></i>
            </button>
            <button onClick={() => navigateTo('active-workout')} className="tutorial-fab w-16 h-16 rounded-full accent-btn text-white shadow-2xl flex items-center justify-center animate-bounce-slow">
              <i className="fa-solid fa-plus text-2xl"></i>
            </button>
          </div>
        )}
      </main>
      {isDrawerOpen && <ProfileDrawer onClose={() => setIsDrawerOpen(false)} onNavigate={navigateTo} settings={settings} level={levelStats.level} currentExp={levelStats.currentLevelExp} missingExp={levelStats.expNeededForNext - levelStats.currentLevelExp} expProgress={levelStats.expProgress} goalsCount={goals.length} onEditProfile={() => { setIsDrawerOpen(false); setIsEditProfileOpen(true); }} activeTitle={activeTitle} />}
      {isEditProfileOpen && <EditProfileModal settings={settings} onClose={() => setIsEditProfileOpen(false)} onSave={(name, img, phone, h, w) => { const updated = { ...settings, userName: name, profileImage: img, phoneNumber: phone, height: h, weight: w }; setSettings(updated); syncToCloud({settings: updated, workoutHistory, goals, friends}); }} />}
      {activeTimer && <GlobalTimerOverlay config={activeTimer} onClose={() => setActiveTimer(null)} />}
    </div>
  );
};

export default App;
