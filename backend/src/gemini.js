import {
  getTransactions,
  getBudgets,
  getSavings,
  addTransaction,
  depositSavings,
  updateBudgetLimit,
} from "./db.js";

const FINANCIAL_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "add_transaction",
        description: "Registra un nuevo movimiento financiero (gasto o ingreso) en el sistema. Utiliza esta herramienta cuando el usuario exprese que ha gastado, pagado, comprado o recibido dinero.",
        parameters: {
          type: "OBJECT",
          properties: {
            merchant: {
              type: "STRING",
              description: "El nombre del establecimiento, comercio, persona o concepto de la transacción (ej: Starbucks, Netflix, Salario, Supermercado)."
            },
            category: {
              type: "STRING",
              description: "La categoría del movimiento. Debe ser una de las siguientes: 'Comida fuera', 'Transporte', 'Supermercado', 'Facturas', 'Compras', 'Otros' para gastos; o 'Ingresos' para entradas de dinero."
            },
            amount: {
              type: "NUMBER",
              description: "El monto numérico de la transacción en dólares (ej: 18.75, 1200)."
            },
            type: {
              type: "STRING",
              enum: ["expense", "income"],
              description: "Si es un gasto (expense) o un ingreso (income)."
            },
            account: {
              type: "STRING",
              description: "La cuenta de origen o destino. Usar 'Tarjeta Personal' para gastos e 'Ingresos' o 'Depósito Directo' para ingresos."
            }
          },
          required: ["merchant", "category", "amount", "type"]
        }
      },
      {
        name: "deposit_savings",
        description: "Deposita una cantidad de dinero en la meta de ahorro actual del usuario (ej: Fondo de Emergencia). Usa esta herramienta cuando el usuario mencione que quiere ahorrar o guardar dinero.",
        parameters: {
          type: "OBJECT",
          properties: {
            amount: {
              type: "NUMBER",
              description: "El monto a ahorrar en dólares."
            },
            note: {
              type: "STRING",
              description: "El concepto, motivo o descripción del ahorro (ej: 'Ahorro de almuerzo', 'Excedente de transporte', 'Premio'). Opcional."
            }
          },
          required: ["amount"]
        }
      },
      {
        name: "update_budget_limit",
        description: "Actualiza el límite de presupuesto semanal para una categoría de gasto en dólares. Utiliza esta herramienta si el usuario solicita cambiar, establecer o actualizar un presupuesto.",
        parameters: {
          type: "OBJECT",
          properties: {
            category: {
              type: "STRING",
              description: "La categoría de presupuesto a actualizar (ej: Comida fuera, Transporte, Supermercado, Facturas, Compras)."
            },
            limit: {
              type: "NUMBER",
              description: "El nuevo límite semanal establecido en dólares."
            }
          },
          required: ["category", "limit"]
        }
      }
    ]
  }
];

function getSystemInstruction(transactions, budgets, savings) {
  const budgetsContext = budgets
    .map((b) => `- **${b.category}**: Gastado $${b.spent.toFixed(2)} de un límite de $${b.limit.toFixed(2)}`)
    .join("\n");

  const recentTxContext = transactions
    .slice(0, 5)
    .map(
      (t) =>
        `- [${t.type === "expense" ? "Gasto" : "Ingreso"}] $${t.amount.toFixed(2)} en **${t.merchant}** (Categoría: ${t.category}, Fecha: ${t.date})`
    )
    .join("\n");

  return `Eres FinancIA!, un asistente financiero virtual altamente inteligente, amable y proactivo. Tu objetivo es ayudar al usuario a registrar gastos, ingresos, gestionar presupuestos y alcanzar sus metas de ahorro.

Aquí está el estado financiero actual del usuario en tiempo real:
- **Ahorros**:
  Meta: "${savings.name}"
  Acumulado: $${savings.current.toFixed(2)} de un objetivo de $${savings.target.toFixed(2)}

- **Límites de Presupuesto Semanales**:
${budgetsContext}

- **Últimas Transacciones Registradas**:
${recentTxContext}

Instrucciones de comportamiento:
1. Responde siempre en español, de manera concisa, amable y empática.
2. Si el usuario te indica que gastó o recibió dinero (ej: "gasté 15 en taxi", "me pagaron 100"), utiliza la herramienta 'add_transaction' para registrar la transacción. Elige la categoría correcta entre las disponibles: 'Comida fuera', 'Transporte', 'Supermercado', 'Facturas', 'Compras', 'Otros', o 'Ingresos'.
3. Si el usuario quiere guardar dinero en sus ahorros, utiliza la herramienta 'deposit_savings'.
4. Si el usuario quiere ajustar el límite de un presupuesto, utiliza la herramienta 'update_budget_limit'.
5. Cuando ejecutes una acción, explica brevemente qué registraste y cómo afecta a las finanzas del usuario (ej: saldo restante, avance del ahorro).
6. Si un presupuesto ha sido excedido o está al 75% o más de su capacidad, adviérteselo amablemente al usuario con recomendaciones constructivas.
7. Nunca menciones la palabra "wallet" ni "billetera". Refiérete a la aplicación como "sistema de gestión financiera" o simplemente "FinancIA!".`;
}

async function makeApiRequest(model, apiKey, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 404 && model === "gemini-3.5-flash") {
        console.warn("gemini-3.5-flash not available. Retrying with gemini-3.1-flash...");
        return makeApiRequest("gemini-3.1-flash", apiKey, payload);
      }

      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in Gemini API request:", error);
    throw error;
  }
}

export async function chat(userText, chatHistory, email) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the backend environment variables.");
  }

  const cleanEmail = email.toLowerCase();
  
  // Fetch real-time data from DB to compile instructions
  const transactions = getTransactions(cleanEmail);
  const budgets = getBudgets(cleanEmail);
  const savings = getSavings(cleanEmail);

  const modelName = "gemini-3.5-flash";
  const systemText = getSystemInstruction(transactions, budgets, savings);

  // Map history to Gemini format (user / model turns)
  const historyContents = chatHistory
    .filter((msg) => msg.text && (msg.sender === "user" || msg.sender === "ai"))
    .map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

  const contents = [...historyContents, { role: "user", parts: [{ text: userText }] }];

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemText }]
    },
    tools: FINANCIAL_TOOLS
  };

  let response = await makeApiRequest(modelName, apiKey, payload);
  let candidate = response.candidates?.[0];
  let part = candidate?.content?.parts?.[0];

  if (part?.functionCall) {
    const { name, args } = part.functionCall;
    let functionResult = null;
    let transactionDetail = undefined;
    let infoText = undefined;

    if (name === "add_transaction") {
      const txArgs = args;
      const newTx = addTransaction(cleanEmail, {
        merchant: txArgs.merchant || "Gasto",
        category: txArgs.category || "Otros",
        amount: parseFloat(txArgs.amount) || 0,
        account: txArgs.account || "Tarjeta Personal",
        type: txArgs.type === "income" ? "income" : "expense"
      });

      if (newTx) {
        transactionDetail = newTx;
        if (newTx.type === "expense") {
          const updatedBudgets = getBudgets(cleanEmail);
          const categoryBudget = updatedBudgets.find((b) => b.category === newTx.category);
          if (categoryBudget) {
            const spentAfter = categoryBudget.spent;
            const remaining = categoryBudget.limit - spentAfter;
            infoText =
              remaining >= 0
                ? `Te quedan $${remaining.toFixed(2)} de tu presupuesto para '${newTx.category}'.`
                : `¡Alerta! Has excedido el presupuesto de '${newTx.category}' por $${Math.abs(remaining).toFixed(2)}.`;
          }
        }
      }
      functionResult = { status: "success", transaction: newTx };
    } else if (name === "deposit_savings") {
      const amount = parseFloat(args.amount) || 0;
      const note = args.note || "Aporte desde chat";
      depositSavings(cleanEmail, amount, note);
      functionResult = {
        status: "success",
        message: `Depositados $${amount.toFixed(2)} en la meta de ahorro con concepto: '${note}'.`
      };
    } else if (name === "update_budget_limit") {
      const updateArgs = args;
      const limit = parseFloat(updateArgs.limit) || 0;
      const category = updateArgs.category;
      updateBudgetLimit(cleanEmail, category, limit);
      functionResult = {
        status: "success",
        message: `Presupuesto de '${category}' actualizado a un límite de $${limit.toFixed(2)}.`
      };
    }

    const updatedContents = [
      ...contents,
      {
        role: "model",
        parts: [part]
      },
      {
        role: "function",
        parts: [
          {
            functionResponse: {
              name,
              response: functionResult
            }
          }
        ]
      }
    ];

    const secondPayload = {
      contents: updatedContents,
      systemInstruction: {
        parts: [{ text: systemText }]
      },
      tools: FINANCIAL_TOOLS
    };

    response = await makeApiRequest(modelName, apiKey, secondPayload);
    candidate = response.candidates?.[0];
    part = candidate?.content?.parts?.[0];

    return {
      text: part?.text || "Acción procesada con éxito.",
      transactionDetail,
      infoText
    };
  }

  return {
    text: part?.text || "Lo siento, no pude procesar tu mensaje."
  };
}

function generateFallbackTips(budgets, savings) {
  const tips = [];
  const overSpent = budgets.filter(b => b.limit > 0 && b.spent > b.limit);
  const nearLimit = budgets.filter(b => b.limit > 0 && b.spent >= b.limit * 0.75 && b.spent <= b.limit);
  
  if (overSpent.length > 0) {
    tips.push(`Has superado tu límite en la categoría '${overSpent[0].category}'. Te sugerimos reducir gastos no esenciales esta semana.`);
  }
  
  if (nearLimit.length > 0) {
    tips.push(`Atención: Tu presupuesto en '${nearLimit[0].category}' está al ${Math.round((nearLimit[0].spent / nearLimit[0].limit) * 100)}% de su límite.`);
  }
  
  if (savings && savings.target > 0) {
    const progress = Math.round((savings.current / savings.target) * 100);
    tips.push(`Llevas un ${progress}% de progreso hacia tu meta '${savings.name}'. ¡Sigue así!`);
  }
  
  // Fallback defaults if list is short
  if (tips.length < 3) {
    tips.push("Revisa tus suscripciones activas para identificar gastos hormiga recurrentes.");
  }
  if (tips.length < 3) {
    tips.push("Considera aumentar el límite de las categorías donde constantemente te excedes para reflejar tu gasto real.");
  }
  
  return tips.slice(0, 3).join("\n");
}

export async function generateBudgetTips(email) {
  const cleanEmail = email.toLowerCase();
  const transactions = getTransactions(cleanEmail);
  const budgets = getBudgets(cleanEmail);
  const savings = getSavings(cleanEmail);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Using local fallback tips.");
    return generateFallbackTips(budgets, savings);
  }

  const modelName = "gemini-3.5-flash";

  const budgetsContext = budgets
    .map((b) => `- **${b.category}**: Gastado $${b.spent.toFixed(2)} de un límite de $${b.limit.toFixed(2)}`)
    .join("\n");

  const recentTxContext = transactions
    .slice(0, 10)
    .map(
      (t) =>
        `- [${t.type === "expense" ? "Gasto" : "Ingreso"}] $${t.amount.toFixed(2)} en **${t.merchant}** (Categoría: ${t.category}, Fecha: ${t.date})`
    )
    .join("\n");

  const prompt = `Analiza mi situación financiera actual y dame exactamente 3 consejos o tips de presupuesto breves y prácticos en español.
Cada consejo debe ser conciso (máximo 2 líneas) y estar formateado como una lista de viñetas (usando viñetas normales, ya que el frontend se encargará de renderizarlas).
Usa mi contexto actual:

Límites de Presupuesto Semanales:
${budgetsContext}

Últimos movimientos:
${recentTxContext}

Meta de ahorro activa: "${savings.name}", acumulado $${savings.current.toFixed(2)} de un objetivo de $${savings.target.toFixed(2)}.

Por favor, proporciona los consejos separados por salto de línea sin numeración. Ejemplo:
Moviendo tus $120 de ahorro excedente en comida a tu Meta de Emergencia aumentas tu probabilidad de meta en un 8%.
Tus suscripciones como Netflix representan el 15% de tu presupuesto de facturas fijas. ¡Un control sabio!
Estás en camino de acumular un excedente neto de $1,400 este mes si mantienes este ritmo de consumo de transporte.

Devuelve SOLO los 3 consejos separados por saltos de línea simples. No incluyas títulos ni introducciones.`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
    }
  };

  try {
    const response = await makeApiRequest(modelName, apiKey, payload);
    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const text = part?.text?.trim() || "";
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }
    return text;
  } catch (error) {
    console.error("Gemini API call failed for budget tips. Using local fallback:", error);
    return generateFallbackTips(budgets, savings);
  }
}
