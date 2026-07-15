import { IconTag, IconCreditCard, IconCalendarWeek, IconTrash } from "@tabler/icons-react";
import { getCategoryIcon } from "../../helpers/getCategoryIcon.tsx";
import type { Transaction } from "../../types/ChatTypes.ts";

interface TransactionListProps {
  filteredTransactions: Transaction[];
  deleteTransaction: (id: string) => void;
}

export function TransactionList({
  filteredTransactions,
  deleteTransaction,
}: TransactionListProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden bg-white">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8f9ff]/50">
        <h3 className="font-sans font-bold text-[#0b1c30] text-sm">
          Listado de Movimientos ({filteredTransactions.length})
        </h3>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="p-10 text-center text-gray-400">
          <p className="text-sm">No se han encontrado movimientos que coincidan.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f8f9ff] border border-gray-100 flex items-center justify-center shrink-0">
                  {getCategoryIcon(tx.category)}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-[#0b1c30] text-sm">
                    {tx.merchant}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-sans text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <IconTag className="w-3 h-3 text-gray-400" />
                      {tx.category}
                    </span>
                    <span className="font-sans text-[11px] text-gray-400 flex items-center gap-1">
                      <IconCreditCard className="w-3 h-3" />
                      {tx.account}
                    </span>
                    <span className="font-sans text-[11px] text-gray-400 flex items-center gap-1">
                      <IconCalendarWeek className="w-3 h-3" />
                      {tx.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-sans font-bold text-sm ${
                    tx.type === "expense" ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {tx.type === "expense" ? "-" : "+"}$
                  {tx.amount.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Eliminar registro"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
