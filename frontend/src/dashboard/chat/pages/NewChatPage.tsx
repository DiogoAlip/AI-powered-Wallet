import { useNavigate } from "react-router";
import { useFinancesStore } from "../../../store/finances.store.ts";
import { ChatInput } from "../components/ChatInput.tsx";
import { randomWelcomePhrase } from "../helper/randomWelcomPhrases.ts";
import { IconMessage, IconSparkles } from "@tabler/icons-react";

export const NewChat = () => {
  const { chatSessions } = useFinancesStore();
  const navigate = useNavigate();
  const welcomePhrase = randomWelcomePhrase();

  const getSessionLabel = (sessionId: string, idx: number) => {
    if (sessionId === "chat-1") return "Demostración FinancIA!";
    if (sessionId === "chat-welcome") return "Bienvenida";
    if (sessionId.startsWith("chat-")) {
      const ts = parseInt(sessionId.split("-")[1]);
      if (!isNaN(ts)) {
        const d = new Date(ts);
        return `${d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
      }
    }
    return `Conversación #${idx + 1}`;
  };

  return (
    <div className="animate-fade-in-up flex flex-col items-center max-w-4xl mx-auto px-4 w-full">
      {/* Welcome Title */}
      <div className="text-center mt-12 md:mt-24 mb-8">
        <h1 className="text-2xl md:text-3xl font-light text-gray-800 tracking-tight flex items-center justify-center gap-2">
          <IconSparkles className="w-6 h-6 text-teal-600 animate-pulse" />
          {welcomePhrase}
        </h1>
        <p className="text-xs text-gray-500 mt-2">
          Escribe un mensaje abajo para iniciar un nuevo análisis de gastos en lenguaje natural.
        </p>
      </div>

      {/* Recent Chats Section */}
      {chatSessions.length > 0 && (
        <div className="w-full max-w-2xl mb-8 space-y-3">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 text-center">
            Conversaciones Recientes
          </h3>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            {chatSessions.map((sessionId, idx) => (
              <button
                key={sessionId}
                type="button"
                onClick={() => navigate(`/dashboard/chat/${sessionId}`)}
                className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-teal-500 hover:shadow-md transition-all text-left cursor-pointer group w-full sm:w-[calc(50%-6px)] max-w-sm"
              >
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <IconMessage className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-sans font-semibold text-sm text-[#0b1c30] truncate">
                    {getSessionLabel(sessionId, idx)}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Haga clic para ver el historial
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="w-full max-w-4xl">
        <ChatInput newChat={true} />
      </div>
    </div>
  );
};
