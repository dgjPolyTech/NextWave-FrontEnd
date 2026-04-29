"use client"

import { useNavigation } from "@/hooks/use-navigation"
import { AppSidebar } from "./app-sidebar"
import { PAGES } from "@/lib/constants"
import { NotificationModal } from "./notification/notification-modal"
import { OnboardingModal } from "./user/onboarding-modal"
import { onboardingService } from "@/services/onboardingService"
import { userService } from "@/services/userService"
import { authService } from "@/services/authService"
import { useState, useEffect } from "react"
import { HelpCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage, isNotificationModalOpen, setIsNotificationModalOpen } = useNavigation()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = authService.getToken()
    setIsLoggedIn(!!token)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      const checkOnboarding = async () => {
        try {
          const me = await userService.getMe()
          if (!onboardingService.isCompleted(me.id)) {
            setShowOnboarding(true)
          }
        } catch (err) {
          console.error("Failed to check onboarding status:", err)
        }
      }
      checkOnboarding()
    }
  }, [isLoggedIn])

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

      {/* Global Notification Modal */}
      <NotificationModal 
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false)
          // 필요한 경우 페이지를 새로고침하거나 상태를 업데이트합니다.
          if (currentPage === PAGES.MAIN) {
             window.location.reload(); 
          }
        }}
      />

      {/* Floating Help Button */}
      {isLoggedIn && (
        <div className="fixed bottom-6 right-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon" 
                className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-white border-4 border-background ring-2 ring-primary/20"
              >
                <HelpCircle className="h-7 w-7" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl">
              <DropdownMenuLabel className="font-bold px-3 py-2 text-sm opacity-70">도움말 및 지원</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 p-3 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setShowOnboarding(true)}
              >
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">온보딩 가이드 다시 보기</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">AI가 제안하는 초기 설정 가이드를 다시 확인합니다.</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
