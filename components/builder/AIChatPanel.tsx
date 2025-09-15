/**
 * Amaç: Builder içinde kullanıcıdan doğal dil prompt alıp AI üretimini tetikleyen sohbet paneli.
 * Props (özet): messages/prompt/isGenerating + set*; generationMode, stylePreset, temperature kontrolü.
 * Not: Üretim mantığı üst bileşende; bu panel yalnızca UI/etkileşim katmanıdır.
 */
// AIChatPanel: Builder içindeki sohbet paneli.
// Amaç: Kullanıcının doğal dil girdisini almak, ayarları (stil preset, sıcaklık)
// yönetmek ve AI yanıtlarını mesajlar halinde göstermek.
// Not: Bu bileşen yalnızca UI/etkileşim katmanı; asıl üretim mantığı üst seviye handleGenerate ile tetiklenir.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Zap, Send } from "lucide-react";
import Image from "next/image";
import { Message } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Dışarıdan beklenen props: üst bileşen state'lerini buraya enjekte eder.
interface AIChatPanelProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  isGenerating: boolean;
  handleGenerate: () => void;
  generationMode: "full" | "sections";
  setGenerationMode: (mode: "full" | "sections") => void;
  stylePreset: "minimal" | "brand" | "dark" | "glass";
  setStylePreset: (p: "minimal" | "brand" | "dark" | "glass") => void;
  temperature: number;
  setTemperature: (t: number) => void;
}

export function AIChatPanel({ messages, setMessages, prompt, setPrompt, isGenerating, handleGenerate, generationMode, setGenerationMode, stylePreset, setStylePreset, temperature, setTemperature }: AIChatPanelProps) {
  return (
    // Dış kabuk: sabit koyu stil, blur ve gölge efektleri
    <Card className="h-full min-h-0 bg-[#1E293B]/95 backdrop-blur-2xl border-slate-700/50 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col">
      <div className="p-4 border-b border-slate-700/50 sticky top-0 z-10 bg-[#1E293B]/95 backdrop-blur-2xl">
        {/* Başlık alanı: Bot rozeti + durum */}
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
              Aktif
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Stil preset seçimi: üretim stilini (system prompt ipuçlarını) etkiler */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Stil Preseti</label>
              <Select value={stylePreset} onValueChange={(v) => setStylePreset(v as any)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-[#F8FAFC]">
                  <SelectValue placeholder="Minimal" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-slate-100 border-slate-700">
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="glass">Glass</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Sıcaklık: 0 (deterministik) → 1 (yaratıcı). Model sampling'ini etkiler */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300">Yaratıcılık (Sıcaklık)</label>
                <span className="text-xs text-slate-400">{temperature.toFixed(2)}</span>
              </div>
              <Slider
                value={[temperature]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={(vals) => setTemperature(vals[0])}
              />
            </div>
          </div>
          {/* Mesaj listesi: kullanıcı ve AI balonları */}
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
          {/* Üretim sürerken: tipik "yazıyor" animasyonu */}
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
        {/* Alt aksiyon bölgesi: hızlı örnekler + prompt girişi + gönder */}
        {/* Üretim modu toggle kaldırıldı; tek mod (sections) kullanılacak */}
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-3 flex items-center">
            <Image src="/technology.png" alt="Logo" width={12} height={12} className="mr-1" />
            Hızlı başlangıç örnekleri:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {/* Tek tıkla prompt doldurur; kullanıcı düzenleyip gönderebilir */}
            {["Login formu", "Navbar oluştur", ].map((example) => (
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
            // Enter ile üretimi tetikle (tek satır input)
            onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:from-indigo-600 hover:to-cyan-600 hover:scale-105 transition-all duration-200 shadow-lg shadow-indigo-500/25"
          >
            {isGenerating ? (
              <div className="animate-spin">
                <Image src="/technology.png" alt="Yükleniyor" width={16} height={16} />
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