"use client"

import { useState } from "react"
import { Users, Mail, Lock, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { userService } from "@/services/userService"
import { useToast } from "@/components/ui/use-toast"

interface UserSignUpProps {
    onSuccess?: () => void
}

export function UserSignUp({ onSuccess }: UserSignUpProps) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            await userService.signup({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                image_path: null
            })
            toast({
                title: "회원가입 완료",
                description: "회원가입이 성공적으로 완료되었습니다!",
            })
            setFormData({
                username: "",
                email: "",
                password: "",
            })
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error("Signup failed:", error)
            
            let errorMsg = "알 수 없는 오류";
            if (error.response?.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    errorMsg = error.response.data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n');
                } else {
                    errorMsg = error.response.data.detail;
                }
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            if (error.response?.status === 400) {
                toast({ title: "회원가입 실패", description: "이미 존재하는 이메일이거나 잘못된 요청입니다.\n상세: " + errorMsg, variant: "destructive" })
            } else if (error.response?.status === 422) {
                toast({ title: "회원가입 실패", description: "입력값이 올바르지 않습니다.\n" + errorMsg, variant: "destructive" })
            } else {
                toast({ title: "회원가입 실패", description: "회원가입 중 오류가 발생했습니다: " + errorMsg, variant: "destructive" })
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
                        <Users className="h-5 w-5 text-primary" />
                        회원가입
                    </CardTitle>
                    <CardDescription>새로운 계정을 생성하여 팀에 참여하세요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" /> 이메일
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" /> 사용자 이름
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="닉네임 또는 이름"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-muted-foreground" /> 비밀번호
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="비밀번호를 입력하세요"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full shadow-md hover:shadow-lg transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "가입 처리 중..." : "회원가입 완료"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
