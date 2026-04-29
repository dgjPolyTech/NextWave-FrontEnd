"use client"

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
import { useToast } from "@/components/ui/use-toast"
import { teamService, TeamResponse } from "@/services/teamService"
import { authService } from "@/services/authService"
import { inboxService, AppNotificationResponse } from "@/services/inboxService"
import { onboardingService } from "@/services/onboardingService"
import { PAGES } from "@/lib/constants"

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

export function MainPage({ onSelectTeam, onNavigate }: MainPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false)
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [inboxItems, setInboxItems] = useState<AppNotificationResponse[]>([])
  const [inboxLoading, setInboxLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const token = authService.getToken()
    setIsLoggedIn(!!token)
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

  // 로그인 상태가 바뀔 때 알림도 로드
  useEffect(() => {
    if (isLoggedIn) fetchInbox()
    else setInboxItems([])
  }, [isLoggedIn, fetchInbox])

  // 모달 열릴 때마다 최신 알림 새로고침
  useEffect(() => {
    if (isInboxModalOpen && isLoggedIn) fetchInbox()
  }, [isInboxModalOpen, isLoggedIn, fetchInbox])

  const fetchTeams = async () => {
    setIsLoading(true)
    try {
      const data = await teamService.getMyTeams()
      setTeams(data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        setTeams([])
        setIsLoggedIn(false)
      } else {
        console.error("Failed to fetch teams:", err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchTeams()
    } else {
      setTeams([])
      setIsLoading(false)
    }
  }, [isLoggedIn])

  const handleMarkRead = async (id: number) => {
    try {
      await inboxService.markAsRead(id)
      setInboxItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch { /* silent */ }
  }

  const handleAccept = async (notif: AppNotificationResponse) => {
    setActionLoading(notif.id)
    try {
      await inboxService.acceptTeamInvite(notif.id)
      // 수락 후 읽음 처리
      if (!notif.is_read) {
        await inboxService.markAsRead(notif.id).catch(() => { })
      }
      toast({ title: "초대 수락", description: "팀에 성공적으로 가입되었습니다!" })
      await fetchInbox()
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
      // 거절 후 읽음 처리
      if (!notif.is_read) {
        await inboxService.markAsRead(notif.id).catch(() => { })
      }
      toast({ title: "초대 거절", description: "팀 초대를 거절했습니다." })
      await fetchInbox()
    } catch (err: any) {
      toast({ title: "거절 실패", description: err.response?.data?.detail || err.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    authService.logout()
    setIsLoggedIn(false)
    setTeams([])
    toast({ title: "로그아웃 성공", description: "로그아웃이 완료되었습니다!" })
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 md:p-12 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">

        {/* ── 헤더 ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                NextWave
              </h1>
              <p className="text-muted-foreground text-sm font-medium">협업을 위한 새로운 물결</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* 알림함 버튼 + 모달 */}
                <Dialog open={isInboxModalOpen} onOpenChange={setIsInboxModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="relative shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-xl font-bold border-2"
                    >
                      <Bell className="mr-2 h-5 w-5" />
                      알림함
                      {/* 읽지 않은 알림 배지 */}
                      {inboxItems.filter(n => !n.is_read).length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                          {inboxItems.filter(n => !n.is_read).length}
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                      <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <Bell className="h-5 w-5 text-primary" />
                        알림함
                        <Badge variant="secondary" className="ml-1 text-xs">
                          최근 5개
                        </Badge>
                        {inboxLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                      </DialogTitle>
                    </DialogHeader>

                    {/* 알림 목록 */}
                    <div className="divide-y divide-border/40 max-h-[420px] overflow-y-auto">
                      {inboxLoading ? (
                        <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="text-sm">불러오는 중...</span>
                        </div>
                      ) : inboxItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                          <Inbox className="h-8 w-8 opacity-30" />
                          <span className="text-sm">새로운 알림이 없습니다.</span>
                        </div>
                      ) : (
                        inboxItems.slice(0, 5).map((notif) => {
                          const cfg = INBOX_TYPE_CONFIG[notif.type] ?? DEFAULT_INBOX_CFG
                          const isTeamInvite = notif.type === "TEAM_INVITE"
                          const isActioning = actionLoading === notif.id
                          return (
                            <div
                              key={notif.id}
                              className={`flex items-start gap-3 px-6 py-4 transition-colors group cursor-pointer ${notif.is_read ? "bg-muted/20" : "bg-card hover:bg-muted/40"}`}
                              onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                            >
                              {/* 타입 아이콘 */}
                              <div className="relative flex-shrink-0">
                                <div className={`flex items-center justify-center h-9 w-9 rounded-xl ${cfg.color} mt-0.5`}>
                                  {cfg.icon}
                                </div>
                                {!notif.is_read && (
                                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 ring-1 ring-background" />
                                )}
                              </div>

                              {/* 내용 */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-xs font-semibold ${notif.is_read ? "text-muted-foreground" : "text-foreground"}`}>
                                    {notif.title}
                                  </span>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                                    {cfg.label}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                  {notif.content}
                                  {notif.sender_name && <span className="font-medium text-foreground"> ({notif.sender_name})</span>}
                                </p>

                                {/* 팀 초대 수락/거절 */}
                                {isTeamInvite && (
                                  <div className="flex gap-1.5 mt-2" onClick={e => e.stopPropagation()}>
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs gap-1 px-3"
                                      onClick={() => handleAccept(notif)}
                                      disabled={isActioning}
                                    >
                                      {isActioning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                      수락
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs gap-1 px-3 text-destructive border-destructive/30 hover:text-destructive"
                                      onClick={() => handleReject(notif)}
                                      disabled={isActioning}
                                    >
                                      {isActioning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
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
                          onNavigate(PAGES.NOTIFICATION_LIST)
                        }}
                      >
                        알림 전체 보기
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* 내 프로필 */}
                <Button
                  variant="outline"
                  className="shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-xl font-bold border-2"
                  onClick={() => onNavigate(PAGES.USER_DETAIL)}
                >
                  <UserCircle className="mr-2 h-5 w-5" />
                  내 프로필
                </Button>

                {/* 로그아웃 */}
                <Button
                  variant="ghost"
                  className="shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-xl font-bold text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                {/* 로그인 */}
                <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-xl font-bold">
                      <LogIn className="mr-2 h-5 w-5" />
                      로그인
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                      <DialogTitle>로그인</DialogTitle>
                    </DialogHeader>
                    <UserLogin onSuccess={handleLoginSuccess} />
                  </DialogContent>
                </Dialog>

                {/* 회원가입 */}
                <Button
                  variant="outline"
                  className="shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-xl font-bold border-2"
                  onClick={() => onNavigate(PAGES.USER_SIGNUP)}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  회원가입
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── 팀 목록 섹션 ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">팀 선택</h2>
            <p className="text-muted-foreground text-sm">
              {isLoggedIn ? "참여 중인 팀의 대시보드에 입장하세요." : "로그인하여 팀 목록을 확인하세요."}
            </p>
          </div>

          {/* 새 팀 생성 버튼 (팀 선택 섹션 옆으로 이동) */}
          {isLoggedIn && (
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
              setIsCreateModalOpen(open)
              if (!open) fetchTeams()
            }}>
              <DialogTrigger asChild>
                <Button className="shadow-lg hover:shadow-xl transition-all h-10 px-5 rounded-xl font-bold gap-2 flex-shrink-0">
                  <Plus className="h-4 w-4" />
                  새 팀 생성
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>새 팀 생성</DialogTitle>
                </DialogHeader>
                <TeamCreate onSuccess={() => { setIsCreateModalOpen(false); fetchTeams() }} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* ── 팀 카드 목록 ── */}
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="p-6 rounded-full bg-muted">
              <LogIn className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">로그인이 필요합니다</p>
            <p className="text-sm text-muted-foreground">로그인하면 소속 팀 목록을 볼 수 있습니다.</p>
            <Button onClick={() => setIsLoginModalOpen(true)} className="gap-2 mt-2">
              <LogIn className="h-4 w-4" />
              로그인하러 가기
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <p>팀 목록을 불러오는 중...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <p className="text-muted-foreground">아직 소속된 팀이 없습니다.</p>
            <p className="text-sm text-muted-foreground">새 팀을 생성하거나, 팀 리더에게 초대를 받아보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="group hover:shadow-2xl transition-all duration-300 border-none shadow-md bg-card/80 backdrop-blur-sm cursor-pointer overflow-hidden rounded-3xl"
                onClick={() => onSelectTeam(team.id)}
              >
                <CardHeader className="pb-4 p-8">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-inner">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold mt-6 group-hover:text-primary transition-colors">
                    {team.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 leading-relaxed text-base">
                    {team.description || "팀 설명이 없습니다."}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-4 pb-6 px-8 border-t border-border/50 bg-muted/20">
                  <div className="flex items-center text-sm font-bold text-primary w-full justify-between group/btn">
                    <span>대시보드 입장</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}