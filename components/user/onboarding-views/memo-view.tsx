"use client"

import { FileText, Clock, User, Plus, Search, Filter, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface VirtualMemo {
  id: number
  title: string
  content: string
  author_name: string
  created_at: string
  schedule_title?: string
}

interface MemoViewProps {
  virtualMemos: VirtualMemo[]
  onCreateClick: () => void
  onCardClick?: (id: number) => void
  user_name?: string
}

export function MemoView({ virtualMemos, onCreateClick, onCardClick, user_name }: MemoViewProps) {
  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            팀 메모
          </h1>
          <p className="text-muted-foreground mt-1">
            팀원들이 작성한 메모들입니다. 아이디어를 자유롭게 공유하세요.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button id="v-memo-create-btn" onClick={onCreateClick} className="rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" /> 메모 생성
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-2 rounded-2xl border-2 border-dashed">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input className="w-full bg-transparent pl-9 pr-4 py-2 text-sm outline-none" placeholder="메모 제목 또는 내용 검색..." disabled />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-lg text-muted-foreground"><Filter className="h-3.5 w-3.5" /> 작성자 전체</Button>
          <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-lg text-muted-foreground"><ArrowUpDown className="h-3.5 w-3.5" /> 최신순</Button>
        </div>
      </div>

      {virtualMemos.length === 0 ? (
        <Card className="border-2 border-dashed border-muted bg-muted/10 p-20 text-center rounded-3xl">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="bg-primary/10 h-16 w-16 rounded-2xl flex items-center justify-center text-primary mb-6"><FileText className="h-8 w-8" /></div>
            <h4 className="text-xl font-bold mb-2">등록된 메모가 없습니다</h4>
            <p className="text-muted-foreground mb-8">새로운 메모를 작성하여 팀원들과 <br />중요한 정보를 공유해 보세요.</p>
            <Button onClick={onCreateClick} size="lg" className="rounded-xl px-8 font-bold">첫 번째 메모 작성하기</Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {virtualMemos.map((memo) => (
            <Card
              key={memo.id}
              id={`v-memo-card-${memo.id}`}
              onClick={() => onCardClick?.(memo.id)}
              className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary rounded-2xl overflow-hidden group animate-in zoom-in-95 duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {memo.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-1 font-medium">
                        {memo.content || "내용 없음"}
                      </CardDescription>
                    </div>
                  </div>
                  {memo.schedule_title && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold px-3">
                      <Clock className="h-3 w-3 mr-1" />
                      {memo.schedule_title}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 font-bold text-xs">
                    <User className="h-3.5 w-3.5" />
                    <span>{memo.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-xs">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{memo.created_at}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
