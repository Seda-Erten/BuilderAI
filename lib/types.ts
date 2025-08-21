
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
    className?: string // className'i açıkça string olarak tanımladık
    width?: number // Genişlik eklendi
    height?: number // Yükseklik eklendi
    targetPageId?: string // Hedef sayfa ID'si eklendi
    value?: string // Yeni: Input bileşenleri için değer prop'u
    [key: string]: any // Diğer dinamik prop'lar için
  }
  children?: Component[] // İç içe bileşenler için eklendi
}

export interface Message {
  type: "user" | "ai" | "error" | "success";
  content: string
  timestamp: Date
}

// ProjectPages yapısı güncellendi
export interface ProjectPages {
  [pageId: string]: {
    name: string // Sayfa adı eklendi
    components: Component[]
    backgroundColor?: string // Sayfa arka plan rengi (örn: #ffffff veya Tailwind arbitrary: bg-[#ff0000])
  }
}

