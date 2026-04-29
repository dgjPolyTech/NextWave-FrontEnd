"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Bell, Calendar, FileText, Mail, Shield, Check, X,
  RefreshCw, Inbox, MessageSquare
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useNavigation } from "@/hooks/use-navigation"
import { inboxService, AppNotificationResponse } from "@/services/inboxService"
import { useToast } from "@/components/ui/use-toast"

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

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

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { processedNotificationIds, addProcessedId } = useNavigation()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<AppNotificationResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

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
      if (!notif.is_read) {
        await inboxService.markAsRead(notif.id).catch(() => { })
      }
      toast({ title: "초대 수락", description: "팀에 성공적으로 가입되었습니다!" })
      addProcessedId(notif.id)
      setNotifications(prev => prev.filter(n => n.id !== notif.id))
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
      setNotifications(prev => prev.filter(n => n.id !== notif.id))
    } catch (err: any) {
      toast({ title: "거절 실패", description: err.response?.data?.detail || err.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const filteredNotifications = notifications.filter(n => !processedNotificationIds.has(n.id))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              알림 전체 보기
            </div>
            <Button variant="ghost" size="sm" onClick={fetchNotifications} disabled={isLoading} className="h-8 px-2 rounded-lg">
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto divide-y">
          {isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-sm text-muted-foreground">알림을 불러오는 중...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="p-4 rounded-full bg-muted">
                <Inbox className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-lg">새로운 알림이 없습니다</p>
                <p className="text-sm text-muted-foreground mt-1">나중에 다시 확인해보세요.</p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] ?? DEFAULT_CFG
              const isTeamInvite = notif.type === "TEAM_INVITE"
              const isActioning = actionLoading === notif.id

              return (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-4 px-6 py-5 transition-colors group cursor-pointer",
                    notif.is_read ? "bg-muted/10 opacity-70" : "bg-card hover:bg-muted/30"
                  )}
                  onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={cn("flex items-center justify-center h-10 w-10 rounded-xl", cfg.bg)}>
                      {cfg.icon}
                    </div>
                    {!notif.is_read && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-sm font-semibold", !notif.is_read ? "text-foreground" : "text-muted-foreground")}>
                        {notif.title}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-medium">
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className={cn("text-sm leading-relaxed", !notif.is_read ? "text-muted-foreground" : "text-muted-foreground/60")}>
                      {notif.content}
                      {notif.sender_name && <span className="font-medium text-foreground"> ({notif.sender_name})</span>}
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-1.5">
                      {formatTime(notif.created_at)}
                    </p>

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
                          className="h-8 gap-1.5 font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleReject(notif)}
                          disabled={isActioning}
                        >
                          {isActioning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
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
      </DialogContent>
    </Dialog>
  )
}
