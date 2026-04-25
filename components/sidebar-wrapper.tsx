"use client"

import { useNavigation } from "@/hooks/use-navigation"
import { AppSidebar } from "./app-sidebar"

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage } = useNavigation()

  const TEAM_PAGES = [
    "dashboard",
    "team-create",
    "team-invite",
    "schedule-view",
    "schedule-detail",
    "memo-write",
    "memo-share",
    "memo-detail",
    "notification-create",
    "notification-rules"
  ];
  
  const showSidebar = TEAM_PAGES.includes(currentPage);

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
