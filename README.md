# WeMove

## 프로젝트 소개
WeMove는 사용자가 지역과 운동 종목을 기준으로 운동 모임을 찾고, 참가 신청하고, 모임장이 신청자를 승인/거절할 수 있는 지역 기반 운동 모임 매칭 플랫폼이다.

## 주요 기능
- 회원가입 / 로그인
- 지역 기반 운동 모임 조회
- 운동 종목별 필터링
- 모임 생성 / 수정 / 삭제
- 참가 신청
- 신청자 승인 / 거절
- 모임 종료 후 후기 작성
- 댓글 / 문의
- 관리자 페이지
- 신고 관리
- 운동 종목 관리

## 기술 스택
Frontend:
- React
- Vite
- JavaScript
- React Router
- Axios
- CSS

Backend:
- Spring Boot
- Java 17
- Maven
- MyBatis
- MySQL
- Lombok

Database:
- MySQL

IDE:
- IntelliJ IDEA

## 프로젝트 구조
```text
WeMove/
  backend/
  frontend/
  docs/
  README.md
  .gitignore
```

```text
backend/
  pom.xml
  src/main/java/kr/co/iei/...
  src/main/resources/
```

```text
frontend/
  package.json
  src/
```

```text
docs/
  project-overview.md
  erd.md
  api-spec.md
  page-structure.md
  tech-stack.md
  setup-guide.md
```

## 백엔드 패키지 구조
```text
kr.co.iei.auth.controller
kr.co.iei.auth.model.dao
kr.co.iei.auth.model.service
kr.co.iei.auth.model.vo

kr.co.iei.member.controller
kr.co.iei.member.model.dao
kr.co.iei.member.model.service
kr.co.iei.member.model.vo

kr.co.iei.meeting.controller
kr.co.iei.meeting.model.dao
kr.co.iei.meeting.model.service
kr.co.iei.meeting.model.vo
```

## 실행 방법

### 1. MySQL DB 생성
```sql
CREATE DATABASE wemove DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```
