import {
  getTransactions,
  getBudgets,
  getSavings,
  addTransaction,
  depositSavings,
  updateBudgetLimit,
  updateTransaction,
  deleteTransaction,
  addCategory,
  updateCategory,
  deleteCategory,
  resetSavings,
  deleteSavingsLog,
  updateSavingsGoal,
  updateBudgetSpent,
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
              description: "El nuevo monto de la transacción en dólares. Opcional."
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
        description: "Actualiza el nombre o la cantidad objetivo de la meta de ahorro actual del usuario.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "El nuevo nombre para la meta de ahorro. Opcional."
            },
            target: {
              type: "NUMBER",
              description: "La nueva cantidad objetivo en dólares. Opcional."
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
        name: "reset_savings",
        description: "Reinicia el progreso acumulado de la meta de ahorro a cero dólares y vacía los registros correspondientes. Úsala cuando el usuario quiera empezar de nuevo o borrar su progreso de ahorro.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: []
        }
      },
      {
        name: "delete_savings_log",
        description: "Elimina una entrada de registro de ahorro específica usando su ID. Úsala cuando el usuario quiera deshacer un depósito de ahorro específico.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: {
              type: "STRING",
              description: "El ID del registro de ahorro que se desea eliminar."
            }
          },
          required: ["id"]
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
              description: "La nueva cantidad gastada acumulada en dólares."
            }
          },
          required: ["category", "spent"]
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
        `- [${t.type === "expense" ? "Gasto" : "Ingreso"}] $${t.amount.toFixed(2)} en **${t.merchant}** (Categoría: ${t.category}, Fecha: ${t.date}, ID: ${t.id})`
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
5. Si el usuario quiere ver su historial de transacciones o movimientos financieros, utiliza la herramienta 'list_transactions'.
6. Si el usuario quiere modificar, corregir o cambiar los detalles de una transacción existente (por ejemplo, cambiar el monto, la fecha, el establecimiento o la categoría), utiliza la herramienta 'update_transaction'. Primero identifica el ID de la transacción basándote en su descripción o el historial, y luego realiza el cambio.
7. Si el usuario quiere borrar o eliminar una transacción, utiliza la herramienta 'delete_transaction' con el ID correspondiente.
8. Si el usuario quiere actualizar o modificar la configuración de su meta de ahorro (el nombre de la meta o la cantidad del objetivo), utiliza la herramienta 'update_savings_goal'.
9. Si el usuario quiere crear/añadir una nueva categoría de gasto, utiliza la herramienta 'add_category'. Si quiere renombrar una existente, utiliza 'update_category'. Si quiere borrar una categoría de gasto, utiliza 'delete_category'.
10. Si el usuario quiere reiniciar por completo todo el progreso acumulado de sus ahorros (empezar desde cero), utiliza la herramienta 'reset_savings'.
11. Si el usuario quiere eliminar un depósito de ahorro específico de su registro por su ID, utiliza la herramienta 'delete_savings_log'.
12. Si el usuario quiere cambiar o corregir manualmente la cantidad gastada acumulada en un presupuesto, utiliza la herramienta 'update_budget_spent'.
13. Cuando ejecutes una acción, explica brevemente qué registraste, modificaste o eliminaste y cómo afecta a las finanzas del usuario (ej: saldo restante, avance del ahorro).
14. Si un presupuesto ha sido excedido o está al 75% o más de su capacidad, adviérteselo amablemente al usuario con recomendaciones constructivas.
15. Nunca menciones la palabra "wallet" ni "billetera". Refiérete a la aplicación como "sistema de gestión financiera" o simplemente "FinancIA!".`;
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
                ? `Te quedan $${remaining.toFixed(2)} de tu presupuesto para '${updatedTx.category}' después de la actualización.`
                : `¡Alerta! Has excedido el presupuesto de '${updatedTx.category}' por $${Math.abs(remaining).toFixed(2)} tras la actualización.`;
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
      updateSavingsGoal(cleanEmail, goalName, target);
      functionResult = {
        status: "success",
        message: `Meta de ahorro actualizada a '${goalName}' con un objetivo de $${target.toFixed(2)}.`
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
    } else if (name === "reset_savings") {
      resetSavings(cleanEmail);
      functionResult = {
        status: "success",
        message: "Se ha reiniciado el progreso acumulado de tus ahorros y vaciado los registros de aportes."
      };
    } else if (name === "delete_savings_log") {
      const logArgs = args;
      const deletedLog = deleteSavingsLog(cleanEmail, logArgs.id);
      if (deletedLog) {
        functionResult = {
          status: "success",
          message: `Registro de ahorro con ID '${logArgs.id}' de $${deletedLog.amount.toFixed(2)} eliminado correctamente.`
        };
      } else {
        functionResult = {
          status: "error",
          message: `No se encontró el registro de ahorro con ID '${logArgs.id}'.`
        };
      }
    } else if (name === "update_budget_spent") {
      const budgetArgs = args;
      const spent = parseFloat(budgetArgs.spent) || 0;
      updateBudgetSpent(cleanEmail, budgetArgs.category, spent);
      functionResult = {
        status: "success",
        message: `Gasto de la categoría '${budgetArgs.category}' actualizado manualmente a $${spent.toFixed(2)}.`
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
