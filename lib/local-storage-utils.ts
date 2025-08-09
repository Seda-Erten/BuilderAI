import type { ProjectPages, Component } from "@/lib/types"

const STORAGE_KEY = "ai-builder-project-pages"

export const saveProject = (pages: ProjectPages) => {
  try {
    const serializedState = JSON.stringify(pages)
    localStorage.setItem(STORAGE_KEY, serializedState)
    console.log("Proje yerel depolamaya kaydedildi.")
  } catch (error) {
    console.error("Projeyi kaydederken hata oluştu:", error)
  }
}

export const loadProject = (): ProjectPages | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)
    if (serializedState === null) {
      return null
    }
    console.log("Proje yerel depolamadan yüklendi.")
    const parsedState = JSON.parse(serializedState) as ProjectPages

    // Eski formatı yeni formata dönüştürme (eğer varsa)
    // Eğer kaydedilen veri sadece Component[] dizisi ise, onu { name: "...", components: [] } formatına dönüştür.
    // Bu, önceki sürümlerden kalan verilerin uyumlu olmasını sağlar.
    for (const pageId in parsedState) {
      // Eğer pageId'nin değeri bir dizi ise (eski format) veya name özelliği yoksa
      if (Array.isArray(parsedState[pageId]) || !parsedState[pageId].name) {
        parsedState[pageId] = {
          name: pageId.replace("page-", "Sayfa "), // Varsayılan bir isim ver
          components: Array.isArray(parsedState[pageId]) ? (parsedState[pageId] as unknown as Component[]) : [],
        }
      }
    }

    return parsedState
  } catch (error) {
    console.error("Projeyi yüklerken hata oluştu:", error)
    return null
  }
}

export const clearProject = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log("Yerel depolamadaki proje temizlendi.")
  } catch (error) {
    console.error("Projeyi temizlerken hata oluştu:", error)
  }
}
