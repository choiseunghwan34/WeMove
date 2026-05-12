export const sports = [
  { id: 1, name: "러닝", code: "RUN", count: 124 },
  { id: 2, name: "헬스", code: "GYM", count: 86 },
  { id: 3, name: "풋살", code: "FS", count: 57 },
  { id: 4, name: "농구", code: "BK", count: 42 },
  { id: 5, name: "배드민턴", code: "BD", count: 63 },
  { id: 6, name: "등산", code: "HK", count: 39 }
];

export const regions = [
  "경기 파주시 운정동",
  "경기 파주시 야당동",
  "경기 파주시 금촌동",
  "경기 파주시 문산읍",
  "서울 마포구 합정동",
  "서울 강남구 역삼동"
];

export const meetings = [
  {
    id: 1,
    sport: "러닝",
    code: "RUN",
    title: "야당역 5km 러닝 크루 모집",
    region: "경기 파주시 야당동",
    place: "야당역 2번 출구",
    date: "2026-05-16",
    displayDate: "05.16",
    time: "20:00",
    current: 6,
    max: 10,
    status: "RECRUITING",
    statusText: "모집중",
    host: "러너민수",
    desc: "퇴근 후 가볍게 뛰는 5km 러닝 모임입니다. 초보자도 맞출 수 있는 페이스로 진행합니다."
  },
  {
    id: 2,
    sport: "풋살",
    code: "FS",
    title: "운정 풋살장 토요일 저녁 경기",
    region: "경기 파주시 운정동",
    place: "운정 스포츠파크",
    date: "2026-05-17",
    displayDate: "05.17",
    time: "18:30",
    current: 8,
    max: 10,
    status: "RECRUITING",
    statusText: "모집중",
    host: "풋살지훈",
    desc: "친목 위주 풋살 경기입니다. 실력보다 매너를 중요하게 보고 팀은 현장에서 나눕니다."
  },
  {
    id: 3,
    sport: "헬스",
    code: "GYM",
    title: "헬린이 루틴 공유 모임",
    region: "경기 파주시 금촌동",
    place: "금촌동 피트니스센터",
    date: "2026-05-15",
    displayDate: "05.15",
    time: "19:00",
    current: 3,
    max: 5,
    status: "RECRUITING",
    statusText: "모집중",
    host: "헬스수빈",
    desc: "처음 운동하는 분들과 루틴을 공유하고 자세를 점검하는 모임입니다."
  },
  {
    id: 4,
    sport: "배드민턴",
    code: "BD",
    title: "문산 실내체육관 초급 배드민턴",
    region: "경기 파주시 문산읍",
    place: "문산 실내체육관",
    date: "2026-05-18",
    displayDate: "05.18",
    time: "14:00",
    current: 5,
    max: 8,
    status: "RECRUITING",
    statusText: "모집중",
    host: "배드지영",
    desc: "초급자 중심으로 가볍게 랠리하고 게임을 진행합니다. 라켓 대여 가능합니다."
  },
  {
    id: 5,
    sport: "등산",
    code: "HK",
    title: "심학산 둘레길 아침 산책 모임",
    region: "경기 파주시 운정동",
    place: "심학산 입구",
    date: "2026-05-17",
    displayDate: "05.17",
    time: "08:00",
    current: 6,
    max: 6,
    status: "CLOSED",
    statusText: "모집마감",
    host: "산책도윤",
    desc: "가벼운 코스로 진행하는 아침 등산 모임입니다. 종료 후 근처 카페에서 해산합니다."
  }
];

export const adminMembers = [
  { id: "U001", nickname: "러너민수", region: "경기 파주시", sports: "러닝, 등산", role: "USER", status: "ACTIVE" },
  { id: "U002", nickname: "풋살지훈", region: "경기 파주시", sports: "풋살", role: "USER", status: "ACTIVE" },
  { id: "U003", nickname: "관리자", region: "서울 마포구", sports: "-", role: "ADMIN", status: "ACTIVE" },
  { id: "U004", nickname: "운정헬린이", region: "경기 파주시", sports: "헬스", role: "USER", status: "SUSPENDED" }
];

export const reports = [
  { id: "R001", reporter: "풋살지훈", target: "운정헬린이", reason: "노쇼", status: "PENDING" },
  { id: "R002", reporter: "러너민수", target: "부적절한 모임 설명", reason: "부적절한 내용", status: "PENDING" },
  { id: "R003", reporter: "지영", target: "익명 사용자", reason: "비매너", status: "RESOLVED" }
];
