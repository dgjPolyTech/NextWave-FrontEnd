"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, UserMinus, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { teamService, TeamMemberResponse } from "@/services/teamService"
import { scheduleService, ScheduleAssigneeResponse } from "@/services/scheduleService"
import { cn } from "@/lib/utils"

interface ScheduleAssigneeManagerProps {
  scheduleId: number
  teamId: number
}

export function ScheduleAssigneeManager({ scheduleId, teamId }: ScheduleAssigneeManagerProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([])
  const [assignees, setAssignees] = useState<ScheduleAssigneeResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [membersData, assigneesData] = await Promise.all([
        teamService.getMembers(teamId),
        scheduleService.getAssignees(scheduleId)
      ])
      setTeamMembers(membersData)
      setAssignees(assigneesData)
    } catch (error) {
      console.error("Failed to fetch assignee data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [scheduleId, teamId])

  const handleToggleAssignee = async (userId: number, isAssigned: boolean) => {
    setIsUpdating(userId)
    try {
      if (isAssigned) {
        await scheduleService.removeAssignee(scheduleId, userId)
        setAssignees((prev: ScheduleAssigneeResponse[]) => prev.filter((a: ScheduleAssigneeResponse) => a.user_id !== userId))
      } else {
        await scheduleService.addAssignees(scheduleId, { user_ids: [userId] })
        // Re-fetch to get the proper ID from backend
        const newData = await scheduleService.getAssignees(scheduleId)
        setAssignees(newData)
      }
    } catch (error) {
      console.error("Failed to update assignee:", error)
      alert("담당자 업데이트에 실패했습니다.")
    } finally {
      setIsUpdating(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        담당자 정보를 불러오는 중...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {assignees.length > 0 ? (
          assignees.map((a: ScheduleAssigneeResponse) => (
            <Badge key={a.id} variant="secondary" className="px-3 py-1.5 rounded-lg bg-primary/5 text-primary border-primary/20 flex items-center gap-2">
              <Users className="h-3 w-3" />
              {a.user_name}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">배정된 담당자가 없습니다.</p>
        )}
      </div>

      <div className="border rounded-2xl overflow-hidden bg-muted/20">
        <div className="bg-muted/50 px-4 py-2 border-b">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">팀 멤버 배정</p>
        </div>
        <div className="max-h-48 overflow-y-auto divide-y">
          {teamMembers.map((member: TeamMemberResponse) => {
            const isAssigned = assignees.some((a: ScheduleAssigneeResponse) => a.user_id === member.user_id)
            const loading = isUpdating === member.user_id

            return (
              <div key={member.user_id} className="flex items-center justify-between p-3 px-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    isAssigned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {member.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.user_name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{member.role}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isAssigned ? "outline" : "default"}
                  className={cn("h-8 gap-1.5 rounded-lg px-3", isAssigned && "border-destructive/20 text-destructive hover:bg-destructive hover:text-white")}
                  onClick={() => handleToggleAssignee(member.user_id, isAssigned)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isAssigned ? (
                    <>
                      <UserMinus className="h-3.5 w-3.5" />
                      해제
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      배정
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
