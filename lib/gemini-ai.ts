import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSystemPrompt, getExampleComponent, getComponentPrompt } from "./prompts"
import type { Component } from "@/lib/types"

// AI yanıt tipi
export interface AIResponse {
  message: string
  success: boolean
  components?: Component[] // Birden fazla bileşen döndürmek için eklendi
}

// Gemini istemcisi
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generateComponent(prompt: string, generationMode?: "full" | "sections"): Promise<AIResponse> {
  try {
    const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro"
    const FALLBACK_MODEL = "gemini-1.5-flash"
    const generationConfig = {
      temperature: 0.2, // daha deterministik
      topP: 0.7,
      topK: 40,
      maxOutputTokens: 4096, // Tam sayfa çok-bölüm çıktılar için artırıldı
    } as any

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))
    const { typeHint, example } = getExampleComponent(prompt)
    const systemPrompt = getSystemPrompt(typeHint, example)
    const userPrompt = getComponentPrompt(prompt)
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

    console.log("Gemini'ye gönderilen prompt:", fullPrompt) // Gönderilen prompt'u logla

    // Önce tercih edilen model, sonra fallback; 429 için kısa backoff ile 1 yeniden deneme
    let result: any
    try {
      const primary = genAI.getGenerativeModel({ model: DEFAULT_MODEL, generationConfig })
      result = await primary.generateContent(fullPrompt)
    } catch (primaryErr: any) {
      const msg = primaryErr?.message || ""
      console.warn(`${DEFAULT_MODEL} başarısız, ${FALLBACK_MODEL} modeline düşülüyor.`, msg)
      try {
        const fallback = genAI.getGenerativeModel({ model: FALLBACK_MODEL, generationConfig })
        result = await fallback.generateContent(fullPrompt)
      } catch (fallbackErr: any) {
        const fMsg = fallbackErr?.message || ""
        const is429 = fMsg.includes("429") || fMsg.toLowerCase().includes("too many requests")
        if (is429) {
          console.warn("429 tespit edildi, kısa bekleme sonrası bir kez daha denenecek (flash)")
          await sleep(1200)
          const retry = genAI.getGenerativeModel({ model: FALLBACK_MODEL, generationConfig })
          result = await retry.generateContent(fullPrompt)
        } else {
          throw fallbackErr
        }
      }
    }
    const response = result.response
    const generatedText = response.text()

    console.log("AI'dan gelen ham yanıt:", generatedText) // AI'dan gelen ham yanıtı logla

    // AI yanıtından JSON çıkarımı için dayanıklı yardımcılar
    const extractFirstCodeBlock = (txt: string): string | null => {
      // ```json ... ``` veya ``` ... ```
      const fence = txt.match(/```[a-zA-Z]*\n([\s\S]*?)\n```/)
      return fence && fence[1] ? fence[1].trim() : null
    }

    const extractBalanced = (txt: string, open: string, close: string): string | null => {
      const start = txt.indexOf(open)
      if (start === -1) return null
      let depth = 0
      for (let i = start; i < txt.length; i++) {
        const ch = txt[i]
        if (ch === open) depth++
        else if (ch === close) {
          depth--
          if (depth === 0) {
            return txt.slice(start, i + 1)
          }
        }
      }
      return null
    }

    let parsedData: any
    const codeInner = extractFirstCodeBlock(generatedText)
    const tryParse = (raw: string | null, label: string) => {
      if (!raw) return null
      try {
        return JSON.parse(raw)
      } catch (err) {
        console.error(`JSON parse hatası (${label}):`, err, "Çıkarılan JSON:", raw)
        return null
      }
    }

    parsedData = tryParse(codeInner, "kod bloğu")
    if (!parsedData) {
      const arr = extractBalanced(generatedText, "[", "]")
      parsedData = tryParse(arr, "dengeli dizi")
    }
    if (!parsedData) {
      const obj = extractBalanced(generatedText, "{", "}")
      parsedData = tryParse(obj, "dengeli nesne")
    }
    if (!parsedData) {
      console.error("Geçersiz AI yanıtı: JSON bulunamadı veya parse edilemedi.", generatedText)
      return {
        message: "Yapay zekadan gelen JSON kodu ayrıştırılamadı. Lütfen promptu tekrar gönderin.",
        success: false,
      }
    }

    // Parsed verinin bir Component dizisi olduğundan emin ol
    const componentsArray: Component[] = Array.isArray(parsedData)
      ? parsedData
      : parsedData.component // Eğer AI tek bir 'component' objesi döndürdüyse
        ? [parsedData.component]
        : parsedData.components // Eğer AI bir objenin içinde 'components' dizisi döndürdüyse
          ? parsedData.components
          : []

    if (componentsArray.length === 0) {
      console.warn("AI bileşen oluşturmadı veya boş bir dizi döndürdü.")
      return {
        message: "Yapay zekadan bileşen oluşturulamadı veya boş bir yanıt geldi. Lütfen promptunuzu netleştirin.",
        success: false,
      }
    }

    // shadcn/v0 nötr stil için normalizasyon
    const ensureClass = (base: string, add: string) => {
      if (!base || typeof base !== "string") return add
      const set = new Set(base.split(/\s+/).filter(Boolean))
      add.split(/\s+/).forEach((cls) => set.add(cls))
      return Array.from(set).join(" ")
    }

    const stripClasses = (base: string, toRemove: RegExp) => {
      if (!base || typeof base !== "string") return ""
      return base
        .split(/\s+/)
        .filter((cls) => !toRemove.test(cls))
        .join(" ")
        .trim()
    }

    const normalizeComponent = (comp: any, isChild = false, parentW = 1200, parentH = 900): any => {
      comp.props = comp.props || {}
      const type = String(comp.type)
      
      // Basit boyut sabitleri
      const sizes = {
        button: { w: 128, h: 40 },
        input: { w: 256, h: 40 },
        card: { w: 320, h: 384 },
        text: { w: 200, h: 24 },
        div: { w: 300, h: 200 }
      }
      
      const size = sizes[type as keyof typeof sizes] || sizes.div
      comp.props.width = size.w
      comp.props.height = size.h

      // Çocuklarda pozisyon sıfırla
      if (isChild) {
        comp.x = 0
        comp.y = 0
      }

      // Tip bazlı nötr sınıflar
      let cls = String(comp.props.className || "")
      // Aşırı ekran dolduran sınıfları temizle
      cls = stripClasses(cls, /^(min-h-screen|h-screen|w-screen)$/)
      // Button/Input'ta gereksiz tam genişlik kaldır
      if (type === "button" || type === "input") {
        cls = stripClasses(cls, /^(w-full|max-w-full|min-w-full|w-screen)$/)
      }
      // Çocuklarda genel olarak tam genişlikten kaçın
      if (isChild) {
        cls = stripClasses(cls, /^(w-full|max-w-full|min-w-full)$/)
      }
      switch (comp.type) {
        case "card":
          comp.props.className = ensureClass(cls, "bg-white border border-neutral-200 rounded-xl p-6 shadow-sm")
          break
        case "button":
          // variant'a göre hafifçe değişebilir; en azından nötr default ekle
          comp.props.className = ensureClass(cls, "inline-flex items-center justify-center px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-md")
          if (!comp.props.variant) comp.props.variant = "default"
          if (!comp.props.text) comp.props.text = "Buton"
          break
        case "input":
          comp.props.className = ensureClass(cls, "px-3 py-2 border border-neutral-300 rounded-md focus-visible:ring-2 focus-visible:ring-neutral-400")
          if (!comp.props.type) comp.props.type = "text"
          if (!comp.props.placeholder) comp.props.placeholder = ""
          break
        case "text":
          comp.props.className = ensureClass(cls, "text-neutral-900")
          if (!comp.props.text) comp.props.text = "Metin"
          break
        case "div":
        default:
          comp.props.className = ensureClass(cls, "")
          break
      }

      if (Array.isArray(comp.children)) {
        const childParentW = comp.props.width || 320
        const childParentH = comp.props.height || 384
        comp.children = comp.children.map((ch: any) => normalizeComponent(ch, true, childParentW, childParentH))
        
        // Çocukları dikey olarak yerleştir
        let currentY = 0
        comp.children.forEach((child: any) => {
          child.y = currentY
          child.x = 0
          currentY += (child.props?.height || 40) + 12
        })
      }
      return comp
    }

    const normalized = componentsArray.map((c) => normalizeComponent({ ...c }, false))

    // Basit polish: sadece temel styling
    const polishComponents = (items: any[]) => {
      const addClass = (base: string | undefined, extra: string) => {
        const existing = String(base || "").split(/\s+/).filter(Boolean)
        const newClasses = extra.split(/\s+/).filter(Boolean)
        const combined = [...new Set([...existing, ...newClasses])]
        return combined.join(" ")
      }
      
      const polish = (comp: any) => {
        const type = comp.type
        
        // Temel styling
        switch (type) {
          case "card":
            comp.props.className = addClass(comp.props.className, "bg-white rounded-lg shadow-md p-6 border border-gray-200")
            break
          case "button":
            comp.props.className = addClass(comp.props.className, "bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors")
            break
          case "input":
            comp.props.className = addClass(comp.props.className, "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500")
            break
          case "text":
            comp.props.className = addClass(comp.props.className, "text-gray-900")
            break
        }
        
        if (Array.isArray(comp.children)) {
          comp.children.forEach(polish)
        }
        return comp
      }
      
      return items.map(polish)
    }

    const polished = polishComponents(normalized)

    // Tüm ağaçta benzersiz id'ler üret (React key uyarısını önlemek için)
    const ensureUniqueIds = (items: any[]) => {
      const seen = new Map<string, number>()
      const makeUnique = (proposed: string | undefined, type: string) => {
        const baseRaw = (proposed && String(proposed)) || String(type || "comp")
        const base = baseRaw.trim() || "comp"
        const current = seen.get(base) || 0
        if (current === 0) {
          seen.set(base, 1)
          return base
        } else {
          const next = current + 1
          seen.set(base, next)
          return `${base}-${next}`
        }
      }
      const visit = (comp: any) => {
        comp.id = makeUnique(comp.id, comp.type)
        if (Array.isArray(comp.children)) {
          comp.children.forEach(visit)
        }
        return comp
      }
      return items.map(visit)
    }

    const uniqueComponents = ensureUniqueIds(polished)

    // Basit Auto-Layout: Birden fazla üst seviye bileşen aynı/benzer y değerine sahipse (örn. 0),
    // sunum kalitesi için dikeyde istifleyelim.
    try {
      const manySameY = uniqueComponents.filter((c) => (c.y ?? 0) <= 5).length >= Math.max(2, Math.floor(uniqueComponents.length * 0.6))
      if (uniqueComponents.length >= 2 && manySameY) {
        let cursorY = 0
        const margin = 16
        const left = 16
        const maxW = 1100
        uniqueComponents.forEach((c) => {
          const w = Math.min(Number(c.props?.width ?? maxW), maxW)
          const h = Number(c.props?.height ?? 60)
          c.x = left
          c.y = cursorY
          c.props = { ...(c.props || {}), width: w, height: h }
          cursorY += h + margin
        })
      }
    } catch { /* görsel düzen başarısız olsa da hata bastırılır */ }

    return {
      message: parsedData.message || "Bileşen başarıyla oluşturuldu.",
      components: uniqueComponents,
      success: true,
    }
  } catch (err: any) {
    console.error("generateComponent fonksiyonunda beklenmeyen hata:", err)
    return {
      message: err?.message || "Beklenmeyen bir sunucu hatası oluştu.",
      success: false,
    }
  }
}
