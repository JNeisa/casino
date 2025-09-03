// src/components/ui/MessageBox.tsx
'use client';

import { useEffect } from 'react';

interface MessageBoxProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
  type?: 'success' | 'error' | 'info';
  autoHide?: boolean;
  duration?: number;
}

export default function MessageBox({ 
  message, 
  isVisible, 
  onHide, 
  type = 'info',
  autoHide = true,
  duration = 3000 
}: MessageBoxProps) {
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, duration, onHide]);

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-gray-800'
  }[type];

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-5 right-5 z-50 p-4 ${bgColor} text-white rounded-lg shadow-lg max-w-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-sm">{message}</span>
        <button 
          onClick={onHide}
          className="ml-3 text-white hover:text-gray-200 text-lg font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}