"use client"

import { useState, useEffect } from "react"
import { FileText, Bold, Italic, List, Link, Save, Users } from "lucide-react"
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
      } catch (err) {
        console.error("Failed to fetch schedules for memo:", err)
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
        content: formData.content || null,
        team_id: teamId,
        schedule_id: formData.schedule_id ? Number(formData.schedule_id) : null,
      }

      // Add mentions
      if (selectedMentions.length > 0) {
        payload.mentions = selectedMentions.map(id => parseInt(id))
      }

      await memoService.createMemo(payload)
      alert("Memo saved!")

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
        alert("Authentication required. Please login first.")
      } else {
        alert("Error saving memo:\n" + msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={hideHeader ? "" : "p-8"}>
      {!hideHeader && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Write Memo</h1>
          <p className="text-muted-foreground mt-1">Create a new memo</p>
        </div>
      )}

      <Card className={hideHeader ? "border-0 shadow-none" : "max-w-3xl"}>
        {!hideHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              New Memo
            </CardTitle>
            <CardDescription>Enter memo content</CardDescription>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter memo title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule_id">Link Schedule (Optional)</Label>
                <Select
                  value={formData.schedule_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, schedule_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {schedules.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
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
                Mention Users (Optional)
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
                  <p className="text-sm text-muted-foreground">No team members.</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected users will receive a memo mention notification.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <div className="border rounded-lg">
                <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Enter memo content..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="border-0 focus-visible:ring-0 min-h-[300px] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}