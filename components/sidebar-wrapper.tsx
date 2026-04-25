"use client"

import { useNavigation } from "@/hooks/use-navigation"
import { AppSidebar } from "./app-sidebar"

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage } = useNavigation()

  const showSidebar = currentPage !== "main"

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <AppSidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage} 
        />
      )}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
