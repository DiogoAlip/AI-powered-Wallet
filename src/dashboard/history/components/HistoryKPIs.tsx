import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

interface HistoryKPIsProps {
  totalExpense: number;
  totalIncome: number;
  netBalance: number;
}

export function HistoryKPIs({ totalExpense, totalIncome, netBalance }: HistoryKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Balance Card */}
      <div className="bg-[#eff4ff] border border-blue-100 p-5 rounded-2xl shadow-sm">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
          Balance Neto
        </span>
        <div className="flex items-baseline gap-1 mt-2">
          <span
            className={`text-2xl font-bold font-display ${
              netBalance >= 0 ? "text-[#0b1c30]" : "text-red-600"
            }`}
          >
            $
            {netBalance.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <span className="text-xs text-gray-400 mt-1 block">
          Sincronizado en tiempo real
        </span>
      </div>

      {/* Expenses Card */}
      <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-red-700/70 uppercase tracking-wider block">
            Gastos Totales
          </span>
          <IconTrendingDown className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-2xl font-bold font-display text-red-700">
            -$
            {totalExpense.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <span className="text-xs text-red-500/60 mt-1 block">
          Salidas de capital
        </span>
      </div>

      {/* Income Card */}
      <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-emerald-700/70 uppercase tracking-wider block">
            Ingresos Totales
          </span>
          <IconTrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-2xl font-bold font-display text-emerald-700">
            +$
            {totalIncome.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <span className="text-xs text-emerald-500/60 mt-1 block">
          Entradas de capital
        </span>
      </div>
    </div>
  );
}
