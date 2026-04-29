"use client"

import { Calendar, Clock, Users, Plus, MoreVertical, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface VirtualSchedule {
  id: number
  title: string
  description: string
  start_time: string
  end_time?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

interface ScheduleViewProps {
  virtualSchedules: VirtualSchedule[]
  onCreateClick: () => void
  onCardClick?: (id: number) => void
  user_name?: string
}

export function ScheduleView({ virtualSchedules, onCreateClick, onCardClick, user_name }: ScheduleViewProps) {
  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            일정 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            등록된 팀 일정을 확인하고 새로운 일정을 계획하세요.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button id="v-schedule-create-btn" onClick={onCreateClick} className="rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" /> 일정 생성
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-2xl border-2 border-dashed">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input className="w-full bg-transparent pl-9 pr-4 py-2 text-sm outline-none" placeholder="일정 제목 또는 내용 검색..." disabled />
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl"><Filter className="h-4 w-4" /></Button>
      </div>

      {virtualSchedules.length === 0 ? (
        <Card className="border-2 border-dashed border-muted bg-muted/10 p-20 text-center rounded-3xl">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="bg-primary/10 h-16 w-16 rounded-2xl flex items-center justify-center text-primary mb-6"><Calendar className="h-8 w-8" /></div>
            <h4 className="text-xl font-bold mb-2">등록된 일정이 없습니다</h4>
            <p className="text-muted-foreground mb-8">새로운 일정을 생성하여 팀원들과 <br />협업 일정을 공유해 보세요.</p>
            <Button onClick={onCreateClick} size="lg" className="rounded-xl px-8 font-bold">첫 번째 일정 만들기</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {virtualSchedules.map((schedule) => (
            <Card
              key={schedule.id}
              id={`v-schedule-card-${schedule.id}`}
              onClick={() => onCardClick?.(schedule.id)}
              className="hover:border-primary/50 transition-all group cursor-pointer border-2 shadow-sm rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            >
              <div className="flex items-stretch">
                <div className={cn(
                  "w-2 transition-colors",
                  schedule.status === 'COMPLETED' ? "bg-slate-300" : "bg-primary"
                )} />
                <div className="flex-1">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl shadow-sm border",
                        schedule.status === 'COMPLETED' ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                      )}>
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">{schedule.title}</CardTitle>
                        <CardDescription className="line-clamp-1">{schedule.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={schedule.status === 'COMPLETED' ? 'secondary' : 'default'} className="px-3 py-0.5 font-bold uppercase text-[10px] tracking-wider">
                        {schedule.status === 'COMPLETED' ? '완료' : '대기중'}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/60" />
                        <span>{schedule.start_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary/60" />
                        <span>{user_name || '사용자'}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
