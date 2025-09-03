// src/components/auth/UserHeader.tsx
'use client';

import { AuthUser } from '../../services/firebase/auth';

interface UserHeaderProps {
  user: AuthUser;
  onSignOut: () => Promise<void>;
}

export default function UserHeader({ user, onSignOut }: UserHeaderProps) {
  const handleSignOut = async () => {
    try {
      await onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {user.isAnonymous ? '👤' : (user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U')}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {user.isAnonymous ? 'Usuario Invitado' : (user.displayName || user.email)}
          </p>
          <p className="text-xs text-gray-500">
            ID: {user.uid.substring(0, 8)}...
          </p>
        </div>
      </div>
      
      <button
        onClick={handleSignOut}
        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}