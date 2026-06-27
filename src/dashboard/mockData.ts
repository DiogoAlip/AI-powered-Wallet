import type {
  Transaction,
  Budget,
  ChatMessage,
  SavingsGoal,
} from "./types/ChatTypes.ts";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    merchant: "Green Cafe",
    category: "Dining Out",
    amount: 45.0,
    date: "09:45 AM",
    account: "Personal Card",
    type: "expense",
  },
  {
    id: "tx-2",
    merchant: "Transferencia Salario",
    category: "Income",
    amount: 3200.0,
    date: "Ayer",
    account: "Direct Deposit",
    type: "income",
  },
  {
    id: "tx-3",
    merchant: "Netflix Inc",
    category: "Bills",
    amount: 15.49,
    date: "Hace 2 días",
    account: "Personal Card",
    type: "expense",
  },
  {
    id: "tx-4",
    merchant: "Starbucks Coffee",
    category: "Dining Out",
    amount: 4.5,
    date: "Hace 3 días",
    account: "Personal Card",
    type: "expense",
  },
  {
    id: "tx-5",
    merchant: "Uber Trip",
    category: "Transport",
    amount: 18.75,
    date: "Hace 4 días",
    account: "Personal Card",
    type: "expense",
  },
  {
    id: "tx-6",
    merchant: "Supermercado Central",
    category: "Groceries",
    amount: 142.3,
    date: "Hace 5 días",
    account: "Personal Card",
    type: "expense",
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    category: "Dining Out",
    spent: 49.5, // 4.50 (Starbucks) + 45.00 (Green Cafe)
    limit: 120.0,
    icon: "Utensils",
    color: "#EAB308", // Amber
  },
  {
    category: "Transport",
    spent: 18.75,
    limit: 150.0,
    icon: "Car",
    color: "#3B82F6", // Blue
  },
  {
    category: "Groceries",
    spent: 142.3,
    limit: 300.0,
    icon: "ShoppingBag",
    color: "#10B981", // Emerald
  },
  {
    category: "Bills",
    spent: 15.49,
    limit: 100.0,
    icon: "Receipt",
    color: "#8B5CF6", // Purple
  },
  {
    category: "Shopping",
    spent: 85.0,
    limit: 200.0,
    icon: "Tag",
    color: "#EC4899", // Pink
  },
];

export const INITIAL_SAVINGS: SavingsGoal = {
  name: "Fondo de Emergencia",
  target: 5000.0,
  current: 450.0,
};

export const INITIAL_CHAT_HISTORY: ChatMessage[] = [
  {
    id: "chat-1",
    sender: "ai",
    timestamp: "09:41 AM",
    text: "Good morning! I've analyzed your recent transactions. You're currently $120 under budget for 'Dining Out' this week. Would you like me to move that to your savings goal?",
    actionChips: [
      { text: "Move to Savings", actionId: "move_to_savings" },
      { text: "Ignore", actionId: "ignore" },
    ],
  },
  {
    id: "chat-2",
    sender: "user",
    timestamp: "09:45 AM",
    text: "Actually, just recorded $45 for lunch at Green Cafe.",
  },
  {
    id: "chat-3",
    sender: "ai",
    timestamp: "09:45 AM",
    text: "Got it. I've logged that expense. Here's the updated transaction detail:",
    transactionDetail: {
      id: "tx-1",
      merchant: "Green Cafe",
      category: "Dining Out",
      amount: 45.0,
      date: "09:45 AM",
      account: "Personal Card",
      type: "expense",
    },
    infoText: "You have $75 remaining in 'Dining Out' for this week.",
  },
];
