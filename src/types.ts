/**
 * Type declarations for the Statistical Lotto Generator
 */

export interface LottoTable {
  id: string;
  numbers: number[]; // 6 numbers, sorted
  strong?: number; // 1 strong number (1 to 7) for Lotto
  score: number; // Statistical probability score (0 to 100)
  scoreDetails?: {
    title: string;
    score: number;
    max: number;
    feedback: string;
    status: 'optimal' | 'moderate' | 'poor';
  }[];
  algo: 'HOT' | 'COLD' | 'BALANCED' | 'RANDOM' | 'CHANCE';
  gameType?: 'lotto' | 'chance' | '777';
  chanceCards?: { suit: string; value: string; isRed: boolean }[];
}

export interface LottoTicket {
  id: string;
  tables: LottoTable[];
  extraNumber?: string; // 1 single 6-digit extra number per form/ticket
  hasExtra: boolean;
  gameType?: 'lotto' | 'chance' | '777';
  createdAt: string;
}

export interface PastDraw {
  drawId: number;
  date: string;
  numbers: number[];
  strong: number;
  extra?: string;
}

export interface StatFrequencies {
  numberFrequencies: { [num: number]: number }; // 1 to 37
  strongFrequencies: { [num: number]: number }; // 1 to 7
  totalDraws: number;
  hotNumbers: number[]; // Sorted by hotness
  coldNumbers: number[]; // Sorted by coldness (least frequent)
  averageSum: number;
}
