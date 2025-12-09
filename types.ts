export type UserRole = 'USER' | 'ADMIN';
export type BetType = 'COLOR' | 'NUMBER';
export type BetChoice = 'green' | 'red' | 'violet' | number;
export type GameMode = 'FAST' | 'STD' | 'PRO'; // 30s, 1m, 3m
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type WithdrawalMethod = 'UPI' | 'BANK';

export interface User {
  id: string;
  uid: string; // Display ID e.g., 829283
  name: string;
  email: string;
  password?: string; // In real app, this is hashed. Stored here for demo.
  mobile: string;
  balance: number;
  promoCode: string;
  role: UserRole;
  isBlocked: boolean;
  totalBets: number;
  totalWins: number;
  totalLoss: number;
}

export interface Bet {
  id: string;
  userId: string;
  gameMode: GameMode;
  periodId: string;
  amount: number;
  type: BetType;
  choice: BetChoice;
  status: 'PENDING' | 'WIN' | 'LOSS';
  winAmount: number;
  timestamp: number;
}

export interface GamePeriod {
  periodId: string;
  resultNumber: number | null;
  resultColor: string[] | null;
}

export interface GameState {
  currentPeriodId: string;
  timeLeft: number;
  history: GamePeriod[];
  status: 'ACTIVE' | 'LOCKED' | 'RESULT';
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: string;
  // Deposit Specific
  utr?: string;
  // Withdrawal Specific
  method?: WithdrawalMethod;
  details?: string; // JSON string of bank/upi details
}

export interface AppState {
  view: 'USER_AUTH' | 'ADMIN_AUTH' | 'USER_APP' | 'ADMIN_APP';
  currentUser: User | null;
  users: User[];
  bets: Bet[];
  transactions: Transaction[];
  games: Record<GameMode, GameState>;
  settings: {
    minBet: number;
    winRatioColor: number;
    winRatioNumber: number;
  };
}