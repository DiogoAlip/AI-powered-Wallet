import type { Transaction, Budget, SavingsGoal, ChatMessage } from "../../types/ChatTypes";

// Definición de las herramientas (Tools) compatibles con Gemini
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

export interface GeminiResponse {
  text: string;
  transactionDetail?: Transaction;
  infoText?: string;
}

export class GeminiService {
  private static getApiKey(): string {
    return (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
  }

  private static getModelName(): string {
    return "gemini-3.5-flash";
  }

  private static getSystemInstruction(
    transactions: Transaction[],
    budgets: Budget[],
    savings: SavingsGoal
  ): string {
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

  /**
   * Envía un mensaje al chat de Gemini, maneja function calling (herramientas) en caso de requerirse,
   * actualiza el estado de la aplicación mediante las funciones de callback provistas y devuelve la respuesta.
   */
  public static async chat(
    userText: string,
    chatHistory: ChatMessage[],
    state: { transactions: Transaction[]; budgets: Budget[]; savings: SavingsGoal },
    actions: {
      addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction | null;
      depositSavings: (amount: number) => void;
      updateBudgetLimit: (category: string, limit: number) => void;
    }
  ): Promise<GeminiResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Clave de API de Gemini ausente. Define VITE_GEMINI_API_KEY en tu entorno.");
    }

    const modelName = this.getModelName();
    const systemText = this.getSystemInstruction(state.transactions, state.budgets, state.savings);

    // Mapeamos el historial de chat a formato Gemini (turns de usuario y modelo)
    // Filtramos mensajes vacíos o del sistema e ignoramos transacciones adjuntas
    const historyContents = chatHistory
      .filter((msg) => msg.text && (msg.sender === "user" || msg.sender === "ai"))
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

    // Agregamos el mensaje del usuario actual al final
    const contents = [...historyContents, { role: "user", parts: [{ text: userText }] }];

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemText }]
      },
      tools: FINANCIAL_TOOLS
    };

    // Primera llamada a la API de Gemini
    let response = await this.makeApiRequest(modelName, apiKey, payload);
    let candidate = response.candidates?.[0];
    let part = candidate?.content?.parts?.[0];

    // Verificar si el modelo solicitó una llamada de función (Function Calling)
    if (part?.functionCall) {
      const { name, args } = part.functionCall;
      let functionResult: any = null;
      let transactionDetail: Transaction | undefined;
      let infoText: string | undefined;

      // Ejecutar la acción correspondiente en la tienda
      if (name === "add_transaction") {
        const txArgs = args as any;
        const newTx = actions.addTransaction({
          merchant: txArgs.merchant || "Gasto",
          category: txArgs.category || "Otros",
          amount: parseFloat(txArgs.amount) || 0,
          account: txArgs.account || "Tarjeta Personal",
          type: txArgs.type === "income" ? "income" : "expense"
        });

        if (newTx) {
          transactionDetail = newTx;
          // Calcular la información sobre el presupuesto restante si es un gasto
          if (newTx.type === "expense") {
            const updatedBudgets = state.budgets;
            const categoryBudget = updatedBudgets.find((b) => b.category === newTx.category);
            if (categoryBudget) {
              const spentAfter = categoryBudget.spent + newTx.amount;
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
        const amount = parseFloat((args as any).amount) || 0;
        actions.depositSavings(amount);
        functionResult = {
          status: "success",
          message: `Depositados $${amount.toFixed(2)} en la meta de ahorro.`
        };
      } else if (name === "update_budget_limit") {
        const updateArgs = args as any;
        const limit = parseFloat(updateArgs.limit) || 0;
        const category = updateArgs.category;
        actions.updateBudgetLimit(category, limit);
        functionResult = {
          status: "success",
          message: `Presupuesto de '${category}' actualizado a un límite de $${limit.toFixed(2)}.`
        };
      }

      // Preparar el historial multi-turno que incluye la solicitud de la función y su respuesta
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

      // Segunda llamada a la API de Gemini enviando la respuesta del tool
      const secondPayload = {
        contents: updatedContents,
        systemInstruction: {
          parts: [{ text: systemText }]
        },
        tools: FINANCIAL_TOOLS
      };

      response = await this.makeApiRequest(modelName, apiKey, secondPayload);
      candidate = response.candidates?.[0];
      part = candidate?.content?.parts?.[0];

      return {
        text: part?.text || "Acción procesada con éxito.",
        transactionDetail,
        infoText
      };
    }

    // Respuesta directa en texto (sin llamada a función)
    return {
      text: part?.text || "Lo siento, no pude procesar tu mensaje."
    };
  }

  private static async makeApiRequest(model: string, apiKey: string, payload: any): Promise<any> {
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
          console.warn("gemini-3.5-flash no disponible. Reintentando con gemini-3.1-flash...");
          return this.makeApiRequest("gemini-3.1-flash", apiKey, payload);
        }

        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error en la llamada a la API de Gemini:", error);
      throw error;
    }
  }
}
