"use client"

import { useState, useEffect } from "react"
import { User, Lock, Upload, UserCircle, ArrowLeft, Briefcase, Target, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { userService } from "@/services/userService"
import { useToast } from "@/components/ui/use-toast"
import { useNavigation } from "@/hooks/use-navigation"
import { PAGES } from "@/lib/constants"

export function UserUpdate() {
    const { setCurrentPage } = useNavigation()
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        birthDate: "",
        job: "",
        customJob: "",
        gender: "",
        purpose: "",
        customPurpose: "",
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
                // 직업/사용 용도가 커스텀값이면 "기타"로 표시
                const knownJobs = ["직장인", "학생", "주부", "프리랜서"]
                const knownPurposes = ["업무관리", "일정관리", "개인용", "팀프로젝트"]

                const job = user.job || ""
                const purpose = user.purpose || ""
                const isCustomJob = job && !knownJobs.includes(job)
                const isCustomPurpose = purpose && !knownPurposes.includes(purpose)

                setFormData(prev => ({
                    ...prev,
                    username: user.username,
                    birthDate: "",
                    job: isCustomJob ? "기타" : job,
                    customJob: isCustomJob ? job : "",
                    gender: user.gender || "",
                    purpose: isCustomPurpose ? "기타" : purpose,
                    customPurpose: isCustomPurpose ? purpose : "",
                }))
                if (user.image_path) {
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
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const updateData: any = {}
            if (formData.username) updateData.username = formData.username
            if (formData.password) updateData.password = formData.password
            if (formData.birthDate) {
                const computedAge = calculateAge(formData.birthDate)
                if (computedAge > 0) updateData.age = computedAge
            }
            const finalJob = formData.job === "기타" ? formData.customJob : formData.job
            const finalPurpose = formData.purpose === "기타" ? formData.customPurpose : formData.purpose
            if (finalJob) updateData.job = finalJob
            if (formData.gender) updateData.gender = formData.gender
            if (finalPurpose) updateData.purpose = finalPurpose

            if (Object.keys(updateData).length > 0) {
                await userService.updateMe(updateData)
            }

            if (imageFile) {
                await userService.uploadImage(imageFile)
            }

            toast({
                title: "수정 완료",
                description: "유저 정보가 성공적으로 수정되었습니다.",
            })

            setCurrentPage("user-detail")
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

    const calculateAge = (birthDate: string): number => {
        if (!birthDate) return 0
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
        return age
    }

    if (isFetching) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <p className="text-muted-foreground animate-pulse">유저 정보를 불러오는 중...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 py-12 animate-in fade-in duration-500">
            <Card className="w-full max-w-2xl border-none shadow-xl bg-card">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage("user-detail")}
                            className="rounded-full hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <UserCircle className="h-6 w-6 text-primary" />
                            내 정보 수정
                        </CardTitle>
                        <div className="w-9" />
                    </div>
                    <CardDescription className="text-center text-base">
                        변경할 항목만 수정하세요. 빈 칸은 기존 값이 유지됩니다.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 프로필 이미지 */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shadow-md">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-muted-foreground/40" />
                                )}
                            </div>
                            <Label htmlFor="image" className="cursor-pointer">
                                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                                    <Upload className="h-4 w-4" />
                                    프로필 이미지 변경
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 사용자 이름 */}
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

                            {/* 생년월일 */}
                            <div className="space-y-2">
                                <Label htmlFor="birthDate" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" /> 생년월일 (나이 변경 시)
                                </Label>
                                <Input
                                    id="birthDate"
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">입력 시 나이가 자동 계산됩니다.</p>
                            </div>

                            {/* 성별 */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" /> 성별
                                </Label>
                                <RadioGroup
                                    value={formData.gender}
                                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                                    className="flex items-center space-x-4 pt-2"
                                >
                                    {[{ value: "남", id: "u-gender-male" }, { value: "여", id: "u-gender-female" }, { value: "무관", id: "u-gender-none" }].map(opt => (
                                        <div key={opt.id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt.value} id={opt.id} />
                                            <Label htmlFor={opt.id} className="cursor-pointer font-normal">{opt.value}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* 직업 */}
                            <div className="space-y-2">
                                <Label htmlFor="u-job" className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" /> 직업
                                </Label>
                                <Select value={formData.job} onValueChange={(value) => setFormData({ ...formData, job: value })}>
                                    <SelectTrigger id="u-job">
                                        <SelectValue placeholder="직업을 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="직장인">직장인</SelectItem>
                                        <SelectItem value="학생">학생</SelectItem>
                                        <SelectItem value="주부">주부</SelectItem>
                                        <SelectItem value="프리랜서">프리랜서</SelectItem>
                                        <SelectItem value="기타">기타 (직접 입력)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formData.job === "기타" && (
                                    <Input
                                        className="mt-2"
                                        placeholder="직업을 직접 입력해주세요"
                                        value={formData.customJob}
                                        onChange={(e) => setFormData({ ...formData, customJob: e.target.value })}
                                    />
                                )}
                            </div>

                            {/* 사용 용도 */}
                            <div className="space-y-2">
                                <Label htmlFor="u-purpose" className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-muted-foreground" /> 사용 용도
                                </Label>
                                <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
                                    <SelectTrigger id="u-purpose">
                                        <SelectValue placeholder="사용 용도를 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="업무관리">업무 관리</SelectItem>
                                        <SelectItem value="일정관리">일정 관리</SelectItem>
                                        <SelectItem value="개인용">개인용</SelectItem>
                                        <SelectItem value="팀프로젝트">팀 프로젝트</SelectItem>
                                        <SelectItem value="기타">기타 (직접 입력)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formData.purpose === "기타" && (
                                    <Input
                                        className="mt-2"
                                        placeholder="사용 용도를 직접 입력해주세요"
                                        value={formData.customPurpose}
                                        onChange={(e) => setFormData({ ...formData, customPurpose: e.target.value })}
                                    />
                                )}
                            </div>

                            {/* 새 비밀번호 */}
                            <div className="space-y-2">
                                <Label htmlFor="u-password" className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-muted-foreground" /> 새 비밀번호
                                </Label>
                                <Input
                                    id="u-password"
                                    type="password"
                                    placeholder="변경할 비밀번호 (선택)"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">비밀번호를 변경하지 않으려면 비워두세요.</p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full shadow-lg hover:shadow-xl transition-all font-bold text-lg h-14 rounded-xl mt-4"
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
