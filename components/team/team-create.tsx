"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { teamService } from "@/services/teamService"

interface TeamCreateProps {
  onSuccess?: () => void
}

export function TeamCreate({ onSuccess }: TeamCreateProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await teamService.createTeam({
        name: formData.name,
        description: formData.description || null,
      })
      alert("팀이 생성되었습니다!")
      setFormData({ name: "", description: "" })
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Team creation failed:", error)
      const detail = error.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("\n")
        : detail || error.message || "알 수 없는 오류"
      if (error.response?.status === 401) {
        alert("인증이 필요합니다. 먼저 로그인해주세요.")
      } else {
        alert("팀 생성 중 오류가 발생했습니다:\n" + msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-0">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            새 팀 만들기
          </CardTitle>
          <CardDescription>팀 정보를 입력해 주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">팀 이름</Label>
              <Input
                id="name"
                placeholder="팀 이름을 입력하세요"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">팀 설명 (선택)</Label>
              <Textarea
                id="description"
                placeholder="팀에 대한 설명을 입력하세요"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "생성 중..." : "팀 생성하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
