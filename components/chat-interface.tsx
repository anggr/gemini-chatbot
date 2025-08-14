"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Bot, User, AlertCircle, Copy, Check, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ApiError {
  error: string;
  setup?: {
    message: string;
    steps: string[];
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Gemini AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Prepare chat history (exclude the welcome message)
      const chatHistory = messages.slice(1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: chatHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data as ApiError);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError({
        error:
          "Network error occurred. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your Gemini AI assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isScrolledToBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    setIsAtBottom(isScrolledToBottom);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
    }
  };

  return (
    <Card className="h-[500px] sm:h-[600px] flex flex-col max-w-full bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 border-0 shadow-2xl backdrop-blur-sm">
      <div className="p-3 sm:p-4 border-b border-white/20 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-indigo-600/80 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <h3 className="font-bold text-base sm:text-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Chat with Gemini ✨
              </h3>
            </div>
            <p className="text-xs text-purple-100 hidden sm:block animate-fade-in">
              Ask questions, get insights, and explore ideas 🚀
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="ml-2 flex-shrink-0 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105">
            Clear Chat
          </Button>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-30 animate-pulse"></div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-2 sm:p-3 border-b flex-shrink-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{error.error}</p>
                {error.setup && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">{error.setup.message}</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {error.setup.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex-1 relative min-h-0">
        <div
          ref={messagesContainerRef}
          className="h-full overflow-y-auto overflow-x-hidden p-2 sm:p-3 scroll-smooth"
          onScroll={handleScroll}>
          <div className="space-y-2 sm:space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 w-full ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`flex gap-2 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] min-w-0 animate-fade-in-up ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}>
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 text-white animate-pulse"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300"
                    }`}>
                    {message.role === "user" ? (
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 animate-bounce" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div
                      className={`rounded-xl p-2 sm:p-3 min-w-0 overflow-hidden shadow-lg backdrop-blur-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 text-white border border-white/20"
                          : "bg-white/80 dark:bg-gray-800/80 text-foreground border border-gray-200/50 dark:border-gray-700/50"
                      }`}>
                      <p className="text-xs sm:text-sm leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap" style={{wordBreak: 'break-all'}}>
                        {message.content}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs text-muted-foreground ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}>
                      <span className="text-xs">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-muted flex-shrink-0"
                          onClick={() =>
                            copyToClipboard(message.content, message.id)
                          }>
                          {copiedId === message.id ? (
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start animate-fade-in">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-lg animate-pulse">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300 animate-spin" />
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 sm:p-3 border border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {!isAtBottom && (
          <Button
            onClick={scrollToBottom}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 shadow-xl z-10 transition-all duration-300 hover:scale-110 animate-bounce"
            size="sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </Button>
        )}
      </div>

      <div className="p-3 sm:p-4 border-t border-white/20 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900/50 dark:via-purple-900/10 dark:to-indigo-900/10 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message... ✨"
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 text-sm bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 rounded-xl px-3 py-2 shadow-lg backdrop-blur-sm transition-all duration-300 focus:shadow-xl focus:scale-[1.02] placeholder:text-gray-400"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 flex-shrink-0 px-3 py-2 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center animate-pulse">
          ✨ Powered by Google Gemini Pro 🚀
        </p>
      </div>
    </Card>
  );
}
