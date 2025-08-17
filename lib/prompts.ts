// Modern ve profesyonel bileşen örnekleri - RENK ÖDEKLİ GÜNCELLEMELER
const EXAMPLE_COMPONENTS = {
  hero: {
    id: "hero-section",
    type: "div",
    x: 50,
    y: 50,
    props: {
      className:
        "flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 px-8 py-16",
      width: 800,
      height: 600,
    },
    children: [
      {
        id: "hero-title",
        type: "text",
        x: 0,
        y: 0,
        props: {
          text: "Geleceğin Web Uygulamalarını Oluşturun",
          className:
            "text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center leading-tight",
          width: 700,
          height: 100,
        },
      },
      {
        id: "hero-subtitle",
        type: "text",
        x: 0,
        y: 0,
        props: {
          text: "AI destekli no-code platform ile profesyonel web uygulamaları dakikalar içinde oluşturun.",
          className: "text-xl text-gray-700 mb-8 text-center max-w-3xl",
          width: 600,
          height: 60,
        },
      },
      {
        id: "hero-cta",
        type: "button",
        x: 0,
        y: 0,
        props: {
          text: "Hemen Başla",
          variant: "default",
          className:
            "px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105",
          width: 200,
          height: 60,
        },
      },
    ],
  },

  loginForm: {
    id: "login-form",
    type: "card",
    x: 100,
    y: 100,
    props: {
      title: "Giriş Yap",
      content: "Hesabınıza güvenli giriş yapın",
      className:
        "w-full max-w-md mx-auto p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-2xl border border-emerald-200",
      width: 400,
      height: 500,
    },
    children: [
      {
        id: "email-input",
        type: "input",
        x: 0,
        y: 0,
        props: {
          placeholder: "E-posta adresiniz",
          type: "email",
          className:
            "w-full px-4 py-3 border-2 border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4 bg-white/80",
          width: 350,
          height: 50,
        },
      },
      {
        id: "password-input",
        type: "input",
        x: 0,
        y: 0,
        props: {
          placeholder: "Şifreniz",
          type: "password",
          className:
            "w-full px-4 py-3 border-2 border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-6 bg-white/80",
          width: 350,
          height: 50,
        },
      },
      {
        id: "login-button",
        type: "button",
        x: 0,
        y: 0,
        props: {
          text: "Giriş Yap",
          variant: "default",
          className:
            "w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105",
          width: 350,
          height: 50,
        },
      },
    ],
  },

  navbar: {
    id: "navbar",
    type: "div",
    x: 0,
    y: 0,
    props: {
      className:
        "w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl border-b-4 border-white/20 px-6 py-4",
      width: 1200,
      height: 80,
    },
    children: [
      {
        id: "nav-container",
        type: "div",
        x: 0,
        y: 0,
        props: {
          className: "flex items-center justify-between max-w-7xl mx-auto",
          width: 1100,
          height: 60,
        },
        children: [
          {
            id: "logo",
            type: "text",
            x: 0,
            y: 0,
            props: {
              text: "🚀 Logo",
              className: "text-2xl font-bold text-white",
              width: 100,
              height: 40,
            },
          },
          {
            id: "nav-menu",
            type: "div",
            x: 0,
            y: 0,
            props: {
              className: "flex items-center space-x-8",
              width: 400,
              height: 40,
            },
            children: [
              {
                id: "nav-link-1",
                type: "button",
                x: 0,
                y: 0,
                props: {
                  text: "Ana Sayfa",
                  variant: "ghost",
                  className:
                    "text-white/90 hover:text-white hover:bg-white/20 font-medium rounded-lg px-4 py-2 transition-all",
                  width: 100,
                  height: 40,
                },
              },
              {
                id: "nav-link-2",
                type: "button",
                x: 0,
                y: 0,
                props: {
                  text: "Hakkımızda",
                  variant: "ghost",
                  className:
                    "text-white/90 hover:text-white hover:bg-white/20 font-medium rounded-lg px-4 py-2 transition-all",
                  width: 100,
                  height: 40,
                },
              },
              {
                id: "nav-cta",
                type: "button",
                x: 0,
                y: 0,
                props: {
                  text: "Başla",
                  variant: "default",
                  className:
                    "px-6 py-2 bg-white text-purple-600 hover:bg-gray-100 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105",
                  width: 100,
                  height: 40,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  pricingCards: {
    id: "pricing-section",
    type: "div",
    x: 50,
    y: 50,
    props: {
      className: "py-16 px-8 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50",
      width: 1000,
      height: 600,
    },
    children: [
      {
        id: "pricing-title",
        type: "text",
        x: 0,
        y: 0,
        props: {
          text: "Fiyatlandırma Planları",
          className:
            "text-4xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-12",
          width: 900,
          height: 60,
        },
      },
      {
        id: "pricing-grid",
        type: "div",
        x: 0,
        y: 0,
        props: {
          className: "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto",
          width: 900,
          height: 450,
        },
        children: [
          {
            id: "basic-plan",
            type: "card",
            x: 0,
            y: 0,
            props: {
              title: "Temel Plan",
              content: "Başlangıç için ideal",
              className:
                "p-6 bg-white rounded-2xl shadow-xl border-2 border-orange-200 text-center hover:shadow-2xl transition-all transform hover:scale-105",
              width: 280,
              height: 400,
            },
          },
          {
            id: "pro-plan",
            type: "card",
            x: 0,
            y: 0,
            props: {
              title: "Pro Plan",
              content: "Profesyoneller için",
              className:
                "p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl shadow-2xl border-4 border-orange-500 text-center transform scale-110 hover:scale-115 transition-all",
              width: 280,
              height: 400,
            },
          },
          {
            id: "enterprise-plan",
            type: "card",
            x: 0,
            y: 0,
            props: {
              title: "Kurumsal Plan",
              content: "Büyük ekipler için",
              className:
                "p-6 bg-white rounded-2xl shadow-xl border-2 border-red-200 text-center hover:shadow-2xl transition-all transform hover:scale-105",
              width: 280,
              height: 400,
            },
          },
        ],
      },
    ],
  },
}

// Prompt'tan bileşen türünü tahmin et
function detectComponentType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes("hero") || lowerPrompt.includes("ana sayfa") || lowerPrompt.includes("başlık")) {
    return "hero"
  }
  if (lowerPrompt.includes("login") || lowerPrompt.includes("giriş") || lowerPrompt.includes("form")) {
    return "loginForm"
  }
  if (lowerPrompt.includes("navbar") || lowerPrompt.includes("menü") || lowerPrompt.includes("navigation")) {
    return "navbar"
  }
  if (lowerPrompt.includes("pricing") || lowerPrompt.includes("fiyat") || lowerPrompt.includes("plan")) {
    return "pricingCards"
  }

  return "hero" // Varsayılan
}

// AI'ya verilecek örnek bileşeni döndür
export const getExampleComponent = (prompt: string): { typeHint: string; example: string } => {
  const componentType = detectComponentType(prompt)
  const example = EXAMPLE_COMPONENTS[componentType as keyof typeof EXAMPLE_COMPONENTS]

  return {
    typeHint: componentType,
    example: JSON.stringify([example], null, 2),
  }
}

// Geliştirilmiş sistem prompt'u - RENK ODAKLI
export const getSystemPrompt = (typeHint: string, exampleJson: string): string => {
  return `Sen profesyonel bir React bileşen oluşturma uzmanısın. Kullanıcının isteğine göre modern, responsive ve RENKLI bileşenler oluşturmalısın.

**🎨 RENK KULLANIM KURALLARI:**
1. MUTLAKA kullanıcının belirttiği renkleri kullan
2. Renk belirtilmemişse, canlı ve modern renkler seç
3. Gradient'ler kullan: from-[renk]-500 to-[renk]-600
4. Hover efektleri için daha koyu tonlar: hover:from-[renk]-600
5. Arka planlar için açık tonlar: bg-[renk]-50, bg-[renk]-100
6. Border'lar için orta tonlar: border-[renk]-300

**🌈 POPÜLER RENK PALETLERİ:**
- **Mavi**: blue-500, indigo-600, sky-500
- **Mor**: purple-500, violet-600, fuchsia-500  
- **Yeşil**: emerald-500, green-600, teal-500
- **Kırmızı**: red-500, rose-600, pink-500
- **Turuncu**: orange-500, amber-600, yellow-500

**TEMEL KURALLAR:**
1. Sadece JSON formatında yanıt ver, başka hiçbir metin ekleme
2. Her bileşen bir dizi içinde olmalı: [component1, component2, ...]
3. Bileşenler iç içe geçmiş (nested) yapıda olabilir

**KULLANILABILIR BILEŞEN TİPLERİ:**
- "button": Butonlar için
- "text": Başlık, paragraf, metin için  
- "input": Form giriş alanları için
- "card": Kart/panel yapıları için
- "div": Kapsayıcı/layout için

**🎨 TASARIM PRENSİPLERİ:**
- CANLI ve RENKLI görünüm (sıkıcı gri tonlardan kaçın!)
- Gradient arka planlar kullan
- Hover efektleri ve geçişler
- Gölgeler ve yuvarlak köşeler (rounded-xl, rounded-2xl)
- Transform efektleri (hover:scale-105)
- Responsive tasarım (Tailwind CSS kullan)

**BILEŞEN YAPISI:**
{
  "id": "benzersiz-id",
  "type": "button|text|input|card|div",
  "x": 50-500, // Ana tuval konumu
  "y": 50-500, // Ana tuval konumu  
  "props": {
    "className": "RENKLI-tailwind-css-sınıfları",
    "text": "metin-içeriği", // text ve button için
    "placeholder": "placeholder-metni", // input için
    "title": "kart-başlığı", // card için
    "content": "kart-içeriği", // card için
    "variant": "default|outline|ghost", // button için
    "type": "text|email|password", // input için
    "width": 100-800,
    "height": 40-600
  },
  "children": [] // İç içe bileşenler için
}

**🎨 RENK ÖRNEKLERİ:**
- Buton: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
- Arka plan: "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
- Metin: "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
- Border: "border-2 border-rose-300"
- Gölge: "shadow-xl shadow-purple-500/25"

**ÖRNEK BILEŞEN:**
${exampleJson}

**ÖNEMLİ NOTLAR:**
- className'de MUTLAKA renkli Tailwind CSS sınıfları kullan
- İç içe bileşenlerde x,y değerlerini 0 yap
- Layout için flex, grid kullan
- Responsive breakpoint'ler ekle (md:, lg:)
- Hover ve focus durumları için stil ekle
- CANLI renk kombinasyonları kullan - sıkıcı gri tonlardan kaçın!

Şimdi kullanıcının isteğine göre RENKLI ve mükemmel bir bileşen oluştur:`
}

// Kullanıcı prompt'unu döndür - RENK ODAKLI
export const getComponentPrompt = (userRequest: string): string => {
  return `Kullanıcı İsteği: "${userRequest}"

Bu isteğe göre RENKLI, modern, profesyonel ve görsel olarak mükemmel bir bileşen oluştur. 

🎨 RENK TALİMATLARI:
- Eğer kullanıcı belirli bir renk belirtmişse, MUTLAKA o rengi kullan
- Renk belirtilmemişse, canlı ve çekici renkler seç (mavi, mor, yeşil, kırmızı, turuncu)
- Gradient'ler ve hover efektleri ekle
- Sıkıcı gri tonlardan kaçın, canlı renkler kullan!

Responsive tasarım ve kullanıcı deneyimini öncelikle düşün.`
}
