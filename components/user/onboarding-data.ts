import { 
  Home, Calendar, FileText, Users, Bell, Settings
} from "lucide-react"

export type OnboardingFeatureGroup = 'initial' | 'dashboard' | 'manage' | 'schedule' | 'memo'

export interface OnboardingStep {
  part: 'initial' | 'dashboard' | 'team_manage' | 'schedule' | 'memo'
  featureGroup: OnboardingFeatureGroup
  title: string
  content: string
  targetId?: string
  view: 'main' | 'dashboard' | 'team_detail' | 'schedule' | 'memo' | 'team_manage' | 'schedule_detail' | 'memo_detail'
  subView?: string
  isInteractive?: boolean
  position?: 'bottom-right' | 'middle-right' | 'bottom-center' | 'top-center' | 'middle-left'
  onEnter?: () => void
}

// 0. 초기 대시보드 (인트로 + 팀 생성)
export const INITIAL_DASHBOARD_STEPS: OnboardingStep[] = [
  {
    part: 'initial',
    featureGroup: 'initial',
    title: 'NextWave 시작하기',
    content: 'NextWave에 오신 것을 환영합니다! 이곳은 팀 프로젝트를 한눈에 관리하고 새로운 협업 공간을 만들 수 있는 메인 대시보드입니다.',
    view: 'main'
  },
  {
    part: 'initial',
    featureGroup: 'initial',
    title: '알림 및 프로필',
    content: '우측 상단의 메뉴를 통해 팀 초대 알림을 확인하거나 내 프로필 정보를 관리하고 로그아웃할 수 있습니다.',
    targetId: 'v-header-actions',
    view: 'main'
  },
  {
    part: 'initial',
    featureGroup: 'initial',
    title: '워크스페이스',
    content: '현재 참여 중인 팀 목록이 이곳에 표시됩니다. 아직 소속된 팀이 없으므로 새로운 팀을 만들어 보겠습니다.',
    targetId: 'v-workspace-section',
    view: 'main'
  },
  {
    part: 'initial',
    featureGroup: 'initial',
    title: '팀 생성 시작',
    content: '프로젝트를 시작하려면 "새 팀 만들기" 버튼을 클릭해 주세요.',
    targetId: 'v-create-team-btn',
    view: 'main',
    isInteractive: true
  },
  {
    part: 'initial',
    featureGroup: 'initial',
    title: '팀 정보 입력',
    content: '팀의 이름과 간단한 설명을 입력합니다. 예시 정보를 바탕으로 팀 구성을 시작할 수 있습니다.',
    view: 'main',
    subView: 'create_form'
  },
  {
    part: 'initial',
    featureGroup: 'initial',
    title: '팀 생성 완료',
    content: '모든 정보가 입력되었습니다. "팀 생성하기" 버튼을 클릭하여 워크스페이스를 만들어 보세요.',
    targetId: 'v-submit-team-btn',
    view: 'main',
    subView: 'create_form',
    isInteractive: true
  },
  {
    part: 'initial',
    featureGroup: 'initial',
    title: '워크스페이스 진입',
    content: '새로운 팀이 생성되었습니다! 이제 생성된 팀 카드를 클릭하여 팀 대시보드로 이동해 보겠습니다.',
    targetId: 'v-team-card-0',
    view: 'main',
    isInteractive: true
  }
]

// 1. 팀 대시보드
export const TEAM_DASHBOARD_STEPS: OnboardingStep[] = [
  {
    part: 'dashboard',
    featureGroup: 'dashboard',
    title: '팀 대시보드 진입',
    content: '팀 전용 대시보드에 오신 것을 환영합니다. 이곳에서는 팀원들과 공유하는 일정과 메모를 집중적으로 관리할 수 있습니다.',
    view: 'dashboard'
  },
  {
    part: 'dashboard',
    featureGroup: 'dashboard',
    title: '활동 요약',
    content: '팀의 최신 상태를 요약해서 보여주며, 새로운 업무를 즉시 등록할 수 있습니다.',
    targetId: 'v-hero-section',
    view: 'dashboard'
  },
  {
    part: 'dashboard',
    featureGroup: 'dashboard',
    title: '기능 탐색',
    content: '팀원들과 협업할 수 있는 다양한 기능들이 준비되어 있습니다. 추천된 핵심 기능부터 살펴볼까요?',
    view: 'dashboard'
  }
]

// 2. 팀 관리/설정
export const TEAM_MANAGE_STEPS: OnboardingStep[] = [
  {
    part: 'team_manage',
    featureGroup: 'manage',
    title: '팀 관리 페이지',
    content: '팀의 이름, 설명, 이미지를 변경하고 팀원들을 초대하거나 관리할 수 있는 공간입니다.',
    view: 'team_manage'
  },
  {
    part: 'team_manage',
    featureGroup: 'manage',
    title: '팀 정보 수정',
    content: '팀 이름과 설명을 변경하거나 팀 이미지를 업로드하여 우리 팀만의 개성을 표현하세요.',
    targetId: 'v-team-info-card',
    view: 'team_manage'
  },
  {
    part: 'team_manage',
    featureGroup: 'manage',
    title: '팀원 초대',
    content: '함께 협업할 동료를 이메일로 간편하게 초대할 수 있습니다.',
    targetId: 'v-team-invite-card',
    view: 'team_manage'
  },
  {
    part: 'team_manage',
    featureGroup: 'manage',
    title: '초대장 발송',
    content: '초대장을 발송하면 수신자에게 알림이 전송됩니다. 수신자가 승인하면 즉시 우리 팀원으로 등록됩니다.',
    targetId: 'v-team-invite-btn',
    view: 'team_manage'
  },
  {
    part: 'team_manage',
    featureGroup: 'manage',
    title: '현재 팀 구성원',
    content: '우리 팀에 소속된 모든 멤버를 확인하고 내보낼 수 있습니다. 리더 권한을 가진 사용자만 멤버 관리가 가능합니다.',
    targetId: 'v-team-member-list',
    view: 'team_manage',
    position: 'bottom-center'
  },
  {
    part: 'team_manage',
    featureGroup: 'manage',
    title: '팀 삭제',
    content: '프로젝트가 종료되어 팀을 삭제할 때 사용합니다. 삭제 시 모든 데이터가 사라지니 주의해 주세요.',
    targetId: 'v-team-delete-btn',
    view: 'team_manage'
  }
]

// 3. 일정 관리
export const SCHEDULE_STEPS: OnboardingStep[] = [
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '일정 관리 페이지',
    content: '팀의 모든 일정을 한눈에 확인하고 조율할 수 있는 공간입니다. 주간, 월간 단위로 일정을 필터링할 수 있습니다.',
    view: 'schedule'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '일정 생성 시작',
    content: '팀원들과 공유할 새로운 일정을 만들어 보겠습니다. "일정 생성" 버튼을 클릭해 주세요.',
    targetId: 'v-schedule-create-btn',
    view: 'schedule',
    isInteractive: true
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '일정 제목 입력',
    content: '수행할 업무나 회의의 제목을 입력합니다. 상황에 적합한 제목을 입력해 일정을 구분하세요.',
    targetId: 'v-schedule-title-field',
    view: 'schedule',
    subView: 'create_schedule'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '상세 내용 작성',
    content: '일정에 대한 상세한 설명이나 회의 안건 등을 작성합니다.',
    targetId: 'v-schedule-desc-field',
    view: 'schedule',
    subView: 'create_schedule'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '시작 날짜 설정',
    content: '업무가 시작되는 날짜와 시간을 설정합니다. 현재 날짜가 기본으로 제안됩니다.',
    targetId: 'v-schedule-time-field',
    view: 'schedule',
    subView: 'create_schedule'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '종료 날짜 설정',
    content: '업무가 마무리되는 날짜와 시간을 설정합니다. 시작 시간 이후로 설정하는 것이 좋습니다.',
    targetId: 'v-schedule-endtime-field',
    view: 'schedule',
    subView: 'create_schedule'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '담당자 지정',
    content: '이 일정을 수행할 팀원을 지정할 수 있습니다. 지정된 팀원에게는 즉시 알림이 발송됩니다.',
    targetId: 'v-schedule-assignee-field',
    view: 'schedule',
    subView: 'create_schedule'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '일정 등록 완료',
    content: '모든 내용이 준비되었습니다. "일정 생성하기" 버튼을 클릭하여 팀원들과 공유하세요.',
    targetId: 'v-schedule-submit-btn',
    view: 'schedule',
    subView: 'create_schedule',
    isInteractive: true
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '생성된 일정 확인',
    content: '새로운 일정이 성공적으로 등록되었습니다! 생성된 일정을 클릭하여 상세 내용을 확인해 보겠습니다.',
    targetId: 'v-schedule-card-0',
    view: 'schedule',
    isInteractive: true
  }
]

// 4. 일정 상세
export const SCHEDULE_DETAIL_STEPS: OnboardingStep[] = [
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '일정 상세 페이지',
    content: '등록된 일정의 상세 정보(설명, 시간, 담당자 등)를 확인하고 관리하는 페이지입니다.',
    view: 'schedule_detail'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '내용 수정하기',
    content: '일정의 제목이나 본문, 시간 설정이 변경되었다면 연필 아이콘을 눌러 수정 모드로 진입할 수 있습니다.',
    targetId: 'v-schedule-edit-btn',
    view: 'schedule_detail'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '담당자 설정 및 관리',
    content: '이 일정을 함께 수행할 팀원들을 추가하거나 제외할 수 있습니다. 팀원의 역할에 따라 권한이 달라집니다.',
    targetId: 'v-schedule-assignee-section',
    view: 'schedule_detail'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '상태 변경',
    content: '업무 진행 상황에 맞춰 대기, 진행중, 완료 상태를 즉시 변경하여 팀원들에게 공유할 수 있습니다.',
    targetId: 'v-schedule-status-section',
    view: 'schedule_detail'
  },
  {
    part: 'schedule',
    featureGroup: 'schedule',
    title: '일정 삭제',
    content: '더 이상 필요하지 않은 일정은 하단의 삭제 버튼을 통해 영구히 제거할 수 있습니다. 삭제 시 복구가 불가능하니 주의해 주세요.',
    targetId: 'v-schedule-delete-btn',
    view: 'schedule_detail',
    position: 'middle-right'
  }
]

// 5. 메모 관리
export const MEMO_STEPS: OnboardingStep[] = [
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '메모 관리 페이지',
    content: '팀의 모든 아이디어와 기록을 한곳에서 모아볼 수 있는 공간입니다. 검색과 필터 기능을 통해 필요한 정보를 빠르게 찾을 수 있습니다.',
    view: 'memo'
  },
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '새 메모 작성',
    content: '새로운 기록을 남기려면 "메모 작성" 버튼을 클릭해 주세요.',
    targetId: 'v-memo-create-btn',
    view: 'memo',
    isInteractive: true
  },
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '메모 제목 입력',
    content: '기록할 메모의 주제를 나타내는 제목을 입력합니다. 팀원들이 내용을 쉽게 파악할 수 있도록 작성해 보세요.',
    targetId: 'v-memo-title-field',
    view: 'memo',
    subView: 'create_memo'
  },
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '일정 연결 (선택)',
    content: '해당 메모가 특정 일정과 관련이 있다면 목록에서 일정을 선택하여 연결할 수 있습니다. 연결 시 일정 상세 페이지에서도 이 메모를 확인할 수 있습니다.',
    targetId: 'v-memo-schedule-field',
    view: 'memo',
    subView: 'create_memo'
  },
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '본문 내용 작성',
    content: '구체적인 아이디어나 공유하고 싶은 내용을 자유롭게 작성해 보세요.',
    targetId: 'v-memo-content-field',
    view: 'memo',
    subView: 'create_memo'
  },
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '메모 등록 완료',
    content: '모든 내용이 입력되었습니다. "메모 생성하기" 버튼을 클릭하여 팀원들에게 공유해 보세요.',
    targetId: 'v-memo-submit-btn',
    view: 'memo',
    subView: 'create_memo',
    isInteractive: true
  },
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '등록된 메모 확인',
    content: '방금 작성한 메모가 목록에 추가되었습니다! 메모 카드를 클릭하여 상세 내용과 댓글을 확인해 보겠습니다.',
    targetId: 'v-memo-card-0',
    view: 'memo',
    isInteractive: true
  },
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '메모 상세 및 댓글',
    content: '작성된 메모의 전체 내용과 연결된 일정을 확인할 수 있습니다. 하단에서 팀원들과 자유롭게 의견(댓글)을 나눌 수도 있습니다.',
    view: 'memo_detail'
  },
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '메모 수정하기',
    content: '내용을 수정해야 할 경우 우측 상단의 연필 아이콘을 클릭하여 수정 모드로 진입할 수 있습니다.',
    targetId: 'v-memo-edit-btn',
    view: 'memo_detail'
  },
  {
    part: 'memo',
    featureGroup: 'memo',
    title: '메모 삭제',
    content: '불필요해진 메모는 휴지통 아이콘을 눌러 영구히 삭제할 수 있습니다.',
    targetId: 'v-memo-delete-btn',
    view: 'memo_detail',
    position: 'middle-right'
  }
]

export const ALL_STEPS: OnboardingStep[] = [
  ...INITIAL_DASHBOARD_STEPS,
  ...TEAM_DASHBOARD_STEPS,
  ...TEAM_MANAGE_STEPS,
  ...SCHEDULE_STEPS,
  ...SCHEDULE_DETAIL_STEPS,
  ...MEMO_STEPS
]
