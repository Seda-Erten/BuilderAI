"use client"

import type { ProjectPages } from "@/lib/types"

// Bu fonksiyon, canvas'taki bileşenleri alıp JSX kodu olarak döndürür.
export const generateCode = (pages: ProjectPages): string => {
  let jsxCode = `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function GeneratedPage() {
  const [currentPageId, setCurrentPageId] = useState('${Object.keys(pages)[0] || "page-1"}');

  const allPages = {
`
  // Tüm sayfaların verilerini allPages objesine ekle
  Object.entries(pages).forEach(([pageId, pageData]) => {
    jsxCode += `    '${pageId}': {
      name: '${pageData.name}',
      components: [\n`
    pageData.components.forEach((comp) => {
      const propsString = Object.entries(comp.props)
        .filter(([key]) => key !== "width" && key !== "height" && key !== "targetPageId") // width, height ve targetPageId'yi doğrudan style/onClick'e alacağız
        .map(([key, value]) => {
          if (typeof value === "string") {
            return `${key}="${value}"`
          }
          return `${key}={${JSON.stringify(value)}}`
        })
        .join(" ")

      const styleString = `width: ${comp.props.width || "auto"}px, height: ${comp.props.height || "auto"}px, position: 'absolute', left: ${comp.x}px, top: ${comp.y}px`

      let componentJsx = ""
      switch (comp.type) {
        case "button":
          const onClickHandler = comp.props.targetPageId
            ? `onClick={() => setCurrentPageId('${comp.props.targetPageId}')}`
            : ""
          componentJsx = `        <Button ${propsString} ${onClickHandler}>${comp.props.text || "Button"}</Button>`
          break
        case "text":
          componentJsx = `        <div ${propsString}>${comp.props.text || "Sample Text"}</div>`
          break
        case "input":
          componentJsx = `        <Input ${propsString} />`
          break
        case "card":
          componentJsx = `        <Card className="${comp.props.className || ""} p-6 rounded-xl shadow-lg border border-gray-200 max-w-sm">
            <h3 className="text-xl font-semibold mb-3">${comp.props.title || "Card Title"}</h3>
            <p className="text-gray-600">${comp.props.content || "Card content goes here..."}</p>
          </Card>`
          break
        default:
          componentJsx = `        <div>Unknown Component</div>`
          break
      }
      jsxCode += `        {\n          id: '${comp.id}',\n          jsx: (\n            <div style={{ ${styleString} }}>\n              ${componentJsx}\n            </div>\n          )\n        },\n`
    })
    jsxCode += `      ],\n    },\n`
  })

  jsxCode += `  };

  const currentPageData = allPages[currentPageId];

  if (!currentPageData) {
    return <div>Sayfa bulunamadı: {currentPageId}</div>;
  }

  return (
    <div className="relative w-full min-h-screen bg-white p-8">
      {currentPageData.components.map(comp => (
        <React.Fragment key={comp.id}>
          {comp.jsx}
        </React.Fragment>
      ))}
    </div>
  );
}
`
  return jsxCode
}
