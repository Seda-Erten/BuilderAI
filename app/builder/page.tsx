"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
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
  Cpu,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  const [isClearPageConfirmOpen, setIsClearPageConfirmOpen] = useState(false)
  const router = useRouter()
  const pagesRef = useRef(pages)

  // Supabase kullanıcı kontrolü ve proje yükleme
  useEffect(() => {
    const checkUserAndLoadProject = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
      } else {
        handleLoadProject()
      }
    }
    checkUserAndLoadProject()
  }, [router])

  useEffect(() => {
    pagesRef.current = pages
    console.log("Pages state updated (via useEffect):", pages)
    console.log("Current canvas components (via useEffect):", pages[currentPageId]?.components)
  }, [pages, currentPageId])

  const canvasComponents = pages[currentPageId]?.components || []

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  // handleSaveProject fonksiyonunu güncelledik: artık pages'ı argüman olarak alıyor ve showSuccessMessage parametresi eklendi
  const handleSaveProject = async (currentPages: ProjectPages, showSuccessMessage = false) => {
    // currentPages'ı zorunlu yaptık
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
      const projectName = "default_project"

      console.log("handleSaveProject: Kaydedilecek proje verisi:", JSON.parse(JSON.stringify(currentPages)))
      console.log("handleSaveProject: Kullanıcı ID:", userId)

      const { data, error } = await supabase
        .from("user_projects")
        .upsert(
          {
            user_id: userId,
            project_name: projectName,
            project_data: currentPages,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id, project_name" },
        )
        .select()

      if (error) {
        throw error
      }

      console.log("handleSaveProject: Proje başarıyla Supabase'e kaydedildi:", data)
      if (showSuccessMessage) {
        setMessages((prev) => [
          ...prev,
          { type: "success", content: "Proje başarıyla kaydedildi!", timestamp: new Date() },
        ])
      }
    } catch (error: any) {
      console.error("handleSaveProject: Projeyi kaydetme hatası:", error)
      setMessages((prev) => [
        ...prev,
        { type: "error", content: `Projeyi kaydederken bir hata oluştu: ${error.message}`, timestamp: new Date() },
      ])
    }
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
      const newComponents: Component[] = data.components

      const updatedPages = {
        ...pages,
        [currentPageId]: {
          ...pages[currentPageId],
          components: [...(pages[currentPageId]?.components || []), ...newComponents],
        },
      }
      setPages(updatedPages)
      await handleSaveProject(updatedPages, true) // Bileşen eklendikten sonra kaydet ve başarı mesajı göster

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
    // Sadece yerel state'i güncelle, kaydetme işlemi mouseUp'ta yapılacak
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

  const deleteComponent = async (id: string) => {
    const updatedComponents = pages[currentPageId].components.filter((comp) => comp.id !== id)
    const updatedPages = {
      ...pages,
      [currentPageId]: {
        ...pages[currentPageId],
        components: updatedComponents,
      },
    }
    setPages(updatedPages)
    console.log("Bileşen silindi, yeni state:", updatedPages)
    await handleSaveProject(updatedPages, false) // Bileşen silindikten sonra kaydet (mesaj gösterme)

    if (selectedComponent === id) {
      setSelectedComponent(null)
    }
  }

  const updateComponentProps = useCallback(
    async (id: string, newProps: any) => {
      const updatedComponents = pages[currentPageId].components.map((comp) =>
        comp.id === id ? { ...comp, props: { ...comp.props, ...newProps } } : comp,
      )
      const updatedPages = { ...pages, [currentPageId]: { ...pages[currentPageId], components: updatedComponents } }
      setPages(updatedPages)
      await handleSaveProject(updatedPages, false) // Prop güncellendikten sonra kaydet (mesaj gösterme)
    },
    [currentPageId, pages], // pages'ı bağımlılık dizisine ekledik
  )

  const handleExportCode = () => {
    const code = generateCode(pages)
    setExportedCode(code)
    setIsExportDialogOpen(true)
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

      console.log("handleLoadProject: Yüklenecek proje için kullanıcı ID:", userId)

      const { data, error } = await supabase
        .from("user_projects")
        .select("project_data")
        .eq("user_id", userId)
        .eq("project_name", projectName)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means "no rows found"
        throw error
      }

      if (data && data.project_data) {
        const loadedPages = data.project_data as ProjectPages
        console.log("handleLoadProject: Supabase'den yüklenen ham veri:", data.project_data)
        console.log("handleLoadProject: Supabase'den yüklenen işlenmiş sayfalar:", loadedPages)
        setPages(loadedPages)
        setCurrentPageId(Object.keys(loadedPages)[0])
        console.log("handleLoadProject: Proje başarıyla yüklendi ve state güncellendi.")
        setMessages((prev) => [...prev, { type: "ai", content: "Proje başarıyla yüklendi!", timestamp: new Date() }])
      } else {
        console.log("handleLoadProject: Kaydedilmiş proje bulunamadı. Yeni bir proje oluşturuluyor.")
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: "Kaydedilmiş proje bulunamadı. Yeni bir proje oluşturabilirsin.",
            timestamp: new Date(),
          },
        ])
        setPages({ "page-1": { name: "Ana Sayfa", components: [] } })
        setCurrentPageId("page-1")
      }
    } catch (error: any) {
      console.error("handleLoadProject: Projeyi yükleme hatası:", error)
      setMessages((prev) => [
        ...prev,
        { type: "error", content: `Projeyi yüklerken bir hata oluştu: ${error.message}`, timestamp: new Date() },
      ])
    }
  }

  const handleNewPage = async () => {
    const newPageId = `page-${Object.keys(pages).length + 1}`
    const updatedPages = {
      ...pages,
      [newPageId]: { name: `Sayfa ${Object.keys(pages).length + 1}`, components: [] },
    }
    setPages(updatedPages)
    await handleSaveProject(updatedPages, true) // Yeni sayfa eklendikten sonra kaydet ve başarı mesajı göster
    setCurrentPageId(newPageId)
    setSelectedComponent(null)
  }

  const handleDeletePage = async (pageId: string) => {
    if (Object.keys(pages).length === 1) {
      setMessages((prev) => [...prev, { type: "error", content: "Son sayfayı silemezsin!", timestamp: new Date() }])
      return
    }
    const newPages = { ...pages }
    delete newPages[pageId]
    const updatedPages = { ...newPages }
    setPages(updatedPages)
    await handleSaveProject(updatedPages, true) // Sayfa silindikten sonra kaydet ve başarı mesajı göster

    if (currentPageId === pageId) {
      setCurrentPageId(Object.keys(pages)[0])
    }
    setSelectedComponent(null)
  }

  const handleSwitchPage = (pageId: string) => {
    setCurrentPageId(pageId)
    setSelectedComponent(null)
  }

  const handlePageNameChange = async (pageId: string, newName: string) => {
    const updatedPages = {
      ...pages,
      [pageId]: {
        ...pages[pageId],
        name: newName,
      },
    }
    setPages(updatedPages)
    await handleSaveProject(updatedPages, false) // Sayfa adı değiştikten sonra kaydet (mesaj gösterme)
  }

  // Sayfayı temizleme işlemini gerçekleştiren fonksiyon
  const confirmClearPage = async () => {
    console.log("confirmClearPage called. Current pages state (before update):", JSON.parse(JSON.stringify(pages)))
    const updatedPages = { ...pages, [currentPageId]: { ...pages[currentPageId], components: [] } }
    console.log("updatedPages object (before setPages):", JSON.parse(JSON.stringify(updatedPages)))
    setPages(updatedPages) // This updates the local state
    console.log("setPages called for clearing page. UI should update now.")

    // UI'ın güncellenmesi için kısa bir gecikme ekleyebiliriz, ancak genellikle gerekli değildir.
    // await new Promise(resolve => setTimeout(resolve, 50));

    await handleSaveProject(updatedPages, true) // This saves the updated state to Supabase
    setIsClearPageConfirmOpen(false)
    setMessages((prev) => [...prev, { type: "ai", content: "Mevcut sayfa temizlendi!", timestamp: new Date() }])
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
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
          props: { placeholder: "Yeni Input", type: "text", value: "", width: 250, height: 40 }, // Yeni: value eklendi
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
      case "div":
        newComponent = {
          id,
          type: "div",
          x,
          y,
          props: {
            className: "w-64 h-32 bg-blue-100 border border-blue-300 rounded-md flex items-center justify-center",
            width: 256,
            height: 128,
          },
          children: [],
        }
        break
      default:
        break
    }

    if (newComponent) {
      const updatedPages = {
        ...pages,
        [currentPageId]: {
          ...pages[currentPageId],
          components: [...(pages[currentPageId]?.components || []), newComponent],
        },
      }
      setPages(updatedPages)
      await handleSaveProject(updatedPages, false) // Yeni bileşen eklendikten sonra kaydet (mesaj gösterme)
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: `${componentType} bileşeni tuvale eklendi!`, timestamp: new Date() },
      ])
    }
  }

  const currentSelectedComponent = selectedComponent ? canvasComponents.find((c) => c.id === selectedComponent) : null

  const handleResizeStart = (e: React.MouseEvent, componentId: string, handleType: "br" | "bl" | "tr" | "tl") => {
    e.stopPropagation()
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
        newWidth = Math.max(20, startWidth + deltaX)
      }
      if (handleType.includes("b")) {
        newHeight = Math.max(20, startHeight + deltaY)
      }
      if (handleType.includes("l")) {
        newWidth = Math.max(20, startWidth - deltaX)
        newX = startLeft + startWidth - newWidth
      }
      if (handleType.includes("t")) {
        newHeight = Math.max(20, startHeight - deltaY)
        newY = startTop + startHeight - newHeight
      }

      // Sadece yerel state'i güncelle, kaydetme işlemi mouseUp'ta yapılacak
      setPages((prev) => ({
        ...prev,
        [currentPageId]: {
          ...prev[currentPageId],
          components: prev[currentPageId].components.map((comp) =>
            comp.id === componentId
              ? { ...comp, x: newX, y: newY, props: { ...comp.props, width: newWidth, height: newHeight } }
              : comp,
          ),
        },
      }))
    }

    const stopResize = async () => {
      document.removeEventListener("mousemove", doResize)
      document.removeEventListener("mouseup", stopResize)
      await handleSaveProject(pagesRef.current, false) // Use the ref for the latest state
    }

    document.addEventListener("mousemove", doResize)
    document.addEventListener("mouseup", stopResize)
  }

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-[#0F172A]">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-slate-900/50 to-[#0F172A]" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glowing Effects */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-[#06B6D4]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-40 w-96 h-96 bg-[#F59E0B]/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-[#06B6D4]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "6s" }}
        ></div>

        {/* Tech Particles */}
        <div className="absolute top-32 left-32 w-2 h-2 bg-[#6366F1] rounded-full animate-ping" />
        <div
          className="absolute top-60 right-40 w-1 h-1 bg-[#06B6D4] rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-60 w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-ping"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Builder Navbar */}
      <nav className="relative z-50 bg-[#1E293B]/95 backdrop-blur-2xl border-b border-slate-700/50 shadow-2xl">
        <div className="max-w-full mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#6366F1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-indigo-500/25">
                  <Brain className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center animate-bounce">
                  <Cpu className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#6366F1] bg-clip-text text-transparent">
                  AI Builder Pro
                </h1>
                <p className="text-xs text-slate-400">Quantum Builder Interface</p>
              </div>
            </div>

            {/* Builder Actions */}
            <div className="flex items-center space-x-4">
              {/* Page Tabs */}
              <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1 backdrop-blur-sm">
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
                        className="h-8 px-2 py-1 text-sm bg-slate-800/70 border-slate-600/50 text-[#F8FAFC] focus:ring-[#6366F1]"
                        autoFocus
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSwitchPage(pageId)}
                        onDoubleClick={() => setEditingPageId(pageId)}
                        className={`text-slate-300 hover:bg-slate-700/50 hover:text-[#F8FAFC] transition-colors duration-200 ${
                          currentPageId === pageId ? "bg-slate-700/70 text-[#F8FAFC] font-semibold" : ""
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
                  className="bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:scale-105 transition-all duration-200 shadow-lg ml-2"
                  onClick={handleNewPage}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Sayfa
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="text-slate-300 hover:bg-slate-800/50 hover:scale-105 transition-all duration-200"
                onClick={() => handleSaveProject(pages, true)} // Manuel kaydetmede mesaj göster
              >
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-300 hover:bg-slate-800/50 hover:scale-105 transition-all duration-200"
                onClick={handleLoadProject}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Yükle
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-300 hover:bg-slate-800/50 hover:scale-105 transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-300 hover:bg-slate-800/50 hover:scale-105 transition-all duration-200"
                onClick={handleExportCode}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Code
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-300 hover:bg-slate-800/50 hover:scale-105 transition-all duration-200"
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
          <Card className="flex-1 bg-[#1E293B]/95 backdrop-blur-2xl border-slate-700/50 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-700/50">
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

            <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-280px)]">
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

            <div className="p-6 border-t border-slate-700/50">
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

          {/* Component Library Card */}
          <ComponentLibrary className="flex-1" />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 animate-scale-in">
          <Card className="h-full bg-white border-2 border-gray-300 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <Palette className="w-6 h-6 mr-2 text-[#6366F1]" />
                    Quantum Canvas
                  </h2>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <span className="w-2 h-2 bg-[#06B6D4] rounded-full mr-2 animate-pulse"></span>
                    {canvasComponents.length} bileşen • Sürükleyip konumlandırabilirsin
                  </p>
                </div>
                <div className="flex space-x-3">
                  {/* Sayfayı Temizle butonu için AlertDialog Trigger */}
                  <AlertDialog open={isClearPageConfirmOpen} onOpenChange={setIsClearPageConfirmOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:scale-105 transition-all duration-200 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sayfayı Temizle
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1E293B]/95 backdrop-blur-xl border-slate-700/50 text-[#F8FAFC]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#F8FAFC]">Sayfayı Temizle</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300">
                          Mevcut sayfadaki tüm bileşenleri silmek istediğine emin misin? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-slate-600/50">
                          Hayır, İptal Et
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmClearPage}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Evet, Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden" onDragOver={handleDragOver} onDrop={handleDrop}>
              {/* Enhanced Grid Pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                  linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                `,
                  backgroundSize: "20px 20px",
                }}
              ></div>

              {/* Canvas Components */}
              <div className="absolute inset-0 p-6">
                {canvasComponents.map((component) => (
                  <div
                    key={component.id}
                    className="absolute cursor-move group hover:z-10 flex items-center justify-center"
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

                      const handleMouseUp = async () => {
                        document.removeEventListener("mousemove", handleMouseMove)
                        document.removeEventListener("mouseup", handleMouseUp)
                        await handleSaveProject(pagesRef.current, false) // Use the ref for the latest state
                      }

                      document.addEventListener("mousemove", handleMouseMove)
                      document.addEventListener("mouseup", handleMouseUp)
                    }}
                  >
                    {renderComponent(component, selectedComponent === component.id, handleSwitchPage)}
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
                          className="absolute w-3 h-3 bg-[#6366F1] border border-white rounded-full cursor-nwse-resize -top-1 -left-1 shadow-lg"
                          onMouseDown={(e) => handleResizeStart(e, component.id, "tl")}
                        />
                        <div
                          className="absolute w-3 h-3 bg-[#6366F1] border border-white rounded-full cursor-nesw-resize -top-1 -right-1 shadow-lg"
                          onMouseDown={(e) => handleResizeStart(e, component.id, "tr")}
                        />
                        <div
                          className="absolute w-3 h-3 bg-[#6366F1] border border-white rounded-full cursor-nesw-resize -bottom-1 -left-1 shadow-lg"
                          onMouseDown={(e) => handleResizeStart(e, component.id, "bl")}
                        />
                        <div
                          className="absolute w-3 h-3 bg-[#6366F1] border border-white rounded-full cursor-nwse-resize -bottom-1 -right-1 shadow-lg"
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
                          <Brain className="w-24 h-24 text-[#6366F1] mx-auto" />
                        </div>
                        <div className="absolute -top-2 -right-2 animate-ping">
                          <div className="w-6 h-6 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] rounded-full"></div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Quantum Sihri Başlasın!</h3>
                      <p className="text-gray-600 mb-6 max-w-md">
                        AI asistanına ne yapmak istediğini söyle,
                        <br />
                        burada otomatik olarak oluşsun!
                      </p>
                      <div className="flex space-x-3 justify-center mb-4">
                        <div className="w-4 h-4 bg-[#6366F1] rounded-full animate-pulse"></div>
                        <div
                          className="w-4 h-4 bg-[#06B6D4] rounded-full animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                          className="w-4 h-4 bg-[#F59E0B] rounded-full animate-pulse"
                          style={{ animationDelay: "1s" }}
                        ></div>
                      </div>
                      <Badge className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] text-white">
                        <Rocket className="w-3 h-3 mr-1" />
                        Quantum Yaratıcılık
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
          <Card className="h-full bg-[#1E293B]/95 backdrop-blur-2xl border-slate-700/50 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <Code className="w-6 h-6 text-[#06B6D4]" />
                <div>
                  <h2 className="text-xl font-semibold text-[#F8FAFC]">Bileşen Bilgisi</h2>
                  <p className="text-sm text-slate-400">Quantum detaylar ve özellikler</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {currentSelectedComponent ? (
                <ComponentProperties
                  component={currentSelectedComponent}
                  onUpdate={updateComponentProps}
                  onDeleteComponent={deleteComponent}
                  pages={pages}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="relative mb-4">
                    <Palette className="w-16 h-16 text-[#06B6D4] mx-auto opacity-50" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] rounded-full animate-ping"></div>
                  </div>
                  <p className="text-slate-400">Bir bileşen seç</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-[#06B6D4]/20 to-[#6366F1]/20 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <h3 className="text-[#F8FAFC] font-medium mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Canvas İstatistikleri
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Toplam Bileşen:
                    </span>
                    <Badge className="bg-slate-700/50 text-[#F8FAFC]">{canvasComponents.length}</Badge>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Seçili:
                    </span>
                    <Badge className="bg-slate-700/50 text-[#F8FAFC]">{selectedComponent ? "1" : "0"}</Badge>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center">
                      <Rocket className="w-3 h-3 mr-1" />
                      Durum:
                    </span>
                    <Badge className="bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30">Quantum Aktif</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Export Code Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[800px] bg-[#1E293B]/95 backdrop-blur-xl border-slate-700/50 text-[#F8FAFC]">
          <DialogHeader>
            <DialogTitle className="text-[#F8FAFC]">Oluşturulan Kod</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-slate-300">Aşağıdaki kodu kopyalayıp projenizde kullanabilirsiniz.</p>
            <pre className="bg-slate-900 p-4 rounded-md text-sm overflow-auto max-h-[400px] text-green-300">
              <code>{exportedCode}</code>
            </pre>
            <Button
              onClick={() => navigator.clipboard.writeText(exportedCode)}
              className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:from-indigo-600 hover:to-cyan-600"
            >
              Kodu Kopyala
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
