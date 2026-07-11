import { create } from "zustand";
import type {
  Transaction,
  Budget,
  ChatMessage,
  SavingsGoal,
} from "../dashboard/types/ChatTypes";
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS,
  INITIAL_CHAT_HISTORY,
} from "./mockData";
import { GeminiService } from "../dashboard/chat/helper/gemini.service.ts";

export interface UseWalletState {
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal;
  chatHistory: ChatMessage[];
  isGenerating: boolean;

  // Actions
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  deleteTransaction: (id: string) => void;
  updateBudgetLimit: (category: string, limit: number) => void;
  updateBudgetSpent: (category: string, spent: number) => void;
  depositSavings: (amount: number) => void;
  resetSavings: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatHistory: (history: ChatMessage[]) => void;
  sendMessage: (text: string) => Promise<void>;
  applyAction: (actionId: string, messageId: string) => void;
}

export const useWalletStore = create<UseWalletState>((set, get) => ({
  transactions: INITIAL_TRANSACTIONS,
  budgets: INITIAL_BUDGETS,
  savings: INITIAL_SAVINGS,
  chatHistory: INITIAL_CHAT_HISTORY,
  isGenerating: false,

  addTransaction: (tx) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: "Hoy",
    };

    set((state) => {
      // If it is an expense, let's update the spent amount of the corresponding category
      let updatedBudgets = state.budgets;
      if (tx.type === "expense") {
        updatedBudgets = state.budgets.map((b) =>
          b.category === tx.category ? { ...b, spent: b.spent + tx.amount } : b,
        );
      }

      return {
        transactions: [newTx, ...state.transactions],
        budgets: updatedBudgets,
      };
    });

    return newTx;
  },

  deleteTransaction: (id) =>
    set((state) => {
      const txToDelete = state.transactions.find((t) => t.id === id);
      if (!txToDelete) return {};

      // If deleted transaction was an expense, subtract from budget spent
      let updatedBudgets = state.budgets;
      if (txToDelete.type === "expense") {
        updatedBudgets = state.budgets.map((b) =>
          b.category === txToDelete.category
            ? { ...b, spent: Math.max(0, b.spent - txToDelete.amount) }
            : b,
        );
      }

      return {
        transactions: state.transactions.filter((t) => t.id !== id),
        budgets: updatedBudgets,
      };
    }),

  updateBudgetLimit: (category, limit) =>
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.category === category ? { ...b, limit } : b,
      ),
    })),

  updateBudgetSpent: (category, spent) =>
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.category === category ? { ...b, spent } : b,
      ),
    })),

  depositSavings: (amount) =>
    set((state) => ({
      savings: {
        ...state.savings,
        current: state.savings.current + amount,
      },
    })),

  resetSavings: () =>
    set((state) => ({
      savings: {
        ...state.savings,
        current: 0,
      },
    })),

  addChatMessage: (msg) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, msg],
    })),

  setChatHistory: (history) => set({ chatHistory: history }),

  sendMessage: async (text) => {
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text,
    };

    set((state) => ({
      chatHistory: [...state.chatHistory, userMsg],
      isGenerating: true,
    }));

    try {
      const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
      if (!apiKey) {
        throw new Error(
          "Clave de API de Gemini ausente. Por favor, define VITE_GEMINI_API_KEY en tu archivo .env o .env.local para usar el asistente FinancIA!."
        );
      }

      const { transactions, budgets, savings, chatHistory } = get();
      const response = await GeminiService.chat(
        text,
        chatHistory, // includes the userMsg that we just added to state
        { transactions, budgets, savings },
        {
          addTransaction: get().addTransaction,
          depositSavings: get().depositSavings,
          updateBudgetLimit: get().updateBudgetLimit,
        }
      );

      const aiMsg: ChatMessage = {
        id: `chat-${Date.now()}`,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: response.text,
        transactionDetail: response.transactionDetail,
        infoText: response.infoText,
      };

      set((state) => ({
        chatHistory: [...state.chatHistory, aiMsg],
        isGenerating: false,
      }));
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: `chat-${Date.now()}`,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: `⚠️ Error de configuración: ${error.message || error}`,
      };

      set((state) => ({
        chatHistory: [...state.chatHistory, errorMsg],
        isGenerating: false,
      }));
    }
  },

  applyAction: (actionId, messageId) => {
    set((state) => {
      // Remove action chips from the clicked message
      const chatHistory = state.chatHistory.map((msg) =>
        msg.id === messageId ? { ...msg, actionChips: [] } : msg,
      );

      if (
        actionId === "move_to_savings" ||
        actionId === "move_to_savings_quick"
      ) {
        const transferAmount = actionId === "move_to_savings" ? 120 : 50;
        const updatedSavings = {
          ...state.savings,
          current: state.savings.current + transferAmount,
        };

        const confirmMsg: ChatMessage = {
          id: `chat-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: `¡Listo! He transferido $${transferAmount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} a tu ahorro '${state.savings.name}'.`,
        };

        return {
          chatHistory: [...chatHistory, confirmMsg],
          savings: updatedSavings,
        };
      } else if (actionId === "ignore") {
        const confirmMsg: ChatMessage = {
          id: `chat-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: "De acuerdo, he ignorado la sugerencia.",
        };
        return { chatHistory: [...chatHistory, confirmMsg] };
      } else if (actionId === "ask_record_expense") {
        const promptMsg: ChatMessage = {
          id: `chat-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: "Perfecto. Dime qué compraste y cuánto costó. Por ejemplo: 'Compré un café por 4.50'.",
        };
        return { chatHistory: [...chatHistory, promptMsg] };
      } else if (actionId === "ask_view_limits") {
        const promptMsg: ChatMessage = {
          id: `chat-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: "Puedes ver todos tus presupuestos detallados en la pestaña 'Estadísticas y Límites' del menú lateral.",
        };
        return { chatHistory: [...chatHistory, promptMsg] };
      }

      return { chatHistory };
    });
  },
}));
