"use client"

import type { ProjectPages, Component } from "@/lib/types"

// Yardımcı fonksiyon: Bileşen prop'larını JSX string'ine dönüştürür
const getPropsString = (props: Component["props"]): string => {
  return Object.entries(props)
    .filter(([key]) => key !== "width" && key !== "height" && key !== "targetPageId") // width, height ve targetPageId'yi doğrudan style/onClick'e alacağız
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}="${value}"`
      }
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(" ")
}

// Yardımcı fonksiyon: Bileşenleri JSX'e dönüştürür (özyinelemeli)
// isNested parametresi eklendi
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
              .join("\n") // Pass true for nested
          : ""
      componentJsx = `<Card className="${component.props.className || ""} p-6 rounded-xl shadow-lg border border-gray-200 max-w-sm">
  ${indent}  <h3 className="text-xl font-semibold mb-3">${component.props.title || "Card Title"}</h3>
  ${indent}  <p className="text-gray-600">${component.props.content || "Card content goes here..."}</p>
  ${cardChildrenJsx ? `${indent}  <div className="mt-4">\n${cardChildrenJsx}\n${indent}  </div>` : ""}
  ${indent}</Card>`
      break
    case "div": // Yeni div bileşeni
      const divChildrenJsx =
        component.children && component.children.length > 0
          ? component.children
              .map((child) => generateComponentJsx(child, indent + "  ", true))
              .join("\n") // Pass true for nested
          : ""
      componentJsx = `<div ${propsString}>
  ${divChildrenJsx}
  ${indent}</div>`
      break
    default:
      componentJsx = `<div>Unknown Component</div>`
      break
  }

  // Sadece en üst seviye bileşenleri mutlak konumlandırılmış bir div içinde sarmala
  if (!isNested) {
    return `${indent}<div style={{ position: 'absolute', left: ${component.x}px, top: ${component.y}px, ${styleString} }}>
  ${indent}  ${componentJsx.replace(/\n/g, `\n${indent}  `)}
  ${indent}</div>`
  } else {
    // İç içe bileşenler için sadece kendi JSX'ini döndür
    return componentJsx
  }
}

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
