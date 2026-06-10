# WeMove Frontend

WeMove는 함께 운동할 사람과 모임을 찾고, 만들고, 참여하고, 관리할 수 있는 운동 모임 플랫폼입니다.  
이 저장소는 WeMove의 프런트엔드 애플리케이션이며 Vite와 React 기반으로 구성되어 있습니다.

## 주요 기능

- 홈 화면: 신규 모임, 인기 모임, 내 활동 요약, 주간 일정 확인
- 모임 찾기: 지역, 날짜, 종목, 키워드 기반 모임 검색
- 모임 상세: 모임 정보 확인, 참여 신청, 댓글, 공유, 조회수 기록
- 모임 생성/수정: 지역, 종목, 일정, 장소, 모집 인원, 상세 설명 등록
- 모임 관리: 주최자가 모집 상태와 진행 상태 관리
- 내 활동: 참여 예정, 대기, 완료, 내가 만든 모임 확인
- 마이페이지: 회원 정보, 관심사, 지역, 계정 관리
- 인증: 로그인, 회원가입, 아이디/비밀번호 찾기
- 관리자: 회원, 지역, 종목, 모임, 신고 데이터 관리
- 전역 모임 채팅: 로그인 사용자의 모임 기반 채팅 UI

## 기술 스택

- React 18
- Vite
- React Router DOM
- Axios
- React Hook Form
- React Calendar

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버는 Vite 기본 설정으로 실행됩니다.

## 빌드

```bash
npm run build
```

AWS 또는 배포 환경용 production mode 빌드가 필요할 때는 아래 명령어를 사용합니다.

```bash
npm run build:aws
```

## 환경 변수

`.env.production.example`을 참고해 배포 환경 변수를 설정합니다.

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
VITE_WS_BASE_URL=wss://your-render-service.onrender.com/ws
```

## 주요 폴더

- `src/pages`: 라우트 단위 페이지 컴포넌트
- `src/components`: 공통 UI와 모달, 레이아웃 컴포넌트
- `src/api`: 백엔드 API 호출 함수
- `src/contexts`: 인증 등 전역 상태 컨텍스트
- `src/data`: 네비게이션, 카테고리 등 정적 데이터
- `src/hooks`: 공통 커스텀 훅
- `src/styles`: 페이지별 CSS Module과 공통 스타일
- `src/utils`: 날짜, 아이콘, 이미지, 인증 보조 유틸
- `public`: 정적 파일
- `docs`: 배포, 아키텍처, 발표 자료 문서

## 라우트

- `/`: 홈
- `/meetings`: 모임 찾기
- `/search`: 통합 검색
- `/meetings/:meetingId`: 모임 상세
- `/meetings/new`: 모임 생성
- `/meetings/:meetingId/edit`: 모임 수정
- `/meetings/:meetingId/manage`: 모임 관리
- `/activity`: 내 활동
- `/mypage`: 마이페이지
- `/admin`: 관리자
- `/login`: 로그인
- `/signup`: 회원가입
- `/find-account`: 계정 찾기

## 참고 문서

- `docs/vercel-render-deploy.md`: Vercel + Render 배포 참고
- `docs/wemove-architecture-guide.md`: 프로젝트 아키텍처 가이드
- `docs/wemove-presentation-deck.md`: 발표 자료
- `docs/wemove-manus-ppt-prompt.md`: 발표 자료 생성용 프롬프트
