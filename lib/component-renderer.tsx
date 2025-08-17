"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Component } from "@/lib/types"
import { cn } from "@/lib/utils"

// Button bileşeninin variant prop'unun doğru tipini almak için gerekli import'lar
import type { VariantProps } from "class-variance-authority"
import type { buttonVariants } from "@/components/ui/button"

// Bu fonksiyon, Component tipindeki bir objeyi alıp ilgili React bileşenini render eder.
// handleSwitchPage fonksiyonu prop olarak eklendi
// isSelected prop'u sadece görsel geri bildirim için kullanılır, konumlandırma için değil.
export const renderComponent = (
  component: Component,
  isSelected: boolean, // isSelected prop'u geri eklendi
  handleSwitchPage?: (pageId: string) => void,
) => {
  // commonClasses'ın her zaman bir string olmasını sağlıyoruz.
  // component.props.className undefined ise boş string olarak başlar.
  const commonClasses: string = cn(
    component.props.className || "",
    isSelected ? "ring-2 ring-purple-500 ring-offset-2" : "", // Seçim halkası burada uygulanıyor
  )

  let renderedElement: React.ReactNode


  switch (component.type) {
    case "button":
    const buttonOnClick =
  component.props.targetPageId && handleSwitchPage
    ? () => handleSwitchPage(component.props.targetPageId as string)
    : undefined

      renderedElement = (
        <Button
          // variant prop'unu doğru tipe dönüştürüyoruz
          variant={(component.props.variant as VariantProps<typeof buttonVariants>["variant"]) || "default"}
          className={commonClasses}
          onClick={buttonOnClick}
        >
          {component.props.text || "Button"}
        </Button>
      )
      break
    case "text":
      renderedElement = (
        <div className={cn(commonClasses, "text-base text-gray-900")}>{component.props.text || "Sample Text"}</div>
      )
      break
    case "input":
      renderedElement = (
        <Input
          type={component.props.type || "text"}
          placeholder={component.props.placeholder || "Enter text..."}
          value={component.props.value || ""} // Yeni: value prop'u eklendi
          onChange={() => {}} // Yeni: onChange prop'u eklendi (değer özellikler panelinden güncellenecek)
          className={commonClasses}
        />
      )
      break
    case "card":
      renderedElement = (
        <Card className={cn(commonClasses, "p-6 rounded-xl shadow-lg border border-gray-200 max-w-sm")}>
          <h3 className="text-xl font-semibold mb-3">{component.props.title || "Card Title"}</h3>
          <p className="text-gray-600">{component.props.content || "Card content goes here..."}</p>
          {/* Card içindeki çocukları render et */}
          {component.children && (
            <div className="mt-4">
              {component.children.map((child) => (
                <React.Fragment key={child.id}>{renderComponent(child, isSelected, handleSwitchPage)}</React.Fragment>
              ))}
            </div>
          )}
        </Card>
      )
      break
    case "div": // Yeni div bileşeni
      renderedElement = (
        <div className={commonClasses}>
          {component.children &&
            component.children.map((child) => (
              <React.Fragment key={child.id}>{renderComponent(child, isSelected, handleSwitchPage)}</React.Fragment>
            ))}
        </div>
      )
      break
    default:
      renderedElement = (
        <div className={cn(commonClasses, "bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300")}>
          Unknown Component
        </div>
      )
  }

  // renderComponent artık doğrudan bileşeni döndürüyor, konumlandırma dışarıda yapılacak.
  return renderedElement
}
