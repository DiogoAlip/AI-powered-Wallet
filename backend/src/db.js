import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS,
  INITIAL_CHAT_HISTORY,
} from "./mockData.js";

const DEFAULT_CATEGORIES = [
  "Comida fuera",
  "Transporte",
  "Supermercado",
  "Facturas",
  "Compras",
  "Otros",
];

let dbInstance = null;

export function initDb(dbPath = "./data/finances.db") {
  if (dbInstance) return dbInstance;

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  dbInstance = db;
  db.exec("PRAGMA foreign_keys = ON;");

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT,
      initialized INTEGER DEFAULT 0,
      budget_tips TEXT,
      password TEXT
    );
  `);

  db.exec(`
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

  db.exec(`
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

  db.exec(`
    CREATE TABLE IF NOT EXISTS savings (
      user_email TEXT PRIMARY KEY,
      name TEXT,
      target REAL,
      current REAL,
      recommendations TEXT,
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  try {
    db.exec("ALTER TABLE savings ADD COLUMN recommendations TEXT;");
  } catch (e) {
    // Already exists
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      chat_id TEXT,
      sender TEXT,
      timestamp TEXT,
      text TEXT,
      transaction_detail TEXT,
      action_chips TEXT,
      info_text TEXT,
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      user_email TEXT,
      name TEXT,
      PRIMARY KEY(user_email, name),
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  return db;
}

function getDb() {
  if (!dbInstance) {
    return initDb();
  }
  return dbInstance;
}

export function getUser(email) {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  const row = stmt.get(email.toLowerCase());
  return row ? { email: row.email, name: row.name, initialized: row.initialized === 1, budget_tips: row.budget_tips, password: row.password } : null;
}

export function initializeUser(email, name = "Socio FinancIA!", password = null) {
  const db = getDb();
  const cleanEmail = email.toLowerCase();
  const existing = getUser(cleanEmail);

  if (existing && existing.initialized) {
    return existing;
  }

  // Create user
  db.prepare("INSERT OR REPLACE INTO users (email, name, initialized, password) VALUES (?, ?, ?, ?)").run(
    cleanEmail,
    name,
    1,
    password
  );

  // Seed categories
  for (const cat of DEFAULT_CATEGORIES) {
    db.prepare("INSERT OR IGNORE INTO categories (user_email, name) VALUES (?, ?)").run(
      cleanEmail,
      cat
    );
  }

  const isDemo = cleanEmail === "demo@financia.com";
  if (isDemo) {
    // Seed default data
    db.prepare("UPDATE users SET budget_tips = ? WHERE email = ?").run(
      "Moviendo tus $120 de ahorro excedente en comida a tu Meta de Emergencia aumentas tu probabilidad de meta en un 8%.\nTus suscripciones como Netflix representan el 15% de tu presupuesto de facturas fijas. ¡Un control sabio!\nEstás en camino de acumular un excedente neto de $1,400 este mes si mantienes este ritmo de consumo de transporte.",
      cleanEmail
    );
    for (const tx of INITIAL_TRANSACTIONS) {
      db.prepare(
        "INSERT OR IGNORE INTO transactions (id, user_email, merchant, category, amount, date, account, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(tx.id, cleanEmail, tx.merchant, tx.category, tx.amount, tx.date, tx.account, tx.type);
    }
    for (const b of INITIAL_BUDGETS) {
      db.prepare(
        "INSERT OR IGNORE INTO budgets (user_email, category, spent, limit_val, icon, color) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(cleanEmail, b.category, b.spent, b.limit, b.icon, b.color);
    }
    db.prepare(
      "INSERT OR IGNORE INTO savings (user_email, name, target, current) VALUES (?, ?, ?, ?)"
    ).run(cleanEmail, INITIAL_SAVINGS.name, INITIAL_SAVINGS.target, INITIAL_SAVINGS.current);

    for (const chatMsg of INITIAL_CHAT_HISTORY) {
      db.prepare(
        "INSERT OR IGNORE INTO chat_messages (id, user_email, chat_id, sender, timestamp, text, transaction_detail, action_chips, info_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        chatMsg.id,
        cleanEmail,
        "chat-1",
        chatMsg.sender,
        chatMsg.timestamp,
        chatMsg.text,
        chatMsg.transactionDetail ? JSON.stringify(chatMsg.transactionDetail) : null,
        chatMsg.actionChips ? JSON.stringify(chatMsg.actionChips) : null,
        chatMsg.infoText || null
      );
    }
  } else {
    // Seed empty data
    for (const b of INITIAL_BUDGETS) {
      db.prepare(
        "INSERT OR IGNORE INTO budgets (user_email, category, spent, limit_val, icon, color) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(cleanEmail, b.category, 0, 0, b.icon, b.color);
    }
    db.prepare(
      "INSERT OR IGNORE INTO savings (user_email, name, target, current) VALUES (?, ?, ?, ?)"
    ).run(cleanEmail, "Fondo de Emergencia", 5000.0, 0.0);

    db.prepare(
      "INSERT OR IGNORE INTO chat_messages (id, user_email, chat_id, sender, timestamp, text, transaction_detail, action_chips, info_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      "welcome-message",
      cleanEmail,
      "chat-welcome",
      "ai",
      "Ahora",
      "¡Hola! Soy tu asistente financiero FinancIA!. He preparado tu base de datos segura en el servidor. ¿Quieres registrar algún gasto o presupuesto?",
      null,
      null,
      null
    );
  }

  return { email: cleanEmail, name, initialized: true };
}

export function getTransactions(email) {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT id, merchant, category, amount, date, account, type FROM transactions WHERE user_email = ?"
  );
  const rows = stmt.all(email.toLowerCase());
  return rows.map((r) => ({
    id: r.id,
    merchant: r.merchant,
    category: r.category,
    amount: r.amount,
    date: r.date,
    account: r.account,
    type: r.type,
  }));
}

export function addTransaction(email, tx) {
  const db = getDb();
  const cleanEmail = email.toLowerCase();
  const id = tx.id || `tx-${Date.now()}`;
  const date = tx.date || "Hoy";

  db.prepare(
    "INSERT INTO transactions (id, user_email, merchant, category, amount, date, account, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, cleanEmail, tx.merchant, tx.category, tx.amount, date, tx.account || "Tarjeta Personal", tx.type);

  if (tx.type === "expense") {
    db.prepare(
      "UPDATE budgets SET spent = spent + ? WHERE user_email = ? AND category = ?"
    ).run(tx.amount, cleanEmail, tx.category);
  }

  return {
    id,
    merchant: tx.merchant,
    category: tx.category,
    amount: tx.amount,
    date,
    account: tx.account || "Tarjeta Personal",
    type: tx.type,
  };
}

export function deleteTransaction(email, id) {
  const db = getDb();
  const cleanEmail = email.toLowerCase();

  const txStmt = db.prepare("SELECT type, category, amount FROM transactions WHERE id = ? AND user_email = ?");
  const tx = txStmt.get(id, cleanEmail);

  if (tx) {
    db.prepare("DELETE FROM transactions WHERE id = ? AND user_email = ?").run(id, cleanEmail);

    if (tx.type === "expense") {
      db.prepare(
        "UPDATE budgets SET spent = MAX(0, spent - ?) WHERE user_email = ? AND category = ?"
      ).run(tx.amount, cleanEmail, tx.category);
    }
    return tx;
  }
  return null;
}

export function getBudgets(email) {
  const db = getDb();
  const rows = db.prepare(
    "SELECT category, spent, limit_val, icon, color FROM budgets WHERE user_email = ?"
  ).all(email.toLowerCase());

  return rows.map((r) => ({
    category: r.category,
    spent: r.spent,
    limit: r.limit_val,
    icon: r.icon,
    color: r.color,
  }));
}

export function updateBudgetLimit(email, category, limit) {
  const db = getDb();
  db.prepare(
    "UPDATE budgets SET limit_val = ? WHERE user_email = ? AND category = ?"
  ).run(limit, email.toLowerCase(), category);
}

export function updateBudgetSpent(email, category, spent) {
  const db = getDb();
  db.prepare(
    "UPDATE budgets SET spent = ? WHERE user_email = ? AND category = ?"
  ).run(spent, email.toLowerCase(), category);
}

export function getSavings(email) {
  const db = getDb();
  const row = db.prepare(
    "SELECT name, target, current, recommendations FROM savings WHERE user_email = ?"
  ).get(email.toLowerCase());

  if (row) {
    return {
      name: row.name,
      target: row.target,
      current: row.current,
      recommendations: row.recommendations || null,
    };
  }
  return INITIAL_SAVINGS;
}

export function depositSavings(email, amount) {
  const db = getDb();
  db.prepare(
    "UPDATE savings SET current = current + ? WHERE user_email = ?"
  ).run(amount, email.toLowerCase());
}

export function resetSavings(email) {
  const db = getDb();
  db.prepare(
    "UPDATE savings SET current = 0 WHERE user_email = ?"
  ).run(email.toLowerCase());
}

export function getCategories(email) {
  const db = getDb();
  const rows = db.prepare(
    "SELECT name FROM categories WHERE user_email = ? ORDER BY name ASC"
  ).all(email.toLowerCase());

  const categories = rows.map((r) => r.name);
  const filtered = categories.filter((c) => c !== "Otros");
  filtered.push("Otros");
  return filtered;
}

export function addCategory(email, name) {
  const db = getDb();
  db.prepare(
    "INSERT OR IGNORE INTO categories (user_email, name) VALUES (?, ?)"
  ).run(email.toLowerCase(), name);
}

export function updateCategory(email, oldName, newName) {
  if (oldName === "Otros" || newName === "Otros") return;
  const db = getDb();
  const cleanEmail = email.toLowerCase();

  db.prepare(
    "UPDATE categories SET name = ? WHERE name = ? AND user_email = ?"
  ).run(newName, oldName, cleanEmail);

  db.prepare(
    "UPDATE transactions SET category = ? WHERE category = ? AND user_email = ?"
  ).run(newName, oldName, cleanEmail);

  db.prepare(
    "UPDATE budgets SET category = ? WHERE category = ? AND user_email = ?"
  ).run(newName, oldName, cleanEmail);
}

export function deleteCategory(email, name) {
  if (name === "Otros") return;
  const db = getDb();
  const cleanEmail = email.toLowerCase();

  db.prepare(
    "UPDATE transactions SET category = 'Otros' WHERE category = ? AND user_email = ?"
  ).run(name, cleanEmail);

  db.prepare(
    "DELETE FROM budgets WHERE category = ? AND user_email = ?"
  ).run(name, cleanEmail);

  db.prepare(
    "DELETE FROM categories WHERE name = ? AND user_email = ?"
  ).run(name, cleanEmail);
}

export function getChatHistory(email, chatId) {
  const db = getDb();
  const rows = db.prepare(
    "SELECT id, sender, timestamp, text, transaction_detail, action_chips, info_text FROM chat_messages WHERE user_email = ? AND chat_id = ? ORDER BY rowid ASC"
  ).all(email.toLowerCase(), chatId);

  return rows.map((r) => ({
    id: r.id,
    sender: r.sender,
    timestamp: r.timestamp,
    text: r.text,
    transactionDetail: r.transaction_detail ? JSON.parse(r.transaction_detail) : undefined,
    actionChips: r.action_chips ? JSON.parse(r.action_chips) : undefined,
    infoText: r.info_text || undefined,
  }));
}

export function persistChatMessage(email, msg, chatId) {
  const db = getDb();
  db.prepare(
    "INSERT INTO chat_messages (id, user_email, chat_id, sender, timestamp, text, transaction_detail, action_chips, info_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    msg.id,
    email.toLowerCase(),
    chatId,
    msg.sender,
    msg.timestamp,
    msg.text,
    msg.transactionDetail ? JSON.stringify(msg.transactionDetail) : null,
    msg.actionChips ? JSON.stringify(msg.actionChips) : null,
    msg.infoText || null
  );
}

export function clearChatHistory(email, chatId) {
  const db = getDb();
  db.prepare("DELETE FROM chat_messages WHERE user_email = ? AND chat_id = ?").run(
    email.toLowerCase(),
    chatId
  );
}

export function getChatSessions(email) {
  const db = getDb();
  const rows = db.prepare(
    "SELECT DISTINCT chat_id FROM chat_messages WHERE user_email = ? AND chat_id IS NOT NULL"
  ).all(email.toLowerCase());
  return rows.map((r) => r.chat_id);
}

export function getLastActiveChatId(email) {
  const db = getDb();
  const row = db.prepare(
    "SELECT chat_id FROM chat_messages WHERE user_email = ? AND chat_id IS NOT NULL ORDER BY rowid DESC LIMIT 1"
  ).get(email.toLowerCase());
  return row && row.chat_id ? row.chat_id : "chat-welcome";
}

export function removeActionChipsFromMessage(messageId) {
  const db = getDb();
  db.prepare("UPDATE chat_messages SET action_chips = NULL WHERE id = ?").run(messageId);
}

export function deleteChatMessage(messageId) {
  const db = getDb();
  db.prepare("DELETE FROM chat_messages WHERE id = ?").run(messageId);
}

export function getUserState(email) {
  const cleanEmail = email.toLowerCase();
  const activeChatId = getLastActiveChatId(cleanEmail);
  return {
    transactions: getTransactions(cleanEmail),
    budgets: getBudgets(cleanEmail),
    savings: getSavings(cleanEmail),
    categories: getCategories(cleanEmail),
    chatSessions: getChatSessions(cleanEmail),
    activeChatId,
    chatHistory: getChatHistory(cleanEmail, activeChatId),
    budgetTips: getUserBudgetTips(cleanEmail),
  };
}

export function updateSavingsGoal(email, name, target) {
  const db = getDb();
  db.prepare("UPDATE savings SET name = ?, target = ? WHERE user_email = ?").run(
    name,
    target,
    email.toLowerCase()
  );
}

export function saveSavingsRecommendations(email, recommendationsMarkdown) {
  const db = getDb();
  db.prepare("UPDATE savings SET recommendations = ? WHERE user_email = ?").run(
    recommendationsMarkdown,
    email.toLowerCase()
  );
}

export function clearSavingsRecommendations(email) {
  const db = getDb();
  db.prepare("UPDATE savings SET recommendations = NULL WHERE user_email = ?").run(
    email.toLowerCase()
  );
}

export function deleteUserAccount(email) {
  const db = getDb();
  db.prepare("DELETE FROM users WHERE email = ?").run(email.toLowerCase());
}

export function getUserBudgetTips(email) {
  const db = getDb();
  const row = db.prepare("SELECT budget_tips FROM users WHERE email = ?").get(email.toLowerCase());
  return row ? row.budget_tips : null;
}

export function saveUserBudgetTips(email, tips) {
  const db = getDb();
  db.prepare("UPDATE users SET budget_tips = ? WHERE email = ?").run(
    tips,
    email.toLowerCase()
  );
}

export function updatePassword(email, newPassword) {
  const db = getDb();
  db.prepare("UPDATE users SET password = ? WHERE email = ?").run(
    newPassword,
    email.toLowerCase()
  );
}
