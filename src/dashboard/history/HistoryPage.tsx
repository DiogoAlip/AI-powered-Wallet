import React, { useState } from "react";
import {
  IconSearch,
  IconPlus,
  IconTrash,
  IconCalendarWeek,
  IconCreditCard,
  IconTag,
  IconTrendingDown,
  IconTrendingUp,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { getCategoryIcon } from "../helpers/getCategoryIcon.tsx";
import { useFinancesStore } from "../../store/finances.store.ts";

export function History() {
  const { transactions, addTransaction, deleteTransaction } = useFinancesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transaction Form State
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Comida fuera");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("Tarjeta Personal");
  const [type, setType] = useState<"expense" | "income">("expense");

  // Calculated Metrics
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Filtered list
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.merchant
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || t.category === selectedCategory;
    const matchesType = selectedType === "All" || t.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || !amount) return;

    addTransaction({
      merchant,
      category: type === "income" ? "Ingresos" : category,
      amount: parseFloat(amount),
      account,
      type,
    });

    // Reset Form
    setMerchant("");
    setAmount("");
    setCategory("Comida fuera");
    setType("expense");
    setIsModalOpen(false);
  };

  const categories = [
    "All",
    "Comida fuera",
    "Transporte",
    "Supermercado",
    "Facturas",
    "Compras",
    "Otros",
  ];

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6">
      {/* Visual KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="bg-[#eff4ff] border border-blue-100 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Balance Neto
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span
              className={`text-2xl font-bold font-display ${netBalance >= 0 ? "text-[#0b1c30]" : "text-red-600"}`}
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

      {/* Filter and search bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <IconSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar establecimiento..."
            className="w-full pl-9 pr-3 py-2 bg-[#f8f9ff] border border-gray-200 rounded-xl font-sans text-sm outline-none focus:border-teal-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns and Add Button */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* Category Filter */}
          <select
            className="px-3 py-2 bg-[#f8f9ff] border border-gray-200 rounded-xl font-sans text-xs text-gray-700 outline-none focus:border-teal-600"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">Todas las Categorías</option>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            className="px-3 py-2 bg-[#f8f9ff] border border-gray-200 rounded-xl font-sans text-xs text-gray-700 outline-none focus:border-teal-600"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">Todos los Tipos</option>
            <option value="expense">Gastos</option>
            <option value="income">Ingresos</option>
          </select>

          {/* Manual Add Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#006a61] hover:bg-teal-700 text-white font-sans text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* Transaction list table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8f9ff]/50">
          <h3 className="font-sans font-bold text-[#0b1c30] text-sm">
            Listado de Movimientos ({filteredTransactions.length})
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="text-sm">
              No se han encontrado movimientos que coincidan.
            </p>
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
                    className={`font-sans font-bold text-sm ${tx.type === "expense" ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {tx.type === "expense" ? "-" : "+"}${tx.amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Manual Add Transaction Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-100 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 max-h-[95vh] flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8f9ff]">
              <h3 className="font-sans font-bold text-[#0b1c30] text-sm">
                Nuevo Registro Financiero
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  Importe ($)
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
                    <option value="Comida fuera">Comida fuera</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Supermercado">Supermercado</option>
                    <option value="Facturas">Facturas</option>
                    <option value="Compras">Compras</option>
                    <option value="Otros">Otros</option>
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
                  onClick={() => setIsModalOpen(false)}
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
      )}
    </div>
  );
}
