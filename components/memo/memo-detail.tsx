"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, MessageSquare, User, Clock, Trash2, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { memoService, MemoDetailResponse, CommentResponse } from "@/services/memoService"

interface MemoDetailProps {
  memo: {
    id: number
    title: string
    content: string
    author_name?: string
    created_at?: string
  }
  onBack: () => void
}

export function MemoDetail({ memo: initialMemo, onBack }: MemoDetailProps) {
  const [memo, setMemo] = useState<MemoDetailResponse | null>(null)
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchMemoDetail = async () => {
    try {
      setIsLoading(true)
      const data = await memoService.getMemo(initialMemo.id)
      setMemo(data)
      setComments(data.comments || [])
    } catch (err) {
      console.error("Failed to fetch memo detail:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMemoDetail()
  }, [initialMemo.id])

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await memoService.createComment(initialMemo.id, { content: newComment })
      setNewComment("")
      // 댓글 목록 다시 불러오기
      const data = await memoService.getComments(initialMemo.id)
      setComments(data)
    } catch (err) {
      console.error("Failed to add comment:", err)
      alert("댓글 작성에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return
    try {
      await memoService.deleteComment(initialMemo.id, commentId)
      setComments(comments.filter(c => c.id !== commentId))
    } catch (err) {
      console.error("Failed to delete comment:", err)
      alert("댓글 삭제에 실패했습니다.")
    }
  }

  const formatDate = (iso: string | undefined) => {
    if (!iso) return ""
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">메모를 불러오는 중...</p>
      </div>
    )
  }

  if (!memo) {
    return (
      <div className="p-8 text-center">
        <p>메모를 찾을 수 없습니다.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">돌아가기</Button>
      </div>
    )
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
              메모 상세
            </Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{memo.author_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDate(memo.created_at)}</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground/90">
            {memo.title}
          </CardTitle>
          {memo.schedule_title && (
            <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 p-3 rounded-lg border border-primary/10">
              <Clock className="h-4 w-4" />
              <span>연결된 일정: {memo.schedule_title}</span>
            </div>
          )}
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
                        {comment.author_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{comment.author_name}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
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
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                onClick={handleAddComment} 
                className="shadow-sm hover:shadow-md transition-all px-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                등록
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
