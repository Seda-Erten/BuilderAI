import { useState } from "react";

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Brain, Rocket, Palette, Eye } from "lucide-react";
import { Component, Message, ProjectPages } from "@/lib/types";
import { renderComponent } from "@/lib/component-renderer";

interface CanvasProps {
  pages: ProjectPages;
  currentPageId: string;
  selectedComponent: string | null;
  isClearPageConfirmOpen: boolean;
  setIsClearPageConfirmOpen: (open: boolean) => void;
  handleComponentClick: (id: string) => void;
  handleComponentDrag: (id: string, newX: number, newY: number) => void;
  handleSaveProject: (pages: ProjectPages, showSuccessMessage: boolean) => void;
  handleResizeStart: (e: React.MouseEvent, componentId: string, handleType: "br" | "bl" | "tr" | "tl") => void;
  deleteComponent: (id: string) => void;
  handleSwitchPage: (pageId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void; // Callback desteği eklendi
  setPages: (pages: ProjectPages) => void;
  className?: string;
  onOpenPreview?: () => void;
}

export function Canvas({
  pages,
  currentPageId,
  selectedComponent,
  isClearPageConfirmOpen,
  setIsClearPageConfirmOpen,
  handleComponentClick,
  handleComponentDrag,
  handleSaveProject,
  handleResizeStart,
  deleteComponent,
  handleSwitchPage,
  handleDragOver,
  handleDrop,
  setMessages,
  setPages,
  className,
  onOpenPreview,
}: CanvasProps) {
  const canvasComponents = pages[currentPageId]?.components || [];
  // İçeriğin yüksekliğini dinamik hesapla: en alttaki bileşenin altına 200px boşluk bırak
  const contentHeight = Math.max(
    800,
    ...canvasComponents.map((c) => (Number(c.y) || 0) + (Number((c.props as any)?.height) || 0))
  ) + 200;

  const confirmClearPage = async () => {
    const updatedPages = { ...pages, [currentPageId]: { ...pages[currentPageId], components: [] } };
    setPages(updatedPages);
    await handleSaveProject(updatedPages, true);
    setIsClearPageConfirmOpen(false);
    setMessages((prev: Message[]) => [
      ...prev,
      {
        type: "ai" as const,
        content: "Mevcut sayfa temizlendi!",
        timestamp: new Date(),
      } as Message,
    ]);
  };

  return (
    <Card className={`w-full h-full bg-white border-2 border-gray-200 shadow-xl transition-all duration-300 z-10 rounded-xl overflow-hidden flex flex-col ${className ?? ""}`}>
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Palette className="w-6 h-6 mr-2 text-[#6366F1]" />
              Canvas
            </h2>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <span className="w-2 h-2 bg-[#06B6D4] rounded-full mr-2 animate-pulse"></span>
              {canvasComponents.length} bileşen • Sürükleyip konumlandırabilirsin
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              size="sm"
              variant="outline"
              className="hover:scale-105 transition-all duration-200 bg-transparent"
              onClick={() => onOpenPreview?.()}
            >
              <Eye className="w-4 h-4 mr-2" />
              Tam Ekran
            </Button>
            <AlertDialog open={isClearPageConfirmOpen} onOpenChange={setIsClearPageConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="hover:scale-105 transition-all duration-200 bg-transparent">
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
                  <AlertDialogAction onClick={confirmClearPage} className="bg-red-600 hover:bg-red-700 text-white">
                    Evet, Sil
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative overflow-auto bg-white" onDragOver={handleDragOver} onDrop={handleDrop}>
        <div className="relative w-full p-4" style={{ minHeight: contentHeight }}>
          {canvasComponents.map((component) => {
            const safeX = Number(component.x) || 0;
            const safeY = Number(component.y) || 0;
            const safeW = Number((component.props as any)?.width) || 0;
            const safeH = Number((component.props as any)?.height) || 0;
            return (
              <div
                key={component.id}
                className="absolute cursor-move group hover:z-20"
                style={{
                  left: safeX,
                  top: safeY,
                  width: safeW,
                  height: safeH,
                  transform: selectedComponent === component.id ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.2s ease-in-out",
                }}
                onClick={() => handleComponentClick(component.id)}
                onMouseDown={(e) => {
                  // Canvas ofsetini hesaba kat: component container'ının (absolute parent) ekran koordinatlarındaki konumu
                  const containerEl = (e.currentTarget as HTMLElement).parentElement as HTMLElement | null;
                  const containerRect = containerEl?.getBoundingClientRect();

                  // Tıklama anındaki tutma ofseti (bileşen içinde nereye tıklandı)
                  const grabOffsetX = containerRect ? e.clientX - (containerRect.left + safeX) : e.clientX - safeX;
                  const grabOffsetY = containerRect ? e.clientY - (containerRect.top + safeY) : e.clientY - safeY;

                  const handleMouseMove = (me: MouseEvent) => {
                    const baseLeft = containerRect ? containerRect.left : 0;
                    const baseTop = containerRect ? containerRect.top : 0;
                    const newX = Math.max(0, me.clientX - baseLeft - grabOffsetX);
                    const newY = Math.max(0, me.clientY - baseTop - grabOffsetY);
                    handleComponentDrag(component.id, newX, newY);
                  };

                  const handleMouseUp = async () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                    await handleSaveProject(pages, false);
                  };

                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                }}
              >
                {renderComponent(component, selectedComponent === component.id, handleSwitchPage)}
                {selectedComponent === component.id && (
                  <>
                    <div className="absolute -top-12 -right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white shadow-lg hover:scale-110 transition-all duration-200 border border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
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
                          e.stopPropagation();
                          deleteComponent(component.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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
            );
          })}
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
  );
}