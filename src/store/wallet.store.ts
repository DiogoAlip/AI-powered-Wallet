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

export interface UseWalletState {
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal;
  chatHistory: ChatMessage[];
  isGenerating: boolean;

  // Actions
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => void;
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

  addTransaction: (tx) =>
    set((state) => {
      const newTx: Transaction = {
        ...tx,
        id: `tx-${Date.now()}`,
        date: "Hoy",
      };

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
    }),

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

    // Simulate AI response after 1.5s delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowerText = text.toLowerCase();
    let aiText =
      "Lo siento, no he entendido bien tu solicitud. Puedes decirme cosas como 'he gastado 50 en comida' o 'añade 20 a mis ahorros'.";
    let actionChips: { text: string; actionId: string }[] | undefined;
    let transactionDetail: Transaction | undefined;
    let infoText: string | undefined;

    // Check if the user is asking to add an expense
    if (
      lowerText.includes("gaste") ||
      lowerText.includes("gasté") ||
      lowerText.includes("gasto") ||
      lowerText.includes("pagué") ||
      lowerText.includes("pague") ||
      lowerText.includes("compré") ||
      lowerText.includes("compre")
    ) {
      // Try to extract amount
      const amountMatch = text.match(/\d+(?:\.\d+)?/);
      const amountVal = amountMatch ? parseFloat(amountMatch[0]) : 0;

      // Try to match category
      let categoryVal = "Otros";
      if (
        lowerText.includes("comida") ||
        lowerText.includes("restaurante") ||
        lowerText.includes("cena") ||
        lowerText.includes("almuerzo") ||
        lowerText.includes("cafe") ||
        lowerText.includes("café")
      ) {
        categoryVal = "Comida fuera";
      } else if (
        lowerText.includes("transporte") ||
        lowerText.includes("taxi") ||
        lowerText.includes("uber") ||
        lowerText.includes("bus") ||
        lowerText.includes("gasolina")
      ) {
        categoryVal = "Transporte";
      } else if (
        lowerText.includes("super") ||
        lowerText.includes("mercado") ||
        lowerText.includes("supermercado") ||
        lowerText.includes("compras de casa")
      ) {
        categoryVal = "Supermercado";
      } else if (
        lowerText.includes("factura") ||
        lowerText.includes("luz") ||
        lowerText.includes("agua") ||
        lowerText.includes("netflix") ||
        lowerText.includes("suscripcion") ||
        lowerText.includes("suscripción")
      ) {
        categoryVal = "Facturas";
      } else if (
        lowerText.includes("ropa") ||
        lowerText.includes("tienda") ||
        lowerText.includes("compra") ||
        lowerText.includes("compras")
      ) {
        categoryVal = "Compras";
      }

      if (amountVal > 0) {
        // Automatically add the transaction via store's addTransaction method
        get().addTransaction({
          merchant: "Gasto Rápido",
          category: categoryVal,
          amount: amountVal,
          account: "Tarjeta Personal",
          type: "expense",
        });

        // Fetch the budget to display remaining limit info
        const budget = get().budgets.find((b) => b.category === categoryVal);
        const remaining = budget ? budget.limit - budget.spent : 0;

        transactionDetail = {
          id: `tx-${Date.now()}`,
          merchant: "Gasto Rápido",
          category: categoryVal,
          amount: amountVal,
          date: "Hoy",
          account: "Tarjeta Personal",
          type: "expense",
        };

        aiText = `He registrado el gasto de $${amountVal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} en '${categoryVal}'. ¡Transacción añadida con éxito!`;
        infoText =
          remaining >= 0
            ? `Te quedan $${remaining.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} de tu presupuesto para '${categoryVal}'.`
            : `¡Alerta! Has excedido el presupuesto de '${categoryVal}' por $${Math.abs(remaining).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
      } else {
        aiText =
          "Parece que quieres registrar un gasto, pero no he podido entender la cantidad. Por favor indícame el monto, por ejemplo: 'gasté 25 en transporte'.";
      }
    }
    // Check if the user is asking to add/deposit to savings
    else if (lowerText.includes("ahorr") || lowerText.includes("deposit")) {
      const amountMatch = text.match(/\d+(?:\.\d+)?/);
      const amountVal = amountMatch ? parseFloat(amountMatch[0]) : 0;

      if (amountVal > 0) {
        get().depositSavings(amountVal);
        const savings = get().savings;

        aiText = `¡Estupendo! He añadido $${amountVal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} a tu meta '${savings.name}'.`;
        infoText = `Tu ahorro total en '${savings.name}' ahora es de $${savings.current.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} de un objetivo de $${savings.target.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
      } else {
        aiText =
          "Entendido, quieres guardar dinero en tus ahorros. ¿Cuánto te gustaría depositar? Ej: 'ahorrar 50'.";
      }
    }
    // Check for general help or greeting
    else if (
      lowerText.includes("hola") ||
      lowerText.includes("buenos dias") ||
      lowerText.includes("buenas tardes") ||
      lowerText.includes("hello")
    ) {
      aiText =
        "¡Hola! Soy FinancIA!, tu asistente financiero. Puedo ayudarte a registrar gastos, gestionar tus presupuestos, o seguir tus metas de ahorro. ¿Qué te gustaría hacer hoy?";
      actionChips = [
        { text: "Registrar Gasto", actionId: "ask_record_expense" },
        { text: "Ver mis límites", actionId: "ask_view_limits" },
        { text: "Ahorrar $50", actionId: "move_to_savings_quick" },
      ];
    } else if (
      lowerText.includes("limite") ||
      lowerText.includes("presupuesto") ||
      lowerText.includes("estadisticas") ||
      lowerText.includes("estadísticas")
    ) {
      const overBudgets = get().budgets.filter((b) => b.spent > b.limit);
      if (overBudgets.length > 0) {
        aiText = `He analizado tus presupuestos. Tienes ${overBudgets.length} categorías que han superado sus límites: ${overBudgets.map((b) => b.category).join(", ")}.`;
      } else {
        aiText =
          "¡Buenas noticias! Todos tus presupuestos se encuentran por debajo del límite establecido para esta semana.";
      }
      actionChips = [{ text: "Ver Estadísticas", actionId: "ask_view_limits" }];
    }

    const aiMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: aiText,
      transactionDetail,
      actionChips,
      infoText,
    };

    set((state) => ({
      chatHistory: [...state.chatHistory, aiMsg],
      isGenerating: false,
    }));
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
