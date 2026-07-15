export interface User {
  email: string;
  name: string;
  initialized: boolean;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  account: string;
  type: "expense" | "income";
}

export interface Budget {
  category: string;
  spent: number;
  limit: number;
  icon: string;
  color: string;
}

export interface SavingsGoal {
  name: string;
  target: number;
  current: number;
  recommendations?: string | null;
}

export interface ActionChip {
  text: string;
  actionId: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  timestamp: string;
  text: string;
  transactionDetail?: Transaction;
  actionChips?: ActionChip[];
  infoText?: string;
}

export interface GeminiResponse {
  text: string;
  transactionDetail?: Omit<Transaction, "id" | "date"> & { id?: string; date?: string };
  infoText?: string;
}

export interface UserState {
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal;
  categories: string[];
  chatSessions: string[];
  activeChatId: string;
  chatHistory: ChatMessage[];
}
