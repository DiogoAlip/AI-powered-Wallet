import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  initDb,
  initializeUser,
  getUserState,
  getChatHistory,
  addTransaction,
  deleteTransaction,
  getTransaction,
  updateTransaction,
  getTransactions,
  updateBudgetLimit,
  updateBudgetSpent,
  addCategory,
  updateCategory,
  deleteCategory,
  persistChatMessage,
  clearChatHistory,
  deleteChatMessage,
  removeActionChipsFromMessage,
  updateSavingsGoal,
  deleteSavingsGoal,
  getWeeklySavingsHistory,
  deleteUserAccount,
  saveUserBudgetTips,
  getUser,
  updatePassword,
  getBudgets,
  getSavings,
} from "./src/db.js";
import { chat, generateBudgetTips, formatCurrencyBackend } from "./src/gemini.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const dbPath = process.env.DATABASE_PATH || "./data/finances.db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, process.env.DIST_PATH || "../frontend/dist");

// Initialize SQLite database
initDb(dbPath);

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static(frontendDistPath));

// Auth Header Middleware
function authMiddleware(req, res, next) {
  const email = req.headers["x-user-email"];
  if (!email || typeof email !== "string") {
    return res.status(401).json({ error: "Missing x-user-email header" });
  }
  req.userEmail = email.toLowerCase();
  next();
}

// REST Endpoints

// 1. Auth Endpoints
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const user = getUser(email);
    if (user && user.password && user.password !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    const initializedUserObj = initializeUser(email);
    res.json({ success: true, user: initializedUserObj });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  try {
    const user = initializeUser(email, name, password);
    res.json({ success: true, user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/auth/change-password", authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: "La nueva contraseña es requerida" });
  }

  const cleanEmail = req.userEmail;
  if (cleanEmail === "demo@financia.com") {
    return res.status(400).json({ error: "No está permitido cambiar la contraseña de la cuenta de demostración." });
  }

  try {
    const user = getUser(cleanEmail);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.password && user.password !== currentPassword) {
      return res.status(400).json({ error: "La contraseña actual es incorrecta" });
    }

    updatePassword(cleanEmail, newPassword);
    res.json({ success: true, message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Error interno del servidor al cambiar la contraseña" });
  }
});

// 2. State & Data retrieval
app.get("/api/finances", authMiddleware, (req, res) => {
  try {
    const state = getUserState(req.userEmail);
    res.json({ success: true, state });
  } catch (error) {
    console.error("Error loading finances state:", error);
    res.status(500).json({ error: "Failed to load state" });
  }
});

app.get("/api/finances/chat-history", authMiddleware, (req, res) => {
  const { chatId } = req.query;
  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({ error: "chatId query parameter is required" });
  }
  try {
    const history = getChatHistory(req.userEmail, chatId);
    res.json({ success: true, chatHistory: history });
  } catch (error) {
    console.error("Error loading chat history:", error);
    res.status(500).json({ error: "Failed to load chat history" });
  }
});

// 3. Transactions CRUD
app.get("/api/finances/transactions", authMiddleware, (req, res) => {
  try {
    const txs = getTransactions(req.userEmail);
    res.json({ success: true, transactions: txs });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.get("/api/finances/transactions/:id", authMiddleware, (req, res) => {
  try {
    const tx = getTransaction(req.userEmail, req.params.id);
    if (tx) {
      res.json({ success: true, transaction: tx });
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

app.post("/api/finances/transactions", authMiddleware, (req, res) => {
  try {
    const tx = addTransaction(req.userEmail, req.body);
    res.json({ success: true, transaction: tx, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Failed to add transaction" });
  }
});

app.put("/api/finances/transactions/:id", authMiddleware, (req, res) => {
  try {
    const updated = updateTransaction(req.userEmail, req.params.id, req.body);
    if (updated) {
      res.json({ success: true, transaction: updated, state: getUserState(req.userEmail) });
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

app.delete("/api/finances/transactions/:id", authMiddleware, (req, res) => {
  try {
    const deleted = deleteTransaction(req.userEmail, req.params.id);
    if (deleted) {
      res.json({ success: true, state: getUserState(req.userEmail) });
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

// 4. Budgets
app.put("/api/finances/budgets", authMiddleware, (req, res) => {
  const { category, limit, spent } = req.body;
  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }
  try {
    if (limit !== undefined) {
      updateBudgetLimit(req.userEmail, category, parseFloat(limit));
    }
    if (spent !== undefined) {
      updateBudgetSpent(req.userEmail, category, parseFloat(spent));
    }
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ error: "Failed to update budget" });
  }
});

app.post("/api/finances/chat/new-with-prompt", authMiddleware, async (req, res) => {
  const { type, customPrompt } = req.body;
  const email = req.userEmail;
  const chatId = `chat-${Date.now()}`;

  let prompt = "";
  if (type === "budget_tips") {
    const budgets = getBudgets(email);
    const savings = getSavings(email);
    const transactions = getTransactions(email);

    const budgetsContext = budgets
      .map((b) => `- **${b.category}**: Gastado ${formatCurrencyBackend(b.spent)} de un límite de ${formatCurrencyBackend(b.limit)}`)
      .join("\n");

    const savingsContext = savings.name
      ? `Meta de ahorro activa: "${savings.name}", acumulado ${formatCurrencyBackend(savings.current)} de un objetivo de ${formatCurrencyBackend(savings.target)}.`
      : "No tengo una meta de ahorro activa configurada actualmente.";

    const recentTxContext = transactions.length > 0
      ? transactions.slice(0, 10).map(t => `- [${t.type === "expense" ? "Gasto" : "Ingreso"}] ${formatCurrencyBackend(t.amount)} en **${t.merchant}** (${t.category}, Fecha: ${t.date})`).join("\n")
      : "No tengo transacciones recientes.";

    prompt = `Hola FinancIA!, analicemos mi situación de presupuestos.
Mis presupuestos semanales actuales son:
${budgetsContext}

Mi estado de ahorro actual:
${savingsContext}

Mis últimos movimientos son:
${recentTxContext}

Por favor, dame 3 consejos clave o recomendaciones específicas en base a estos datos para optimizar mis gastos y ahorrar más eficientemente.`;
  } else {
    prompt = customPrompt || "Hola FinancIA!";
  }

  try {
    // 1. Create and persist user chat message
    const userMsg = {
      id: `chat-${Date.now()}-user`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: prompt,
    };
    persistChatMessage(email, userMsg, chatId);

    // 2. Invoke Gemini reasoning
    const reply = await chat(prompt, [], email);

    // 3. Create and persist AI assistant reply
    const aiMsg = {
      id: `chat-${Date.now()}-ai`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: reply.text,
      transactionDetail: reply.transactionDetail ? {
        id: reply.transactionDetail.id || `tx-${Date.now()}`,
        merchant: reply.transactionDetail.merchant,
        category: reply.transactionDetail.category,
        amount: reply.transactionDetail.amount,
        date: reply.transactionDetail.date || "Hoy",
        account: reply.transactionDetail.account || "Tarjeta Personal",
        type: reply.transactionDetail.type,
      } : undefined,
      infoText: reply.infoText,
    };
    persistChatMessage(email, aiMsg, chatId);

    res.json({
      success: true,
      chatId,
      state: getUserState(email),
    });
  } catch (error) {
    console.error("Error generating new chat with prompt:", error);
    res.status(500).json({ error: "Failed to generate new chat with prompt" });
  }
});

// 5. Savings Goal CRUD
app.put("/api/finances/savings", authMiddleware, (req, res) => {
  const { name, target, start_date, deadline } = req.body;
  if (!name || target === undefined || !start_date) {
    return res.status(400).json({ error: "Name, target, and start_date are required" });
  }
  try {
    updateSavingsGoal(req.userEmail, name, parseFloat(target), start_date, deadline || null);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error updating savings goal:", error);
    res.status(500).json({ error: "Failed to update savings goal" });
  }
});

app.delete("/api/finances/savings", authMiddleware, (req, res) => {
  try {
    deleteSavingsGoal(req.userEmail);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    res.status(500).json({ error: "Failed to delete savings goal" });
  }
});

app.get("/api/finances/savings/history", authMiddleware, (req, res) => {
  try {
    const history = getWeeklySavingsHistory(req.userEmail);
    res.json({ success: true, history });
  } catch (error) {
    console.error("Error loading savings history:", error);
    res.status(500).json({ error: "Failed to load savings history" });
  }
});

app.delete("/api/finances/account", authMiddleware, (req, res) => {
  try {
    deleteUserAccount(req.userEmail);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// 6. Categories
app.post("/api/finances/categories", authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }
  try {
    addCategory(req.userEmail, name);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Failed to add category" });
  }
});

app.put("/api/finances/categories", authMiddleware, (req, res) => {
  const { oldName, newName } = req.body;
  if (!oldName || !newName) {
    return res.status(400).json({ error: "oldName and newName are required" });
  }
  try {
    updateCategory(req.userEmail, oldName, newName);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

app.delete("/api/finances/categories", authMiddleware, (req, res) => {
  const { name } = req.query;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Category name query param is required" });
  }
  try {
    deleteCategory(req.userEmail, name);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// 7. Chat messages operations
app.post("/api/finances/chat-messages", authMiddleware, (req, res) => {
  const { message, chatId } = req.body;
  if (!message || !chatId) {
    return res.status(400).json({ error: "message and chatId are required" });
  }
  try {
    persistChatMessage(req.userEmail, message, chatId);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error persisting chat message:", error);
    res.status(500).json({ error: "Failed to persist chat message" });
  }
});

app.delete("/api/finances/chat-messages", authMiddleware, (req, res) => {
  const { chatId } = req.query;
  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({ error: "chatId query parameter is required" });
  }
  try {
    clearChatHistory(req.userEmail, chatId);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

app.delete("/api/finances/chat-messages/:id", authMiddleware, (req, res) => {
  try {
    deleteChatMessage(req.params.id);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error deleting chat message:", error);
    res.status(500).json({ error: "Failed to delete chat message" });
  }
});

app.put("/api/finances/chat-messages/:id/remove-action-chips", authMiddleware, (req, res) => {
  try {
    removeActionChipsFromMessage(req.params.id);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error removing action chips:", error);
    res.status(500).json({ error: "Failed to remove action chips" });
  }
});

// 8. Gemini Intelligent Chat Integration
app.post("/api/finances/chat", authMiddleware, async (req, res) => {
  const { text, chatId } = req.body;
  if (!text || !chatId) {
    return res.status(400).json({ error: "text and chatId are required" });
  }

  try {
    // 1. Create and persist user chat message
    const userMsg = {
      id: `chat-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text,
    };
    persistChatMessage(req.userEmail, userMsg, chatId);

    // 2. Fetch compile-ready chat history from DB
    const chatHistory = getChatHistory(req.userEmail, chatId);

    // 3. Invoke multi-turn Gemini reasoning (executes tool actions automatically on the SQLite DB)
    const reply = await chat(text, chatHistory, req.userEmail);

    // 4. Create and persist AI assistant reply in SQLite
    const aiMsg = {
      id: `chat-${Date.now()}`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: reply.text,
      transactionDetail: reply.transactionDetail ? {
        id: reply.transactionDetail.id || `tx-${Date.now()}`,
        merchant: reply.transactionDetail.merchant,
        category: reply.transactionDetail.category,
        amount: reply.transactionDetail.amount,
        date: reply.transactionDetail.date || "Hoy",
        account: reply.transactionDetail.account || "Tarjeta Personal",
        type: reply.transactionDetail.type,
      } : undefined,
      infoText: reply.infoText,
    };
    persistChatMessage(req.userEmail, aiMsg, chatId);

    // 5. Send updated state back to client for instant UI alignment
    res.json({
      success: true,
      response: reply,
      state: getUserState(req.userEmail),
    });
  } catch (error) {
    console.error("Chat orchestration error:", error);

    // Persist error message in DB to show user
    const errorMsg = {
      id: `chat-${Date.now()}`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: `⚠️ Error de configuración: ${error.message || error}`,
    };

    try {
      persistChatMessage(req.userEmail, errorMsg, chatId);
    } catch (persistErr) {
      console.error("Failed to persist error message:", persistErr);
    }

    res.status(500).json({
      error: "Failed to process chat conversation",
      state: getUserState(req.userEmail),
    });
  }
});

// Ruta comodín para soportar React Router (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// Start Express Server
app.listen(port, () => {
  console.log(`FinancIA! REST API backend listening at http://localhost:${port}`);
  console.log(`Database is initialized at: ${dbPath}`);
});
