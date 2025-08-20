import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Brain, Zap, Send } from "lucide-react";
import { Message } from "@/lib/types";

interface AIChatPanelProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  isGenerating: boolean;
  handleGenerate: () => void;
  generationMode: "full" | "sections";
  setGenerationMode: (mode: "full" | "sections") => void;
}

export function AIChatPanel({ messages, setMessages, prompt, setPrompt, isGenerating, handleGenerate, generationMode, setGenerationMode }: AIChatPanelProps) {
  return (
    <Card className="flex-1 bg-[#1E293B]/95 backdrop-blur-2xl border-slate-700/50 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/25">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#06B6D4] rounded-full border-2 border-[#1E293B] animate-ping"></div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#F8FAFC]">AI Asistan</h2>
            <p className="text-sm text-slate-400 flex items-center">
              <span className="w-2 h-2 bg-[#06B6D4] rounded-full mr-2 animate-pulse"></span>
              Quantum Aktif
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            >
              <div className={`max-w-[85%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                <div
                  className={`flex items-start space-x-3 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-[#06B6D4] to-[#0891B2]"
                        : "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-[#06B6D4]/90 to-[#0891B2]/90 text-white"
                        : "bg-slate-800/70 text-[#F8FAFC] border border-slate-700/50"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#06B6D4] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-700/50">
        {/* Üretim modu toggle kaldırıldı; tek mod (sections) kullanılacak */}
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-3 flex items-center">
            <Brain className="w-3 h-3 mr-1" />
            Hızlı başlangıç örnekleri:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {["Login formu", "Hero section", "Navbar oluştur", "Pricing kartları"].map((example) => (
              <Button
                key={example}
                size="sm"
                variant="outline"
                className="text-xs bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:scale-105 transition-all duration-200 justify-start"
                onClick={() => setPrompt(example)}
              >
                <Zap className="w-3 h-3 mr-2" />
                {example}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Hangi bileşeni oluşturmak istiyorsun?"
            className="bg-slate-800/50 border-slate-700/50 text-[#F8FAFC] placeholder:text-slate-400 focus:bg-slate-800/70 focus:border-[#6366F1] transition-all backdrop-blur-sm"
            onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:from-indigo-600 hover:to-cyan-600 hover:scale-105 transition-all duration-200 shadow-lg shadow-indigo-500/25"
          >
            {isGenerating ? (
              <div className="animate-spin">
                <Brain className="w-4 h-4" />
              </div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}