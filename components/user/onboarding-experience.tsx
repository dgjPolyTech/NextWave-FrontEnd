"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  Calendar, FileText, Users, Bell, Home, Sparkles,
  LayoutDashboard, Plus, ChevronRight,
  UserCircle, LogOut, Loader2, Check, Settings, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { OnboardingResponse } from "@/services/onboardingService"
import { ALL_STEPS, OnboardingStep, OnboardingFeatureGroup } from "./onboarding-data"

// 모듈화된 가상 뷰 임포트
import { InitialMainView } from "./onboarding-views/initial-main-view"
import { TeamDashboardView } from "./onboarding-views/team-dashboard-view"
import { TeamManageView } from "./onboarding-views/team-manage-view"
import { ScheduleView } from "./onboarding-views/schedule-view"
import { ScheduleDetailView } from "./onboarding-views/schedule-detail-view"
import { MemoView } from "./onboarding-views/memo-view"
import { MemoDetailView } from "./onboarding-views/memo-detail-view"

export type OnboardingMode = 'initial' | 'contextual' | 'rewatch'

interface OnboardingExperienceProps {
  guideData: OnboardingResponse | null
  mode?: OnboardingMode
  primaryFeature?: 'team_manage' | 'schedule' | 'memo'
  targetFeature?: 'schedule' | 'memo' | 'team_manage'
  onClose: () => void
}

interface VirtualTeam {
  id: number
  name: string
  description: string
}

interface VirtualSchedule {
  id: number
  title: string
  description: string
  start_time: string
  end_time?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

interface VirtualMemo {
  id: number
  title: string
  content: string
  author_name: string
  created_at: string
  schedule_title?: string
}

// ── 텍스트 스트리밍 훅 ──────────────────────────────────────
function useStreamingText(text: string, speed: number = 30, startTrigger: boolean = false) {
  const [displayedText, setDisplayedText] = useState("")
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    if (!startTrigger) {
      setDisplayedText("")
      setIsFinished(false)
      return
    }

    let i = 0
    setDisplayedText("")
    setIsFinished(false)

    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(timer)
        setIsFinished(true)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, startTrigger])

  return { displayedText, isFinished }
}

// ── 메인 시뮬레이터 컴포넌트 ──────────────────────────────────
export function OnboardingExperience({ 
  guideData, 
  mode = 'initial', 
  primaryFeature, 
  targetFeature,
  onClose 
}: OnboardingExperienceProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [view, setView] = useState<'main' | 'dashboard' | 'team_detail' | 'schedule' | 'memo' | 'team_manage' | 'schedule_detail' | 'memo_detail'>('main')
  const [subView, setSubView] = useState<string | undefined>(undefined)
  const [showCelebration, setShowCelebration] = useState(false)
  
  // 가상 상태 관리
  const [virtualTeams, setVirtualTeams] = useState<VirtualTeam[]>([])
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  
  const [virtualSchedules, setVirtualSchedules] = useState<VirtualSchedule[]>([])
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false)

  const [virtualMemos, setVirtualMemos] = useState<VirtualMemo[]>([])
  const [isCreatingMemo, setIsCreatingMemo] = useState(false)
  
  // 폼 입력 상태 (영구 유지용)
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    time: "",
    endTime: "",
    desc: ""
  })

  const [memoForm, setMemoForm] = useState({
    title: "",
    content: "",
    scheduleId: guideData?.guide?.example_memo?.schedule_id?.toString() || "none"
  })

  const [highlightBox, setHighlightBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  
  // 모드별 단계 필터링
  const filteredSteps = useMemo(() => {
    if (mode === 'contextual' && targetFeature) {
      const fGroup = targetFeature === 'team_manage' ? 'manage' : targetFeature
      return ALL_STEPS.filter(s => s.featureGroup === fGroup)
    }
    
    if (mode === 'initial') {
      const pFeature = primaryFeature === 'team_manage' ? 'manage' : (primaryFeature || 'schedule')
      return ALL_STEPS.filter(s => 
        s.featureGroup === 'initial' || 
        s.featureGroup === 'dashboard' || 
        s.featureGroup === pFeature
      )
    }

    if (mode === 'rewatch') {
      // 인트로(NextWave 시작하기 등)와 팀 생성 이후 모든 기능 포함
      return ALL_STEPS.filter(s => 
        s.featureGroup !== 'initial' || 
        (s.part === 'initial') 
      )
    }
    
    return []
  }, [mode, primaryFeature, targetFeature])

  const currentStep = filteredSteps[currentStepIndex]

  // 하이라이트 박스 업데이트 로직 개선
  useEffect(() => {
    // 단계가 바뀌면 일단 하이라이트 제거
    setHighlightBox(null)

    if (!currentStep?.targetId || showCelebration) {
      return
    }

    let observer: ResizeObserver | null = null;
    let retryInterval: any = null;

    const updateHighlight = () => {
      if (!currentStep.targetId) return false
      const element = document.getElementById(currentStep.targetId)
      if (element) {
        const rect = element.getBoundingClientRect()
        setHighlightBox({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        })
        
        // 엘리먼트를 찾았으면 Observer 연결 (중복 방지)
        if (!observer) {
          observer = new ResizeObserver(updateHighlight)
          observer.observe(element)
        }
        return true
      }
      return false
    }

    // 초기 업데이트 및 재시도 (지연 로딩 대응)
    let retryCount = 0
    retryInterval = setInterval(() => {
      const success = updateHighlight()
      retryCount++
      if (success || retryCount > 20) { // 최대 6초간 시도
        if (retryInterval) clearInterval(retryInterval)
      }
    }, 300)

    window.addEventListener('scroll', updateHighlight)
    window.addEventListener('resize', updateHighlight)

    return () => {
      if (retryInterval) clearInterval(retryInterval)
      if (observer) observer.disconnect()
      window.removeEventListener('scroll', updateHighlight)
      window.removeEventListener('resize', updateHighlight)
    }
  }, [currentStep, view, subView, showCelebration])


  // 시스템 예시 정보 (LLM 생성 데이터 시뮬레이션)
  const teamNameFull = useMemo(() => guideData?.user_name ? `${guideData.user_name}의 팀` : "나의 첫 번째 팀", [guideData])
  const teamDescFull = "온보딩 가이드를 위한 팀"

  const scheduleTitleFull = guideData?.guide?.example_schedule?.title || "주간 팀 회의 🍳"
  const scheduleTimeFull = useMemo(() => {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000
    return new Date(now.getTime() - offset).toISOString().slice(0, 16).replace('T', ' ')
  }, [])
  const scheduleEndTimeFull = useMemo(() => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    const offset = now.getTimezoneOffset() * 60000
    return new Date(now.getTime() - offset).toISOString().slice(0, 16).replace('T', ' ')
  }, [])
  const scheduleDescFull = guideData?.guide?.example_schedule?.description || "신메뉴 개편 및 식자재 재고 확인을 위한 주간 회의입니다. 모든 팀원 참석 부탁드립니다."

  const memoTitleFull = guideData?.guide?.example_memo?.title || "신메뉴 레시피 아이디어 💡"
  const memoContentFull = guideData?.guide?.example_memo?.content || "여름 시즌을 겨냥한 상큼한 과일 소스 베이스의 레시피입니다. 망고와 패션후르츠를 활용하면 좋을 것 같아요."
  const memoScheduleTitle = virtualSchedules[0]?.title || "주간 팀 회의 🍳"

  // 스트리밍 로직 개선: 단계별로 폼 상태 업데이트
  const { displayedText: streamingName, isFinished: isNameFinished } = useStreamingText(teamNameFull, 40, subView === 'create_form')
  const { displayedText: streamingTeamDesc, isFinished: isTeamDescFinished } = useStreamingText(teamDescFull, 20, isNameFinished)

  const { displayedText: streamingSchedTitle, isFinished: isSchedTitleFinished } = useStreamingText(scheduleTitleFull, 40, currentStep?.targetId === 'v-schedule-title-field')
  const { displayedText: streamingSchedTime } = useStreamingText(scheduleTimeFull, 40, isSchedTitleFinished)
  const { displayedText: streamingSchedEndTime } = useStreamingText(scheduleEndTimeFull, 40, currentStep?.targetId === 'v-schedule-endtime-field')
  const { displayedText: streamingSchedDesc, isFinished: isSchedDescFinished } = useStreamingText(scheduleDescFull, 20, currentStep?.targetId === 'v-schedule-desc-field')

  const { displayedText: streamingMemoTitle, isFinished: isMemoTitleFinished } = useStreamingText(memoTitleFull, 40, currentStep?.targetId === 'v-memo-title-field')
  const { displayedText: streamingMemoContent, isFinished: isMemoContentFinished } = useStreamingText(memoContentFull, 20, isMemoTitleFinished)

  // 가상 데이터 관리 로직: 사용자가 직접 생성하는 흐름을 방해하지 않도록 개선
  useEffect(() => {
    const isScheduleCreateFlow = currentStepIndex <= filteredSteps.findIndex((s: OnboardingStep) => s.targetId === 'v-schedule-submit-btn') && 
                                 filteredSteps.some((s: OnboardingStep) => s.targetId === 'v-schedule-create-btn')
    const isMemoCreateFlow = currentStepIndex <= filteredSteps.findIndex((s: OnboardingStep) => s.targetId === 'v-memo-submit-btn') && 
                             filteredSteps.some((s: OnboardingStep) => s.targetId === 'v-memo-create-btn')

    // 1. 일정 데이터 제어
    if (isScheduleCreateFlow || isCreatingSchedule) {
      setVirtualSchedules([])
    } else if (guideData?.guide?.example_schedule && virtualSchedules.length === 0) {
      setVirtualSchedules([{
        id: 1,
        title: guideData.guide.example_schedule.title,
        description: guideData.guide.example_schedule.description,
        start_time: guideData.guide.example_schedule.start_time,
        end_time: guideData.guide.example_schedule.end_time,
        status: 'PENDING'
      }])
    }

    // 2. 메모 데이터 제어
    if (isMemoCreateFlow || isCreatingMemo) {
      setVirtualMemos([])
    } else if (guideData?.guide?.example_memo && virtualMemos.length === 0) {
      setVirtualMemos([{
        id: 0,
        title: guideData.guide.example_memo.title,
        content: guideData.guide.example_memo.content,
        author_name: guideData?.user_name || 'AI 비서',
        created_at: '방금 전',
        schedule_title: guideData.guide.example_schedule?.title
      }])
    }
  }, [currentStepIndex, isCreatingSchedule, isCreatingMemo, guideData, filteredSteps, virtualSchedules.length, virtualMemos.length])

  // 스트리밍된 텍스트를 폼 상태에 저장 (사라지지 않게)
  useEffect(() => {
    if (streamingSchedTitle) setScheduleForm((prev: any) => ({ ...prev, title: streamingSchedTitle }))
  }, [streamingSchedTitle])
  useEffect(() => {
    if (streamingSchedTime) setScheduleForm((prev: any) => ({ ...prev, time: streamingSchedTime }))
  }, [streamingSchedTime])
  useEffect(() => {
    if (streamingSchedEndTime) setScheduleForm((prev: any) => ({ ...prev, endTime: streamingSchedEndTime }))
  }, [streamingSchedEndTime])
  useEffect(() => {
    if (streamingSchedDesc) setScheduleForm((prev: any) => ({ ...prev, desc: streamingSchedDesc }))
  }, [streamingSchedDesc])

  useEffect(() => {
    if (streamingMemoTitle) setMemoForm((prev: any) => ({ ...prev, title: streamingMemoTitle }))
  }, [streamingMemoTitle])
  useEffect(() => {
    if (streamingMemoContent) setMemoForm((prev: any) => ({ ...prev, content: streamingMemoContent }))
  }, [streamingMemoContent])

  // 일정 연결 시뮬레이션
  useEffect(() => {
    if (currentStep?.targetId === 'v-memo-schedule-field') {
      setMemoForm((prev: any) => ({ ...prev, scheduleId: "0" }))
    }
  }, [currentStep?.targetId])

  // 단계 변경 시 뷰 및 가상 UI 상태 동기화
  useEffect(() => {
    if (!currentStep) return
    if (currentStep.view) setView(currentStep.view as any)
    setSubView(currentStep.subView)
    
    // 서브뷰 상태에 따라 모달 등 가상 UI 요소 제어
    setIsCreatingTeam(currentStep.subView === 'create_form')
    setIsCreatingSchedule(currentStep.subView === 'create_schedule')
    setIsCreatingMemo(currentStep.subView === 'create_memo')
    
    if (currentStep.onEnter) currentStep.onEnter()
  }, [currentStepIndex, currentStep])

  const handleNext = useCallback(() => {
    if (currentStepIndex < filteredSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      setShowCelebration(true)
    }
  }, [currentStepIndex, filteredSteps.length])

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  // ── 상호작용 핸들러 ────────────────────────────────────────
  const handleCreateTeamClick = () => {
    if (currentStep?.targetId === 'v-create-team-btn') {
      setIsCreatingTeam(true)
      handleNext()
    }
  }

  const handleSubmitTeam = () => {
    if (currentStep?.targetId === 'v-submit-team-btn') {
      const newTeam: VirtualTeam = {
        id: 0,
        name: teamNameFull,
        description: teamDescFull
      }
      setVirtualTeams([newTeam])
      setIsCreatingTeam(false)
      handleNext()
    }
  }

  const handleTeamCardClick = (id: number) => {
    if (currentStep?.targetId === `v-team-card-${id}`) {
      handleNext()
    }
  }

  const handleScheduleCardClick = (id: number) => {
    if (currentStep?.targetId === `v-schedule-card-${id}`) {
      setView('schedule_detail')
      handleNext()
    }
  }

  const handleSidebarClick = (targetId: string) => {
    if (currentStep?.targetId === targetId) {
      if (targetId === 'v-sidebar-memo') setView('memo')
      if (targetId === 'v-sidebar-schedule') setView('schedule')
      if (targetId === 'v-sidebar-team-manage') setView('team_manage')
      handleNext()
    }
  }

  const handleCreateScheduleClick = () => {
    if (currentStep?.targetId === 'v-schedule-create-btn') {
      setVirtualSchedules([]) // 생성을 위해 목록 비우기 (index 0 보장)
      setIsCreatingSchedule(true)
      handleNext()
    }
  }

  const handleSubmitSchedule = () => {
    if (currentStep?.targetId === 'v-schedule-submit-btn') {
      const newSchedule: VirtualSchedule = {
        id: virtualSchedules.length,
        title: scheduleTitleFull,
        description: scheduleDescFull,
        start_time: scheduleTimeFull,
        status: 'PENDING'
      }
      setVirtualSchedules([...virtualSchedules, newSchedule])
      setIsCreatingSchedule(false)
      handleNext()
    }
  }

  const handleCreateMemoClick = () => {
    if (currentStep?.targetId === 'v-memo-create-btn') {
      setVirtualMemos([]) // 생성을 위해 목록 비우기 (index 0 보장)
      setIsCreatingMemo(true)
      handleNext()
    }
  }

  const handleSubmitMemo = () => {
    if (currentStep?.targetId === 'v-memo-submit-btn') {
      const newMemo: VirtualMemo = {
        id: virtualMemos.length,
        title: memoTitleFull,
        content: memoContentFull,
        author_name: guideData?.user_name || '사용자',
        created_at: '방금 전',
        schedule_title: memoScheduleTitle
      }
      setVirtualMemos([...virtualMemos, newMemo])
      setIsCreatingMemo(false)
      handleNext()
    }
  }

  const handleMemoCardClick = (id: number) => {
    if (currentStep?.targetId === `v-memo-card-${id}`) {
      setView('memo_detail')
      handleNext()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-background overflow-hidden animate-in fade-in duration-500 font-sans">
      
      {/* 1. 사이드바 (메인 화면 제외하고 표시) */}
      {view !== 'main' && (
        <aside className="bg-sidebar text-sidebar-foreground min-h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border relative w-64 animate-in slide-in-from-left-4 duration-500 shadow-2xl z-[101]">
          <SidebarHeader />
          <nav id="v-sidebar-nav" className="flex-1 p-4 space-y-2">
            <SidebarItem icon={Home} label="대시보드" isActive={view === 'dashboard'} onClick={() => handleSidebarClick('v-sidebar-dashboard')} />
            <SidebarItem 
              id="v-sidebar-schedule"
              icon={Calendar} 
              label="일정 관리" 
              isActive={view === 'schedule' || view === 'schedule_detail'}
              onClick={() => handleSidebarClick('v-sidebar-schedule')}
            />
            <SidebarItem 
              id="v-sidebar-memo"
              icon={FileText} 
              label="협업 메모" 
              isActive={view === 'memo' || view === 'memo_detail'}
              onClick={() => handleSidebarClick('v-sidebar-memo')}
            />
            <SidebarItem 
              id="v-sidebar-team-manage"
              icon={Users} 
              label="팀 관리" 
              isActive={view === 'team_manage'} 
              onClick={() => handleSidebarClick('v-sidebar-team-manage')}
            />
            <SidebarItem icon={Bell} label="알림함" />
          </nav>
          <SidebarFooter user_name={guideData?.user_name} />
        </aside>
      )}

      {/* 2. 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50 dark:bg-slate-950">
        
        {/* 헤더 */}
        {view === 'main' ? <InitialHeader /> : <TeamHeader view={view} />}

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-40 onboarding-scroll-area">
          {view === 'main' && (
            <InitialMainView 
              virtualTeams={virtualTeams} 
              onCreateClick={handleCreateTeamClick}
              onTeamClick={handleTeamCardClick}
            />
          )}
          {view === 'dashboard' && <TeamDashboardView user_name={guideData?.user_name} team_name={virtualTeams[0]?.name} />}
          {view === 'team_manage' && <TeamManageView team_name={virtualTeams[0]?.name} />}
          {view === 'schedule' && (
            <ScheduleView 
              virtualSchedules={virtualSchedules} 
              onCreateClick={handleCreateScheduleClick} 
              onCardClick={handleScheduleCardClick}
              user_name={guideData?.user_name}
            />
          )}
          {view === 'schedule_detail' && (
            <ScheduleDetailView 
              user_name={guideData?.user_name}
              schedule_title={virtualSchedules[0]?.title}
              schedule_desc={virtualSchedules[0]?.description}
              onBack={() => setView('schedule')}
            />
          )}
          {view === 'memo' && (
            <MemoView 
              virtualMemos={virtualMemos}
              onCreateClick={handleCreateMemoClick}
              onCardClick={handleMemoCardClick}
              user_name={guideData?.user_name}
            />
          )}
          {view === 'memo_detail' && (
            <MemoDetailView 
              user_name={guideData?.user_name}
              memo_title={virtualMemos[0]?.title}
              memo_content={virtualMemos[0]?.content}
              schedule_title={virtualMemos[0]?.schedule_title}
              onBack={() => setView('memo')}
            />
          )}
        </div>

        {/* 팀 생성 폼 모달 */}
        {isCreatingTeam && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <Card className="relative w-full max-w-[480px] overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" /> 새 팀 만들기
                  </h2>
                  <p className="text-sm text-muted-foreground">함께 협업할 동료들을 초대하고 프로젝트를 시작하세요.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">팀 이름</Label>
                    <Input value={streamingName} readOnly className="h-12 rounded-xl border-2 focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">팀 설명</Label>
                    <Textarea 
                      value={streamingTeamDesc} 
                      readOnly 
                      className="min-h-[100px] rounded-xl border-2 resize-none focus-visible:ring-primary" 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    id="v-submit-team-btn"
                    onClick={handleSubmitTeam}
                    disabled={!isTeamDescFinished}
                    className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    {!isTeamDescFinished ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    팀 생성하기
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 일정 생성 모달 */}
        {isCreatingSchedule && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <Card className="relative w-full max-w-[500px] overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-300">
              <CardHeader className="bg-primary/5 border-b p-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> 새 일정 등록
                </CardTitle>
                <CardDescription>일정 정보를 입력하여 팀과 공유하세요.</CardDescription>
              </CardHeader>
              <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                <div id="v-schedule-title-field" className="space-y-2">
                  <Label htmlFor="title" className="font-bold">일정 제목</Label>
                  <Input 
                    id="title" 
                    value={scheduleForm.title} 
                    readOnly 
                    placeholder="예: 주간 팀 회의"
                    className="h-11 rounded-xl border-2" 
                  />
                </div>

                <div id="v-schedule-desc-field" className="space-y-2">
                  <Label htmlFor="description" className="font-bold">설명</Label>
                  <Textarea 
                    id="description" 
                    value={scheduleForm.desc} 
                    readOnly 
                    placeholder="회의 안건이나 주요 내용을 입력하세요"
                    className="min-h-[80px] rounded-xl border-2 resize-none" 
                  />
                </div>

                <div id="v-schedule-time-field" className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold">
                      <Calendar className="h-4 w-4 text-muted-foreground" /> 시작일
                    </Label>
                    <Input 
                      type="text" 
                      value={scheduleForm.time} 
                      readOnly 
                      className="h-11 rounded-xl border-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold">
                      <Clock className="h-4 w-4 text-muted-foreground" /> 종료일
                    </Label>
                    <Input 
                      id="v-schedule-endtime-field"
                      type="text" 
                      value={scheduleForm.endTime} 
                      readOnly 
                      className="h-11 rounded-xl border-2" 
                    />
                  </div>
                </div>

                <div id="v-schedule-assignee-field" className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold">
                    <Users className="h-4 w-4 text-muted-foreground" /> 담당자 지정 (선택)
                  </Label>
                  <div className="border-2 rounded-xl p-3 space-y-2 max-h-32 overflow-y-auto bg-muted/20">
                    <div className="flex items-center gap-3 p-2 bg-background rounded-lg border shadow-sm">
                      <div className="h-4 w-4 rounded border-2 border-primary bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">{guideData?.user_name || '사용자'}(Leader)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    id="v-schedule-submit-btn"
                    onClick={handleSubmitSchedule}
                    disabled={!scheduleForm.title || !scheduleForm.desc || !scheduleForm.time || !scheduleForm.endTime}
                    className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    {(!scheduleForm.title || !scheduleForm.desc || !scheduleForm.time || !scheduleForm.endTime) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    일정 생성하기
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 메모 생성 모달 */}
        {isCreatingMemo && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <Card className="relative w-full max-w-[600px] overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-300 rounded-[2rem]">
              <CardHeader className="bg-primary/5 border-b p-8">
                <CardTitle className="text-2xl flex items-center gap-3 font-black">
                  <FileText className="h-6 w-6 text-primary" /> 새 메모 작성
                </CardTitle>
                <CardDescription className="font-medium">아이디어나 공유하고 싶은 내용을 기록하세요.</CardDescription>
              </CardHeader>
              <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
                <div id="v-memo-title-field" className="space-y-2">
                  <Label htmlFor="memo-title" className="font-bold ml-1">메모 제목</Label>
                  <Input 
                    id="memo-title" 
                    value={memoForm.title} 
                    readOnly 
                    placeholder="제목을 입력하세요"
                    className="h-12 rounded-2xl border-2 focus:border-primary/50" 
                  />
                </div>

                <div id="v-memo-schedule-field" className="space-y-2">
                  <Label htmlFor="memo-schedule" className="font-bold ml-1">연결 일정 (선택)</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="w-full h-12 pl-11 pr-4 py-3 bg-primary/5 border-2 border-primary/10 rounded-2xl text-sm font-bold text-primary flex items-center">
                      {memoForm.scheduleId !== "none" ? (guideData?.guide?.example_memo?.schedule_id ? `일정 #${guideData.guide.example_memo.schedule_id}` : memoScheduleTitle) : "선택된 일정 없음"}
                    </div>
                  </div>
                </div>

                <div id="v-memo-content-field" className="space-y-2">
                  <Label htmlFor="memo-content" className="font-bold ml-1">내용</Label>
                  <Textarea 
                    id="memo-content" 
                    value={memoForm.content} 
                    readOnly 
                    placeholder="메모 내용을 입력하세요..."
                    className="min-h-[150px] rounded-2xl border-2 resize-none focus:border-primary/50 text-base font-medium" 
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    id="v-memo-submit-btn"
                    onClick={handleSubmitMemo}
                    disabled={!memoForm.title || !memoForm.content}
                    className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    {!isMemoContentFinished ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                    메모 생성하기
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 하이라이트 레이어 */}
        <Spotlight targetId={currentStep?.targetId} isOpen={true} />
        
        {/* 플로팅 가이드 카드 */}
        {currentStep && (
          <GuideCard 
            step={currentStep} 
            current={currentStepIndex + 1} 
            total={filteredSteps.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onClose={onClose}
          />
        )}

        {/* 축하 오버레이 */}
        {showCelebration && (
          <CelebrationOverlay 
            user_name={guideData?.user_name} 
            onClose={onClose} 
          />
        )}
      </main>
    </div>
  )
}

// ── 축하 효과 컴포넌트 ────────────────────────────────────────

function CelebrationOverlay({ user_name, onClose }: { user_name?: string, onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: any[] = []
    const colors = ['#FFD700', '#FF69B4', '#00BFFF', '#7CFC00', '#FF4500', '#9370DB']

    class Particle {
      x: number; y: number; color: string; size: number;
      vx: number; vy: number; gravity: number; opacity: number;

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.size = Math.random() * 5 + 2
        const angle = Math.random() * Math.PI * 2
        const force = Math.random() * 10 + 5
        this.vx = Math.cos(angle) * force
        this.vy = Math.sin(angle) * force
        this.gravity = 0.2
        this.opacity = 1
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.vy += this.gravity
        this.opacity -= 0.01
      }

      draw() {
        if (!ctx) return
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const firework = () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * (canvas.height * 0.5)
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y))
      }
    }

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (Math.random() < 0.05) firework()
      
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update()
        particles[i].draw()
        if (particles[i].opacity <= 0) {
          particles.splice(i, 1)
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-1000">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <Card className="relative w-full max-w-lg bg-background/90 backdrop-blur-2xl border-primary/20 shadow-[0_0_100px_rgba(var(--primary),0.3)] rounded-[3rem] p-10 text-center animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
            <div className="relative bg-primary h-24 w-24 rounded-[2rem] flex items-center justify-center text-primary-foreground shadow-2xl animate-bounce">
              <Sparkles className="h-12 w-12" />
            </div>
          </div>
        </div>
        <Badge className="mb-4 px-4 py-1 rounded-full bg-primary/10 text-primary border-none font-black text-xs tracking-widest uppercase">
          Welcome aboard
        </Badge>
        <h2 className="text-4xl font-black tracking-tight mb-4 text-foreground leading-tight">
          축하합니다, <span className="text-primary">{user_name || '사용자'}</span>님!
        </h2>
        <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
          가이드를 성공적으로 완료하셨습니다.<br />
          이제 팀원들과 함께 최고의 프로젝트를 만들어보세요!
        </p>
        <Button 
          onClick={onClose}
          className="w-full h-16 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
        >
          시작하기
        </Button>
      </Card>
    </div>
  )
}

// ── 공통 UI 컴포넌트 ────────────────────────────────────────

function InitialHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 shrink-0">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center text-primary-foreground shadow-lg"><Sparkles className="h-6 w-6" /></div>
          <div><h1 className="text-xl font-bold tracking-tight">NextWave</h1><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Project Management</p></div>
        </div>
        <div id="v-header-actions" className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-5 rounded-xl font-bold border-2"><Bell className="mr-2 h-4 w-4" /> 알림</Button>
          <Button variant="outline" className="h-11 px-5 rounded-xl font-bold border-2"><UserCircle className="mr-2 h-4 w-4" /> 프로필</Button>
          <Button variant="ghost" className="h-11 px-4 rounded-xl text-muted-foreground"><LogOut className="h-4 w-4 mr-2" /> 로그아웃</Button>
        </div>
      </div>
    </header>
  )
}

function TeamHeader({ view }: { view: string }) {
  const labelMap: Record<string, string> = { 
    dashboard: '팀 대시보드', 
    team_detail: '팀 상세 정보', 
    schedule: '일정 관리', 
    schedule_detail: '일정 상세',
    memo: '협업 메모',
    memo_detail: '메모 상세',
    team_manage: '팀 설정'
  }
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 shrink-0">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutDashboard className="h-4 w-4" /><span>/</span><span className="font-medium text-foreground">{labelMap[view] || '대시보드'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-2"><Bell className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-2"><UserCircle className="h-5 w-5" /></Button>
        </div>
      </div>
    </header>
  )
}

function SidebarHeader() {
  return (
    <div className="p-6 flex items-center gap-3 border-b border-sidebar-border">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg"><Sparkles className="h-6 w-6" /></div>
      <div><h1 className="text-xl font-bold tracking-tight">NextWave</h1><p className="text-xs text-sidebar-foreground/70">팀 협업 플랫폼</p></div>
    </div>
  )
}

function SidebarItem({ icon: Icon, label, isActive, onClick, id }: { icon: any, label: string, isActive?: boolean, onClick?: () => void, id?: string }) {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer", 
        isActive ? "bg-sidebar-accent font-medium shadow-sm text-sidebar-foreground" : "text-sidebar-foreground opacity-80 hover:bg-sidebar-accent"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} /><span>{label}</span>
    </div>
  )
}

function SidebarFooter({ user_name }: { user_name?: string }) {
  return (
    <div className="p-4 border-t border-sidebar-border">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 shrink-0 border-2 border-primary/20"><AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm font-bold uppercase">{user_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
        <div className="min-w-0"><p className="text-sm font-semibold truncate">{user_name || "사용자"}</p><p className="text-xs text-sidebar-foreground/60 truncate">onboarding@nextwave.ai</p></div>
      </div>
    </div>
  )
}

function GuideCard({ step, current, total, onPrev, onNext, onClose }: { step: OnboardingStep, current: number, total: number, onPrev: () => void, onNext: () => void, onClose: () => void }) {
  const positionClass = step.position === 'middle-right' 
    ? "top-1/2 -translate-y-1/2 right-8" 
    : "bottom-8 right-8"

  return (
    <div className={cn("absolute z-[140] w-full max-w-sm px-4 md:px-0 transition-all duration-500", positionClass)}>
      <Card className="bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-right-8 duration-500">
        <div className="bg-primary h-1.5 w-full">
          <div className="bg-white/30 h-full transition-all duration-500 ease-out" style={{ width: `${(current / total) * 100}%` }} />
        </div>
        <CardHeader className="pt-6 pb-2">
          <div className="flex justify-between items-center mb-1">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-primary border-primary/30">{step.part.toUpperCase()} GUIDE</Badge>
            <span className="text-[10px] font-bold text-muted-foreground">{current} / {total}</span>
          </div>
          <CardTitle className="text-xl font-black tracking-tight">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.content}</p>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t border-border/50 p-4 flex justify-between gap-3">
          <Button variant="ghost" size="sm" className="rounded-xl font-bold text-muted-foreground" onClick={onPrev} disabled={current === 1 || step.isInteractive}>
            이전
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="rounded-xl font-bold text-destructive hover:text-destructive" onClick={onClose}>종료</Button>
            <Button 
              className="rounded-xl font-bold bg-primary hover:bg-primary/90 min-w-[100px]" 
              onClick={onNext}
              disabled={step.isInteractive}
            >
              {current === total ? '완료' : '다음'} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function Spotlight({ targetId, isOpen }: { targetId?: string, isOpen: boolean }) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!isOpen || !targetId) {
      setRect(null)
      return
    }

    const updateRect = () => {
      const el = document.getElementById(targetId)
      if (el) {
        setRect(el.getBoundingClientRect())
      } else {
        setRect(null)
      }
    }

    // 초기 실행
    updateRect()

    // 애니메이션 대응: 짧은 간격으로 여러 번 재계산 (300ms 애니메이션 고려)
    const timer = setInterval(updateRect, 100)
    const timeout = setTimeout(() => clearInterval(timer), 1000)

    // 리사이즈 및 스크롤 감지
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)

    // MutationObserver: DOM 변화 감지
    const mutationObserver = new MutationObserver(updateRect)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    // ResizeObserver: 요소 자체의 크기 변화 감지
    let resizeObserver: ResizeObserver | null = null
    const targetEl = document.getElementById(targetId)
    if (targetEl) {
      resizeObserver = new ResizeObserver(updateRect)
      resizeObserver.observe(targetEl)
    }

    return () => {
      clearInterval(timer)
      clearTimeout(timeout)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
      mutationObserver.disconnect()
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [targetId, isOpen])

  if (!isOpen || !rect) return null

  return (
    <div className="fixed inset-0 z-[130] pointer-events-none overflow-hidden">
      <div 
        className="absolute transition-all duration-300 ease-out shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] rounded-xl ring-4 ring-primary animate-pulse"
        style={{ 
          top: rect.top - 8, 
          left: rect.left - 8, 
          width: rect.width + 16, 
          height: rect.height + 16 
        }} 
      />
    </div>
  )
}
