// src/utils/roulette.ts
import { Sector } from '../services/roulette/types';

export const SECTORS: Record<'A' | 'B' | 'C' | 'D', string[]> = {
  'A': ['00', '27', '10', '25', '29', '12', '8', '19', '31', '18'],
  'B': ['6', '21', '33', '16', '4', '23', '35', '14', '2'],
  'C': ['0', '28', '9', '26', '30', '11', '7', '20', '32', '17'],
  'D': ['5', '22', '34', '15', '3', '24', '36', '13', '1']
};

/**
 * Get the sector for a given roulette number
 */
export function getSector(number: string): Sector | null {
  for (const [sector, numbers] of Object.entries(SECTORS) as [Sector, string[]][]) {
    if (numbers.includes(number)) {
      return sector as Sector;
    }
  }
  return null;
}

/**
 * Check if a number is valid for roulette
 */
export function isValidRouletteNumber(number: string): boolean {
  const allValidNumbers = new Set(Object.values(SECTORS).flat());
  return allValidNumbers.has(number);
}

/**
 * Get all valid roulette numbers sorted
 */
export function getAllRouletteNumbers(): string[] {
  const allNumbers = Object.values(SECTORS).flat();
  return allNumbers.sort((a, b) => {
    if (a === '00') return 1;
    if (b === '00') return -1;
    if (a === '0') return -1;
    if (b === '0') return 1;
    return parseInt(a) - parseInt(b);
  });
}

/**
 * Get sector color for UI (Tailwind classes)
 */
export function getSectorColor(sector: Sector): string {
  const colors = {
    A: 'bg-red-500',
    B: 'bg-blue-500',
    C: 'bg-yellow-500',
    D: 'bg-green-500'
  };
  return colors[sector];
}

/**
 * Get sector text color for better contrast
 */
export function getSectorTextColor(sector: Sector): string {
  const textColors = {
    A: 'text-red-700',
    B: 'text-blue-700',
    C: 'text-yellow-700',
    D: 'text-green-700'
  };
  return textColors[sector];
}

/**
 * Get sector border color
 */
export function getSectorBorderColor(sector: Sector): string {
  const borderColors = {
    A: 'border-red-500',
    B: 'border-blue-500', 
    C: 'border-yellow-500',
    D: 'border-green-500'
  };
  return borderColors[sector];
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Get start and end of day for a given date
 */
export function getDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return { start, end };
}