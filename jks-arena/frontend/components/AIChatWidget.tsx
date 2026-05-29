"use client";

import React, { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User as UserIcon } from "lucide-react";
import { API_BASE_URL, getToken } from "@/lib/apiClient";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    // Only grab token on client side to prevent hydration mismatch
    setToken(getToken());
  }, [isOpen]); // Refresh token when opening in case they logged in

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: `${API_BASE_URL}/api/ai/chat`,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      onError: (error) => {
        console.error("Chat error:", error);
      },
    });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] flex flex-col bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            style={{ viewTransitionName: "chat-widget" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#ff4500]/20 to-[#ff8c00]/20 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff4500] to-[#ff8c00] flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">JKS Support</h3>
                  <p className="text-[#ff4500] text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff4500]/20 to-[#ff8c00]/20 flex items-center justify-center text-[#ff4500] mb-2">
                    <Bot size={32} />
                  </div>
                  <h4 className="text-white font-medium">Welcome to JKS Arena!</h4>
                  <p className="text-white/50 text-sm">
                    I can help you check rig availability, view your bookings, or answer any questions.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        m.role === "user"
                          ? "bg-white/10 text-white"
                          : "bg-gradient-to-tr from-[#ff4500] to-[#ff8c00] text-white"
                      }`}
                    >
                      {m.role === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${
                        m.role === "user"
                          ? "bg-[#ff4500] text-white rounded-tr-none"
                          : "bg-white/5 text-white/90 rounded-tl-none border border-white/5"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff4500] to-[#ff8c00] flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/5 text-white/90 rounded-tl-none border border-white/5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/40 border-t border-white/5">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1.5 focus-within:border-[#ff4500]/50 focus-within:bg-white/10 transition-colors"
              >
                <input
                  value={input || ""}
                  onChange={handleInputChange}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none text-white text-sm px-3 focus:outline-none placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={!(input || "").trim() || isLoading}
                  className="w-8 h-8 rounded-full bg-[#ff4500] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ff5500] transition-colors"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ff4500] to-[#ff8c00] text-white shadow-[0_0_20px_rgba(255,69,0,0.4)] flex items-center justify-center transition-shadow hover:shadow-[0_0_30px_rgba(255,69,0,0.6)]"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
