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

export async function generateComponent(prompt: string): Promise<AIResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) // veya 'gemini-1.5-pro'

    const { typeHint, example } = getExampleComponent(prompt)
    const systemPrompt = getSystemPrompt(typeHint, example)
    const userPrompt = getComponentPrompt(prompt)
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

    console.log("Gemini'ye gönderilen prompt:", fullPrompt) // Gönderilen prompt'u logla

    const result = await model.generateContent(fullPrompt)
    const response = result.response
    const generatedText = response.text()

    console.log("AI'dan gelen ham yanıt:", generatedText) // AI'dan gelen ham yanıtı logla

    // AI'dan gelen yanıtta JSON'ı bulmak için daha sağlam bir regex kullan
    // Önce ```json ... ``` bloğunu ara, sonra genel { ... } yapısını ara
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || generatedText.match(/\{[\s\S]*\}/)

    let parsedData: any
    if (jsonMatch && jsonMatch[1]) {
      // Eğer ```json bloğu bulunduysa, içindeki JSON'ı ayrıştır
      try {
        parsedData = JSON.parse(jsonMatch[1])
      } catch (jsonErr) {
        console.error("JSON parse hatası (kod bloğundan):", jsonErr, "Çıkarılan JSON:", jsonMatch[1])
        return {
          message: "Yapay zekadan gelen JSON kodu ayrıştırılamadı. Lütfen tekrar deneyin.",
          success: false,
        }
      }
    } else if (jsonMatch && jsonMatch[0]) {
      // Eğer genel { ... } yapısı bulunduysa, onu ayrıştır
      try {
        parsedData = JSON.parse(jsonMatch[0])
      } catch (jsonErr) {
        console.error("JSON parse hatası (genel eşleşmeden):", jsonErr, "Çıkarılan JSON:", jsonMatch[0])
        return {
          message: "Yapay zekadan gelen JSON ayrıştırılamadı. Lütfen tekrar deneyin.",
          success: false,
        }
      }
    } else {
      console.error("Geçersiz AI yanıtı: JSON bulunamadı veya format dışı.", generatedText)
      return {
        message: "Yapay zekadan geçerli bir bileşen yanıtı alınamadı. Lütfen tekrar deneyin.",
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

    return {
      message: parsedData.message || "Bileşen başarıyla oluşturuldu.",
      components: componentsArray, // Tüm bileşenleri döndür
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
