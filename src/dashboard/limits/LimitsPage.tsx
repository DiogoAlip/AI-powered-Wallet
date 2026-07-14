import { useState } from "react";
import { useFinancesStore } from "../../store/finances.store.ts";
import { WeeklyPacingCard } from "./components/WeeklyPacingCard.tsx";
import { BudgetItemCard } from "./components/BudgetItemCard.tsx";
import { BudgetAiTips } from "./components/BudgetAiTips.tsx";

export function Limits() {
  const { budgets, updateBudgetLimit } = useFinancesStore();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Day of the week progress helper (for pacing)
  // Let's assume we are on day 5 of 7 (71% of the week)
  const weekProgressPercent = 71;

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      <WeeklyPacingCard weekProgressPercent={weekProgressPercent} />

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
    </div>
  );
}

