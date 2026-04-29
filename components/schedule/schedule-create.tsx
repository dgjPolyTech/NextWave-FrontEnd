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
import { Sparkles, Loader2 } from "lucide-react"
import { cn, parseISO } from "@/lib/utils"

interface ScheduleCreateFormProps {
  teamId?: number
  onSuccess?: () => void
  initialData?: any
  isAiGenerated?: boolean
  autoGenerate?: boolean
}

export function ScheduleCreateForm({ teamId, onSuccess, initialData, isAiGenerated, autoGenerate }: ScheduleCreateFormProps) {
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
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [internalAiData, setInternalAiData] = useState<any>(null)
  const [isInternalAiGenerated, setIsInternalAiGenerated] = useState(false)
  const [aiRationale, setAiRationale] = useState("")

  // 날짜 포맷 변환 (YYYY-MM-DDThh:mm)
  const formatToDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return ""
    try {
      const d = parseISO(dateStr)
      if (!d || isNaN(d.getTime())) return ""
      const offset = d.getTimezoneOffset() * 60000
      const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16)
      return localISOTime
    } catch {
      return ""
    }
  }

  // AI 자동 생성 트리거
  useEffect(() => {
    if (autoGenerate && !internalAiData && !isAiLoading) {
      const fetchAiData = async () => {
        if (!teamId) {
          console.warn("AI generation skipped: teamId is missing");
          return;
        }
        setIsAiLoading(true)
        try {
          // 약간의 인위적인 딜레이를 주어 분석 중임을 체감하게 함
          await new Promise(resolve => setTimeout(resolve, 1500))
          const data = await onboardingService.generateContextualGuide(teamId, 'schedule')
          if (data.example_schedule) {
            setInternalAiData(data.example_schedule)
            setAiRationale(data.rationale || "")
            setIsInternalAiGenerated(true)
          }
        } catch (error) {
          console.error("AI Generation failed:", error)
        } finally {
          setIsAiLoading(false)
        }
      }
      fetchAiData()
    }
  }, [autoGenerate, teamId])

  // 온보딩 데이터 또는 AI 생성 데이터 스트리밍 입력
  useEffect(() => {
    let targetData = initialData || internalAiData;
    let shouldStream = isAiGenerated || isInternalAiGenerated;

    if (!targetData) {
      const step = onboardingService.getStep()
      if (step === 'TEAM_CREATED') {
        const guide = onboardingService.getGuideData()
        if (guide && guide.guide.example_schedule) {
          targetData = guide.guide.example_schedule;
          setIsOnboarding(true);
          shouldStream = true; 
        }
      }
    }

    if (targetData && shouldStream) {
      setFormData(prev => ({ ...prev, title: "", description: "" })); // 초기화
      
      const title = targetData.title || "";
      const description = targetData.description || "";
      let titleIdx = 0;
      let descIdx = 0;

      const interval = setInterval(() => {
        setFormData(prev => {
          let nextTitle = prev.title;
          let nextDesc = prev.description;

          if (titleIdx < title.length) {
            nextTitle = title.substring(0, titleIdx + 1);
            titleIdx++;
          }
          if (descIdx < description.length) {
            nextDesc = description.substring(0, descIdx + 1);
            descIdx++;
          }

          return {
            ...prev,
            title: nextTitle,
            description: nextDesc,
            start_time: formatToDateTimeLocal(targetData.start_time),
            end_time: formatToDateTimeLocal(targetData.end_time),
          };
        });

        if (Array.isArray(targetData.assignee_ids)) {
          const validAssigneeIds = targetData.assignee_ids.filter(id => 
            teamMembers.some(m => m.user_id === id)
          );
          setSelectedAssignees(validAssigneeIds.map(String));
        }

        if (titleIdx >= title.length && descIdx >= description.length) {
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    } else if (targetData) {
      setFormData({
        title: targetData.title || "",
        description: targetData.description || "",
        start_time: formatToDateTimeLocal(targetData.start_time),
        end_time: formatToDateTimeLocal(targetData.end_time),
        status: "PENDING",
        team_id: teamId || 1
      });
      if (Array.isArray(targetData.assignee_ids)) {
        const validAssigneeIds = targetData.assignee_ids.filter(id => 
          teamMembers.some(m => m.user_id === id)
        );
        setSelectedAssignees(validAssigneeIds.map(String));
      }
    }
  }, [initialData, internalAiData, isAiGenerated, isInternalAiGenerated, teamMembers])

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
      <CardContent className="px-0 pb-0 relative min-h-[400px]">
        {isAiLoading && (
          <div className="absolute inset-0 z-20 bg-background/40 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center border border-primary/10">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-base font-bold text-primary animate-pulse">AI 분석 중</p>
              <p className="text-xs text-muted-foreground mt-2">팀의 활동 내역을 기반으로 최적의 일정을 계획하고 있습니다.</p>
            </div>
          </div>
        )}
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
        {isInternalAiGenerated && (
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="mt-0.5 bg-primary/20 p-1.5 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary">AI 추천 일정 분석 결과</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {aiRationale || "현재 팀의 컨텍스트를 분석하여 최적의 일정을 제안합니다."}
              </p>
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
              className={cn(
                "w-full shadow-md hover:shadow-lg transition-all",
                (isAiGenerated || isInternalAiGenerated) && "bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-[1.02]"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  일정 생성 중...
                </>
              ) : (isAiGenerated || isInternalAiGenerated) ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI 추천 일정으로 생성하기
                </>
              ) : (
                "일정 생성하기"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}