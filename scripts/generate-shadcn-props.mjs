import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

// __dirname'i ES modülleri için tanımla
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Projenin kök dizinini bulmak için yukarı doğru çık
// Önceki: const projectRoot = path.resolve(__dirname, "../../")
// Yeni: scripts klasöründen bir üst dizin projenin kök dizinidir.
const projectRoot = path.resolve(__dirname, "../") 

const componentsPath = path.join(projectRoot, "components", "ui")
const outputPath = path.join(projectRoot, "lib", "shadcn-component-props.json")

// Yaygın Shadcn/ui prop'ları ve varsayılan tipleri
const commonProps = {
  text: "string",
  placeholder: "string",
  title: "string",
  content: "string",
  className: "string",
  width: "number",
  height: "number",
  targetPageId: "string", 
  variant: "enum", 
  type: "enum",
  onClick: "function", 
}

const enumOptions = {
  variant: ["default", "secondary", "destructive", "outline", "ghost", "link"],
  type: ["text", "email", "password", "number", "checkbox", "radio"], 
  size: ["default", "sm", "lg", "icon"], 
}

async function generateShadcnProps() {
  const componentPropsData = []

  try {
    const files = await fs.readdir(componentsPath)

    for (const file of files) {
      if (file.endsWith(".tsx")) {
        const componentName = path.basename(file, ".tsx")
        const filePath = path.join(componentsPath, file)
        const fileContent = await fs.readFile(filePath, "utf-8")

        const componentDefinition = {
          type: componentName.toLowerCase(), // Küçük harf türü
          name: componentName,
          description: `A Shadcn/ui ${componentName} component.`,
          keywords: [componentName.toLowerCase()],
          props: {},
        }

        // Basit regex ile prop'ları ve tiplerini çıkarmaya çalıştım

        const interfaceMatch = fileContent.match(/export interface (\w+Props) extends [^{]+?\{([\s\S]*?)\}/)

        if (interfaceMatch) {
          const propsContent = interfaceMatch[2]
          const propLines = propsContent.matchAll(/(\w+)\??:\s*([^;]+);/g)

          for (const match of propLines) {
            const propName = match[1].trim()
            let propType = match[2].trim()

            if (propType.includes("React.ReactNode")) propType = "ReactNode"
            else if (propType.includes("React.HTMLAttributes")) propType = "HTMLAttributes"
            else if (propType.includes("React.InputHTMLAttributes")) propType = "InputHTMLAttributes"
            else if (propType.includes("React.ButtonHTMLAttributes")) propType = "ButtonHTMLAttributes"
            else if (propType.includes("boolean")) propType = "boolean"
            else if (propType.includes("number")) propType = "number"
            else if (propType.includes("string")) propType = "string"
            else if (propType.includes("() =>"))
              propType = "function"
            else if (propType.includes("|")) propType = "enum" 

            if (
              commonProps[propName] ||
              propType === "enum" ||
              propType === "function" ||
              propType === "boolean" ||
              propType === "number" ||
              propType === "string"
            ) {
              const propDefinition = {
                type: propType,
                description: `Description for ${propName} prop.`, 
              }

              // Enum tipleri için olası seçenekleri ekle
              if (propType === "enum" && enumOptions[propName]) {
                propDefinition.options = enumOptions[propName]
              }

              componentDefinition.props[propName] = propDefinition
            }
          }
        }

        // Özel olarak eklediğimiz propları her bileşene ekle
        // Bu AI'nın bu propları her zaman kullanabileceğini bilmesini sağlar.
        // Ancak bu proplar sadece belirli bileşen tipleri için anlamlıdır.
        // AI nın bunu prompttan anlaması gerekecek.
        if (!componentDefinition.props.width)
          componentDefinition.props.width = { type: "number", description: "Width of the component in pixels." }
        if (!componentDefinition.props.height)
          componentDefinition.props.height = { type: "number", description: "Height of the component in pixels." }
        if (componentName.toLowerCase() === "button" && !componentDefinition.props.targetPageId) {
          componentDefinition.props.targetPageId = {
            type: "string",
            description: "The ID of the page to navigate to when the button is clicked.",
          }
        }

        componentPropsData.push(componentDefinition)
      }
    }

    await fs.writeFile(outputPath, JSON.stringify(componentPropsData, null, 2))
    console.log(`Shadcn/ui component prop bilgileri başarıyla oluşturuldu: ${outputPath}`)
    console.log("Lütfen bu JSON dosyasını manuel olarak gözden geçirin ve eksik/hatalı bilgileri düzeltin.")
  } catch (error) {
    console.error("Shadcn/ui prop bilgilerini oluştururken bir hata oluştu:", error)
    console.error("Lütfen 'components/ui' klasörünün doğru yolda olduğundan ve erişilebilir olduğundan emin olun.")
  }
}

generateShadcnProps()