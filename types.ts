
export interface FinancialData {
  openingBalance: number; // Fundo de caixa
  salesCash: number;
  salesCredit: number;
  salesDebit: number;
  salesPix: number;
  salesVoucher: number;
  expenses: number; // Sangrias/Despesas pagas com o caixa
  closingCount: number; // Contagem física do dinheiro
}

export interface CalculationResult {
  totalRevenue: number;
  totalSystemCash: number; // Quanto deveria ter em dinheiro
  difference: number; // Sobra ou falta
  status: 'surplus' | 'shortage' | 'balanced';
}

export interface ClosingRecord extends FinancialData, CalculationResult {
  id: string;
  date: string;
}

export interface AppSettings {
  sheetUrl: string;
}

export enum CloudStatus {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}