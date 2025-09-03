// src/hooks/useFirebase.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import FirebaseService, { FirebaseConfig } from '../services/firebase/config';
import { AuthService, AuthUser, LoginCredentials } from '../services/firebase/auth';

interface UseFirebaseReturn {
  isInitialized: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (customToken?: string) => Promise<void>;
  signInWithEmail: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useFirebase(config: FirebaseConfig, appId?: string): UseFirebaseReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authService, setAuthService] = useState<AuthService | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const firebaseService = FirebaseService.getInstance();
        firebaseService.initialize(config, appId);
        
        const auth = new AuthService();
        setAuthService(auth);
        
        // Listen to auth state changes
        const unsubscribe = auth.onAuthStateChange((user) => {
          setUser(user);
          setIsLoading(false);
        });

        setIsInitialized(true);
        setError(null);

        return unsubscribe;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error initializing Firebase');
        setIsLoading(false);
      }
    };

    const cleanup = initializeFirebase();
    return () => {
      cleanup?.then(unsubscribe => unsubscribe?.());
    };
  }, [config, appId]);

  const signIn = useCallback(async (customToken?: string) => {
    if (!authService) return;
    
    setIsLoading(true);
    try {
      await authService.signIn(customToken);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing in');
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const signInWithEmail = useCallback(async (credentials: LoginCredentials) => {
    if (!authService) return;
    
    setIsLoading(true);
    try {
      await authService.signInWithEmail(credentials);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing in with email');
      throw err; // Re-throw so the component can handle it
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const signOut = useCallback(async () => {
    if (!authService) return;
    
    try {
      await authService.signOut();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing out');
    }
  }, [authService]);

  return {
    isInitialized,
    user,
    isLoading,
    error,
    signIn,
    signInWithEmail,
    signOut
  };
}