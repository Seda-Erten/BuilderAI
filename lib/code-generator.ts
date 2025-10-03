"use client"

import type { ProjectPages, Component } from "@/lib/types"

/**
 * Amaç
 * - Canvas üzerindeki sayfaları ve bileşenleri (ProjectPages) alıp, bağımsız bir React sayfası olarak çalışabilecek JSX kodu üretir.
 * - Üretilen kod; buton, input, card ve basit div gibi türleri destekler, üst seviye (top-level) konumlandırmayı inline style ile verir.

 */

// Yardımcı fonksiyon: Bileşen prop'larını JSX string'ine dönüştürür
const getPropsString = (props: Component["props"]): string => {
  return Object.entries(props)
    .filter(([key]) => key !== "width" && key !== "height" && key !== "targetPageId") 
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}="${value}"`
      }
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(" ")
}

/**
 * Bileşenleri JSX'e dönüştürür (özyinelemeli)
 *
 * @param component-
 * @param indent 
 * @param isNested  
 */
const generateComponentJsx = (component: Component, indent = "          ", isNested = false): string => {
  const propsString = getPropsString(component.props)
  const styleString = `width: ${component.props.width || "auto"}px, height: ${component.props.height || "auto"}px`

  let componentJsx = ""
  switch (component.type) {
    case "button":
      const onClickHandler = component.props.targetPageId
        ? `onClick={() => setCurrentPageId('${component.props.targetPageId}')}`
        : ""
      componentJsx = `<Button ${propsString} ${onClickHandler}>${component.props.text || "Button"}</Button>`
      break
    case "text":
      componentJsx = `<div ${propsString}>${component.props.text || "Sample Text"}</div>`
      break
    case "input":
      componentJsx = `<Input ${propsString} />`
      break
    case "card":
      const cardChildrenJsx =
        component.children && component.children.length > 0
          ? component.children
              .map((child) => generateComponentJsx(child, indent + "  ", true))
              .join("\n") 
          : ""
      componentJsx = `<Card className="${component.props.className || ""} p-6 rounded-xl shadow-lg border border-gray-200 max-w-sm">
  ${indent}  <h3 className="text-xl font-semibold mb-3">${component.props.title || "Card Title"}</h3>
  ${indent}  <p className="text-gray-600">${component.props.content || "Card content goes here..."}</p>
  ${cardChildrenJsx ? `${indent}  <div className="mt-4">\n${cardChildrenJsx}\n${indent}  </div>` : ""}
  ${indent}</Card>`
      break
    case "div": 
      const divChildrenJsx =
        component.children && component.children.length > 0
          ? component.children
              .map((child) => generateComponentJsx(child, indent + "  ", true))
              .join("\n") 
          : ""
      componentJsx = `<div ${propsString}>
  ${divChildrenJsx}
  ${indent}</div>`
      break
    default:
      componentJsx = `<div>Unknown Component</div>`
      break
  }


  if (!isNested) {
    return `${indent}<div style={{ position: 'absolute', left: ${component.x}px, top: ${component.y}px, ${styleString} }}>
  ${indent}  ${componentJsx.replace(/\n/g, `\n${indent}  `)}
  ${indent}</div>`
  } else {
    return componentJsx
  }
}

/**
 * Canvas'taki bileşenleri alıp tek bir dosya halinde render edilebilir React JSX kodu üretir.
 */
export const generateCode = (pages: ProjectPages): string => {
  let jsxCode = `import React, { useState } from 'react';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Card } from '@/components/ui/card';

  export default function GeneratedPage() {
    const [currentPageId, setCurrentPageId] = useState('${Object.keys(pages)[0] || "page-1"}');

    const allPages = {
  `
  Object.entries(pages).forEach(([pageId, pageData]) => {
    jsxCode += `    '${pageId}': {
        name: '${pageData.name}',
        backgroundColor: '${(pageData as any).backgroundColor || ""}',
        components: [\n`
    pageData.components.forEach((comp) => {
      jsxCode += `        {\n          id: '${comp.id}',\n          jsx: (\n`
      jsxCode += generateComponentJsx(comp, "            ", false) // Top-level components are not nested
      jsxCode += `\n          )\n        },\n`
    })
    jsxCode += `      ],\n    },\n`
  })

  jsxCode += `  };

    const currentPageData = allPages[currentPageId];

    if (!currentPageData) {
      return <div>Sayfa bulunamadı: {currentPageId}</div>;
    }

    const pageBg = currentPageData.backgroundColor || '#ffffff';

    return (
      <div className="relative w-full min-h-screen p-8" style={{ backgroundColor: pageBg }}>
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
