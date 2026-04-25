"use client"

import { useState, useEffect } from "react"
import { User, Lock, Upload, UserCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { userService } from "@/services/userService"
import { useToast } from "@/components/ui/use-toast"

interface UserUpdateProps {
    onSuccess?: () => void
}

export function UserUpdate({ onSuccess }: UserUpdateProps) {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await userService.getMe()
                setFormData(prev => ({ ...prev, username: user.username }))
                if (user.image_path) {
                    // 서버의 이미지 경로 설정
                    setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL || ''}${user.image_path}`)
                }
            } catch (error) {
                console.error("Failed to fetch user:", error)
                toast({
                    title: "오류",
                    description: "사용자 정보를 불러오는데 실패했습니다.",
                    variant: "destructive"
                })
            } finally {
                setIsFetching(false)
            }
        }
        fetchUser()
    }, [toast])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setImageFile(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            // 정보 업데이트 (비밀번호는 입력된 경우에만 전송)
            const updateData: any = {}
            if (formData.username) updateData.username = formData.username
            if (formData.password) updateData.password = formData.password

            if (Object.keys(updateData).length > 0) {
                await userService.updateMe(updateData)
            }

            // 이미지 업로드
            if (imageFile) {
                await userService.uploadImage(imageFile)
            }

            toast({
                title: "성공",
                description: "유저 정보가 성공적으로 수정되었습니다.",
            })

            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error("Update failed:", error)
            
            let errorMsg = "알 수 없는 오류"
            if (error.response?.data?.detail) {
                if (typeof error.response.data.detail === 'string') {
                    errorMsg = error.response.data.detail
                } else if (Array.isArray(error.response.data.detail)) {
                    errorMsg = error.response.data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n')
                }
            } else if (error.message) {
                errorMsg = error.message
            }
            
            toast({
                title: "업데이트 실패",
                description: errorMsg,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">유저 정보를 불러오는 중...</p>
            </div>
        )
    }

    return (
        <div className="p-0">
            <Card className="border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-primary" />
                        내 정보 수정
                    </CardTitle>
                    <CardDescription>계정 정보를 수정하고 프로필 이미지를 등록하세요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-muted-foreground/50" />
                                )}
                            </div>
                            <div className="w-full">
                                <Label htmlFor="image" className="cursor-pointer">
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors text-sm font-medium">
                                        <Upload className="h-4 w-4" />
                                        프로필 이미지 선택
                                    </div>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" /> 사용자 이름
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="닉네임 또는 이름"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-muted-foreground" /> 새 비밀번호
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="변경할 비밀번호를 입력하세요 (선택)"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">비밀번호를 변경하지 않으려면 비워두세요.</p>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full shadow-md hover:shadow-lg transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "저장 중..." : "수정 완료"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
