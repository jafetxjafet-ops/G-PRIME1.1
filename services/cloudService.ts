
import { auth, db, firebase } from './firebase';
import { AppSettings, WorkoutRecord, Goal, Friend } from '../types';

export interface GlobalState {
  settings: AppSettings;
  workoutHistory: WorkoutRecord[];
  goals: Goal[];
  friends: Friend[];
  lastUpdated: string;
}

export const cloudService = {
  /**
   * Guarda el estado completo en Firestore y crea un backup.
   */
  // FIX: Changed 'state' type to 'any' to allow logging diverse data structures like PUSH_LOG in NotificationService.ts
  syncUserData: async (uid: string, state: any) => {
    try {
      const userRef = db.doc(`users/${uid}`);
      const dataToSave = {
        ...state,
        serverLastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      };

      // 1. Guardar estado principal
      await userRef.set(dataToSave, { merge: true });

      // 2. Crear backup diario
      const backupRef = db.collection(`users/${uid}/backups`);
      await backupRef.add({
        ...state,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log(`[G-CLOUD] Sync successful for user: ${uid}`);
      return true;
    } catch (error) {
      console.error("[G-CLOUD] Error syncing data:", error);
      return false;
    }
  },

  /**
   * Descarga el estado completo desde Firestore.
   */
  loadUserData: async (uid: string): Promise<GlobalState | null> => {
    try {
      const userRef = db.doc(`users/${uid}`);
      const userSnap = await userRef.get();

      if (userSnap.exists) {
        console.log(`[G-CLOUD] Data recovered for user: ${uid}`);
        return userSnap.data() as GlobalState;
      }
      return null;
    } catch (error) {
      console.error("[G-CLOUD] Error loading data:", error);
      return null;
    }
  },

  /**
   * Búsqueda de usuarios para el sistema social (Mocked with Firebase style)
   */
  searchUsers: async (query: string): Promise<any[]> => {
    // En una implementación real usaríamos query(collection(db, 'users'), where(...))
    return [];
  },

  /**
   * Responde a una solicitud de amistad.
   */
  respondToRequest: async (requestId: string, accepted: boolean) => {
    try {
      const requestRef = db.doc(`friendRequests/${requestId}`);
      await requestRef.set({ status: accepted ? 'accepted' : 'rejected' }, { merge: true });
      return true;
    } catch (error) {
      console.error("[G-CLOUD] Error responding to request:", error);
      return false;
    }
  }
};
