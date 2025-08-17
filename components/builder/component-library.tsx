"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraggableComponent {
  type: string
  name: string
  icon: React.ReactNode
}

const components: DraggableComponent[] = [
  { type: "button", name: "Buton", icon: <Button className="w-full h-8">Buton</Button> },
  { type: "text", name: "Metin", icon: <p className="text-sm text-slate-300">Metin</p> },
  {
    type: "input",
    name: "Input",
    icon: <input className="w-full h-8 border rounded px-2 bg-slate-800 text-slate-300" placeholder="Input" />,
  },
  {
    type: "card",
    name: "Kart",
    icon: (
      <div className="w-full p-2 border rounded shadow-sm bg-slate-800 border-slate-600">
        <h4 className="font-semibold text-sm text-slate-300">Kart</h4>
        <p className="text-xs text-slate-400">İçerik</p>
      </div>
    ),
  },
]

export function ComponentLibrary({ className }: { className?: string }) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType)
  }

  return (
    <Card
      className={cn(
        "bg-[#1E293B]/95 backdrop-blur-2xl border-slate-700/50 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col",
        className,
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-[#F8FAFC] text-lg flex items-center">
          <LayoutGrid className="w-5 h-5 mr-2 text-[#06B6D4]" />
          Quantum Bileşen Kütüphanesi
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 p-4">
        {components.map((comp) => (
          <div
            key={comp.type}
            draggable
            onDragStart={(e) => handleDragStart(e, comp.type)}
            className="cursor-grab active:cursor-grabbing bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-700/50 transition-colors shadow-md hover:scale-105 duration-200"
          >
            <div className="w-full h-12 flex items-center justify-center rounded-md bg-slate-900/50 border border-slate-600/50 text-slate-300 text-xs overflow-hidden">
              {comp.icon}
            </div>
            <span className="text-slate-300 text-sm font-medium flex items-center">
              <Cpu className="w-3 h-3 mr-1 text-[#F59E0B]" />
              {comp.name}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
