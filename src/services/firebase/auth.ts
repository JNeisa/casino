// src/services/firebase/auth.ts
import {
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import FirebaseService from './config';

export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
}

export class AuthService {
  private auth: Auth;

  constructor() {
    const firebaseService = FirebaseService.getInstance();
    this.auth = firebaseService.getAuth();
  }

  /**
   * Sign in with custom token or anonymously
   */
  async signIn(customToken?: string): Promise<AuthUser> {
    try {
      let userCredential;
      
      if (customToken) {
        userCredential = await signInWithCustomToken(this.auth, customToken);
      } else {
        userCredential = await signInAnonymously(this.auth);
      }

      return {
        uid: userCredential.user.uid,
        isAnonymous: userCredential.user.isAnonymous
      };
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
        callback({
          uid: user.uid,
          isAnonymous: user.isAnonymous
        });
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
      return {
        uid: user.uid,
        isAnonymous: user.isAnonymous
      };
    }
    return null;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Error al cerrar sesión');
    }
  }
}