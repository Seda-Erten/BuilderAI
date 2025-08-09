"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Component } from "@/lib/types"

// Bu fonksiyon, Component tipindeki bir objeyi alıp ilgili React bileşenini render eder.
// handleSwitchPage fonksiyonu prop olarak eklendi
export const renderComponent = (
  component: Component,
  isSelected: boolean,
  handleSwitchPage?: (pageId: string) => void,
) => {
  const style = {
    width: component.props.width ? `${component.props.width}px` : undefined,
    height: component.props.height ? `${component.props.height}px` : undefined,
  }

  switch (component.type) {
    case "button":
      const buttonOnClick =
        component.props.targetPageId && handleSwitchPage
          ? () => handleSwitchPage(component.props.targetPageId)
          : undefined

      return (
        <Button
          variant={component.props.variant || "default"}
          className={`${component.props.className || ""} ${isSelected ? "ring-2 ring-purple-500 ring-offset-2" : ""}`}
          style={style}
          onClick={buttonOnClick} // onClick eklendi
        >
          {component.props.text || "Button"}
        </Button>
      )
    case "text":
      return (
        <div
          className={`${component.props.className || "text-base text-gray-900"} ${
            isSelected ? "ring-2 ring-purple-500 ring-offset-2 rounded p-2" : ""
          }`}
          style={style}
        >
          {component.props.text || "Sample Text"}
        </div>
      )
    case "input":
      return (
        <Input
          type={component.props.type || "text"}
          placeholder={component.props.placeholder || "Enter text..."}
          className={`${component.props.className || ""} ${isSelected ? "ring-2 ring-purple-500" : ""}`}
          style={style}
        />
      )
    case "card":
      return (
        <Card
          className={`p-6 rounded-xl shadow-lg border border-gray-200 max-w-sm hover:shadow-xl transition-shadow ${
            isSelected ? "ring-2 ring-purple-500 ring-offset-2" : ""
          }`}
          style={style}
        >
          <h3 className="text-xl font-semibold mb-3">{component.props.title || "Card Title"}</h3>
          <p className="text-gray-600">{component.props.content || "Card content goes here..."}</p>
        </Card>
      )
    default:
      return (
        <div
          className={`bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300 ${
            isSelected ? "ring-2 ring-purple-500" : ""
          }`}
          style={style}
        >
          Unknown Component
        </div>
      )
  }
}
