import { IconSearch, IconPlus, IconFolder } from "@tabler/icons-react";

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  categories: string[];
  onOpenModal: () => void;
  onOpenCatModal: () => void;
}

export function TransactionFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  categories,
  onOpenModal,
  onOpenCatModal,
}: TransactionFiltersProps) {
  return (
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

        {/* Categories Manager Button */}
        <button
          onClick={onOpenCatModal}
          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-sans text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <IconFolder className="w-4 h-4 text-gray-500" />
          Categorías
        </button>

        {/* Manual Add Button */}
        <button
          onClick={onOpenModal}
          className="px-4 py-2 bg-[#006a61] hover:bg-teal-700 text-white font-sans text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <IconPlus className="w-4 h-4" />
          Nuevo Registro
        </button>
      </div>
    </div>
  );
}
