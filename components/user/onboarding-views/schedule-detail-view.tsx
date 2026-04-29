"use client"

import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Sparkles,
  Settings,
  Pencil
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ScheduleDetailViewProps {
  user_name?: string
  schedule_title?: string
  schedule_desc?: string
  onBack?: () => void
}

export function ScheduleDetailView({ user_name, schedule_title, schedule_desc, onBack }: ScheduleDetailViewProps) {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-8 hover:bg-secondary/50 rounded-xl transition-all group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        목록으로 돌아가기
      </Button>

      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
        <div className="h-3 w-full bg-primary" />
        
        <CardHeader className="pb-6 p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="default"
                className="px-4 py-1 text-xs font-black uppercase tracking-widest rounded-full shadow-sm border bg-primary/10 text-primary border-primary/20"
              >
                <span className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> 대기중</span>
              </Badge>
            </div>
            <div className="text-sm font-bold text-muted-foreground/60 flex items-center gap-2 uppercase tracking-tighter">
              <Calendar className="h-4 w-4" />
              Schedule ID: #2026
            </div>
          </div>
          
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <CardTitle className="text-5xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 leading-tight">
                  {schedule_title || "주간 팀 회의 🍳"}
                </CardTitle>
                <Button 
                  id="v-schedule-edit-btn"
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl h-10 w-10 border border-border/50 hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-xl leading-relaxed text-muted-foreground font-medium max-w-2xl">
                {schedule_desc || "신메뉴 개편 및 식자재 재고 확인을 위한 주간 회의입니다."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Separator className="mx-10 opacity-50" />

        <CardContent className="p-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column: Time & Status */}
            <div className="space-y-10">
              <div className="space-y-5">
                <h3 className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Timeframe
                </h3>
                <div className="bg-muted/20 p-8 rounded-[2rem] border border-border/40 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Calendar className="h-24 w-24" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Start Time
                      </p>
                      <p className="text-2xl font-black text-foreground/90">2026. 04. 29. 16:00</p>
                    </div>
                    <div className="w-12 h-1 bg-gradient-to-r from-primary/40 to-transparent rounded-full" />
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" /> End Time
                      </p>
                      <p className="text-2xl font-black text-foreground/80">2026. 04. 29. 17:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div id="v-schedule-status-section" className="space-y-5">
                <h3 className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Quick Actions
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 bg-primary/5 text-primary border-primary/20 shadow-sm whitespace-nowrap"
                  >
                    대기
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 hover:bg-amber-500/5 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm whitespace-nowrap"
                  >
                    진행중
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm whitespace-nowrap"
                  >
                    완료
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Assignees */}
            <div className="space-y-10">
              <div id="v-schedule-assignee-section" className="space-y-5">
                <h3 className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Users className="h-4 w-4" /> 담당자 설정
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="px-3 py-1.5 rounded-lg bg-primary/5 text-primary border-primary/20 flex items-center gap-2 font-bold">
                      <Users className="h-3 w-3" />
                      {user_name || '사용자'}
                    </Badge>
                  </div>

                  <div className="border-2 rounded-2xl overflow-hidden bg-muted/20 border-border/50">
                    <div className="bg-muted/50 px-4 py-2 border-b-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">담당자 목록</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y-2 bg-background/50">
                      <div className="flex items-center justify-between p-3 px-4 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            {user_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{user_name || '사용자'}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Leader</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 rounded-lg px-3 border-destructive/20 text-destructive hover:bg-destructive hover:text-white font-bold transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> 해제
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-10 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium italic">
              * 최종 수정: 2026. 04. 29. 15:45:20
            </div>
            <div id="v-schedule-delete-btn" className="flex items-center gap-3 w-full md:w-auto">
              <Button 
                variant="destructive" 
                className="flex-1 md:flex-none h-12 px-8 rounded-2xl font-bold gap-2 shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Trash2 className="h-4 w-4" />
                일정 삭제
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
