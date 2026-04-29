"use client"

import { Plus, Users, ArrowRight } from "lucide-react"
import { Card, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface VirtualTeam {
  id: number
  name: string
  description: string
}

interface InitialMainViewProps {
  virtualTeams: VirtualTeam[]
  onCreateClick: () => void
  onTeamClick: (id: number) => void
}

export function InitialMainView({ virtualTeams, onCreateClick, onTeamClick }: InitialMainViewProps) {
  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section id="v-workspace-section">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-primary rounded-full"></div>
            <h3 className="text-2xl font-bold">내 워크스페이스</h3>
            <Badge variant="secondary" className="ml-2 px-2.5">{virtualTeams.length}</Badge>
          </div>
          <Button id="v-create-team-btn" onClick={onCreateClick} className="rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" /> 새 팀 만들기
          </Button>
        </div>

        {virtualTeams.length === 0 ? (
          <Card className="border-2 border-dashed border-muted bg-muted/10 p-12 text-center rounded-3xl">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="bg-primary/10 h-16 w-16 rounded-2xl flex items-center justify-center text-primary mb-6"><Users className="h-8 w-8" /></div>
              <h4 className="text-xl font-bold mb-2">아직 소속된 팀이 없습니다</h4>
              <p className="text-muted-foreground mb-8">새로운 팀을 직접 만들거나, <br />다른 사용자로부터 팀 초대를 받아보세요.</p>
              <Button onClick={onCreateClick} size="lg" className="rounded-xl px-8 font-bold">첫 번째 팀 생성하기</Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {virtualTeams.map((team: VirtualTeam) => (
              <Card
                key={team.id}
                id={`v-team-card-${team.id}`}
                onClick={() => onTeamClick(team.id)}
                className="group hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-xl overflow-hidden rounded-2xl border-2 animate-in zoom-in-90 duration-300"
              >
                <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center relative">
                  <Users className="h-10 w-10 text-primary/30" />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 h-8 w-8 rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <CardFooter className="p-5 flex flex-col items-start gap-2 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 w-full"><h4 className="font-bold text-lg truncate flex-1">{team.name}</h4><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div></div>
                  <p className="text-sm text-muted-foreground line-clamp-1 w-full">{team.description}</p>
                  <div className="flex items-center gap-3 mt-2 w-full pt-4 border-t border-border/50">
                    <div className="flex -space-x-2">{[1, 2, 3].map((i) => (<div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-slate-200 dark:bg-slate-800"></div>))}</div>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">active members</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
