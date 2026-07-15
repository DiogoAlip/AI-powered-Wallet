import { useState } from "react";
import { useFinancesStore } from "../../store/finances.store.ts";
import { WeeklyPacingCard } from "./components/WeeklyPacingCard.tsx";
import { BudgetItemCard } from "./components/BudgetItemCard.tsx";
import { BudgetAiTips } from "./components/BudgetAiTips.tsx";
import { IconFolder } from "@tabler/icons-react";
import { CategoryManagerModal } from "../components/CategoryManagerModal.tsx";

export function Limits() {
  const { budgets, updateBudgetLimit } = useFinancesStore();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Day of the week progress helper (for pacing)
  // Let's assume we are on day 5 of 7 (71% of the week)
  const weekProgressPercent = 71;

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      <WeeklyPacingCard weekProgressPercent={weekProgressPercent} />

      {/* Header section with category administration */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-base md:text-lg text-[#0b1c30]">
          Límites y Presupuestos Semanales
        </h3>
        <button
          onClick={() => setIsCatModalOpen(true)}
          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-sans text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <IconFolder className="w-4 h-4 text-gray-500" />
          Administrar Categorías
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => (
          <BudgetItemCard
            key={budget.category}
            budget={budget}
            isEditing={editingCategory === budget.category}
            onStartEdit={() => setEditingCategory(budget.category)}
            onSaveEdit={(val) => {
              updateBudgetLimit(budget.category, val);
              setEditingCategory(null);
            }}
            onCancelEdit={() => setEditingCategory(null)}
          />
        ))}
      </div>

      <BudgetAiTips />

      {isCatModalOpen && (
        <CategoryManagerModal
          isOpen={isCatModalOpen}
          onClose={() => setIsCatModalOpen(false)}
        />
      )}
    </div>
  );
}

