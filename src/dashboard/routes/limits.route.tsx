import { useState } from "react";
import {
  IconShieldCheck,
  IconAlertCircle,
  IconSparkles,
  IconPencil,
  IconCheck,
  IconX,
  IconPig,
  IconCalendarWeek,
} from "@tabler/icons-react";
import type { Budget } from "../types/ChatTypes.ts";
import { getCategoryIcon } from "./chat.route.tsx";

interface BudgetsTabProps {
  budgets: Budget[];
}

export function Limits({ budgets }: BudgetsTabProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newLimitValue, setNewLimitValue] = useState("");

  const handleStartEdit = (cat: Budget) => {
    setEditingCategory(cat.category);
    setNewLimitValue(cat.limit.toString());
  };

  const handleSaveEdit = (category: string) => {
    const val = parseFloat(newLimitValue);
    if (!isNaN(val) && val >= 0) {
      // onUpdateBudgetLimit(category, val);
    }
    setEditingCategory(null);
  };

  // Day of the week progress helper (for pacing)
  // Let's assume we are on day 5 of 7 (71% of the week)
  const weekProgressPercent = 71;

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6">
      {/* Intro Pacing Block */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-[#0b1c30] text-lg">
              Paso de Presupuesto Semanal
            </h3>
            <p className="font-sans text-xs text-gray-500">
              Compara tu nivel de gasto con el avance de la semana
            </p>
          </div>
          <span className="font-sans text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full self-start flex items-center gap-1">
            <IconCalendarWeek className="w-3.5 h-3.5" />
            Día 5 de 7 (Semana actual)
          </span>
        </div>

        {/* Weekly pace bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-500">
            <span>Inicio de semana</span>
            <span className="text-teal-600">
              Avance del tiempo: {weekProgressPercent}%
            </span>
            <span>Fin de semana</span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full relative">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${weekProgressPercent}%` }}
            />
            {/* Today marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white bg-teal-600 shadow-sm"
              style={{ left: `calc(${weekProgressPercent}% - 8px)` }}
              title="Día de hoy"
            />
          </div>
          <p className="font-sans text-[11px] text-gray-400">
            * Los gastos que se mantengan a la izquierda del marcador azul se
            consideran a ritmo saludable.
          </p>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percent =
            budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
          const isOver = percent > 100;
          const isWarning = percent >= 75 && percent <= 100;

          // Color helper
          let barColor = "bg-teal-500";
          let textColor = "text-teal-700";
          let bgColor = "bg-teal-50 border-teal-100";

          if (isOver) {
            barColor = "bg-red-500";
            textColor = "text-red-700";
            bgColor = "bg-red-50 border-red-100";
          } else if (isWarning) {
            barColor = "bg-amber-500";
            textColor = "text-amber-700";
            bgColor = "bg-amber-50 border-amber-100";
          }

          const isEditing = editingCategory === budget.category;

          return (
            <div
              key={budget.category}
              className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f8f9ff] border border-gray-100 flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(budget.category)}
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-[#0b1c30] text-sm">
                        {budget.category}
                      </h4>
                      <p className="font-sans text-xs text-gray-400">
                        Límite establecido
                      </p>
                    </div>
                  </div>

                  {/* Limit Action Buttons */}
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg">
                      <input
                        type="number"
                        className="w-16 px-1.5 py-0.5 border border-gray-200 rounded-md text-xs outline-none"
                        value={newLimitValue}
                        onChange={(e) => setNewLimitValue(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(budget.category)}
                        className="p-1 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
                        title="Guardar"
                      >
                        <IconCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                        title="Cancelar"
                      >
                        <IconX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(budget)}
                      className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                      title="Editar límite"
                    >
                      <IconPencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Progress Stats */}
                <div className="mt-4 flex justify-between items-baseline">
                  <div>
                    <span className="font-display font-bold text-lg text-[#0b1c30]">
                      ${budget.spent.toFixed(2)}
                    </span>
                    <span className="font-sans text-xs text-gray-400 ml-1">
                      consumidos de ${budget.limit.toFixed(2)}
                    </span>
                  </div>
                  <span className={`font-sans text-xs font-bold ${textColor}`}>
                    {percent.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar fill */}
                <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>

              {/* Status Indicator Tip Box */}
              <div
                className={`mt-4 p-2.5 rounded-xl border flex items-center gap-2 ${bgColor}`}
              >
                {isOver ? (
                  <>
                    <IconAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 animate-bounce" />
                    <span className="font-sans text-xs text-red-800">
                      ¡Has superado el límite por{" "}
                      <strong>
                        ${(budget.spent - budget.limit).toFixed(2)}
                      </strong>
                      !
                    </span>
                  </>
                ) : isWarning ? (
                  <>
                    <IconAlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="font-sans text-xs text-amber-800">
                      Alerta: Estás a punto de agotar tu presupuesto semanal.
                    </span>
                  </>
                ) : (
                  <>
                    <IconShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span className="font-sans text-xs text-teal-800">
                      Excelente ritmo. Te quedan{" "}
                      <strong>
                        ${(budget.limit - budget.spent).toFixed(2)}
                      </strong>
                      .
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Suggestions Box */}
      <div className="bg-[#131b2e] text-white p-6 rounded-2xl shadow-md space-y-4 relative overflow-hidden group">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all duration-500" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">
            <IconSparkles className="w-4 h-4" />
          </div>
          <h3 className="font-display font-bold text-sm">
            Consejos de Presupuesto con IA
          </h3>
        </div>

        <ul className="space-y-3 font-sans text-xs text-gray-300">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
            <span>
              Moviendo tus $120 de ahorro excedente en comida a tu Meta de
              Emergencia aumentas tu probabilidad de meta en un 8%.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
            <span>
              Tus suscripciones como Netflix representan el 15% de tu
              presupuesto de facturas fijas. ¡Un control sabio!
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
            <span>
              Estás en camino de acumular un excedente neto de $1,400 este mes
              si mantienes este ritmo de consumo de transporte.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
