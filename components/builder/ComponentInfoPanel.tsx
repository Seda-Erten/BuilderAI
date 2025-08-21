import { Card } from "@/components/ui/card";
import { Code, Palette, Star, Users, Zap, Rocket } from "lucide-react";
import { Component, ProjectPages } from "@/lib/types";
import { ComponentProperties } from "@/components/builder/component-properties";
import { Badge } from "../ui/badge";

interface ComponentInfoPanelProps {
  selectedComponent: string | null;
  pages: ProjectPages;
  currentPageId: string;
  updateComponentProps: (id: string, newProps: any) => void;
  deleteComponent: (id: string) => void;
  replaceComponent?: (id: string, newType: Component["type"]) => void;
}

export function ComponentInfoPanel({
  selectedComponent,
  pages,
  currentPageId,
  updateComponentProps,
  deleteComponent,
  replaceComponent,
}: ComponentInfoPanelProps) {
  const canvasComponents = pages[currentPageId]?.components || [];
  const findById = (list: Component[], id: string | null): Component | null => {
    if (!id) return null;
    for (const c of list) {
      if (c.id === id) return c;
      if (c.children && c.children.length) {
        const found = findById(c.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  const currentSelectedComponent = findById(canvasComponents, selectedComponent);

  return (
    <Card className="h-full bg-[#1E293B]/95 backdrop-blur-2xl border-slate-700/50 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col min-h-0">
      <div className="p-6 border-b border-slate-700/50 sticky top-0 z-10 bg-[#1E293B]/95 backdrop-blur-2xl">
        <div className="flex items-center space-x-3">
          <Code className="w-6 h-6 text-[#06B6D4]" />
          <div>
            <h2 className="text-xl font-semibold text-[#F8FAFC]">Bileşen Bilgisi</h2>
            <p className="text-sm text-slate-400">Detaylar ve özellikler</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-auto min-h-0">
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

        {currentSelectedComponent && (
          <div className="space-y-3 p-4 rounded-xl border border-slate-700/50 bg-slate-800/40">
            <h3 className="text-[#F8FAFC] font-medium">Bileşeni Değiştir</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                className="px-3 py-1.5 rounded-md border border-slate-700/60 text-slate-200 hover:bg-slate-700/40"
                onClick={() => replaceComponent?.(currentSelectedComponent.id, "button")}
              >
                Butonla Değiştir
              </button>
              <button
                className="px-3 py-1.5 rounded-md border border-slate-700/60 text-slate-200 hover:bg-slate-700/40"
                onClick={() => replaceComponent?.(currentSelectedComponent.id, "text")}
              >
                Metinle Değiştir
              </button>
              <button
                className="px-3 py-1.5 rounded-md border border-slate-700/60 text-slate-200 hover:bg-slate-700/40"
                onClick={() => replaceComponent?.(currentSelectedComponent.id, "input")}
              >
                Input ile Değiştir
              </button>
            </div>
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
              <Badge className="bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30">Aktif</Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}