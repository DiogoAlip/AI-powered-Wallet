import { useRef, useEffect } from "react";
import { getCategoryIcon } from "../../helpers/getCategoryIcon.tsx";
import { IconRobot, IconInfoCircle } from "@tabler/icons-react";
import { useFinancesStore } from "../../../store/finances.store.ts";
import { ChatInput } from "../components/ChatInput.tsx";

export function Chat() {
  const { chatHistory, applyAction, isGenerating } = useFinancesStore();
  // const [quickExpenseText, setQuickExpenseText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  //
  // const handleQuickExpenseSubmit = async () => {
  //   if (!quickExpenseText.trim()) return;
  //   const textToSend = quickExpenseText;
  //   setQuickExpenseText("");
  //   await onSendMessage(textToSend);
  // };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] h-full bg-gray-50 overflow-hidden">
      {/* Quick Entry Section */}

      <section className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 flex flex-col relative">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-3xl ${
              msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
            }`}
          >
            {/* Avatar */}
            {msg.sender === "ai" ? (
              <div className="w-10 h-10 rounded-full bg-[#86f2e4]/30 flex items-center justify-center shrink-0 border border-[#006a61]/20">
                <IconRobot className="w-5 h-5 text-[#006f66]" />
              </div>
            ) : (
              <img
                alt="User profile avatar"
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
              />
            )}

            <div
              className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <span className="font-sans text-xs text-gray-500 px-1">
                {msg.sender === "ai" ? "FinancIA!" : "Tú"} • {msg.timestamp}
              </span>

              <div
                className={`rounded-2xl p-4 shadow-sm relative overflow-hidden max-w-full ${
                  msg.sender === "ai"
                    ? "bg-white border border-gray-100 rounded-tl-none"
                    : "bg-[#131b2e] text-white rounded-tr-none"
                }`}
              >
                <p className="font-sans text-sm leading-relaxed">{msg.text}</p>

                {msg.transactionDetail && (
                  <div className="mt-3 flex items-center justify-between bg-[#eff4ff] p-3 rounded-xl border border-gray-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200">
                        {getCategoryIcon(msg.transactionDetail.category)}
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-sm text-[#0b1c30]">
                          {msg.transactionDetail.merchant}
                        </h4>
                        <p className="font-sans text-xs text-gray-500">
                          {msg.transactionDetail.category} •{" "}
                          {msg.transactionDetail.account}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-sans font-bold text-sm ${
                        msg.transactionDetail.type === "expense"
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {msg.transactionDetail.type === "expense" ? "-" : "+"}$
                      {msg.transactionDetail.amount.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                {msg.infoText && (
                  <div className="mt-3 flex items-center gap-2 bg-teal-50 p-2.5 rounded-lg border border-teal-100">
                    <IconInfoCircle className="w-4 h-4 text-[#006a61] shrink-0" />
                    <span className="font-sans text-xs text-[#0b1c30]">
                      {msg.infoText}
                    </span>
                  </div>
                )}

                {msg.actionChips && msg.actionChips.length > 0 && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {msg.actionChips.map((chip) => (
                      <button
                        key={chip.actionId}
                        onClick={() => applyAction(chip.actionId, msg.id)}
                        className={`font-sans text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                          chip.actionId === "move_to_savings" ||
                          chip.actionId === "move_to_savings_quick"
                            ? "text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100"
                            : "text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-start gap-3 self-start max-w-3xl">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 border border-teal-200 animate-pulse">
              <IconRobot className="w-5 h-5 text-teal-700" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans text-xs text-gray-500 px-1">
                FinancIA! está pensando...
              </span>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                <span
                  className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </section>

      <ChatInput />
    </div>
  );
}
