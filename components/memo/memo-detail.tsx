"use client"

import { useState } from "react"
import { ArrowLeft, MessageSquare, User, Clock, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Comment {
  id: number
  author: string
  content: string
  createdAt: string
}

interface MemoDetailProps {
  memo: {
    id: number
    title: string
    content: string
    category: string
    author: string
    createdAt: string
  }
  onBack: () => void
}

const categoryLabels: Record<string, string> = {
  meeting: "회의록",
  idea: "아이디어",
  task: "업무",
  reference: "참고자료"
}

export function MemoDetail({ memo, onBack }: MemoDetailProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "이영희",
      content: "정리해주셔서 감사합니다! 큰 도움이 되네요.",
      createdAt: "2026-04-20 15:30"
    }
  ])
  const [newComment, setNewComment] = useState("")

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now(),
      author: "나 (사용자)",
      content: newComment,
      createdAt: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().slice(0, 5)
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  const handleDeleteComment = (id: number) => {
    setComments(comments.filter(c => c.id !== id))
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-6 hover:bg-secondary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      <Card className="mb-8 border-none shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
              {categoryLabels[memo.category] || memo.category}
            </Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{memo.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{memo.createdAt}</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground/90">
            {memo.title}
          </CardTitle>
        </CardHeader>
        <Separator className="mx-6" />
        <CardContent className="pt-8 pb-10 px-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {memo.content}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">댓글 {comments.length}</h2>
        </div>

        <Card className="border-none shadow-md overflow-hidden bg-background/50">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="p-6 flex gap-4 group hover:bg-muted/30 transition-colors">
                    <Avatar className="h-10 w-10 shrink-0 border-2 border-background">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {comment.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>아직 댓글이 없습니다. 첫 번째 댓글을 달아보세요!</p>
                </div>
              )}
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="p-4 bg-muted/20">
            <div className="flex w-full gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-background/80 border-none shadow-sm focus-visible:ring-primary/30"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
              </div>
              <Button 
                onClick={handleAddComment} 
                className="shadow-sm hover:shadow-md transition-all px-4"
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
