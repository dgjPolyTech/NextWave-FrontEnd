"use client"

import { useState } from "react"
import { useNavigation } from "@/hooks/use-navigation"
import { MainPage } from "@/components/main/main-page"
import { Dashboard } from "@/components/dashboard"
import { ScheduleView } from "@/components/schedule/schedule-view"
import { ScheduleDetail } from "@/components/schedule/schedule-detail"
import { MemoWrite } from "@/components/memo/memo-write"
import { MemoShare } from "@/components/memo/memo-share"
import { MemoDetail } from "@/components/memo/memo-detail"
import { TeamCreate } from "@/components/team/team-create"
import { TeamManage } from "@/components/team/team-manage"
import { NotificationCreate } from "@/components/notification/notification-create"
import { NotificationList } from "@/components/notification/notification-list"
import { UserSignUp } from "@/components/user/user-signup"
import { UserDetail } from "@/components/user/user-detail"
import { UserUpdate } from "@/components/user/user-update"
import { PAGES } from "@/lib/constants"

export default function Home() {
  const {
    currentPage,
    setCurrentPage,
    selectedMemo,
    setSelectedMemo,
    selectedSchedule,
    setSelectedSchedule,
    selectedTeamId,
    setSelectedTeamId
  } = useNavigation()

  const handleSelectTeam = (teamId: number) => {
    setSelectedTeamId(teamId)
    setCurrentPage(PAGES.DASHBOARD)
  }

  const handleViewMemo = (memo: any) => {
    setSelectedMemo(memo)
    setCurrentPage(PAGES.MEMO_DETAIL)
  }

  const handleViewSchedule = (schedule: any) => {
    setSelectedSchedule(schedule)
    setCurrentPage(PAGES.SCHEDULE_DETAIL)
  }

  const renderContent = () => {
    switch (currentPage) {
      case PAGES.MAIN:
        return <MainPage onSelectTeam={handleSelectTeam} onNavigate={setCurrentPage} />
      case PAGES.DASHBOARD:
        return <Dashboard teamId={selectedTeamId} onNavigate={setCurrentPage} />
      case PAGES.SCHEDULE_VIEW:
        return <ScheduleView teamId={selectedTeamId} onSelectSchedule={handleViewSchedule} onNavigate={setCurrentPage} />
      case PAGES.SCHEDULE_DETAIL:
        return <ScheduleDetail schedule={selectedSchedule} onBack={() => setCurrentPage(PAGES.SCHEDULE_VIEW)} />
      case PAGES.MEMO_WRITE:
        return <MemoWrite teamId={selectedTeamId} onSuccess={() => setCurrentPage(PAGES.MEMO_SHARE)} onNavigate={setCurrentPage} />
      case PAGES.MEMO_SHARE:
        return <MemoShare teamId={selectedTeamId} onViewMemo={handleViewMemo} />
      case PAGES.MEMO_DETAIL:
        return <MemoDetail memo={selectedMemo} onBack={() => setCurrentPage(PAGES.MEMO_SHARE)} />
      case PAGES.TEAM_CREATE:
        return <TeamCreate onSuccess={() => setCurrentPage(PAGES.MAIN)} />
      case PAGES.TEAM_MANAGE:
        return <TeamManage teamId={selectedTeamId} />
      case PAGES.NOTIFICATION_CREATE:
        return <NotificationCreate teamId={selectedTeamId} />
      case PAGES.NOTIFICATION_LIST:
        return <NotificationList />
      case PAGES.USER_SIGNUP:
        return <UserSignUp onSuccess={(teamId) => {
          if (teamId) {
            handleSelectTeam(teamId)
          } else {
            setCurrentPage(PAGES.MAIN)
          }
        }} />
      case PAGES.USER_DETAIL:
        return <UserDetail />
      case PAGES.USER_UPDATE:
        return <UserUpdate />
      default:
        return <MainPage onSelectTeam={handleSelectTeam} onNavigate={setCurrentPage} />
    }
  }

  return renderContent()
}
