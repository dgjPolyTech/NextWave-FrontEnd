"use client"

import React, { useState, useEffect } from "react"
import { FileText, Bold, Italic, List, Link, Save, Users, Clock, Loader2 } from "lucide-react"
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
import { PAGES, ONBOARDING_STEPS } from "@/lib/constants"

interface MemoWriteProps {
  teamId: number
  onSuccess?: () => void
  onNavigate?: (page: any) => void
  hideHeader?: boolean
}

export function MemoWrite({ teamId, onSuccess, onNavigate, hideHeader = false }: MemoWriteProps) {
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

  // 온보딩 데이터 확인 및 자동 입력
  useEffect(() => {
    const step = onboardingService.getStep()
    if (step === ONBOARDING_STEPS.SCHEDULE_COMPLETED) {
      const guide = onboardingService.getGuideData()
      if (guide && guide.guide.example_memo) {
        const ex = guide.guide.example_memo
        setFormData(prev => ({
          ...prev,
          title: ex.title,
          content: ex.content,
        }))
        setIsOnboarding(true)
      }
    }
  }, [])

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
        <CardContent className={hideHeader ? "p-0" : ""}>
          {isOnboarding && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-primary/20 p-1.5 rounded-lg">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-primary flex items-center gap-1">
                    AI 맞춤형 가이드 (마지막 단계)
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
                className="h-14 px-8 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                메모 저장하기
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}