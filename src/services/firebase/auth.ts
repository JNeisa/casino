// src/services/firebase/auth.ts
import {
  signInAnonymously,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
  Auth
} from 'firebase/auth';
import FirebaseService from './config';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private auth: Auth;

  constructor() {
    const firebaseService = FirebaseService.getInstance();
    this.auth = firebaseService.getAuth();
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail({ email, password }: LoginCredentials): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No existe una cuenta con este email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('Esta cuenta ha sido deshabilitada');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos fallidos. Intenta más tarde');
      }
      
      throw new Error('Error al iniciar sesión');
    }
  }

  /**
   * Sign in with custom token or anonymously (keep existing functionality)
   */
  async signIn(customToken?: string): Promise<AuthUser> {
    try {
      let userCredential;
      
      if (customToken) {
        userCredential = await signInWithCustomToken(this.auth, customToken);
      } else {
        userCredential = await signInAnonymously(this.auth);
      }

      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      console.error('Error signing in:', error);
      throw new Error('Error al autenticar usuario');
    }
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        callback(this.mapFirebaseUser(user));
      } else {
        callback(null);
      }
    });
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    const user = this.auth.currentUser;
    if (user) {
      return this.mapFirebaseUser(user);
    }
    return null;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Error al cerrar sesión');
    }
  }

  /**
   * Map Firebase User to AuthUser
   */
  private mapFirebaseUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAnonymous: user.isAnonymous
    };
  }
}