"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, RefreshCw } from "lucide-react";
import type {
  ChatMessage,
  ChatResponse,
  CatProfile,
  CareRoutine,
  NextAction,
} from "@/types/catlife";
import { DEFAULT_CAT_PROFILE, DEFAULT_CARE_ROUTINE } from "@/types/catlife";

interface CatChatProps {
  onProfileUpdate: (profile: Partial<CatProfile>, routine: Partial<CareRoutine>) => void;
  onPhotoRequested: () => void;
  onReadyForSimulation: () => void;
  catProfile: CatProfile;
  careRoutine: CareRoutine;
  photoAnalysis?: { mismatchDetected?: boolean; mismatchMessage?: string } | null;
}

export function CatChat({
  onProfileUpdate,
  onPhotoRequested,
  onReadyForSimulation,
  catProfile,
  careRoutine,
  photoAnalysis,
}: CatChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = useCallback(async () => {
    setHasStarted(true);
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/catlife/chat");
      const data: ChatResponse = await response.json();
      setMessages([{ role: "assistant", content: data.assistantMessage, timestamp: Date.now() }]);
    } catch {
      setMessages([{ role: "assistant", content: "Hey there! 👋 Let's learn about your cat. What's their name?", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const mismatchMsg = photoAnalysis?.mismatchMessage;
    if (photoAnalysis?.mismatchDetected && mismatchMsg) {
      setMessages((prev) => [...prev, { role: "assistant" as const, content: mismatchMsg, timestamp: Date.now() }]);
    }
  }, [photoAnalysis]);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { role: "user", content: userMessage, timestamp: Date.now() };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/catlife/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newUserMessage], catProfile, careRoutine }),
      });

      const data: ChatResponse = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.assistantMessage, timestamp: Date.now() }]);

      if (data.updates) {
        const profileUpdates: Partial<CatProfile> = {};
        const routineUpdates: Partial<CareRoutine> = {};

        if (data.updates.catProfile) {
          for (const [key, fieldData] of Object.entries(data.updates.catProfile)) {
            if (fieldData && typeof fieldData === "object" && "value" in fieldData) {
              (profileUpdates as Record<string, unknown>)[key] = fieldData.value;
            }
          }
        }

        if (data.updates.careRoutine) {
          for (const [key, fieldData] of Object.entries(data.updates.careRoutine)) {
            if (fieldData && typeof fieldData === "object" && "value" in fieldData) {
              (routineUpdates as Record<string, unknown>)[key] = fieldData.value;
            }
          }
        }

        if (Object.keys(profileUpdates).length > 0 || Object.keys(routineUpdates).length > 0) {
          onProfileUpdate(profileUpdates, routineUpdates);
        }
      }

      handleNextAction(data.nextAction);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops! I had a little hiccup. Could you try that again?", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextAction = (action: NextAction) => {
    if (action === "request_photo") setTimeout(onPhotoRequested, 500);
    else if (action === "ready_for_simulation") setTimeout(onReadyForSimulation, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const resetChat = () => {
    setMessages([]);
    setHasStarted(false);
    onProfileUpdate(DEFAULT_CAT_PROFILE, DEFAULT_CARE_ROUTINE);
  };

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-4">
          <span className="text-5xl">🐱</span>
        </motion.div>
        <h2 className="text-lg font-bold text-amber-900 mb-2">Let's learn about your cat!</h2>
        <p className="text-amber-700 mb-4 text-sm max-w-xs">
          I'll ask questions to understand your cat, then simulate their health journey.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startChat}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-lg text-sm"
        >
          Start Chat
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🐱</span>
          <span className="font-semibold text-amber-900 text-sm">CatLife Coach</span>
        </div>
        <button
          onClick={resetChat}
          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-full"
          title="Start over"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-sm"
                    : "bg-white border border-amber-200 text-amber-900 rounded-bl-sm shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap text-xs leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border border-amber-200 px-3 py-2 rounded-xl rounded-bl-sm shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-amber-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell me about your cat..."
            className="flex-1 px-3 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-md disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
