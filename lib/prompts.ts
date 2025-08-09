// Bu dosya, AI modelinizin prompt'larını ve bileşen oluşturma mantığını içerir.

import type { Component } from "@/lib/types"
// shadcn-component-props.json dosyasını import ediyoruz.
// Bu dosyanın lib klasöründe olduğundan emin olun.
import shadcnComponentProps from "./shadcn-component-props.json"

// AI'ya örnek olarak verilecek genel bir bileşen yapısı döndürür
export const getExampleComponent = (): { typeHint: string; example: string } => {
  const exampleComponents: Component[] = [
    {
      id: "example-button-1",
      type: "button",
      x: 150,
      y: 100,
      props: {
        text: "Hemen Başla",
        variant: "default",
        width: 180,
        height: 50,
        className: "bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg",
        targetPageId: "page-2",
      },
    },
    {
      id: "example-input-1",
      type: "input",
      x: 150,
      y: 180,
      props: {
        placeholder: "E-posta adresinizi girin",
        type: "email",
        width: 280,
        height: 45,
        className: "border-gray-300 focus:border-purple-500 rounded-md px-3 py-2",
      },
    },
    {
      id: "example-card-1",
      type: "card",
      x: 450,
      y: 100,
      props: {
        title: "Örnek Kart Başlığı",
        content: "Bu bir örnek kart içeriğidir. Buraya daha fazla metin eklenebilir.",
        width: 320,
        height: 200,
        className: "bg-white p-6 rounded-xl shadow-lg border border-gray-200",
      },
    },
    {
      id: "example-text-1",
      type: "text", // Özel metin bileşeni (div)
      x: 150,
      y: 250,
      props: {
        text: "Bu, AI tarafından oluşturulan bir metin bileşenidir.",
        className: "text-lg font-medium text-gray-800",
        width: 300,
        height: 40,
      },
    },
  ]

  return {
    typeHint: "genel bileşen yapısı",
    example: JSON.stringify(exampleComponents, null, 2),
  }
}

// AI'ya verilecek sistem prompt'unu oluşturur
export const getSystemPrompt = (typeHint: string, exampleJson: string): string => {
  // Shadcn/ui bileşen kütüphanesi bilgilerini JSON string'ine dönüştürüyoruz
  const shadcnLibraryInfo = JSON.stringify(shadcnComponentProps, null, 2)

  return `Sen bir web uygulaması bileşen oluşturma asistanısın. Kullanıcının isteğine göre modern, responsive, temiz ve profesyonel görünümlü React bileşenlerini JSON formatında oluşturmalısın.
  
  **Kullanılabilir Bileşen Kütüphanesi (Shadcn/ui ve Özel Bileşenler):**
  Aşağıdaki JSON, kullanabileceğin bileşen türlerini ve her birinin alabileceği prop'ları tanımlar. Lütfen bu tanımlara kesinlikle sadık kal.
  ${shadcnLibraryInfo}

  **Genel Kurallar:**
  - Sadece JSON çıktısı ver, başka hiçbir metin, açıklama veya kod bloğu etiketi ekleme.
  - Her bileşenin bir 'id' (benzersiz string), 'type' (kütüphanedeki 'type' alanına uygun string), 'x' (number), 'y' (number) ve 'props' (object) alanı olmalı.
  - 'x' ve 'y' değerleri 50 ile 500 arasında rastgele olmalı.
  - 'props' içindeki 'width' değeri 100 ile 600 arasında, 'height' değeri ise 30 ile 400 arasında rastgele olmalı.
  - 'targetPageId' prop'u sadece 'button' tipi bileşenler için kullanılabilir ve boş bir string ("") veya "page-1", "page-2" gibi mevcut bir sayfa ID'si olabilir.
  - Tailwind CSS sınıflarını (örneğin: flex, grid, gap, padding, margin, colors, shadows, rounded, font-weights, text-sizes) kullanarak bileşenleri stilize etmeye özen göster.
  - Oluşturduğun bileşenlerin birbiriyle uyumlu ve görsel olarak düzenli olmasına dikkat et. Örneğin, bir form oluşturuyorsan input'ları ve butonu alt alta hizala ve uygun boşluklar bırak.
  - Kullanıcı arayüzü tasarımının en iyi uygulamalarını göz önünde bulundur.

  **Örnek Çıktı Formatı:**
  İşte bir ${typeHint} için örnek JSON formatı. Bu örnek, genel yapıyı ve prop kullanımını gösterir.
  ${exampleJson}

  Lütfen kullanıcının isteğine göre yukarıdaki kurallara ve kütüphane bilgilerine uygun bir JSON dizisi oluştur.`
}

// Kullanıcı prompt'unu döndürür
export const getComponentPrompt = (userRequest: string): string => {
  return `Kullanıcının isteği: "${userRequest}"`
}
