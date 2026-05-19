INSERT INTO sports(name, category) VALUES
('러닝', '유산소'), ('헬스', '근력운동'), ('풋살', '구기종목'), ('축구', '구기종목'),
('배드민턴', '라켓스포츠'), ('등산', '야외활동'), ('기타', '기타');

INSERT INTO regions(sido, sigungu, dong) VALUES
('경기', '파주시', '운정동'),
('경기', '파주시', '야당동'),
('경기', '파주시', '금촌동'),
('경기', '파주시', '문산읍'),
('서울', '마포구', '합정동'),
('서울', '강남구', '역삼동');

INSERT INTO users(login_id, email, password, nickname, region_id, role) VALUES
('user01', 'user01@wemove.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '러너민수', 2, 'USER'),
('user02', 'user02@wemove.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '풋살지훈', 1, 'USER'),
('user03', 'user03@wemove.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '배드지영', 4, 'USER'),
('admin01', 'admin@wemove.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '관리자', 6, 'ADMIN');

INSERT INTO meetings(host_user_id, sport_id, region_id, title, content, place_name, meeting_date, start_time, max_members, status) VALUES
(1, 1, 2, '야당역 5km 러닝 크루 모집', '퇴근 후 5km 페이스 러닝 함께해요.', '야당역 2번 출구', '2026-05-16', '20:00:00', 10, 'RECRUITING'),
(2, 3, 1, '운정 풋살 토요일 저녁 경기', '초중급 풋살 경기 인원 모집합니다.', '운정 스포츠파크', '2026-05-17', '18:30:00', 10, 'RECRUITING'),
(1, 2, 3, '헬스 루틴 공유 모임', '초보자 루틴 공유 및 상호 피드백 모임입니다.', '금촌 피트니스센터', '2026-05-15', '19:00:00', 5, 'RECRUITING'),
(3, 5, 4, '문산 실내체육관 초급 배드민턴', '초급 배드민턴 멤버 모집합니다.', '문산 실내체육관', '2026-05-18', '14:00:00', 8, 'RECRUITING'),
(2, 6, 1, '심학산 둘레길 아침 등산 모임', '가볍게 걷는 등산 모임입니다.', '심학산 입구', '2026-05-17', '08:00:00', 6, 'CLOSED');
