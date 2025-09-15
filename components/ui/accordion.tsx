"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-start justify-between gap-3 rounded-md px-2 py-3 text-left text-sm font-medium outline-none transition-all",
          "hover:bg-muted/40 dark:hover:bg-muted/20 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
          "disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>span>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <span className="pointer-events-none inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground transition-colors duration-200 group-hover:bg-muted/60">
          <ChevronDownIcon className="size-4 transition-transform duration-200" strokeWidth={2} />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
