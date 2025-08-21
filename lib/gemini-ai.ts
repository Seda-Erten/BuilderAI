import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSystemPrompt, getExampleComponent, getComponentPrompt, type StylePreset } from "./prompts"
import type { Component } from "@/lib/types"

// AI yanıt tipi
export interface AIResponse {
  message: string
  success: boolean
  components?: Component[] // Birden fazla bileşen döndürmek için eklendi
}

// Gemini istemcisi
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generateComponent(
  prompt: string,
  options?: { generationMode?: "full" | "sections"; stylePreset?: StylePreset; temperature?: number }
): Promise<AIResponse> {
  try {
    const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro"
    const FALLBACK_MODEL = "gemini-1.5-flash"
    const generationConfig = {
      temperature: options?.temperature ?? 0.35, // biraz daha yaratıcı
      topP: 0.7,
      topK: 40,
      maxOutputTokens: 4096, // Tam sayfa çok-bölüm çıktılar için artırıldı
    } as any

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))
    const { typeHint, example } = getExampleComponent(prompt)
    const systemPrompt = getSystemPrompt(typeHint, example, options?.stylePreset)
    const userPrompt = getComponentPrompt(prompt, options?.stylePreset)
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

    const hasClassMatch = (base: string | undefined, re: RegExp) => {
      if (!base) return false
      return base.split(/\s+/).some((c) => re.test(c))
    }

    const normalizeComponent = (comp: any, _isChild?: boolean, _parentW?: number, _parentH?: number): any => {
      comp.props = comp.props || {}
      const type = String(comp.type || "div")
      let cls = String(comp.props.className || "")

      // Expand shorthand color classes like bg-yellow → bg-yellow-600, text-blue → text-blue-600, border-red → border-red-300
      const expandColorShorthand = (input: string): string => {
        // Supported Tailwind color keys (common)
        const colors = [
          "slate","gray","zinc","neutral","stone",
          "red","orange","amber","yellow","lime","green","emerald","teal","cyan","sky","blue","indigo","violet","purple","fuchsia","pink","rose",
          "black","white"
        ]
        const colorAlt = colors.join("|")
        return input
          // bg-color → bg-color-600 (no exception)
          .replace(new RegExp(`\\bbg-(${colorAlt})\\b(?!-)`, "g"), (_m, c) => `bg-${c}-600`)
          // text-color → text-color-600 (except black/white where -600 is odd; keep as-is for those)
          .replace(new RegExp(`\\btext-(${colorAlt})\\b(?!-)`, "g"), (_m, c) => (c === "black" || c === "white") ? `text-${c}` : `text-${c}-600`)
          // border-color → border-color-300 (lighter borders)
          .replace(new RegExp(`\\bborder-(${colorAlt})\\b(?!-)`, "g"), (_m, c) => (c === "black" || c === "white") ? `border-${c}` : `border-${c}-300`)
      }

      cls = expandColorShorthand(cls)
      
      // Basit boyut sabitleri
      const sizes = {
        button: { w: 128, h: 40 },
        input: { w: 256, h: 40 },
        card: { w: 320, h: 384 },
        text: { w: 200, h: 24 },
        div: { w: 300, h: 200 },
        badge: { w: 80, h: 28 },
        avatar: { w: 40, h: 40 },
        tabs: { w: 420, h: 260 },
        table: { w: 520, h: 260 },
        image: { w: 320, h: 180 }
      }
      
      const size = sizes[type as keyof typeof sizes] || sizes.div
      comp.props.width = size.w
      comp.props.height = size.h

      // Çocuklarda pozisyon sıfırla
      if (comp.parent) {
        comp.x = 0
        comp.y = 0
      }

      // Tip bazlı nötr sınıflar
      // Aşırı ekran dolduran sınıfları temizle
      cls = stripClasses(cls, /^(min-h-screen|h-screen|w-screen)$/)
      // Button/Input'ta gereksiz tam genişlik kaldır
      if (type === "button" || type === "input") {
        cls = stripClasses(cls, /^(w-full|max-w-full|min-w-full|w-screen)$/)
      }
      // Çocuklarda genel olarak tam genişlikten kaçın
      if (comp.parent) {
        cls = stripClasses(cls, /^(w-full|max-w-full|min-w-full)$/)
      }
      switch (comp.type) {
        case "card":
          // Konteyner renk niyetini ezmemek için bg-* zorlaması YAPMA.
          // Sadece nötr çerçeve ve iç boşluk ekle.
          {
            const neutralFrame = `border border-neutral-200 rounded-xl p-6 shadow-sm`
            comp.props.className = ensureClass(cls, neutralFrame.trim())
            // Eğer layout yoksa ve çocuk varsa, üst üste binmeyi önlemek için akış düzeni ekle
            const hasLayout = hasClassMatch(comp.props.className, /^(flex|grid)$/) || /\b(flex|grid)\b/.test(String(comp.props.className))
            if (Array.isArray(comp.children) && comp.children.length > 0 && !hasLayout) {
              comp.props.className = ensureClass(String(comp.props.className || ""), "flex flex-col gap-3")
            }
          }
          break
        case "button":
          // Renk talimatı varsa koru; aksi halde nötr koyu ekleyebilirsin
          {
            const hasBg = hasClassMatch(cls, /^bg-/)
            const hasText = hasClassMatch(cls, /^text-/)
            const baseAdd = "inline-flex items-center justify-center px-4 py-2 rounded-md focus-visible:ring-2 focus-visible:ring-neutral-400"
            const colorAdd = hasBg || hasText ? "" : " bg-neutral-900 text-white hover:bg-neutral-800"
            comp.props.className = ensureClass(cls, `${baseAdd}${colorAdd}`.trim())
          }
          // Varsayılan varyantı sadece renk belirtilmemişse ayarla
          {
            const hasBg = hasClassMatch(String(comp.props.className || ""), /^bg-/)
            const hasText = hasClassMatch(String(comp.props.className || ""), /^text-/)
            if (!comp.props.variant && !(hasBg || hasText)) {
              comp.props.variant = "default"
            }
          }
          if (!comp.props.text) comp.props.text = "Buton"
          break
        case "input":
          {
            const hasBorder = hasClassMatch(cls, /^border(-|$)/)
            const add = `${hasBorder ? "" : "border border-neutral-300 "}px-3 py-2 rounded-md focus-visible:ring-2 focus-visible:ring-neutral-400`
            comp.props.className = ensureClass(cls, add.trim())
          }
          if (!comp.props.type) comp.props.type = "text"
          if (!comp.props.placeholder) comp.props.placeholder = ""
          break
        case "text":
          {
            const hasText = hasClassMatch(cls, /^text-/)
            // Daha okunaklı satır aralığı için leading ekle
            let add = hasText ? "" : "text-neutral-900"
            add = `${add} leading-snug`
            comp.props.className = ensureClass(cls, add.trim())
          }
          if (!comp.props.text) comp.props.text = "Metin"
          break
        case "badge":
          comp.props.className = ensureClass(cls, "inline-flex items-center rounded-full px-2.5 py-1 text-xs bg-neutral-100 text-neutral-700")
          if (!comp.props.text) comp.props.text = "Badge"
          break
        case "avatar":
          comp.props.className = ensureClass(cls, "rounded-full overflow-hidden bg-neutral-200 text-neutral-700 flex items-center justify-center")
          if (!comp.props.fallback) comp.props.fallback = "AV"
          break
        case "image":
          comp.props.className = ensureClass(cls, "object-cover rounded-md")
          if (!comp.props.src) comp.props.src = "/placeholder.jpg"
          if (!comp.props.alt) comp.props.alt = "image"
          break
        case "tabs": {
          if (!Array.isArray(comp.props.tabs) || comp.props.tabs.length === 0) {
            comp.props.tabs = [
              { value: "tab-1", label: "Tab 1", content: "İçerik 1" },
              { value: "tab-2", label: "Tab 2", content: "İçerik 2" },
            ]
          }
          comp.props.className = ensureClass(cls, "")
          break
        }
        case "table":
          comp.props.className = ensureClass(cls, "w-full")
          // basit tablo veri modeli: props.columns?: string[], props.rows?: string[][]
          if (!Array.isArray(comp.props.columns) || comp.props.columns.length === 0) {
            comp.props.columns = ["Ad", "Durum", "Puan"]
          }
          if (!Array.isArray(comp.props.rows) || comp.props.rows.length === 0) {
            comp.props.rows = [["Örnek", "Aktif", "95"]]
          }
          break
        case "div":
        default: {
          let toAdd = ""
          const hasLayout = /\b(flex|grid)\b/.test(cls)
          if (Array.isArray(comp.children) && comp.children.length > 0 && !hasLayout) {
            toAdd = "flex flex-col gap-3"
          }
          comp.props.className = ensureClass(cls, toAdd)
          break
        }
      }

      if (Array.isArray(comp.children)) {
        const childParentW = comp.props.width || 320
        const childParentH = comp.props.height || 384
        comp.children = comp.children.map((ch: any) => normalizeComponent(ch, true, childParentW, childParentH))

        // Yerleşim: ebeveyn sınıfını oku
        let parentCls = String(comp.props.className || "")
        const isFlex = /\bflex\b/.test(parentCls)
        const isGrid = /\bgrid\b/.test(parentCls)
        const isFlexCol = /\bflex-col\b/.test(parentCls)

        // Ebeveyn flex/grid ise, varsayılan bir gap ekle (yoksa)
        const hasGap = /\bgap-\d+\b/.test(parentCls)
        if ((isFlex || isGrid) && !hasGap) {
          comp.props.className = ensureClass(parentCls, "gap-3")
          parentCls = String(comp.props.className)
        }

        if (isFlex || isGrid) {
          // Flex-row ise, öğeleri dikeyde ortala
          if (isFlex && !isFlexCol && !/\bitems-center\b/.test(parentCls)) {
            comp.props.className = ensureClass(parentCls, "items-center")
            parentCls = String(comp.props.className)
          }
          // Akış düzeninde: çocuklardan 'absolute' sınıfını temizle ve x/y etkisini sıfırla
          comp.children.forEach((child: any) => {
            const ccls = String(child?.props?.className || "")
            const cleaned = ccls
              .split(/\s+/)
              .filter(Boolean)
              .filter((cn) => cn !== "absolute")
              .join(" ")
            child.props = child.props || {}
            // Flex-row hizası için child'a self-center ekle
            child.props.className = ensureClass(cleaned, isFlex && !isFlexCol ? "self-center" : "")
            child.x = 0
            child.y = 0
          })
        } else {
          // Eski düzen: koordinat tabanlı yerleşim (yatay veya dikey)
          if (isFlex && !isFlexCol) {
            let currentX = 0
            comp.children.forEach((child: any) => {
              child.x = currentX
              child.y = 0
              currentX += (child.props?.width || 80) + 12
            })
          } else {
            // Dikey
            let currentY = 0
            comp.children.forEach((child: any) => {
              child.y = currentY
              child.x = 0
              currentY += (child.props?.height || 40) + 12
            })
          }
        }
      }
      return comp
    }

    // Debug: Post-AI className snapshot
    if (process.env.NEXT_PUBLIC_DEBUG_COLORS === '1') {
      try {
        console.log("[DEBUG] post-AI classNames:", componentsArray.map((c: any) => ({ id: c.id, type: c.type, className: c?.props?.className })))
      } catch {}
    }

    const normalized = componentsArray.map((c) => normalizeComponent({ ...c }, false))

    // Heuristic: If the prompt implies a colored form/card (e.g., "pembe login form")
    // and the color ended up on a child button while the container lacks a bg-*,
    // move the color classes from the button to the container and neutralize the button.
    const adjustForContainerColorIntent = (items: any[], promptText: string) => {
      const p = (promptText || "").toLowerCase()
      const mentionsForm = /(login|giriş|form|kayıt)/.test(p)
      const colorWords = [
        "red","orange","amber","yellow","lime","green","emerald","teal","cyan","sky","blue","indigo","violet","purple","fuchsia","pink","rose",
        "kırmızı","turuncu","amber","sarı","lime","yeşil","zümrüt","turkuaz","camgöbeği","gökyüzü","mavi","lacivert","mor","morumsu","fuşya","pembe","gül"
      ]
      const mentionsColor = colorWords.some(w => p.includes(w))
      const mentionsButton = /(buton|button|cta)/.test(p)
      if (!(mentionsForm && mentionsColor) || mentionsButton) return items

      const hasBg = (cls?: string) => !!(cls && /\bbg-\S+/.test(cls))
      const extractColorClasses = (cls: string) => {
        // quick typo fix: purplez -> purple
        cls = (cls || "").replace(/purplez/g, "purple")
        const parts = cls.split(/\s+/).filter(Boolean)
        const keep: string[] = []
        const moveToContainer: string[] = []
        const dropFromButton: string[] = []
        for (const c of parts) {
          // capture plain and variant-prefixed color utilities
          if (/^(bg-|text-|border-)/.test(c)) {
            moveToContainer.push(c)
          } else if (/^(hover:|focus:|active:)(bg-|text-|border-)/.test(c)) {
            // don't move hover/focus colors to container; just drop from button
            dropFromButton.push(c)
          } else {
            keep.push(c)
          }
        }
        return { keep, moveToContainer, dropFromButton }
      }
      const addUnique = (base: string, add: string) => {
        const set = new Set((base || "").split(/\s+/).filter(Boolean))
        add.split(/\s+/).filter(Boolean).forEach(c => set.add(c))
        return Array.from(set).join(" ")
      }

      const visit = (comp: any) => {
        if (comp && (comp.type === 'card' || comp.type === 'div') && Array.isArray(comp.children) && !hasBg(comp.props?.className)) {
          for (const child of comp.children) {
            if (child?.type === 'button' && typeof child?.props?.className === 'string') {
              const { keep, moveToContainer } = extractColorClasses(child.props.className)
              if (moveToContainer.length) {
                // Move color to container and neutralize the button
                comp.props = comp.props || {}
                comp.props.className = addUnique(String(comp.props.className || ''), moveToContainer.join(' '))
                child.props.className = keep.join(' ')
                // Make button neutral/outline if no explicit color remains
                const childHasColor = /\b(bg-|text-)\S+/.test(child.props.className || '')
                if (!childHasColor) {
                  child.props.variant = child.props.variant || 'outline'
                }
                break
              }
            }
          }
        }
        if (Array.isArray(comp?.children)) comp.children.forEach(visit)
      }

      items.forEach(visit)
      return items
    }

    const containerAdjusted = adjustForContainerColorIntent(normalized, prompt)

    // Debug: Post-normalize (after container color adjustment) className snapshot
    if (process.env.NEXT_PUBLIC_DEBUG_COLORS === '1') {
      try {
        console.log("[DEBUG] post-normalize classNames:", containerAdjusted.map((c: any) => ({ id: c.id, type: c.type, className: c?.props?.className })))
      } catch {}
    }

    // Basit polish: sadece temel styling (renk belirtilmişse zorlamaz)
    const polishComponents = (items: any[]) => {
      const addClass = (base: string | undefined, extra: string) => {
        const existing = String(base || "").split(/\s+/).filter(Boolean)
        const newClasses = extra.split(/\s+/).filter(Boolean)
        const combined = [...new Set([...existing, ...newClasses])]
        return combined.join(" ")
      }

      const hasClassMatch = (base: string | undefined, re: RegExp) => {
        if (!base) return false
        return base.split(/\s+/).some((c) => re.test(c))
      }

      const polish = (comp: any) => {
        const type = comp.type

        switch (type) {
          case "card": {
            const hasBg = hasClassMatch(comp.props.className, /^(bg-|backdrop-)/)
            const add = `${hasBg ? "" : "bg-white "}rounded-lg shadow-md p-6 border border-gray-200`
            comp.props.className = addClass(comp.props.className, add.trim())
            break
          }
          case "button": {
            const hasBg = hasClassMatch(comp.props.className, /^bg-/)
            const hasText = hasClassMatch(comp.props.className, /^text-/)
            const baseAdd = "rounded-lg px-4 py-2 transition-colors"
            const colorAdd = hasBg || hasText ? "" : " bg-neutral-900 text-white hover:bg-neutral-800"
            comp.props.className = addClass(comp.props.className, `${baseAdd}${colorAdd}`.trim())
            break
          }
          case "input": {
            const hasBorder = hasClassMatch(comp.props.className, /^border(-|$)/)
            const add = `${hasBorder ? "" : "border border-gray-300 "}rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`
            comp.props.className = addClass(comp.props.className, add.trim())
            break
          }
          case "text": {
            const hasText = hasClassMatch(comp.props.className, /^text-/)
            const add = hasText ? "" : "text-gray-900"
            comp.props.className = addClass(comp.props.className, add)
            break
          }
        }

        if (Array.isArray(comp.children)) {
          comp.children.forEach(polish)
        }
        return comp
      }

      return items.map(polish)
    }

    const polished = polishComponents(containerAdjusted)

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
