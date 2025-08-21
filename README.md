# AI No‑Code Builder

An AI-powered no‑code UI builder. Type natural language, get editable UI components on a canvas. Built with Next.js 14, TypeScript, Tailwind, and Gemini AI.

## Features
- Nested component editing (containers like navbar/product card)
- Flow vs Free layout modes per container (`props.layoutMode`)
- Drag to reorder (flow) or free-position children (free)
- Properties panel with recursive selection (Alt+Click to select parent)
- Image support with URL or `/public` paths
- Auto-save after reorder/drag-end

## Tech Stack
- Next.js 14, TypeScript, Tailwind CSS
- shadcn/ui components
- Gemini AI (`@google/generative-ai`)

## Getting Started
1) Install
```bash
pnpm install
```

2) Env vars (create `.env.local`)
```bash
GEMINI_API_KEY=your_api_key_here
# optional
GEMINI_MODEL=gemini-1.5-pro
```
Get an API key from Google AI Studio.

3) Dev server
```bash
pnpm dev
```
Open http://localhost:3000

4) Build
```bash
pnpm build && pnpm start
```

## How to Use
- Open the Builder: `app/builder/page.tsx`
- Generate with AI via the chat, or drag from Component Library.
- Select elements to edit in the Properties panel.
- Alt+Click: select the parent container quickly.

### Layout Modes
- Flow (default): parent is flex/grid; children are in normal order.
  - Reorder by dragging; children ignore x/y.
- Free: set container `props.layoutMode = "free"` in Properties.
  - Children become absolutely positioned; you can drag by x/y.

### Images (Logos/Icons)
- Use the `image` component.
- `src` supports full URLs or project public paths:
  - URL: `https://cdn.example.com/logo.svg`
  - Public: place files under `public/`, then set `src` to `/your-file.svg` (e.g. `/placeholder-logo.svg`).
- Add `alt`. Size with `className` or numeric `width/height`.

## Tips for Navbars / Spacing
- For tighter logo area, avoid `flex-1` or excessive `px-*` on the logo.
- Prefer `justify-start` on the navbar and `ml-auto` for right group.
- Adjust `gap-*` and padding to control spacing.

## Prompting Guidelines (lib/prompts.ts)
- JSON only; array of components.
- Supported types: `button`, `text`, `input`, `card`, `div`, `badge`, `avatar`, `tabs`, `table`, `image`.
- Required: `id`, `type`, `props.className`, `props.width`, `props.height`.
- `image` requires `src` (URL or `/public` path) and `alt`.
- Prefer Flow; if user asks for "serbest/absolute", set parent `layoutMode: "free"` and use `x,y` on children.

## Project Structure
- `app/` Next.js routes (builder, preview, auth)
- `components/` UI and builder components
- `lib/`
  - `gemini-ai.ts` Gemini client + JSON normalization
  - `prompts.ts` system and user prompts
  - `component-renderer.tsx` JSON → React render with drag/select
- `hooks/` utilities (toasts, mobile)
- `public/` placeholders and assets

## QA Checklist
- Nested reorder persists immediately.
- Drag-end after free-position saves.
- Image with URL and `/public` renders correctly.
- Navbar/logo spacing looks correct.
- Alt+Click selects parent; Properties panel updates nested props.

## License
For educational/demo use during internship. Customize as needed.
