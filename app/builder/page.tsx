"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { generateCode } from "@/lib/code-generator";
import { Message, ProjectPages, Component } from "@/lib/types";
import { BuilderNavbar } from "@/components/builder/BuilderNavbar";
import { AIChatPanel } from "@/components/builder/AIChatPanel";
import { Canvas } from "@/components/builder/Canvas";
import { ComponentInfoPanel } from "@/components/builder/ComponentInfoPanel";
import { ExportCodeDialog } from "@/components/builder/ExportCodeDialog";
import { ComponentLibrary } from "@/components/builder/component-library";

export default function BuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<"full" | "sections">("sections");
  const [pages, setPages] = useState<ProjectPages>({
    "page-1": { name: "Ana Sayfa", components: [] },
  });
  const [currentPageId, setCurrentPageId] = useState("page-1");
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      content: "Merhaba! Ben senin AI asistanın. Hangi bileşeni oluşturmak istiyorsun?",
      timestamp: new Date(),
    },
  ]);
  const [exportedCode, setExportedCode] = useState("");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [isClearPageConfirmOpen, setIsClearPageConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();
  const pagesRef = useRef(pages);

  useEffect(() => {
    const checkUserAndLoadProject = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
      } else {
        handleLoadProject();
      }
    };
    checkUserAndLoadProject();
  }, [router]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleSaveProject = async (currentPages: ProjectPages, showSuccessMessage = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: "Projeyi kaydetmek için giriş yapmalısın.", timestamp: new Date() },
      ]);
      return;
    }

    try {
      const userId = user.id;
      const projectName = "default_project";
      const { error } = await supabase
        .from("user_projects")
        .upsert(
          {
            user_id: userId,
            project_name: projectName,
            project_data: currentPages,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id, project_name" }
        );

      if (error) throw error;

      if (showSuccessMessage) {
        setMessages((prev) => [
          ...prev,
          { type: "success", content: "Proje başarıyla kaydedildi!", timestamp: new Date() },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: `Projeyi kaydederken bir hata oluştu: ${error.message}`, timestamp: new Date() },
      ]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      type: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsGenerating(true);
    const currentPrompt = prompt;
    setPrompt("");

    try {
      const response = await fetch("/api/generate-components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt, generationMode: "sections" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Bileşen oluşturulurken sunucu hatası oluştu.");
      }

      const data = await response.json();
      const newComponents: Component[] = data.components;

      const updatedPages = {
        ...pages,
        [currentPageId]: {
          ...pages[currentPageId],
          components: [...(pages[currentPageId]?.components || []), ...newComponents],
        },
      };
      setPages(updatedPages);
      await handleSaveProject(updatedPages, true);

      const aiMessage: Message = {
        type: "ai",
        content: `"${currentPrompt}" için ${newComponents.length} bileşen oluşturdum! Canvas'ta görebilirsin.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        type: "error",
        content: `Bileşen oluşturulurken bir hata oluştu: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComponentClick = (id: string) => {
    setSelectedComponent(id);
  };

  const handleComponentDrag = (id: string, newX: number, newY: number) => {
    setPages((prev) => ({
      ...prev,
      [currentPageId]: {
        ...prev[currentPageId],
        components: prev[currentPageId].components.map((comp) =>
          comp.id === id ? { ...comp, x: newX, y: newY } : comp
        ),
      },
    }));
  };

  const deleteComponent = async (id: string) => {
    const updatedComponents = pages[currentPageId].components.filter((comp) => comp.id !== id);
    const updatedPages = {
      ...pages,
      [currentPageId]: {
        ...pages[currentPageId],
        components: updatedComponents,
      },
    };
    setPages(updatedPages);
    await handleSaveProject(updatedPages, false);

    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const updateComponentProps = useCallback(
    async (id: string, newProps: any) => {
      const updatedComponents = pages[currentPageId].components.map((comp) =>
        comp.id === id ? { ...comp, props: { ...comp.props, ...newProps } } : comp
      );
      const updatedPages = { ...pages, [currentPageId]: { ...pages[currentPageId], components: updatedComponents } };
      setPages(updatedPages);
      await handleSaveProject(updatedPages, false);
    },
    [currentPageId, pages]
  );

  const handleExportCode = () => {
    const code = generateCode(pages);
    setExportedCode(code);
    setIsExportDialogOpen(true);
  };

  const handleOpenPreview = () => setIsPreviewOpen(true);
  const handleClosePreview = () => setIsPreviewOpen(false);

  const handleLoadProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: "Projeyi yüklemek için giriş yapmalısın.", timestamp: new Date() },
      ]);
      return;
    }

    try {
      const userId = user.id;
      const projectName = "default_project";
      const { data, error } = await supabase
        .from("user_projects")
        .select("project_data")
        .eq("user_id", userId)
        .eq("project_name", projectName)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data && data.project_data) {
        const loadedPages = data.project_data as ProjectPages;
        setPages(loadedPages);
        setCurrentPageId(Object.keys(loadedPages)[0]);
        setMessages((prev) => [...prev, { type: "ai", content: "Proje başarıyla yüklendi!", timestamp: new Date() }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: "Kaydedilmiş proje bulunamadı. Yeni bir proje oluşturabilirsin.",
            timestamp: new Date(),
          },
        ]);
        setPages({ "page-1": { name: "Ana Sayfa", components: [] } });
        setCurrentPageId("page-1");
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: `Projeyi yüklerken bir hata oluştu: ${error.message}`, timestamp: new Date() },
      ]);
    }
  };

  const handleNewPage = async () => {
    const newPageId = `page-${Object.keys(pages).length + 1}`;
    const updatedPages = {
      ...pages,
      [newPageId]: { name: `Sayfa ${Object.keys(pages).length + 1}`, components: [] },
    };
    setPages(updatedPages);
    await handleSaveProject(updatedPages, true);
    setCurrentPageId(newPageId);
    setSelectedComponent(null);
  };

  const handleDeletePage = async (pageId: string) => {
    if (Object.keys(pages).length === 1) {
      setMessages((prev) => [...prev, { type: "error", content: "Son sayfayı silemezsin!", timestamp: new Date() }]);
      return;
    }
    const newPages = { ...pages };
    delete newPages[pageId];
    const updatedPages = { ...newPages };
    setPages(updatedPages);
    await handleSaveProject(updatedPages, true);

    if (currentPageId === pageId) {
      setCurrentPageId(Object.keys(pages)[0]);
    }
    setSelectedComponent(null);
  };

  const handlePageNameChange = async (pageId: string, newName: string) => {
    const updatedPages = {
      ...pages,
      [pageId]: {
        ...pages[pageId],
        name: newName,
      },
    };
    setPages(updatedPages);
    await handleSaveProject(updatedPages, false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData("componentType");
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let newComponent: Component | null = null;
    const id = `${componentType}-${Date.now()}`;

    switch (componentType) {
      case "button":
        newComponent = {
          id,
          type: "button",
          x,
          y,
          props: { text: "Yeni Buton", variant: "default", width: 120, height: 40, targetPageId: "" },
        };
        break;
      case "text":
        newComponent = {
          id,
          type: "text",
          x,
          y,
          props: { text: "Yeni Metin", className: "text-lg text-gray-900", width: 200, height: 30 },
        };
        break;
      case "input":
        newComponent = {
          id,
          type: "input",
          x,
          y,
          props: { placeholder: "Yeni Input", type: "text", value: "", width: 250, height: 40 },
        };
        break;
      case "card":
        newComponent = {
          id,
          type: "card",
          x,
          y,
          props: { title: "Yeni Kart", content: "Kart içeriği...", width: 300, height: 200 },
        };
        break;
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
        };
        break;
      default:
        break;
    }

    if (newComponent) {
      const updatedPages = {
        ...pages,
        [currentPageId]: {
          ...pages[currentPageId],
          components: [...(pages[currentPageId]?.components || []), newComponent],
        },
      };
      setPages(updatedPages);
      await handleSaveProject(updatedPages, false);
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: `${componentType} bileşeni tuvale eklendi!`, timestamp: new Date() },
      ]);
    }
  };

const handleResizeStart = (e: React.MouseEvent, componentId: string, handleType: "br" | "bl" | "tr" | "tl") => {
  e.stopPropagation();
  const component = pages[currentPageId].components.find((c) => c.id === componentId);
  if (!component) return;

  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = component.props.width || 0;
  const startHeight = component.props.height || 0;
  const startLeft = component.x;
  const startTop = component.y;

  const doResize = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX;
    const deltaY = moveEvent.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startLeft;
    let newY = startTop;

    if (handleType.includes("r")) {
      newWidth = Math.max(20, startWidth + deltaX);
    }
    if (handleType.includes("b")) {
      newHeight = Math.max(20, startHeight + deltaY);
    }
    if (handleType.includes("l")) {
      newWidth = Math.max(20, startWidth - deltaX);
      newX = startLeft + startWidth - newWidth;
    }
    if (handleType.includes("t")) {
      newHeight = Math.max(20, startHeight - deltaY);
      newY = startTop + startHeight - newHeight;
    }

    setPages((prev) => ({
      ...prev,
      [currentPageId]: {
        ...prev[currentPageId],
        components: prev[currentPageId].components.map((comp) =>
          comp.id === componentId
            ? { ...comp, x: newX, y: newY, props: { ...comp.props, width: newWidth, height: newHeight } }
            : comp
        ),
      },
    }));
  };

  const stopResize = async () => {
    document.removeEventListener("mousemove", doResize);
    document.removeEventListener("mouseup", stopResize);
    await handleSaveProject(pagesRef.current, false);
  };

  document.addEventListener("mousemove", doResize);
  document.addEventListener("mouseup", stopResize);
};

  function handleSwitchPage(pageId: string): void {
    setCurrentPageId(pageId);
    setSelectedComponent(null);
  }

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-white">
      <BuilderNavbar
        pages={pages}
        currentPageId={currentPageId}
        editingPageId={editingPageId}
        setEditingPageId={setEditingPageId}
        handleSwitchPage={handleSwitchPage}
        handleNewPage={handleNewPage}
        handleDeletePage={handleDeletePage}
        handlePageNameChange={handlePageNameChange}
        handleSaveProject={handleSaveProject}
        handleLoadProject={handleLoadProject}
        handleExportCode={handleExportCode}
        handleLogout={handleLogout}
        handleOpenPreview={handleOpenPreview}
      />
      <div className="flex-1 px-2 pb-3 pt-3 min-h-[calc(100vh-96px)] flex flex-col gap-3">
        {/* Top: Thin horizontal Component Library */}
        <div className="h-24 min-h-[100px] overflow-visible">
          <ComponentLibrary className="h-full" />
        </div>
        <div className="flex flex-1 gap-3 min-h-0">
          {/* Left column: AI and Component Info, equal height */}
          <div className="w-96 shrink-0 flex flex-col gap-3 min-h-0">
            <div className="flex-1 min-h-[360px] overflow-auto rounded-md">
              <AIChatPanel
                messages={messages}
                setMessages={(next) => setMessages(next)}
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
                handleGenerate={handleGenerate}
                generationMode={generationMode}
                setGenerationMode={setGenerationMode}
              />
            </div>
            <div className="flex-1 min-h-[360px] overflow-hidden rounded-md">
              <ComponentInfoPanel
                selectedComponent={selectedComponent}
                pages={pages}
                currentPageId={currentPageId}
                updateComponentProps={updateComponentProps}
                deleteComponent={deleteComponent}
              />
            </div>
          </div>
          {/* Right: Canvas */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Canvas
              pages={pages}
              currentPageId={currentPageId}
              selectedComponent={selectedComponent}
              isClearPageConfirmOpen={isClearPageConfirmOpen}
              setIsClearPageConfirmOpen={setIsClearPageConfirmOpen}
              handleComponentClick={handleComponentClick}
              handleComponentDrag={handleComponentDrag}
              handleSaveProject={handleSaveProject}
              handleResizeStart={handleResizeStart}
              deleteComponent={deleteComponent}
              handleSwitchPage={handleSwitchPage}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              setMessages={setMessages}
              setPages={setPages}
              onOpenPreview={handleOpenPreview}
              className="h-full"
            />
          </div>
        </div>
      </div>
      <ExportCodeDialog
        isOpen={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        exportedCode={exportedCode}
      />
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="text-white text-sm">Tam Ekran Önizleme</div>
            <button
              onClick={handleClosePreview}
              className="text-white/90 hover:text-white rounded px-3 py-1.5 bg-white/10 border border-white/10"
            >
              Kapat
            </button>
          </div>
          <div className="flex-1 min-h-0 p-3">
            <Canvas
              pages={pages}
              currentPageId={currentPageId}
              selectedComponent={selectedComponent}
              isClearPageConfirmOpen={isClearPageConfirmOpen}
              setIsClearPageConfirmOpen={setIsClearPageConfirmOpen}
              handleComponentClick={handleComponentClick}
              handleComponentDrag={handleComponentDrag}
              handleSaveProject={handleSaveProject}
              handleResizeStart={handleResizeStart}
              deleteComponent={deleteComponent}
              handleSwitchPage={handleSwitchPage}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              setMessages={setMessages}
              setPages={setPages}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}