"use client"

import { useState, useEffect } from "react"
import {
  Sparkles, Calendar, FileText, ArrowRight, X,
  Loader2, ChevronRight, CheckCircle2, Users, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { onboardingService, OnboardingResponse } from "@/services/onboardingService"
import { teamService } from "@/services/teamService"
import { userService } from "@/services/userService"

// ── 단계 정의 ──────────────────────────────────────────────
type Step = "loading" | "guide" | "team-create" | "done"
type FeatureIntent = "schedule" | "memo" | null

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: (createdTeamId?: number) => void
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>("loading")
  const [guide, setGuide] = useState<OnboardingResponse | null>(null)
  const [featureIntent, setFeatureIntent] = useState<FeatureIntent>(null)
  const [teamName, setTeamName] = useState("")
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [createdTeamId, setCreatedTeamId] = useState<number | null>(null)
  const { toast } = useToast()

  // 모달 열릴 때 가이드 API 호출
  useEffect(() => {
    if (!isOpen) return
    setStep("loading")
    setGuide(null)
    setFeatureIntent(null)
    setTeamName("")
    setCreatedTeamId(null)

    onboardingService.getGuide()
      .then((data) => {
        setGuide(data)
        onboardingService.saveGuide(data) // 가이드 데이터 저장 추가
        setStep("guide")
      })
      .catch(() => {
        // 실패해도 guide step으로 진행 (안내만 없음)
        setStep("guide")
      })
  }, [isOpen])

  if (!isOpen) return null

  // ── 팀 생성 핸들러 ──────────────────────────────────────
  const handleCreateTeam = async () => {
    const name = teamName.trim() || `${guide?.user_name ?? "내"}의 팀`
    setIsCreatingTeam(true)
    try {
      const team = await teamService.createTeam({
        name,
        description: "온보딩 중 생성된 팀입니다.",
      })

      // 온보딩 단계 설정
      onboardingService.setStep('TEAM_CREATED')
      onboardingService.saveOnboardingTeam(team.id, team.name)

      // 사용자 완료 표시 (최소한의 가입 완료 단계로 간주)
      try {
        const me = await userService.getMe()
        onboardingService.markCompleted(me.id)
      } catch { /* silent */ }

      onComplete(team.id)
    } catch (err: any) {
      toast({
        title: "팀 생성 실패",
        description: err.response?.data?.detail || "팀 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const handleSkip = async () => {
    try {
      const me = await userService.getMe()
      onboardingService.markCompleted(me.id)
      onboardingService.setStep('IDLE')
    } catch { /* silent */ }
    onComplete()
  }

  // ── 렌더 ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* 모달 카드 */}
      <div className="relative w-full max-w-xl mx-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">

          {/* 배경 장식 */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          {/* ── STEP: LOADING ──────────────────────────────── */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center gap-5 px-8 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 ring-2 ring-primary/40">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">AI가 맞춤 가이드를 생성 중입니다</p>
                <p className="mt-1 text-sm text-slate-400">프로필을 분석하여 최적의 활용법을 찾고 있어요...</p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* ── STEP: GUIDE ────────────────────────────────── */}
          {step === "guide" && (
            <div className="px-8 py-8 flex flex-col gap-6">
              {/* 헤더 */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/20 ring-2 ring-primary/30">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    {guide?.user_name ? `${guide.user_name}님, 환영합니다! 🎉` : "NextWave에 오신 걸 환영합니다! 🎉"}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    AI가 분석한 맞춤 활용 예시를 확인해보세요.
                  </p>
                </div>
              </div>

              {/* AI 추천 카드들 */}
              {guide ? (
                <div className="grid grid-cols-1 gap-4">
                  {/* 예시 일정 카드 */}
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 transition-all hover:border-blue-400/40">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/20">
                        <Calendar className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">AI 추천 예시 일정</span>
                    </div>
                    <p className="font-bold text-white text-sm">{guide.guide.example_schedule.title}</p>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{guide.guide.example_schedule.description}</p>
                    <p className="mt-2 text-xs text-blue-300/80">
                      {guide.guide.example_schedule.start_time} ~ {guide.guide.example_schedule.end_time}
                    </p>
                  </div>

                  {/* 예시 메모 카드 */}
                  <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 transition-all hover:border-purple-400/40">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20">
                        <FileText className="h-4 w-4 text-purple-400" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-purple-400">AI 추천 예시 메모</span>
                    </div>
                    <p className="font-bold text-white text-sm">{guide.guide.example_memo.title}</p>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{guide.guide.example_memo.content}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-slate-400">
                  지금 바로 일정·메모 기능을 활용해보세요!
                </div>
              )}

              {/* CTA 버튼들 */}
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-xs text-slate-500 text-center mb-1">이제 팀과 함께 효율적으로 협업해보세요!</p>

                <Button
                  id="onboarding-start-btn"
                  className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20"
                  onClick={() => { setFeatureIntent("schedule"); setStep("team-create") }}
                >
                  <Sparkles className="h-5 w-5" />
                  온보딩 시작하기 (일정 & 메모 가이드)
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button
                  id="onboarding-skip-btn"
                  variant="ghost"
                  className="w-full h-10 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 text-sm"
                  onClick={handleSkip}
                >
                  나중에 할게요
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP: TEAM-CREATE ──────────────────────────── */}
          {step === "team-create" && (
            <div className="px-8 py-8 flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-green-500/20 ring-2 ring-green-500/30">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">팀을 먼저 만들어볼게요</h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {featureIntent === "schedule" ? "일정" : "메모"}을 쓰려면 팀이 하나 필요해요.<br />
                    나중에 언제든 이름을 바꾸거나 삭제할 수 있어요.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboarding-team-name" className="text-slate-300 text-sm font-semibold">
                  팀 이름 <span className="text-slate-500 font-normal">(비워두면 자동 설정)</span>
                </Label>
                <Input
                  id="onboarding-team-name"
                  placeholder={`${guide?.user_name ?? "내"}의 팀`}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-primary"
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateTeam() }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  id="onboarding-create-team-btn"
                  className="w-full h-11 rounded-xl font-bold gap-2"
                  onClick={handleCreateTeam}
                  disabled={isCreatingTeam}
                >
                  {isCreatingTeam ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> 팀 생성 중...</>
                  ) : (
                    <><Users className="h-4 w-4" /> 팀 만들고 시작하기 <ArrowRight className="h-4 w-4 ml-auto" /></>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-10 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 text-sm"
                  onClick={() => setStep("guide")}
                  disabled={isCreatingTeam}
                >
                  돌아가기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

