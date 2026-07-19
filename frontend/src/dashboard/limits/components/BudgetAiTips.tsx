import { IconSparkles, IconRefresh } from "@tabler/icons-react";
import { useFinancesStore } from "../../../store/finances.store.ts";

export function BudgetAiTips() {
  const { budgetTips, loadingTips, refreshBudgetTips } = useFinancesStore();

  // Split tips by newline and clean up any bullet points or numbering that the AI might have returned
  const tipsArray = budgetTips
    ? budgetTips
        .split("\n")
        .map((tip) => tip.replace(/^[-*•\d.\s]+/, "").trim())
        .filter(Boolean)
    : [];

  return (
    <div className="bg-[#131b2e] text-white p-6 rounded-2xl shadow-md space-y-4 relative overflow-hidden group">
      <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all duration-500" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">
            <IconSparkles className="w-4 h-4" />
          </div>
          <h3 className="font-display font-bold text-sm">
            Consejos de Presupuesto con IA
          </h3>
        </div>
        
        <button
          onClick={refreshBudgetTips}
          disabled={loadingTips}
          className={`p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 hover:border-teal-500/30 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Actualizar consejos"
        >
          <IconRefresh className={`w-4 h-4 ${loadingTips ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loadingTips ? (
        <div className="space-y-3 animate-pulse relative z-10">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500/40 mt-1.5 flex-shrink-0" />
              <div className="h-3 bg-teal-500/10 rounded w-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : tipsArray.length > 0 ? (
        <ul className="space-y-3 font-sans text-xs text-gray-300 relative z-10">
          {tipsArray.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-gray-400 text-center py-4 relative z-10 flex flex-col items-center gap-2">
          <span>No hay consejos de presupuesto generados aún.</span>
          <button
            onClick={refreshBudgetTips}
            className="text-xs text-teal-300 hover:text-teal-200 underline font-semibold transition-colors cursor-pointer"
          >
            Generar consejos ahora
          </button>
        </div>
      )}
    </div>
  );
}
