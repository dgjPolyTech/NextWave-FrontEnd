"use client"

import { useState, useEffect, useRef } from "react"
import { Users, Mail, Settings, Camera, Save, Loader2, UserPlus, Info, Trash2, UserMinus, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { teamService, TeamMemberResponse, TeamResponse } from "@/services/teamService"
import { userService } from "@/services/userService"
import { cn } from "@/lib/utils"

interface TeamManageProps {
  teamId: number
}

export function TeamManage({ teamId }: TeamManageProps) {
  // Team Info State
  const [team, setTeam] = useState<TeamResponse | null>(null)
  const [teamName, setTeamName] = useState("")
  const [teamDesc, setTeamDesc] = useState("")
  const [isTeamLoading, setIsTeamLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Invite State
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [isInviting, setIsInviting] = useState(false)
  
  // Members State
  const [members, setMembers] = useState<TeamMemberResponse[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    setIsTeamLoading(true)
    setIsMembersLoading(true)
    try {
      // Get current user ID for member management
      const me = await userService.getMe()
      setCurrentUserId(me.id)

      const [teamData, membersData] = await Promise.all([
        teamService.getTeam(teamId),
        teamService.getMembers(teamId)
      ])
      setTeam(teamData)
      setTeamName(teamData.name)
      setTeamDesc(teamData.description || "")
      setMembers(membersData)
    } catch (error) {
      console.error("Failed to fetch team data:", error)
    } finally {
      setIsTeamLoading(false)
      setIsMembersLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [teamId])

  const handleUpdateTeam = async () => {
    if (!teamName.trim()) return
    setIsUpdating(true)
    try {
      const updated = await teamService.updateTeam(teamId, {
        name: teamName,
        description: teamDesc
      })
      setTeam(updated)
      alert("팀 정보가 수정되었습니다.")
    } catch (error) {
      console.error("Update team failed:", error)
      alert("팀 정보 수정에 실패했습니다.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUpdating(true)
      const updated = await teamService.uploadImage(teamId, file)
      setTeam(updated)
      alert("팀 이미지가 업데이트되었습니다.")
    } catch (error) {
      console.error("Image upload failed:", error)
      alert("이미지 업로드에 실패했습니다.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsInviting(true)
    try {
      await teamService.inviteMember(teamId, { email, role })
      alert(`${email}님을 팀에 초대했습니다.`)
      setEmail("")
      const updatedMembers = await teamService.getMembers(teamId)
      setMembers(updatedMembers)
    } catch (error: any) {
      console.error("Invite failed:", error)
      alert(error.response?.data?.detail || "초대에 실패했습니다.")
    } finally {
      setIsInviting(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!confirm("정말로 이 팀을 삭제하시겠습니까? 연관된 모든 일정과 메모가 영구적으로 삭제됩니다.")) return
    setIsUpdating(true)
    try {
      await teamService.deleteTeam(teamId)
      alert("팀이 삭제되었습니다.")
      window.location.href = "/" // 메인으로 이동
    } catch (error) {
      console.error("Delete team failed:", error)
      alert("팀 삭제에 실패했습니다.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!confirm(`${userName}님을 팀에서 내보내시겠습니까?`)) return
    try {
      await teamService.removeMember(teamId, userId)
      setMembers((prev: TeamMemberResponse[]) => prev.filter((m: TeamMemberResponse) => m.user_id !== userId))
      alert("멤버를 내보냈습니다.")
    } catch (error) {
      console.error("Remove member failed:", error)
      alert("멤버 내보내기에 실패했습니다.")
    }
  }

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${process.env.NEXT_PUBLIC_API_URL || ''}${path}`
  }

  if (isTeamLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">팀 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">팀 관리</h1>
          <p className="text-muted-foreground mt-1">팀 정보 수정 및 멤버 관리를 진행하세요</p>
        </div>
        <Badge variant="outline" className="w-fit h-fit px-3 py-1">
          Team ID: {teamId}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Team Settings */}
        <Card className="lg:col-span-2 border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              팀 기본 정보
            </CardTitle>
            <CardDescription>팀 이름과 설명을 수정할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={getImageUrl(team?.image_path)} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                    {team?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full shadow-lg border border-border"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">팀 이름</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-background/50 border-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-desc">팀 설명</Label>
                  <Textarea
                    id="team-desc"
                    value={teamDesc}
                    onChange={(e) => setTeamDesc(e.target.value)}
                    rows={4}
                    className="bg-background/50 border-none shadow-sm resize-none"
                    placeholder="팀에 대한 간단한 설명을 입력하세요"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 flex justify-end p-4">
            <Button onClick={handleUpdateTeam} disabled={isUpdating} className="gap-2 shadow-md">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              변경사항 저장
            </Button>
          </CardFooter>

          {/* Danger Zone: Delete Team */}
          {members.find((m: TeamMemberResponse) => m.user_id === currentUserId)?.role === 'leader' && (
            <div className="border-t border-destructive/10 p-6 bg-destructive/5 rounded-b-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    팀 삭제 (Danger Zone)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    이 팀을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all gap-2"
                  onClick={handleDeleteTeam}
                  disabled={isUpdating}
                >
                  <Trash2 className="h-4 w-4" />
                  팀 삭제하기
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Right Column: Invite Members */}
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              팀원 초대
            </CardTitle>
            <CardDescription>이메일로 새로운 팀원을 초대하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="pl-9 bg-background/50 border-none shadow-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">권한 설정</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-background/50 border-none shadow-sm">
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">멤버 (일반)</SelectItem>
                    <SelectItem value="guest">게스트 (보기 전용)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gap-2 shadow-md mt-2" disabled={isInviting}>
                {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                초대장 발송
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Full Width: Member List */}
        <Card className="lg:col-span-3 border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                현재 팀 구성원
              </CardTitle>
              <CardDescription>우리 팀에 소속된 모든 멤버들입니다.</CardDescription>
            </div>
            <Badge variant="secondary" className="px-2 py-0.5">
              총 {members.length}명
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {isMembersLoading ? (
                <div className="p-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">멤버 목록 로딩 중...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <p>등록된 팀원이 없습니다.</p>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                          {member.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{member.user_name}</p>
                        <p className="text-xs text-muted-foreground">#{member.user_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={member.role === 'leader' ? 'default' : 'secondary'}
                        className={cn(
                          "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          member.role === 'leader' ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {member.role}
                      </Badge>
                      
                      {/* Kick button: Only leaders can kick others, and cannot kick themselves */}
                      {members.find((m: TeamMemberResponse) => m.user_id === currentUserId)?.role === 'leader' && 
                       member.user_id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                          onClick={() => handleRemoveMember(member.user_id, member.user_name)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
