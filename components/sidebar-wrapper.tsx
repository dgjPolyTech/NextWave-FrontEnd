"use client"

import { useNavigation } from "@/hooks/use-navigation"
import { AppSidebar } from "./app-sidebar"
import { PAGES } from "@/lib/constants"

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage } = useNavigation()

  const TEAM_PAGES = [
    PAGES.DASHBOARD,
    PAGES.TEAM_CREATE,
    PAGES.TEAM_MANAGE,
    PAGES.SCHEDULE_VIEW,
    PAGES.SCHEDULE_DETAIL,
    PAGES.MEMO_WRITE,
    PAGES.MEMO_SHARE,
    PAGES.MEMO_DETAIL,
    PAGES.NOTIFICATION_CREATE,
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
