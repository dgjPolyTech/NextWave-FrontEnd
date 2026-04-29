"use client"

import { Settings, Camera, Save, UserPlus, Mail, AlertTriangle, Trash2, Users, UserMinus, ChevronDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TeamManageViewProps {
  team_name?: string
}

export function TeamManageView({ team_name }: TeamManageViewProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">팀 관리</h1>
          <p className="text-muted-foreground mt-1">팀 정보 수정 및 멤버 관리를 진행하세요</p>
        </div>
        <Badge variant="outline" className="w-fit h-fit px-3 py-1 border-2">
          Team ID: 2026
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 팀 기본 정보 */}
        <Card id="v-team-info-card" className="lg:col-span-2 border-2 shadow-lg bg-card/50 backdrop-blur-sm">
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
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary uppercase">
                    {team_name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-lg border-2">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <Label>팀 이름</Label>
                  <Input value={team_name || ""} readOnly className="bg-background/50 border-2" />
                </div>
                <div className="space-y-2">
                  <Label>팀 설명</Label>
                  <Textarea 
                    value="온보딩 가이드를 위한 팀" 
                    readOnly 
                    rows={4} 
                    className="bg-background/50 border-2 resize-none" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 flex justify-end p-4 border-t">
            <Button className="gap-2 shadow-md font-bold">
              <Save className="h-4 w-4" /> 변경사항 저장
            </Button>
          </CardFooter>

          {/* Danger Zone */}
          <div className="border-t-2 border-destructive/10 p-6 bg-destructive/5 rounded-b-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> 팀 삭제 (Danger Zone)
                </h4>
                <p className="text-xs text-muted-foreground">이 팀을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
              </div>
              <Button 
                id="v-team-delete-btn"
                variant="outline" 
                size="sm" 
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all gap-2 font-bold"
              >
                <Trash2 className="h-4 w-4" /> 팀 삭제하기
              </Button>
            </div>
          </div>
        </Card>

        {/* 팀원 초대 */}
        <Card id="v-team-invite-card" className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> 팀원 초대
            </CardTitle>
            <CardDescription>새로운 팀원을 초대하고 역할을 부여하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>이메일 주소</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="user@example.com" className="pl-9 bg-background/50 border-2" readOnly />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>역할 설정</Label>
              <div className="relative">
                <div className="flex items-center justify-between w-full h-10 px-3 rounded-md border-2 bg-background/50 text-sm opacity-70">
                  <span>멤버 (일반)</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 px-1 leading-tight italic">
                * 리더: 전체 관리, 멤버: 생성/수정, 게스트: 조회 전용
              </p>
            </div>

            <Button id="v-team-invite-btn" className="w-full gap-2 shadow-md font-bold mt-2">
              <UserPlus className="h-4 w-4" /> 초대장 발송
            </Button>
          </CardContent>
        </Card>

        {/* 멤버 목록 */}
        <Card id="v-team-member-list" className="lg:col-span-3 border-2 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> 현재 팀 구성원
              </CardTitle>
              <CardDescription>우리 팀에 소속된 모든 멤버들입니다. 권한에 따라 멤버를 관리할 수 있습니다.</CardDescription>
            </div>
            <Badge variant="secondary" className="px-2 py-0.5 border-2">총 1명</Badge>
          </CardHeader>
          <CardContent className="p-0 border-t-2">
            <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">ME</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">나 (팀 리더)</p>
                  <p className="text-xs text-muted-foreground">owner@nextwave.ai</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground font-black uppercase text-[10px]">Leader</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full">
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
