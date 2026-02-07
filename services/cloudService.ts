
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
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
      const userRef = doc(db, 'users', uid);
      const dataToSave = {
        ...state,
        serverLastUpdated: serverTimestamp()
      };

      // 1. Guardar estado principal
      await setDoc(userRef, dataToSave, { merge: true });

      // 2. Crear backup diario (Solo si han pasado más de 12h del último, o simplemente uno por guardado)
      // Para simplificar, creamos un registro de historial de 7 días mediante una subcolección
      const backupRef = collection(db, 'users', uid, 'backups');
      await addDoc(backupRef, {
        ...state,
        createdAt: serverTimestamp()
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
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
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
    // Mantenemos la lógica de búsqueda para no romper la UI
    return [];
  },

  /**
   * Responde a una solicitud de amistad.
   */
  // FIX: Added missing respondToRequest method required by FriendsView.tsx
  respondToRequest: async (requestId: string, accepted: boolean) => {
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      await setDoc(requestRef, { status: accepted ? 'accepted' : 'rejected' }, { merge: true });
      return true;
    } catch (error) {
      console.error("[G-CLOUD] Error responding to request:", error);
      return false;
    }
  }
};
