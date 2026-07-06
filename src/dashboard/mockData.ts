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
    category: "Comida fuera",
    amount: 45.0,
    date: "09:45 AM",
    account: "Tarjeta Personal",
    type: "expense",
  },
  {
    id: "tx-2",
    merchant: "Transferencia Salario",
    category: "Ingresos",
    amount: 3200.0,
    date: "Ayer",
    account: "Depósito Directo",
    type: "income",
  },
  {
    id: "tx-3",
    merchant: "Netflix Inc",
    category: "Facturas",
    amount: 15.49,
    date: "Hace 2 días",
    account: "Tarjeta Personal",
    type: "expense",
  },
  {
    id: "tx-4",
    merchant: "Starbucks Coffee",
    category: "Comida fuera",
    amount: 4.5,
    date: "Hace 3 días",
    account: "Tarjeta Personal",
    type: "expense",
  },
  {
    id: "tx-5",
    merchant: "Uber Trip",
    category: "Transporte",
    amount: 18.75,
    date: "Hace 4 días",
    account: "Tarjeta Personal",
    type: "expense",
  },
  {
    id: "tx-6",
    merchant: "Supermercado Central",
    category: "Supermercado",
    amount: 142.3,
    date: "Hace 5 días",
    account: "Tarjeta Personal",
    type: "expense",
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    category: "Comida fuera",
    spent: 49.5, // 4.50 (Starbucks) + 45.00 (Green Cafe)
    limit: 120.0,
    icon: "Utensils",
    color: "#EAB308", // Amber
  },
  {
    category: "Transporte",
    spent: 18.75,
    limit: 150.0,
    icon: "Car",
    color: "#3B82F6", // Blue
  },
  {
    category: "Supermercado",
    spent: 142.3,
    limit: 300.0,
    icon: "ShoppingBag",
    color: "#10B981", // Emerald
  },
  {
    category: "Facturas",
    spent: 15.49,
    limit: 100.0,
    icon: "Receipt",
    color: "#8B5CF6", // Purple
  },
  {
    category: "Compras",
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
    text: "¡Buenos días! He analizado tus transacciones recientes. Actualmente estás $120 por debajo del presupuesto para 'Comida fuera' esta semana. ¿Te gustaría que lo transfiera a tu meta de ahorro?",
    actionChips: [
      { text: "Transferir a Ahorros", actionId: "move_to_savings" },
      { text: "Ignorar", actionId: "ignore" },
    ],
  },
  {
    id: "chat-2",
    sender: "user",
    timestamp: "09:45 AM",
    text: "De hecho, acabo de registrar $45 para el almuerzo en Green Cafe.",
  },
  {
    id: "chat-3",
    sender: "ai",
    timestamp: "09:45 AM",
    text: "Entendido. He registrado ese gasto. Aquí está el detalle de la transacción actualizado:",
    transactionDetail: {
      id: "tx-1",
      merchant: "Green Cafe",
      category: "Comida fuera",
      amount: 45.0,
      date: "09:45 AM",
      account: "Tarjeta Personal",
      type: "expense",
    },
    infoText: "Te quedan $75 en 'Comida fuera' para esta semana.",
  },
];
