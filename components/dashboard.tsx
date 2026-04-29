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
  Sparkles,
  LayoutDashboard
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
import { PAGES, ONBOARDING_STEPS } from "@/lib/constants"

type PageType = typeof PAGES[keyof typeof PAGES]

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
  const [onboardingFinalStep, setOnboardingFinalStep] = useState<'IDLE' | 'DASHBOARD_INTRO' | 'CONGRATS'>('IDLE')

  useEffect(() => {
    const step = onboardingService.getStep()
    setOnboardingStep(step)
    
    if (step === ONBOARDING_STEPS.COMPLETED && !onboardingService.isFinalMessageShown()) {
      setOnboardingFinalStep('DASHBOARD_INTRO')
    }
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

  const handleStatusChange = async (scheduleId: number, currentStatus: string) => {
    const statusCycle: Record<string, string> = {
      'PENDING': 'IN_PROGRESS',
      'IN_PROGRESS': 'COMPLETED',
      'COMPLETED': 'PENDING'
    }
    const nextStatus = statusCycle[currentStatus] || 'PENDING'
    
    try {
      await scheduleService.updateStatus(scheduleId, { status: nextStatus })
      setSchedules((prev: ScheduleResponse[]) => prev.map((s: ScheduleResponse) => s.id === scheduleId ? { ...s, status: nextStatus } : s))
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return { label: '진행 중', color: 'bg-amber-500/10 text-amber-600 border-amber-200' }
      case 'COMPLETED': return { label: '완료', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' }
      default: return { label: '예정', color: 'bg-slate-100 text-slate-600 border-slate-200' }
    }
  }

  // Get first 3 items for preview
  const recentSchedules = schedules.slice(0, 3)
  const recentMemos = memos.slice(0, 3)
  const recentNotifications = notifications.slice(0, 3)

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 relative">
      {/* 데이터 로딩 오버레이 (온보딩 레이어보다 뒤에 배치) */}
      {isLoading && onboardingFinalStep === 'IDLE' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm min-h-[60vh] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">대시보드 데이터를 불러오는 중...</p>
        </div>
      )}
      {/* 온보딩 배경 어둡게 처리 (Spotlight 효과용) */}
      {(onboardingStep === ONBOARDING_STEPS.TEAM_CREATED || onboardingStep === ONBOARDING_STEPS.SCHEDULE_COMPLETED || onboardingFinalStep === 'DASHBOARD_INTRO') && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-all duration-500" />
      )}

      {/* 온보딩 안내 레이어 (기존 단계용: 일정/메모 생성 유도) */}
      {(onboardingStep === ONBOARDING_STEPS.TEAM_CREATED || onboardingStep === ONBOARDING_STEPS.SCHEDULE_COMPLETED) && onboardingFinalStep === 'IDLE' && (
        <div className="absolute top-24 right-8 z-50 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border-2 border-primary max-w-sm text-center relative">
            <div className="absolute -top-3 right-10">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-primary" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-center mb-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {onboardingStep === ONBOARDING_STEPS.TEAM_CREATED ? '팀 생성을 축하합니다! 🥳' : '일정 생성을 완료했습니다! ✨'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {onboardingStep === ONBOARDING_STEPS.TEAM_CREATED ? (
                  <>이제 팀원들과 공유할 <strong>첫 번째 일정</strong>을 만들어볼까요? <br />오른쪽 상단의 버튼을 클릭해보세요.</>
                ) : (
                  <>잘하셨어요! 이제 일정에 관련된 <strong>첫 번째 메모</strong>를 작성해볼까요? <br />오른쪽 상단의 버튼을 클릭해보세요.</>
                )}
              </p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={() => {
                  if (onboardingStep === ONBOARDING_STEPS.TEAM_CREATED) onNavigate(PAGES.SCHEDULE_VIEW);
                  else if (onboardingStep === ONBOARDING_STEPS.SCHEDULE_COMPLETED) onNavigate(PAGES.MEMO_WRITE);
                  setOnboardingStep(ONBOARDING_STEPS.IDLE);
                }}>
                  {onboardingStep === ONBOARDING_STEPS.TEAM_CREATED ? '일정 만들러 가기' : '메모 쓰러 가기'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  onboardingService.setStep(ONBOARDING_STEPS.COMPLETED);
                  setOnboardingStep(ONBOARDING_STEPS.COMPLETED);
                }}>건너뛰기</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 온보딩 최종 단계 1: 대시보드 설명 (Spotlight 효과) */}
      {onboardingFinalStep === 'DASHBOARD_INTRO' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in-95 duration-500 w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border-2 border-primary text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">대시보드에 오신 것을 환영합니다! 🏠</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              이제 대시보드에서 지금까지 생성한 <strong>일정과 메모</strong>를 한눈에 확인할 수 있어요. <br/>
              팀의 활동 내역과 실시간 알림도 여기서 바로 체크하세요!
            </p>
            <Button className="w-full h-12 rounded-xl font-bold gap-2" onClick={() => setOnboardingFinalStep('CONGRATS')}>
              다음 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 온보딩 최종 단계 2: 최종 완료 축하 모달 */}
      {onboardingFinalStep === 'CONGRATS' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-primary/20 p-8 text-center animate-in zoom-in-95 duration-300">
            {/* 배경 장식 */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary p-4 rounded-full shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <div className="mt-4 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">모든 준비가 끝났습니다! 🎉</h2>
              <p className="text-muted-foreground leading-relaxed">
                축하합니다! 이제 NextWave의 핵심 기능을 모두 마스터하셨습니다. <br />
                이제 팀원들과 함께 더 생산적인 협업을 시작해보세요. 
              </p>
              
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-sm text-primary font-medium">
                "혼자가 아닌 함께할 때, 더 큰 파도를 만들 수 있습니다."
              </div>

              <Button 
                className="w-full h-12 rounded-xl font-bold"
                onClick={() => {
                  setOnboardingFinalStep('IDLE')
                  onboardingService.markFinalMessageShown()
                }}
              >
                진짜 시작하기
              </Button>
            </div>
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
            onClick={() => onNavigate(PAGES.SCHEDULE_VIEW)}
            className={`shadow-md hover:shadow-lg transition-all ${onboardingStep === 'TEAM_CREATED' ? 'ring-4 ring-primary ring-offset-4 animate-pulse relative z-50' : ''}`}
          >
            <Plus className="mr-2 h-4 w-4" /> 일정 만들기
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate(PAGES.MEMO_WRITE)}
            className={`hover:bg-accent transition-colors ${onboardingStep === 'SCHEDULE_COMPLETED' ? 'ring-4 ring-primary ring-offset-4 animate-pulse relative z-50 bg-background shadow-lg' : ''}`}
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
            <Button variant="ghost" size="icon" onClick={() => onNavigate(PAGES.SCHEDULE_VIEW)}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {recentSchedules.length > 0 ? recentSchedules.map((item) => {
              const cfg = getStatusConfig(item.status)
              return (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors group">
                  <div className={`w-1 h-10 rounded-full ${item.status === 'COMPLETED' ? 'bg-emerald-500' : item.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {new Date(item.start_time).toLocaleString()}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`cursor-pointer hover:shadow-sm transition-all ${cfg.color}`}
                    onClick={() => handleStatusChange(item.id, item.status)}
                  >
                    {cfg.label}
                  </Badge>
                </div>
              )
            }) : (
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
            <Button variant="ghost" size="icon" onClick={() => onNavigate(PAGES.MEMO_SHARE)}>
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
