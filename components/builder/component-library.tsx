"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutGrid, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraggableComponent {
  type: string
  name: string
  icon: React.ReactNode
}

const components: DraggableComponent[] = [
  { type: "button", name: "Buton", icon: <span className="text-[11px] text-slate-200">Btn</span> },
  { type: "text", name: "Metin", icon: <span className="text-[11px] text-slate-200">Metin</span> },
  { type: "input", name: "Input", icon: <span className="text-[11px] text-slate-200">Input</span> },
  { type: "card", name: "Kart", icon: <span className="text-[11px] text-slate-200">Kart</span> },
  { type: "text", name: "Başlık", icon: <span className="text-[11px] text-slate-200 font-medium">H1</span> },
  { type: "text", name: "Etiket", icon: <span className="text-[11px] text-slate-200">Etiket</span> },
]

export function ComponentLibrary({ className }: { className?: string }) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType)
  }

  return (
    <Card
      className={cn(
        "bg-[#1E293B]/95 backdrop-blur-4xl border-slate-700/50 shadow-2xl transition-all duration-250 flex flex-col",
        className,
      )}
    >
      <CardContent className="flex-1 p-1 overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="shrink-0 text-[#F8FAFC] text-sm font-medium flex items-center whitespace-nowrap">
            <LayoutGrid className="w-6 h-6 mr-2 text-[#06B6D4]" />
            Bileşen Kütüphanesi
          </div>
          <div className="flex-1 flex flex-wrap items-center gap-2 overflow-hidden">
            {components.map((comp, idx) => (
              <div
                key={`${comp.type}-${comp.name}-${idx}`}
                draggable
                onDragStart={(e) => handleDragStart(e, comp.type)}
                className="cursor-grab active:cursor-grabbing bg-slate-800/60 border border-slate-700/50 rounded-md px-4 h-12 flex items-center gap-2 hover:bg-slate-700/60 transition-colors shadow-sm"
                title={comp.name}
              >
                <div className="flex items-center justify-center rounded bg-slate-900/50 border border-slate-600/50 text-slate-300 text-[12px] h-7 w-20">
                  {comp.icon}
                </div>
                <span className="text-slate-200 text-[12px] font-medium flex items-center whitespace-nowrap leading-none">
                  <Cpu className="w-3 h-3 mr-1 text-[#F59E0B] shrink-0" />
                  {comp.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
