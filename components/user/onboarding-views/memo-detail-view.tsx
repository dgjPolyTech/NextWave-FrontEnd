"use client"

import { ArrowLeft, MessageSquare, User, Clock, Trash2, Send, Pencil, Check, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface MemoDetailViewProps {
  user_name?: string
  memo_title: string
  memo_content: string
  schedule_title?: string
  onBack: () => void
}

export function MemoDetailView({ user_name, memo_title, memo_content, schedule_title, onBack }: MemoDetailViewProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 hover:bg-secondary transition-colors rounded-xl font-bold"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      <Card className="mb-8 border-none shadow-2xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 p-8">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
              메모 상세
            </Badge>
            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/60">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{user_name || "사용자"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>방금 전</span>
              </div>
            </div>
          </div>
          <div className="flex items-start justify-between gap-6">
            <CardTitle className="text-3xl font-black tracking-tight text-foreground/90 flex-1 leading-tight">
              {memo_title}
            </CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                id="v-memo-edit-btn"
                variant="outline"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-primary border-muted-foreground/20 rounded-xl transition-all"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                id="v-memo-delete-btn"
                variant="outline"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-destructive border-muted-foreground/20 rounded-xl transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {schedule_title && (
            <div className="mt-6 flex items-center gap-3 text-sm text-primary font-bold bg-primary/5 p-4 rounded-2xl border border-primary/10 shadow-sm animate-in zoom-in-95 duration-500">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Clock className="h-4 w-4" />
              </div>
              <span>연결된 일정: {schedule_title}</span>
            </div>
          )}
        </CardHeader>
        <Separator className="mx-8 opacity-50" />
        <CardContent className="pt-8 pb-10 px-8">
          <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap font-medium">
            {memo_content}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">댓글 1</h2>
        </div>

        <Card className="border-none shadow-xl overflow-hidden bg-background/50 rounded-3xl">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              <div className="p-6 flex gap-4 group hover:bg-muted/30 transition-colors">
                <Avatar className="h-12 w-12 shrink-0 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">
                    {user_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{user_name || "사용자"}</span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">방금 전</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground/40 hover:text-destructive transition-colors rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                    좋은 생각입니다! 바로 진행해 봐도 좋을 것 같아요.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <Separator className="opacity-50" />
          <CardFooter className="p-6 bg-muted/10">
            <div className="flex w-full gap-3 items-end">
              <div className="flex-1">
                <div className="bg-background/80 rounded-2xl border-2 border-primary/5 focus-within:border-primary/20 transition-all p-3 min-h-[50px] text-sm text-muted-foreground/50 font-medium">
                  댓글을 입력하세요...
                </div>
              </div>
              <Button
                className="h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 px-6 transition-all active:scale-95"
              >
                <Send className="h-4 w-4 mr-2" />
                등록
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
