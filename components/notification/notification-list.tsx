"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowLeft, Bell, Calendar, FileText, Mail, Shield, Check, X,
  ChevronRight, RefreshCw, Inbox, MessageSquare
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigation } from "@/hooks/use-navigation"
import { inboxService, AppNotificationResponse } from "@/services/inboxService"
import { useToast } from "@/components/ui/use-toast"

// ── 알림 타입 설정 ─────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; label: string }> = {
  TEAM_INVITE: { icon: <Mail className="h-4 w-4" />, bg: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400", label: "팀 초대" },
  INVITE_ACCEPTED: { icon: <Check className="h-4 w-4" />, bg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400", label: "초대 수락" },
  INVITE_REJECTED: { icon: <X className="h-4 w-4" />, bg: "bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400", label: "초대 거절" },
  SCHEDULE_ASSIGN: { icon: <Calendar className="h-4 w-4" />, bg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400", label: "일정" },
  MEMO_MENTION: { icon: <FileText className="h-4 w-4" />, bg: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400", label: "메모" },
  COMMENT: { icon: <MessageSquare className="h-4 w-4" />, bg: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400", label: "댓글" },
}

const DEFAULT_CFG = { icon: <Shield className="h-4 w-4" />, bg: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400", label: "알림" }

function formatTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "방금 전"
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}일 전`
  return new Date(isoStr).toLocaleDateString("ko-KR")
}

export function NotificationList() {
  const { setCurrentPage } = useNavigation()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<AppNotificationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await inboxService.getMyNotifications()
      setNotifications(data)
    } catch (err) {
      console.error("Failed to fetch inbox:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkRead = async (id: number) => {
    try {
      await inboxService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
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
      // 알림 목록에서 해당 알림 제거 또는 타입 변경
      setNotifications(prev =>
        prev.filter(n => n.id !== notif.id)
      )
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
      // 알림 목록에서 해당 알림 제거
      setNotifications(prev =>
        prev.filter(n => n.id !== notif.id)
      )
    } catch (err: any) {
      toast({ title: "거절 실패", description: err.response?.data?.detail || err.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage("main")}
              className="rounded-full hover:bg-muted flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                알림함
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isLoading ? "불러오는 중..." : `전체 ${notifications.length}개${unreadCount > 0 ? ` · 읽지 않음 ${unreadCount}개` : ""}`}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={fetchNotifications}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>

        {/* 알림 목록 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin opacity-40" />
            <p className="text-sm">알림을 불러오는 중...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="p-5 rounded-full bg-muted">
              <Inbox className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="font-medium">새로운 알림이 없습니다</p>
            <p className="text-sm text-muted-foreground">팀 초대나 일정 배정이 오면 여기서 확인하세요.</p>
          </div>
        ) : (
          <Card className="border-none shadow-xl bg-card overflow-hidden">
            <div className="divide-y divide-border/40">
              {notifications.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type] ?? DEFAULT_CFG
                const isTeamInvite = notif.type === "TEAM_INVITE"
                const isActioning = actionLoading === notif.id

                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 px-6 py-5 transition-colors group ${notif.is_read ? "bg-muted/20" : "bg-card hover:bg-muted/30"}`}
                    onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                  >
                    {/* 미읽음 표시 */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${cfg.bg}`}>
                        {cfg.icon}
                      </div>
                      {!notif.is_read && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                      )}
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-sm font-semibold ${notif.is_read ? "text-muted-foreground" : "text-foreground"}`}>
                          {notif.title}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-medium">
                          {cfg.label}
                        </Badge>
                        {!notif.is_read && (
                          <Badge className="text-[10px] px-1.5 h-4 bg-red-500 text-white border-0">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${notif.is_read ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                        {notif.content}
                        {notif.sender_name && (
                          <span className="font-medium text-foreground"> ({notif.sender_name})</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-1.5">
                        {formatTime(notif.created_at)}
                      </p>

                      {/* 팀 초대 수락/거절 버튼 */}
                      {isTeamInvite && (
                        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 font-semibold"
                            onClick={() => handleAccept(notif)}
                            disabled={isActioning}
                          >
                            {isActioning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            수락
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 font-semibold text-destructive hover:text-destructive border-destructive/30"
                            onClick={() => handleReject(notif)}
                            disabled={isActioning}
                          >
                            {isActioning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                            거절
                          </Button>
                        </div>
                      )}
                    </div>

                    {!isTeamInvite && (
                      <ChevronRight className="flex-shrink-0 h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors mt-3" />
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
