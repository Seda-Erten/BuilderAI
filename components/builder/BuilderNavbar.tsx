import { Button } from "@/components/ui/button";
import { Plus, Save, FolderOpen, Eye, Download, Settings, LogOut, X } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { ProjectPages } from "@/lib/types";
import { useRouter } from "next/navigation";

interface BuilderNavbarProps {
  pages: ProjectPages;
  currentPageId: string;
  editingPageId: string | null;
  setEditingPageId: (id: string | null) => void;
  handleSwitchPage: (pageId: string) => void;
  handleNewPage: () => void;
  handleDeletePage: (pageId: string) => void;
  handlePageNameChange: (pageId: string, newName: string) => void;
  handleSaveProject: (pages: ProjectPages, showSuccessMessage: boolean) => void;
  handleLoadProject: () => void;
  handleExportCode: () => void;
  handleLogout: () => void;
  handleOpenPreview: () => void;
}

export function BuilderNavbar({
  pages,
  currentPageId,
  editingPageId,
  setEditingPageId,
  handleSwitchPage,
  handleNewPage,
  handleDeletePage,
  handlePageNameChange,
  handleSaveProject,
  handleLoadProject,
  handleExportCode,
  handleLogout,
  handleOpenPreview,
}: BuilderNavbarProps) {
  const router = useRouter();

  return (
    <nav className="relative z-50 bg-[#1E293B]/95 backdrop-blur-2xl border-b border-slate-700/50 shadow-2xl">
      <div className="max-w-full mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden group-hover:scale-110 transition-all duration-300">
              <Image src="/technology.png" alt="Logo" fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#6366F1] bg-clip-text text-transparent">
                AI Builder Pro
              </h1>
             
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1 backdrop-blur-sm">
              {Object.entries(pages).map(([pageId, pageData]) => (
                <div key={pageId} className="relative group">
                  {editingPageId === pageId ? (
                    <Input
                      value={pageData.name}
                      onChange={(e) => handlePageNameChange(pageId, e.target.value)}
                      onBlur={() => setEditingPageId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingPageId(null);
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
                        e.stopPropagation();
                        handleDeletePage(pageId);
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
              onClick={() => handleSaveProject(pages, true)}
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
              onClick={handleOpenPreview}
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
              className="bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#6366F1] hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}