import { create } from "zustand";
import { useAuthStore } from "./auth.store.ts";
import { formatCurrency } from "../utils/format";
import type {
  Transaction,
  Budget,
  ChatMessage,
  SavingsGoal,
  SavingsLog,
} from "../dashboard/types/ChatTypes.ts";

export interface UseFinancesState {
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal;
  savingsLogs: SavingsLog[];
  chatHistory: ChatMessage[];
  chatSessions: string[];
  categories: string[];
  isGenerating: boolean;
  dbReady: boolean;
  loadingRecommendations: boolean;

  // Actions
  loadUserDatabase: (email: string) => Promise<void>;
  clearUserDatabase: () => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudgetLimit: (category: string, limit: number) => Promise<void>;
  updateBudgetSpent: (category: string, spent: number) => Promise<void>;
  depositSavings: (amount: number, note?: string) => Promise<void>;
  deleteSavingsLog: (id: string) => Promise<void>;
  resetSavings: () => Promise<void>;
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
  updateSavingsGoal: (name: string, target: number) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  loadSavingsRecommendations: () => Promise<string>;
  applySavingsRecommendation: () => Promise<void>;
  budgetTips: string;
  loadingTips: boolean;
  refreshBudgetTips: () => Promise<void>;
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
  savings: { name: "Fondo de Emergencia", target: 5000, current: 0 },
  savingsLogs: [],
  chatHistory: [],
  chatSessions: [],
  categories: ["Comida fuera", "Transporte", "Supermercado", "Facturas", "Compras", "Otros"],
  isGenerating: false,
  dbReady: false,
  loadingRecommendations: false,
  budgetTips: "",
  loadingTips: false,

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
          savingsLogs: data.state.savingsLogs || [],
          chatHistory: data.state.chatHistory,
          chatSessions: data.state.chatSessions,
          categories: data.state.categories,
          budgetTips: data.state.budgetTips || "",
          dbReady: true,
        });
      }
    } catch (err) {
      console.error("Failed to load user database:", err);
      set({
        transactions: [],
        budgets: [],
        savings: { name: "Fondo de Emergencia", target: 5000, current: 0 },
        savingsLogs: [],
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
      savings: { name: "Fondo de Emergencia", target: 5000, current: 0 },
      savingsLogs: [],
      chatHistory: [],
      chatSessions: [],
      categories: ["Comida fuera", "Transporte", "Supermercado", "Facturas", "Compras", "Otros"],
      budgetTips: "",
      dbReady: false,
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

  depositSavings: async (amount, note) => {
    try {
      const data = await apiFetch("/api/finances/savings/deposit", {
        method: "POST",
        body: JSON.stringify({ amount, note }),
      });
      if (data.success && data.state) {
        set({
          savings: data.state.savings,
          savingsLogs: data.state.savingsLogs || [],
        });
      }
    } catch (err) {
      console.error("Failed to deposit savings:", err);
    }
  },

  deleteSavingsLog: async (id) => {
    try {
      const data = await apiFetch(`/api/finances/savings/logs/${id}`, {
        method: "DELETE",
      });
      if (data.success && data.state) {
        set({
          savings: data.state.savings,
          savingsLogs: data.state.savingsLogs || [],
        });
      }
    } catch (err) {
      console.error("Failed to delete savings log:", err);
    }
  },

  resetSavings: async () => {
    try {
      const data = await apiFetch("/api/finances/savings/reset", {
        method: "POST",
      });
      if (data.success && data.state) {
        set({
          savings: data.state.savings,
          savingsLogs: data.state.savingsLogs || [],
        });
      }
    } catch (err) {
      console.error("Failed to reset savings:", err);
    }
  },

  addChatMessage: async (msg) => {
    try {
      const activeChatId = get().chatHistory[0]?.id || "chat-welcome";
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
      const activeChatId = get().chatHistory[0]?.id || "chat-welcome";
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
    const activeChatId = chatId || get().chatHistory[0]?.id || "chat-welcome";
    set({ isGenerating: true });

    try {
      const data = await apiFetch("/api/finances/chat", {
        method: "POST",
        body: JSON.stringify({ text, chatId: activeChatId }),
      });

      if (data.success && data.state) {
        set({
          transactions: data.state.transactions,
          budgets: data.state.budgets,
          savings: data.state.savings,
          savingsLogs: data.state.savingsLogs || [],
          chatHistory: data.state.chatHistory,
          chatSessions: data.state.chatSessions,
          isGenerating: false,
        });
      }
    } catch (error: any) {
      console.error("Failed to send chat message:", error);
      // Reload state to show the error message persisted by backend
      try {
        const data = await apiFetch("/api/finances");
        if (data.success && data.state) {
          set({
            chatHistory: data.state.chatHistory,
            chatSessions: data.state.chatSessions,
          });
        }
      } catch (e) {
        console.error("Failed to recover finances state:", e);
      }
      set({ isGenerating: false });
    }
  },

  applyAction: async (actionId, messageId, chatId) => {
    const activeChatId = chatId || get().chatHistory[0]?.id || "chat-welcome";
    let navigateTo: string | undefined;
    let focusInput: boolean | undefined;

    try {
      // 1. Remove action chips from the message
      await apiFetch(`/api/finances/chat-messages/${messageId}/remove-action-chips`, {
        method: "PUT",
      });

      // 2. Perform target actions
      let confirmText = "";
      if (actionId === "move_to_savings" || actionId === "move_to_savings_quick") {
        const transferAmount = actionId === "move_to_savings" ? 120 : 50;
        await apiFetch("/api/finances/savings/deposit", {
          method: "POST",
          body: JSON.stringify({ amount: transferAmount }),
        });
        const savingsData = await apiFetch("/api/finances");
        const currentSavingsName = savingsData.state.savings.name;
        confirmText = `¡Listo! He transferido ${formatCurrency(transferAmount)} a tu ahorro '${currentSavingsName}'.`;
      } else if (actionId === "ignore") {
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
          savingsLogs: data.state.savingsLogs || [],
          chatSessions: data.state.chatSessions,
        });
      }
      return { success: true, navigateTo, focusInput };
    } catch (err) {
      console.error("Failed to apply action:", err);
      return { success: false };
    }
  },

  loadChatHistory: async (chatId) => {
    try {
      const data = await apiFetch(`/api/finances/chat-history?chatId=${chatId}`);
      if (data.success) {
        set({ chatHistory: data.chatHistory });
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
        });
      }
    } catch (err) {
      console.error("Failed to delete chat message:", err);
    }
  },

  updateSavingsGoal: async (name, target) => {
    try {
      const data = await apiFetch("/api/finances/savings", {
        method: "PUT",
        body: JSON.stringify({ name, target }),
      });
      if (data.success && data.state) {
        set({ savings: data.state.savings });
      }
    } catch (err) {
      console.error("Failed to update savings goal:", err);
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

  loadSavingsRecommendations: async () => {
    set({ loadingRecommendations: true });
    try {
      const data = await apiFetch("/api/finances/savings/recommendations");
      if (data.success) {
        set({ savings: data.state.savings, loadingRecommendations: false });
        return data.recommendations;
      }
    } catch (err) {
      console.error("Failed to load savings recommendations:", err);
    }
    set({ loadingRecommendations: false });
    return "";
  },

  applySavingsRecommendation: async () => {
    set({ loadingRecommendations: true });
    try {
      const data = await apiFetch("/api/finances/savings/apply-recommendation", {
        method: "POST",
      });
      if (data.success && data.state) {
        set({
          savings: data.state.savings,
          savingsLogs: data.state.savingsLogs || [],
          budgets: data.state.budgets,
          chatHistory: data.state.chatHistory,
          loadingRecommendations: false,
        });
      }
    } catch (err) {
      console.error("Failed to apply savings recommendation:", err);
    }
    set({ loadingRecommendations: false });
  },

  refreshBudgetTips: async () => {
    set({ loadingTips: true });
    try {
      const data = await apiFetch("/api/finances/budgets/tips/refresh", {
        method: "POST"
      });
      if (data.success) {
        set({
          budgetTips: data.budgetTips || "",
          transactions: data.state.transactions,
          budgets: data.state.budgets,
          savings: data.state.savings,
          savingsLogs: data.state.savingsLogs || [],
          chatHistory: data.state.chatHistory,
        });
      }
    } catch (err) {
      console.error("Failed to refresh budget tips:", err);
    }
    set({ loadingTips: false });
  },
}));
