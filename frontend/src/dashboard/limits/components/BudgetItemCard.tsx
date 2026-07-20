import { useState } from "react";
import { formatCurrency, formatNumber } from "../../../utils/format";
import {
  IconPencil,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconShieldCheck,
} from "@tabler/icons-react";
import { getCategoryIcon } from "../../helpers/getCategoryIcon.tsx";
import type { Budget } from "../../types/ChatTypes.ts";

interface BudgetItemCardProps {
  budget: Budget;
  isEditing: boolean;
  onStartEdit: () => void;
  onSaveEdit: (value: number) => void;
  onCancelEdit: () => void;
}

export function BudgetItemCard({
  budget,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: BudgetItemCardProps) {
  const [newLimitValue, setNewLimitValue] = useState(budget.limit.toString());

  const percent = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
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

  const handleSave = () => {
    const val = parseFloat(newLimitValue);
    if (!isNaN(val) && val >= 0) {
      onSaveEdit(val);
    } else {
      onCancelEdit();
    }
  };

  return (
    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
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
              <p className="font-sans text-xs text-gray-400">Límite establecido</p>
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
                onClick={handleSave}
                className="p-1 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
                title="Guardar"
              >
                <IconCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                title="Cancelar"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onStartEdit}
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
              {formatCurrency(budget.spent)}
            </span>
            <span className="font-sans text-xs text-gray-400 ml-1">
              consumidos de {formatCurrency(budget.limit)}
            </span>
          </div>
          <span className={`font-sans text-xs font-bold ${textColor}`}>
            {formatNumber(percent, { maximumFractionDigits: 0 })}%
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
      <div className={`mt-4 p-2.5 rounded-xl border flex items-center gap-2 ${bgColor}`}>
        {isOver ? (
          <>
            <IconAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 animate-bounce" />
            <span className="font-sans text-xs text-red-800">
              ¡Has superado el límite por{" "}
              <strong>
                {formatCurrency(budget.spent - budget.limit)}
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
                {formatCurrency(budget.limit - budget.spent)}
              </strong>
              .
            </span>
          </>
        )}
      </div>
    </div>
  );
}
