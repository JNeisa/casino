// src/components/roulette/ResultsTable.tsx
import { RouletteResult } from '../../services/roulette/types';
import PaginationControls from '../ui/PaginationControls';

interface ResultsTableProps {
  results: RouletteResult[];
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export default function ResultsTable({
  results,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext
}: ResultsTableProps) {
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
              <th scope="col" className="py-3 px-4 text-center rounded-tr-lg">Sector</th>
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
    </div>
  );
}