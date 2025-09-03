// src/services/firebase/config.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private appId: string = '';

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public initialize(config: FirebaseConfig, customAppId?: string) {
    try {
      this.app = initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.appId = customAppId || 'default-app-id';

      // Connect to emulator in development
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
        connectFirestoreEmulator(this.db, 'localhost', 8080);
      }

      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw new Error('Failed to initialize Firebase');
    }
  }

  public getApp(): FirebaseApp {
    if (!this.app) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return this.app;
  }

  public getAuth(): Auth {
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized. Call initialize() first.');
    }
    return this.auth;
  }

  public getFirestore(): Firestore {
    if (!this.db) {
      throw new Error('Firestore not initialized. Call initialize() first.');
    }
    return this.db;
  }

  public getAppId(): string {
    return this.appId;
  }

  public isInitialized(): boolean {
    return this.app !== null && this.auth !== null && this.db !== null;
  }
}

export default FirebaseService;