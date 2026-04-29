"use client"

import { useState, useEffect } from "react"
import { FileText, Clock, User, ArrowUpDown, Filter, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { memoService, MemoResponse } from "@/services/memoService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MemoWrite } from "./memo-write"
import { OnboardingTrigger } from "@/components/user/onboarding-trigger"

interface MemoShareProps {
  teamId: number
  onViewMemo?: (memo: MemoResponse) => void
}

export function MemoShare({ teamId, onViewMemo }: MemoShareProps) {
  const [memos, setMemos] = useState<MemoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [authorFilter, setAuthorFilter] = useState("all")
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)
  const [shouldAutoGenerate, setShouldAutoGenerate] = useState(false)
  const itemsPerPage = 10

  const fetchMemos = async () => {
    setIsLoading(true)
    try {
      const data = await memoService.getTeamMemos(teamId)
      setMemos(data)
    } catch (err) {
      console.error("Failed to fetch memos:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMemos()
  }, [teamId])

  const authors = Array.from(new Set(memos.map((m) => m.author_name)))

  const filteredAndSortedMemos = memos
    .filter((memo) => authorFilter === "all" || memo.author_name === authorFilter)
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedMemos.length / itemsPerPage))
  const paginatedMemos = filteredAndSortedMemos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <OnboardingTrigger feature="memo" teamId={teamId}>
      <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">팀 메모</h1>
          <p className="text-muted-foreground mt-1">팀원들이 작성한 메모들입니다</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 shadow-sm transition-all group relative overflow-hidden h-9"
            onClick={() => {
              setShouldAutoGenerate(true);
              setIsWriteModalOpen(true);
            }}
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary animate-pulse" />
            자동 메모 생성
          </Button>

          <Dialog open={isWriteModalOpen} onOpenChange={(open) => {
            setIsWriteModalOpen(open);
            if (!open) setShouldAutoGenerate(false);
          }}>
            <DialogTrigger asChild>
              <Button className="h-9 gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => setShouldAutoGenerate(false)}>
                <Plus className="h-4 w-4" />
                메모 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-10xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>새 메모 작성</DialogTitle>
                <DialogDescription>
                  팀원들과 공유할 메모 내용을 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <MemoWrite
                teamId={teamId}
                hideHeader={true}
                autoGenerate={shouldAutoGenerate}
                onSuccess={() => {
                  setIsWriteModalOpen(false);
                  setShouldAutoGenerate(false);
                  fetchMemos();
                }}
              />
            </DialogContent>
          </Dialog>

          <div className="h-6 w-px bg-border mx-1 hidden md:block" />

          <div className="flex items-center gap-2">
            <Label htmlFor="author-filter" className="sr-only">작성자 필터</Label>
            <Select value={authorFilter} onValueChange={(value) => { setAuthorFilter(value); setCurrentPage(1); }}>
              <SelectTrigger id="author-filter" className="w-[140px] h-9">
                <Filter className="h-3.5 w-3.5 mr-2 opacity-70" />
                <SelectValue placeholder="작성자 전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">작성자 전체</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author} value={author}>{author}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="sort-order" className="sr-only">정렬 순서</Label>
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger id="sort-order" className="w-[140px] h-9">
                <ArrowUpDown className="h-3.5 w-3.5 mr-2 opacity-70" />
                <SelectValue placeholder="최신순" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">최신순</SelectItem>
                <SelectItem value="asc">오래된순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">불러오는 중...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {paginatedMemos.length > 0 ? (
            paginatedMemos.map((memo) => (
              <Card
                key={memo.id}
                className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
                onClick={() => onViewMemo?.(memo)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {memo.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {memo.content || "내용 없음"}
                        </CardDescription>
                      </div>
                    </div>
                    {memo.schedule_title && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                        <Clock className="h-3 w-3 mr-1" />
                        {memo.schedule_title}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50">
                        <User className="h-3 w-3" />
                        <span className="font-medium">{memo.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(memo.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl opacity-50">
              <p>표시할 메모가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="h-9 w-9"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      </div>
    </OnboardingTrigger>
  )
}
