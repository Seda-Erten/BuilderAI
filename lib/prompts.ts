// Bu dosya, Gemini AI'ya gönderilen prompt'ları üretir.
// Amaç: AI'nın yalnızca geçerli JSON üretmesini sağlamak ve shadcn/ui + Tailwind
// tasarım ilkelerine uygun bileşenler oluşturmasını yönlendirmek.
// Burada iki ana prompt üretici bulunur:
// - getSystemPrompt: Modelin genel davranışını ve şemayı tanımlar (sistem mesajı gibi).
// - getComponentPrompt: Kullanıcı isteğine özel üretim talimatı (kullanıcı mesajı).

import shadcnProps from "@/lib/shadcn-component-props.json"

// Shadcn props rehberini kısa metne dönüştür (özet)
// - AI'nın shadcn bileşenlerinin hangi props'ları aldığını hatırlaması için küçük bir referans.
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
// - AI'ya ipucu vermek için kaba bir sınıflandırma. Üretimin yönünü etkileyebilir.
function detectComponentType(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes("login") || p.includes("giriş") || p.includes("form") || p.includes("kayıt")) return "loginForm"
  if (p.includes("navbar") || p.includes("menü") || p.includes("navigation") || p.includes("üst bar")) return "navbar"
  return "hero"
}

// AI'ya verilecek minimal örnek bileşeni döndür (küçük ve net)
// - Örnek JSON, modelin beklenen format ve stilini taklit etmesine yardımcı olur.
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
        { id: "submit-1", type: "button", x: 0, y: 56, props: { text: "Giriş Yap", variant: "outline", size: "default", className: "w-32 h-10 rounded-md", width: 128, height: 40 } }
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
// - Modelin uyması gereken şema, stil ilkeleri ve sınırları burada açıkça tanımlanır.
export type StylePreset = "minimal" | "brand" | "dark" | "glass"

export const getSystemPrompt = (typeHint: string, exampleJson: string, stylePreset?: StylePreset): string => {
  const propsGuide = buildPropsGuide()
  const presetGuide = (() => {
    // Stil preseti ipuçları: AI'nın renk/kontrast/seffaflık gibi kararlarını etkiler.
    switch (stylePreset) {
      case "brand":
        return "Stil: Brand – canlı vurgular (bg-blue-600), ikincil alanlar nötr, CTA belirgin."
      case "dark":
        return "Stil: Dark – koyu zemin (bg-neutral-900), metin text-neutral-100, sınırlar border-neutral-800, focus halkaları belirgin."
      case "glass":
        return "Stil: Glass – yarı saydam arkaplan (bg-white/10), backdrop-blur, ince sınırlar (border-white/20), yumuşak gölgeler."
      default:
        return "Stil: Minimal – nötr tonlar, düşük doygunluk, sade gölgeler, geniş nefes alanları."
    }
  })()
  return `Sen shadcn/ui ile uyumlu, modern ve estetik web bileşenleri oluşturan bir UI tasarım-asistanısın.
Her zaman SADECE geçerli JSON döndür.

KURALLAR (VERİ ŞEMASI):
1) Çıktı mutlaka bir JSON array olsun: [component1, component2, ...]
2) Desteklenen tipler: "button", "text", "input", "card", "div", "badge", "avatar", "tabs", "table", "image"
3) İç içe yapı için "children": [] kullan. Her child nesnesi de aynı şemayı izler.
4) Zorunlu props: className, width, height.
   - Metin için: text ("text" tipinde).
   - Input için: placeholder ve type.
   - Renkler: Tailwind (bg-blue-600, text-white) veya heksadesimal: bg-[#RRGGBB].
   - Image için zorunlu: src (tam URL veya "/public" klasörü altında bir yol, örn: "/placeholder-logo.svg"), alt (string).
5) ID kuralı: küçük-harf + tire + sayı (örn: "btn-1", "card-2").
6) Shadcn props:
   - button → { variant: "default"|"secondary"|"destructive"|"outline"|"ghost"|"link", size: "default"|"sm"|"lg"|"icon" }
   - input  → { type: "text"|"email"|"password"|"number", placeholder: string }

TAILWIND TASARIM SİSTEMİ:
- Spacing: p-4/p-6, gap-3/gap-4/gap-6, m-*, px-*, py-*.
- Kenarlık: border, border-gray-200|300 (nötr), gerektiğinde border-transparent.
- Gölgeler: shadow-sm|md, hover:shadow-md|lg (ince geçiş).
- Radius: rounded-md|lg|xl. Kartlarda tercihen rounded-xl.
- Tipografi: text-[13px|14px|16px|20px|24px], font-medium|semibold, leading-snug|relaxed.
- Renk paleti (nötr taban):
  - Arkaplan: bg-white veya yumuşak nötr; vurgu: bg-blue-600, hover:bg-blue-700.
  - Metin: text-gray-900, ikincil: text-gray-600.
- Durum stilleri: focus-visible:ring-2 focus-visible:ring-offset-2 (ring rengi nötr veya tema).

ÖN TANIMLI BİLEŞEN STİLLERİ (eklenen tipler):
- badge: küçük etiket, rounded-full, px-2.5 py-1, text-xs|sm; arkaplan nötr veya temaya uygun.
- avatar: dairesel, overflow-hidden; fallback harfleri merkezde.
- tabs: üstte sekme listesi (gap-2), altta içerik paneli; radius ve sınırlar tutarlı.
- table: zebra şerit (odd:bg-gray-50), header kalın, hücrelerde p-3.

YERLEŞİM ve DÜZEN KILAVUZU:
- Konteyner: "div" üzerinde layout kur; children için flex veya grid kullan.
- Dikey yığın: flex flex-col gap-3|4, çocukların y değerini 0'dan başlayarak düzenli aralıklarla artır.
- Yatay hizalama gerektiğinde: flex items-center justify-between/center.
- Grid: grid grid-cols-2|3 (ihtiyaca göre), gap-4|6. Kart koleksiyonları için uygundur.
- Aşırı ekran sınıfları yok: w-full, h-screen vb. yerine genişlik/height px cinsinden.
- Önerilen temel ölçüler: button 128x40, input 256x40, card 320x384, text 200x24, div 300x200.
 - layoutMode kullanımı:
   - Varsayılan: flow — ebeveyn flex/grid akışında çocukları sıralarsın (x/y kullanma).
   - Kullanıcı "serbest/absolute/özgür" isterse: ebeveyn "div"/"card" için props.layoutMode = "free" ayarla ve çocuklara x,y koordinatları ver (absolute konumlandırma). Çocuklar çakışmasın, makul aralıklar kullan.
 - Boyut limitleri: width 24–1200 px, height 24–800 px aralığında tut.
 - Az ve öz: toplam bileşen sayısını 12'yi aşmayacak şekilde sınırla.

ERİŞİLEBİLİRLİK ve HAREKET:
- Kontrastı yeterli tut; odak durumunu belirgin yap (focus-visible:ring-*).
- İnce geçişler: transition-colors, transition-shadow, duration-200.

STİL KALİTESİ KILAVUZU:
- Görsel hiyerarşi: başlık > açıklama > eylem.
- Boşluk disiplini: iç boşluk (p-*) ve eleman aralıkları (gap-*) tutarlı.
- Kartlarda p-6, rounded-xl, border-gray-200, shadow-sm ön tanımlı.
- Butonlarda solid vurgu (bg-blue-600 text-white), hover:bg-blue-700, rounded-md.
- Inputlarda belirgin sınır ve odak: border-gray-300, focus:ring-2 focus:ring-blue-500.

${propsGuide}

${presetGuide}

ÖRNEK (format ve stil referansı):
${exampleJson}

Sadece JSON döndür.`
}

// Geliştirilmiş kullanıcı prompt'u
// - Kullanıcı isteğini (doğal dil) üretim talimatlarıyla birleştirir.
// - Not: width/height değerlerinin piksel olmasını istememizin sebebi,
//   builder canvas ve yeni-sekme önizlemenin birebir eşleşmesini sağlamaktır.
export const getComponentPrompt = (userRequest: string, stylePreset?: StylePreset): string => {
  const preset = stylePreset || "minimal"
  const lower = userRequest.toLowerCase()
  const navbarGuide = (() => {
    if (lower.includes("navbar") || lower.includes("menü") || lower.includes("navigation") || lower.includes("üst bar")) {
      return `
ÖZEL NAVBAR KILAVUZU:
- NAVBAR yatay olmalıdır: flex flex-row items-center.
- Marka/sol kısım solda, linkler ortada/sağda; spacing için gap-* veya justify-between kullan.
- Yükseklik genelde h-14|h-16; iç boşluk px-4|px-6.
- Ekran doldurma yerine piksel tabanlı width/height kullan.
`
    }
    return ""
  })()
  return `İstek: "${userRequest}"

ÜRETİM TALİMATI:
- Sadece GEÇERLİ JSON döndür (kod bloğu veya açıklama yok).
- Çıktı daima bir DİZİ olsun: [component, ...].
- Desteklenen tipler: "button", "text", "input", "card", "div", "badge", "avatar", "tabs", "table", "image".
- Shadcn uyumlu props kullan (button: variant/size, input: type/placeholder).
- ID formatı: küçük-harf + tire + sayı.

KALİTE KONTROL LİSTESİ:
- Görsel hiyerarşi net mi? (başlık > açıklama > CTA)
- Yeterli boşluk var mı? (p-6; children arası gap-4 veya gap-6)
- Tutarlı radius ve gölge kullanıldı mı? (rounded-xl, shadow-sm)
- Erişilebilir odak halkaları var mı? (focus-visible:ring-2)
- Renkler tutarlı mı? (bg-blue-600, text-white, text-gray-900)
- Boyutlar px cinsinden mi? (w/h set edildi mi?)
 - Bileşen sayısı 12'yi aşmıyor mu? width/height limitlere uyuyor mu?

NOT:
- Tam ekran sınıfları (w-full, h-screen) kullanma; piksel tabanlı ölçüler kullan.
 - Düzeni "div" içinde flex/grid ve gap ile kurgula (flow). Absolute gerekirse aşağıyı uygula.
 - Kullanıcı "serbest/absolute" isterse veya serbest yerleşim gerekli ise: ebeveyn "div"/"card" için props.layoutMode = "free" kullan ve çocuklara x,y ver. Aksi halde flow düzeninde kal ve x/y kullanma.
  - Ürün kartı gibi yapılarda (görsel + başlık + açıklama + fiyat/CTA): parent için "flex flex-col gap-3" veya "gap-4" kullan; metinler görüntünün ALTINDA olmalı ve üst üste BINMEMELİ.
  - Kullanıcı belirli renk(ler) istediyse (ör. bg-[#FF5733] veya text-red-600), o renkleri AYNEN kullan ve varsayılan siyah/mavi gibi renkleri EKLEME.
  - Tailwind sınıfları ile renk tanımlanmadıysa, uygun nötr/tema renklerini seçebilirsin.
  - Renk niyeti konteyner (form/section/kart/hero) içinse: rengi ÖNCE KONTEYNERA uygula (örn: card bg-red-600). CTA/Buton rengini yalnızca kullanıcı AÇIKÇA isterse değiştir; aksi takdirde nötr/outline/ghost bırak.

- Kullanıcı doğal renk adı yazarsa (TR/EN), ilgili Tailwind paletine ÇEVİR ve sınıf üret (hex ZORUNLU DEĞİL):
  Türkçe→Tailwind: kırmızı→red, mavi→blue, yeşil→green, mor→purple, turuncu→orange, sarı→yellow, pembe→pink, siyah→black, beyaz→white, gri→gray, camgöbeği→cyan, lacivert→indigo, turkuaz→teal.
  İngilizce→Tailwind: red, blue, green, purple, orange, yellow, pink, black, white, gray, cyan, indigo, teal.
  Gövde/zemin rengi için genelde 500–700 tonlarını (örn: bg-red-600), metin için zıt ve erişilebilir tonları seç (örn: text-white veya koyu zeminde text-neutral-100). Border için ilgili paletten 300–400 (örn: border-red-300).
  Örnekler: "kırmızı buton" → className: "bg-red-600 text-white"; "mavi başlık" → className: "text-blue-600"; "camgöbeği etiket" → className: "bg-cyan-500 text-white".
  Konteyner-renk örnekleri:
   - "kırmızı login form" → kart arkaplanı: bg-red-600 text-white; buton: outline/ghost (renk talebi yoksa). 
   - "yeşil kayıt formu" → kart arkaplanı: bg-green-600 text-white; inputlar kontrastlı; buton nötr.
   - "kırmızı CTA butonu olan login form" → kart nötr; yalnızca buton bg-red-600.

STİL PRESET: ${preset}
${navbarGuide}

Sadece JSON döndür.
`
}
