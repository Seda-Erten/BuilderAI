import { NextResponse } from "next/server"
import { generateComponent } from "@/lib/gemini-ai"
import type { Component } from "@/lib/types"

export async function POST(req: Request) {
  try {
    const { prompt, generationMode } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const aiResponse = await generateComponent(prompt)

    if (!aiResponse.success) {
      return NextResponse.json({ error: aiResponse.message }, { status: 500 })
    }

    const newComponents: Component[] = aiResponse.components || []

    if (newComponents.length === 0) {
      return NextResponse.json({ error: "Yapay zeka boş bileşen listesi döndürdü." }, { status: 500 })
    }

    return NextResponse.json({ components: newComponents })
  } catch (error: any) {
    console.error("API bileşen oluşturma hatası:", error)
    return NextResponse.json({ error: error.message || "Bileşen oluşturulurken bir hata oluştu." }, { status: 500 })
  }
}
