// src/hooks/useRouletteData.ts - VERSION MEJORADA
'use client';

import { useState, useEffect, useCallback } from 'react';
import RouletteService from '../services/roulette/rouletteService';
import { RouletteResult, RouletteSubmission, RouletteStatistics } from '../services/roulette/types';

interface UseRouletteDataReturn {
  results: RouletteResult[];
  statistics: RouletteStatistics;
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'connecting' | 'connected' | 'error';
  submitNumber: (submission: RouletteSubmission) => Promise<void>;
  updateDate: (date: Date) => void;
  testConnection: () => Promise<void>;
  selectedDate: Date;
}

export function useRouletteData(initialDate: Date): UseRouletteDataReturn {
  const [results, setResults] = useState<RouletteResult[]>([]);
  const [statistics, setStatistics] = useState<RouletteStatistics>({
    sectorCounts: { A: 0, B: 0, C: 0, D: 0 },
    numberCounts: {},
    totalSpins: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [rouletteService] = useState(() => new RouletteService());

  const updateDate = useCallback((date: Date) => {
    console.log('Updating date to:', date);
    setSelectedDate(date);
    setError(null);
    setConnectionStatus('connecting');
  }, []);

  const testConnection = useCallback(async () => {
    try {
      const result = await rouletteService.testConnection();
      if (result.success) {
        setConnectionStatus('connected');
        setError(null);
        console.log('✅ Firebase connection test passed');
      } else {
        setConnectionStatus('error');
        setError(result.message);
        console.error('❌ Firebase connection test failed:', result.message);
      }
    } catch (err) {
      setConnectionStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      console.error('❌ Connection test error:', err);
    }
  }, [rouletteService]);

  const submitNumber = useCallback(async (submission: RouletteSubmission) => {
    try {
      setError(null);
      console.log('Submitting number:', submission);
      await rouletteService.submitNumber(submission);
      console.log('✅ Number submitted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar número';
      setError(errorMessage);
      console.error('❌ Submit error:', err);
      throw new Error(errorMessage);
    }
  }, [rouletteService]);

  // Subscribe to real-time data updates
  useEffect(() => {
    console.log('Setting up realtime listener for date:', selectedDate);
    setIsLoading(true);
    
    const unsubscribe = rouletteService.subscribeToDateResults(
      selectedDate,
      (newResults) => {
        console.log('✅ Received real-time data:', newResults.length, 'results');
        setResults(newResults);
        setStatistics(rouletteService.getStatistics(newResults));
        setIsLoading(false);
        setConnectionStatus('connected');
        setError(null);
      },
      (error) => {
        console.error('❌ Real-time listener error:', error);
        setError(error);
        setIsLoading(false);
        setConnectionStatus('error');
      }
    );

    return () => {
      console.log('Cleaning up realtime listener');
      unsubscribe();
      setIsLoading(false);
    };
  }, [selectedDate, rouletteService]);

  // Test connection when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      testConnection();
    }, 1000); // Wait a bit for Firebase to initialize

    return () => clearTimeout(timer);
  }, [testConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      rouletteService.cleanup();
    };
  }, [rouletteService]);

  return {
    results,
    statistics,
    isLoading,
    error,
    connectionStatus,
    submitNumber,
    updateDate,
    testConnection,
    selectedDate
  };
}