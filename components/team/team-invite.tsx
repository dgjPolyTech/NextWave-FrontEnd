"use client"

import { useState, useEffect } from "react"
import { Users, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { teamService, TeamMemberResponse } from "@/services/teamService"

interface TeamInviteProps {
  teamId: number
}

export function TeamInvite({ teamId }: TeamInviteProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<TeamMemberResponse[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(true)

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
    setIsLoading(true)
    try {
      await teamService.inviteMember(teamId, { email, role })
      alert(`${email}을(를) 팀에 초대했습니다!`)
      setEmail("")
      setRole("member")
      await fetchMembers()
    } catch (error: any) {
      console.error("Invite failed:", error)
      const detail = error.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("\n")
        : detail || error.message || "알 수 없는 오류"
      if (error.response?.status === 401) {
        alert("인증이 필요합니다. 먼저 로그인해주세요.")
      } else if (error.response?.status === 404) {
        alert("해당 이메일의 유저를 찾을 수 없습니다.")
      } else if (error.response?.status === 403) {
        alert("팀원 초대는 리더만 가능합니다.")
      } else {
        alert("초대 중 오류가 발생했습니다:\n" + msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabel = (role: string) => {
    if (role === "leader") return "리더"
    if (role === "member") return "멤버"
    if (role === "guest") return "게스트"
    return role
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">팀 초대</h1>
        <p className="text-muted-foreground mt-1">새로운 팀원을 초대하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              이메일로 초대
            </CardTitle>
            <CardDescription>가입된 이메일로 팀원을 초대합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="초대할 이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">역할</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">멤버</SelectItem>
                    <SelectItem value="guest">게스트</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "초대 중..." : "초대 보내기"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              현재 팀원
            </CardTitle>
            <CardDescription>팀에 참여 중인 멤버들입니다</CardDescription>
          </CardHeader>
          <CardContent>
            {isMembersLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">불러오는 중...</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">팀원이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{member.user_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user_name}</p>
                        <p className="text-xs text-muted-foreground">{member.team_name}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{roleLabel(member.role)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
