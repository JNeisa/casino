// src/services/roulette/rouletteService.ts - VERSION MEJORADA
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import FirebaseService from '../firebase/config';
import { RouletteResult, Sector, RouletteSubmission } from './types';
import { SECTORS, getSector, isValidRouletteNumber } from '../../utils/roulette';

export class RouletteService {
  private firebaseService: FirebaseService;
  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  /**
   * Submit a new roulette number with better error handling
   */
  async submitNumber(submission: RouletteSubmission): Promise<void> {
    if (!this.firebaseService.isInitialized()) {
      throw new Error('Firebase no está inicializado');
    }

    const { number, userId } = submission;

    // Validate number
    if (!isValidRouletteNumber(number)) {
      throw new Error('Número inválido. Por favor, ingrese un número del 0, 00 o del 1-36.');
    }

    // Check daily limit (80 submissions)
    const today = new Date();
    try {
      const dailyCount = await this.getDailySubmissionCount(today);
      
      if (dailyCount >= 80) {
        throw new Error('El límite de 80 números por día ya ha sido alcanzado.');
      }
    } catch (error) {
      console.warn('Could not check daily limit:', error);
      // Continue anyway, let server-side validation handle it
    }

    const sector = getSector(number);
    if (!sector) {
      throw new Error('No se pudo determinar el sector para este número.');
    }

    const db = this.firebaseService.getFirestore();
    const appId = this.firebaseService.getAppId();
    const resultsCollection = collection(db, `${appId}/data/roulette-results`);

    try {
      await addDoc(resultsCollection, {
        number,
        sector,
        timestamp: Timestamp.fromDate(new Date()),
        userId
      });
      console.log('Number submitted successfully:', { number, sector });
    } catch (error) {
      console.error('Error submitting number:', error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          throw new Error('Sin permisos para escribir datos. Verifica las reglas de Firestore.');
        } else if (error.message.includes('unavailable')) {
          throw new Error('Servicio de Firebase no disponible. Intenta más tarde.');
        } else if (error.message.includes('unauthenticated')) {
          throw new Error('Usuario no autenticado. Recarga la página.');
        }
      }
      
      throw new Error('Error al enviar el número. Verifica tu conexión.');
    }
  }

  /**
   * Get results for a specific date with better error handling
   */
  subscribeToDateResults(
    date: Date,
    callback: (results: RouletteResult[]) => void,
    errorCallback?: (error: string) => void
  ): () => void {
    if (!this.firebaseService.isInitialized()) {
      const error = 'Firebase no está inicializado';
      console.error(error);
      errorCallback?.(error);
      return () => {};
    }

    // Unsubscribe from previous listener
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const db = this.firebaseService.getFirestore();
    const appId = this.firebaseService.getAppId();
    
    console.log('Setting up listener for date:', date, 'appId:', appId);

    try {
      const resultsCollection = collection(db, `${appId}/data/roulette-results`);

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      console.log('Date range:', { startOfDay, endOfDay });

      // Try without orderBy first (in case index doesn't exist)
      const q = query(
        resultsCollection,
        where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
        where('timestamp', '<', Timestamp.fromDate(endOfDay))
      );

      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('Received snapshot with', snapshot.docs.length, 'documents');
          
          const results: RouletteResult[] = [];
          snapshot.docs.forEach((doc, index) => {
            try {
              const data = doc.data();
              console.log('Processing document:', doc.id, data);
              
              // Handle timestamp conversion safely
              let timestamp: Date;
              if (data.timestamp && typeof data.timestamp.toDate === 'function') {
                timestamp = data.timestamp.toDate();
              } else if (data.timestamp instanceof Date) {
                timestamp = data.timestamp;
              } else {
                timestamp = new Date(); // Fallback
                console.warn('Invalid timestamp format for doc:', doc.id);
              }

              results.push({
                id: doc.id,
                number: String(data.number || ''),
                sector: data.sector as Sector,
                timestamp,
                userId: data.userId || '',
                spin: index + 1
              });
            } catch (docError) {
              console.error('Error processing document:', doc.id, docError);
            }
          });

          // Sort by timestamp to ensure correct spin order
          results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          
          // Reassign spin numbers after sorting
          const sortedResults = results.map((result, index) => ({
            ...result,
            spin: index + 1
          }));

          console.log('Processed results:', sortedResults);
          callback(sortedResults);
        },
        (error) => {
          console.error('Firestore listener error:', error);
          
          let errorMessage = 'Error al obtener datos en tiempo real.';
          
          if (error.code === 'permission-denied') {
            errorMessage = 'Sin permisos para leer datos. Verifica las reglas de Firestore.';
          } else if (error.code === 'unavailable') {
            errorMessage = 'Servicio Firebase no disponible. Intenta más tarde.';
          } else if (error.code === 'unauthenticated') {
            errorMessage = 'Usuario no autenticado. Recarga la página.';
          } else if (error.code === 'failed-precondition') {
            errorMessage = 'Índice de base de datos no disponible. Verifica la configuración.';
          }
          
          errorCallback?.(errorMessage);
        }
      );

      return () => {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      };

    } catch (error) {
      const errorMessage = 'Error al configurar el listener de datos.';
      console.error('Setup error:', error);
      errorCallback?.(errorMessage);
      return () => {};
    }
  }

  /**
   * Get daily submission count with fallback
   */
  private async getDailySubmissionCount(date: Date): Promise<number> {
    try {
      const db = this.firebaseService.getFirestore();
      const appId = this.firebaseService.getAppId();
      const resultsCollection = collection(db, `${appId}/data/roulette-results`);

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const q = query(
        resultsCollection,
        where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
        where('timestamp', '<', Timestamp.fromDate(endOfDay))
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.length;
    } catch (error) {
      console.error('Error getting daily count:', error);
      return 0; // Return 0 as fallback
    }
  }

  /**
   * Test Firebase connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.firebaseService.isInitialized()) {
        return { success: false, message: 'Firebase no inicializado' };
      }

      const db = this.firebaseService.getFirestore();
      const appId = this.firebaseService.getAppId();
      const testCollection = collection(db, `${appId}/data/roulette-results`);
      
      // Try to read from the collection (this will fail if permissions are wrong)
      const q = query(testCollection, where('timestamp', '>', new Date('2020-01-01')));
      await getDocs(q);
      
      return { success: true, message: 'Conexión exitosa a Firebase' };
    } catch (error: any) {
      console.error('Connection test failed:', error);
      
      if (error.code === 'permission-denied') {
        return { 
          success: false, 
          message: 'Sin permisos de lectura. Verifica las reglas de Firestore.' 
        };
      } else if (error.code === 'unavailable') {
        return { 
          success: false, 
          message: 'Firebase no disponible. Verifica tu conexión.' 
        };
      }
      
      return { 
        success: false, 
        message: `Error de conexión: ${error.message || 'Desconocido'}` 
      };
    }
  }

  /**
   * Get statistics for results
   */
  getStatistics(results: RouletteResult[]) {
    const sectorCounts: Record<Sector, number> = { A: 0, B: 0, C: 0, D: 0 };
    const numberCounts: Record<string, number> = {};

    // Initialize number counts
    Object.values(SECTORS).flat().forEach(num => {
      numberCounts[num] = 0;
    });

    // Count occurrences
    results.forEach(result => {
      if (result.sector && sectorCounts.hasOwnProperty(result.sector)) {
        sectorCounts[result.sector]++;
      }
      if (result.number) {
        numberCounts[result.number] = (numberCounts[result.number] || 0) + 1;
      }
    });

    return {
      sectorCounts,
      numberCounts,
      totalSpins: results.length,
      lastSpin: results[results.length - 1]
    };
  }

  /**
   * Cleanup subscriptions
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export default RouletteService;