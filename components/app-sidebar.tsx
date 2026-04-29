"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  FileText,
  Users,
  Bell,
  Home,
  ChevronDown,
  PanelLeft,
  Menu,
  Sparkles,
  User as UserIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PageType, PAGES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { userService, UserResponse } from "@/services/userService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppSidebarProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<UserResponse | null>(null)

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getMe()
        setUser(data)
      } catch (err) {
        console.error("Failed to fetch user for sidebar:", err)
      }
    }
    fetchUser()
  }, [])

  const getProfileImageUrl = (path: string | null | undefined) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${process.env.NEXT_PUBLIC_API_URL || ''}${path}`
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground min-h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border relative",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-10 h-8 w-8 rounded-full border bg-background shadow-md z-50 hover:bg-accent hidden md:flex"
          onClick={toggleSidebar}
        >
          <PanelLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>

        {/* Header */}
        <div
          className={cn(
            "p-6 flex items-center gap-3 border-b border-sidebar-border overflow-hidden whitespace-nowrap cursor-pointer hover:bg-sidebar-accent transition-colors",
            isCollapsed && "p-4 justify-center"
          )}
          onClick={() => onNavigate(PAGES.MAIN)}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h1 className="text-xl font-bold tracking-tight">NextWave</h1>
              <p className="text-xs text-sidebar-foreground/70">팀 협업 플랫폼</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          <SidebarNavItem
            icon={Home}
            label="대시보드"
            isActive={currentPage === PAGES.DASHBOARD}
            onClick={() => onNavigate(PAGES.DASHBOARD)}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={Calendar}
            label="일정 관리"
            isActive={currentPage === PAGES.SCHEDULE_VIEW}
            onClick={() => onNavigate(PAGES.SCHEDULE_VIEW)}
            isCollapsed={isCollapsed}
          />

          <SidebarCollapsibleItem
            icon={FileText}
            label="협업 메모"
            isCollapsed={isCollapsed}
            items={[
              { label: "메모 작성", active: currentPage === PAGES.MEMO_WRITE, onClick: () => onNavigate(PAGES.MEMO_WRITE) },
               { label: "메모 공유", active: currentPage === PAGES.MEMO_SHARE, onClick: () => onNavigate(PAGES.MEMO_SHARE) },
            ]}
          />

          <SidebarCollapsibleItem
            icon={Users}
            label="팀 협업"
            isCollapsed={isCollapsed}
            items={[
              // { label: "팀 생성", active: currentPage === "team-create", onClick: () => onNavigate("team-create") },
              { label: "팀 초대", active: currentPage === PAGES.TEAM_INVITE, onClick: () => onNavigate(PAGES.TEAM_INVITE) },
              { label: "알림 설정", active: currentPage === PAGES.NOTIFICATION_RULES, onClick: () => onNavigate(PAGES.NOTIFICATION_RULES) },
            ]}
          />
        </nav>

        {/* Footer */}
        <div className={cn("p-4 border-t border-sidebar-border overflow-hidden", isCollapsed && "p-2")}>
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <Avatar className="w-10 h-10 shrink-0 border-2 border-primary/20">
              {user?.image_path && <AvatarImage src={getProfileImageUrl(user.image_path)} />}
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm font-bold">
                {user?.username ? user.username.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-300">
                <p className="text-sm font-semibold truncate">{user?.username || "사용자"}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email || "loading..."}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}

function SidebarNavItem({ icon: Icon, label, isActive, onClick, isCollapsed }: any) {
  const content = (
    <Button
      variant="ghost"
      className={cn(
        "w-full gap-3 text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200",
        isActive ? "bg-sidebar-accent font-medium shadow-sm" : "opacity-80 hover:opacity-100",
        isCollapsed ? "justify-center p-0 h-10 w-10 mx-auto" : "justify-start px-3"
      )}
      onClick={onClick}
    >
      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Button>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

function SidebarCollapsibleItem({ icon: Icon, label, items, isCollapsed }: any) {
  const [isOpen, setIsOpen] = useState(false)

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="w-full h-10 w-10 mx-auto justify-center p-0 text-sidebar-foreground opacity-80 hover:opacity-100 hover:bg-sidebar-accent"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Icon className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between text-sidebar-foreground opacity-80 hover:opacity-100 hover:bg-sidebar-accent px-3"
        >
          <span className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-11 space-y-1 mt-1 transition-all">
        {items.map((item: any, idx: number) => (
          <Button
            key={idx}
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
              item.active && "text-sidebar-foreground font-medium bg-sidebar-accent/50"
            )}
            onClick={item.onClick}
          >
            {item.label}
          </Button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

