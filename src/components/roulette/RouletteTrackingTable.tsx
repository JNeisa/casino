// src/components/roulette/RouletteTrackingTable.tsx
'use client';

import { RouletteResult } from '../../services/roulette/types';

interface RouletteTrackingTableProps {
  results: RouletteResult[];
  maxRows?: number;
}

export default function RouletteTrackingTable({ results, maxRows = 20 }: RouletteTrackingTableProps) {
  // Define the exact order from the image
  const sectors = {
    A: ['00', '27', '10', '25', '29', '12', '8', '19', '31', '18'],
    B: ['6', '21', '33', '16', '4', '23', '35', '14', '2'],
    C: ['0', '28', '9', '26', '30', '11', '7', '20', '32', '17'],
    D: ['5', '22', '34', '15', '3', '24', '36', '13', '1']
  };

  const sectorColors = {
    A: { bg: 'bg-red-500', border: 'border-red-300' },
    B: { bg: 'bg-blue-500', border: 'border-blue-300' },
    C: { bg: 'bg-yellow-500', border: 'border-yellow-300' },
    D: { bg: 'bg-green-500', border: 'border-green-300' }
  };

  // Function to detect consecutive spins within a sector
  const detectConsecutiveSpins = (results: RouletteResult[], sectorNumbers: string[]): Set<number> => {
    const consecutiveSpins = new Set<number>();
    
    // Get all spins for this sector, sorted by spin number
    const sectorSpins = results
      .filter(result => sectorNumbers.includes(result.number))
      .sort((a, b) => a.spin - b.spin)
      .map(result => result.spin);
    
    // Find consecutive sequences
    for (let i = 0; i < sectorSpins.length - 1; i++) {
      if (sectorSpins[i + 1] === sectorSpins[i] + 1) {
        consecutiveSpins.add(sectorSpins[i]);
        consecutiveSpins.add(sectorSpins[i + 1]);
      }
    }
    
    return consecutiveSpins;
  };

  // Group results by number
  const resultsByNumber: Record<string, RouletteResult[]> = {};
  results.forEach(result => {
    if (!resultsByNumber[result.number]) {
      resultsByNumber[result.number] = [];
    }
    resultsByNumber[result.number].push(result);
  });

  // Sort results for each number by spin number
  Object.keys(resultsByNumber).forEach(number => {
    resultsByNumber[number].sort((a, b) => a.spin - b.spin);
  });

  // Get the maximum number of results for any single number to determine table height
  const maxResultsForAnyNumber = Math.max(
    ...Object.values(resultsByNumber).map(arr => arr.length),
    0
  );
  
  // Limit the number of rows
  const actualMaxRows = Math.min(maxRows, maxResultsForAnyNumber);

  const renderSectorTable = (sectorName: keyof typeof sectors, numbers: string[]) => {
    const colors = sectorColors[sectorName];
    
    // Detect consecutive spins for this sector
    const consecutiveSpins = detectConsecutiveSpins(results, numbers);
    const hasConsecutiveSpins = consecutiveSpins.size > 0;
    
    return (
      <div key={sectorName} className={`bg-white rounded-lg shadow-md border-2 ${colors.border} overflow-hidden`}>
        {/* Sector Header */}
        <div className={`${colors.bg} text-white py-3 px-4 relative`}>
          <h3 className="text-lg font-bold text-center">SECTOR {sectorName}</h3>
          {hasConsecutiveSpins && (
            <div className="absolute top-2 right-2">
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                ⚠️ CONSECUTIVO
              </span>
            </div>
          )}
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            {/* Number Headers */}
            <thead>
              <tr className="bg-gray-200">
                {numbers.map(number => (
                  <th key={number} className="py-2 px-1 text-center border border-gray-300 font-bold min-w-[40px]">
                    {number}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Data Rows */}
            <tbody>
              {Array.from({ length: actualMaxRows }, (_, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {numbers.map(number => {
                    const numberResults = resultsByNumber[number] || [];
                    const result = numberResults[rowIndex];
                    
                    // Check if this spin is part of a consecutive sequence
                    const isConsecutive = result && consecutiveSpins.has(result.spin);
                    
                    return (
                      <td 
                        key={`${number}-${rowIndex}`} 
                        className={`py-1 px-1 text-center border border-gray-300 text-sm h-8 ${
                          isConsecutive ? 'bg-red-200 border-red-400' : ''
                        }`}
                      >
                        {result ? (
                          <span className={`font-bold ${isConsecutive ? 'text-red-800' : 'text-blue-600'}`}>
                            {result.spin}
                          </span>
                        ) : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          
          {actualMaxRows === 0 && (
            <div className="text-center py-4 text-gray-500">
              Sin números registrados
            </div>
          )}
        </div>
        
        {/* Sector Statistics */}
        <div className={`px-4 py-2 text-xs text-gray-600 border-t ${
          hasConsecutiveSpins ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <span>
                Números en este sector: {numbers.filter(num => resultsByNumber[num]?.length > 0).length} de {numbers.length}
              </span>
              <span className="ml-4">
                Total de giros: {numbers.reduce((sum, num) => sum + (resultsByNumber[num]?.length || 0), 0)}
              </span>
            </div>
            {hasConsecutiveSpins && (
              <div className="text-red-600 font-bold">
                🚨 {consecutiveSpins.size} giros consecutivos detectados
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Calculate overall consecutive patterns
  const allConsecutiveSpins = new Set<number>();
  Object.entries(sectors).forEach(([sectorName, numbers]) => {
    const sectorConsecutive = detectConsecutiveSpins(results, numbers);
    sectorConsecutive.forEach(spin => allConsecutiveSpins.add(spin));
  });

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 text-center">
        Test de Ruleta - Tabla de Seguimiento por Sectores
      </h2>
      
      {/* Alert for consecutive patterns */}
      {allConsecutiveSpins.size > 0 && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-bold">¡Patrones Consecutivos Detectados!</p>
              <p className="text-sm">
                Se han encontrado {allConsecutiveSpins.size} giros consecutivos en uno o más sectores. 
                Las celdas afectadas están marcadas en rojo.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Grid of Sector Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(sectors).map(([sectorName, numbers]) => 
          renderSectorTable(sectorName as keyof typeof sectors, numbers)
        )}
      </div>
      
      {/* Overall Statistics */}
      <div className="mt-6 bg-gray-100 rounded-lg p-4 text-center">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="font-bold text-gray-800">Total de giros:</span>
            <div className="text-lg font-bold text-blue-600">{results.length}</div>
          </div>
          <div>
            <span className="font-bold text-gray-800">Máximo por número:</span>
            <div className="text-lg font-bold text-blue-600">{maxResultsForAnyNumber}</div>
          </div>
          <div>
            <span className="font-bold text-gray-800">Números únicos:</span>
            <div className="text-lg font-bold text-blue-600">
              {Object.keys(resultsByNumber).filter(num => resultsByNumber[num].length > 0).length}
            </div>
          </div>
          <div>
            <span className="font-bold text-gray-800">Último giro:</span>
            <div className="text-lg font-bold text-blue-600">
              {results.length > 0 ? Math.max(...results.map(r => r.spin)) : 0}
            </div>
          </div>
          <div>
            <span className="font-bold text-gray-800">Giros consecutivos:</span>
            <div className={`text-lg font-bold ${allConsecutiveSpins.size > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {allConsecutiveSpins.size}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}