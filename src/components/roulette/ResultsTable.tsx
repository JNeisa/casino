// src/components/roulette/ResultsTable.tsx
import { useState } from 'react';
import { RouletteResult } from '../../services/roulette/types';
import { getSector, isValidRouletteNumber } from '../../utils/roulette';
import PaginationControls from '../ui/PaginationControls';
import EditResultModal from './EditResultModal';

interface ResultsTableProps {
  results: RouletteResult[];
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onUpdateResult?: (resultId: string, newNumber: string) => Promise<void>;
}

export default function ResultsTable({
  results,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  onUpdateResult
}: ResultsTableProps) {
  const [editingResult, setEditingResult] = useState<RouletteResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (result: RouletteResult) => {
    setEditingResult(result);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResult(null);
  };

  const handleConfirmEdit = async (newNumber: string) => {
    if (!editingResult || !onUpdateResult) return;

    try {
      await onUpdateResult(editingResult.id, newNumber);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating result:', error);
      // Error handling should be done by parent component
    }
  };

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
        Últimos Resultados
      </h2>
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th scope="col" className="py-3 px-4 text-center rounded-tl-lg">Giro #</th>
              <th scope="col" className="py-3 px-4 text-center">Número</th>
              <th scope="col" className="py-3 px-4 text-center">Sector</th>
              <th scope="col" className="py-3 px-4 text-center rounded-tr-lg">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="bg-white border-b hover:bg-gray-50">
                <td className="py-2 px-4 text-center font-medium">{result.spin}</td>
                <td className="py-2 px-4 text-center font-bold text-lg">{result.number}</td>
                <td className="py-2 px-4 text-center">
                  <span className={`px-2 py-1 rounded text-white text-sm font-medium ${
                    result.sector === 'A' ? 'bg-red-500' :
                    result.sector === 'B' ? 'bg-blue-500' :
                    result.sector === 'C' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {result.sector}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  {onUpdateResult && (
                    <button
                      onClick={() => handleEditClick(result)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar resultado"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                        />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />

      {/* Edit Modal */}
      {isModalOpen && editingResult && (
        <EditResultModal
          result={editingResult}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmEdit}
        />
      )}
    </div>
  );
}