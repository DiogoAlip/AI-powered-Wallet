import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS,
  INITIAL_CHAT_HISTORY,
} from "./mockData.js";

// ── Date helpers for dynamic savings calculation ──

/**
 * Parses relative date strings ("Hoy", "Ayer", "Hace N días", "09:45 AM", etc.)
 * and ISO dates into a Date object anchored to the user's registration moment.
 */
export function parseDateString(dateStr) {
  if (!dateStr) return null;

  // ISO format (e.g. "2026-07-15" or "2026-07-15T...")
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr);
  }

  // DD/MM/YYYY format (from savings_logs or locale dates)
  const dmyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmyMatch) {
    return new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
  }

  const now = new Date();
  const lower = dateStr.toLowerCase().trim();

  if (lower === "hoy" || /^\d{1,2}:\d{2}/.test(lower)) {
    return now;
  }
  if (lower === "ayer") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  }

  // "Hace N días"
  const daysMatch = lower.match(/hace\s+(\d+)\s*d[ií]as?/);
  if (daysMatch) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - parseInt(daysMatch[1]));
  }

  // Fallback: treat as today
  return now;
}

/** Returns the Monday (start of ISO week) as a YYYY-MM-DD string. */
export function getMondayStr(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun .. 6=Sat
  const diff = day === 0 ? 6 : day - 1; // distance to Monday
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

/** Returns a YYYY-MM-DD string for a Date. */
function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Dynamically calculates weekly savings between startDate and deadline
 * by grouping expense transactions into ISO weeks and computing
 * (budgetLimit - weeklySpent) per category per week.
 *
 * Returns { totalSaved, weeks: [{ weekStart, weekEnd, total, categories: [{category, limit, spent, surplus}] }] }
 */
export function calculateDynamicSavings(email, startDate, deadline) {
  const db = getDb();
  const cleanEmail = email.toLowerCase();

  if (!startDate) return { totalSaved: 0, weeks: [] };

  // Determine the range of completed weeks
  const start = new Date(startDate);
  const now = new Date();
  const currentMonday = getMondayStr(now);

  // Get budgets for the user (we use current limits for all weeks)
  const budgets = getBudgets(cleanEmail);
  const limitMap = {};
  for (const b of budgets) {
    limitMap[b.category] = b.limit;
  }

  // Get all expense transactions
  const allTx = db.prepare(
    "SELECT category, amount, date FROM transactions WHERE user_email = ? AND type = 'expense'"
  ).all(cleanEmail);

  // Parse dates and group expenses by week (Monday string)
  const weekExpenses = {}; // { weekMonday: { category: totalSpent } }
  for (const tx of allTx) {
    const txDate = parseDateString(tx.date);
    if (!txDate) continue;
    const monday = getMondayStr(txDate);
    if (!weekExpenses[monday]) weekExpenses[monday] = {};
    if (!weekExpenses[monday][tx.category]) weekExpenses[monday][tx.category] = 0;
    weekExpenses[monday][tx.category] += tx.amount;
  }

  // Enumerate completed weeks from startDate to before current week
  const startMonday = getMondayStr(start);
  const deadlineStr = deadline || null;

  const weeks = [];
  let totalSaved = 0;

  // Iterate week by week from startMonday
  let weekDate = new Date(startMonday);
  while (true) {
    const wMonday = toDateStr(weekDate);
    // Stop if we've reached the current (incomplete) week
    if (wMonday >= currentMonday) break;
    // Stop if past the deadline
    if (deadlineStr && wMonday > deadlineStr) break;

    const wSunday = new Date(weekDate);
    wSunday.setDate(wSunday.getDate() + 6);
    const wSundayStr = toDateStr(wSunday);

    const expenses = weekExpenses[wMonday] || {};
    const categories = [];
    let weekTotal = 0;

    for (const [cat, limit] of Object.entries(limitMap)) {
      if (limit <= 0) continue;
      const spent = expenses[cat] || 0;
      const surplus = Math.max(0, limit - spent);
      if (surplus > 0) {
        categories.push({ category: cat, limit, spent: Math.round(spent * 100) / 100, surplus: Math.round(surplus * 100) / 100 });
        weekTotal += surplus;
      }
    }

    weekTotal = Math.round(weekTotal * 100) / 100;

    weeks.push({
      weekStart: wMonday,
      weekEnd: wSundayStr,
      total: weekTotal,
      categories,
    });
    totalSaved += weekTotal;

    // Move to next week
    weekDate.setDate(weekDate.getDate() + 7);
  }

  totalSaved = Math.round(totalSaved * 100) / 100;
  return { totalSaved, weeks };
}

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

  db.exec(`
    CREATE TABLE IF NOT EXISTS savings_logs (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      amount REAL,
      date TEXT,
      note TEXT,
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  try {
    db.exec("ALTER TABLE savings ADD COLUMN recommendations TEXT;");
  } catch (e) {
    // Already exists
  }

  try {
    db.exec("ALTER TABLE savings ADD COLUMN start_date TEXT;");
  } catch (e) {
    // Already exists
  }

  try {
    db.exec("ALTER TABLE savings ADD COLUMN deadline TEXT;");
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

  // Initialize/reset demo account on startup
  try {
    initializeUser("demo@financia.com");
  } catch (err) {
    console.error("Failed to auto-initialize demo user:", err);
  }

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
  const isDemo = cleanEmail === "demo@financia.com";

  if (existing && existing.initialized && !isDemo) {
    return existing;
  }

  if (isDemo) {
    db.prepare("DELETE FROM transactions WHERE user_email = ?").run(cleanEmail);
    db.prepare("DELETE FROM budgets WHERE user_email = ?").run(cleanEmail);
    db.prepare("DELETE FROM savings WHERE user_email = ?").run(cleanEmail);
    db.prepare("DELETE FROM savings_logs WHERE user_email = ?").run(cleanEmail);
    db.prepare("DELETE FROM chat_messages WHERE user_email = ?").run(cleanEmail);
    db.prepare("DELETE FROM categories WHERE user_email = ?").run(cleanEmail);
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

    const demoStartDate = new Date();
    demoStartDate.setDate(demoStartDate.getDate() - 30);
    const demoStartDateStr = demoStartDate.toISOString().slice(0, 10);

    const demoDeadline = new Date();
    demoDeadline.setDate(demoDeadline.getDate() + 60);
    const demoDeadlineStr = demoDeadline.toISOString().slice(0, 10);

    db.prepare(
      "INSERT OR IGNORE INTO savings (user_email, name, target, current, start_date, deadline) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      cleanEmail,
      INITIAL_SAVINGS.name,
      INITIAL_SAVINGS.target,
      INITIAL_SAVINGS.current,
      demoStartDateStr,
      demoDeadlineStr
    );

    const mockLogs = [
      { id: "sl-1", amount: 150.0, date: "Hace 15 días", note: "Aporte inicial" },
      { id: "sl-2", amount: 200.0, date: "Hace 10 días", note: "Ahorro mensual" },
      { id: "sl-3", amount: 100.0, date: "Hace 5 días", note: "Excedente de Comida" },
    ];
    for (const log of mockLogs) {
      db.prepare(
        "INSERT OR IGNORE INTO savings_logs (id, user_email, amount, date, note) VALUES (?, ?, ?, ?, ?)"
      ).run(log.id, cleanEmail, log.amount, log.date, log.note);
    }

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
      ).run(cleanEmail, b.category, 0, 100, b.icon, b.color);
    }
    db.prepare(
      "INSERT OR IGNORE INTO savings (user_email, name, target, current) VALUES (?, ?, ?, ?)"
    ).run(cleanEmail, null, 0.0, 0.0);

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
    "SELECT name, target, current, start_date, deadline FROM savings WHERE user_email = ?"
  ).get(email.toLowerCase());

  if (row && row.name && row.target > 0) {
    // Dynamically calculate current savings from weekly surpluses
    const { totalSaved } = calculateDynamicSavings(email, row.start_date, row.deadline);
    return {
      name: row.name,
      target: row.target,
      current: totalSaved,
      start_date: row.start_date || null,
      deadline: row.deadline || null,
    };
  }
  // No active goal
  return { name: null, target: 0, current: 0, start_date: null, deadline: null };
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

export function updateSavingsGoal(email, name, target, startDate, deadline) {
  const db = getDb();
  db.prepare("UPDATE savings SET name = ?, target = ?, start_date = ?, deadline = ? WHERE user_email = ?").run(
    name,
    target,
    startDate || null,
    deadline || null,
    email.toLowerCase()
  );
}

export function deleteSavingsGoal(email) {
  const db = getDb();
  db.prepare("UPDATE savings SET name = NULL, target = 0, current = 0, start_date = NULL, deadline = NULL, recommendations = NULL WHERE user_email = ?").run(
    email.toLowerCase()
  );
}

export function getWeeklySavingsHistory(email) {
  const savings = getSavings(email);
  if (!savings || !savings.start_date) return [];
  const { weeks } = calculateDynamicSavings(email, savings.start_date, savings.deadline);
  return weeks;
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

export function getTransaction(email, id) {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT id, merchant, category, amount, date, account, type FROM transactions WHERE id = ? AND user_email = ?"
  );
  const row = stmt.get(id, email.toLowerCase());
  return row ? {
    id: row.id,
    merchant: row.merchant,
    category: row.category,
    amount: row.amount,
    date: row.date,
    account: row.account,
    type: row.type,
  } : null;
}

export function updateTransaction(email, id, updatedFields) {
  const db = getDb();
  const cleanEmail = email.toLowerCase();

  const oldTx = db.prepare("SELECT type, category, amount, merchant, date, account FROM transactions WHERE id = ? AND user_email = ?").get(id, cleanEmail);
  if (!oldTx) return null;

  // 1. Revert budget impact of the old transaction if it was an expense
  if (oldTx.type === "expense") {
    db.prepare(
      "UPDATE budgets SET spent = MAX(0, spent - ?) WHERE user_email = ? AND category = ?"
    ).run(oldTx.amount, cleanEmail, oldTx.category);
  }

  // 2. Perform update
  const merchant = updatedFields.merchant !== undefined ? updatedFields.merchant : oldTx.merchant;
  const category = updatedFields.category !== undefined ? updatedFields.category : oldTx.category;
  const amount = updatedFields.amount !== undefined ? parseFloat(updatedFields.amount) : oldTx.amount;
  const date = updatedFields.date !== undefined ? updatedFields.date : oldTx.date;
  const account = updatedFields.account !== undefined ? updatedFields.account : oldTx.account;
  const type = updatedFields.type !== undefined ? updatedFields.type : oldTx.type;

  db.prepare(`
    UPDATE transactions
    SET merchant = ?, category = ?, amount = ?, date = ?, account = ?, type = ?
    WHERE id = ? AND user_email = ?
  `).run(merchant, category, amount, date, account, type, id, cleanEmail);

  // 3. Apply budget impact of the updated transaction if it is an expense
  if (type === "expense") {
    db.prepare(
      "UPDATE budgets SET spent = spent + ? WHERE user_email = ? AND category = ?"
    ).run(amount, cleanEmail, category);
  }

  return {
    id,
    merchant,
    category,
    amount,
    date,
    account,
    type
  };
}

export function getTransactionsInDateRange(email, startDateStr, endDateStr) {
  const cleanEmail = email.toLowerCase();
  
  // Parse input range boundaries
  const rangeStart = startDateStr ? parseDateString(startDateStr) : null;
  const rangeEnd = endDateStr ? parseDateString(endDateStr) : null;

  // Get all transactions for the user
  const allTx = getTransactions(cleanEmail);

  // Filter them based on parsed dates
  return allTx.filter((tx) => {
    const txDate = parseDateString(tx.date);
    if (!txDate) return false;

    if (rangeStart) {
      const d1 = new Date(txDate);
      d1.setHours(0, 0, 0, 0);
      const dStart = new Date(rangeStart);
      dStart.setHours(0, 0, 0, 0);
      if (d1 < dStart) return false;
    }
    if (rangeEnd) {
      const d1 = new Date(txDate);
      d1.setHours(0, 0, 0, 0);
      const dEnd = new Date(rangeEnd);
      dEnd.setHours(23, 59, 59, 999);
      if (d1 > dEnd) return false;
    }
    return true;
  });
}

