import React, { useState } from "react";
import {
  IconX,
  IconPlus,
  IconPencil,
  IconTrash,
  IconCheck,
  IconLock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useFinancesStore } from "../../store/finances.store";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManagerModal({ isOpen, onClose }: CategoryManagerModalProps) {
  const {
    categories,
    transactions,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useFinancesStore();

  const [newCatName, setNewCatName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Edit states
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Delete confirmation states
  const [pendingDeleteCat, setPendingDeleteCat] = useState<string | null>(null);
  const [pendingDeleteCount, setPendingDeleteCount] = useState(0);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setErrorMsg("El nombre de la categoría no puede estar vacío.");
      return;
    }

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg("Esa categoría ya existe.");
      return;
    }

    addCategory(trimmed);
    setNewCatName("");
    setErrorMsg("");
  };

  const handleStartEdit = (cat: string) => {
    setEditingCat(cat);
    setEditValue(cat);
    setErrorMsg("");
  };

  const handleSaveEdit = (oldName: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setErrorMsg("El nombre no puede estar vacío.");
      return;
    }

    if (
      trimmed.toLowerCase() !== oldName.toLowerCase() &&
      categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      setErrorMsg("Ya existe una categoría con ese nombre.");
      return;
    }

    updateCategory(oldName, trimmed);
    setEditingCat(null);
    setEditValue("");
    setErrorMsg("");
  };

  const handleCancelEdit = () => {
    setEditingCat(null);
    setEditValue("");
    setErrorMsg("");
  };

  const handleDeleteClick = (cat: string) => {
    // Contamos las transacciones asociadas
    const count = transactions.filter((t) => t.category === cat).length;
    if (count > 0) {
      setPendingDeleteCat(cat);
      setPendingDeleteCount(count);
    } else {
      // Si no tiene transacciones, se borra directamente
      if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${cat}"?`)) {
        deleteCategory(cat);
      }
    }
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteCat) {
      deleteCategory(pendingDeleteCat);
      setPendingDeleteCat(null);
      setPendingDeleteCount(0);
    }
  };

  const handleCancelDelete = () => {
    setPendingDeleteCat(null);
    setPendingDeleteCount(0);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[999] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-[#0b1c30]">
            Administrar Categorías
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[350px] no-scrollbar">
          {/* Add Form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre de la nueva categoría..."
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                setErrorMsg("");
              }}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 font-sans text-sm focus:border-[#006a61] focus:ring-1 focus:ring-[#006a61] outline-none transition-all"
            />
            <button
              type="submit"
              className="bg-[#006a61] hover:bg-teal-700 text-white px-4 rounded-xl flex items-center gap-1 font-sans text-sm font-semibold transition-colors cursor-pointer"
            >
              <IconPlus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </form>

          {errorMsg && (
            <p className="text-red-500 text-xs font-sans px-1">{errorMsg}</p>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            <h4 className="font-sans font-bold text-xs text-gray-400 uppercase tracking-wider px-1">
              Mis Categorías
            </h4>
            <div className="space-y-1 border border-gray-100 rounded-2xl p-2 bg-gray-50/50">
              {categories.map((cat) => {
                const isSystem = cat === "Otros";
                const isEditing = editingCat === cat;

                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-gray-100 shadow-xs gap-3"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1 font-sans text-xs focus:border-[#006a61] outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <IconCheck className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <IconX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-sans text-sm font-medium text-gray-700">
                          {cat}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {isSystem ? (
                            <span className="flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200">
                              <IconLock className="w-3 h-3" /> Fijo
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(cat)}
                                className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-teal-600 rounded-lg transition-colors cursor-pointer"
                                title="Editar"
                              >
                                <IconPencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(cat)}
                                className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar"
                              >
                                <IconTrash className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>

        {/* Warning Delete Sub-Overlay Modal */}
        {pendingDeleteCat && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4 text-center border border-red-100 animate-fade-in-up">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-200">
                <IconAlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-[#0b1c30]">
                  ¿Eliminar "{pendingDeleteCat}"?
                </h4>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">
                  Esta categoría tiene{" "}
                  <strong className="text-red-600">{pendingDeleteCount}</strong>{" "}
                  transacción/es asociada/s.
                </p>
                <p className="font-sans text-xs text-gray-600 font-medium bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 leading-relaxed">
                  Al eliminarla, todos estos registros y sus presupuestos se moverán
                  automáticamente a la categoría <strong className="text-teal-800">"Otros"</strong>.
                </p>
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
