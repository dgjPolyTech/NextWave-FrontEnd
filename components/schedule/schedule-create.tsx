"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { scheduleService } from "@/services/scheduleService"
import { teamService, TeamMemberResponse } from "@/services/teamService"
import { onboardingService } from "@/services/onboardingService"
import { Sparkles, AlertCircle } from "lucide-react"

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
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [isOnboarding, setIsOnboarding] = useState(false)

  // 날짜 포맷 변환 (YYYY-MM-DDThh:mm)
  const formatToDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return ""
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return ""
      const offset = d.getTimezoneOffset() * 60000
      const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16)
      return localISOTime
    } catch {
      return ""
    }
  }

  // 온보딩 데이터 확인 및 자동 입력
  useEffect(() => {
    const step = onboardingService.getStep()
    if (step === 'TEAM_CREATED') {
      const guide = onboardingService.getGuideData()
      if (guide && guide.guide.example_schedule) {
        const ex = guide.guide.example_schedule
        setFormData(prev => ({
          ...prev,
          title: ex.title,
          description: ex.description,
          start_time: formatToDateTimeLocal(ex.start_time),
          end_time: formatToDateTimeLocal(ex.end_time),
        }))
        setIsOnboarding(true)
      }
    }
  }, [])

  // 팀 멤버 목록 조회
  useEffect(() => {
    const fetchTeamMembers = async () => {
      const currentTeamId = teamId || formData.team_id
      if (!currentTeamId) return
      
      try {
        const members = await teamService.getMembers(currentTeamId)
        setTeamMembers(members)
      } catch (error) {
        console.error("Failed to fetch team members:", error)
      }
    }
    fetchTeamMembers()
  }, [teamId])

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

      // 일정 생성
      const createdSchedule = await scheduleService.createSchedule(payload)
      
      // 담당자 지정 (선택된 경우)
      if (selectedAssignees.length > 0) {
        const userIds = selectedAssignees.map(id => parseInt(id))
        await scheduleService.addAssignees(createdSchedule.id, { user_ids: userIds })
      }
      
      alert("일정이 생성되었습니다!")
      
      // 온보딩 완료 처리 (다음 단계인 메모 작성으로 유도)
      if (isOnboarding) {
        onboardingService.setStep('SCHEDULE_COMPLETED')
        setIsOnboarding(false)
      }

      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        status: "PENDING",
        team_id: teamId || 1
      })
      setSelectedAssignees([])
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
        {isOnboarding && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-primary/20 p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary flex items-center gap-1">
                  AI 맞춤형 가이드
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  사용자님의 프로필을 분석하여 <strong>맞춤형 추천 일정</strong>을 미리 입력해두었습니다. <br />
                  내용을 확인하신 후 아래 버튼을 눌러 첫 일정을 완성해보세요!
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 p-0"
                    onClick={() => {
                      onboardingService.setStep('COMPLETED');
                      setIsOnboarding(false);
                    }}
                  >
                    온보딩 건너뛰기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
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

          <div className="space-y-2">
            <Label htmlFor="assignees" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              담당자 지정 (선택)
            </Label>
            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.user_id} className="flex items-center gap-2">
                    <Checkbox
                      id={`assignee-${member.user_id}`}
                      checked={selectedAssignees.includes(String(member.user_id))}
                      onCheckedChange={(checked) => {
                        const userId = String(member.user_id)
                        if (checked) {
                          setSelectedAssignees([...selectedAssignees, userId])
                        } else {
                          setSelectedAssignees(selectedAssignees.filter(id => id !== userId))
                        }
                      }}
                    />
                    <Label
                      htmlFor={`assignee-${member.user_id}`}
                      className="text-sm cursor-pointer"
                    >
                      {member.user_name} ({member.role})
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">팀원이 없습니다.</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              선택한 담당자에게 알림이 전송됩니다.
            </p>
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