// src/components/roulette/NumberInput.tsx
'use client';

import { useState } from 'react';

interface NumberInputProps {
  onSubmit: (number: string) => Promise<void>;
  disabled?: boolean;
}

export default function NumberInput({ onSubmit, disabled = false }: NumberInputProps) {
  const [number, setNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!number.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(number.trim());
      setNumber('');
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
        Ingresar un Número
      </h2>
      <div className="flex items-center gap-3 sm:gap-4">
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="ej., 22 o 00"
          disabled={disabled || isSubmitting}
          className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:bg-gray-100"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || !number.trim()}
          className="w-1/2 sm:w-1/3 p-3 text-lg bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}