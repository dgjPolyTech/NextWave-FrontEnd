"use client"

import { useState, useEffect } from "react"
import { Users, Plus, ArrowRight, Sparkles, LogIn, LogOut, UserCircle } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TeamCreate } from "@/components/team/team-create"
import { UserLogin } from "@/components/user/user-login"
import { useToast } from "@/components/ui/use-toast"
import { teamService, TeamResponse } from "@/services/teamService"
import { authService } from "@/services/authService"

interface MainPageProps {
  onSelectTeam: (teamId: number) => void
  onNavigate: (page: any) => void
}

export function MainPage({ onSelectTeam, onNavigate }: MainPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { toast } = useToast()

  // 로그인 상태 초기화 (localStorage 토큰 확인)
  useEffect(() => {
    const token = authService.getToken()
    setIsLoggedIn(!!token)
  }, [])

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

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    authService.logout()
    setIsLoggedIn(false)
    setTeams([])
    toast({
      title: "로그아웃 성공",
      description: "로그아웃이 완료되었습니다!",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 md:p-12 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
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
              /* ── 로그인 상태 ── */
              <>
                <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                  setIsCreateModalOpen(open)
                  if (!open) fetchTeams()
                }}>
                  <DialogTrigger asChild>
                    <Button className="shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-xl font-bold">
                      <Plus className="mr-2 h-5 w-5" />
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

                <Button
                  variant="outline"
                  className="shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-xl font-bold border-2"
                  onClick={() => onNavigate("user-detail")}
                >
                  <UserCircle className="mr-2 h-5 w-5" />
                  내 프로필
                </Button>

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
              /* ── 비로그인 상태 ── */
              <>
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

                <Button
                  variant="outline"
                  className="shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-xl font-bold border-2"
                  onClick={() => onNavigate("user-signup")}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  회원가입
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 팀 목록 섹션 */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">팀 선택</h2>
          <p className="text-muted-foreground">
            {isLoggedIn ? "참여 중인 팀의 대시보드에 입장하세요." : "로그인하여 팀 목록을 확인하세요."}
          </p>
        </div>

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