"use client"

import { useState } from "react"
import { LogIn, Mail, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/authService"

interface UserLoginProps {
  onSuccess?: () => void
}

export function UserLogin({ onSuccess }: UserLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.login(email, password)
      setEmail("")
      setPassword("")
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Login failed:", error)
      if (error.response?.status === 401) {
        alert("이메일 또는 비밀번호가 올바르지 않습니다.")
      } else {
        const detail = error.response?.data?.detail
        const msg = Array.isArray(detail)
          ? detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("\n")
          : detail || error.message || "알 수 없는 오류"
        alert("로그인 중 오류가 발생했습니다:\n" + msg)
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
            <LogIn className="h-5 w-5 text-primary" />
            로그인
          </CardTitle>
          <CardDescription>계정 정보를 입력하여 로그인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> 이메일
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" /> 비밀번호
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
