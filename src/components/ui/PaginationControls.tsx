// src/components/ui/PaginationControls.tsx
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext
}: PaginationControlsProps) {
  return (
    <div className="flex justify-center items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
      <button 
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
      >
        Anterior
      </button>
      <span className="text-gray-700 font-medium">
        Página {currentPage} de {totalPages || 1}
      </span>
      <button 
        onClick={onNext}
        disabled={!canGoNext}
        className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
      >
        Siguiente
      </button>
    </div>
  );
}
