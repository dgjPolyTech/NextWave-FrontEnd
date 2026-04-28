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
import { TeamInvite } from "@/components/team/team-invite"
import { NotificationCreate } from "@/components/notification/notification-create"
import { NotificationRules } from "@/components/notification/notification-rules"
import { NotificationList } from "@/components/notification/notification-list"
import { UserSignUp } from "@/components/user/user-signup"
import { UserDetail } from "@/components/user/user-detail"
import { UserUpdate } from "@/components/user/user-update"

export default function Home() {
  const {
    currentPage,
    setCurrentPage,
    selectedMemo,
    setSelectedMemo,
    selectedSchedule,
    setSelectedSchedule
  } = useNavigation()

  // 선택된 팀 ID를 전역적으로 관리
  const [selectedTeamId, setSelectedTeamId] = useState<number>(0)

  const handleSelectTeam = (teamId: number) => {
    setSelectedTeamId(teamId)
    setCurrentPage("dashboard")
  }

  const handleViewMemo = (memo: any) => {
    setSelectedMemo(memo)
    setCurrentPage("memo-detail")
  }

  const handleViewSchedule = (schedule: any) => {
    setSelectedSchedule(schedule)
    setCurrentPage("schedule-detail")
  }

  const renderContent = () => {
    switch (currentPage) {
      case "main":
        return <MainPage onSelectTeam={handleSelectTeam} onNavigate={setCurrentPage} />
      case "dashboard":
        return <Dashboard teamId={selectedTeamId} onNavigate={setCurrentPage} />
      case "schedule-view":
        return <ScheduleView teamId={selectedTeamId} onSelectSchedule={handleViewSchedule} />
      case "schedule-detail":
        return <ScheduleDetail schedule={selectedSchedule} onBack={() => setCurrentPage("schedule-view")} />
      case "memo-write":
        return <MemoWrite teamId={selectedTeamId} onSuccess={() => setCurrentPage("memo-share")} />
      case "memo-share":
        return <MemoShare teamId={selectedTeamId} onViewMemo={handleViewMemo} />
      case "memo-detail":
        return <MemoDetail memo={selectedMemo} onBack={() => setCurrentPage("memo-share")} />
      case "team-create":
        return <TeamCreate onSuccess={() => setCurrentPage("main")} />
      case "team-invite":
        return <TeamInvite teamId={selectedTeamId} />
      case "notification-create":
        return <NotificationCreate teamId={selectedTeamId} />
      case "notification-rules":
        return <NotificationRules teamId={selectedTeamId} />
      case "notification-list":
        return <NotificationList />
      case "user-signup":
        return <UserSignUp onSuccess={(teamId) => {
          if (teamId) {
            handleSelectTeam(teamId)
          } else {
            setCurrentPage("main")
          }
        }} />
      case "user-detail":
        return <UserDetail />
      case "user-update":
        return <UserUpdate />
      default:
        return <MainPage onSelectTeam={handleSelectTeam} onNavigate={setCurrentPage} />
    }
  }

  return renderContent()
}
