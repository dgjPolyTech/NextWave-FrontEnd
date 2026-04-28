"use client"

import { useState } from "react"
import { Users, Mail, Lock, User, ArrowLeft, Briefcase, Target, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { userService } from "@/services/userService"
import { authService } from "@/services/authService"
import { onboardingService } from "@/services/onboardingService"
import { OnboardingModal } from "@/components/user/onboarding-modal"
import { useToast } from "@/components/ui/use-toast"
import { useNavigation } from "@/hooks/use-navigation"

interface UserSignUpProps {
    onSuccess?: (teamId?: number) => void
}

export function UserSignUp({ onSuccess }: UserSignUpProps) {
    const { setCurrentPage } = useNavigation()
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        birthDate: "",
        job: "",
        customJob: "",
        gender: "무관",
        purpose: "",
        customPurpose: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const calculatedAge = formData.birthDate ? calculateAge(formData.birthDate) : 0;
            const finalJob = formData.job === "기타" ? formData.customJob : formData.job;
            const finalPurpose = formData.purpose === "기타" ? formData.customPurpose : formData.purpose;

            // 1) 회원가입
            await userService.signup({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                age: calculatedAge,
                job: finalJob,
                gender: formData.gender,
                purpose: finalPurpose,
                image_path: null
            })

            toast({
                title: "회원가입 완료",
                description: "회원가입이 성공적으로 완료되었습니다!",
            })

            // 2) 자동 로그인
            try {
                await authService.login(formData.email, formData.password)

                // 3) 온보딩 완료 여부 확인
                const me = await userService.getMe()
                if (!onboardingService.isCompleted(me.id)) {
                    // 처음 가입 → 온보딩 모달 표시
                    setShowOnboarding(true)
                } else {
                    // 이미 완료된 경우 (재가입 등) → 바로 이동
                    if (onSuccess) onSuccess()
                    else setCurrentPage("main")
                }
            } catch {
                // 자동 로그인 실패해도 main으로 이동
                if (onSuccess) onSuccess()
                else setCurrentPage("main")
            }

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

    const handleOnboardingComplete = (createdTeamId?: number) => {
        setShowOnboarding(false)
        if (onSuccess) onSuccess(createdTeamId)
        else setCurrentPage("main")
    }

    const calculateAge = (birthDate: string): number => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 py-12 animate-in fade-in duration-500">
                <Card className="w-full max-w-2xl border-none shadow-xl bg-card">
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
                                <Users className="h-6 w-6 text-primary" />
                                계정 생성하기
                            </CardTitle>
                            <div className="w-9" /> {/* 빈 공간으로 타이틀 중앙 정렬 보조 */}
                        </div>
                        <CardDescription className="text-center text-base">
                            NextWave에 오신 것을 환영합니다. 아래 정보를 입력하여 팀에 참여하세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 이메일 */}
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
                                        required
                                    />
                                </div>

                                {/* 비밀번호 */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-muted-foreground" /> 비밀번호
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="8자리 이상, 영문+숫자+특수문자"
                                        value={formData.password}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, password: val });

                                            const confirmInput = document.getElementById("confirmPassword") as HTMLInputElement;
                                            if (confirmInput) {
                                                if (formData.confirmPassword && val !== formData.confirmPassword) {
                                                    confirmInput.setCustomValidity("비밀번호가 일치하지 않습니다.");
                                                } else {
                                                    confirmInput.setCustomValidity("");
                                                }
                                            }
                                        }}
                                        pattern="(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}"
                                        title="비밀번호는 8자리 이상이며, 영문, 숫자, 특수문자를 모두 포함해야 합니다."
                                        required
                                    />
                                </div>

                                {/* 비밀번호 확인 */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-muted-foreground" /> 비밀번호 확인
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="비밀번호를 다시 입력하세요"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, confirmPassword: val });
                                            if (val !== formData.password) {
                                                e.target.setCustomValidity("비밀번호가 일치하지 않습니다.");
                                            } else {
                                                e.target.setCustomValidity("");
                                            }
                                        }}
                                        required
                                    />
                                </div>

                                {/* 생년월일 */}
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate" className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" /> 생년월일
                                    </Label>
                                    <Input
                                        id="birthDate"
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                        required
                                    />
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
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="남" id="gender-male" />
                                            <Label htmlFor="gender-male" className="cursor-pointer font-normal">남</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="여" id="gender-female" />
                                            <Label htmlFor="gender-female" className="cursor-pointer font-normal">여</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="무관" id="gender-none" />
                                            <Label htmlFor="gender-none" className="cursor-pointer font-normal">무관</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* 직업 */}
                                <div className="space-y-2">
                                    <Label htmlFor="job" className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" /> 직업
                                    </Label>
                                    <Select value={formData.job} onValueChange={(value) => setFormData({ ...formData, job: value })}>
                                        <SelectTrigger id="job">
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
                                            required
                                        />
                                    )}
                                </div>

                                {/* 사용 용도 */}
                                <div className="space-y-2">
                                    <Label htmlFor="purpose" className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" /> 사용 용도
                                    </Label>
                                    <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
                                        <SelectTrigger id="purpose">
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
                                            required
                                        />
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full shadow-lg hover:shadow-xl transition-all font-bold text-lg h-14 rounded-xl mt-8"
                                disabled={isLoading}
                            >
                                {isLoading ? "가입 처리 중..." : "회원가입 완료"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* 온보딩 모달 */}
            <OnboardingModal
                isOpen={showOnboarding}
                onComplete={handleOnboardingComplete}
            />
        </>
    )
}
