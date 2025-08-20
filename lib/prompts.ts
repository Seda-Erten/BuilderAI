import shadcnProps from "@/lib/shadcn-component-props.json"

// Shadcn props rehberini kısa metne dönüştür (özet)
function buildPropsGuide(): string {
  try {
    const arr = Array.isArray(shadcnProps) ? (shadcnProps as any[]) : []
    if (!arr.length) return ""
    const items = arr.slice(0, 20)
    const lines = items.map((it) => {
      const name = String(it?.type || it?.name || "component")
      const props = it?.props ? Object.entries(it.props) : []
      const brief = props
        .slice(0, 8)
        .map(([k, v]: any) => {
          const typ = typeof v === "object" && v?.type ? v.type : typeof v
          const opts = v?.options && Array.isArray(v.options) ? `(${v.options.join("|")})` : ""
          return `${k}:${typ}${opts}`
        })
        .join(", ")
      return `- ${name}: ${brief}`
    })
    return [
      "BİLEŞEN-PROPS KILAVUZU (özet):",
      ...lines,
      "Not: width/height sayıdır (px). Sadece JSON üret.",
    ].join("\n")
  } catch {
    return ""
  }
}

// Prompt'tan minimal tür tahmini
function detectComponentType(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes("login") || p.includes("giriş") || p.includes("form") || p.includes("kayıt")) return "loginForm"
  if (p.includes("navbar") || p.includes("menü") || p.includes("navigation") || p.includes("üst bar")) return "navbar"
  return "hero"
}

// AI'ya verilecek minimal örnek bileşeni döndür (küçük ve net)
export const getExampleComponent = (prompt: string): { typeHint: string; example: string } => {
  const typeHint = detectComponentType(prompt)
  const examples: Record<string, any> = {
    hero: {
      id: "hero-1",
      type: "div",
      x: 16,
      y: 16,
      props: { className: "p-8 rounded-lg bg-blue-600 text-white", width: 800, height: 240 },
      children: [
        { id: "title-1", type: "text", x: 0, y: 0, props: { text: "Başlık", className: "text-3xl font-bold", width: 200, height: 36 } },
        { id: "cta-1", type: "button", x: 0, y: 56, props: { text: "Hemen Başla", variant: "default", size: "lg", className: "bg-white text-blue-700 rounded-md", width: 140, height: 40 } }
      ]
    },
    loginForm: {
      id: "card-1",
      type: "card",
      x: 16,
      y: 16,
      props: { className: "bg-white rounded-lg shadow-md p-6", width: 320, height: 220 },
      children: [
        { id: "email-1", type: "input", x: 0, y: 0, props: { placeholder: "Email", type: "email", className: "w-64 h-10 border rounded-md px-3", width: 256, height: 40 } },
        { id: "submit-1", type: "button", x: 0, y: 56, props: { text: "Giriş Yap", variant: "default", size: "default", className: "w-32 h-10 bg-blue-600 text-white rounded-md", width: 128, height: 40 } }
      ]
    },
    navbar: {
      id: "nav-1",
      type: "div",
      x: 0,
      y: 0,
      props: { className: "w-full h-16 bg-white border-b flex items-center justify-between px-6", width: 1100, height: 64 },
      children: [
        { id: "brand-1", type: "text", x: 0, y: 0, props: { text: "Logo", className: "font-semibold", width: 80, height: 24 } },
        { id: "cta-1", type: "button", x: 0, y: 0, props: { text: "Giriş", variant: "secondary", size: "sm", className: "px-3 py-2 bg-neutral-900 text-white rounded-md", width: 80, height: 36 } }
      ]
    }
  }

  const example = examples[typeHint] || examples.hero
  return { typeHint, example: JSON.stringify([example], null, 2) }
}

// Geliştirilmiş system prompt
export const getSystemPrompt = (typeHint: string, exampleJson: string): string => {
  const propsGuide = buildPropsGuide()
  return `Sen shadcn/ui ile uyumlu modern web bileşenleri oluşturan bir AI asistanısın. 
Her zaman SADECE geçerli JSON döndür.

KURALLAR:
1) Çıktı mutlaka JSON array: [component1, component2, ...]
2) Bileşen tipleri: "button", "text", "input", "card", "div"
3) İç içe yapı için "children": [] kullan
4) Zorunlu props: className, width, height. 
   Metinsel elemanlar için text veya placeholder ekle.
5) ID kuralı: küçük harf + tire + sayı (ör: "btn-1", "card-2").
6) Shadcn props kullan:
   - button → { variant: "default"|"secondary"|"destructive"|"outline"|"ghost"|"link", size: "default"|"sm"|"lg"|"icon" }
   - input  → { type: "text"|"email"|"password"|"number", placeholder: string }
7) Tailwind stil rehberi:
   - spacing: p-4, p-6, gap-4
   - border: border, border-gray-200
   - shadow: shadow-sm, shadow-md
   - radius: rounded-md, rounded-lg
   - renkler: bg-blue-600, text-white, text-gray-900

${propsGuide}

TASARIM KILAVUZU:
- Minimal, modern, erişilebilir (focus halkaları, kontrast uyumlu).
- Genişlikler piksel cinsinden (button: 128x40, input: 256x40, card: 320x240, text: 200x24).
- Aşırı büyük boyutlardan kaçın (örn: w-full, h-screen yok).
- Bir bileşen içinde düzenli aralıklarla children yerleşsin.

ÖRNEK:
${exampleJson}

Sadece JSON döndür.`
}

// Geliştirilmiş kullanıcı prompt'u
export const getComponentPrompt = (userRequest: string): string => {
  return `İstek: "${userRequest}"

Kurallar:
- Sadece geçerli JSON döndür (kod bloğu veya açıklama yok).
- Çıktı mutlaka [component, ...] dizisi olsun.
- Bileşen tipleri: "button", "text", "input", "card", "div".
- Shadcn kurallarına uygun variant ve size props kullan.
- ID'ler küçük harf + tire + sayı formatında olsun.

Kalite:
- Modern, minimal, erişilebilir.
- Tailwind className: p-4, gap-4, rounded-md|lg, shadow-sm|md, border-gray-200.
- Renkler: mavi (bg-blue-600), beyaz (bg-white), gri (text-gray-900).

Sadece JSON döndür.`
}
