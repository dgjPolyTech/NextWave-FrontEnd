"use client"

import { useState } from "react"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { scheduleService } from "@/services/scheduleService"

interface ScheduleCreateFormProps {
  teamId?: number
  onSuccess?: () => void
}

export function ScheduleCreateForm({ teamId, onSuccess }: ScheduleCreateFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    status: "PENDING",
    team_id: teamId || 1
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description || undefined,
        start_time: new Date(formData.start_time).toISOString(),
        status: formData.status,
        team_id: formData.team_id
      }

      if (formData.end_time) {
        payload.end_time = new Date(formData.end_time).toISOString()
      }

      await scheduleService.createSchedule(payload)
      alert("일정이 생성되었습니다!")
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        status: "PENDING",
        team_id: teamId || 1
      })
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Schedule creation failed:", error)
      const errorMsg = error.response?.data?.detail
        || error.response?.data?.message
        || error.message
        || "알 수 없는 오류"

      if (error.response?.status === 401) {
        alert("인증이 필요합니다. 먼저 로그인해주세요.\n상세: " + errorMsg)
      } else if (error.response?.status === 403) {
        alert("권한이 없습니다. 팀 멤버인지 확인해주세요.\n상세: " + errorMsg)
      } else {
        alert("일정 저장 중 오류가 발생했습니다: " + errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-primary" />
          새 일정 등록
        </CardTitle>
        <CardDescription>일정 정보를 입력하여 팀과 공유하세요.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">일정 제목</Label>
            <Input
              id="title"
              placeholder="예: 주간 팀 회의"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="회의 안건이나 주요 내용을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                시작일
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                종료일
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? "일정 생성 중..." : "일정 생성하기"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}