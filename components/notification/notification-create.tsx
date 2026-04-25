"use client"

import { useState, useEffect } from "react"
import { Bell, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { notificationService } from "@/services/notificationService"
import { scheduleService, ScheduleResponse } from "@/services/scheduleService"

interface NotificationCreateProps {
  teamId: number
  onSuccess?: () => void
}

export function NotificationCreate({ teamId, onSuccess }: NotificationCreateProps) {
  const [scheduleId, setScheduleId] = useState("")
  const [remindAt, setRemindAt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await scheduleService.getTeamSchedules(teamId)
        setSchedules(data)
      } catch (err) {
        console.error("Failed to load schedules:", err)
      }
    }
    fetchSchedules()
  }, [teamId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduleId || !remindAt) {
      alert("일정과 알림 시간을 모두 입력해주세요.")
      return
    }
    setIsLoading(true)
    try {
      await notificationService.createNotification({
        schedule_id: Number(scheduleId),
        remind_at: new Date(remindAt).toISOString(),
      })
      alert("알림이 생성되었습니다!")
      setScheduleId("")
      setRemindAt("")
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Notification creation failed:", error)
      const detail = error.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("\n")
        : detail || error.message || "알 수 없는 오류"
      if (error.response?.status === 401) {
        alert("인증이 필요합니다. 먼저 로그인해주세요.")
      } else {
        alert("알림 생성 중 오류가 발생했습니다:\n" + msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">알림 생성</h1>
        <p className="text-muted-foreground mt-1">일정에 대한 리마인드 알림을 설정하세요</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            새 알림
          </CardTitle>
          <CardDescription>알림을 받을 일정과 시간을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="schedule">일정 선택</Label>
              <Select value={scheduleId} onValueChange={setScheduleId}>
                <SelectTrigger id="schedule">
                  <SelectValue placeholder="알림을 받을 일정을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.length === 0 ? (
                    <SelectItem value="none" disabled>등록된 일정이 없습니다</SelectItem>
                  ) : (
                    schedules.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.title} ({new Date(s.start_time).toLocaleDateString("ko-KR")})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remind-at" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                알림 시간
              </Label>
              <Input
                id="remind-at"
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "생성 중..." : "알림 생성하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
