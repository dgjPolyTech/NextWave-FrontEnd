"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export type PageType =
  | "main"
  | "dashboard"
  | "schedule-view"
  | "memo-write"
  | "memo-share"
  | "memo-detail"
  | "schedule-detail"
  | "team-create"
  | "team-invite"
  | "notification-create"
  | "notification-rules"
  | "user-signup"

interface NavigationContextType {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
  selectedMemo: any
  setSelectedMemo: (memo: any) => void
  selectedSchedule: any
  setSelectedSchedule: (schedule: any) => void
  selectedTeamId: number
  setSelectedTeamId: (teamId: number) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

function NavigationInner({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [currentPage, setCurrentPageInternal] = useState<PageType>("main")
  const [selectedMemo, setSelectedMemo] = useState<any>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [selectedTeamId, setSelectedTeamIdInternal] = useState<number>(0)

  // URL 쿼리 파라미터에서 페이지 및 팀 정보 읽기
  useEffect(() => {
    const pageParam = searchParams.get("page") as PageType
    if (pageParam && pageParam !== currentPage) {
      setCurrentPageInternal(pageParam)
    }
    
    const teamIdParam = searchParams.get("teamId")
    if (teamIdParam) {
      const tid = parseInt(teamIdParam)
      if (!isNaN(tid) && tid !== selectedTeamId) {
        setSelectedTeamIdInternal(tid)
      }
    }
  }, [searchParams, currentPage, selectedTeamId])

  // 페이지 전환 시 URL 업데이트
  const setCurrentPage = useCallback((page: PageType) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", page)
    router.push(`${pathname}?${params.toString()}`)
    setCurrentPageInternal(page)
  }, [pathname, router])

  // 팀 선택 시 URL 업데이트
  const setSelectedTeamId = useCallback((teamId: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("teamId", teamId.toString())
    router.push(`${pathname}?${params.toString()}`)
    setSelectedTeamIdInternal(teamId)
  }, [pathname, router])

  return (
    <NavigationContext.Provider value={{
      currentPage,
      setCurrentPage,
      selectedMemo,
      setSelectedMemo,
      selectedSchedule,
      setSelectedSchedule,
      selectedTeamId,
      setSelectedTeamId
    }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <NavigationInner>
        {children}
      </NavigationInner>
    </Suspense>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
