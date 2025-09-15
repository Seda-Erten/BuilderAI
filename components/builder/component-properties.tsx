"use client"
/**
 * Amaç: Seçili bileşenin propslarını düzenlemek için form kontrolleri sunar.
 * Props: component, onUpdate(id, partialProps), onDeleteComponent(id), pages
 * Not: Değer değişimlerinde yalnızca üst bileşene bildirim gönderir; kalıcılık üst seviyede yönetilir.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Component, ProjectPages } from "@/lib/types"
import { Settings, Type, Text, Square, Palette, Code, Ruler, Link, Trash2 } from "lucide-react"

interface ComponentPropertiesProps {
  component: Component
  onUpdate: (id: string, newProps: any) => void // Prop adı düzeltildi
  onDeleteComponent: (id: string) => void // Yeni prop eklendi
  pages: ProjectPages
}

export function ComponentProperties({ component, onUpdate, onDeleteComponent, pages }: ComponentPropertiesProps) {
  const handlePropChange = (key: string, value: any) => {
    onUpdate(component.id, { [key]: value })
  }

  const renderPropInput = (key: string, value: any) => {
    switch (key) {
      case "text":
      case "placeholder":
      case "title":
      case "content":
        return (
          <Textarea
            id={`${component.id}-${key}`}
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-purple-500 transition-all"
          />
        )
      case "value": // Yeni: value prop'u için input
        return (
          <Input
            id={`${component.id}-${key}`}
            type="text"
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-purple-500 transition-all"
          />
        )
      case "type": // For input type (e.g., text, email, password)
        return (
          <Select onValueChange={(val) => handlePropChange(key, val)} value={value}>
            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:ring-purple-500">
              <SelectValue placeholder="Tip Seç" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="password">Password</SelectItem>
              <SelectItem value="number">Number</SelectItem>
            </SelectContent>
          </Select>
        )
      case "variant": // For button variant
        return (
          <Select onValueChange={(val) => handlePropChange(key, val)} value={value}>
            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:ring-purple-500">
              <SelectValue placeholder="Varyant Seç" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        )
      case "className": // For Tailwind CSS classes
        return (
          <Input
            id={`${component.id}-${key}`}
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-purple-500 transition-all"
            placeholder="Tailwind CSS sınıfları"
          />
        )
      case "width":
      case "height":
        return (
          <Input
            id={`${component.id}-${key}`}
            type="number"
            value={value || ""}
            onChange={(e) => handlePropChange(key, Number.parseInt(e.target.value) || 0)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-purple-500 transition-all"
            min="0"
          />
        )
      case "targetPageId": // Yeni hedef sayfa seçimi
        return (
          <Select onValueChange={(val) => handlePropChange(key, val)} value={value}>
            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:ring-purple-500">
              <SelectValue placeholder="Hedef Sayfa Seç" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="none">Yok (Mevcut Sayfada Kal)</SelectItem>
              {Object.entries(pages).map(([pageId, pageData]) => (
                <SelectItem key={pageId} value={pageId}>
                  {pageData.name} ({pageId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            id={`${component.id}-${key}`}
            type="text"
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-purple-500 transition-all"
          />
        )
    }
  }

  const getIconForProp = (key: string) => {
    switch (key) {
      case "text":
      case "title":
      case "content":
      case "value": // Yeni: value prop'u için ikon
        return <Text className="w-4 h-4 mr-2" />
      case "placeholder":
        return <Type className="w-4 h-4 mr-2" />
      case "type":
        return <Square className="w-4 h-4 mr-2" />
      case "variant":
        return <Palette className="w-4 h-4 mr-2" />
      case "className":
        return <Code className="w-4 h-4 mr-2" />
      case "width":
      case "height":
        return <Ruler className="w-4 h-4 mr-2" />
      case "targetPageId":
        return <Link className="w-4 h-4 mr-2" />
      default:
        return <Settings className="w-4 h-4 mr-2" />
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg flex items-center">
          <Settings className="w-5 h-5 mr-2 text-purple-400" />
          Bileşen Özellikleri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 p-3 rounded-lg border border-white/20 backdrop-blur-sm">
          <p className="text-white font-medium">
            Seçili Bileşen: <span className="font-bold capitalize">{component.type}</span>
          </p>
        </div>
        {/* Always show className editor to allow styling/color changes */}
        <div className="space-y-2">
          <Label htmlFor={`${component.id}-className`} className="text-white/80 flex items-center capitalize">
            {getIconForProp("className")}
            className:
          </Label>
          {renderPropInput("className", (component.props as any)?.className ?? "")}
        </div>
        {(["div", "card"].includes(component.type)) && (
          <div className="space-y-2">
            <Label htmlFor={`${component.id}-layoutMode`} className="text-white/80 flex items-center capitalize">
              {getIconForProp("layoutMode")}
              Yerleşim Modu (layoutMode):
            </Label>
            <Select
              value={(component.props as any).layoutMode || "flow"}
              onValueChange={(val) => onUpdate(component.id, { layoutMode: val })}
            >
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:ring-purple-500">
                <SelectValue placeholder="Mod Seç" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="flow">Flow (flex/grid - sıralama)</SelectItem>
                <SelectItem value="free">Free (serbest sürükleme)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {Object.entries(component.props).filter(([key]) => key !== "className").map(([key, value]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`${component.id}-${key}`} className="text-white/80 flex items-center capitalize">
              {getIconForProp(key)}
              {key}:
            </Label>
            {renderPropInput(key, value)}
          </div>
        ))}
        <Button variant="destructive" className="w-full mt-4" onClick={() => onDeleteComponent(component.id)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Bileşeni Sil
        </Button>
      </CardContent>
    </Card>
  )
}
