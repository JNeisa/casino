// src/services/roulette/types.ts
export type Sector = 'A' | 'B' | 'C' | 'D';

export interface RouletteResult {
  id: string;
  number: string;
  sector: Sector;
  timestamp: Date;
  userId: string;
  spin: number;
}

export interface RouletteSubmission {
  number: string;
  userId: string;
  date: Date;
}

export interface SectorCounts {
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface RouletteStatistics {
  sectorCounts: SectorCounts;
  numberCounts: Record<string, number>;
  totalSpins: number;
  lastSpin?: RouletteResult;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}