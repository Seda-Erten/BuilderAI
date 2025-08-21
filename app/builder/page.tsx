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
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const router = useRouter();
  const pagesRef = useRef(pages);
  const builderCanvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPropsOpen, setIsPropsOpen] = useState(false);
  const [stylePreset, setStylePreset] = useState<"minimal" | "brand" | "dark" | "glass">("minimal");
  const [temperature, setTemperature] = useState<number>(0.35);

  // Generate a collision-resistant ID for components
  const generateUniqueId = useCallback((type: string, taken: Set<string>) => {
    let candidate = "";
    do {
      const rand = typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10);
      candidate = `${type}-${rand}`;
    } while (taken.has(candidate));
    return candidate;
  }, []);

  // Collect all ids from a tree (top-level + children)
  const collectAllIds = useCallback((list: Component[], into?: Set<string>) => {
    const acc = into || new Set<string>()
    const visit = (c: Component) => {
      if (c?.id) acc.add(c.id)
      if (Array.isArray(c.children)) c.children.forEach(visit)
    }
    ;(list || []).forEach(visit)
    return acc
  }, [])

  // Normalize a list of incoming components to guarantee unique ids (considering whole current tree)
  const normalizeIncomingComponents = useCallback((incoming: Component[], currentList: Component[]) => {
    const taken = collectAllIds(currentList)
    const fixTree = (node: Component): Component => {
      let id = node.id && !taken.has(node.id) ? node.id : generateUniqueId(node.type, taken)
      taken.add(id)
      const children = Array.isArray(node.children) ? node.children.map(fixTree) : undefined
      return { ...node, id, children } as Component
    }
    return incoming.map(fixTree)
  }, [collectAllIds, generateUniqueId]);

  // Normalize all pages' components to ensure uniqueness after loading from storage (deep, includes children)
  const normalizeAllPages = useCallback((incomingPages: ProjectPages): ProjectPages => {
    const result: ProjectPages = {} as ProjectPages
    for (const [pid, page] of Object.entries(incomingPages)) {
      const seen = new Set<string>()
      const fixTree = (node: Component): Component => {
        let id = node.id && !seen.has(node.id) ? node.id : generateUniqueId(node.type, seen)
        seen.add(id)
        const children = Array.isArray(node.children) ? node.children.map(fixTree) : undefined
        return { ...node, id, children } as Component
      }
      const comps = (page.components || []).map(fixTree)
      result[pid] = { ...page, components: comps } as any
    }
    return result
  }, [generateUniqueId])

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
        body: JSON.stringify({ prompt: currentPrompt, generationMode: "sections", stylePreset, temperature }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Bileşen oluşturulurken sunucu hatası oluştu.");
      }

      const data = await response.json();
      const rawComponents: Component[] = data.components;
      const newComponents = normalizeIncomingComponents(rawComponents, pages[currentPageId]?.components || []);

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

  // Nested children drag inside an absolute-positioned parent
  const handleChildDrag = (parentId: string, childId: string, newX: number, newY: number) => {
    const updateParentInTree = (list: Component[]): Component[] =>
      list.map((comp) => {
        if (comp.id === parentId) {
          const nextChildren = (comp.children || []).map((ch) =>
            ch.id === childId ? { ...ch, x: newX, y: newY } : ch
          );
          return { ...comp, children: nextChildren } as Component;
        }
        if (comp.children && comp.children.length > 0) {
          return { ...comp, children: updateParentInTree(comp.children) } as Component;
        }
        return comp;
      });

    setPages((prev) => ({
      ...prev,
      [currentPageId]: {
        ...prev[currentPageId],
        components: updateParentInTree(prev[currentPageId].components),
      },
    }));
  };

  // Save after nested drag completes
  const handleChildDragEnd = async (parentId: string, childId: string) => {
    await handleSaveProject(pagesRef.current, false);
  };

  // Reorder children inside a flex/grid parent
  const handleChildReorder = (parentId: string, fromIndex: number, toIndex: number) => {
    const reorderInTree = (list: Component[]): Component[] =>
      list.map((comp) => {
        if (comp.id === parentId) {
          const arr = [...(comp.children || [])];
          if (
            fromIndex < 0 ||
            fromIndex >= arr.length ||
            toIndex < 0 ||
            toIndex >= arr.length
          ) {
            return comp;
          }
          const [moved] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, moved);
          return { ...comp, children: arr } as Component;
        }
        if (comp.children && comp.children.length > 0) {
          return { ...comp, children: reorderInTree(comp.children) } as Component;
        }
        return comp;
      });

    const updatedComponents = reorderInTree(pages[currentPageId].components);
    const updatedPages = {
      ...pages,
      [currentPageId]: {
        ...pages[currentPageId],
        components: updatedComponents,
      },
    };
    setPages(updatedPages);
    handleSaveProject(updatedPages, false);
  };

  const deleteComponent = async (id: string) => {
    // Remove component with given id anywhere in the tree (top-level or nested)
    const removeFromTree = (list: Component[]): Component[] => {
      return list
        .filter((comp) => comp.id !== id)
        .map((comp) => {
          if (Array.isArray(comp.children) && comp.children.length > 0) {
            return { ...comp, children: removeFromTree(comp.children) } as Component;
          }
          return comp;
        });
    };

    const updatedComponents = removeFromTree(pages[currentPageId].components);
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
      const updateInTree = (list: Component[]): Component[] =>
        list.map((comp) => {
          if (comp.id === id) {
            return { ...comp, props: { ...comp.props, ...newProps } } as Component;
          }
          if (comp.children && comp.children.length > 0) {
            return { ...comp, children: updateInTree(comp.children) } as Component;
          }
          return comp;
        });

      const updatedComponents = updateInTree(pages[currentPageId].components);
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

  // Replace a component (top-level or nested) with a new component type while preserving position/size
  const replaceComponent = async (targetId: string, newType: Component["type"]) => {
    const makeNew = (type: Component["type"], base: Component): Component => {
      const currentAllIds = collectAllIds(pages[currentPageId]?.components || [])
      const id = generateUniqueId(type, currentAllIds)
      const common = {
        id,
        type,
        x: base.x,
        y: base.y,
        props: { width: base.props?.width, height: base.props?.height },
      } as any
      switch (type) {
        case "button":
          return {
            ...common,
            props: { ...common.props, text: "Yeni Buton", variant: "default" },
          }
        case "text":
          return {
            ...common,
            props: { ...common.props, text: "Yeni Metin", className: "text-lg text-gray-900" },
          }
        case "input":
          return {
            ...common,
            props: { ...common.props, placeholder: "Yeni Input", type: "text", value: "" },
          }
        case "card":
          return {
            ...common,
            props: { ...common.props, title: "Yeni Kart", content: "Kart içeriği..." },
            children: [],
          }
        case "div":
        default:
          return {
            ...common,
            props: {
              ...common.props,
              className: "w-64 h-32 bg-blue-100 border border-blue-300 rounded-md flex items-center justify-center",
            },
            children: [],
          }
      }
    }

    const replaceInList = (list: Component[]): { next: Component[]; newId: string | null } => {
      let newId: string | null = null
      const next = list.map((comp) => {
        if (comp.id === targetId) {
          const created = makeNew(newType, comp)
          newId = created.id
          return created
        }
        if (Array.isArray(comp.children) && comp.children.length > 0) {
          const res = replaceInList(comp.children)
          if (res.newId) newId = res.newId
          return { ...comp, children: res.next } as Component
        }
        return comp
      })
      return { next, newId }
    }

    const { next, newId } = replaceInList(pages[currentPageId].components)
    // After replacement, ensure deep-unique ids (in rare cases of collisions)
    const tmpPages = { ...pages, [currentPageId]: { ...pages[currentPageId], components: next } }
    const updatedPages = normalizeAllPages(tmpPages)
    setPages(updatedPages)
    await handleSaveProject(updatedPages, false)
    if (newId) setSelectedComponent(newId)
  }

  const handleOpenPreview = () => {
    // Ölç: merkez Canvas kapsayıcısının mevcut genişliği
    const w = builderCanvasContainerRef.current?.clientWidth;
    if (w && w > 0) {
      setPreviewWidth(w);
    } else {
      setPreviewWidth(null);
    }
    setIsPreviewOpen(true);
  };
  const handleClosePreview = () => setIsPreviewOpen(false);

  const handleOpenPreviewNewTab = async () => {
    try {
      // En güncel durumu kaydet
      await handleSaveProject(pagesRef.current, false);
      const w = builderCanvasContainerRef.current?.clientWidth;
      const url = `/preview?page=${encodeURIComponent(currentPageId)}${w && w > 0 ? `&w=${w}` : ""}`;
      window.open(url, "_blank");
    } catch (e) {
      // sessizce geç
    }
  };

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
        const normalized = normalizeAllPages(loadedPages);
        setPages(normalized);
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
    const existing = pages[currentPageId]?.components || [];
    const id = generateUniqueId(componentType, new Set(existing.map((c) => c.id)));

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
      <div className={"px-2 pb-3 pt-3 min-h-[calc(100vh-96px)] flex flex-col gap-2"}>
        {/* Main Area: Fullscreen Canvas with left/right slide-over panels */}
        <div className="flex-1 min-h-0 relative rounded-md overflow-hidden bg-white">
          {/* Canvas container (measured for preview) */}
          <div className="absolute inset-0">
            <div className="h-full">
              <div ref={builderCanvasContainerRef} className="w-full h-full">
                <Canvas
                  pages={pages}
                  currentPageId={currentPageId}
                  selectedComponent={selectedComponent}
                  isClearPageConfirmOpen={isClearPageConfirmOpen}
                  setIsClearPageConfirmOpen={setIsClearPageConfirmOpen}
                  handleComponentClick={handleComponentClick}
                  handleComponentDrag={handleComponentDrag}
                  handleChildDrag={handleChildDrag}
                  handleChildDragEnd={handleChildDragEnd}
                  handleChildReorder={handleChildReorder}
                  handleSaveProject={handleSaveProject}
                  handleResizeStart={handleResizeStart}
                  deleteComponent={deleteComponent}
                  handleSwitchPage={handleSwitchPage}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  setMessages={setMessages}
                  setPages={setPages}
                  onOpenPreview={handleOpenPreview}
                  onOpenPreviewNewTab={handleOpenPreviewNewTab}
                  className="h-full"
                />
              </div>
            </div>
          </div>

          {/* Chat toggle button (left edge) */}
          <button
            onClick={() => setIsChatOpen((v) => !v)}
            aria-label="AI Chat Panelini Aç/Kapat"
            className="absolute top-1/2 -translate-y-1/2 left-0 z-20"
          >
            <div className="w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white transition-colors flex items-center justify-center backdrop-blur">
              <ChevronRight className={`w-5 h-5 text-slate-700 transition-transform duration-200 ${isChatOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Slide-over AI Chat panel on the left */}
          <div
            className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur border-r border-gray-200 shadow-lg transition-transform duration-300 z-10 ${isChatOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col min-h-0 overflow-y-auto overscroll-contain`}
          >
            <div className="flex-1 min-h-0 overflow-hidden">
              <AIChatPanel
                messages={messages}
                setMessages={(next) => setMessages(next)}
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
                handleGenerate={handleGenerate}
                generationMode={generationMode}
                setGenerationMode={setGenerationMode}
                stylePreset={stylePreset}
                setStylePreset={setStylePreset}
                temperature={temperature}
                setTemperature={setTemperature}
              />
            </div>
          </div>

          {/* Properties toggle button (right edge) */}
          <button
            onClick={() => setIsPropsOpen((v) => !v)}
            aria-label="Bileşen Bilgisi Panelini Aç/Kapat"
            className="absolute top-1/2 -translate-y-1/2 right-0 z-20"
          >
            <div className="w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white transition-colors flex items-center justify-center backdrop-blur">
              <ChevronLeft className={`w-5 h-5 text-slate-700 transition-transform duration-200 ${isPropsOpen ? '-rotate-180' : ''}`} />
            </div>
          </button>

          {/* Slide-over Component Info panel on the right */}
          <div
            className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur border-l border-gray-200 shadow-lg transition-transform duration-300 z-10 ${isPropsOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col min-h-0 overflow-y-auto overscroll-contain`}
          >
            <div className="flex-1 min-h-0 overflow-hidden">
              <ComponentInfoPanel
                selectedComponent={selectedComponent}
                pages={pages}
                currentPageId={currentPageId}
                updateComponentProps={updateComponentProps}
                deleteComponent={deleteComponent}
                replaceComponent={replaceComponent}
              />
            </div>
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
          <div className="flex-1 min-h-0 p-0">
            <div
              className="h-full mx-auto"
              style={{ width: previewWidth ? `${previewWidth}px` : undefined }}
            >
              <Canvas
                pages={pages}
                currentPageId={currentPageId}
                selectedComponent={selectedComponent}
                isClearPageConfirmOpen={isClearPageConfirmOpen}
                setIsClearPageConfirmOpen={setIsClearPageConfirmOpen}
                handleComponentClick={handleComponentClick}
                handleComponentDrag={handleComponentDrag}
                handleChildDrag={handleChildDrag}
                handleChildDragEnd={handleChildDragEnd}
                handleChildReorder={handleChildReorder}
                handleSaveProject={handleSaveProject}
                handleResizeStart={handleResizeStart}
                deleteComponent={deleteComponent}
                handleSwitchPage={handleSwitchPage}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                setMessages={setMessages}
                setPages={setPages}
                onOpenPreviewNewTab={handleOpenPreviewNewTab}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}