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
  updateBudgetLimit,
  updateBudgetSpent,
  depositSavings,
  resetSavings,
  addCategory,
  updateCategory,
  deleteCategory,
  persistChatMessage,
  clearChatHistory,
  deleteChatMessage,
  removeActionChipsFromMessage,
  updateSavingsGoal,
  saveSavingsRecommendations,
  clearSavingsRecommendations,
  deleteUserAccount,
  getBudgets,
  getSavings,
  saveUserBudgetTips,
} from "./src/db.js";
import { chat, generateBudgetTips } from "./src/gemini.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const dbPath = process.env.DATABASE_PATH || "./data/finances.db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, "../frontend/dist");

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
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const user = initializeUser(email);
    res.json({ success: true, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  try {
    const user = initializeUser(email, name);
    res.json({ success: true, user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
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
app.post("/api/finances/transactions", authMiddleware, (req, res) => {
  try {
    const tx = addTransaction(req.userEmail, req.body);
    res.json({ success: true, transaction: tx, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Failed to add transaction" });
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

app.post("/api/finances/budgets/tips/refresh", authMiddleware, async (req, res) => {
  try {
    const tips = await generateBudgetTips(req.userEmail);
    saveUserBudgetTips(req.userEmail, tips);
    res.json({ success: true, budgetTips: tips, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error generating budget tips:", error);
    res.status(500).json({ error: "Failed to generate budget tips" });
  }
});

// 5. Savings
app.post("/api/finances/savings/deposit", authMiddleware, (req, res) => {
  const { amount } = req.body;
  if (amount === undefined) {
    return res.status(400).json({ error: "Amount is required" });
  }
  try {
    depositSavings(req.userEmail, parseFloat(amount));
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error depositing savings:", error);
    res.status(500).json({ error: "Failed to deposit savings" });
  }
});

app.post("/api/finances/savings/reset", authMiddleware, (req, res) => {
  try {
    resetSavings(req.userEmail);
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error resetting savings:", error);
    res.status(500).json({ error: "Failed to reset savings" });
  }
});

// 5b. Savings configuration, recommendations, and account deletion
app.put("/api/finances/savings", authMiddleware, (req, res) => {
  const { name, target } = req.body;
  if (!name || target === undefined) {
    return res.status(400).json({ error: "Name and target are required" });
  }
  try {
    updateSavingsGoal(req.userEmail, name, parseFloat(target));
    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error updating savings goal:", error);
    res.status(500).json({ error: "Failed to update savings goal" });
  }
});

app.get("/api/finances/savings/recommendations", authMiddleware, (req, res) => {
  try {
    const budgets = getBudgets(req.userEmail);
    const savings = getSavings(req.userEmail);
    const surpluses = budgets.filter((b) => b.limit > 0 && b.limit - b.spent > 0);

    let md = "";
    if (surpluses.length === 0) {
      md = "¡Excelente trabajo! Has optimizado al máximo tus presupuestos y no se han encontrado excedentes disponibles para ahorro.";
    } else {
      md = `### 💡 Sugerencias de Ahorro Inteligente\n\nHe analizado tus presupuestos semanales activos y he detectado excedentes disponibles. Te sugiero transferir el 50% de estos excedentes a tu **${savings.name}**:\n\n`;
      let totalSuggested = 0;
      for (const b of surpluses) {
        const surplus = b.limit - b.spent;
        const suggested = Math.round(surplus * 0.5 * 100) / 100;
        if (suggested > 0) {
          md += `*   **${b.category}**: Excedente de **$${surplus.toFixed(2)}**. Sugerimos ahorrar **$${suggested.toFixed(2)}**.\n`;
          totalSuggested += suggested;
        }
      }
      md += `\n---\n\n**Ahorro total recomendado**: **$${totalSuggested.toFixed(2)}**\n\n*Haz clic en "Aplicar Sugerencias" para transferir y consolidar estos montos automáticamente.*`;
    }

    saveSavingsRecommendations(req.userEmail, md);
    res.json({ success: true, recommendations: md, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error loading recommendations:", error);
    res.status(500).json({ error: "Failed to calculate recommendations" });
  }
});

app.post("/api/finances/savings/apply-recommendation", authMiddleware, (req, res) => {
  try {
    const budgets = getBudgets(req.userEmail);
    const surpluses = budgets.filter((b) => b.limit > 0 && b.limit - b.spent > 0);

    let totalSaved = 0;
    for (const b of surpluses) {
      const surplus = b.limit - b.spent;
      const suggested = Math.round(surplus * 0.5 * 100) / 100;
      if (suggested > 0) {
        depositSavings(req.userEmail, suggested);
        updateBudgetSpent(req.userEmail, b.category, b.spent + suggested);
        totalSaved += suggested;
      }
    }

    clearSavingsRecommendations(req.userEmail);
    
    if (totalSaved > 0) {
      const activeChatId = "chat-welcome";
      const systemMessage = {
        id: `chat-${Date.now()}`,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `🤖 **Ahorro Automático Aplicado**: He transferido un total de **$${totalSaved.toFixed(2)}** a tus ahorros a partir de tus excedentes de presupuesto.`
      };
      persistChatMessage(req.userEmail, systemMessage, activeChatId);
    }

    res.json({ success: true, state: getUserState(req.userEmail) });
  } catch (error) {
    console.error("Error applying savings recommendation:", error);
    res.status(500).json({ error: "Failed to apply recommendation" });
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
