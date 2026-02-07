
import { MOTIVATIONAL_PUSH_MESSAGES } from '../constants';
import { AppSettings, WorkoutRecord } from '../types';
import { cloudService } from './cloudService';

class NotificationService {
  private lastMsgIdx: number = -1;

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  private getRandomMessage(): string {
    let idx = Math.floor(Math.random() * MOTIVATIONAL_PUSH_MESSAGES.length);
    while (idx === this.lastMsgIdx) {
      idx = Math.floor(Math.random() * MOTIVATIONAL_PUSH_MESSAGES.length);
    }
    this.lastMsgIdx = idx;
    return MOTIVATIONAL_PUSH_MESSAGES[idx];
  }

  async sendPush(title: string, body: string, icon: string = 'logo.png') {
    if (Notification.permission !== 'granted') return;

    // Vibración (Androd style: [vibrate, pause, vibrate])
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    const registration = await navigator.serviceWorker.ready;
    // Fix: Cast the options object to any to avoid TypeScript errors regarding 'vibrate' or 'badge'
    // not existing on the standard NotificationOptions type in some environments.
    registration.showNotification(title, {
      body,
      icon,
      badge: icon,
      vibrate: [200, 100, 200],
      tag: 'gymg-motivation',
      data: { url: window.location.origin }
    } as any);

    // Log to cloud
    cloudService.syncUserData('PUSH_LOG', { title, body, date: new Date().toISOString() });
  }

  checkTriggers(settings: AppSettings, workoutHistory: WorkoutRecord[], expProgress: number) {
    const now = new Date();
    const lastWorkout = settings.lastWorkoutDate ? new Date(settings.lastWorkoutDate) : null;
    const hoursSinceLast = lastWorkout ? (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60) : 999;

    // Prevenir spam: solo un push cada 4 horas
    if (settings.lastPushDate) {
      const lastPush = new Date(settings.lastPushDate);
      if ((now.getTime() - lastPush.getTime()) / (1000 * 60 * 60) < 4) return null;
    }

    // Trigger: Cerca de subir nivel (>85%)
    if (expProgress > 85 && expProgress < 99) {
      return { title: '🚀 NIVEL INMINENTE', body: 'Estás a nada de tu ascenso. No te detengas ahora.' };
    }

    // Trigger: Horario habitual (Si se ha definido un hábito)
    if (settings.trainingHourHabit !== null) {
      const currentHour = now.getHours();
      if (currentHour === settings.trainingHourHabit - 1) {
        return { title: '⚔️ PREPÁRATE', body: 'Es casi la hora. El hierro te está llamando.' };
      }
    }

    // Trigger: Inactividad 48h (Crítico)
    if (hoursSinceLast > 48) {
      return { title: '💀 ALERTA DE ATROFIA', body: 'Dos días sin rastro de ti. ¿Te rendiste o qué?' };
    }

    // Trigger: Inactividad 24h
    if (hoursSinceLast > 24) {
      return { title: '🔥 MANTÉN LA LLAMA', body: this.getRandomMessage() };
    }

    // Trigger: Pérdida de racha (Si pasaron más de 48h y racha > 0)
    if (hoursSinceLast > 36 && settings.streak > 0) {
      return { title: '⚡ RACHA EN PELIGRO', body: `Tu racha de ${settings.streak} días está a punto de morir. ¡Entrena ya!` };
    }

    return null;
  }
}

export const notificationService = new NotificationService();
