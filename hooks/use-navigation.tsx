"use client"

import { createContext, useContext, useState, ReactNode } from "react"

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
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageType>("main")
  const [selectedMemo, setSelectedMemo] = useState<any>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)

  return (
    <NavigationContext.Provider value={{
      currentPage,
      setCurrentPage,
      selectedMemo,
      setSelectedMemo,
      selectedSchedule,
      setSelectedSchedule
    }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
