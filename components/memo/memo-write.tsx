"use client"

import { useState, useEffect } from "react"
import { FileText, Bold, Italic, List, Link, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { memoService } from "@/services/memoService"
import { scheduleService, ScheduleResponse } from "@/services/scheduleService"

interface MemoWriteProps {
  teamId: number
  onSuccess?: () => void
}

export function MemoWrite({ teamId, onSuccess }: MemoWriteProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    schedule_id: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await scheduleService.getTeamSchedules(teamId)
        setSchedules(data)
      } catch (err) {
        console.error("Failed to fetch schedules for memo:", err)
      }
    }
    fetchSchedules()
  }, [teamId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await memoService.createMemo({
        title: formData.title,
        content: formData.content || null,
        team_id: teamId,
        schedule_id: formData.schedule_id ? Number(formData.schedule_id) : null,
      })
      alert("메모가 저장되었습니다!")
      setFormData({ title: "", content: "", schedule_id: "" })
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Memo creation failed:", error)
      const detail = error.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("\n")
        : detail || error.message || "알 수 없는 오류"
      if (error.response?.status === 401) {
        alert("인증이 필요합니다. 먼저 로그인해주세요.")
      } else {
        alert("메모 저장 중 오류가 발생했습니다:\n" + msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">메모 작성</h1>
        <p className="text-muted-foreground mt-1">새로운 메모를 작성하세요</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            새 메모
          </CardTitle>
          <CardDescription>메모 내용을 입력해 주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="메모 제목을 입력하세요"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule_id">일정 연결 (선택)</Label>
                <Select
                  value={formData.schedule_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, schedule_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선택 안함" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택 안함</SelectItem>
                    {schedules.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <div className="border rounded-lg">
                <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="메모 내용을 입력하세요..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="border-0 focus-visible:ring-0 min-h-[300px] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "저장 중..." : "저장하기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
