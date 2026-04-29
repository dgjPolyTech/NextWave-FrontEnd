"use client"

import { useState, useEffect } from "react"
import {
  Sparkles, ArrowRight, X,
  Loader2, ChevronRight, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { onboardingService, OnboardingResponse } from "@/services/onboardingService"
import { userService } from "@/services/userService"
import { OnboardingExperience, OnboardingMode } from "./onboarding-experience"

// ── 단계 정의 ──────────────────────────────────────────────
type Step = "intro" | "loading" | "guide"

interface OnboardingModalProps {
  isOpen: boolean
  isRewatch?: boolean
  onComplete: (createdTeamId?: number) => void
}

export function OnboardingModal({ isOpen, isRewatch = false, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>("intro")
  const [guide, setGuide] = useState<OnboardingResponse | null>(null)
  const [showExperience, setShowExperience] = useState(false)
  const [mode, setMode] = useState<OnboardingMode>('initial')
  const { toast } = useToast()

  // 모달 열릴 때 상태 초기화
  useEffect(() => {
    if (!isOpen) return
    
    if (isRewatch) {
      setMode('rewatch')
      handleFetchGuide(true)
    } else {
      setMode('initial')
      setStep("intro")
      setGuide(null)
      setShowExperience(false)
    }
  }, [isOpen, isRewatch])

  const handleFetchGuide = async (directStart: boolean = false) => {
    if (!directStart) setStep("loading")
    try {
      const data = await onboardingService.getGuide()
      setGuide(data)
      onboardingService.saveGuide(data)
      if (directStart) {
        setShowExperience(true)
      } else {
        setStep("guide")
      }
    } catch (error) {
      console.error("Failed to fetch guide:", error)
      if (directStart) {
        setShowExperience(true)
      } else {
        setStep("guide")
      }
    }
  }

  if (!isOpen) return null

  const handleSkip = async () => {
    try {
      const me = await userService.getMe()
      onboardingService.markCompleted(me.id)
      
      // 초기 가이드에서 다룬 기능도 완료 처리 (중복 가이드 방지)
      if (guide?.guide?.primary_feature) {
        onboardingService.markFeatureCompleted(me.id, guide.guide.primary_feature)
      }
      
      onboardingService.setStep('IDLE')
    } catch { /* silent */ }
    onComplete()
  }

  // ── 렌더 ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      {!showExperience && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={handleSkip}
        />
      )}

      {/* 모달 카드 (초기 진입용) */}
      {!showExperience && !isRewatch && (
        <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 ease-out">
          <div className="overflow-hidden rounded-[2rem] border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl">
            
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />

            {step === "intro" && (
              <div className="flex flex-col">
                <div className="relative px-8 pt-12 pb-8 text-center border-b border-border/50">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl ring-1 ring-primary/30 animate-in zoom-in duration-500">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-foreground mb-3">
                    NextWave에 오신 걸<br />환영합니다! 🎉
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    프로젝트 관리부터 실시간 협업까지,<br />
                    팀의 생산성을 높이는 가장 스마트한 방법을 확인해보세요.
                  </p>
                </div>
                <div className="px-8 py-10 space-y-4">
                  <Button
                    size="lg"
                    className="w-full h-15 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-3 group py-4 text-lg"
                    onClick={() => handleFetchGuide()}
                  >
                    <span>가이드 시작하기</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/50 text-sm font-semibold"
                    onClick={handleSkip}
                  >
                    나중에 할게요
                  </Button>
                </div>
              </div>
            )}

            {step === "loading" && (
              <div className="flex flex-col items-center justify-center gap-6 px-10 py-24 text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl ring-1 ring-primary/50">
                    <Sparkles className="h-8 w-8 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold tracking-tight">AI 맞춤 가이드 생성 중</h2>
                  <p className="text-muted-foreground">사용자님의 프로필을 분석하여<br />최적의 활용 시나리오를 찾고 있습니다...</p>
                </div>
              </div>
            )}

            {step === "guide" && (
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative px-8 pt-10 pb-6 text-center border-b border-border/50">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-500/20 ring-1 ring-green-500/30">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    준비가 끝났습니다! 🎉
                  </h2>
                </div>
                <div className="px-8 py-8">
                  <Button
                    size="lg"
                    className="w-full h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group text-lg"
                    onClick={() => setShowExperience(true)}
                  >
                    시작하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 다시 보기 전용 로딩 UI */}
      {!showExperience && isRewatch && (
        <div className="relative flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-background border-2 border-primary/20 shadow-2xl">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-bold text-white drop-shadow-md">AI 가이드를 준비하고 있습니다</h3>
            <p className="text-white/60 text-sm font-medium">잠시만 기다려 주세요...</p>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE EXPERIENCE OVERLAY ──────────────── */}
      {showExperience && guide && (
        <OnboardingExperience 
          guideData={guide} 
          mode={mode}
          primaryFeature={guide.guide.primary_feature}
          onClose={() => {
            handleSkip()
          }} 
        />
      )}
    </div>
  )
}
