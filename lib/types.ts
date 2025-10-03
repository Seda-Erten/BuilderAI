
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
    width?: number
    height?: number 
    targetPageId?: string 
    value?: string 
    [key: string]: any 
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
    name: string
    components: Component[]
    backgroundColor?: string
  }
}

