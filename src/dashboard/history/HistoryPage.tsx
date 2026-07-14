import { useState } from "react";
import { useFinancesStore } from "../../store/finances.store.ts";
import { HistoryKPIs } from "./components/HistoryKPIs.tsx";
import { TransactionFilters } from "./components/TransactionFilters.tsx";
import { TransactionList } from "./components/TransactionList.tsx";
import { AddTransactionModal } from "./components/AddTransactionModal.tsx";

export function History() {
  const { transactions, addTransaction, deleteTransaction } = useFinancesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      <HistoryKPIs
        totalExpense={totalExpense}
        totalIncome={totalIncome}
        netBalance={netBalance}
      />

      <TransactionFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        categories={categories}
        onOpenModal={() => setIsModalOpen(true)}
      />

      <TransactionList
        filteredTransactions={filteredTransactions}
        deleteTransaction={deleteTransaction}
      />

      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={addTransaction}
        />
      )}
    </div>
  );
}

