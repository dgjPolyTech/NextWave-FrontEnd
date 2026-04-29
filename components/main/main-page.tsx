"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Users, Plus, ArrowRight, Sparkles, LogIn, LogOut, UserCircle,
  Bell, Calendar, FileText, Mail, Shield, Check, X, ChevronRight, RefreshCw, Inbox, MessageSquare,
  Trash2, CheckCircle2
} from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { TeamCreate } from "@/components/team/team-create"
import { UserLogin } from "@/components/user/user-login"
import { UserSignUp } from "@/components/user/user-signup"
import { useToast } from "@/components/ui/use-toast"
import { userService } from "@/services/userService"
import { teamService, TeamResponse } from "@/services/teamService"
import { authService } from "@/services/authService"
import { inboxService, AppNotificationResponse } from "@/services/inboxService"
import { onboardingService } from "@/services/onboardingService"
import { PAGES } from "@/lib/constants"
import { useNavigation } from "@/hooks/use-navigation"

const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  schedule: {
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    label: "일정",
  },
  invite: {
    icon: <Mail className="h-4 w-4" />,
    color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    label: "초대",
  },
  memo: {
    icon: <FileText className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    label: "메모",
  },
  system: {
    icon: <Shield className="h-4 w-4" />,
    color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
    label: "시스템",
  },
}

// ── 알림 타입 설정 ─────────────────────────────────────────────────
const INBOX_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  TEAM_INVITE: { icon: <Mail className="h-4 w-4" />, color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400", label: "팀 초대" },
  INVITE_ACCEPTED: { icon: <Check className="h-4 w-4" />, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400", label: "초대 수락" },
  INVITE_REJECTED: { icon: <X className="h-4 w-4" />, color: "bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400", label: "초대 거절" },
  SCHEDULE_ASSIGN: { icon: <Calendar className="h-4 w-4" />, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400", label: "일정" },
  MEMO_MENTION: { icon: <FileText className="h-4 w-4" />, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400", label: "메모" },
  COMMENT: { icon: <MessageSquare className="h-4 w-4" />, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400", label: "댓글" },
}
const DEFAULT_INBOX_CFG = { icon: <Shield className="h-4 w-4" />, color: "bg-slate-100 text-slate-500", label: "알림" }

interface MainPageProps {
  onSelectTeam: (teamId: number) => void
  onNavigate: (page: any) => void
}

export function MainPage({ onSelectTeam, onNavigate: navigateProp }: MainPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false)
  const {
    setIsNotificationModalOpen: setIsFullInboxModalOpen,
    processedNotificationIds,
    addProcessedId
  } = useNavigation()
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [inboxItems, setInboxItems] = useState<AppNotificationResponse[]>([])
  const [inboxLoading, setInboxLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { toast } = useToast()

  const handleNavigate = (page: any) => {
    if (navigateProp) {
      navigateProp(page)
    }
  }

  useEffect(() => {
    const checkAuth = () => {
      const token = authService.getToken()
      setIsLoggedIn(!!token)
    }
    
    checkAuth() // 초기 체크
    
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', checkAuth)
      window.addEventListener('storage', checkAuth)
      return () => {
        window.removeEventListener('auth-change', checkAuth)
        window.removeEventListener('storage', checkAuth)
      }
    }
  }, [])

  const fetchInbox = useCallback(async () => {
    setInboxLoading(true)
    try {
      const data = await inboxService.getMyNotifications()
      setInboxItems(data)
    } catch (err) {
      console.error("Failed to fetch inbox:", err)
    } finally {
      setInboxLoading(false)
    }
  }, [])

  const fetchTeams = useCallback(async () => {
    if (!isLoggedIn) return
    try {
      const data = await teamService.getMyTeams()
      setTeams(data)
    } catch (err) {
      console.error("Failed to fetch teams:", err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      fetchTeams()
      fetchInbox()
    } else {
      setIsLoading(false)
    }
  }, [isLoggedIn, fetchTeams, fetchInbox])

  const handleMarkRead = async (id: number) => {
    try {
      await inboxService.markAsRead(id)
      setInboxItems(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch { /* silent */ }
  }

  const handleAccept = async (notif: AppNotificationResponse) => {
    setActionLoading(notif.id)
    try {
      await inboxService.acceptTeamInvite(notif.id)
      if (!notif.is_read) {
        await inboxService.markAsRead(notif.id).catch(() => { })
      }
      toast({ title: "초대 수락", description: "팀에 성공적으로 가입되었습니다!" })
      addProcessedId(notif.id)
      setInboxItems(prev => prev.filter(n => n.id !== notif.id))
      fetchTeams()
    } catch (err: any) {
      toast({ title: "수락 실패", description: err.response?.data?.detail || err.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (notif: AppNotificationResponse) => {
    setActionLoading(notif.id)
    try {
      await inboxService.rejectTeamInvite(notif.id)
      if (!notif.is_read) {
        await inboxService.markAsRead(notif.id).catch(() => { })
      }
      toast({ title: "초대 거절", description: "팀 초대를 거절했습니다." })
      addProcessedId(notif.id)
      setInboxItems(prev => prev.filter(n => n.id !== notif.id))
    } catch (err: any) {
      toast({ title: "거절 실패", description: err.response?.data?.detail || err.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = () => {
    authService.logout()
    setIsLoggedIn(false)
    setTeams([])
    toast({ title: "로그아웃 완료", description: "성공적으로 로그아웃되었습니다." })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="h-10 w-10 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col">
      {/* Header Section */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate(PAGES.MAIN)}>
            <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">NextWave</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Project Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* 알림함 버튼 */}
                <Button
                  variant="outline"
                  className="relative shadow-sm hover:shadow-md transition-all h-11 px-5 rounded-xl font-bold border-2"
                  onClick={() => {
                    const unreadItems = inboxItems.filter(n => !n.is_read && !processedNotificationIds.has(n.id))
                    if (unreadItems.length > 0) {
                      setIsInboxModalOpen(true)
                    } else {
                      setIsFullInboxModalOpen(true)
                    }
                  }}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  알림
                  {inboxItems.filter(n => !n.is_read && !processedNotificationIds.has(n.id)).length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                      {inboxItems.filter(n => !n.is_read && !processedNotificationIds.has(n.id)).length}
                    </span>
                  )}
                </Button>

                {/* 내 프로필 */}
                <Button
                  variant="outline"
                  className="shadow-sm hover:shadow-md transition-all h-11 px-5 rounded-xl font-bold border-2"
                  onClick={() => handleNavigate(PAGES.USER_DETAIL)}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  프로필
                </Button>

                {/* 로그아웃 */}
                <Button
                  variant="ghost"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="h-11 px-4 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="text-sm font-bold">로그아웃</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setIsLoginModalOpen(true);
                  }}
                  className="h-11 px-5 rounded-xl font-bold hover:bg-primary/5"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  로그인
                </Button>
                <Button
                  variant="default"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setIsSignupModalOpen(true);
                  }}
                  className="shadow-lg hover:shadow-xl transition-all h-11 px-6 rounded-xl font-bold"
                >
                  <Users className="mr-2 h-4 w-4" />
                  회원가입
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {!isLoggedIn && (
          <div className="flex flex-col items-center text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30 text-primary font-bold tracking-wider">
              NEXT-GEN COLLABORATION
            </Badge>
            <h2 className="text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white leading-tight">
              팀과 함께하는 <br />
              <span className="text-primary bg-primary/10 px-4 rounded-2xl">더 스마트한</span> 협업의 시작
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              실시간 일정 공유, 인터랙티브 메모, AI 기반 분석까지. <br />
              성공적인 프로젝트를 위한 모든 툴을 하나로 모았습니다.
            </p>
          </div>
        )}

        {/* Teams Section */}
        {isLoggedIn && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 bg-primary rounded-full"></div>
                <h3 className="text-2xl font-bold">내 워크스페이스</h3>
                <Badge variant="secondary" className="ml-2 px-2.5">{teams.length}</Badge>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl font-semibold shadow-md hover:shadow-lg transition-all">
                <Plus className="mr-2 h-4 w-4" /> 새 팀 만들기
              </Button>
            </div>

            {teams.length === 0 ? (
              <Card className="border-2 border-dashed border-muted bg-muted/10 p-12 text-center">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <div className="bg-primary/10 h-16 w-16 rounded-2xl flex items-center justify-center text-primary mb-6">
                    <Users className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">아직 소속된 팀이 없습니다</h4>
                  <p className="text-muted-foreground mb-8">
                    새로운 팀을 직접 만들거나, <br />다른 사용자로부터 팀 초대를 받아보세요.
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="rounded-xl px-8">
                    첫 번째 팀 생성하기
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teams.map((team) => (
                  <Card
                    key={team.id}
                    className="group hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-xl overflow-hidden rounded-2xl border-2"
                    onClick={() => onSelectTeam(team.id)}
                  >
                    <CardHeader className="p-0">
                      <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative overflow-hidden">
                        {team.image_path ? (
                          <img 
                            src={`${(typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || ''}${team.image_path}`} 
                            alt={team.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-10 w-10 text-primary/30" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 dark:bg-slate-800/90 h-8 w-8 rounded-lg flex items-center justify-center shadow-md">
                            <ArrowRight className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="p-5 flex flex-col items-start gap-2 bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-2 w-full">
                        <h4 className="font-bold text-lg truncate flex-1">{team.name}</h4>
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 w-full">
                        {team.description || "팀 설명이 없습니다."}
                      </p>
                      <div className="flex items-center gap-3 mt-2 w-full pt-4 border-t border-border/50">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-slate-200 dark:bg-slate-800"></div>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">active members</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Feature Highlights */}
        {!isLoggedIn && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Calendar className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-3">통합 일정 관리</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                팀원들의 일정을 한눈에 파악하고 효율적으로 조율하세요. 실시간 업데이트와 알림으로 놓치는 일정이 없습니다.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-3">협업 메모 시스템</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                동시에 메모를 작성하고 편집하세요. 멘션 기능을 통해 관련 팀원에게 즉시 내용을 공유하고 소통할 수 있습니다.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-3">AI 분석 리포트</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                프로젝트 진행 상황과 팀의 성과를 AI가 분석하여 제공합니다. 더 나은 결정을 위한 데이터를 확인하세요.
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-auto py-10 border-t border-border/40 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 NextWave Collaboration Platform. All rights reserved.
        </p>
      </footer>

      {/* 퀵뷰 다이얼로그 (읽지 않은 알림용) */}
      <Dialog open={isInboxModalOpen} onOpenChange={setIsInboxModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Bell className="h-5 w-5 text-primary" />
              알림함
              {inboxLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </DialogTitle>
          </DialogHeader>

          <div className="divide-y divide-border/40 max-h-[420px] overflow-y-auto">
            {inboxLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">불러오는 중...</span>
              </div>
            ) : inboxItems.filter(n => !n.is_read && !processedNotificationIds.has(n.id)).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Inbox className="h-8 w-8 opacity-30" />
                <span className="text-sm">새로운 알림이 없습니다.</span>
              </div>
            ) : (
              inboxItems.filter(n => !n.is_read && !processedNotificationIds.has(n.id)).map((notif) => {
                const cfg = INBOX_TYPE_CONFIG[notif.type] ?? DEFAULT_INBOX_CFG
                const isTeamInvite = notif.type === "TEAM_INVITE"
                const isActioning = actionLoading === notif.id
                return (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 px-6 py-4 transition-colors group cursor-pointer hover:bg-muted/40"
                    onClick={() => handleMarkRead(notif.id)}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`flex items-center justify-center h-9 w-9 rounded-xl ${cfg.color} mt-0.5`}>
                        {cfg.icon}
                      </div>
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 ring-1 ring-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground">{notif.title}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-4">{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                        {notif.content}
                        {notif.sender_name && <span className="font-medium text-foreground"> ({notif.sender_name})</span>}
                      </p>
                      {isTeamInvite && (
                        <div className="flex gap-1.5 mt-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <Button size="sm" className="h-7 text-xs gap-1 px-3" onClick={() => handleAccept(notif)} disabled={isActioning}>
                            {isActioning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            수락
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-3 text-destructive border-destructive/30" onClick={() => handleReject(notif)} disabled={isActioning}>
                            {isActioning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                            거절
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/50 bg-muted/20">
            <Button
              variant="ghost"
              className="w-full font-semibold gap-2 hover:bg-primary/10 hover:text-primary"
              onClick={() => {
                setIsInboxModalOpen(false)
                setIsFullInboxModalOpen(true)
              }}
            >
              알림 전체 보기
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
          <TeamCreate onSuccess={() => {
            setIsCreateModalOpen(false)
            fetchTeams()
          }} />
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
          <UserLogin onSuccess={() => {
            setIsLoginModalOpen(false)
            setIsLoggedIn(true)
          }} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSignupModalOpen} onOpenChange={setIsSignupModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
          <UserSignUp onSuccess={() => {
            setIsSignupModalOpen(false)
            setIsLoggedIn(true)
          }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}