"use client"

import { useState, useEffect } from "react"
import { Users, Mail, Send, Crown, UserCheck, UserX, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { teamService, TeamMemberResponse } from "@/services/teamService"
import { useToast } from "@/components/ui/use-toast"

interface NotificationCreateProps {
  teamId: number
  onSuccess?: () => void
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  leader: {
    label: "리더",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    icon: <Crown className="h-3 w-3" />,
  },
  member: {
    label: "멤버",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    icon: <UserCheck className="h-3 w-3" />,
  },
  guest: {
    label: "게스트",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
    icon: <UserX className="h-3 w-3" />,
  },
}

export function NotificationCreate({ teamId, onSuccess }: NotificationCreateProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<TeamMemberResponse[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(true)
  const { toast } = useToast()

  const fetchMembers = async () => {
    setIsMembersLoading(true)
    try {
      const data = await teamService.getMembers(teamId)
      setMembers(data)
    } catch (error: any) {
      console.error("Failed to fetch members:", error)
    } finally {
      setIsMembersLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [teamId])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    try {
      await teamService.inviteMember(teamId, { email: email.trim(), role })
      toast({
        title: "초대 완료",
        description: `${email} 에게 팀 초대 알림을 발송했습니다. 상대방이 수락하면 팀원으로 등록됩니다.`,
      })
      setEmail("")
      setRole("member")
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Invite failed:", error)

      const status = error.response?.status
      const detail = error.response?.data?.detail
      const detailMsg = Array.isArray(detail)
        ? detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("\n")
        : detail || error.message || "알 수 없는 오류"

      if (status === 401) {
        toast({ title: "인증 오류", description: "로그인이 필요합니다.", variant: "destructive" })
      } else if (status === 403) {
        toast({ title: "권한 오류", description: "팀원 초대는 리더만 가능합니다.", variant: "destructive" })
      } else if (status === 404) {
        toast({ title: "유저 없음", description: "해당 이메일로 가입된 사용자를 찾을 수 없습니다.", variant: "destructive" })
      } else {
        toast({ title: "초대 실패", description: detailMsg, variant: "destructive" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const roleCfg = (roleKey: string) =>
    ROLE_CONFIG[roleKey] ?? { label: roleKey, color: "bg-muted text-muted-foreground", icon: null }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">팀 멤버 초대</h1>
        <p className="text-muted-foreground mt-1">
          이메일로 팀원을 초대하세요. 상대방이 알림함에서 수락하면 팀원으로 등록됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── 초대 폼 (3/5) ── */}
        <Card className="lg:col-span-3 shadow-md border border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              이메일로 초대
            </CardTitle>
            <CardDescription>
              가입된 이메일 주소로 초대 알림을 보냅니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-5">
              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="invite-email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  이메일 주소
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="초대할 팀원의 이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* 역할 */}
              <div className="space-y-2">
                <Label htmlFor="invite-role" className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-muted-foreground" />
                  부여할 역할
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="invite-role" className="h-11">
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        멤버 — 일정·메모 작성 가능
                      </div>
                    </SelectItem>
                    <SelectItem value="guest">
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-slate-400" />
                        게스트 — 읽기 전용
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  리더 권한은 팀 설정에서 직접 변경할 수 있습니다.
                </p>
              </div>

              <Separator />

              <Button
                type="submit"
                className="w-full h-11 font-bold gap-2 shadow-md hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    초대 중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    초대 보내기
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── 현재 팀원 목록 (2/5) ── */}
        <Card className="lg:col-span-2 shadow-md border border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                현재 팀원
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={fetchMembers}
                disabled={isMembersLoading}
                title="새로고침"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isMembersLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <CardDescription>
              {members.length > 0 ? `총 ${members.length}명 참여 중` : "팀원 없음"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMembersLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                불러오는 중...
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">팀원이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => {
                  const cfg = roleCfg(member.role)
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 hover:bg-muted/40 transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                          {member.user_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{member.user_name}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
