"use client"

import React, { useState, useEffect } from "react"
import { FileText, Save, Users, Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { memoService } from "@/services/memoService"
import { scheduleService, ScheduleResponse } from "@/services/scheduleService"
import { teamService, TeamMemberResponse } from "@/services/teamService"
import { onboardingService } from "@/services/onboardingService"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { PAGES, ONBOARDING_STEPS } from "@/lib/constants"

interface MemoWriteProps {
  teamId: number
  onSuccess?: () => void
  onNavigate?: (page: any) => void
  hideHeader?: boolean
  autoGenerate?: boolean
}

export function MemoWrite({ teamId, onSuccess, onNavigate, hideHeader = false, autoGenerate }: MemoWriteProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    schedule_id: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([])
  const [selectedMentions, setSelectedMentions] = useState<string[]>([])
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [internalAiData, setInternalAiData] = useState<any>(null)
  const [isInternalAiGenerated, setIsInternalAiGenerated] = useState(false)
  const [aiRationale, setAiRationale] = useState("")

  // AI 자동 생성 트리거
  useEffect(() => {
    if (autoGenerate && !internalAiData && !isAiLoading) {
      const fetchAiData = async () => {
        setIsAiLoading(true)
        try {
          await new Promise(resolve => setTimeout(resolve, 1500))
          const data = await onboardingService.generateContextualGuide(teamId, 'memo')
          if (data.example_memo) {
            setInternalAiData(data.example_memo)
            setAiRationale(data.rationale || "")
            setIsInternalAiGenerated(true)
          }
        } catch (error) {
          console.error("AI Generation failed for memo:", error)
        } finally {
          setIsAiLoading(false)
        }
      }
      fetchAiData()
    }
  }, [autoGenerate, teamId])

  // 온보딩 데이터 또는 AI 생성 데이터 스트리밍 입력
  useEffect(() => {
    let targetData = internalAiData;
    let shouldStream = isInternalAiGenerated;

    if (!targetData) {
      const step = onboardingService.getStep()
      if (step === ONBOARDING_STEPS.SCHEDULE_COMPLETED) {
        const guide = onboardingService.getGuideData()
        if (guide && guide.guide.example_memo) {
          targetData = guide.guide.example_memo;
          setIsOnboarding(true);
          shouldStream = true;
        }
      }
    }

    if (targetData && shouldStream) {
      setFormData(prev => ({ ...prev, title: "", content: "" }));
      
      const title = targetData.title || "";
      const content = targetData.content || "";
      let titleIdx = 0;
      let contentIdx = 0;

      const interval = setInterval(() => {
        setFormData(prev => {
          let nextTitle = prev.title;
          let nextContent = prev.content;

          if (titleIdx < title.length) {
            nextTitle = title.substring(0, titleIdx + 1);
            titleIdx++;
          }
          if (contentIdx < content.length) {
            nextContent = content.substring(0, contentIdx + 1);
            contentIdx++;
          }

          const scheduleExists = schedules.some(s => s.id === targetData.schedule_id);
          
          return {
            ...prev,
            title: nextTitle,
            content: nextContent,
            schedule_id: (targetData.schedule_id !== undefined && targetData.schedule_id !== null && scheduleExists) 
              ? String(targetData.schedule_id) 
              : prev.schedule_id
          };
        });

        if (Array.isArray(targetData.mention_ids)) {
          const validMentionIds = targetData.mention_ids.filter(id => 
            teamMembers.some(m => m.user_id === id)
          );
          setSelectedMentions(validMentionIds.map(String));
        }

        if (titleIdx >= title.length && contentIdx >= content.length) {
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    } else if (targetData) {
      const scheduleExists = schedules.some(s => s.id === targetData.schedule_id);
      
      setFormData(prev => ({
        ...prev,
        title: targetData.title || "",
        content: targetData.content || "",
        schedule_id: (targetData.schedule_id !== undefined && targetData.schedule_id !== null && scheduleExists) 
          ? String(targetData.schedule_id) 
          : prev.schedule_id
      }));
      if (Array.isArray(targetData.mention_ids)) {
        const validMentionIds = targetData.mention_ids.filter(id => 
          teamMembers.some(m => m.user_id === id)
        );
        setSelectedMentions(validMentionIds.map(String));
      }
    }
  }, [internalAiData, isInternalAiGenerated, schedules, teamMembers])

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await scheduleService.getTeamSchedules(teamId)
        setSchedules(data)
      } catch (err: any) {
        console.error("Failed to fetch schedules for memo:", err)
        if (err.response?.status === 403) {
          alert("게스트 멤버는 스케줄을 조회할 권한이 없습니다.")
        }
      }
    }
    fetchSchedules()
  }, [teamId])

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await teamService.getMembers(teamId)
        setTeamMembers(members)
      } catch (err: any) {
        console.error("Failed to fetch team members:", err)
        if (err.response?.status === 403) {
          alert("게스트 멤버는 팀 멤버 목록을 조회할 권한이 없습니다.")
        }
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
        content: formData.content || null,
        team_id: teamId,
        schedule_id: formData.schedule_id ? Number(formData.schedule_id) : null,
      }

      // Add mentions
      if (selectedMentions.length > 0) {
        payload.mentions = selectedMentions.map(id => parseInt(id))
      }

      await memoService.createMemo(payload)
      alert("메모가 저장되었습니다!")

      // 온보딩 최종 완료 처리
      if (isOnboarding) {
        onboardingService.setStep(ONBOARDING_STEPS.COMPLETED)
        setIsOnboarding(false)
      }

      setFormData({ title: "", content: "", schedule_id: "" })
      setSelectedMentions([])

      // 온보딩 중일 경우 대시보드로 이동하여 최종 완료 메시지 노출
      if (isOnboarding && onNavigate) {
        onNavigate(PAGES.DASHBOARD)
      } else if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Memo creation failed:", error)
      const detail = error.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("\n")
        : detail || error.message || "Unknown error"
      if (error.response?.status === 401) {
        alert("인증이 필요합니다. 다시 로그인해주세요.")
      } else if (error.response?.status === 403) {
        alert("게스트 멤버는 메모를 작성할 권한이 없습니다.")
      } else {
        alert("메모 저장 실패: " + msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={hideHeader ? "" : "p-8"}>
      {!hideHeader && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">메모 작성</h1>
          <p className="text-muted-foreground mt-1">새로운 메모를 작성합니다</p>
        </div>
      )}

      <Card className={hideHeader ? "border-0 shadow-none" : "max-w-10xl mx-auto"}>
        {!hideHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              새 메모
            </CardTitle>
            <CardDescription>메모 내용을 입력하세요</CardDescription>
          </CardHeader>
        )}
        <CardContent className={cn("relative min-h-[400px]", hideHeader ? "p-0" : "")}>
          {isAiLoading && (
            <div className="absolute inset-0 z-20 bg-background/40 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-500">
              <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center border border-primary/10">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-base font-bold text-primary animate-pulse">AI가 팀의 대화와 일정을 분석 중입니다</p>
                <p className="text-xs text-muted-foreground mt-2 text-center">관련성 높은 메모 주제를 제안해드릴게요.</p>
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
                    사용자님의 프로필을 분석하여 <strong>맞춤형 추천 메모</strong>를 미리 입력해두었습니다. <br />
                    내용을 확인하신 후 아래 버튼을 눌러 첫 메모 작성을 완료해보세요!
                  </p>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 p-0"
                      onClick={() => {
                        onboardingService.setStep(ONBOARDING_STEPS.COMPLETED);
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
                <p className="text-sm font-semibold text-primary">AI 추천 메모 분석 결과</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiRationale || "현재 팀의 컨텍스트를 분석하여 최적의 메모 주제를 제안합니다."}
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold ml-1">메모 제목</Label>
              <Input
                id="title"
                placeholder="메모 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="h-12 rounded-2xl border-2 focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule_id" className="font-bold ml-1">연결 일정 (선택)</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <Select
                  value={formData.schedule_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, schedule_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="w-full h-12 pl-11 pr-4 py-3 bg-primary/5 border-2 border-primary/10 rounded-2xl text-sm font-bold text-primary focus:ring-0 focus:border-primary/50 transition-all">
                    <SelectValue placeholder="선택된 일정 없음" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="none" className="font-medium text-muted-foreground">선택 안 함</SelectItem>
                    {schedules.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)} className="font-medium">
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                사용자 멘션 (선택)
              </Label>
              <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <div key={member.user_id} className="flex items-center gap-2">
                      <Checkbox
                        id={`mention-${member.user_id}`}
                        checked={selectedMentions.includes(String(member.user_id))}
                        onCheckedChange={(checked) => {
                          const userId = String(member.user_id)
                          if (checked) {
                            setSelectedMentions([...selectedMentions, userId])
                          } else {
                            setSelectedMentions(selectedMentions.filter(id => id !== userId))
                          }
                        }}
                      />
                      <Label
                        htmlFor={`mention-${member.user_id}`}
                        className="text-sm cursor-pointer"
                      >
                        {member.user_name} ({member.role})
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">팀 멤버가 없습니다.</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                선택된 사용자들에게 메모 멘션 알림이 발송됩니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="font-bold ml-1">내용</Label>
              <div className="rounded-2xl border-2 overflow-hidden focus-within:border-primary/50 transition-all">
                <Textarea
                  id="content"
                  placeholder="메모 내용을 입력하세요..."
                  value={formData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                  className="border-0 focus-visible:ring-0 min-h-[300px] resize-none text-base font-medium p-4"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className={cn(
                  "h-14 px-8 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95",
                  (isInternalAiGenerated) ? "bg-primary animate-pulse shadow-primary/30 scale-[1.02]" : "shadow-primary/20"
                )}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : isInternalAiGenerated ? (
                  <Sparkles className="h-5 w-5 mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isInternalAiGenerated ? "AI 추천 메모 저장하기" : "메모 저장하기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}