import { useNavigate } from "react-router";
import { IconSparkles, IconArrowRight, IconLoader } from "@tabler/icons-react";
import { useFinancesStore } from "../../../store/finances.store.ts";

export function BudgetAiTips() {
  const { startChatWithPrompt, loadingTips } = useFinancesStore();
  const navigate = useNavigate();

  const handleStartChat = async () => {
    try {
      const chatId = await startChatWithPrompt("budget_tips");
      if (chatId) {
        navigate(`/dashboard/chat/${chatId}`);
      }
    } catch (error) {
      console.error("Error creating budget tips chat:", error);
    }
  };

  return (
    <div className="bg-[#131b2e] text-white p-6 md:p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden group border border-teal-500/10 hover:border-teal-500/20 transition-all duration-300">
      {/* Decorative glowing gradient elements */}
      <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 w-48 h-48 bg-gradient-to-br from-teal-500/10 to-teal-500/20 rounded-full blur-3xl group-hover:from-teal-500/20 group-hover:to-teal-500/30 transition-all duration-500 pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-300 border border-teal-500/20 shadow-inner">
              <IconSparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="font-display font-bold text-base text-white tracking-wide">
              Consejos de Presupuesto con IA
            </h3>
          </div>
          
          <p className="font-sans text-xs md:text-sm text-gray-300 leading-relaxed">
            Inicia una sesión de consultoría financiera inteligente con <strong className="text-teal-300 font-semibold">FinancIA!</strong>. 
            Analizaremos tus límites semanales, metas de ahorro activas y transacciones recientes para darte recomendaciones personalizadas y accionables directamente en una nueva conversación interactiva.
          </p>
        </div>

        <button
          onClick={handleStartChat}
          disabled={loadingTips}
          className="px-6 py-3.5 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-[#0b1c30] font-sans text-xs md:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-500/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none shrink-0"
        >
          {loadingTips ? (
            <>
              <IconLoader className="w-4 h-4 md:w-5 h-5 animate-spin" />
              <span>Analizando finanzas...</span>
            </>
          ) : (
            <>
              <span>Obtener Consejos en el Chat</span>
              <IconArrowRight className="w-4 h-4 md:w-5 h-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
