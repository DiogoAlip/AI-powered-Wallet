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

class DatabaseManager {
  private SQL: any = null;
  private activeDb: Database | null = null;
  private activeUserEmail: string | null = null;

  async init(email: string): Promise<boolean> {
    if (this.activeUserEmail === email && this.activeDb) {
      return true;
    }

    this.activeUserEmail = email;

    if (!this.SQL) {
      this.SQL = await initSqlJs({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/${file}`,
      });
    }

    const dbData = await indexedDbStorage.get(`sqlite_db_${email}`);
    this.activeDb = dbData ? new this.SQL.Database(dbData) : new this.SQL.Database();

    this.initializeSchema();

    const userStmt = this.activeDb!.prepare("SELECT initialized FROM users WHERE email = ?");
    userStmt.bind([email]);
    let initialized = false;
    if (userStmt.step()) {
      const row = userStmt.getAsObject();
      initialized = row.initialized === 1;
    }
    userStmt.free();

    if (!initialized) {
      this.activeDb!.run("INSERT OR REPLACE INTO users (email, name, initialized) VALUES (?, ?, ?)", [
        email,
        "Socio FinancIA!",
        1,
      ]);
      
      const demoEmails = ["demo@financia.com", "ejemplo@financia.com"];
      if (demoEmails.includes(email.toLowerCase())) {
        this.seedDefaultData(email);
      } else {
        this.seedEmptyData(email);
      }
      await this.save();
    }

    return true;
  }

  close() {
    if (this.activeDb) {
      this.activeDb.close();
      this.activeDb = null;
    }
    this.activeUserEmail = null;
  }

  async save(): Promise<void> {
    if (!this.activeDb || !this.activeUserEmail) return;
    const binaryArray = this.activeDb.export();
    await indexedDbStorage.set(`sqlite_db_${this.activeUserEmail}`, binaryArray);
  }

  private initializeSchema() {
    const db = this.activeDb!;
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        name TEXT,
        initialized INTEGER DEFAULT 0
      );
    `);
    db.run(`
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
    db.run(`
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
    db.run(`
      CREATE TABLE IF NOT EXISTS savings (
        user_email TEXT PRIMARY KEY,
        name TEXT,
        target REAL,
        current REAL,
        FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
      );
    `);
    db.run(`
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
    try {
      db.run("ALTER TABLE chat_messages ADD COLUMN chat_id TEXT");
    } catch {
      // column already exists
    }
  }

  private seedDefaultData(email: string) {
    const db = this.activeDb!;
    for (const tx of INITIAL_TRANSACTIONS) {
      db.run(
        "INSERT INTO transactions (id, user_email, merchant, category, amount, date, account, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [tx.id, email, tx.merchant, tx.category, tx.amount, tx.date, tx.account, tx.type]
      );
    }
    for (const b of INITIAL_BUDGETS) {
      db.run(
        "INSERT INTO budgets (user_email, category, spent, limit_val, icon, color) VALUES (?, ?, ?, ?, ?, ?)",
        [email, b.category, b.spent, b.limit, b.icon, b.color]
      );
    }
    db.run(
      "INSERT INTO savings (user_email, name, target, current) VALUES (?, ?, ?, ?)",
      [email, INITIAL_SAVINGS.name, INITIAL_SAVINGS.target, INITIAL_SAVINGS.current]
    );
    for (const chat of INITIAL_CHAT_HISTORY) {
      db.run(
        "INSERT INTO chat_messages (id, user_email, chat_id, sender, timestamp, text, transaction_detail, action_chips, info_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          chat.id,
          email,
          "chat-1",
          chat.sender,
          chat.timestamp,
          chat.text,
          chat.transactionDetail ? JSON.stringify(chat.transactionDetail) : null,
          chat.actionChips ? JSON.stringify(chat.actionChips) : null,
          chat.infoText || null,
        ]
      );
    }
  }

  private seedEmptyData(email: string) {
    const db = this.activeDb!;
    for (const b of INITIAL_BUDGETS) {
      db.run(
        "INSERT INTO budgets (user_email, category, spent, limit_val, icon, color) VALUES (?, ?, ?, ?, ?, ?)",
        [email, b.category, 0, 0, b.icon, b.color]
      );
    }
    db.run(
      "INSERT INTO savings (user_email, name, target, current) VALUES (?, ?, ?, ?)",
      [email, "Fondo de Emergencia", 5000.0, 0.0]
    );
    db.run(
      "INSERT INTO chat_messages (id, user_email, chat_id, sender, timestamp, text, transaction_detail, action_chips, info_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "welcome-message",
        email,
        "chat-welcome",
        "ai",
        "Ahora",
        "¡Hola! Soy tu asistente financiero FinancIA!. He preparado tu base de datos segura y local en tu navegador. ¿Quieres registrar algún gasto o presupuesto?",
        null,
        null,
        null,
      ]
    );
  }

  getTransactions(): Transaction[] {
    if (!this.activeDb || !this.activeUserEmail) return [];
    const stmt = this.activeDb.prepare(
      "SELECT id, merchant, category, amount, date, account, type FROM transactions WHERE user_email = ?"
    );
    stmt.bind([this.activeUserEmail]);
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
  }

  getBudgets(): Budget[] {
    if (!this.activeDb || !this.activeUserEmail) return [];
    const stmt = this.activeDb.prepare(
      "SELECT category, spent, limit_val, icon, color FROM budgets WHERE user_email = ?"
    );
    stmt.bind([this.activeUserEmail]);
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
  }

  getSavings(): SavingsGoal {
    if (!this.activeDb || !this.activeUserEmail) return INITIAL_SAVINGS;
    const stmt = this.activeDb.prepare(
      "SELECT name, target, current FROM savings WHERE user_email = ?"
    );
    stmt.bind([this.activeUserEmail]);
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
  }

  getChatHistory(chatId: string): ChatMessage[] {
    if (!this.activeDb || !this.activeUserEmail) return [];
    const stmt = this.activeDb.prepare(
      "SELECT id, sender, timestamp, text, transaction_detail, action_chips, info_text FROM chat_messages WHERE user_email = ? AND chat_id = ? ORDER BY rowid ASC"
    );
    stmt.bind([this.activeUserEmail, chatId]);
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
  }

  addTransaction(newTx: Transaction) {
    if (!this.activeDb || !this.activeUserEmail) return;
    this.activeDb.run(
      "INSERT INTO transactions (id, user_email, merchant, category, amount, date, account, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        newTx.id,
        this.activeUserEmail,
        newTx.merchant,
        newTx.category,
        newTx.amount,
        newTx.date,
        newTx.account,
        newTx.type,
      ]
    );

    if (newTx.type === "expense") {
      this.activeDb.run(
        "UPDATE budgets SET spent = spent + ? WHERE user_email = ? AND category = ?",
        [newTx.amount, this.activeUserEmail, newTx.category]
      );
    }
  }

  deleteTransaction(id: string): { type: string; category: string; amount: number } | null {
    if (!this.activeDb || !this.activeUserEmail) return null;
    const stmt = this.activeDb.prepare("SELECT type, category, amount FROM transactions WHERE id = ?");
    stmt.bind([id]);
    let txToDelete: any = null;
    if (stmt.step()) {
      txToDelete = stmt.getAsObject();
    }
    stmt.free();

    if (txToDelete) {
      this.activeDb.run("DELETE FROM transactions WHERE id = ?", [id]);

      if (txToDelete.type === "expense") {
        this.activeDb.run(
          "UPDATE budgets SET spent = MAX(0, spent - ?) WHERE user_email = ? AND category = ?",
          [txToDelete.amount, this.activeUserEmail, txToDelete.category]
        );
      }
      return txToDelete;
    }
    return null;
  }

  updateBudgetLimit(category: string, limit: number) {
    if (!this.activeDb || !this.activeUserEmail) return;
    this.activeDb.run(
      "UPDATE budgets SET limit_val = ? WHERE user_email = ? AND category = ?",
      [limit, this.activeUserEmail, category]
    );
  }

  updateBudgetSpent(category: string, spent: number) {
    if (!this.activeDb || !this.activeUserEmail) return;
    this.activeDb.run(
      "UPDATE budgets SET spent = ? WHERE user_email = ? AND category = ?",
      [spent, this.activeUserEmail, category]
    );
  }

  depositSavings(amount: number) {
    if (!this.activeDb || !this.activeUserEmail) return;
    this.activeDb.run(
      "UPDATE savings SET current = current + ? WHERE user_email = ?",
      [amount, this.activeUserEmail]
    );
  }

  resetSavings() {
    if (!this.activeDb || !this.activeUserEmail) return;
    this.activeDb.run(
      "UPDATE savings SET current = 0 WHERE user_email = ?",
      [this.activeUserEmail]
    );
  }

  persistChatMessage(msg: ChatMessage, chatId: string) {
    if (!this.activeDb || !this.activeUserEmail) return;
    this.activeDb.run(
      "INSERT INTO chat_messages (id, user_email, chat_id, sender, timestamp, text, transaction_detail, action_chips, info_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        msg.id,
        this.activeUserEmail,
        chatId,
        msg.sender,
        msg.timestamp,
        msg.text,
        msg.transactionDetail ? JSON.stringify(msg.transactionDetail) : null,
        msg.actionChips ? JSON.stringify(msg.actionChips) : null,
        msg.infoText || null,
      ]
    );
  }

  clearChatHistory(chatId: string) {
    if (!this.activeDb || !this.activeUserEmail) return;
    this.activeDb.run("DELETE FROM chat_messages WHERE user_email = ? AND chat_id = ?", [
      this.activeUserEmail,
      chatId,
    ]);
  }

  getChatSessions(): string[] {
    if (!this.activeDb || !this.activeUserEmail) return [];
    const stmt = this.activeDb.prepare(
      "SELECT DISTINCT chat_id FROM chat_messages WHERE user_email = ? AND chat_id IS NOT NULL"
    );
    const sessions: string[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.chat_id) {
        sessions.push(row.chat_id as string);
      }
    }
    stmt.free();
    return sessions;
  }

  getLastActiveChatId(): string {
    if (!this.activeDb || !this.activeUserEmail) return "chat-welcome";
    const stmt = this.activeDb.prepare(
      "SELECT chat_id FROM chat_messages WHERE user_email = ? AND chat_id IS NOT NULL ORDER BY rowid DESC LIMIT 1"
    );
    let chatId = "chat-welcome";
    if (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.chat_id) {
        chatId = row.chat_id as string;
      }
    }
    stmt.free();
    return chatId;
  }

  removeActionChipsFromMessage(messageId: string) {
    if (!this.activeDb) return;
    this.activeDb.run("UPDATE chat_messages SET action_chips = NULL WHERE id = ?", [messageId]);
  }

  isActive(): boolean {
    return !!this.activeDb && !!this.activeUserEmail;
  }
}

export const databaseManager = new DatabaseManager();
