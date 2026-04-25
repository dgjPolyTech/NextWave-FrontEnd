"use client"

import { useState, useEffect } from "react"
import { Bell, Settings, Trash2, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { NotificationCreate } from "@/components/notification/notification-create"
import { notificationService, NotificationResponse } from "@/services/notificationService"

interface NotificationRulesProps {
  teamId: number
}

export function NotificationRules({ teamId }: NotificationRulesProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const data = await notificationService.getMyNotifications()
      setNotifications(data)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleToggle = async (notification: NotificationResponse) => {
    try {
      const updated = await notificationService.updateNotification(notification.id, {
        is_enabled: !notification.is_enabled,
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      )
    } catch (err) {
      console.error("Failed to toggle notification:", err)
      alert("알림 상태 변경에 실패했습니다.")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("이 알림을 삭제하시겠습니까?")) return
    try {
      await notificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error("Failed to delete notification:", err)
      alert("알림 삭제에 실패했습니다.")
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">내 알림 목록</h1>
          <p className="text-muted-foreground mt-1">설정된 리마인드 알림을 관리하세요</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) fetchNotifications()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              새 알림 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>새 알림 추가</DialogTitle>
            </DialogHeader>
            <NotificationCreate
              teamId={teamId}
              onSuccess={() => { setIsCreateModalOpen(false); fetchNotifications() }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">불러오는 중...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl opacity-50">
          <p>설정된 알림이 없습니다.</p>
          <p className="text-sm mt-2">일정을 선택하여 새 알림을 추가해보세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${notification.is_enabled ? "bg-primary" : "bg-muted"}`}>
                      <Bell className={`h-4 w-4 ${notification.is_enabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        일정 #{notification.schedule_id} 알림
                        {!notification.is_enabled && (
                          <Badge variant="secondary">비활성</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(notification.remind_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={notification.is_enabled}
                      onCheckedChange={() => handleToggle(notification)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  등록일: {formatDate(notification.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
