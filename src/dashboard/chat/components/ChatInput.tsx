import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  IconPaperclip,
  IconMicrophone,
  IconArrowNarrowUp,
} from "@tabler/icons-react";
import { useFinancesStore } from "../../../store/finances.store.ts";

export function ChatInput({ newChat, chatId }: { newChat?: boolean; chatId?: string }) {
  const { chatHistory, sendMessage, isGenerating } = useFinancesStore();
  const [inputText, setInputText] = useState("");
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText("");
    if (newChat) {
      const newChatId = `chat-${Date.now()}`;
      await sendMessage(textToSend, newChatId);
      navigate(`/dashboard/chat/${newChatId}`);
    } else {
      await sendMessage(textToSend, chatId);
    }
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
    <>
      <section
        className={` ${newChat ? "flex justify-center" : "fixed bottom-0 border-t border-gray-200/50 flex-1"} w-full bg-white px-5 py-4`}
      >
        <div
          className={`flex items-end gap-3  mx-auto ${newChat ? "rounded-full bg-grayteal-100 px-6 py-5 w-lg" : "max-w-4xl"}`}
        >
          <button className="p-3 text-gray-500 hover:text-[#006a61] bg-[#eff4ff] hover:bg-teal-50 rounded-full transition-all shrink-0 flex items-center justify-center h-12 w-12 border border-gray-200">
            <IconPaperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex items-end min-h-12 shadow-sm focus-within:border-[#006a61] focus-within:ring-1 focus-within:ring-[#006a61] transition-all">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 font-sans text-sm text-[#0b1c30] max-h-32 overflow-y-auto no-scrollbar outline-none"
              placeholder="Mensaje a FinancIA!..."
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
            disabled={isGenerating || !inputText.trim()}
            className="bg-[#006a61] text-white hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-[#006a61] p-3 rounded-full transition-all shrink-0 flex items-center justify-center h-12 w-12 shadow-md"
          >
            <IconArrowNarrowUp className="w-5 h-5" />
          </button>
        </div>
      </section>
    </>
  );
}
