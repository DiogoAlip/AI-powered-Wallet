import React, { useState } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { useFinancesStore } from "../../../store/finances.store.ts";

interface AddTransactionModalProps {
  onClose: () => void;
  onSubmit: (tx: {
    merchant: string;
    category: string;
    amount: number;
    account: string;
    type: "expense" | "income";
  }) => void;
}

export function AddTransactionModal({ onClose, onSubmit }: AddTransactionModalProps) {
  const { categories } = useFinancesStore();
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState(categories[0] || "Otros");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("Tarjeta Personal");
  const [type, setType] = useState<"expense" | "income">("expense");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || !amount) return;

    onSubmit({
      merchant,
      category: type === "income" ? "Ingresos" : category,
      amount: parseFloat(amount),
      account,
      type,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-100 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 max-h-[95vh] flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8f9ff]">
          <h3 className="font-sans font-bold text-[#0b1c30] text-sm">
            Nuevo Registro Financiero
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Type selector tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#f8f9ff] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === "expense"
                  ? "bg-red-100 text-red-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === "income"
                  ? "bg-emerald-100 text-emerald-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Concept/Merchant */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Concepto / Comercio
            </label>
            <input
              type="text"
              placeholder="ej: Green Cafe o Nómina"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-600"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Importe (S/)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-600"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Category selector (only for expenses) */}
          {type === "expense" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Categoría
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-600"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Account / Method */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Cuenta / Método
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-600"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            >
              <option value="Tarjeta Personal">Tarjeta Personal</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Depósito Directo">Depósito Directo</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-semibold bg-[#006a61] hover:bg-teal-700 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <IconCheck className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
