"use client"

import { useState, useEffect } from "react"
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  BellPlus, 
  BellOff, 
  Loader2, 
  Sparkles,
  Settings,
  Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { scheduleService, ScheduleResponse } from "@/services/scheduleService"
import { notificationService, NotificationResponse } from "@/services/notificationService"
import { ScheduleAssigneeManager } from "./schedule-assignee-manager"
import { cn } from "@/lib/utils"

interface ScheduleDetailProps {
  schedule: ScheduleResponse | null
  onBack: () => void
}

export function ScheduleDetail({ schedule: initialSchedule, onBack }: ScheduleDetailProps) {
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(initialSchedule)
  const [reminders, setReminders] = useState<NotificationResponse[]>([])
  const [newReminder, setNewReminder] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (initialSchedule) {
      fetchData()
    }
  }, [initialSchedule?.id])

  const fetchData = async () => {
    if (!initialSchedule) return
    try {
      const [scheduleData, remindersData] = await Promise.all([
        scheduleService.getSchedule(initialSchedule.id),
        notificationService.getMyNotifications()
      ])
      setSchedule(scheduleData)
      setReminders(remindersData.filter(n => n.schedule_id === initialSchedule.id))
    } catch (err) {
      console.error("Failed to fetch schedule detail:", err)
    }
  }

  const handleDeleteSchedule = async () => {
    if (!schedule || !confirm("정말로 이 일정을 삭제하시겠습니까?")) return
    setIsDeleting(true)
    try {
      await scheduleService.deleteSchedule(schedule.id)
      alert("일정이 삭제되었습니다.")
      onBack()
    } catch (err) {
      console.error("Delete failed:", err)
      alert("삭제에 실패했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusUpdate = async (nextStatus: string) => {
    if (!schedule) return
    setIsUpdating(true)
    try {
      const updated = await scheduleService.updateStatus(schedule.id, { status: nextStatus })
      setSchedule(updated)
    } catch (err) {
      console.error("Status update failed:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddReminder = async () => {
    if (!schedule || !newReminder) return
    try {
      const remindAt = new Date(newReminder).toISOString()
      const created = await notificationService.createNotification({
        schedule_id: schedule.id,
        remind_at: remindAt
      })
      setReminders((prev: NotificationResponse[]) => [...prev, created])
      setNewReminder("")
    } catch (err) {
      console.error("Failed to add reminder:", err)
      alert("리마인더 추가에 실패했습니다.")
    }
  }

  const handleDeleteReminder = async (id: number) => {
    try {
      await notificationService.deleteNotification(id)
      setReminders((prev: NotificationResponse[]) => prev.filter((r: NotificationResponse) => r.id !== id))
    } catch (err) {
      console.error("Failed to delete reminder:", err)
    }
  }

  if (!schedule) return null

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return "-"
    const date = new Date(isoString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-8 hover:bg-secondary/50 rounded-xl transition-all group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        목록으로 돌아가기
      </Button>

      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
        <div className={cn(
          "h-3 w-full transition-colors duration-500",
          schedule.status === "COMPLETED" ? "bg-emerald-500" : 
          schedule.status === "IN_PROGRESS" ? "bg-amber-500" : "bg-primary"
        )} />
        
        <CardHeader className="pb-6 p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Badge
                variant={schedule.status === "COMPLETED" ? "secondary" : "default"}
                className={cn(
                  "px-4 py-1 text-xs font-black uppercase tracking-widest rounded-full shadow-sm border",
                  schedule.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" :
                  schedule.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                  "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {schedule.status === "COMPLETED" ? (
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> 완료됨</span>
                ) : schedule.status === "IN_PROGRESS" ? (
                  <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 animate-pulse" /> 진행 중</span>
                ) : (
                  <span className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> 대기중</span>
                )}
              </Badge>
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="text-sm font-bold text-muted-foreground/60 flex items-center gap-2 uppercase tracking-tighter">
              <Calendar className="h-4 w-4" />
              Schedule ID: #{schedule.id}
            </div>
          </div>
          
          <CardTitle className="text-5xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 mb-6 leading-tight">
            {schedule.title}
          </CardTitle>
          <CardDescription className="text-xl leading-relaxed text-muted-foreground font-medium max-w-2xl">
            {schedule.description || "이 일정에 대한 상세 설명이 등록되지 않았습니다."}
          </CardDescription>
        </CardHeader>

        <Separator className="mx-10 opacity-50" />

        <CardContent className="p-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column: Time & Status */}
            <div className="space-y-10">
              <div className="space-y-5">
                <h3 className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Timeframe
                </h3>
                <div className="bg-muted/20 p-8 rounded-[2rem] border border-border/40 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Calendar className="h-24 w-24" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Start Time
                      </p>
                      <p className="text-2xl font-black text-foreground/90">{formatDateTime(schedule.start_time)}</p>
                    </div>
                    <div className="w-12 h-1 bg-gradient-to-r from-primary/40 to-transparent rounded-full" />
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" /> End Time
                      </p>
                      <p className="text-2xl font-black text-foreground/80">{formatDateTime(schedule.end_time)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Quick Actions
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 hover:bg-primary/5 transition-all shadow-sm whitespace-nowrap"
                    onClick={() => handleStatusUpdate('PENDING')}
                    disabled={isUpdating || schedule.status === 'PENDING'}
                  >
                    대기
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 hover:bg-amber-500/5 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm whitespace-nowrap"
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                    disabled={isUpdating || schedule.status === 'IN_PROGRESS'}
                  >
                    진행중
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm whitespace-nowrap"
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    disabled={isUpdating || schedule.status === 'COMPLETED'}
                  >
                    완료
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Assignees & Reminders */}
            <div className="space-y-10">
              <div className="space-y-5">
                <h3 className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Users className="h-4 w-4" /> Assignees
                </h3>
                <ScheduleAssigneeManager scheduleId={schedule.id} teamId={schedule.team_id} />
              </div>

              <div className="space-y-5">
                <h3 className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <BellPlus className="h-4 w-4" /> Personal Reminders
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      type="datetime-local" 
                      className="rounded-xl h-11 border-border/40 bg-muted/20 focus:bg-background transition-all"
                      value={newReminder}
                      onChange={(e) => setNewReminder(e.target.value)}
                    />
                    <Button className="rounded-xl h-11 px-4 gap-2 shrink-0 shadow-lg shadow-primary/20" onClick={handleAddReminder}>
                      <Plus className="h-4 w-4" /> 추가
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {reminders.length > 0 ? reminders.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/20 group hover:bg-muted/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Clock className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold">{formatDateTime(r.remind_at)}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          onClick={() => handleDeleteReminder(r.id)}
                        >
                          <BellOff className="h-4 w-4" />
                        </Button>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground/60 italic text-center py-4 bg-muted/5 rounded-2xl border border-dashed">
                        설정된 리마인더가 없습니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-10 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium italic">
              * 최종 수정: {new Date(schedule.updated_at).toLocaleString()}
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button 
                variant="destructive" 
                className="flex-1 md:flex-none h-12 px-8 rounded-2xl font-bold gap-2 shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={handleDeleteSchedule}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                일정 삭제
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
