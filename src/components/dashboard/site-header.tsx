"use client"

import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { setOpen } = useSidebar()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <MenuIcon className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">CRM Portal</h1>
        </div>
      </div>
    </header>
  )
}
