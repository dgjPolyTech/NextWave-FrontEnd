"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, MoreVertical, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScheduleCreateForm } from "./schedule-create"
import { scheduleService, ScheduleResponse } from "@/services/scheduleService"

interface ScheduleViewProps {
  teamId?: number
  onSelectSchedule?: (schedule: ScheduleResponse) => void
}

export function ScheduleView({ teamId, onSelectSchedule }: ScheduleViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSchedules = async () => {
    setIsLoading(true)
    try {
      if (!teamId) return;
      const data = await scheduleService.getTeamSchedules(teamId)
      setSchedules(data)
    } catch (error) {
      console.error("Failed to fetch schedules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (teamId) fetchSchedules()
  }, [teamId])

  const handleCreateSuccess = () => {
    setIsDialogOpen(false)
    fetchSchedules()
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
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
          <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30">
            <Button variant="ghost" size="sm" className="h-8">이번 주</Button>
            <Button variant="ghost" size="sm" className="h-8">이번 달</Button>
            <Button variant="ghost" size="sm" className="h-8 bg-background shadow-sm">전체</Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-md hover:shadow-lg transition-all">
                <Plus className="mr-2 h-4 w-4" /> 일정 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <ScheduleCreateForm teamId={teamId} onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">데이터를 불러오는 중...</div>
      ) : schedules.length === 0 ? (
        <div className="flex justify-center p-8 text-muted-foreground border rounded-lg border-dashed">
          등록된 일정이 없습니다.
        </div>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <Card 
              key={schedule.id} 
              className="hover:shadow-md transition-all group cursor-pointer"
              onClick={() => onSelectSchedule?.(schedule)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl shadow-sm transition-colors",
                      schedule.status === "COMPLETED" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    )}>
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{schedule.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{schedule.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={schedule.status === "COMPLETED" ? "secondary" : "default"} className="px-3">
                      {schedule.status === "COMPLETED" ? "완료" : schedule.status === "PENDING" ? "대기중" : schedule.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem>수정</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">삭제</DropdownMenuItem>
                        <DropdownMenuItem>공유</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(schedule.start_time)} {schedule.end_time && `~ ${formatDateTime(schedule.end_time)}`}</span>
                  </div>
                  {/* API schema doesn't provide participants array in ScheduleResponse directly.
                      We would need a separate call or adapt it later. For now omit or put placeholder */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">담당자 목록</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
