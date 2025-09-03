// src/components/debug/FirestoreStructureChecker.tsx
'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import FirebaseService from '../../services/firebase/config';

interface StructureCheckResult {
  canRead: boolean;
  canWrite: boolean;
  collectionExists: boolean;
  documentCount: number;
  error?: string;
}

export default function FirestoreStructureChecker() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<StructureCheckResult | null>(null);
  const [creating, setCreating] = useState(false);

  const checkStructure = async () => {
    setChecking(true);
    setResult(null);

    try {
      const firebaseService = FirebaseService.getInstance();
      
      if (!firebaseService.isInitialized()) {
        setResult({
          canRead: false,
          canWrite: false,
          collectionExists: false,
          documentCount: 0,
          error: 'Firebase no inicializado'
        });
        return;
      }

      const db = firebaseService.getFirestore();
      const appId = firebaseService.getAppId();
      const collectionPath = `${appId}/data/roulette-results`;
      
      console.log('🔍 Verificando estructura en:', collectionPath);

      const resultsCollection = collection(db, collectionPath);
      
      // Test 1: Verificar lectura
      let canRead = false;
      let documentCount = 0;
      let collectionExists = false;

      try {
        const snapshot = await getDocs(resultsCollection);
        canRead = true;
        documentCount = snapshot.docs.length;
        collectionExists = documentCount > 0 || true; // Collection exists if we can query it
        console.log('✅ Lectura exitosa:', documentCount, 'documentos');
      } catch (readError: any) {
        console.error('❌ Error de lectura:', readError);
        setResult({
          canRead: false,
          canWrite: false,
          collectionExists: false,
          documentCount: 0,
          error: `Error de lectura: ${readError.code || readError.message}`
        });
        return;
      }

      // Test 2: Verificar escritura
      let canWrite = false;
      try {
        const testDoc = await addDoc(resultsCollection, {
          number: '0',
          sector: 'C',
          timestamp: new Date(),
          userId: 'test-user',
          isTest: true
        });
        
        // Eliminar el documento de prueba inmediatamente
        await deleteDoc(doc(db, collectionPath, testDoc.id));
        canWrite = true;
        console.log('✅ Escritura exitosa (documento de prueba eliminado)');
      } catch (writeError: any) {
        console.error('❌ Error de escritura:', writeError);
        canWrite = false;
      }

      setResult({
        canRead,
        canWrite,
        collectionExists,
        documentCount,
        error: !canRead || !canWrite ? 'Permisos insuficientes' : undefined
      });

    } catch (error: any) {
      console.error('❌ Error general:', error);
      setResult({
        canRead: false,
        canWrite: false,
        collectionExists: false,
        documentCount: 0,
        error: error.message || 'Error desconocido'
      });
    } finally {
      setChecking(false);
    }
  };

  const createTestData = async () => {
    setCreating(true);
    
    try {
      const firebaseService = FirebaseService.getInstance();
      const db = firebaseService.getFirestore();
      const appId = firebaseService.getAppId();
      const resultsCollection = collection(db, `${appId}/data/roulette-results`);

      // Crear algunos datos de prueba
      const testData = [
        { number: '7', sector: 'C', userId: 'test-user' },
        { number: '23', sector: 'B', userId: 'test-user' },
        { number: '15', sector: 'D', userId: 'test-user' }
      ];

      for (const data of testData) {
        await addDoc(resultsCollection, {
          ...data,
          timestamp: new Date(),
          isTest: true
        });
      }

      console.log('✅ Datos de prueba creados');
      
      // Verificar estructura nuevamente
      await checkStructure();
      
    } catch (error: any) {
      console.error('❌ Error creando datos de prueba:', error);
      setResult(prev => prev ? { ...prev, error: `Error creando datos: ${error.message}` } : null);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-blue-800 mb-4">🔍 Verificador de Estructura Firestore</h3>
      
      <div className="space-y-4">
        <button
          onClick={checkStructure}
          disabled={checking}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {checking ? 'Verificando...' : 'Verificar Estructura'}
        </button>

        {result && (
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold mb-3">📊 Resultados:</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className={result.canRead ? 'text-green-600' : 'text-red-600'}>
                  {result.canRead ? '✅' : '❌'}
                </span>
                <span>Puede leer</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={result.canWrite ? 'text-green-600' : 'text-red-600'}>
                  {result.canWrite ? '✅' : '❌'}
                </span>
                <span>Puede escribir</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={result.collectionExists ? 'text-green-600' : 'text-yellow-600'}>
                  {result.collectionExists ? '✅' : '⚠️'}
                </span>
                <span>Colección existe</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📄</span>
                <span>{result.documentCount} documentos</span>
              </div>
            </div>

            {result.error && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded border">
                <strong>Error:</strong> {result.error}
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Ruta de colección:</strong><br/>
              <code>{process.env.NEXT_PUBLIC_CUSTOM_APP_ID || 'default-app-id'}/roulette_results</code>
            </div>

            {!result.collectionExists && result.canWrite && (
              <button
                onClick={createTestData}
                disabled={creating}
                className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {creating ? 'Creando...' : 'Crear Datos de Prueba'}
              </button>
            )}
          </div>
        )}

        <div className="text-xs text-gray-600">
          <p><strong>💡 Consejos:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Si no puedes leer: verifica las reglas de Firestore</li>
            <li>Si no puedes escribir: verifica autenticación y permisos</li>
            <li>Si la colección no existe: se creará automáticamente al escribir</li>
            <li>Revisa la consola del navegador para más detalles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}