"use client"

import React, { useState, useEffect } from "react"
import { 
  Sparkles, ArrowRight, MessageSquare, Calendar as CalendarIcon, FileText, Users 
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { onboardingService, OnboardingResponse } from "@/services/onboardingService"
import { userService } from "@/services/userService"
import { OnboardingExperience } from "./onboarding-experience"

interface OnboardingTriggerProps {
  feature: 'schedule' | 'memo' | 'team_manage'
  teamId: number
  children: React.ReactNode
}

export function OnboardingTrigger({ feature, teamId, children }: OnboardingTriggerProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isRewatch, setIsRewatch] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [guideData, setGuideData] = useState<OnboardingResponse | null>(null)
  const [showExperience, setShowExperience] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (!teamId || teamId === 0) return
        const me = await userService.getMe()
        setUserId(me.id)
        
        // 전체 온보딩이 완료되었더라도, 개별 기능 가이드를 안 봤다면 트리거
        const isCompleted = onboardingService.isFeatureCompleted(me.id, feature)
        if (!isCompleted) {
          // 세션 내 중복 방지를 위해 간단한 체크 (옵션)
          setShowPrompt(true)
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error)
      }
    }
    checkStatus()
  }, [feature, teamId])

  const handleStartGuide = async () => {
    if (feature === 'team_manage') {
      // 팀 관리는 LLM 호출 없이 즉시 시작
      setGuideData({
        user_name: "", // Experience에서 처리됨
        guide: {
          example_schedule: { title: "", description: "", start_time: "", end_time: "" },
          example_memo: { title: "", content: "" }
        },
        primary_feature: 'team_manage'
      })
      setShowPrompt(false)
      setShowExperience(true)
      return
    }

    setIsLoading(true)
    try {
      const contextualData = await onboardingService.generateContextualGuide(teamId, feature)
      
      // OnboardingResponse 형식으로 변환
      const mappedData: OnboardingResponse = {
        user_name: "", // 기존 사용자이므로 빈 값 혹은 기저장된 값 사용
        guide: {
          primary_feature: feature,
          example_schedule: contextualData.example_schedule ? {
            title: contextualData.example_schedule.title,
            description: contextualData.example_schedule.description,
            start_time: contextualData.example_schedule.start_time,
            end_time: contextualData.example_schedule.end_time
          } : {
            title: "새로운 일정 🗓️",
            description: "AI가 추천하는 다음 일정입니다.",
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString()
          },
          example_memo: contextualData.example_memo ? {
            title: contextualData.example_memo.title,
            content: contextualData.example_memo.content,
            schedule_id: contextualData.example_memo.schedule_id ?? undefined
          } : {
            title: "협업 메모 📝",
            content: "AI가 추천하는 다음 메모입니다."
          }
        }
      }
      
      setGuideData(mappedData)
      setShowPrompt(false)
      setShowExperience(true)
    } catch (error) {
      console.error("Failed to generate contextual guide:", error)
      setShowPrompt(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = () => {
    if (userId) {
      onboardingService.markFeatureCompleted(userId, feature)
    }
    setShowPrompt(false)
  }

  const featureLabel = feature === 'schedule' ? '일정 관리' : feature === 'memo' ? '협업 메모' : '팀 관리'
  const FeatureIcon = feature === 'schedule' ? CalendarIcon : feature === 'memo' ? FileText : Users

  return (
    <>
      {children}

      {/* 가이드 시작 제안 모달 */}
      {showPrompt && !isLoading && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
          <Card className="relative w-full max-w-md bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <CardHeader className="pt-10 pb-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FeatureIcon className="h-7 w-7" />
              </div>
              <Badge variant="outline" className="mx-auto mb-2 text-[10px] font-black uppercase tracking-widest text-primary border-primary/30">
                New Feature Guide
              </Badge>
              <CardTitle className="text-2xl font-black tracking-tight">
                {featureLabel} 가이드를<br />시작할까요?
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 text-center">
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                AI가 현재 팀의 데이터를 분석하여<br />
                가장 효율적인 {featureLabel} 활용법을 안내해 드립니다.
              </p>
              <Button 
                variant="ghost"
                size="sm"
                className="mt-4 text-xs text-muted-foreground hover:text-primary transition-colors gap-1.5"
                onClick={() => {
                  setIsRewatch(true)
                  setShowOnboarding(true)
                }}
              >
                <Sparkles className="h-3 w-3" /> 가이드 다시보기
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 px-8 pb-10">
              <Button 
                onClick={handleStartGuide}
                className="w-full h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 group"
              >
                가이드 시작하기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDecline}
                className="w-full h-12 rounded-2xl text-muted-foreground font-semibold"
              >
                다음에 볼게요
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* AI 분석 중 로딩 화면 */}
      {isLoading && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-background border-2 border-primary/20 shadow-2xl">
                <Sparkles className="h-10 w-10 text-primary animate-bounce" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">AI가 데이터를 분석 중입니다</h2>
              <p className="text-primary-foreground/70 font-medium">현재 팀의 맥락에 맞는 최적의 예시를 생성하고 있습니다...</p>
            </div>
            <div className="flex justify-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* 온보딩 경험 실행 */}
      {showExperience && guideData && (
        <OnboardingExperience 
          guideData={guideData}
          mode={isRewatch ? "rewatch" : "contextual"}
          targetFeature={feature}
          onClose={() => {
            if (userId) onboardingService.markFeatureCompleted(userId, feature)
            setShowExperience(false)
            setIsRewatch(false)
          }}
        />
      )}
    </>
  )
}
