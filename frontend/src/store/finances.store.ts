import { create } from "zustand";
import { useAuthStore } from "./auth.store.ts";
import type {
  Transaction,
  Budget,
  ChatMessage,
  SavingsGoal,
  WeeklySavings,
} from "../dashboard/types/ChatTypes.ts";

export interface UseFinancesState {
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal;
  savingsHistory: WeeklySavings[];
  chatHistory: ChatMessage[];
  chatSessions: string[];
  categories: string[];
  isGenerating: boolean;
  dbReady: boolean;
  activeChatId: string | null;

  // Actions
  loadUserDatabase: (email: string) => Promise<void>;
  clearUserDatabase: () => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudgetLimit: (category: string, limit: number) => Promise<void>;
  updateBudgetSpent: (category: string, spent: number) => Promise<void>;
  addChatMessage: (msg: ChatMessage) => Promise<void>;
  setChatHistory: (history: ChatMessage[]) => Promise<void>;
  sendMessage: (text: string, chatId?: string) => Promise<void>;
  applyAction: (actionId: string, messageId: string, chatId?: string) => Promise<{
    success: boolean;
    navigateTo?: string;
    focusInput?: boolean;
  }>;
  loadChatHistory: (chatId: string) => Promise<void>;
  loadChatSessions: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  deleteChatMessage: (messageId: string, chatId?: string) => Promise<void>;
  updateSavingsGoal: (name: string, target: number, start_date: string, deadline?: string | null) => Promise<void>;
  deleteSavingsGoal: () => Promise<void>;
  loadSavingsHistory: () => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  budgetTips: string;
  loadingTips: boolean;
  startChatWithPrompt: (type?: string, customPrompt?: string) => Promise<string | undefined>;
}

const getEmail = () => {
  return useAuthStore.getState().user?.email || "";
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const email = getEmail();
  if (!email) {
    throw new Error("No active user session found.");
  }
  const headers = {
    "Content-Type": "application/json",
    "x-user-email": email,
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const useFinancesStore = create<UseFinancesState>((set, get) => ({
  transactions: [],
  budgets: [],
  savings: { name: null, target: 0, current: 0, start_date: null, deadline: null },
  savingsHistory: [],
  chatHistory: [],
  chatSessions: [],
  categories: ["Comida fuera", "Transporte", "Supermercado", "Facturas", "Compras", "Otros"],
  isGenerating: false,
  dbReady: false,
  budgetTips: "",
  loadingTips: false,
  activeChatId: null,

  loadUserDatabase: async (_email) => {
    set({ dbReady: false });
    try {
      // Backend automatically checks/initializes user on login endpoint,
      // then we pull the latest state
      const data = await apiFetch("/api/finances");
      if (data.success && data.state) {
        set({
          transactions: data.state.transactions,
          budgets: data.state.budgets,
          savings: data.state.savings,
          chatHistory: data.state.chatHistory,
          chatSessions: data.state.chatSessions,
          categories: data.state.categories,
          budgetTips: data.state.budgetTips || "",
          activeChatId: data.state.activeChatId || null,
          dbReady: true,
        });
      }
    } catch (err) {
      console.error("Failed to load user database:", err);
      set({
        transactions: [],
        budgets: [],
        savings: { name: null, target: 0, current: 0, start_date: null, deadline: null },
        savingsHistory: [],
        chatHistory: [],
        chatSessions: [],
        categories: ["Comida fuera", "Transporte", "Supermercado", "Facturas", "Compras", "Otros"],
        budgetTips: "",
        dbReady: true,
      });
    }
  },

  clearUserDatabase: () => {
    set({
      transactions: [],
      budgets: [],
      savings: { name: null, target: 0, current: 0, start_date: null, deadline: null },
      savingsHistory: [],
      chatHistory: [],
      chatSessions: [],
      categories: ["Comida fuera", "Transporte", "Supermercado", "Facturas", "Compras", "Otros"],
      budgetTips: "",
      dbReady: false,
      activeChatId: null,
    });
  },

  addTransaction: async (tx) => {
    try {
      const data = await apiFetch("/api/finances/transactions", {
        method: "POST",
        body: JSON.stringify(tx),
      });
      if (data.success && data.state) {
        set({
          transactions: data.state.transactions,
          budgets: data.state.budgets,
        });
      }
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  },

  updateTransaction: async (id, tx) => {
    try {
      const data = await apiFetch(`/api/finances/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(tx),
      });
      if (data.success && data.state) {
        set({
          transactions: data.state.transactions,
          budgets: data.state.budgets,
        });
      }
    } catch (err) {
      console.error("Failed to update transaction:", err);
    }
  },

  deleteTransaction: async (id) => {
    try {
      const data = await apiFetch(`/api/finances/transactions/${id}`, {
        method: "DELETE",
      });
      if (data.success && data.state) {
        set({
          transactions: data.state.transactions,
          budgets: data.state.budgets,
        });
      }
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  },

  updateBudgetLimit: async (category, limit) => {
    try {
      const data = await apiFetch("/api/finances/budgets", {
        method: "PUT",
        body: JSON.stringify({ category, limit }),
      });
      if (data.success && data.state) {
        set({ budgets: data.state.budgets });
      }
    } catch (err) {
      console.error("Failed to update budget limit:", err);
    }
  },

  updateBudgetSpent: async (category, spent) => {
    try {
      const data = await apiFetch("/api/finances/budgets", {
        method: "PUT",
        body: JSON.stringify({ category, spent }),
      });
      if (data.success && data.state) {
        set({ budgets: data.state.budgets });
      }
    } catch (err) {
      console.error("Failed to update budget spent:", err);
    }
  },

  addChatMessage: async (msg) => {
    try {
      const activeChatId = get().activeChatId || "chat-welcome";
      const data = await apiFetch("/api/finances/chat-messages", {
        method: "POST",
        body: JSON.stringify({ message: msg, chatId: activeChatId }),
      });
      if (data.success && data.state) {
        set({
          chatHistory: data.state.chatHistory,
          chatSessions: data.state.chatSessions,
        });
      }
    } catch (err) {
      console.error("Failed to add chat message:", err);
    }
  },

  setChatHistory: async (history) => {
    try {
      const activeChatId = get().activeChatId || "chat-welcome";
      // Clear history on backend
      await apiFetch(`/api/finances/chat-messages?chatId=${activeChatId}`, {
        method: "DELETE",
      });
      // Save all messages
      for (const msg of history) {
        await apiFetch("/api/finances/chat-messages", {
          method: "POST",
          body: JSON.stringify({ message: msg, chatId: activeChatId }),
        });
      }
      const data = await apiFetch("/api/finances");
      if (data.success && data.state) {
        set({
          chatHistory: data.state.chatHistory,
          chatSessions: data.state.chatSessions,
        });
      }
    } catch (err) {
      console.error("Failed to set chat history:", err);
    }
  },

  sendMessage: async (text, chatId) => {
    const activeChatId = chatId || get().activeChatId || "chat-welcome";
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text,
    };

    if (activeChatId === get().activeChatId) {
      set({
        chatHistory: [...get().chatHistory, userMsg],
        isGenerating: true,
      });
    } else {
      set({
        activeChatId,
        chatHistory: [userMsg],
        isGenerating: true,
      });
    }

    try {
      const data = await apiFetch("/api/finances/chat", {
        method: "POST",
        body: JSON.stringify({ text, chatId: activeChatId }),
      });

      if (data.success && data.state) {
        if (activeChatId === get().activeChatId) {
          set({
            transactions: data.state.transactions,
            budgets: data.state.budgets,
            savings: data.state.savings,
            chatHistory: data.state.chatHistory,
            chatSessions: data.state.chatSessions,
            isGenerating: false,
          });
        } else {
          set({
            transactions: data.state.transactions,
            budgets: data.state.budgets,
            savings: data.state.savings,
            chatSessions: data.state.chatSessions,
            isGenerating: false,
          });
        }
      }
    } catch (error: any) {
      console.error("Failed to send chat message:", error);
      // Reload state to show the error message persisted by backend
      try {
        const data = await apiFetch("/api/finances");
        if (data.success && data.state) {
          if (activeChatId === get().activeChatId) {
            set({
              chatHistory: data.state.chatHistory,
              chatSessions: data.state.chatSessions,
            });
          } else {
            set({
              chatSessions: data.state.chatSessions,
            });
          }
        }
      } catch (e) {
        console.error("Failed to recover finances state:", e);
      }
      set({ isGenerating: false });
    }
  },

  applyAction: async (actionId, messageId, chatId) => {
    const activeChatId = chatId || get().activeChatId || "chat-welcome";
    let navigateTo: string | undefined;
    let focusInput: boolean | undefined;

    try {
      // 1. Remove action chips from the message
      await apiFetch(`/api/finances/chat-messages/${messageId}/remove-action-chips`, {
        method: "PUT",
      });

      // 2. Perform target actions
      let confirmText = "";
      if (actionId === "ignore") {
        confirmText = "De acuerdo, he ignorado la sugerencia.";
      } else if (actionId === "ask_record_expense") {
        confirmText = "Perfecto. Dime qué compraste y cuánto costó. Por ejemplo: 'Compré un café por 4.50'.";
        focusInput = true;
      } else if (actionId === "ask_view_limits") {
        confirmText = "Puedes ver todos tus presupuestos detallados en la pestaña 'Estadísticas y Límites' del menú lateral.";
        navigateTo = "/dashboard/limits";
      } else if (actionId === "ask_view_history") {
        confirmText = "Te redirijo al Historial de Transacciones.";
        navigateTo = "/dashboard/history";
      } else if (actionId === "ask_view_goals") {
        confirmText = "Te redirijo a tus Metas de Ahorro.";
        navigateTo = "/dashboard/goals";
      }

      // 3. Persist confirmation message if any
      if (confirmText) {
        const confirmMsg = {
          id: `chat-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: confirmText,
        };
        await apiFetch("/api/finances/chat-messages", {
          method: "POST",
          body: JSON.stringify({ message: confirmMsg, chatId: activeChatId }),
        });
      }

      // 4. Reload full state
      const data = await apiFetch("/api/finances");
      if (data.success && data.state) {
        set({
          chatHistory: data.state.chatHistory,
          savings: data.state.savings,
          chatSessions: data.state.chatSessions,
          activeChatId: data.state.activeChatId || null,
        });
      }
      return { success: true, navigateTo, focusInput };
    } catch (err) {
      console.error("Failed to apply action:", err);
      return { success: false };
    }
  },

  loadChatHistory: async (chatId) => {
    if (chatId !== get().activeChatId) {
      set({ activeChatId: chatId, chatHistory: [] });
    }
    try {
      const data = await apiFetch(`/api/finances/chat-history?chatId=${chatId}`);
      if (data.success) {
        if (chatId === get().activeChatId) {
          set({ chatHistory: data.chatHistory });
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  },

  loadChatSessions: async () => {
    try {
      const data = await apiFetch("/api/finances");
      if (data.success && data.state) {
        set({ chatSessions: data.state.chatSessions });
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    }
  },

  addCategory: async (name) => {
    try {
      const data = await apiFetch("/api/finances/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (data.success && data.state) {
        set({ categories: data.state.categories });
      }
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  },

  updateCategory: async (oldName, newName) => {
    try {
      const data = await apiFetch("/api/finances/categories", {
        method: "PUT",
        body: JSON.stringify({ oldName, newName }),
      });
      if (data.success && data.state) {
        set({
          categories: data.state.categories,
          transactions: data.state.transactions,
          budgets: data.state.budgets,
        });
      }
    } catch (err) {
      console.error("Failed to update category:", err);
    }
  },

  deleteCategory: async (name) => {
    try {
      const data = await apiFetch(`/api/finances/categories?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (data.success && data.state) {
        set({
          categories: data.state.categories,
          transactions: data.state.transactions,
          budgets: data.state.budgets,
        });
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  },

  deleteChatMessage: async (messageId, chatId) => {
    const chatHistory = get().chatHistory;
    const idx = chatHistory.findIndex((m) => m.id === messageId);
    if (idx === -1) return;

    const msg = chatHistory[idx];
    const idsToDelete = [messageId];
    let transactionIdToDelete = msg.transactionDetail?.id;

    if (msg.sender === "user" && idx + 1 < chatHistory.length) {
      const nextMsg = chatHistory[idx + 1];
      if (nextMsg.sender === "ai") {
        idsToDelete.push(nextMsg.id);
        if (nextMsg.transactionDetail?.id) {
          transactionIdToDelete = nextMsg.transactionDetail.id;
        }
      }
    }

    try {
      if (transactionIdToDelete) {
        await apiFetch(`/api/finances/transactions/${transactionIdToDelete}`, {
          method: "DELETE",
        });
      }

      for (const id of idsToDelete) {
        await apiFetch(`/api/finances/chat-messages/${id}`, {
          method: "DELETE",
        });
      }

      const data = await apiFetch("/api/finances");
      if (data.success && data.state) {
        const targetChatId = chatId || data.state.activeChatId || "chat-welcome";
        const historyData = await apiFetch(`/api/finances/chat-history?chatId=${targetChatId}`);
        set({
          chatHistory: historyData.chatHistory,
          chatSessions: data.state.chatSessions,
          transactions: data.state.transactions,
          budgets: data.state.budgets,
          activeChatId: targetChatId,
        });
      }
    } catch (err) {
      console.error("Failed to delete chat message:", err);
    }
  },

  updateSavingsGoal: async (name, target, start_date, deadline) => {
    try {
      const data = await apiFetch("/api/finances/savings", {
        method: "PUT",
        body: JSON.stringify({ name, target, start_date, deadline: deadline || null }),
      });
      if (data.success && data.state) {
        set({ savings: data.state.savings });
      }
    } catch (err) {
      console.error("Failed to update savings goal:", err);
    }
  },

  deleteSavingsGoal: async () => {
    try {
      const data = await apiFetch("/api/finances/savings", {
        method: "DELETE",
      });
      if (data.success && data.state) {
        set({ savings: data.state.savings, savingsHistory: [] });
      }
    } catch (err) {
      console.error("Failed to delete savings goal:", err);
    }
  },

  loadSavingsHistory: async () => {
    try {
      const data = await apiFetch("/api/finances/savings/history");
      if (data.success) {
        set({ savingsHistory: data.history || [] });
      }
    } catch (err) {
      console.error("Failed to load savings history:", err);
    }
  },

  deleteUserAccount: async () => {
    try {
      await apiFetch("/api/finances/account", {
        method: "DELETE",
      });
      get().clearUserDatabase();
    } catch (err) {
      console.error("Failed to delete user account:", err);
    }
  },




  startChatWithPrompt: async (type, customPrompt) => {
    set({ loadingTips: true });
    try {
      const data = await apiFetch("/api/finances/chat/new-with-prompt", {
        method: "POST",
        body: JSON.stringify({ type, customPrompt }),
      });
      if (data.success) {
        set({
          transactions: data.state.transactions,
          budgets: data.state.budgets,
          savings: data.state.savings,
          chatHistory: data.state.chatHistory,
          chatSessions: data.state.chatSessions,
          activeChatId: data.chatId || null,
        });
        return data.chatId;
      }
    } catch (err) {
      console.error("Failed to start chat with prompt:", err);
    } finally {
      set({ loadingTips: false });
    }
  },
}));
