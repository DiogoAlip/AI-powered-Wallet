import { create } from "zustand";
import initSqlJs from "sql.js";
import type { Database } from "sql.js";
import { indexedDbStorage } from "./indexedDbStorage";
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

let SQL: any = null;
let activeDb: Database | null = null;
let activeUserEmail: string | null = null;

const saveDatabaseToIndexedDB = async (email: string) => {
  if (!activeDb) return;
  const binaryArray = activeDb.export();
  await indexedDbStorage.set(`sqlite_db_${email}`, binaryArray);
};

const initializeSchema = () => {
  if (!activeDb) return;

  activeDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT,
      initialized INTEGER DEFAULT 0
    );
  `);

  activeDb.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      merchant TEXT,
      category TEXT,
      amount REAL,
      date TEXT,
      account TEXT,
      type TEXT,
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  activeDb.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      user_email TEXT,
      category TEXT,
      spent REAL,
      limit_val REAL,
      icon TEXT,
      color TEXT,
      PRIMARY KEY(user_email, category),
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  activeDb.run(`
    CREATE TABLE IF NOT EXISTS savings (
      user_email TEXT PRIMARY KEY,
      name TEXT,
      target REAL,
      current REAL,
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  activeDb.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      sender TEXT,
      timestamp TEXT,
      text TEXT,
      transaction_detail TEXT,
      action_chips TEXT,
      info_text TEXT,
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);
};

const seedDefaultData = (email: string) => {
  if (!activeDb) return;

  for (const tx of INITIAL_TRANSACTIONS) {
    activeDb.run(
      "INSERT INTO transactions (id, user_email, merchant, category, amount, date, account, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        tx.id,
        email,
        tx.merchant,
        tx.category,
        tx.amount,
        tx.date,
        tx.account,
        tx.type,
      ]
    );
  }

  for (const b of INITIAL_BUDGETS) {
    activeDb.run(
      "INSERT INTO budgets (user_email, category, spent, limit_val, icon, color) VALUES (?, ?, ?, ?, ?, ?)",
      [email, b.category, b.spent, b.limit, b.icon, b.color]
    );
  }

  activeDb.run(
    "INSERT INTO savings (user_email, name, target, current) VALUES (?, ?, ?, ?)",
    [email, INITIAL_SAVINGS.name, INITIAL_SAVINGS.target, INITIAL_SAVINGS.current]
  );

  for (const chat of INITIAL_CHAT_HISTORY) {
    activeDb.run(
      "INSERT INTO chat_messages (id, user_email, sender, timestamp, text, transaction_detail, action_chips, info_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        chat.id,
        email,
        chat.sender,
        chat.timestamp,
        chat.text,
        chat.transactionDetail ? JSON.stringify(chat.transactionDetail) : null,
        chat.actionChips ? JSON.stringify(chat.actionChips) : null,
        chat.infoText || null,
      ]
    );
  }
};

const getTransactions = (email: string): Transaction[] => {
  if (!activeDb) return [];
  const stmt = activeDb.prepare(
    "SELECT id, merchant, category, amount, date, account, type FROM transactions WHERE user_email = ?"
  );
  stmt.bind([email]);
  const txs: Transaction[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    txs.push({
      id: row.id as string,
      merchant: row.merchant as string,
      category: row.category as string,
      amount: row.amount as number,
      date: row.date as string,
      account: row.account as string,
      type: row.type as "expense" | "income",
    });
  }
  stmt.free();
  return txs;
};

const getBudgets = (email: string): Budget[] => {
  if (!activeDb) return [];
  const stmt = activeDb.prepare(
    "SELECT category, spent, limit_val, icon, color FROM budgets WHERE user_email = ?"
  );
  stmt.bind([email]);
  const budgets: Budget[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    budgets.push({
      category: row.category as string,
      spent: row.spent as number,
      limit: row.limit_val as number,
      icon: row.icon as string,
      color: row.color as string,
    });
  }
  stmt.free();
  return budgets;
};

const getSavings = (email: string): SavingsGoal => {
  if (!activeDb) return INITIAL_SAVINGS;
  const stmt = activeDb.prepare(
    "SELECT name, target, current FROM savings WHERE user_email = ?"
  );
  stmt.bind([email]);
  let savings: SavingsGoal = INITIAL_SAVINGS;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    savings = {
      name: row.name as string,
      target: row.target as number,
      current: row.current as number,
    };
  }
  stmt.free();
  return savings;
};

const getChatHistory = (email: string): ChatMessage[] => {
  if (!activeDb) return [];
  const stmt = activeDb.prepare(
    "SELECT id, sender, timestamp, text, transaction_detail, action_chips, info_text FROM chat_messages WHERE user_email = ? ORDER BY rowid ASC"
  );
  stmt.bind([email]);
  const history: ChatMessage[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    history.push({
      id: row.id as string,
      sender: row.sender as "user" | "ai",
      timestamp: row.timestamp as string,
      text: row.text as string,
      transactionDetail: row.transaction_detail
        ? JSON.parse(row.transaction_detail as string)
        : undefined,
      actionChips: row.action_chips
        ? JSON.parse(row.action_chips as string)
        : undefined,
      infoText: row.info_text ? (row.info_text as string) : undefined,
    });
  }
  stmt.free();
  return history;
};

const persistChatMessage = (msg: ChatMessage) => {
  if (!activeDb || !activeUserEmail) return;
  activeDb.run(
    "INSERT INTO chat_messages (id, user_email, sender, timestamp, text, transaction_detail, action_chips, info_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      msg.id,
      activeUserEmail,
      msg.sender,
      msg.timestamp,
      msg.text,
      msg.transactionDetail ? JSON.stringify(msg.transactionDetail) : null,
      msg.actionChips ? JSON.stringify(msg.actionChips) : null,
      msg.infoText || null,
    ]
  );
  saveDatabaseToIndexedDB(activeUserEmail);
};

export interface UseFinancesState {
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal;
  chatHistory: ChatMessage[];
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
  sendMessage: (text: string) => Promise<void>;
  applyAction: (actionId: string, messageId: string) => void;
}

export const useFinancesStore = create<UseFinancesState>((set, get) => ({
  transactions: INITIAL_TRANSACTIONS,
  budgets: INITIAL_BUDGETS,
  savings: INITIAL_SAVINGS,
  chatHistory: INITIAL_CHAT_HISTORY,
  isGenerating: false,
  dbReady: false,

  loadUserDatabase: async (email) => {
    if (activeUserEmail === email && activeDb) {
      set({ dbReady: true });
      return;
    }

    set({ dbReady: false });
    activeUserEmail = email;

    try {
      if (!SQL) {
        SQL = await initSqlJs({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/${file}`,
        });
      }

      const dbData = await indexedDbStorage.get(`sqlite_db_${email}`);
      const db = dbData ? new SQL.Database(dbData) : new SQL.Database();
      activeDb = db;

      initializeSchema();

      const userStmt = db.prepare("SELECT initialized FROM users WHERE email = ?");
      userStmt.bind([email]);
      let initialized = false;
      if (userStmt.step()) {
        const row = userStmt.getAsObject();
        initialized = row.initialized === 1;
      }
      userStmt.free();

      if (!initialized) {
        db.run("INSERT OR REPLACE INTO users (email, name, initialized) VALUES (?, ?, ?)", [
          email,
          "Socio FinancIA!",
          1,
        ]);
        seedDefaultData(email);
        await saveDatabaseToIndexedDB(email);
      }

      const transactions = getTransactions(email);
      const budgets = getBudgets(email);
      const savings = getSavings(email);
      const chatHistory = getChatHistory(email);

      set({
        transactions,
        budgets,
        savings,
        chatHistory,
        dbReady: true,
      });
    } catch (err) {
      console.error("Failed to load user database:", err);
      set({
        transactions: INITIAL_TRANSACTIONS,
        budgets: INITIAL_BUDGETS,
        savings: INITIAL_SAVINGS,
        chatHistory: INITIAL_CHAT_HISTORY,
        dbReady: true,
      });
    }
  },

  clearUserDatabase: () => {
    if (activeDb) {
      activeDb.close();
      activeDb = null;
    }
    activeUserEmail = null;
    set({
      transactions: [],
      budgets: [],
      savings: INITIAL_SAVINGS,
      chatHistory: [],
      dbReady: false,
    });
  },

  addTransaction: (tx) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: "Hoy",
    };

    if (activeDb && activeUserEmail) {
      activeDb.run(
        "INSERT INTO transactions (id, user_email, merchant, category, amount, date, account, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          newTx.id,
          activeUserEmail,
          newTx.merchant,
          newTx.category,
          newTx.amount,
          newTx.date,
          newTx.account,
          newTx.type,
        ]
      );

      if (tx.type === "expense") {
        activeDb.run(
          "UPDATE budgets SET spent = spent + ? WHERE user_email = ? AND category = ?",
          [tx.amount, activeUserEmail, tx.category]
        );
      }

      saveDatabaseToIndexedDB(activeUserEmail);

      set({
        transactions: getTransactions(activeUserEmail),
        budgets: getBudgets(activeUserEmail),
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
    if (activeDb && activeUserEmail) {
      const stmt = activeDb.prepare("SELECT type, category, amount FROM transactions WHERE id = ?");
      stmt.bind([id]);
      let txToDelete: any = null;
      if (stmt.step()) {
        txToDelete = stmt.getAsObject();
      }
      stmt.free();

      if (txToDelete) {
        activeDb.run("DELETE FROM transactions WHERE id = ?", [id]);

        if (txToDelete.type === "expense") {
          activeDb.run(
            "UPDATE budgets SET spent = MAX(0, spent - ?) WHERE user_email = ? AND category = ?",
            [txToDelete.amount, activeUserEmail, txToDelete.category]
          );
        }

        saveDatabaseToIndexedDB(activeUserEmail);

        set({
          transactions: getTransactions(activeUserEmail),
          budgets: getBudgets(activeUserEmail),
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
    if (activeDb && activeUserEmail) {
      activeDb.run(
        "UPDATE budgets SET limit_val = ? WHERE user_email = ? AND category = ?",
        [limit, activeUserEmail, category]
      );
      saveDatabaseToIndexedDB(activeUserEmail);
      set({ budgets: getBudgets(activeUserEmail) });
    } else {
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.category === category ? { ...b, limit } : b
        ),
      }));
    }
  },

  updateBudgetSpent: (category, spent) => {
    if (activeDb && activeUserEmail) {
      activeDb.run(
        "UPDATE budgets SET spent = ? WHERE user_email = ? AND category = ?",
        [spent, activeUserEmail, category]
      );
      saveDatabaseToIndexedDB(activeUserEmail);
      set({ budgets: getBudgets(activeUserEmail) });
    } else {
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.category === category ? { ...b, spent } : b
        ),
      }));
    }
  },

  depositSavings: (amount) => {
    if (activeDb && activeUserEmail) {
      activeDb.run(
        "UPDATE savings SET current = current + ? WHERE user_email = ?",
        [amount, activeUserEmail]
      );
      saveDatabaseToIndexedDB(activeUserEmail);
      set({ savings: getSavings(activeUserEmail) });
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
    if (activeDb && activeUserEmail) {
      activeDb.run(
        "UPDATE savings SET current = 0 WHERE user_email = ?",
        [activeUserEmail]
      );
      saveDatabaseToIndexedDB(activeUserEmail);
      set({ savings: getSavings(activeUserEmail) });
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
    if (activeDb && activeUserEmail) {
      persistChatMessage(msg);
      set({ chatHistory: getChatHistory(activeUserEmail) });
    } else {
      set((state) => ({
        chatHistory: [...state.chatHistory, msg],
      }));
    }
  },

  setChatHistory: (history) => {
    if (activeDb && activeUserEmail) {
      activeDb.run("DELETE FROM chat_messages WHERE user_email = ?", [activeUserEmail]);
      for (const msg of history) {
        activeDb.run(
          "INSERT INTO chat_messages (id, user_email, sender, timestamp, text, transaction_detail, action_chips, info_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            msg.id,
            activeUserEmail,
            msg.sender,
            msg.timestamp,
            msg.text,
            msg.transactionDetail ? JSON.stringify(msg.transactionDetail) : null,
            msg.actionChips ? JSON.stringify(msg.actionChips) : null,
            msg.infoText || null,
          ]
        );
      }
      saveDatabaseToIndexedDB(activeUserEmail);
      set({ chatHistory: getChatHistory(activeUserEmail) });
    } else {
      set({ chatHistory: history });
    }
  },

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

    persistChatMessage(userMsg);
    if (activeUserEmail && activeDb) {
      set({
        chatHistory: getChatHistory(activeUserEmail),
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

      persistChatMessage(aiMsg);
      if (activeUserEmail && activeDb) {
        set({
          chatHistory: getChatHistory(activeUserEmail),
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

      persistChatMessage(errorMsg);
      if (activeUserEmail && activeDb) {
        set({
          chatHistory: getChatHistory(activeUserEmail),
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

  applyAction: (actionId, messageId) => {
    if (activeDb && activeUserEmail) {
      const getMsgStmt = activeDb.prepare(
        "SELECT text, sender, timestamp, transaction_detail, info_text FROM chat_messages WHERE id = ?"
      );
      getMsgStmt.bind([messageId]);
      let msgData: any = null;
      if (getMsgStmt.step()) {
        msgData = getMsgStmt.getAsObject();
      }
      getMsgStmt.free();

      if (msgData) {
        activeDb.run("UPDATE chat_messages SET action_chips = NULL WHERE id = ?", [
          messageId,
        ]);
      }

      let confirmMsg: ChatMessage | null = null;

      if (
        actionId === "move_to_savings" ||
        actionId === "move_to_savings_quick"
      ) {
        const transferAmount = actionId === "move_to_savings" ? 120 : 50;

        activeDb.run(
          "UPDATE savings SET current = current + ? WHERE user_email = ?",
          [transferAmount, activeUserEmail]
        );

        const currentSavings = getSavings(activeUserEmail);

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
        persistChatMessage(confirmMsg);
      } else {
        saveDatabaseToIndexedDB(activeUserEmail);
      }

      set({
        chatHistory: getChatHistory(activeUserEmail),
        savings: getSavings(activeUserEmail),
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
}));

