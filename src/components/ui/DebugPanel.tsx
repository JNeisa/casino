// src/components/ui/DebugPanel.tsx - PANEL DE DEBUG
'use client';

import { useState } from 'react';

interface DebugPanelProps {
  user: any;
  connectionStatus: string;
  error: string | null;
  onTestConnection: () => void;
}

export default function DebugPanel({ user, connectionStatus, error, onTestConnection }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700"
      >
        🐛 Debug
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 left-0 bg-white border rounded-lg p-4 shadow-lg w-80 max-h-96 overflow-y-auto">
          <h3 className="font-bold mb-3">Panel de Debug</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong>Usuario:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            
            <div>
              <strong>Estado de Conexión:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                connectionStatus === 'connecting' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {connectionStatus}
              </span>
            </div>
            
            {error && (
              <div>
                <strong>Error:</strong>
                <p className="bg-red-100 text-red-800 p-2 rounded mt-1 text-xs">
                  {error}
                </p>
              </div>
            )}
            
            <div>
              <strong>Variables de Entorno:</strong>
              <ul className="bg-gray-100 p-2 rounded mt-1 text-xs">
                <li>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅' : '❌'}</li>
                <li>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'No configurado'}</li>
                <li>App ID: {process.env.NEXT_PUBLIC_CUSTOM_APP_ID || 'default-app-id'}</li>
              </ul>
            </div>
            
            <button
              onClick={onTestConnection}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Probar Conexión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}