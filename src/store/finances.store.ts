import { create } from "zustand";
import { databaseManager } from "./database.manager";
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

export interface UseFinancesState {
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal;
  chatHistory: ChatMessage[];
  chatSessions: string[];
  categories: string[];
  isGenerating: boolean;
  dbReady: boolean;

  // Actions
  loadUserDatabase: (email: string) => Promise<void>;
  clearUserDatabase: () => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  deleteTransaction: (id: string) => void;
  updateBudgetLimit: (category: string, limit: number) => void;
  updateBudgetSpent: (category: string, spent: number) => void;
  depositSavings: (amount: number) => void;
  resetSavings: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatHistory: (history: ChatMessage[]) => void;
  sendMessage: (text: string, chatId?: string) => Promise<void>;
  applyAction: (actionId: string, messageId: string, chatId?: string) => void;
  loadChatHistory: (chatId: string) => void;
  loadChatSessions: () => void;
  addCategory: (name: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  deleteChatMessage: (messageId: string) => void;
}

export const useFinancesStore = create<UseFinancesState>((set, get) => ({
  transactions: INITIAL_TRANSACTIONS,
  budgets: INITIAL_BUDGETS,
  savings: INITIAL_SAVINGS,
  chatHistory: INITIAL_CHAT_HISTORY,
  chatSessions: [],
  categories: ["Comida fuera", "Transporte", "Supermercado", "Facturas", "Compras", "Otros"],
  isGenerating: false,
  dbReady: false,

  loadUserDatabase: async (email) => {
    set({ dbReady: false });
    try {
      await databaseManager.init(email);
      const activeChatId = databaseManager.getLastActiveChatId();
      set({
        transactions: databaseManager.getTransactions(),
        budgets: databaseManager.getBudgets(),
        savings: databaseManager.getSavings(),
        chatHistory: databaseManager.getChatHistory(activeChatId),
        chatSessions: databaseManager.getChatSessions(),
        categories: databaseManager.getCategories(),
        dbReady: true,
      });
    } catch (err) {
      console.error("Failed to load user database:", err);
      set({
        transactions: INITIAL_TRANSACTIONS,
        budgets: INITIAL_BUDGETS,
        savings: INITIAL_SAVINGS,
        chatHistory: INITIAL_CHAT_HISTORY,
        chatSessions: [],
        categories: ["Comida fuera", "Transporte", "Supermercado", "Facturas", "Compras", "Otros"],
        dbReady: true,
      });
    }
  },

  clearUserDatabase: () => {
    databaseManager.close();
    set({
      transactions: [],
      budgets: [],
      savings: INITIAL_SAVINGS,
      chatHistory: [],
      chatSessions: [],
      categories: ["Comida fuera", "Transporte", "Supermercado", "Facturas", "Compras", "Otros"],
      dbReady: false,
    });
  },

  addTransaction: (tx) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: "Hoy",
    };

    if (databaseManager.isActive()) {
      databaseManager.addTransaction(newTx);
      databaseManager.save();
      set({
        transactions: databaseManager.getTransactions(),
        budgets: databaseManager.getBudgets(),
      });
    } else {
      set((state) => {
        let updatedBudgets = state.budgets;
        if (tx.type === "expense") {
          updatedBudgets = state.budgets.map((b) =>
            b.category === tx.category ? { ...b, spent: b.spent + tx.amount } : b
          );
        }

        return {
          transactions: [newTx, ...state.transactions],
          budgets: updatedBudgets,
        };
      });
    }

    return newTx;
  },

  deleteTransaction: (id) => {
    if (databaseManager.isActive()) {
      const txDeleted = databaseManager.deleteTransaction(id);
      if (txDeleted) {
        databaseManager.save();
        set({
          transactions: databaseManager.getTransactions(),
          budgets: databaseManager.getBudgets(),
        });
      }
    } else {
      set((state) => {
        const txToDelete = state.transactions.find((t) => t.id === id);
        if (!txToDelete) return {};

        let updatedBudgets = state.budgets;
        if (txToDelete.type === "expense") {
          updatedBudgets = state.budgets.map((b) =>
            b.category === txToDelete.category
              ? { ...b, spent: Math.max(0, b.spent - txToDelete.amount) }
              : b
          );
        }

        return {
          transactions: state.transactions.filter((t) => t.id !== id),
          budgets: updatedBudgets,
        };
      });
    }
  },

  updateBudgetLimit: (category, limit) => {
    if (databaseManager.isActive()) {
      databaseManager.updateBudgetLimit(category, limit);
      databaseManager.save();
      set({ budgets: databaseManager.getBudgets() });
    } else {
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.category === category ? { ...b, limit } : b
        ),
      }));
    }
  },

  updateBudgetSpent: (category, spent) => {
    if (databaseManager.isActive()) {
      databaseManager.updateBudgetSpent(category, spent);
      databaseManager.save();
      set({ budgets: databaseManager.getBudgets() });
    } else {
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.category === category ? { ...b, spent } : b
        ),
      }));
    }
  },

  depositSavings: (amount) => {
    if (databaseManager.isActive()) {
      databaseManager.depositSavings(amount);
      databaseManager.save();
      set({ savings: databaseManager.getSavings() });
    } else {
      set((state) => ({
        savings: {
          ...state.savings,
          current: state.savings.current + amount,
        },
      }));
    }
  },

  resetSavings: () => {
    if (databaseManager.isActive()) {
      databaseManager.resetSavings();
      databaseManager.save();
      set({ savings: databaseManager.getSavings() });
    } else {
      set((state) => ({
        savings: {
          ...state.savings,
          current: 0,
        },
      }));
    }
  },

  addChatMessage: (msg) => {
    if (databaseManager.isActive()) {
      const activeChatId = databaseManager.getLastActiveChatId();
      databaseManager.persistChatMessage(msg, activeChatId);
      databaseManager.save();
      set({
        chatHistory: databaseManager.getChatHistory(activeChatId),
        chatSessions: databaseManager.getChatSessions(),
      });
    } else {
      set((state) => ({
        chatHistory: [...state.chatHistory, msg],
      }));
    }
  },

  setChatHistory: (history) => {
    if (databaseManager.isActive()) {
      const activeChatId = databaseManager.getLastActiveChatId();
      databaseManager.clearChatHistory(activeChatId);
      for (const msg of history) {
        databaseManager.persistChatMessage(msg, activeChatId);
      }
      databaseManager.save();
      set({
        chatHistory: databaseManager.getChatHistory(activeChatId),
        chatSessions: databaseManager.getChatSessions(),
      });
    } else {
      set({ chatHistory: history });
    }
  },

  sendMessage: async (text, chatId) => {
    const activeChatId = chatId || databaseManager.getLastActiveChatId();
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text,
    };

    if (databaseManager.isActive()) {
      databaseManager.persistChatMessage(userMsg, activeChatId);
      databaseManager.save();
      set({
        chatHistory: databaseManager.getChatHistory(activeChatId),
        chatSessions: databaseManager.getChatSessions(),
        isGenerating: true,
      });
    } else {
      set((state) => ({
        chatHistory: [...state.chatHistory, userMsg],
        isGenerating: true,
      }));
    }

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
        chatHistory,
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

      if (databaseManager.isActive()) {
        databaseManager.persistChatMessage(aiMsg, activeChatId);
        databaseManager.save();
        set({
          chatHistory: databaseManager.getChatHistory(activeChatId),
          chatSessions: databaseManager.getChatSessions(),
          isGenerating: false,
        });
      } else {
        set((state) => ({
          chatHistory: [...state.chatHistory, aiMsg],
          isGenerating: false,
        }));
      }
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

      if (databaseManager.isActive()) {
        databaseManager.persistChatMessage(errorMsg, activeChatId);
        databaseManager.save();
        set({
          chatHistory: databaseManager.getChatHistory(activeChatId),
          chatSessions: databaseManager.getChatSessions(),
          isGenerating: false,
        });
      } else {
        set((state) => ({
          chatHistory: [...state.chatHistory, errorMsg],
          isGenerating: false,
        }));
      }
    }
  },

  applyAction: (actionId, messageId, chatId) => {
    const activeChatId = chatId || databaseManager.getLastActiveChatId();
    if (databaseManager.isActive()) {
      databaseManager.removeActionChipsFromMessage(messageId);

      let confirmMsg: ChatMessage | null = null;

      if (
        actionId === "move_to_savings" ||
        actionId === "move_to_savings_quick"
      ) {
        const transferAmount = actionId === "move_to_savings" ? 120 : 50;
        databaseManager.depositSavings(transferAmount);

        const currentSavings = databaseManager.getSavings();

        confirmMsg = {
          id: `chat-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: `¡Listo! He transferido $${transferAmount.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} a tu ahorro '${currentSavings.name}'.`,
        };
      } else if (actionId === "ignore") {
        confirmMsg = {
          id: `chat-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: "De acuerdo, he ignorado la sugerencia.",
        };
      } else if (actionId === "ask_record_expense") {
        confirmMsg = {
          id: `chat-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: "Perfecto. Dime qué compraste y cuánto costó. Por ejemplo: 'Compré un café por 4.50'.",
        };
      } else if (actionId === "ask_view_limits") {
        confirmMsg = {
          id: `chat-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: "Puedes ver todos tus presupuestos detallados en la pestaña 'Estadísticas y Límites' del menú lateral.",
        };
      }

      if (confirmMsg) {
        databaseManager.persistChatMessage(confirmMsg, activeChatId);
      }
      databaseManager.save();

      set({
        chatHistory: databaseManager.getChatHistory(activeChatId),
        savings: databaseManager.getSavings(),
        chatSessions: databaseManager.getChatSessions(),
      });
    } else {
      set((state) => {
        const chatHistory = state.chatHistory.map((msg) =>
          msg.id === messageId ? { ...msg, actionChips: [] } : msg
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
            text: `¡Listo! He transferido $${transferAmount.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} a tu ahorro '${state.savings.name}'.`,
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
    }
  },

  loadChatHistory: (chatId) => {
    if (databaseManager.isActive()) {
      set({ chatHistory: databaseManager.getChatHistory(chatId) });
    }
  },

  loadChatSessions: () => {
    if (databaseManager.isActive()) {
      set({ chatSessions: databaseManager.getChatSessions() });
    }
  },

  addCategory: (name) => {
    if (databaseManager.isActive()) {
      databaseManager.addCategory(name);
      databaseManager.save();
      set({ categories: databaseManager.getCategories() });
    }
  },

  updateCategory: (oldName, newName) => {
    if (databaseManager.isActive()) {
      databaseManager.updateCategory(oldName, newName);
      databaseManager.save();
      set({
        categories: databaseManager.getCategories(),
        transactions: databaseManager.getTransactions(),
        budgets: databaseManager.getBudgets(),
      });
    }
  },

  deleteCategory: (name) => {
    if (databaseManager.isActive()) {
      databaseManager.deleteCategory(name);
      databaseManager.save();
      set({
        categories: databaseManager.getCategories(),
        transactions: databaseManager.getTransactions(),
        budgets: databaseManager.getBudgets(),
      });
    }
  },

  deleteChatMessage: (messageId) => {
    const chatHistory = get().chatHistory;
    const idx = chatHistory.findIndex((m) => m.id === messageId);
    if (idx === -1) return;

    const msg = chatHistory[idx];
    const idsToDelete = [messageId];
    let transactionIdToDelete = msg.transactionDetail?.id;

    // Check if the next message is the associated AI response
    if (msg.sender === "user" && idx + 1 < chatHistory.length) {
      const nextMsg = chatHistory[idx + 1];
      if (nextMsg.sender === "ai") {
        idsToDelete.push(nextMsg.id);
        if (nextMsg.transactionDetail?.id) {
          transactionIdToDelete = nextMsg.transactionDetail.id;
        }
      }
    }

    if (transactionIdToDelete) {
      get().deleteTransaction(transactionIdToDelete);
    }

    if (databaseManager.isActive()) {
      for (const id of idsToDelete) {
        databaseManager.deleteChatMessage(id);
      }
      databaseManager.save();
      
      const sessions = databaseManager.getChatSessions();
      const activeChatId = databaseManager.getLastActiveChatId();
      set({
        chatHistory: databaseManager.getChatHistory(activeChatId),
        chatSessions: sessions,
      });
    } else {
      set((state) => ({
        chatHistory: state.chatHistory.filter((m) => !idsToDelete.includes(m.id)),
      }));
    }
  },
}));

