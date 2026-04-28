"use client"

import { useState, useEffect } from "react"
import { User, Mail, Briefcase, Target, Users, Calendar, ArrowLeft, Edit, UserCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { userService, UserResponse } from "@/services/userService"
import { useNavigation } from "@/hooks/use-navigation"

export function UserDetail() {
    const { setCurrentPage } = useNavigation()
    const [user, setUser] = useState<UserResponse | null>(null)
    const [isFetching, setIsFetching] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await userService.getMe()
                setUser(data)
            } catch (error) {
                console.error("Failed to fetch user:", error)
            } finally {
                setIsFetching(false)
            }
        }
        fetchUser()
    }, [])

    const getProfileImageUrl = () => {
        if (!user?.image_path) return null
        return `${process.env.NEXT_PUBLIC_API_URL || ''}${user.image_path}`
    }

    const InfoRow = ({
        icon,
        label,
        value,
    }: {
        icon: React.ReactNode
        label: string
        value?: string | number | null
    }) => (
        <div className="flex items-center gap-4 py-3">
            <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-foreground truncate">
                    {value ?? <span className="text-muted-foreground font-normal">미입력</span>}
                </p>
            </div>
        </div>
    )

    if (isFetching) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <p className="text-muted-foreground animate-pulse">유저 정보를 불러오는 중...</p>
            </div>
        )
    }

    const profileImageUrl = getProfileImageUrl()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 py-12 animate-in fade-in duration-500">
            <Card className="w-full max-w-xl border-none shadow-xl bg-card">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage("main")}
                            className="rounded-full hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <UserCircle className="h-6 w-6 text-primary" />
                            내 프로필
                        </CardTitle>
                        <div className="w-9" />
                    </div>
                    <CardDescription className="text-center">
                        현재 등록된 계정 정보를 확인합니다.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* 프로필 이미지 */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shadow-md">
                            {profileImageUrl ? (
                                <img src={profileImageUrl} alt="프로필" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-12 w-12 text-muted-foreground/40" />
                            )}
                        </div>
                        <p className="text-lg font-bold text-foreground">{user?.username}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>

                    <Separator />

                    {/* 상세 정보 */}
                    <div className="divide-y divide-border/50">
                        <InfoRow
                            icon={<Users className="h-4 w-4" />}
                            label="이름 (닉네임)"
                            value={user?.username}
                        />
                        <InfoRow
                            icon={<Mail className="h-4 w-4" />}
                            label="이메일"
                            value={user?.email}
                        />
                        <InfoRow
                            icon={<Calendar className="h-4 w-4" />}
                            label="나이"
                            value={user?.age ? `${user.age}세` : null}
                        />
                        <InfoRow
                            icon={<User className="h-4 w-4" />}
                            label="성별"
                            value={user?.gender}
                        />
                        <InfoRow
                            icon={<Briefcase className="h-4 w-4" />}
                            label="직업"
                            value={user?.job}
                        />
                        <InfoRow
                            icon={<Target className="h-4 w-4" />}
                            label="사용 용도"
                            value={user?.purpose}
                        />
                    </div>

                    <Separator />

                    <Button
                        size="lg"
                        className="w-full shadow-lg hover:shadow-xl transition-all font-bold text-base h-12 rounded-xl gap-2"
                        onClick={() => setCurrentPage("user-update")}
                    >
                        <Edit className="h-4 w-4" />
                        정보 수정
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
