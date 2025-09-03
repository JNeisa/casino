// src/components/ui/ConnectionStatus.tsx - COMPONENTE DE DIAGNÓSTICO
'use client';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'error';
  error?: string | null;
  onRetry?: () => void;
}

export default function ConnectionStatus({ status, error, onRetry }: ConnectionStatusProps) {
  if (status === 'connected') return null;

  const statusConfig = {
    connecting: {
      icon: '🔄',
      message: 'Conectando a Firebase...',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    },
    error: {
      icon: '❌',
      message: error || 'Error de conexión',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`${config.bgColor} border border-gray-300 rounded-lg p-4 mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <p className={`font-medium ${config.textColor}`}>
              {status === 'connecting' ? 'Conectando...' : 'Error de Conexión'}
            </p>
            <p className={`text-sm ${config.textColor}`}>
              {config.message}
            </p>
          </div>
        </div>
        
        {status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-semibold text-gray-800 mb-2">💡 Posibles soluciones:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Verifica que tu .env.local tenga las credenciales correctas</li>
            <li>• Asegúrate de que las reglas de Firestore permitan lectura/escritura</li>
            <li>• Verifica que el proyecto Firebase esté activo</li>
            <li>• Revisa la consola del navegador para más detalles</li>
          </ul>
        </div>
      )}
    </div>
  );
}
