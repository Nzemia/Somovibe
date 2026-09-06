"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

export function NavWave({ className }: { className?: string }) {
  const raw = useId()
  const id = `nav-wave-${raw.replace(/:/g, "")}`

  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-x-0 top-full h-5 w-full",
        className
      )}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={id}
          width="96"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            fill="currentColor"
            d="M0 0 H96 V2 C72 2 72 18 48 18 C24 18 24 2 0 2 Z"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
