// Bu dosya, proje genelinde kullanılacak tip tanımlarını içerir.

export interface Component {
  id: string
  type: string
  x: number
  y: number
  props: {
    text?: string
    placeholder?: string
    title?: string
    content?: string
    variant?: string
    type?: string
    className?: string
    width?: number // Genişlik eklendi
    height?: number // Yükseklik eklendi
    targetPageId?: string // Hedef sayfa ID'si eklendi
    [key: string]: any // Diğer dinamik prop'lar için
  }
}

export interface Message {
  type: "user" | "ai" | "error"
  content: string
  timestamp: Date
}

// ProjectPages yapısı güncellendi
export interface ProjectPages {
  [pageId: string]: {
    name: string // Sayfa adı eklendi
    components: Component[]
  }
}
