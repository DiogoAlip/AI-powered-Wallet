import { useState, useEffect } from "react";
import {
  IconPig,
  IconCheck,
  IconShield,
  IconRefresh,
  IconAward,
  IconSettings,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useFinancesStore } from "../../store/finances.store";
import { MarkdownText } from "../chat/components/MarkdownText";

export function Goals() {
  const {
    savings,
    depositSavings,
    resetSavings,
    updateSavingsGoal,
    loadSavingsRecommendations,
    applySavingsRecommendation,
    loadingRecommendations,
  } = useFinancesStore();

  const [depositAmount, setDepositAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // local states for configuration form
  const [goalName, setGoalName] = useState(savings.name);
  const [goalTarget, setGoalTarget] = useState(savings.target.toString());
  const [configSuccess, setConfigSuccess] = useState(false);

  // Recommendations state
  const [recommendationsText, setRecommendationsText] = useState(savings.recommendations || "");



  const percent = Math.min(100, (savings.current / savings.target) * 100);

  useEffect(() => {
    setGoalName(savings.name);
    setGoalTarget(savings.target.toString());
  }, [savings.name, savings.target]);

  useEffect(() => {
    if (savings.recommendations) {
      setRecommendationsText(savings.recommendations);
    } else {
      setRecommendationsText("");
    }
  }, [savings.recommendations]);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      depositSavings(amount);
      setSuccessMessage(
        `¡Has depositado $${amount.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} con éxito!`
      );
      setDepositAmount("");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(goalTarget);
    if (goalName.trim() && !isNaN(targetVal) && targetVal > 0) {
      await updateSavingsGoal(goalName, targetVal);
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
    }
  };

  const handleRefreshRecommendations = async () => {
    const md = await loadSavingsRecommendations();
    setRecommendationsText(md);
  };

  const handleApplyRecommendations = async () => {
    await applySavingsRecommendation();
  };

  const milestones = [
    {
      label: "Fondo Inicial (25%)",
      value: savings.target * 0.25,
      unlocked: savings.current >= savings.target * 0.25,
    },
    {
      label: "Mitad de Camino (50%)",
      value: savings.target * 0.5,
      unlocked: savings.current >= savings.target * 0.5,
    },
    {
      label: "Seguridad Mayor (75%)",
      value: savings.target * 0.75,
      unlocked: savings.current >= savings.target * 0.75,
    },
    {
      label: "Meta Cumplida (100%)",
      value: savings.target,
      unlocked: savings.current >= savings.target,
    },
  ];

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h1 className="font-display font-bold text-xl text-[#0b1c30]">
          Metas de Ahorro
        </h1>
        <p className="font-sans text-xs text-gray-400 mt-0.5">
          Configura tus objetivos de ahorro y automatiza tus transferencias con inteligencia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Savings Goal Tracker Card */}
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#006a61]">
                <IconPig className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#0b1c30]">
                  Meta de Ahorros: {savings.name}
                </h4>
                <p className="font-sans text-xs text-gray-500">
                  Haz crecer tus excedentes presupuestarios automáticamente
                </p>
              </div>
            </div>

            {/* Progress display */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-sans text-gray-400">Progreso acumulado</span>
                <span className="font-display font-bold text-[#0b1c30]">
                  $
                  {savings.current.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  / $
                  {savings.target.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                  })}
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
                  {savings.target > savings.current ? (
                    <>
                      Restan $
                      {(savings.target - savings.current).toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                      })}
                    </>
                  ) : (
                    "¡Meta superada con éxito!"
                  )}
                </span>
              </div>
            </div>

            {/* Action controls for Savings */}
            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 bg-[#f8f9ff] border border-gray-200 px-3 py-1.5 rounded-xl w-full sm:w-auto">
                <span className="text-xs text-gray-500">$</span>
                <input
                  type="number"
                  className="bg-transparent border-none outline-none font-sans font-bold text-sm text-[#0b1c30] w-20 p-0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="100"
                />
              </div>
              <button
                onClick={handleDeposit}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#006a61] hover:bg-teal-700 text-white font-sans text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Depositar en Ahorros
              </button>
              <button
                onClick={resetSavings}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Reiniciar Meta
              </button>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <IconCheck className="w-4 h-4 text-emerald-600" />
                {successMessage}
              </div>
            )}
          </div>

          {/* AI Recommendations Card */}
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <IconShield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-[#0b1c30]">
                    Sugerencias de Ahorro IA
                  </h4>
                  <p className="font-sans text-[11px] text-gray-400">
                    Optimiza tus ahorros transfiriendo presupuestos no utilizados
                  </p>
                </div>
              </div>

              <button
                onClick={handleRefreshRecommendations}
                disabled={loadingRecommendations}
                className={`p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer flex items-center justify-center ${
                  loadingRecommendations ? "animate-spin" : ""
                }`}
                title="Actualizar recomendaciones"
              >
                <IconRefresh className="w-4 h-4" />
              </button>
            </div>

            <div className="relative min-h-[120px] flex flex-col justify-center">
              {loadingRecommendations ? (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center space-y-2 z-10 rounded-xl">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500 font-sans">Analizando presupuestos...</span>
                </div>
              ) : null}

              {recommendationsText ? (
                <div className="space-y-4">
                  <div className="bg-[#fcfcff] border border-blue-50/50 p-4 rounded-xl">
                    <MarkdownText text={recommendationsText} />
                  </div>
                  {!recommendationsText.startsWith("¡Excelente") && (
                    <button
                      onClick={handleApplyRecommendations}
                      disabled={loadingRecommendations}
                      className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-850 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer text-center"
                    >
                      Aplicar Sugerencias de Ahorro
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-gray-400 font-sans">
                    No hay sugerencias calculadas en la base de datos.
                  </p>
                  <button
                    onClick={handleRefreshRecommendations}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#006a61] text-[#006a61] hover:bg-teal-50 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Calcular Ahorros Recomendados
                  </button>
                </div>
              )}
            </div>
          </div>


        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          {/* Configurar Meta Card */}
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <IconSettings className="w-4.5 h-4.5 text-gray-500" />
              <h4 className="font-display font-bold text-[#0b1c30] text-sm">
                Configurar Meta
              </h4>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
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
                  Monto Objetivo ($)
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

              <button
                type="submit"
                className="w-full py-2.5 bg-[#006a61] hover:bg-teal-700 text-white font-sans text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Guardar Configuración
              </button>

              {configSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 animate-fade-in">
                  <IconCircleCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Meta actualizada correctamente.
                </div>
              )}
            </form>
          </div>

          {/* Milestones Card */}
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <IconAward className="w-4.5 h-4.5 text-amber-500" />
              <h4 className="font-display font-bold text-[#0b1c30] text-sm">
                Logros y Hitos
              </h4>
            </div>

            <ul className="space-y-3">
              {milestones.map((milestone, idx) => (
                <li
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    milestone.unlocked
                      ? "bg-emerald-50/50 border-emerald-100/70 text-emerald-900"
                      : "bg-gray-50/50 border-gray-100 text-gray-400"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">
                      {milestone.label}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-semibold">
                      Objetivo: $
                      {milestone.value.toLocaleString("es-ES", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  {milestone.unlocked ? (
                    <span className="bg-emerald-500 text-white p-1 rounded-full text-[10px]">
                      <IconCheck className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-gray-250 shrink-0" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Integration details */}
          <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <IconShield className="w-4 h-4 text-[#006a61]" />
              <h5 className="text-xs font-bold text-[#0b1c30]">
                Canal Seguro de FinancIA!
              </h5>
            </div>
            <p className="font-sans text-[11px] text-gray-400 leading-relaxed">
              Las sugerencias se calculan en base a los excedentes actuales de tus presupuestos.
              Tu meta y tus ahorros se sincronizan de forma segura con el servidor backend en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
