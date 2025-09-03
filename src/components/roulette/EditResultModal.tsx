// src/components/roulette/EditResultModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { RouletteResult } from '../../services/roulette/types';
import { getSector, isValidRouletteNumber } from '../../utils/roulette';

interface EditResultModalProps {
  result: RouletteResult;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newNumber: string) => Promise<void>;
}

export default function EditResultModal({ result, isOpen, onClose, onConfirm }: EditResultModalProps) {
  const [newNumber, setNewNumber] = useState(result.number);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNewNumber(result.number);
    setError(null);
  }, [result.number]);

  const handleSubmit = async () => {
    if (!newNumber.trim()) {
      setError('Por favor ingrese un número');
      return;
    }

    if (!isValidRouletteNumber(newNumber.trim())) {
      setError('Número inválido. Por favor, ingrese un número del 0, 00 o del 1-36.');
      return;
    }

    if (newNumber.trim() === result.number) {
      setError('El número no ha cambiado');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(newNumber.trim());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar el resultado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const newSector = getSector(newNumber.trim());
  const hasChanges = newNumber.trim() !== result.number;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Editar Resultado - Giro #{result.spin}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Current values */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Valores actuales:</h4>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-gray-500">Número:</span>
                <div className="font-bold text-lg">{result.number}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Sector:</span>
                <div className={`px-2 py-1 rounded text-white text-sm font-medium ${
                  result.sector === 'A' ? 'bg-red-500' :
                  result.sector === 'B' ? 'bg-blue-500' :
                  result.sector === 'C' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {result.sector}
                </div>
              </div>
            </div>
          </div>

          {/* New number input */}
          <div>
            <label htmlFor="newNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo número:
            </label>
            <input
              type="text"
              id="newNumber"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ej., 22 o 00"
              disabled={isSubmitting}
              className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:bg-gray-100"
            />
          </div>

          {/* Preview new values */}
          {hasChanges && newSector && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Nuevos valores:</h4>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-blue-600">Número:</span>
                  <div className="font-bold text-lg text-blue-800">{newNumber.trim()}</div>
                </div>
                <div>
                  <span className="text-xs text-blue-600">Sector:</span>
                  <div className={`px-2 py-1 rounded text-white text-sm font-medium ${
                    newSector === 'A' ? 'bg-red-500' :
                    newSector === 'B' ? 'bg-blue-500' :
                    newSector === 'C' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {newSector}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasChanges || !newSector}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Actualizando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}