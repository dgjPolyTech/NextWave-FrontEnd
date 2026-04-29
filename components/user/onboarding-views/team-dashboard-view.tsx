"use client"

import { Plus, FileText, CalendarDays, Bell, MessageSquare, Calendar, ArrowRight, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface TeamDashboardViewProps {
  user_name?: string
  team_name?: string
}

export function TeamDashboardView({ user_name, team_name }: TeamDashboardViewProps) {
  const today = new Date()
  const formatDate = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
      hour12: false
    })
  }
  const formatOnlyDate = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    })
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div id="v-hero-section" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            안녕하세요, {user_name || '팀원'}님! 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            오늘도 '{team_name || '협업 팀'}'과 함께 효율적인 협업을 시작해보세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="shadow-md hover:shadow-lg transition-all"><Plus className="mr-2 h-4 w-4" /> 일정 만들기</Button>
          <Button variant="outline" className="hover:bg-accent transition-colors border-2"><FileText className="mr-2 h-4 w-4" /> 메모 작성</Button>
        </div>
      </div>

      <div id="v-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="예정된 일정" value="3개" icon={CalendarDays} color="text-blue-500" />
        <StatCard label="새 알림" value="12개" icon={Bell} color="text-amber-500" />
        <StatCard label="공유된 메모" value="8개" icon={MessageSquare} color="text-emerald-500" />
      </div>

      <div id="v-activity-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityCard title="예정된 일정" icon={Calendar} description="최근 예정된 일정입니다">
          {[1, 2].map((id) => {
            const scheduleDate = new Date(today)
            scheduleDate.setDate(today.getDate() + id)
            return (
              <div key={id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                <div className="w-1 h-10 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">시뮬레이션 예시 일정 {id}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {formatDate(scheduleDate)}</div>
                </div>
                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">예정</Badge>
              </div>
            )
          })}
        </ActivityCard>

        <ActivityCard title="최근 협업 메모" icon={FileText} description="팀원들과 공유 중인 최근 메모">
          {[1, 2].map((id) => {
            const memoDate = new Date(today)
            memoDate.setDate(today.getDate() - id)
            return (
              <div key={id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                <Avatar className="h-10 w-10 border">
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">AI</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">프로젝트 브레인스토밍 {id}</p>
                  <p className="text-xs text-muted-foreground mt-1">AI 봇 • {formatOnlyDate(memoDate)}</p>
                </div>
              </div>
            )
          })}
        </ActivityCard>

        <ActivityCard title="최근 알림" icon={Bell} description="놓친 활동들을 확인하세요">
          <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-muted before:via-muted before:to-transparent text-sm">
            <div className="relative flex items-start gap-4">
              <div className="mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm z-10 text-blue-500"><Calendar className="h-4 w-4" /></div>
              <div className="flex flex-col gap-1 pt-1">
                <p className="text-sm font-medium">'마케팅 회의' 일정이 다가옵니다.</p>
                <span className="text-xs text-muted-foreground font-medium">방금 전</span>
              </div>
            </div>
          </div>
        </ActivityCard>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="hover:bg-accent/50 transition-colors border-2 shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={cn("p-3 rounded-xl bg-background border shadow-sm", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityCard({ title, icon: Icon, description, children }: any) {
  return (
    <Card className="flex flex-col shadow-sm border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" /> {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}
