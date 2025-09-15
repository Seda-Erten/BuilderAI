"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import type { Component } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Component Renderer
 * - `Component` tipindeki JSON tanımlarını gerçek React bileşenlerine dönüştürür.
 * - Tailwind sınıf kısaltmalarını (bg-yellow → bg-yellow-600) genişletir.
 * - Ebeveyn düzenine göre iki mod destekler:
 *   - Flow (flex/grid): çocuklar sırayla akar; drag&drop ile yeniden sıralama yapılabilir.
 *   - Absolute (layoutMode === 'free' değilse): çocuklar x/y ile serbest konumlandırılır; sürükleyerek taşınabilir.
 * - `opts` üzerinden seçim, drag, reorder gibi etkileşim geri çağrıları alınır.
 */

type RenderOpts = {
  onSelect?: (id: string) => void
  onChildDrag?: (parentId: string, childId: string, newX: number, newY: number) => void
  onChildReorder?: (parentId: string, fromIndex: number, toIndex: number) => void
  parentId?: string
  onChildDragEnd?: (parentId: string, childId: string) => void
}

export const renderComponent = (
  component: Component,
  isSelected: boolean = false,
  handleSwitchPage?: (pageId: string) => void,
  opts?: RenderOpts,
) => {
  const baseClasses = component.props.className || ""
  // Expand shorthand colors: bg-yellow -> bg-yellow-600, text-blue -> text-blue-600, border-red -> border-red-300
  // Not: Bu genişletme, hem AI üretimi hem de kullanıcı düzenlemelerinde tutarlı bir görünüm sağlar.
  const expandColorShorthand = (input: string): string => {
    const colors = [
      "slate","gray","zinc","neutral","stone",
      "red","orange","amber","yellow","lime","green","emerald","teal","cyan","sky","blue","indigo","violet","purple","fuchsia","pink","rose",
      "black","white"
    ]
    const colorAlt = colors.join("|")
    return String(input || "")
      .replace(new RegExp(`\\bbg-(${colorAlt})\\b(?!-)`, "g"), (_m, c) => `bg-${c}-600`)
      .replace(new RegExp(`\\btext-(${colorAlt})\\b(?!-)`, "g"), (_m, c) => (c === "black" || c === "white") ? `text-${c}` : `text-${c}-600`)
      .replace(new RegExp(`\\bborder-(${colorAlt})\\b(?!-)`, "g"), (_m, c) => (c === "black" || c === "white") ? `border-${c}` : `border-${c}-300`)
  }
  const resolvedClasses = expandColorShorthand(baseClasses)
  if (process.env.NEXT_PUBLIC_DEBUG_COLORS === '1') {
    try {
      console.log('[DEBUG] pre-render className', { id: component.id, type: component.type, className: baseClasses, resolved: resolvedClasses })
    } catch {}
  }
  // Seçim ring'ini kaldır - sadece temiz görünüm
  const selectionClasses = ""
  
  let renderedElement: React.ReactNode


  switch (component.type) {
    case "button":
      // Sayfa geçişi hedefi verilmişse, tıklamada sayfayı değiştir.
      const buttonOnClick = component.props.targetPageId && handleSwitchPage
        ? () => handleSwitchPage(component.props.targetPageId as string)
        : undefined

      // If explicit color classes exist, use a non-coloring variant to avoid override
      // Not: Tailwind renk sınıfları verilmişse shadcn variant rengini bastırmamak için 'ghost' kullanılır.
      const classStr = String(baseClasses)
      const hasTailwindColor = /(\bbg-[^\s]+|\btext-[^\s]+|\bborder-[^\s]+|\bbg-\[#.+?\])/i.test(classStr)
      const variantProp = hasTailwindColor ? ("ghost" as any) : (component.props.variant as any)

      renderedElement = (
        <Button
          variant={variantProp}
          className={cn(resolvedClasses, selectionClasses)}
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
      // Basit metin kapsayıcısı; dikey merkezleme için flex kullanılır.
      renderedElement = (
        <div 
          className={cn(resolvedClasses, selectionClasses)}
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
      // Controlled yerine dummy onChange; builder içinde canlı data yönetilmez.
      renderedElement = (
        <Input
          type={component.props.type || "text"}
          placeholder={component.props.placeholder || "Enter text..."}
          value={component.props.value || ""}
          onChange={() => {}}
          className={cn(resolvedClasses, selectionClasses)}
          style={{
            width: component.props.width || 'auto',
            height: component.props.height || 'auto'
          }}
        />
      )
      break
    case "card":
      {
        const layoutMode = component.props?.layoutMode as string | undefined
        const parentHasFlow = /\b(flex|grid)\b/.test(baseClasses) && layoutMode !== 'free'
        // parentHasFlow → akış düzeni: çocuklar draggable olarak yeniden sıralanır.
        // aksi halde absolute: çocuklar x/y ile konumlanır ve sürüklenerek taşınır.
        renderedElement = (
          <Card 
            className={cn(resolvedClasses, selectionClasses, parentHasFlow ? undefined : "relative overflow-hidden")}
            style={{
              width: component.props.width || 'auto',
              height: component.props.height || 'auto'
            }}
            onClick={(e) => { e.stopPropagation(); opts?.onSelect?.(component.id) }}
          >
            {component.children && component.children.map((child, idx) => (
              parentHasFlow ? (
                <div
                  key={child.id}
                  draggable
                  // Alt tuşu ile ebeveyne geri seçim kısa yolu; drag & drop ile sıralama
                  onClick={(e) => { e.stopPropagation(); if (e.altKey && opts?.parentId) { opts.onSelect?.(opts.parentId) } else { opts?.onSelect?.(child.id) } }}
                  onDragStart={(e) => {
                    e.stopPropagation()
                    e.dataTransfer.setData('fromIndex', String(idx))
                  }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onDrop={(e) => {
                    e.preventDefault(); e.stopPropagation()
                    const from = Number(e.dataTransfer.getData('fromIndex'))
                    const to = idx
                    if (!Number.isNaN(from) && typeof opts?.onChildReorder === 'function') {
                      opts.onChildReorder(component.id, from, to)
                    }
                  }}
                >
                  {renderComponent(child, false, handleSwitchPage, { ...opts, parentId: component.id })}
                </div>
              ) : (
                <div
                  key={child.id}
                  className="absolute"
                  style={{ left: child.x || 0, top: child.y || 0 }}
                  // Mouse sürükleme: document-level mousemove/mouseup ile koordinat güncelle
                  onClick={(e) => { e.stopPropagation(); if (e.altKey && opts?.parentId) { opts.onSelect?.(opts.parentId) } else { opts?.onSelect?.(child.id) } }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const parentEl = e.currentTarget.parentElement as HTMLElement | null
                    const parentRect = parentEl?.getBoundingClientRect()
                    const startX = e.clientX
                    const startY = e.clientY
                    const originX = Number(child.x) || 0
                    const originY = Number(child.y) || 0
                    const onMove = (me: MouseEvent) => {
                      const dx = me.clientX - startX
                      const dy = me.clientY - startY
                      const newX = Math.max(0, originX + dx)
                      const newY = Math.max(0, originY + dy)
                      opts?.onChildDrag?.(component.id, child.id, newX, newY)
                    }
                    const onUp = () => {
                      document.removeEventListener('mousemove', onMove)
                      document.removeEventListener('mouseup', onUp)
                      opts?.onChildDragEnd?.(component.id, child.id)
                    }
                    document.addEventListener('mousemove', onMove)
                    document.addEventListener('mouseup', onUp)
                  }}
                >
                  {renderComponent(child, false, handleSwitchPage, { ...opts, parentId: component.id })}
                </div>
              )
            ))}
          </Card>
        )
      }
      break
    case "badge":
      renderedElement = (
        <Badge
          className={cn(resolvedClasses, selectionClasses)}
          style={{ width: component.props.width || undefined, height: component.props.height || undefined }}
        >
          {component.props.text || "Badge"}
        </Badge>
      )
      break
    case "image":
      // Basit img etiketi; objectFit ve radius props ile yönetilir.
      renderedElement = (
        <img
          src={component.props.src}
          alt={component.props.alt || "image"}
          className={cn(resolvedClasses, selectionClasses, "block")}
          style={{
            width: component.props.width || undefined,
            height: component.props.height || undefined,
            objectFit: component.props.objectFit || "cover",
            borderRadius: undefined,
          }}
        />
      )
      break
    case "avatar":
      // shadcn Avatar bileşeni + fallback harfleri
      renderedElement = (
        <div
          className={cn("relative", selectionClasses)}
          style={{ width: component.props.width || 40, height: component.props.height || 40 }}
        >
          <Avatar className={cn(resolvedClasses)}>
            {component.props.src ? (
              <AvatarImage src={component.props.src} alt={component.props.alt || ""} />
            ) : null}
            <AvatarFallback>{component.props.fallback || "AV"}</AvatarFallback>
          </Avatar>
        </div>
      )
      break
    case "tabs":
      {
        const tabs = Array.isArray(component.props.tabs) ? component.props.tabs : []
        const defaultValue = tabs[0]?.value || "tab1"
        // Tabs: trigger listesi + her içerik için panel
        renderedElement = (
          <div className={cn(resolvedClasses, selectionClasses)} style={{ width: component.props.width, height: component.props.height }}>
            <Tabs defaultValue={defaultValue}>
              <TabsList>
                {tabs.map((t: any) => (
                  <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((t: any) => (
                <TabsContent key={t.value} value={t.value}>
                  <div className="p-4 border rounded-md">
                    {t.content}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )
      }
      break
    case "table":
      {
        const columns: string[] = Array.isArray(component.props.columns) ? component.props.columns : []
        const rows: string[][] = Array.isArray(component.props.rows) ? component.props.rows : []
        // Basit tablo: başlık satırı + gövde
        renderedElement = (
          <div className={cn(baseClasses, selectionClasses)} style={{ width: component.props.width, height: component.props.height, overflow: 'auto' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c, idx) => (
                    <TableHead key={idx}>{c}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    {r.map((cell, j) => (
                      <TableCell key={j}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      }
      break
    case "div":
      {
        const layoutMode = component.props?.layoutMode as string | undefined
        const parentHasFlow = /\b(flex|grid)\b/.test(baseClasses) && layoutMode !== 'free'
        renderedElement = (
          <div 
            className={cn(resolvedClasses, selectionClasses, parentHasFlow ? undefined : "relative")}
            style={{
              width: component.props.width || 'auto',
              height: component.props.height || 'auto'
            }}
            onClick={(e) => { e.stopPropagation(); opts?.onSelect?.(component.id) }}
          >
            {component.children && component.children.map((child, idx) => (
              parentHasFlow ? (
                <div
                  key={child.id}
                  draggable
                  onClick={(e) => { e.stopPropagation(); if (e.altKey && opts?.parentId) { opts.onSelect?.(opts.parentId) } else { opts?.onSelect?.(child.id) } }}
                  onDragStart={(e) => {
                    e.stopPropagation()
                    e.dataTransfer.setData('fromIndex', String(idx))
                  }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onDrop={(e) => {
                    e.preventDefault(); e.stopPropagation()
                    const from = Number(e.dataTransfer.getData('fromIndex'))
                    const to = idx
                    if (!Number.isNaN(from) && typeof opts?.onChildReorder === 'function') {
                      opts.onChildReorder(component.id, from, to)
                    }
                  }}
                >
                  {renderComponent(child, false, handleSwitchPage, { ...opts, parentId: component.id })}
                </div>
              ) : (
                <div
                  key={child.id}
                  className="absolute"
                  style={{ left: child.x || 0, top: child.y || 0 }}
                  onClick={(e) => { e.stopPropagation(); if (e.altKey && opts?.parentId) { opts.onSelect?.(opts.parentId) } else { opts?.onSelect?.(child.id) } }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const startX = e.clientX
                    const startY = e.clientY
                    const originX = Number(child.x) || 0
                    const originY = Number(child.y) || 0
                    const onMove = (me: MouseEvent) => {
                      const dx = me.clientX - startX
                      const dy = me.clientY - startY
                      const newX = Math.max(0, originX + dx)
                      const newY = Math.max(0, originY + dy)
                      opts?.onChildDrag?.(component.id, child.id, newX, newY)
                    }
                    const onUp = () => {
                      document.removeEventListener('mousemove', onMove)
                      document.removeEventListener('mouseup', onUp)
                      opts?.onChildDragEnd?.(component.id, child.id)
                    }
                    document.addEventListener('mousemove', onMove)
                    document.addEventListener('mouseup', onUp)
                  }}
                >
                  {renderComponent(child, false, handleSwitchPage, { ...opts, parentId: component.id })}
                </div>
              )
            ))}
          </div>
        )
      }
      break
    default:
      // Tanınmayan tipler için basit uyarı kutusu
      renderedElement = (
        <div className={cn(baseClasses, selectionClasses, "bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300")}>
          Unknown Component: {component.type}
        </div>
      )
  }

  return renderedElement
}
