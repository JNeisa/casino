// src/app/page.tsx - CON COMPONENTES DE DEBUG
'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useRouletteData } from '../hooks/useRouletteData';
import { usePagination } from '../hooks/usePagination';
import MessageBox from '../components/ui/MessageBox';
import ConnectionStatus from '../components/ui/ConnectionStatus';
import FirestoreStructureChecker from '../components/debug/FirestoreStructureChecker';
import NumberInput from '../components/roulette/NumberInput';
import DatePicker from '../components/roulette/DatePicker';
import ResultsTable from '../components/roulette/ResultsTable';
import SectorGraphics from '../components/roulette/SectorGraphics';
import SectorFrequencyChart from '../components/charts/SectorFrequencyChart';
import NumberRepetitionsChart from '../components/charts/NumberRepetitionsChart';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

const customAppId = process.env.NEXT_PUBLIC_CUSTOM_APP_ID || 'default-app-id';
const initialAuthToken = process.env.NEXT_PUBLIC_INITIAL_AUTH_TOKEN;

export default function RouletteTracker() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [showDebug, setShowDebug] = useState(process.env.NODE_ENV === 'development');

  // Firebase initialization
  const { isInitialized, user, isLoading: authLoading, error: authError, signIn } = useFirebase(
    firebaseConfig, 
    customAppId
  );

  let date = new Date();

  // Roulette data management
  const {
    results,
    statistics,
    isLoading: dataLoading,
    error: dataError,
    connectionStatus,
    submitNumber,
    updateDate,
    testConnection,
    selectedDate
  } = useRouletteData(new Date(date.getFullYear(), date.getMonth(), date.getDate()));

  // Pagination for results table (show newest first)
  const sortedResults = [...results].sort((a, b) => b.spin - a.spin);
  const {
    paginatedItems: paginatedResults,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious
  } = usePagination(sortedResults, 10);

  // Auto sign-in on component mount
  useEffect(() => {
    if (isInitialized && !user && !authLoading) {
      console.log('🔐 Auto-signing in...');
      signIn(initialAuthToken);
    }
  }, [isInitialized, user, authLoading, signIn]);

  // Handle submission
  const handleSubmit = async (number: string) => {
    if (!user) {
      showMessage('Usuario no autenticado', 'error');
      return;
    }

    // Check if trying to submit for current day only
    console.log('Selected date for submission:', selectedDate);
    const isCurrentDay = new Date().toDateString() === selectedDate.toDateString();
    if (!isCurrentDay) {
      showMessage('Solo se pueden agregar números para el día actual.', 'error');
      return;
    }

    try {
      await submitNumber({ number, userId: user.uid });
      showMessage('Número enviado con éxito!', 'success');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Error al enviar número', 'error');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(text);
    setMessageType(type);
    setIsMessageVisible(true);
  };

  const hideMessage = () => {
    setIsMessageVisible(false);
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando a Firebase...</p>
          <p className="text-xs text-gray-500 mt-2">
            App ID: {customAppId}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error de Conexión Firebase</h1>
          <p className="text-gray-600 mb-4">{authError}</p>
          <div className="bg-gray-100 p-3 rounded text-xs text-left mb-4">
            <strong>Configuración actual:</strong><br/>
            Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'No configurado'}<br/>
            App ID: {customAppId}<br/>
            Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'No configurado'}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 font-sans leading-normal tracking-normal p-4 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8 mt-4 sm:mt-10">
        
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
          Rastreador de Datos de Ruleta
        </h1>
        <p className="text-center text-gray-500 mb-6 sm:mb-8">
          {user ? `ID de Usuario: ${user.uid}` : 'Conectando...'}
        </p>

        {/* Debug Toggle */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 text-center">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              {showDebug ? 'Ocultar' : 'Mostrar'} Debug
            </button>
          </div>
        )}

        {/* Connection Status */}
        {showDebug && 
          <ConnectionStatus 
          status={connectionStatus} 
          error={dataError} 
          onRetry={testConnection} 
        />
        }
      

        {/* Debug Panel */}
        {showDebug && (
          <FirestoreStructureChecker />
        )}

        {/* Message Box */}
        <MessageBox
          message={message}
          isVisible={isMessageVisible}
          onHide={hideMessage}
          type={messageType}
        />

        {/* Main Content - Only show if connected */}
        {connectionStatus === 'connected' && (
          <>
            {/* Input Form */}
            <NumberInput
              onSubmit={handleSubmit}
              disabled={!user || dataLoading}
            />

            {/* Date Picker */}
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={updateDate}
            />

            {/* Results Table */}
            <ResultsTable
              results={paginatedResults}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
            />

            {/* Sector Graphics */}
            <SectorGraphics results={results} />

            {/* Charts */}
            <hr className="my-6 sm:my-8" />
            <SectorFrequencyChart 
              statistics={statistics}
              isLoading={dataLoading}
            />

            <hr className="my-6 sm:my-8" />
            <NumberRepetitionsChart 
              statistics={statistics}
              isLoading={dataLoading}
            />
          </>
        )}

        {/* Instructions for setup */}
        {connectionStatus === 'error' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-4">🛠️ Pasos para Configurar</h3>
            <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
              <li>Ve a <a href="https://console.firebase.google.com" className="underline" target="_blank">Firebase Console</a></li>
              <li>Selecciona tu proyecto → Firestore Database</li>
              <li>Ir a "Rules" y configurar:</li>
            </ol>
            <pre className="bg-gray-800 text-green-400 p-3 rounded mt-3 text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
            </pre>
            <p className="text-xs text-yellow-600 mt-2">
              ⚠️ Esta regla es para desarrollo. Usa reglas más restrictivas en producción.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}