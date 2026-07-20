import {
  getTransactions,
  getBudgets,
  getSavings,
  addTransaction,
  updateBudgetLimit,
  updateTransaction,
  deleteTransaction,
  addCategory,
  updateCategory,
  deleteCategory,
  updateSavingsGoal,
  updateBudgetSpent,
  getCategories,
  getWeeklySavingsHistory,
  getTransaction,
  getUserBudgetTips,
  getTransactionsInDateRange,
} from "./db.js";

export function formatCurrencyBackend(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "S/ 0,00";
  }
  const sign = amount < 0 ? "-" : "";
  const absoluteAmount = Math.abs(amount);
  const parts = absoluteAmount.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalPart = parts[1];
  return `${sign}S/ ${integerPart},${decimalPart}`;
}

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
              description: "El monto numérico de la transacción en soles (ej: 18.75, 1200)."
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
        name: "update_budget_limit",
        description: "Actualiza el límite de presupuesto semanal para una categoría de gasto en soles. Utiliza esta herramienta si el usuario solicita cambiar, establecer o actualizar un presupuesto.",
        parameters: {
          type: "OBJECT",
          properties: {
            category: {
              type: "STRING",
              description: "La categoría de presupuesto a actualizar (ej: Comida fuera, Transporte, Supermercado, Facturas, Compras)."
            },
            limit: {
              type: "NUMBER",
              description: "El nuevo límite semanal establecido en soles."
            }
          },
          required: ["category", "limit"]
        }
      },
      {
        name: "list_transactions",
        description: "Obtiene la lista completa de transacciones financieras registradas del usuario. Utilízala cuando el usuario quiera ver sus movimientos, historial o cuando necesites encontrar el ID de una transacción para actualizarla o eliminarla.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: []
        }
      },
      {
        name: "update_transaction",
        description: "Actualiza o edita una transacción financiera existente usando su ID. Utiliza esta herramienta cuando el usuario te pida corregir, modificar o cambiar algún detalle de un gasto o ingreso ya registrado.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: {
              type: "STRING",
              description: "El identificador único (ID) de la transacción que se desea actualizar."
            },
            merchant: {
              type: "STRING",
              description: "El nuevo nombre del establecimiento o concepto. Opcional."
            },
            category: {
              type: "STRING",
              description: "La nueva categoría. Debe ser una de las siguientes: 'Comida fuera', 'Transporte', 'Supermercado', 'Facturas', 'Compras', 'Otros' para gastos; o 'Ingresos' para entradas de dinero. Opcional."
            },
            amount: {
              type: "NUMBER",
              description: "El nuevo monto de la transacción en soles. Opcional."
            },
            type: {
              type: "STRING",
              enum: ["expense", "income"],
              description: "Si es un gasto (expense) o un ingreso (income). Opcional."
            },
            account: {
              type: "STRING",
              description: "La nueva cuenta de origen o destino. Opcional."
            },
            date: {
              type: "STRING",
              description: "La nueva fecha o texto de la fecha (ej: 'Hoy', 'Ayer', 'Hace 2 días'). Opcional."
            }
          },
          required: ["id"]
        }
      },
      {
        name: "delete_transaction",
        description: "Elimina una transacción financiera registrada usando su ID. Utiliza esta herramienta cuando el usuario pida borrar, quitar, eliminar o cancelar un gasto o ingreso.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: {
              type: "STRING",
              description: "El identificador único (ID) de la transacción que se desea eliminar."
            }
          },
          required: ["id"]
        }
      },
      {
        name: "update_savings_goal",
        description: "Actualiza los detalles de la meta de ahorro del usuario (nombre, objetivo, fecha de inicio y fecha límite opcional).",
        parameters: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "El nuevo nombre para la meta de ahorro. Opcional."
            },
            target: {
              type: "NUMBER",
              description: "La nueva cantidad objetivo en soles. Opcional."
            },
            start_date: {
              type: "STRING",
              description: "La fecha de inicio de la meta en formato YYYY-MM-DD. Opcional."
            },
            deadline: {
              type: "STRING",
              description: "La fecha límite de la meta en formato YYYY-MM-DD o null si no tiene. Opcional."
            }
          },
          required: []
        }
      },
      {
        name: "add_category",
        description: "Crea o añade una nueva categoría de gasto en el sistema del usuario.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "El nombre de la nueva categoría a crear."
            }
          },
          required: ["name"]
        }
      },
      {
        name: "update_category",
        description: "Modifica o renombra una categoría de gasto existente en el sistema del usuario.",
        parameters: {
          type: "OBJECT",
          properties: {
            oldName: {
              type: "STRING",
              description: "El nombre actual de la categoría que se desea modificar."
            },
            newName: {
              type: "STRING",
              description: "El nuevo nombre que se le asignará a la categoría."
            }
          },
          required: ["oldName", "newName"]
        }
      },
      {
        name: "delete_category",
        description: "Elimina una categoría de gasto existente en el sistema del usuario.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "El nombre de la categoría a eliminar."
            }
          },
          required: ["name"]
        }
      },
      {
        name: "update_budget_spent",
        description: "Sobrescribe o actualiza directamente la cantidad gastada de una categoría de presupuesto específica. Úsala cuando el usuario pida ajustar o corregir lo gastado en un presupuesto.",
        parameters: {
          type: "OBJECT",
          properties: {
            category: {
              type: "STRING",
              description: "La categoría del presupuesto a modificar (ej: Comida fuera, Transporte, Supermercado, Facturas, Compras)."
            },
            spent: {
              type: "NUMBER",
              description: "La nueva cantidad gastada acumulada en soles."
            }
          },
          required: ["category", "spent"]
        }
      },
      {
        name: "list_budgets",
        description: "Obtiene la lista de presupuestos por categoría del usuario, incluyendo el límite establecido y la cantidad gastada.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: []
        }
      },
      {
        name: "get_savings",
        description: "Obtiene la información y estado actual de la meta de ahorro del usuario.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: []
        }
      },
      {
        name: "list_categories",
        description: "Obtiene la lista de todas las categorías de gasto disponibles en el sistema del usuario.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: []
        }
      },
      {
        name: "get_weekly_savings_history",
        description: "Obtiene el historial de ahorros semanales calculados de manera automática del usuario.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: []
        }
      },
      {
        name: "get_transaction",
        description: "Obtiene los detalles de una transacción financiera específica utilizando su ID único.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: {
              type: "STRING",
              description: "El identificador único (ID) de la transacción que se desea consultar."
            }
          },
          required: ["id"]
        }
      },
      {
        name: "get_budget_tips",
        description: "Obtiene los últimos consejos de presupuesto y recomendaciones financieras guardadas para el usuario.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: []
        }
      },
      {
        name: "get_transactions_in_date_range",
        description: "Obtiene la lista de transacciones del usuario que se encuentran dentro de un rango de fechas opcional.",
        parameters: {
          type: "OBJECT",
          properties: {
            start_date: {
              type: "STRING",
              description: "La fecha de inicio (formato YYYY-MM-DD o relativo como 'Hace 7 días' o 'Ayer'). Opcional."
            },
            end_date: {
              type: "STRING",
              description: "La fecha de fin (formato YYYY-MM-DD o relativo como 'Hoy'). Opcional."
            }
          },
          required: []
        }
      }
    ]
  }

];

function getSystemInstruction(transactions, budgets, savings) {
  const budgetsContext = budgets
    .map((b) => `- **${b.category}**: Gastado ${formatCurrencyBackend(b.spent)} de un límite de ${formatCurrencyBackend(b.limit)}`)
    .join("\n");

  const recentTxContext = transactions
    .slice(0, 5)
    .map(
      (t) =>
        `- [${t.type === "expense" ? "Gasto" : "Ingreso"}] ${formatCurrencyBackend(t.amount)} en **${t.merchant}** (Categoría: ${t.category}, Fecha: ${t.date}, ID: ${t.id})`
    )
    .join("\n");

  const savingsContext = savings.name
    ? `  Meta: "${savings.name}"
  Acumulado: ${formatCurrencyBackend(savings.current)} de un objetivo de ${formatCurrencyBackend(savings.target)}
  Fecha de inicio: ${savings.start_date || 'No definida'}
  Fecha límite: ${savings.deadline || 'No definida'}`
    : `  Sin meta configurada actualmente.`;

  return `Eres FinancIA!, un asistente financiero virtual altamente inteligente, amable y proactivo. Tu objetivo es ayudar al usuario a registrar gastos, ingresos, gestionar presupuestos y alcanzar sus metas de ahorro.

Aquí está el estado financiero actual del usuario en tiempo real:
- **Ahorros**:
${savingsContext}
  (Los ahorros se calculan de manera 100% automática en base a los límites sobrantes de cada semana completada transcurrida desde la fecha de inicio.)

- **Límites de Presupuesto Semanales**:
${budgetsContext}

- **Últimas Transacciones Registradas**:
${recentTxContext}

Instrucciones de comportamiento:
1. Responde siempre en español, de manera concisa, amable y empática.
2. Si el usuario te indica que gastó o recibió dinero (ej: "gasté 15 en taxi", "me pagaron 100"), utiliza la herramienta 'add_transaction' para registrar la transacción. Elige la categoría correcta entre las disponibles: 'Comida fuera', 'Transporte', 'Supermercado', 'Facturas', 'Compras', 'Otros', o 'Ingresos'.
3. Los ahorros se calculan automáticamente a partir de los excedentes presupuestarios de cada semana completada. El usuario NO puede hacer aportes manuales, depósitos, ni reinicios manuales de ahorros. Si el usuario te pregunta sobre depositar o iniciar ahorros de forma manual, explícale con amabilidad que el sistema lo calcula dinámicamente de forma automática al finalizar cada semana.
4. Si el usuario quiere ajustar el límite de un presupuesto, utiliza la herramienta 'update_budget_limit'.
5. Si el usuario quiere ver su historial de transacciones o movimientos financieros, utiliza la herramienta 'list_transactions'.
6. Si el usuario quiere modificar, corregir o cambiar los detalles de una transacción existente (por ejemplo, cambiar el monto, la fecha, el establecimiento o la categoría), utiliza la herramienta 'update_transaction'. Primero identifica el ID de la transacción basándote en su descripción o el historial, y luego realiza el cambio.
7. Si el usuario quiere borrar o eliminar una transacción, utiliza la herramienta 'delete_transaction' con el ID correspondiente.
8. Si el usuario quiere configurar, actualizar o modificar los parámetros de su única meta de ahorro (su nombre, cantidad objetivo, fecha de inicio o fecha límite), utiliza la herramienta 'update_savings_goal'. Si no tiene una meta configurada y quiere ahorrar, indícale amablemente que debe establecer la meta (incluyendo su fecha de inicio) para que el sistema empiece a contar sus ahorros semanales automáticos.
9. Si el usuario quiere crear/añadir una nueva categoría de gasto, utiliza la herramienta 'add_category'. Si quiere renombrar una existente, utiliza 'update_category'. Si quiere borrar una categoría de gasto, utiliza 'delete_category'.
10. Si el usuario quiere cambiar o corregir manualmente la cantidad gastada acumulada en un presupuesto, utiliza la herramienta 'update_budget_spent'.
11. Cuando ejecutes una acción, explica brevemente qué registraste, modificaste o eliminaste y cómo afecta a las finanzas del usuario (ej: saldo restante, avance del ahorro).
12. Si un presupuesto ha sido excedido o está al 75% o más de su capacidad, adviérteselo amablemente al usuario con recomendaciones constructivas.
13. Nunca menciones la palabra "wallet" ni "billetera". Refiérete a la aplicación como "sistema de gestión financiera" o simplemente "FinancIA!".
14. La moneda oficial del sistema es el Sol peruano (S/). En todas tus respuestas de texto y explicaciones, debes referirte a los montos de dinero en Soles y formatearlos con puntuación decimal latinoamericana (coma para decimales y punto para miles, por ejemplo: S/ 1.234,56 o S/ 45,00). Nota: Los parámetros numéricos que envíes al llamar a funciones/herramientas deben seguir siendo números flotantes de JavaScript estándar con punto decimal (ej: 18.75).`;
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
                ? `Te quedan ${formatCurrencyBackend(remaining)} de tu presupuesto para '${newTx.category}'.`
                : `¡Alerta! Has excedido el presupuesto de '${newTx.category}' por ${formatCurrencyBackend(Math.abs(remaining))}.`;
          }
        }
      }
      functionResult = { status: "success", transaction: newTx };
    } else if (name === "update_budget_limit") {
      const updateArgs = args;
      const limit = parseFloat(updateArgs.limit) || 0;
      const category = updateArgs.category;
      updateBudgetLimit(cleanEmail, category, limit);
      functionResult = {
        status: "success",
        message: `Presupuesto de '${category}' actualizado a un límite de ${formatCurrencyBackend(limit)}.`
      };
    } else if (name === "list_transactions") {
      const txs = getTransactions(cleanEmail);
      functionResult = {
        status: "success",
        transactions: txs
      };
    } else if (name === "update_transaction") {
      const txArgs = args;
      const updatedTx = updateTransaction(cleanEmail, txArgs.id, {
        merchant: txArgs.merchant,
        category: txArgs.category,
        amount: txArgs.amount !== undefined ? parseFloat(txArgs.amount) : undefined,
        type: txArgs.type,
        account: txArgs.account,
        date: txArgs.date
      });

      if (updatedTx) {
        transactionDetail = updatedTx;
        if (updatedTx.type === "expense") {
          const updatedBudgets = getBudgets(cleanEmail);
          const categoryBudget = updatedBudgets.find((b) => b.category === updatedTx.category);
          if (categoryBudget) {
            const spentAfter = categoryBudget.spent;
            const remaining = categoryBudget.limit - spentAfter;
            infoText =
              remaining >= 0
                ? `Te quedan ${formatCurrencyBackend(remaining)} de tu presupuesto para '${updatedTx.category}' después de la actualización.`
                : `¡Alerta! Has excedido el presupuesto de '${updatedTx.category}' por ${formatCurrencyBackend(Math.abs(remaining))} tras la actualización.`;
          }
        }
        functionResult = {
          status: "success",
          transaction: updatedTx,
          message: `Transacción con ID '${txArgs.id}' actualizada con éxito.`
        };
      } else {
        functionResult = {
          status: "error",
          message: `No se pudo actualizar la transacción: no se encontró la transacción con ID '${txArgs.id}'.`
        };
      }
    } else if (name === "delete_transaction") {
      const txArgs = args;
      const deletedTx = deleteTransaction(cleanEmail, txArgs.id);
      if (deletedTx) {
        functionResult = {
          status: "success",
          message: `Transacción con ID '${txArgs.id}' eliminada con éxito.`
        };
      } else {
        functionResult = {
          status: "error",
          message: `No se pudo eliminar la transacción: no se encontró la transacción con ID '${txArgs.id}'.`
        };
      }
    } else if (name === "update_savings_goal") {
      const updateArgs = args;
      const currentSavings = getSavings(cleanEmail);
      const goalName = updateArgs.name !== undefined ? updateArgs.name : currentSavings.name;
      const target = updateArgs.target !== undefined ? parseFloat(updateArgs.target) : currentSavings.target;
      const startDate = updateArgs.start_date !== undefined ? updateArgs.start_date : (currentSavings.start_date || new Date().toISOString().slice(0, 10));
      const deadline = updateArgs.deadline !== undefined ? updateArgs.deadline : currentSavings.deadline;
      updateSavingsGoal(cleanEmail, goalName, target, startDate, deadline);
      functionResult = {
        status: "success",
        message: `Meta de ahorro actualizada a '${goalName}' con un objetivo de ${formatCurrencyBackend(target)}, fecha de inicio ${startDate}${deadline ? ` y fecha límite ${deadline}` : ''}.`
      };
    } else if (name === "add_category") {
      const catArgs = args;
      addCategory(cleanEmail, catArgs.name);
      functionResult = {
        status: "success",
        message: `Categoría '${catArgs.name}' añadida exitosamente.`
      };
    } else if (name === "update_category") {
      const catArgs = args;
      updateCategory(cleanEmail, catArgs.oldName, catArgs.newName);
      functionResult = {
        status: "success",
        message: `Categoría renombrada de '${catArgs.oldName}' a '${catArgs.newName}' correctamente.`
      };
    } else if (name === "delete_category") {
      const catArgs = args;
      deleteCategory(cleanEmail, catArgs.name);
      functionResult = {
        status: "success",
        message: `Categoría '${catArgs.name}' eliminada correctamente.`
      };
    } else if (name === "update_budget_spent") {
      const budgetArgs = args;
      const spent = parseFloat(budgetArgs.spent) || 0;
      updateBudgetSpent(cleanEmail, budgetArgs.category, spent);
      functionResult = {
        status: "success",
        message: `Gasto de la categoría '${budgetArgs.category}' actualizado manualmente a ${formatCurrencyBackend(spent)}.`
      };
    } else if (name === "list_budgets") {
      const budgets = getBudgets(cleanEmail);
      functionResult = {
        status: "success",
        budgets
      };
    } else if (name === "get_savings") {
      const savings = getSavings(cleanEmail);
      functionResult = {
        status: "success",
        savings
      };
    } else if (name === "list_categories") {
      const categories = getCategories(cleanEmail);
      functionResult = {
        status: "success",
        categories
      };
    } else if (name === "get_weekly_savings_history") {
      const history = getWeeklySavingsHistory(cleanEmail);
      functionResult = {
        status: "success",
        history
      };
    } else if (name === "get_transaction") {
      const tx = getTransaction(cleanEmail, args.id);
      if (tx) {
        functionResult = {
          status: "success",
          transaction: tx
        };
      } else {
        functionResult = {
          status: "error",
          message: `No se encontró la transacción con ID '${args.id}'.`
        };
      }
    } else if (name === "get_budget_tips") {
      const tips = getUserBudgetTips(cleanEmail);
      functionResult = {
        status: "success",
        tips
      };
    } else if (name === "get_transactions_in_date_range") {
      const txs = getTransactionsInDateRange(cleanEmail, args.start_date, args.end_date);
      functionResult = {
        status: "success",
        transactions: txs
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
    .map((b) => `- **${b.category}**: Gastado ${formatCurrencyBackend(b.spent)} de un límite de ${formatCurrencyBackend(b.limit)}`)
    .join("\n");

  const recentTxContext = transactions
    .slice(0, 10)
    .map(
      (t) =>
        `- [${t.type === "expense" ? "Gasto" : "Ingreso"}] ${formatCurrencyBackend(t.amount)} en **${t.merchant}** (Categoría: ${t.category}, Fecha: ${t.date})`
    )
    .join("\n");

  const prompt = `Analiza mi situación financiera actual y dame exactamente 3 consejos o tips de presupuesto breves y prácticos en español.
Cada consejo debe ser conciso (máximo 2 líneas) y estar formateado como una lista de viñetas (usando viñetas normales, ya que el frontend se encargará de renderizarlas).
Usa mi contexto actual:

Límites de Presupuesto Semanales:
${budgetsContext}

Últimos movimientos:
${recentTxContext}

Meta de ahorro activa: "${savings.name}", acumulado ${formatCurrencyBackend(savings.current)} de un objetivo de ${formatCurrencyBackend(savings.target)}.

Por favor, proporciona los consejos separados por salto de línea sin numeración. En tus consejos, todos los montos de dinero deben usar Soles y estar en formato decimal latinoamericano (ej: S/ 120,00 o S/ 1.400,00). Ejemplo:
Moviendo tus S/ 120,00 de ahorro excedente en comida a tu Meta de Emergencia aumentas tu probabilidad de meta en un 8%.
Tus suscripciones como Netflix representan el 15% de tu presupuesto de facturas fijas. ¡Un control sabio!
Estás en camino de acumular un excedente neto de S/ 1.400,00 este mes si mantienes este ritmo de consumo de transporte.

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
