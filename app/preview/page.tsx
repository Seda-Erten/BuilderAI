"use client";

/**
 * Amaç: Builder'da oluşturulan sayfayı yeni sekmede piksel piksele önizlemek.
 * URL Parametreleri: page (sayfa id), w (canvas genişliği px) → builder ile aynı görünüm.
 * Yerleşim: absolute konumlandırma; bileşenler x,y koordinatlarıyla yerleştirilir.
 */
// Bu sayfa, builder'da oluşturulan projeyi yeni sekmede/önizleme modunda gösterir.
// Önemli noktalar:
// - Supabase'ten kullanıcı projesini çeker (auth zorunlu).
// - URL arama parametreleri:
//   - page: Hangi sayfanın görüntüleneceği (id)
//   - w: Canvas genişliği (px). Builder ile birebir aynı görünüm için kullanılır.
// - Mutlak (absolute) yerleşim: Bileşenler x,y koordinatlarına göre konumlandırılır.

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ProjectPages, Component } from "@/lib/types";
import { renderComponent } from "@/lib/component-renderer";

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = searchParams.get("page");
  const widthParam = searchParams.get("w");

  const [pages, setPages] = useState<ProjectPages | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string | null>(pageParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // 1) Kullanıcıyı doğrula
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }

        // 2) Varsayılan proje verisini çek (user_projects tablosundan)
        const { data, error } = await supabase
          .from("user_projects")
          .select("project_data")
          .eq("user_id", user.id)
          .eq("project_name", "default_project")
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data && data.project_data) {
          const projectPages = data.project_data as ProjectPages;
          setPages(projectPages);
          const firstId = Object.keys(projectPages)[0];
          setCurrentPageId((prev) => prev || firstId);
        } else {
          setPages({} as ProjectPages);
        }
      } catch (e: any) {
        setError(e.message || "Önizleme yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) return null;
  if (!pages || !currentPageId) return null;

  const pageData = pages[currentPageId];
  const comps: Component[] = pageData?.components || [];
  const pageBg = pageData?.backgroundColor || "#ffffff";
  // İçerik yüksekliği: En aşağıdaki bileşenin altına + tampon alan
  const contentHeight = Math.max(
    800,
    ...comps.map((c) => (Number(c.y) || 0) + (Number((c.props as any)?.height) || 0))
  ) + 200;

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
      {/* widthParam varsa, builder canvas ile piksel piksele eşleşmesi için genişliği sabitle ve ortala */}
      <div className={widthParam ? "mx-auto" : undefined} style={widthParam ? { width: Number(widthParam) || undefined } : undefined}>
        <div
          className="relative w-full"
          style={{ minHeight: contentHeight }}
        >
          {comps.map((component) => (
            <div
              key={component.id}
              className="absolute" // absolute: her bileşen kendi x,y'sine göre konumlanır
              style={{
                left: Number(component.x) || 0,
                top: Number(component.y) || 0,
                width: Number((component.props as any)?.width) || undefined,
                height: Number((component.props as any)?.height) || undefined,
              }}
            >
              {renderComponent(component, false)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
