// src/services/firebase/firestore.ts
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp,
  orderBy,
  Unsubscribe,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';
import FirebaseService from './config';

export class FirestoreService {
  private db;
  private appId: string;

  constructor() {
    const firebaseService = FirebaseService.getInstance();
    this.db = firebaseService.getFirestore();
    this.appId = firebaseService.getAppId();
  }

  /**
   * Get collection reference for roulette results
   */
  private getRouletteCollection(): CollectionReference<DocumentData> {
    return collection(this.db, `${this.appId}/data/roulette-results`);
  }

  /**
   * Add a document to the roulette results collection
   */
  async addRouletteResult(data: any): Promise<void> {
    const collectionRef = this.getRouletteCollection();
    await addDoc(collectionRef, {
      ...data,
      timestamp: Timestamp.fromDate(new Date())
    });
  }

  /**
   * Get documents for a specific date range
   */
  async getResultsForDate(date: Date): Promise<DocumentData[]> {
    const collectionRef = this.getRouletteCollection();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const q = query(
      collectionRef,
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<', Timestamp.fromDate(endOfDay)),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Subscribe to real-time updates for a specific date
   */
  subscribeToDateResults(
    date: Date,
    callback: (results: DocumentData[]) => void
  ): Unsubscribe {
    const collectionRef = this.getRouletteCollection();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const q = query(
      collectionRef,
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<', Timestamp.fromDate(endOfDay)),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(results);
    });
  }

  /**
   * Get count of submissions for a specific date
   */
  async getDailySubmissionCount(date: Date): Promise<number> {
    try {
      const results = await this.getResultsForDate(date);
      return results.length;
    } catch (error) {
      console.error('Error getting daily count:', error);
      return 0;
    }
  }
}

export default FirestoreService;