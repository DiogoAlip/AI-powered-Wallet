export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string; // e.g. "09:45 AM" or "2026-06-27"
  account: string; // e.g. "Personal Card"
  type: "expense" | "income";
}

export interface Budget {
  category: string;
  spent: number;
  limit: number;
  icon: string; // Lucide icon name
  color: string; // hex or Tailwind color class
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  timestamp: string; // e.g. "09:41 AM"
  text: string;
  transactionDetail?: Transaction;
  actionChips?: { text: string; actionId: string }[];
  infoText?: string;
}

export interface SavingsGoal {
  name: string;
  target: number;
  current: number;
  recommendations?: string | null;
}

export interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal;
  chatHistory: ChatMessage[];
}
