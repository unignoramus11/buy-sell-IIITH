"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useChat } from "@/hooks/use-chat";

const CHATBOT_NAME = "MarketMate";

export default function ChatPage() {
  const { messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-8rem-16px)]">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-lg"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-8 w-8 text-blue-500" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {CHATBOT_NAME}
              </h2>
              <p className="text-sm text-gray-600">
                Your friendly marketplace assistant
              </p>
            </div>
          </div>
        </div>

        <ScrollArea
          ref={scrollRef}
          className="flex-1 p-6 space-y-6 overflow-y-auto"
        >
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex items-start gap-4 mb-6 ${
                    message.role === "assistant"
                      ? "flex-row"
                      : "flex-row-reverse"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`p-2 rounded-xl ${
                      message.role === "assistant"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-6 w-6" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </motion.div>
                  <div
                    className={`flex-1 space-y-2 ${
                      message.role === "user" ? "text-right" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-700">
                      {message.role === "assistant" ? CHATBOT_NAME : "You"}
                    </p>
                    <div
                      className={`inline-block p-4 rounded-2xl ${
                        message.role === "assistant"
                          ? "bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <TextGenerateEffect
                          words={message.content}
                          duration={0.5}
                        />
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-gray-600"
              >
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">
                    {CHATBOT_NAME} is thinking...
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <motion.form
          onSubmit={handleSubmit}
          className="p-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50"
        >
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="AMA..."
              className="flex-1 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
