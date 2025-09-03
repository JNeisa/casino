// src/components/roulette/SectorGraphics.tsx
import { RouletteResult } from '../../services/roulette/types';
import { getSectorColor } from '../../utils/roulette';

interface SectorGraphicsProps {
  results: RouletteResult[];
}

export default function SectorGraphics({ results }: SectorGraphicsProps) {
  // Group results by sector
  const groupedResults = { A: [], B: [], C: [], D: [] } as Record<string, RouletteResult[]>;
  
  results.forEach(result => {
    if (groupedResults[result.sector]) {
      groupedResults[result.sector].push(result);
    }
  });

  // Sort each sector by spin number (newest first for display)
  Object.keys(groupedResults).forEach(sector => {
    groupedResults[sector].sort((a, b) => b.spin - a.spin);
  });

  const sectorNames = {
    A: 'Sector A',
    B: 'Sector B', 
    C: 'Sector C',
    D: 'Sector D'
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
        Números por Sector
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(groupedResults).map(([sector, sectorResults]) => (
          <div key={sector} className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className={`text-lg font-semibold text-center py-2 text-white ${getSectorColor(sector as any)}`}>
              {sectorNames[sector as keyof typeof sectorNames]} ({sectorResults.length})
            </h3>
            <div className="p-2 overflow-y-auto max-h-60 flex flex-wrap gap-2 justify-center">
              {sectorResults.length === 0 ? (
                <div className="text-gray-500 text-sm text-center w-full py-4">
                  Sin números registrados
                </div>
              ) : (
                sectorResults.map(result => (
                  <div
                    key={`${result.id}-${result.spin}`}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-200 text-gray-800 text-sm shadow hover:bg-gray-300 transition-colors"
                  >
                    <span className="text-xs text-gray-500">Giro #{result.spin}</span>
                    <span className="text-lg font-bold">{result.number}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}