import type { ProjectPages, Component } from "@/lib/types"

/**
 * Amaç
 * - Tarayıcı localStorage üzerinde proje sayfalarını (ProjectPages) güvenli şekilde saklamak, okumak ve temizlemek.
 * - Basit sürüm/format geriye dönük uyumluluk (eski dizi formatını yeni sayfa yapısına dönüştürme) sağlar.

 */

const STORAGE_KEY = "ai-builder-project-pages"

/**
 * Projeyi localStorage'a yazar.
 * @param pages ProjectPages nesnesi
 */
export const saveProject = (pages: ProjectPages) => {
  try {
    const serializedState = JSON.stringify(pages)
    localStorage.setItem(STORAGE_KEY, serializedState)
    console.log("Proje yerel depolamaya kaydedildi.")
  } catch (error) {
    console.error("Projeyi kaydederken hata oluştu:", error)
  }
}

/**
 * Projeyi localStorage'tan okur ve eski formatları gerekiyorsa yeni şemaya dönüştürür.
 * @returns ProjectPages veya null
 */
export const loadProject = (): ProjectPages | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)
    if (serializedState === null) {
      return null
    }
    console.log("Proje yerel depolamadan yüklendi.")
    const parsedState = JSON.parse(serializedState) as ProjectPages

    for (const pageId in parsedState) {
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
