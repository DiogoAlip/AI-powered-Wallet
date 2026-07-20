import { useState, useEffect } from "react";
import {
  IconPig,
  IconCheck,
  IconSettings,
  IconCircleCheck,
  IconHistory,
  IconTrendingUp,
  IconTrash,
  IconPlus,
  IconCalendar,
  IconTarget,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { useFinancesStore } from "../../store/finances.store";
import { formatCurrency } from "../../utils/format";
import type { WeeklySavings } from "../types/ChatTypes";

export function Goals() {
  const {
    savings,
    savingsHistory,
    updateSavingsGoal,
    deleteSavingsGoal,
    loadSavingsHistory,
  } = useFinancesStore();

  // Form state
  const [goalName, setGoalName] = useState(savings.name || "");
  const [goalTarget, setGoalTarget] = useState(savings.target > 0 ? savings.target.toString() : "");
  const [goalStartDate, setGoalStartDate] = useState(savings.start_date || "");
  const [goalDeadline, setGoalDeadline] = useState(savings.deadline || "");
  const [configSuccess, setConfigSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasActiveGoal = savings.name && savings.target > 0;
  const percent = hasActiveGoal ? Math.min(100, (savings.current / savings.target) * 100) : 0;

  useEffect(() => {
    setGoalName(savings.name || "");
    setGoalTarget(savings.target > 0 ? savings.target.toString() : "");
    setGoalStartDate(savings.start_date || "");
    setGoalDeadline(savings.deadline || "");
  }, [savings.name, savings.target, savings.start_date, savings.deadline]);

  useEffect(() => {
    if (hasActiveGoal) {
      loadSavingsHistory();
    }
  }, [hasActiveGoal, loadSavingsHistory]);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(goalTarget);
    if (goalName.trim() && !isNaN(targetVal) && targetVal > 0 && goalStartDate) {
      await updateSavingsGoal(goalName.trim(), targetVal, goalStartDate, goalDeadline || null);
      await loadSavingsHistory();
      setConfigSuccess(true);
      setIsEditing(false);
      setTimeout(() => setConfigSuccess(false), 3000);
    }
  };

  const handleDeleteGoal = async () => {
    await deleteSavingsGoal();
    setShowDeleteConfirm(false);
    setIsEditing(false);
  };

  const formatWeekRange = (weekStart: string, weekEnd: string) => {
    const start = new Date(weekStart + "T12:00:00");
    const end = new Date(weekEnd + "T12:00:00");
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${start.toLocaleDateString("es-ES", opts)} – ${end.toLocaleDateString("es-ES", opts)}`;
  };

  // Reverse so most recent weeks show first
  const sortedHistory = [...savingsHistory].reverse();

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h1 className="font-display font-bold text-xl text-[#0b1c30]">
          Meta de Ahorro
        </h1>
        <p className="font-sans text-xs text-gray-400 mt-0.5">
          Tus ahorros se calculan automáticamente a partir de los límites sobrantes de cada semana completada.
        </p>
      </div>

      {/* No Active Goal */}
      {!hasActiveGoal && !isEditing && (
        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-[#006a61] mx-auto">
            <IconTarget className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-sm text-[#0b1c30]">
              No tienes una meta de ahorro activa
            </h3>
            <p className="font-sans text-xs text-gray-400 max-w-md mx-auto">
              Crea una meta para comenzar a acumular ahorros automáticamente a partir de los excedentes semanales de tus presupuestos.
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006a61] hover:bg-teal-700 text-white font-sans text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            Crear Meta de Ahorro
          </button>
        </div>
      )}

      {/* Active Goal or Editing */}
      {(hasActiveGoal || isEditing) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Progress Card — only when active goal exists */}
            {hasActiveGoal && (
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#006a61]">
                      <IconPig className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-[#0b1c30]">
                        {savings.name}
                      </h4>
                      <p className="font-sans text-[11px] text-gray-400 flex items-center gap-1">
                        <IconCalendar className="w-3 h-3" />
                        Desde {new Date(savings.start_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                        {savings.deadline && (
                          <> · Hasta {new Date(savings.deadline + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer"
                    title="Editar meta"
                  >
                    <IconSettings className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-sans text-gray-400">Progreso acumulado</span>
                    <span className="font-display font-bold text-[#0b1c30]">
                      {formatCurrency(savings.current)} / {formatCurrency(savings.target)}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#006a61] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>{percent.toFixed(1)}% completado</span>
                    <span>
                      {savings.target > savings.current
                        ? <>Restan {formatCurrency(savings.target - savings.current)}</>
                        : "¡Meta superada con éxito!"}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                  <div className="text-center p-2.5 bg-teal-50/50 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Acumulado</span>
                    <span className="text-sm font-display font-bold text-[#006a61]">{formatCurrency(savings.current)}</span>
                  </div>
                  <div className="text-center p-2.5 bg-amber-50/50 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Objetivo</span>
                    <span className="text-sm font-display font-bold text-amber-700">{formatCurrency(savings.target)}</span>
                  </div>
                  <div className="text-center p-2.5 bg-blue-50/50 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Semanas</span>
                    <span className="text-sm font-display font-bold text-blue-700">{savingsHistory.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Savings History */}
            {hasActiveGoal && (
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#006a61]">
                    <IconHistory className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#0b1c30]">
                      Historial de Ahorros Semanales
                    </h4>
                    <p className="font-sans text-[11px] text-gray-400 mt-0.5">
                      Excedentes acumulados por semana completada.
                    </p>
                  </div>
                </div>

                {sortedHistory.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto no-scrollbar pr-1 space-y-2">
                    {sortedHistory.map((week: WeeklySavings) => (
                      <div key={week.weekStart} className="border border-gray-100/70 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedWeek(expandedWeek === week.weekStart ? null : week.weekStart)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7.5 h-7.5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                              <IconTrendingUp className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-[#0b1c30] block">
                                {formatWeekRange(week.weekStart, week.weekEnd)}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold">
                                {week.categories.length} categoría{week.categories.length !== 1 ? "s" : ""} con excedente
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-display font-bold text-emerald-600">
                              +{formatCurrency(week.total)}
                            </span>
                            {expandedWeek === week.weekStart
                              ? <IconChevronDown className="w-4 h-4 text-gray-400" />
                              : <IconChevronRight className="w-4 h-4 text-gray-400" />
                            }
                          </div>
                        </button>

                        {expandedWeek === week.weekStart && (
                          <div className="px-3 pb-3 space-y-1.5 animate-fade-in">
                            {week.categories.map((cat) => (
                              <div
                                key={cat.category}
                                className="flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg text-[11px]"
                              >
                                <span className="font-semibold text-[#0b1c30]">{cat.category}</span>
                                <div className="flex items-center gap-3 text-gray-400">
                                  <span>Límite: {formatCurrency(cat.limit)}</span>
                                  <span>Gastado: {formatCurrency(cat.spent)}</span>
                                  <span className="text-emerald-600 font-bold">+{formatCurrency(cat.surplus)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mx-auto">
                      <IconHistory className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-gray-400 font-sans">
                      Aún no hay semanas completadas desde la fecha de inicio.
                    </p>
                    <p className="text-[10px] text-gray-400/80 font-sans">
                      Los ahorros se acumulan al finalizar cada semana (Lunes a Domingo).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (Span 1) */}
          <div className="space-y-6">
            {/* Goal Configuration Form */}
            {(isEditing || !hasActiveGoal) && (
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <IconSettings className="w-4.5 h-4.5 text-gray-500" />
                  <h4 className="font-display font-bold text-[#0b1c30] text-sm">
                    {hasActiveGoal ? "Editar Meta" : "Crear Meta de Ahorro"}
                  </h4>
                </div>

                <form onSubmit={handleSaveGoal} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Nombre del Objetivo
                    </label>
                    <input
                      type="text"
                      required
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      placeholder="Ej. Fondo de Emergencia"
                      className="w-full bg-gray-50 border border-gray-250 focus:border-teal-400 focus:ring-1 focus:ring-teal-100 rounded-xl px-3 py-2 font-sans text-xs text-[#0b1c30] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Monto Objetivo (S/)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      placeholder="Ej. 5000"
                      className="w-full bg-gray-50 border border-gray-250 focus:border-teal-400 focus:ring-1 focus:ring-teal-100 rounded-xl px-3 py-2 font-sans text-xs text-[#0b1c30] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      required
                      value={goalStartDate}
                      onChange={(e) => setGoalStartDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-250 focus:border-teal-400 focus:ring-1 focus:ring-teal-100 rounded-xl px-3 py-2 font-sans text-xs text-[#0b1c30] outline-none transition-all"
                    />
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      Los ahorros se contarán desde la semana que contenga esta fecha.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Fecha Límite (Opcional)
                    </label>
                    <input
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-250 focus:border-teal-400 focus:ring-1 focus:ring-teal-100 rounded-xl px-3 py-2 font-sans text-xs text-[#0b1c30] outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#006a61] hover:bg-teal-700 text-white font-sans text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {hasActiveGoal ? "Guardar Cambios" : "Crear Meta"}
                  </button>

                  {hasActiveGoal && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-full py-2 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}

                  {configSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 animate-fade-in">
                      <IconCircleCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Meta actualizada correctamente.
                    </div>
                  )}
                </form>

                {/* Delete Goal */}
                {hasActiveGoal && (
                  <div className="pt-3 border-t border-gray-100">
                    {showDeleteConfirm ? (
                      <div className="space-y-2 animate-fade-in">
                        <p className="text-[11px] text-red-500 font-semibold">
                          ¿Estás seguro? Esto eliminará la meta actual.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDeleteGoal}
                            className="flex-1 py-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 font-sans text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Sí, Eliminar
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-red-400 hover:text-red-500 hover:bg-red-50 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                        Eliminar Meta
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Milestones - only when goal is active and not editing */}
            {hasActiveGoal && !isEditing && (
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <IconTarget className="w-4.5 h-4.5 text-amber-500" />
                  <h4 className="font-display font-bold text-[#0b1c30] text-sm">
                    Hitos
                  </h4>
                </div>

                <ul className="space-y-3">
                  {[
                    { label: "25%", value: savings.target * 0.25 },
                    { label: "50%", value: savings.target * 0.5 },
                    { label: "75%", value: savings.target * 0.75 },
                    { label: "100%", value: savings.target },
                  ].map((milestone) => {
                    const unlocked = savings.current >= milestone.value;
                    return (
                      <li
                        key={milestone.label}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${unlocked
                            ? "bg-emerald-50/50 border-emerald-100/70 text-emerald-900"
                            : "bg-gray-50/50 border-gray-100 text-gray-400"
                          }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold block">{milestone.label}</span>
                          <span className="text-[10px] text-gray-400 block font-semibold">
                            {formatCurrency(milestone.value)}
                          </span>
                        </div>
                        {unlocked ? (
                          <span className="bg-emerald-500 text-white p-1 rounded-full">
                            <IconCheck className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-gray-250 shrink-0" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Explanation Card */}
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <IconPig className="w-4 h-4 text-[#006a61]" />
                <h5 className="text-xs font-bold text-[#0b1c30]">
                  ¿Cómo funcionan los ahorros?
                </h5>
              </div>
              <p className="font-sans text-[11px] text-gray-400 leading-relaxed">
                Al finalizar cada semana (Lunes a Domingo), el sistema calcula automáticamente
                cuánto sobrante tienes en cada categoría con límite presupuestario.
                Estos excedentes se acumulan como ahorros hacia tu meta actual.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
