"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Code,
  Palette,
  Send,
  Plus,
  Bot,
  User,
  Trash2,
  Copy,
  Zap,
  Star,
  Crown,
  Rocket,
  Users,
  LogOut,
  Settings,
  Download,
  Eye,
  Save,
  FolderOpen,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { Component, Message, ProjectPages } from "@/lib/types"
import { ComponentProperties } from "@/components/builder/component-properties"
import { ComponentLibrary } from "@/components/builder/component-library"
import { renderComponent } from "@/lib/component-renderer"
import { generateCode } from "@/lib/code-generator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

export default function BuilderPage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [pages, setPages] = useState<ProjectPages>({
    "page-1": { name: "Ana Sayfa", components: [] },
  })
  const [currentPageId, setCurrentPageId] = useState("page-1")
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      content: "Merhaba! Ben senin AI asistanın. Hangi bileşeni oluşturmak istiyorsun?",
      timestamp: new Date(),
    },
  ])
  const [exportedCode, setExportedCode] = useState("")
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const router = useRouter()

  // Supabase kullanıcı kontrolü ve proje yükleme
  useEffect(() => {
    const checkUserAndLoadProject = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth") // Kimlik doğrulanmamışsa giriş sayfasına yönlendir
      } else {
        // Kullanıcı giriş yapmışsa projeyi yüklemeyi dene
        handleLoadProject()
      }
    }
    checkUserAndLoadProject()
  }, [router]) // router değiştiğinde tekrar çalışır

  const canvasComponents = pages[currentPageId]?.components || []

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    const userMessage: Message = {
      type: "user",
      content: prompt,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    setIsGenerating(true)
    const currentPrompt = prompt
    setPrompt("")

    try {
      const response = await fetch("/api/generate-components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Bileşen oluşturulurken sunucu hatası oluştu.")
      }

      const data = await response.json()
      const newComponents: Component[] = data.components // API'den gelen bileşenler dizisi

      setPages((prev) => ({
        ...prev,
        [currentPageId]: {
          ...prev[currentPageId],
          components: [...(prev[currentPageId]?.components || []), ...newComponents],
        },
      }))

      const aiMessage: Message = {
        type: "ai",
        content: `"${currentPrompt}" için ${newComponents.length} bileşen oluşturdum! Canvas'ta görebilirsin.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error: any) {
      console.error("Bileşen oluşturma hatası:", error)
      const errorMessage: Message = {
        type: "error",
        content: `Bileşen oluşturulurken bir hata oluştu: ${error.message}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComponentClick = (id: string) => {
    setSelectedComponent(id)
  }

  const handleComponentDrag = (id: string, newX: number, newY: number) => {
    setPages((prev) => ({
      ...prev,
      [currentPageId]: {
        ...prev[currentPageId],
        components: prev[currentPageId].components.map((comp) =>
          comp.id === id ? { ...comp, x: newX, y: newY } : comp,
        ),
      },
    }))
  }

  const deleteComponent = (id: string) => {
    setPages((prev) => ({
      ...prev,
      [currentPageId]: {
        ...prev[currentPageId],
        components: prev[currentPageId].components.filter((comp) => comp.id !== id),
      },
    }))
    if (selectedComponent === id) {
      setSelectedComponent(null)
    }
  }

  const updateComponentProps = useCallback(
    (id: string, newProps: any) => {
      setPages((prev) => ({
        ...prev,
        [currentPageId]: {
          ...prev[currentPageId],
          components: prev[currentPageId].components.map((comp) =>
            comp.id === id ? { ...comp, props: { ...comp.props, ...newProps } } : comp,
          ),
        },
      }))
    },
    [currentPageId],
  )

  const handleExportCode = () => {
    const code = generateCode(pages) // Tüm sayfaları gönder
    setExportedCode(code)
    setIsExportDialogOpen(true)
  }

  const handleSaveProject = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: "Projeyi kaydetmek için giriş yapmalısın.", timestamp: new Date() },
      ])
      return
    }

    try {
      const userId = user.id
      const projectName = "default_project" // Şimdilik tek bir proje adı kullanalım

      const { data, error } = await supabase
        .from("user_projects")
        .upsert(
          {
            user_id: userId,
            project_name: projectName,
            project_data: pages, // Tüm pages objesini JSONB olarak kaydet
          },
          { onConflict: "user_id, project_name" }, // user_id ve project_name çakışırsa güncelle
        )
        .select()

      if (error) {
        throw error
      }

      setMessages((prev) => [
        ...prev,
        { type: "success", content: "Proje başarıyla kaydedildi!", timestamp: new Date() },
      ])
    } catch (error: any) {
      console.error("Projeyi kaydetme hatası:", error)
      setMessages((prev) => [
        ...prev,
        { type: "error", content: `Projeyi kaydederken bir hata oluştu: ${error.message}`, timestamp: new Date() },
      ])
    }
  }

  const handleLoadProject = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: "Projeyi yüklemek için giriş yapmalısın.", timestamp: new Date() },
      ])
      return
    }

    try {
      const userId = user.id
      const projectName = "default_project"

      const { data, error } = await supabase
        .from("user_projects")
        .select("project_data")
        .eq("user_id", userId)
        .eq("project_name", projectName)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = Satır bulunamadı hatası
        throw error
      }

      if (data && data.project_data) {
        const loadedPages = data.project_data as ProjectPages
        setPages(loadedPages)
        setCurrentPageId(Object.keys(loadedPages)[0]) // İlk sayfayı varsayılan olarak ayarla
        setMessages((prev) => [...prev, { type: "ai", content: "Proje başarıyla yüklendi!", timestamp: new Date() }])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: "Kaydedilmiş proje bulunamadı. Yeni bir proje oluşturabilirsin.",
            timestamp: new Date(),
          },
        ])
        // Eğer proje yoksa varsayılan boş bir proje ile başla
        setPages({ "page-1": { name: "Ana Sayfa", components: [] } })
        setCurrentPageId("page-1")
      }
    } catch (error: any) {
      console.error("Projeyi yükleme hatası:", error)
      setMessages((prev) => [
        ...prev,
        { type: "error", content: `Projeyi yüklerken bir hata oluştu: ${error.message}`, timestamp: new Date() },
      ])
    }
  }

  const handleNewPage = () => {
    const newPageId = `page-${Object.keys(pages).length + 1}`
    setPages((prev) => ({
      ...prev,
      [newPageId]: { name: `Sayfa ${Object.keys(pages).length + 1}`, components: [] },
    }))
    setCurrentPageId(newPageId)
    setSelectedComponent(null)
  }

  const handleDeletePage = (pageId: string) => {
    if (Object.keys(pages).length === 1) {
      setMessages((prev) => [...prev, { type: "error", content: "Son sayfayı silemezsin!", timestamp: new Date() }])
      return
    }
    setPages((prev) => {
      const newPages = { ...prev }
      delete newPages[pageId]
      return newPages
    })
    if (currentPageId === pageId) {
      setCurrentPageId(Object.keys(pages)[0]) // Silinen sayfa aktifse ilk sayfaya geç
    }
    setSelectedComponent(null)
  }

  const handleSwitchPage = (pageId: string) => {
    setCurrentPageId(pageId)
    setSelectedComponent(null)
  }

  const handlePageNameChange = (pageId: string, newName: string) => {
    setPages((prev) => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        name: newName,
      },
    }))
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const componentType = e.dataTransfer.getData("componentType")
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let newComponent: Component | null = null
    const id = `${componentType}-${Date.now()}`

    switch (componentType) {
      case "button":
        newComponent = {
          id,
          type: "button",
          x,
          y,
          props: { text: "Yeni Buton", variant: "default", width: 120, height: 40, targetPageId: "" },
        }
        break
      case "text":
        newComponent = {
          id,
          type: "text",
          x,
          y,
          props: { text: "Yeni Metin", className: "text-lg text-gray-900", width: 200, height: 30 },
        }
        break
      case "input":
        newComponent = {
          id,
          type: "input",
          x,
          y,
          props: { placeholder: "Yeni Input", type: "text", width: 250, height: 40 },
        }
        break
      case "card":
        newComponent = {
          id,
          type: "card",
          x,
          y,
          props: { title: "Yeni Kart", content: "Kart içeriği...", width: 300, height: 200 },
        }
        break
      default:
        break
    }

    if (newComponent) {
      setPages((prev) => ({
        ...prev,
        [currentPageId]: {
          ...prev[currentPageId],
          components: [...(prev[currentPageId]?.components || []), newComponent],
        },
      }))
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: `${componentType} bileşeni tuvale eklendi!`, timestamp: new Date() },
      ])
    }
  }

  const currentSelectedComponent = selectedComponent ? canvasComponents.find((c) => c.id === selectedComponent) : null

  const handleResizeStart = (e: React.MouseEvent, componentId: string, handleType: "br" | "bl" | "tr" | "tl") => {
    e.stopPropagation() // Prevent dragging the component itself
    const component = canvasComponents.find((c) => c.id === componentId)
    if (!component) return

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = component.props.width || 0
    const startHeight = component.props.height || 0
    const startLeft = component.x
    const startTop = component.y

    const doResize = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight
      let newX = startLeft
      let newY = startTop

      if (handleType.includes("r")) {
        // Right handles
        newWidth = Math.max(20, startWidth + deltaX)
      }
      if (handleType.includes("b")) {
        // Bottom handles
        newHeight = Math.max(20, startHeight + deltaY)
      }
      if (handleType.includes("l")) {
        // Left handles
        newWidth = Math.max(20, startWidth - deltaX)
        newX = startLeft + startWidth - newWidth
      }
      if (handleType.includes("t")) {
        // Top handles
        newHeight = Math.max(20, startHeight - deltaY)
        newY = startTop + startHeight - newHeight
      }

      updateComponentProps(componentId, { width: newWidth, height: newHeight })
      handleComponentDrag(componentId, newX, newY)
    }

    const stopResize = () => {
      document.removeEventListener("mousemove", doResize)
      document.removeEventListener("mouseup", stopResize)
    }

    document.addEventListener("mousemove", doResize)
    document.addEventListener("mouseup", stopResize)
  }

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "6s" }}
        ></div>
      </div>

      {/* Builder Navbar */}
      <nav className="relative z-50 bg-black/10 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-full mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white animate-spin-slow" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Builder Pro
                </h1>
                <p className="text-xs text-white/60">Builder Ekranı</p>
              </div>
            </div>

            {/* Builder Actions */}
            <div className="flex items-center space-x-4">
              {/* Page Tabs */}
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-lg p-1">
                {Object.entries(pages).map(([pageId, pageData]) => (
                  <div key={pageId} className="relative group">
                    {editingPageId === pageId ? (
                      <Input
                        value={pageData.name}
                        onChange={(e) => handlePageNameChange(pageId, e.target.value)}
                        onBlur={() => setEditingPageId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingPageId(null)
                          }
                        }}
                        className="h-8 px-2 py-1 text-sm bg-white/20 border-white/30 text-white focus:ring-purple-500"
                        autoFocus
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSwitchPage(pageId)}
                        onDoubleClick={() => setEditingPageId(pageId)} // Çift tıklama ile düzenleme
                        className={`text-white/80 hover:bg-white/10 hover:text-white transition-colors duration-200 ${
                          currentPageId === pageId ? "bg-white/15 text-white font-semibold" : ""
                        }`}
                      >
                        {pageData.name}
                      </Button>
                    )}
                    {Object.keys(pages).length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-red-400 hover:bg-red-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePage(pageId)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 transition-all duration-200 shadow-lg ml-2"
                  onClick={handleNewPage}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Sayfa
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
                onClick={handleSaveProject}
              >
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
                onClick={handleLoadProject}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Yükle
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
                onClick={handleExportCode}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Code
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
              >
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Button>
              <Button
                size="sm"
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content area - flex-1 ile kalan alanı doldurmasını sağladık, pb-6 ekledik */}
      <div className="flex flex-1 pt-6 gap-6 px-6 pb-6">
        {/* Left Panel - AI Chat & Component Library */}
        <div className="w-1/4 animate-slide-in-left flex flex-col gap-6">
          {/* AI Chat Card - flex-1 ile kalan alanı doldurmasını sağladık */}
          <Card className="flex-1 bg-black/20 backdrop-blur-2xl border-white/10 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">AI Asistan</h2>
                  <p className="text-sm text-white/60 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Aktif ve Hazır
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
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
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                              : "bg-gradient-to-r from-purple-500 to-pink-500"
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
                              ? "bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white"
                              : "bg-white/10 text-white border border-white/20"
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
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="mb-4">
                <p className="text-xs text-white/60 mb-3 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Hızlı başlangıç örnekleri:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {["Login formu", "Hero section", "Navbar oluştur", "Pricing kartları"].map((example) => (
                    <Button
                      key={example}
                      size="sm"
                      variant="outline"
                      className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200 justify-start"
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
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-purple-500 transition-all backdrop-blur-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {isGenerating ? (
                    <div className="animate-spin">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Component Library Card - flex-1 ile kalan alanı doldurmasını sağladık */}
          <ComponentLibrary className="flex-1" />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 animate-scale-in">
          <Card className="h-full bg-white border-2 border-gray-300 shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <Palette className="w-6 h-6 mr-2 text-purple-500" />
                    Tasarım Tuvali
                  </h2>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    {canvasComponents.length} bileşen • Sürükleyip konumlandırabilirsin
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setPages((prev) => ({ ...prev, [currentPageId]: { ...prev[currentPageId], components: [] } }))
                    } // Sadece aktif sayfayı temizle
                    className="hover:scale-105 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sayfayı Temizle
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden" onDragOver={handleDragOver} onDrop={handleDrop}>
              {/* Enhanced Grid Pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              ></div>

              {/* Canvas Components */}
              <div className="absolute inset-0 p-6">
                {canvasComponents.map((component) => (
                  <div
                    key={component.id}
                    className="absolute cursor-move group hover:z-10"
                    style={{
                      left: component.x,
                      top: component.y,
                      width: component.props.width,
                      height: component.props.height,
                      transform: selectedComponent === component.id ? "scale(1.02)" : "scale(1)",
                      transition: "transform 0.2s ease-in-out",
                    }}
                    onClick={() => handleComponentClick(component.id)}
                    onMouseDown={(e) => {
                      const startX = e.clientX - component.x
                      const startY = e.clientY - component.y

                      const handleMouseMove = (e: MouseEvent) => {
                        const newX = Math.max(0, e.clientX - startX)
                        const newY = Math.max(0, e.clientY - startY)
                        handleComponentDrag(component.id, newX, newY)
                      }

                      const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove)
                        document.removeEventListener("mouseup", handleMouseUp)
                      }

                      document.addEventListener("mousemove", handleMouseMove)
                      document.addEventListener("mouseup", handleMouseUp)
                    }}
                  >
                    {renderComponent(component, selectedComponent === component.id, handleSwitchPage)}{" "}
                    {/* handleSwitchPage eklendi */}
                    {/* Enhanced Component Controls */}
                    {selectedComponent === component.id && (
                      <>
                        <div className="absolute -top-12 -right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0 bg-white shadow-lg hover:scale-110 transition-all duration-200 border border-gray-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Copy component logic
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 shadow-lg hover:scale-110 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteComponent(component.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        {/* Resize Handles */}
                        <div
                          className="absolute w-3 h-3 bg-purple-500 border border-white rounded-full cursor-nwse-resize -top-1 -left-1"
                          onMouseDown={(e) => handleResizeStart(e, component.id, "tl")}
                        />
                        <div
                          className="absolute w-3 h-3 bg-purple-500 border border-white rounded-full cursor-nesw-resize -top-1 -right-1"
                          onMouseDown={(e) => handleResizeStart(e, component.id, "tr")}
                        />
                        <div
                          className="absolute w-3 h-3 bg-purple-500 border border-white rounded-full cursor-nesw-resize -bottom-1 -left-1"
                          onMouseDown={(e) => handleResizeStart(e, component.id, "bl")}
                        />
                        <div
                          className="absolute w-3 h-3 bg-purple-500 border border-white rounded-full cursor-nwse-resize -bottom-1 -right-1"
                          onMouseDown={(e) => handleResizeStart(e, component.id, "br")}
                        />
                      </>
                    )}
                  </div>
                ))}
                {/* Enhanced Empty State */}
                {canvasComponents.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative mb-8">
                        <div className="animate-bounce-slow">
                          <Sparkles className="w-24 h-24 text-purple-400 mx-auto" />
                        </div>
                        <div className="absolute -top-2 -right-2 animate-ping">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Sihri Başlasın!</h3>
                      <p className="text-gray-600 mb-6 max-w-md">
                        AI asistanına ne yapmak istediğini söyle,
                        <br />
                        burada otomatik olarak oluşsun!
                      </p>
                      <div className="flex space-x-3 justify-center mb-4">
                        <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                        <div
                          className="w-4 h-4 bg-pink-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                          className="w-4 h-4 bg-cyan-500 rounded-full animate-pulse"
                          style={{ animationDelay: "1s" }}
                        ></div>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Rocket className="w-3 h-3 mr-1" />
                        Sınırsız Yaratıcılık
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Component Info & Properties */}
        <div className="w-1/4 animate-slide-in-right">
          <Card className="h-full bg-black/20 backdrop-blur-2xl border-white/10 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <Code className="w-6 h-6 text-cyan-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Bileşen Bilgisi</h2>
                  <p className="text-sm text-white/60">Detaylar ve özellikler</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {currentSelectedComponent ? (
                <ComponentProperties
                  component={currentSelectedComponent}
                  onUpdate={updateComponentProps}
                  pages={pages} // Sayfaları prop olarak gönder
                />
              ) : (
                <div className="text-center py-8">
                  <div className="relative mb-4">
                    <Palette className="w-16 h-16 text-cyan-400 mx-auto opacity-50" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-white/60">Bir bileşen seç</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Canvas İstatistikleri
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Toplam Bileşen:
                    </span>
                    <Badge className="bg-white/20 text-white">{canvasComponents.length}</Badge>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Seçili:
                    </span>
                    <Badge className="bg-white/20 text-white">{selectedComponent ? "1" : "0"}</Badge>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span className="flex items-center">
                      <Rocket className="w-3 h-3 mr-1" />
                      Durum:
                    </span>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">Aktif</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Export Code Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[800px] bg-black/80 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Oluşturulan Kod</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-white/70">Aşağıdaki kodu kopyalayıp projenizde kullanabilirsiniz.</p>
            <pre className="bg-gray-900 p-4 rounded-md text-sm overflow-auto max-h-[400px] text-green-300">
              <code>{exportedCode}</code>
            </pre>
            <Button
              onClick={() => navigator.clipboard.writeText(exportedCode)}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              Kodu Kopyala
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
