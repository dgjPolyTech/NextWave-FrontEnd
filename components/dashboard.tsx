"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  FileText,
  Users,
  Bell,
  ArrowRight,
  Plus,
  Clock,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  CalendarDays,
  Loader2,
  Sparkles
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { scheduleService, ScheduleResponse } from "@/services/scheduleService"
import { memoService, MemoResponse } from "@/services/memoService"
import { notificationService, NotificationResponse } from "@/services/notificationService"
import { userService, UserResponse } from "@/services/userService"
import { onboardingService } from "@/services/onboardingService"

type PageType =
  | "dashboard"
  | "schedule-view"
  | "memo-write"
  | "memo-share"
  | "team-create"
  | "team-invite"
  | "notification-create"
  | "notification-rules"

interface DashboardProps {
  teamId?: number
  onNavigate: (page: PageType) => void
}

export function Dashboard({ teamId, onNavigate }: DashboardProps) {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])
  const [memos, setMemos] = useState<MemoResponse[]>([])
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState<string>('IDLE')

  useEffect(() => {
    setOnboardingStep(onboardingService.getStep())
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const currentUser = await userService.getMe()
        setUser(currentUser)

        if (teamId) {
          const [teamSchedules, teamMemos, allNotifications] = await Promise.all([
            scheduleService.getTeamSchedules(teamId),
            memoService.getTeamMemos(teamId),
            notificationService.getMyNotifications()
          ])

          setSchedules(teamSchedules || [])
          setMemos(teamMemos || [])

          // Filter notifications by team schedules
          const teamScheduleIds = new Set((teamSchedules || []).map(s => s.id))
          const filteredNotifications = (allNotifications || []).filter(n => teamScheduleIds.has(n.schedule_id))
          setNotifications(filteredNotifications)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">대시보드 데이터를 불러오는 중...</p>
      </div>
    )
  }

  // Get first 3 items for preview
  const recentSchedules = schedules.slice(0, 3)
  const recentMemos = memos.slice(0, 3)
  const recentNotifications = notifications.slice(0, 3)

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 relative">
      {/* 온보딩 안내 레이어 */}
      {onboardingStep === 'TEAM_CREATED' && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm pointer-events-none flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border-2 border-primary animate-bounce pointer-events-auto max-w-sm text-center">
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">팀 생성을 축하합니다! 🥳</h3>
            <p className="text-muted-foreground text-sm mb-4">
              이제 팀원들과 공유할 **첫 번째 일정**을 만들어볼까요? <br />
              오른쪽 상단의 버튼을 클릭해보세요.
            </p>
            <Button size="sm" onClick={() => setOnboardingStep('IDLE')}>알겠습니다!</Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            안녕하세요, {user?.username || '팀원'}님! 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            오늘도 NextWave와 함께 효율적인 협업을 시작해보세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onNavigate("schedule-view")}
            className={`shadow-md hover:shadow-lg transition-all ${onboardingStep === 'TEAM_CREATED' ? 'ring-4 ring-primary ring-offset-4 animate-pulse relative z-50' : ''}`}
          >
            <Plus className="mr-2 h-4 w-4" /> 일정 만들기
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate("memo-write")}
            className="hover:bg-accent transition-colors"
          >
            <FileText className="mr-2 h-4 w-4" /> 메모 작성
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "예정된 일정", value: `${schedules.length}개`, icon: CalendarDays, color: "text-blue-500" },
          { label: "새 알림", value: `${notifications.length}개`, icon: Bell, color: "text-amber-500" },
          { label: "공유된 메모", value: `${memos.length}개`, icon: MessageSquare, color: "text-emerald-500" },
        ].map((stat, i) => (
          <Card key={i} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-background border shadow-sm ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Schedules */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> 예정된 일정
              </CardTitle>
              <CardDescription>최근 예정된 일정입니다</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onNavigate("schedule-view")}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {recentSchedules.length > 0 ? recentSchedules.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors group">
                <div className={`w-1 h-10 rounded-full bg-blue-500`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {new Date(item.start_time).toLocaleString()}
                  </div>
                </div>
                <Badge variant="secondary" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {item.status || "예정"}
                </Badge>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">일정이 없습니다.</div>
            )}
          </CardContent>
        </Card>

        {/* Collaborative Memos */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> 최근 협업 메모
              </CardTitle>
              <CardDescription>팀원들과 공유 중인 최근 메모</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onNavigate("memo-share")}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {recentMemos.length > 0 ? recentMemos.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                <Avatar className="h-10 w-10 border">
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                    {item.author_name ? item.author_name.substring(0, 2) : "UN"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.author_name} • {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground/30" />
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">작성된 메모가 없습니다.</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> 최근 알림
              </CardTitle>
              <CardDescription>놓친 활동들을 확인하세요</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {recentNotifications.length > 0 ? (
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-muted before:via-muted before:to-transparent">
                {recentNotifications.map((item) => {
                  // Find schedule title if possible
                  const schedule = schedules.find(s => s.id === item.schedule_id)
                  const content = schedule ? `'${schedule.title}' 일정이 다가오고 있습니다.` : "새로운 알림이 도착했습니다."

                  return (
                    <div key={item.id} className="relative flex items-start gap-4 pl-0">
                      <div className={`mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm z-10 text-blue-500`}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-1 pt-1">
                        <p className="text-sm leading-relaxed">{content}</p>
                        <span className="text-xs text-muted-foreground">{new Date(item.remind_at).toLocaleString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">최근 알림이 없습니다.</div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
