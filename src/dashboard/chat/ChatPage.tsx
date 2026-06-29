import React, { useState, useRef, useEffect } from "react";
import { getCategoryIcon } from "../helpers/getCategoryIcon.tsx";
import {
  IconRobot,
  // IconSend,
  IconPaperclip,
  IconMicrophone,
  // IconCircleArrowUp,
  IconArrowNarrowUp,
  IconInfoCircle,
  // IconSparkles,
  IconToolsKitchen2,
  IconCar,
  IconShoppingBag,
  IconReceipt2,
  IconTag,
  IconHelp,
  // IconCheck,
} from "@tabler/icons-react";
import type {
  ChatMessage,
  // Transaction,
  // Budget,
  // SavingsGoal,
} from "../types/ChatTypes.ts";

interface ChatTabProps {
  chatHistory: ChatMessage[];
  // onSendMessage: (text: string) => Promise<void>;
  // onApplyAction: (actionId: string, messageId: string) => void;
  // isGenerating: boolean;
}

export function Chat({
  chatHistory,
  // onSendMessage,
  // onApplyAction,
  // isGenerating,
}: ChatTabProps) {
  const [inputText, setInputText] = useState("");
  // const [quickExpenseText, setQuickExpenseText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [chatHistory, isGenerating]);
  //
  const handleSend = async () => {
    if (!inputText.trim()) return;
    // const textToSend = inputText;
    setInputText("");
    // await onSendMessage(textToSend);
  };
  //
  // const handleQuickExpenseSubmit = async () => {
  //   if (!quickExpenseText.trim()) return;
  //   const textToSend = quickExpenseText;
  //   setQuickExpenseText("");
  //   await onSendMessage(textToSend);
  // };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9ff] overflow-hidden">
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
                src="https://lh3.googleusercontent.com/aida/AP1WRLtk8gk9Zx8Q3SULN3nwj9jdV3tialt8H8Scjq5j7X2SLeODxAEEyn91_jipoiXPUsaBNo_w0LrgRMv1J1o7LO4gQuc1B-GSyMWhVSW046PHTShJJk1UUJ5s5hwHvwuJ0k7VcfCEkmhiAXidI0kovPfm2I4ylR337t84TNUbxRekw_p7IVxip2YnAmge16lvifke3mvIu_rqzG6_zdOucxF7ns22yi2xOEGdRyia6K79JJmSf9KspPlC3UHX"
              />
            )}

            <div
              className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <span className="font-sans text-xs text-gray-500 px-1">
                {msg.sender === "ai" ? "SpendWise AI" : "Tú"} • {msg.timestamp}
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
                      {msg.transactionDetail.amount.toFixed(2)}
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
                        // onClick={() => onApplyAction(chip.actionId, msg.id)}
                        className={`font-sans text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                          chip.actionId === "move_to_savings"
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

        {
          //isGenerating
          true && (
            <div className="flex items-start gap-3 self-start max-w-3xl">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 border border-teal-200 animate-pulse">
                <IconRobot className="w-5 h-5 text-teal-700" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-xs text-gray-500 px-1">
                  SpendWise AI está pensando...
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
          )
        }

        <div ref={chatEndRef} />
      </section>

      <section className="bg-white border-t border-gray-200/50 px-5 py-4">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <button className="p-3 text-gray-500 hover:text-[#006a61] bg-[#eff4ff] hover:bg-teal-50 rounded-full transition-all shrink-0 flex items-center justify-center h-12 w-12 border border-gray-200">
            <IconPaperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex items-end min-h-12 shadow-sm focus-within:border-[#006a61] focus-within:ring-1 focus-within:ring-[#006a61] transition-all">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 font-sans text-sm text-[#0b1c30] max-h-32 overflow-y-auto no-scrollbar outline-none"
              placeholder="Mensaje a SpendWise AI..."
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ minHeight: "48px" }}
            />
            <button className="p-3 text-gray-400 hover:text-teal-600 transition-colors mb-0.5">
              <IconMicrophone className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSend}
            // disabled={isGenerating || !inputText.trim()}
            className="bg-[#006a61] text-white hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-[#006a61] p-3 rounded-full transition-all shrink-0 flex items-center justify-center h-12 w-12 shadow-md"
          >
            <IconArrowNarrowUp className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
