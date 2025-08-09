"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraggableComponent {
  type: string
  name: string
  icon: React.ReactNode
}

const components: DraggableComponent[] = [
  { type: "button", name: "Buton", icon: <Button className="w-full h-8">Buton</Button> },
  { type: "text", name: "Metin", icon: <p className="text-sm text-gray-900">Metin</p> },
  { type: "input", name: "Input", icon: <input className="w-full h-8 border rounded px-2" placeholder="Input" /> },
  {
    type: "card",
    name: "Kart",
    icon: (
      <div className="w-full p-2 border rounded shadow-sm">
        <h4 className="font-semibold text-sm">Kart</h4>
        <p className="text-xs text-gray-600">İçerik</p>
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
        "bg-black/20 backdrop-blur-2xl border-white/10 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col",
        className,
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg flex items-center">
          <LayoutGrid className="w-5 h-5 mr-2 text-cyan-400" />
          Bileşen Kütüphanesi
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 p-4">
        {components.map((comp) => (
          <div
            key={comp.type}
            draggable
            onDragStart={(e) => handleDragStart(e, comp.type)}
            className="cursor-grab active:cursor-grabbing bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center space-y-2 hover:bg-white/10 transition-colors shadow-md"
          >
            <div className="w-full h-12 flex items-center justify-center rounded-md bg-gray-700/50 border border-gray-600/50 text-white text-xs overflow-hidden">
              {comp.icon}
            </div>
            <span className="text-white text-sm font-medium">{comp.name}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
