"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Component } from "@/lib/types"
import { cn } from "@/lib/utils"

export const renderComponent = (
  component: Component,
  isSelected: boolean = false,
  handleSwitchPage?: (pageId: string) => void,
) => {
  const baseClasses = component.props.className || ""
  // Seçim ring'ini kaldır - sadece temiz görünüm
  const selectionClasses = ""
  
  let renderedElement: React.ReactNode


  switch (component.type) {
    case "button":
      const buttonOnClick = component.props.targetPageId && handleSwitchPage
        ? () => handleSwitchPage(component.props.targetPageId as string)
        : undefined

      renderedElement = (
        <Button
          className={cn(baseClasses, selectionClasses)}
          onClick={buttonOnClick}
          style={{
            width: component.props.width || 'auto',
            height: component.props.height || 'auto'
          }}
        >
          {component.props.text || "Button"}
        </Button>
      )
      break
    case "text":
      renderedElement = (
        <div 
          className={cn(baseClasses, selectionClasses)}
          style={{
            width: component.props.width || 'auto',
            height: component.props.height || 'auto',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {component.props.text || "Sample Text"}
        </div>
      )
      break
    case "input":
      renderedElement = (
        <Input
          type={component.props.type || "text"}
          placeholder={component.props.placeholder || "Enter text..."}
          value={component.props.value || ""}
          onChange={() => {}}
          className={cn(baseClasses, selectionClasses)}
          style={{
            width: component.props.width || 'auto',
            height: component.props.height || 'auto'
          }}
        />
      )
      break
    case "card":
      renderedElement = (
        <Card 
          className={cn(baseClasses, selectionClasses, "relative overflow-hidden")}
          style={{
            width: component.props.width || 'auto',
            height: component.props.height || 'auto'
          }}
        >
          {component.children && component.children.map((child) => (
            <div
              key={child.id}
              className="absolute"
              style={{
                left: child.x || 0,
                top: child.y || 0
              }}
            >
              {renderComponent(child, false, handleSwitchPage)}
            </div>
          ))}
        </Card>
      )
      break
    case "div":
      renderedElement = (
        <div 
          className={cn(baseClasses, selectionClasses, "relative")}
          style={{
            width: component.props.width || 'auto',
            height: component.props.height || 'auto'
          }}
        >
          {component.children && component.children.map((child) => (
            <div
              key={child.id}
              className="absolute"
              style={{
                left: child.x || 0,
                top: child.y || 0
              }}
            >
              {renderComponent(child, false, handleSwitchPage)}
            </div>
          ))}
        </div>
      )
      break
    default:
      renderedElement = (
        <div className={cn(baseClasses, selectionClasses, "bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300")}>
          Unknown Component: {component.type}
        </div>
      )
  }

  return renderedElement
}
