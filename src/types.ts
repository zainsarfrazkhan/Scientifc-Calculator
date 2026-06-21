export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export interface PhysicalConstant {
  name: string;
  symbol: string;
  value: number;
  unit: string;
  category: 'Physics' | 'Chemistry' | 'Cosmology' | 'Mathematics';
  description: string;
}

export interface UnitCategory {
  id: string;
  name: string;
  units: { name: string; symbol: string; factor: number; offset?: number }[];
}

export type ActiveTab = 'standard' | 'grapher' | 'converter' | 'matrix' | 'constants';

export type MatrixSize = 2 | 3;
