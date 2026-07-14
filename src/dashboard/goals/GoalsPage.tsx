import { useState } from "react";
import { IconPig, IconCheck, IconShield } from "@tabler/icons-react";
import { useFinancesStore } from "../../store/finances.store";
import { useAuthStore } from "../../store/auth.store";

export function Goals() {
  const { savings, depositSavings, resetSavings } = useFinancesStore();
  const user = useAuthStore((state) => state.user);
  const [depositAmount, setDepositAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Toggles simulation
  const [notifications, setNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [aiProactive, setAiProactive] = useState(true);

  const percent = Math.min(100, (savings.current / savings.target) * 100);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      depositSavings(amount);
      setSuccessMessage(`¡Has depositado $${amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con éxito!`);
      setDepositAmount("");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      {/* Profile Header */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img
          alt="Professional headshot avatar"
          className="w-20 h-20 rounded-full object-cover border-4 border-teal-500 shadow-sm shrink-0"
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
        />
        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <h3 className="font-display font-bold text-[#0b1c30] text-xl">
              {user?.name || "Socio FinancIA! Pro"}
            </h3>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-[#86f2e4]/30 text-[#006f66] px-2 py-0.5 rounded-full self-center">
              IA Activa
            </span>
          </div>
          <p className="font-sans text-xs text-gray-500">
            {user?.email || "diogoalipazaga@gmail.com"}
          </p>
          <p className="font-sans text-xs font-semibold text-gray-400 mt-2 block">
            Planificador financiero premium conectado de forma segura.
          </p>
        </div>
      </div>

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
              Restan $
              {(savings.target - savings.current).toLocaleString("es-ES", {
                minimumFractionDigits: 2,
              })}
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
            className="w-full sm:w-auto px-5 py-2.5 bg-[#006a61] hover:bg-teal-700 text-white font-sans text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            Depositar en Ahorros
          </button>
          <button
            onClick={resetSavings}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-sans text-xs font-semibold rounded-xl transition-colors"
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

      {/* Preferences / Settings toggles */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
        <h4 className="font-display font-bold text-[#0b1c30] text-sm pb-2 border-b border-gray-100">
          Preferencias de Alertas e IA
        </h4>

        <div className="space-y-4">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#0b1c30] block">
                Notificaciones diarias de saldo
              </span>
              <span className="text-[11px] text-gray-400 block">
                Mantente al tanto de tus movimientos bancarios.
              </span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${notifications ? "bg-[#006a61]" : "bg-gray-200"
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute ${notifications ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Report toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#0b1c30] block">
                Reportes de ahorro los fines de semana
              </span>
              <span className="text-[11px] text-gray-400 block">
                Recibe gráficos semanales de tu salud de gasto.
              </span>
            </div>
            <button
              onClick={() => setWeeklyReport(!weeklyReport)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${weeklyReport ? "bg-[#006a61]" : "bg-gray-200"
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute ${weeklyReport ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* AI proactive toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#0b1c30] block">
                IA Proactiva de FinancIA!
              </span>
              <span className="text-[11px] text-gray-400 block">
                Permite sugerencias automatizadas de transferencias de
                excedente.
              </span>
            </div>
            <button
              onClick={() => setAiProactive(!aiProactive)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${aiProactive ? "bg-[#006a61]" : "bg-gray-200"
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute ${aiProactive ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Integration details */}
      <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <IconShield className="w-4 h-4 text-teal-600" />
          <h5 className="text-xs font-bold text-[#0b1c30]">
            Canal Seguro de FinancIA!
          </h5>
        </div>
        <p className="font-sans text-xs text-gray-500 leading-relaxed">
          Hemos actualizado el flujo de consultas de Gemini a nuestro enfoque
          recomendado para aplicaciones de pila completa (Full-stack). Tu clave
          de API se puede configurar cómodamente en el panel **Settings &gt;
          Secrets** para gozar de respuestas inteligentes inmediatas. En
          ausencia de la clave, FinancIA! funciona mediante un motor inteligente
          local.
        </p>
      </div>
    </div>
  );
}
