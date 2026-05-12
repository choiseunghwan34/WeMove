import { useMemo, useState } from "react";
import "../styles/site-demo.css";

const meetings = [
  {
    id: 1,
    sport: "러닝",
    sportCode: "RUN",
    title: "야당역 5km 러닝 크루 모집",
    region: "경기 파주시 야당동",
    place: "야당역 2번 출구",
    date: "오늘",
    time: "20:00",
    current: 6,
    max: 10,
    status: "RECRUITING",
    statusText: "모집중",
    host: "민준",
    desc: "퇴근 후 가볍게 뛰는 러닝 모임입니다. 초보자도 맞출 수 있는 페이스로 진행합니다.",
  },
  {
    id: 2,
    sport: "풋살",
    sportCode: "FS",
    title: "운정 풋살장 토요일 저녁 경기",
    region: "경기 파주시 운정동",
    place: "운정 스포츠파크",
    date: "토요일",
    time: "18:30",
    current: 8,
    max: 10,
    status: "RECRUITING",
    statusText: "모집중",
    host: "재훈",
    desc: "친목 위주 풋살 모임입니다. 실력보다 매너를 중요하게 보고 팀은 현장에서 나눕니다.",
  },
  {
    id: 3,
    sport: "헬스",
    sportCode: "GYM",
    title: "헬린이 루틴 공유 모임",
    region: "경기 파주시 금촌동",
    place: "금촌동 피트니스센터",
    date: "내일",
    time: "19:00",
    current: 3,
    max: 5,
    status: "RECRUITING",
    statusText: "모집중",
    host: "수빈",
    desc: "처음 운동하는 분들과 루틴을 공유하고 자세를 점검하는 모임입니다.",
  },
  {
    id: 4,
    sport: "배드민턴",
    sportCode: "BD",
    title: "문산 실내체육관 초급 배드민턴",
    region: "경기 파주시 문산읍",
    place: "문산 실내체육관",
    date: "일요일",
    time: "14:00",
    current: 5,
    max: 8,
    status: "RECRUITING",
    statusText: "모집중",
    host: "지영",
    desc: "초급자 중심으로 가볍게 랠리하고 게임을 진행합니다. 라켓 대여 가능합니다.",
  },
  {
    id: 5,
    sport: "등산",
    sportCode: "HK",
    title: "심학산 둘레길 아침 산책 모임",
    region: "경기 파주시 운정동",
    place: "심학산 입구",
    date: "토요일",
    time: "08:00",
    current: 6,
    max: 6,
    status: "CLOSED",
    statusText: "모집마감",
    host: "도윤",
    desc: "가벼운 코스로 진행하는 아침 등산 모임입니다. 종료 후 근처 카페에서 해산합니다.",
  },
];

const sports = [
  { name: "러닝", code: "RUN" },
  { name: "헬스", code: "GYM" },
  { name: "풋살", code: "FS" },
  { name: "배드민턴", code: "BD" },
  { name: "농구", code: "BK" },
  { name: "등산", code: "HK" },
];

function getStatusClass(status) {
  if (status === "RECRUITING") return "green";
  if (status === "CLOSED") return "orange";
  return "gray";
}

export default function SiteDemoPage() {
  const [tab, setTab] = useState("home");
  const [selected, setSelected] = useState(meetings[0]);

  const cards = useMemo(() => meetings, []);

  const moveToDetail = (meeting) => {
    setSelected(meeting);
    setTab("detail");
  };

  return (
      <div className="app">
        {tab !== "login" && (
            <header className="topbar">
              <div className="container nav">
                <button className="logo" type="button" onClick={() => setTab("home")}>
                  <span className="logo-mark">W</span>
                  <span>WeMove</span>
                </button>

                <nav className="menu">
                  <button className={tab === "home" ? "active" : ""} type="button" onClick={() => setTab("home")}>
                    홈
                  </button>
                  <button className={tab === "finder" ? "active" : ""} type="button" onClick={() => setTab("finder")}>
                    모임 찾기
                  </button>
                  <button className={tab === "newMeeting" ? "active" : ""} type="button" onClick={() => setTab("newMeeting")}>
                    모임 만들기
                  </button>
                  <button className={tab === "mypage" ? "active" : ""} type="button" onClick={() => setTab("mypage")}>
                    마이페이지
                  </button>
                  <button className={tab === "admin" ? "active" : ""} type="button" onClick={() => setTab("admin")}>
                    관리자
                  </button>
                </nav>

                <div className="nav-actions">
                  <button className="btn btn-ghost" type="button" onClick={() => setTab("login")}>
                    로그인
                  </button>
                  <button className="btn btn-primary" type="button" onClick={() => setTab("newMeeting")}>
                    모임 만들기
                  </button>
                </div>
              </div>
            </header>
        )}

        <main>
          {tab === "home" && (
              <section className="page active">
                <div className="container hero">
                  <div className="hero-grid">
                    <div>
                      <div className="kicker">지역 기반 운동 모임 매칭 플랫폼</div>
                      <h1>
                        오늘 운동,
                        <br />
                        <span>혼자 말고 같이</span>
                      </h1>
                      <p className="hero-desc">
                        러닝, 풋살, 헬스, 배드민턴까지. 내 지역과 관심 운동을 선택하고 가까운 모임에 바로 참가해보세요.
                      </p>

                      <div className="search-card">
                        <label className="search-field">
                          <span>지역</span>
                          <select>
                            <option>경기 파주시</option>
                            <option>서울 마포구</option>
                            <option>서울 강남구</option>
                            <option>인천 부평구</option>
                          </select>
                        </label>

                        <label className="search-field">
                          <span>종목</span>
                          <select>
                            <option>전체 운동</option>
                            {sports.map((sport) => (
                                <option key={sport.name}>{sport.name}</option>
                            ))}
                          </select>
                        </label>

                        <button className="btn btn-dark" type="button" onClick={() => setTab("finder")}>
                          모임 찾기
                        </button>
                      </div>

                      <div className="quick-info">
                        <div>
                          <strong>328</strong>개 모임
                        </div>
                        <div>
                          <strong>8.9k</strong>명 참여
                        </div>
                        <div>
                          <strong>4.8</strong>평균 후기
                        </div>
                      </div>
                    </div>

                    <div className="preview">
                      <div className="phone">
                        <div className="phone-top">
                          <strong>내 주변 추천</strong>
                          <span className="live">모집중</span>
                        </div>

                        <div className="map">
                          <span className="pin p1" />
                          <span className="pin p2" />
                          <span className="pin p3" />
                        </div>

                        <div className="phone-list">
                          {cards.slice(0, 3).map((meeting) => (
                              <button
                                  key={meeting.id}
                                  className="phone-item"
                                  type="button"
                                  onClick={() => moveToDetail(meeting)}
                              >
                                <div className="sport-bubble">{meeting.sportCode}</div>
                                <div>
                                  <h4>{meeting.title}</h4>
                                  <p>
                                    {meeting.date} {meeting.time} · {meeting.current}/{meeting.max}명
                                  </p>
                                </div>
                              </button>
                          ))}
                        </div>
                      </div>

                      <div className="float-card">
                        <div className="avatars">
                          <span className="avatar" />
                          <span className="avatar" />
                          <span className="avatar" />
                          <span className="avatar" />
                        </div>
                        <strong>24명</strong>
                        <p>오늘 파주시에서 새롭게 운동 모임에 참여했어요.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container section">
                  <div className="section-head">
                    <div>
                      <h2>어떤 운동을 찾고 있나요?</h2>
                      <p>DB에 등록된 운동 종목을 기준으로 정확하게 필터링합니다.</p>
                    </div>
                    <button className="btn btn-ghost" type="button" onClick={() => setTab("finder")}>
                      전체 보기
                    </button>
                  </div>

                  <div className="category-row">
                    {sports.map((sport) => (
                        <button key={sport.name} className="category" type="button" onClick={() => setTab("finder")}>
                          <i>{sport.code}</i>
                          <strong>{sport.name}</strong>
                        </button>
                    ))}
                  </div>
                </div>

                <div className="container section">
                  <div className="section-head">
                    <div>
                      <h2>지금 모집 중인 모임</h2>
                      <p>가까운 지역에서 바로 참여할 수 있는 모임을 추천해드려요.</p>
                    </div>
                    <button className="btn btn-ghost" type="button" onClick={() => setTab("finder")}>
                      더보기
                    </button>
                  </div>

                  <div className="meet-grid">
                    {cards.slice(0, 3).map((meeting) => (
                        <article key={meeting.id} className="meet-card" onClick={() => moveToDetail(meeting)}>
                          <div className="cover">
                            <span className="cover-label">{meeting.sport}</span>
                          </div>

                          <div className="status-row">
                            <span className={`tag ${getStatusClass(meeting.status)}`}>{meeting.statusText}</span>
                            <span className="people">
                        {meeting.current} / {meeting.max}명
                      </span>
                          </div>

                          <h3>{meeting.title}</h3>
                          <p className="desc">{meeting.desc}</p>

                          <div className="meta">
                            <div>장소 · {meeting.place}</div>
                            <div>
                              시간 · {meeting.date} {meeting.time}
                            </div>
                          </div>
                        </article>
                    ))}
                  </div>
                </div>

                <div className="container section">
                  <div className="how">
                    <div>
                      <h2>
                        모임 참여는 간단하게,
                        <br />
                        관리는 확실하게.
                      </h2>
                      <p>운동 종목과 지역을 기준으로 모임을 찾고, 모임장은 참가 신청과 모집 상태를 관리할 수 있습니다.</p>
                    </div>

                    <div className="steps">
                      <div className="step">
                        <div className="step-num">1</div>
                        <div>
                          <strong>지역과 운동 종목 선택</strong>
                          <span>DB에 등록된 운동 종목을 기준으로 원하는 모임을 필터링합니다.</span>
                        </div>
                      </div>
                      <div className="step">
                        <div className="step-num">2</div>
                        <div>
                          <strong>모임 참가 신청</strong>
                          <span>모집 인원과 일정을 확인한 뒤 참가 신청을 보낼 수 있습니다.</span>
                        </div>
                      </div>
                      <div className="step">
                        <div className="step-num">3</div>
                        <div>
                          <strong>모임장 승인 후 참여</strong>
                          <span>모임장은 신청자를 승인하거나 거절하고 모집 상태를 변경합니다.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
          )}

          {tab === "finder" && (
              <section className="page active">
                <div className="container">
                  <div className="page-title">
                    <div>
                      <h1>모임 찾기</h1>
                      <p>좌측 카테고리, 중앙 모임 리스트, 우측 정보 패널을 가진 실제 서비스형 화면입니다.</p>
                    </div>
                    <button className="btn btn-primary" type="button" onClick={() => setTab("newMeeting")}>
                      모임 만들기
                    </button>
                  </div>
                </div>

                <div className="finder-wrap">
                  <aside className="finder-sidebar finder-panel">
                    <div className="finder-profile">
                      <div className="finder-profile-mini">
                        <div className="finder-avatar" />
                        <div>
                          <strong>게스트</strong>
                          <span>로그인하고 모임에 참여하세요</span>
                        </div>
                      </div>
                    </div>

                    <div className="finder-side-section">
                      <div className="finder-side-title">둘러보기</div>
                      {["전체 모임", "오늘 모임", "이번 주 인기", "초보 환영"].map((item, index) => (
                          <button key={item} className={`finder-side-link ${index === 0 ? "active" : ""}`} type="button">
                            <span>{item}</span>
                            <span className="finder-count">{[328, 24, 41, 86][index]}</span>
                          </button>
                      ))}
                    </div>

                    <div className="finder-side-section">
                      <div className="finder-side-title">운동 종목</div>
                      {["러닝", "헬스", "풋살", "배드민턴", "등산"].map((item, index) => (
                          <button key={item} className="finder-side-link" type="button">
                            <span>{item}</span>
                            <span className="finder-count">{[124, 86, 57, 63, 39][index]}</span>
                          </button>
                      ))}
                    </div>

                    <div className="finder-side-section">
                      <div className="finder-side-title">내 활동</div>
                      {["참가 신청", "찜한 모임", "내가 만든 모임"].map((item) => (
                          <button key={item} className="finder-side-link" type="button">
                            <span>{item}</span>
                            <span className="finder-count">0</span>
                          </button>
                      ))}
                    </div>
                  </aside>

                  <main className="finder-main">
                    <section className="finder-notice">
                      <div>
                        <h1>이번 주말, 동네에서 같이 운동할 사람을 찾아보세요.</h1>
                        <p>운동 종목과 지역을 선택하면 모집 중인 모임을 빠르게 확인할 수 있습니다.</p>
                      </div>
                      <button className="btn" type="button">
                        가까운 모임 보기
                      </button>
                    </section>

                    <section className="finder-filter finder-panel">
                      <div className="finder-tabs">
                        {["전체", "러닝", "헬스", "풋살", "농구", "배드민턴", "등산", "기타"].map((item, index) => (
                            <button key={item} className={`finder-tab ${index === 0 ? "active" : ""}`} type="button">
                              {item}
                            </button>
                        ))}
                      </div>

                      <div className="finder-filter-row">
                        <label className="finder-select">
                          <select>
                            <option>경기 파주시</option>
                            <option>서울 마포구</option>
                            <option>서울 강남구</option>
                            <option>인천 부평구</option>
                          </select>
                        </label>

                        <label className="finder-select">
                          <select>
                            <option>모집중만 보기</option>
                            <option>전체 상태</option>
                            <option>모집완료</option>
                            <option>종료된 모임</option>
                          </select>
                        </label>

                        <label className="finder-select">
                          <input type="date" />
                        </label>

                        <label className="finder-select">
                          <select>
                            <option>최신순</option>
                            <option>마감 임박순</option>
                            <option>인원 많은순</option>
                            <option>후기 좋은순</option>
                          </select>
                        </label>
                      </div>
                    </section>

                    <div className="finder-head">
                      <h2>파주시 주변 모집 중인 모임</h2>
                      <span>총 24개</span>
                    </div>

                    <section className="finder-list">
                      {cards.map((meeting) => {
                        const percent = Math.min(100, Math.round((meeting.current / meeting.max) * 100));

                        return (
                            <article key={meeting.id} className="finder-card">
                              <div>
                                <div className="finder-card-top">
                                  <span className="finder-badge blue">{meeting.sport}</span>
                                  <span className={`finder-badge ${getStatusClass(meeting.status)}`}>
                              {meeting.statusText}
                            </span>
                                  {meeting.current < meeting.max && <span className="finder-badge gray">초보 환영</span>}
                                </div>

                                <h3>{meeting.title}</h3>
                                <p className="finder-desc">{meeting.desc}</p>

                                <div className="finder-meta">
                                  <span>장소 · {meeting.place}</span>
                                  <span>
                              시간 · {meeting.date} {meeting.time}
                            </span>
                                  <span>
                              인원 · {meeting.current} / {meeting.max}명
                            </span>
                                </div>

                                <div className="finder-host">
                                  <span className="finder-mini-avatar" />
                                  호스트 {meeting.host} · 매너점수 4.8 · 후기 18개
                                </div>
                              </div>

                              <div className="finder-card-side">
                                <div>
                                  <div className="finder-date">
                                    <span>{meeting.date}</span>
                                    <strong>{meeting.time}</strong>
                                  </div>
                                  <div className="finder-progress">
                                    <i style={{ width: `${percent}%` }} />
                                  </div>
                                </div>

                                <button
                                    className={`finder-join ${meeting.status === "CLOSED" ? "closed" : ""}`}
                                    type="button"
                                    onClick={() => moveToDetail(meeting)}
                                >
                                  {meeting.status === "CLOSED" ? "모집완료" : "참가 신청"}
                                </button>
                              </div>
                            </article>
                        );
                      })}
                    </section>
                  </main>

                  <aside className="finder-rightbar">
                    <section className="finder-right-card finder-panel">
                      <h3>인기 지역</h3>
                      <div className="finder-rank-list">
                        {[
                          ["운정동", "38개"],
                          ["야당동", "27개"],
                          ["금촌동", "19개"],
                          ["문산읍", "13개"],
                        ].map(([name, count], index) => (
                            <div key={name} className="finder-rank-item">
                              <div className="finder-rank-left">
                                <span className="finder-rank-num">{index + 1}</span>
                                <strong>{name}</strong>
                              </div>
                              <span>{count}</span>
                            </div>
                        ))}
                      </div>
                    </section>

                    <section className="finder-right-card finder-panel">
                      <h3>이번 주 일정</h3>
                      <div className="finder-calendar">
                        {["월", "화", "수", "목", "금", "토", "일", "12", "13", "14", "15", "16", "17", "18"].map(
                            (day, index) => (
                                <div key={`${day}-${index}`} className={`finder-day ${[2, 4, 5, 9, 11, 12].includes(index) ? "on" : ""}`}>
                                  {day}
                                </div>
                            )
                        )}
                      </div>
                    </section>

                    <section className="finder-right-card finder-panel">
                      <h3>실시간 인기 종목</h3>
                      <div className="finder-rank-list">
                        {[
                          ["러닝", "+12"],
                          ["풋살", "+8"],
                          ["헬스", "+5"],
                          ["배드민턴", "+4"],
                        ].map(([name, count], index) => (
                            <div key={name} className="finder-rank-item">
                              <div className="finder-rank-left">
                                <span className="finder-rank-num">{index + 1}</span>
                                <strong>{name}</strong>
                              </div>
                              <span>{count}</span>
                            </div>
                        ))}
                      </div>
                    </section>

                    <section className="finder-guide">
                      <strong>처음 모임을 만드시나요?</strong>
                      <p>운동 종목, 장소, 모집 인원, 참가 승인 방식을 정하면 모임을 바로 등록할 수 있습니다.</p>
                      <button className="finder-outline" type="button" onClick={() => setTab("newMeeting")}>
                        모임 생성 가이드
                      </button>
                    </section>
                  </aside>
                </div>
              </section>
          )}

          {tab === "detail" && (
              <section className="page active">
                <div className="container">
                  <div className="detail-layout">
                    <article className="card detail-main">
                      <div className="status-row" style={{ justifyContent: "flex-start" }}>
                        <span className="tag blue">{selected.sport}</span>
                        <span className={`tag ${getStatusClass(selected.status)}`}>{selected.statusText}</span>
                        <span className="tag gray">ONE_TIME</span>
                      </div>

                      <h1>{selected.title}</h1>

                      <p className="detail-body">
                        {selected.desc}
                        <br />
                        <br />
                        참가 신청 후 모임장의 승인을 받으면 참여가 확정됩니다. 준비물과 자세한 안내는 댓글 또는
                        모임장 메시지를 통해 확인할 수 있습니다.
                      </p>

                      <div className="info-grid">
                        <div className="info-box">
                          <span>지역</span>
                          <strong>{selected.region}</strong>
                        </div>
                        <div className="info-box">
                          <span>상세 장소</span>
                          <strong>{selected.place}</strong>
                        </div>
                        <div className="info-box">
                          <span>일시</span>
                          <strong>
                            {selected.date} {selected.time}
                          </strong>
                        </div>
                        <div className="info-box">
                          <span>모집 인원</span>
                          <strong>
                            {selected.current} / {selected.max}명
                          </strong>
                        </div>
                      </div>

                      <div className="comment-box">
                        <h3>댓글 / 문의</h3>
                        <div className="comment">
                          <strong>운정헬린이</strong>
                          <p>초보도 참여 가능한가요?</p>
                        </div>
                        <div className="comment">
                          <strong>{selected.host}</strong>
                          <p>네, 초보 환영입니다. 편하게 신청해주세요.</p>
                        </div>
                      </div>
                    </article>

                    <aside className="card side-card">
                      <h3>모임장 정보</h3>
                      <div className="host" style={{ border: 0, padding: 0, margin: "12px 0 18px" }}>
                        <span className="avatar" style={{ width: 34, height: 34 }} />
                        {selected.host} · 매너점수 4.8
                      </div>

                      <p style={{ color: "var(--sub)", fontSize: 14 }}>현재 {selected.current}명이 승인되었습니다.</p>

                      <div className="member-bar">
                        <i style={{ width: `${Math.min(100, (selected.current / selected.max) * 100)}%` }} />
                      </div>

                      <button className="btn btn-primary" style={{ width: "100%", marginBottom: 10 }} type="button">
                        참가 신청
                      </button>
                      <button className="btn btn-ghost" style={{ width: "100%", marginBottom: 10 }} type="button">
                        신청 취소
                      </button>
                      <button className="btn btn-soft" style={{ width: "100%", marginBottom: 10 }} type="button">
                        신청자 관리
                      </button>
                      <button className="btn btn-ghost" style={{ width: "100%" }} type="button">
                        모임 수정
                      </button>
                    </aside>
                  </div>
                </div>
              </section>
          )}

          {tab === "newMeeting" && (
              <section className="page active">
                <div className="container">
                  <div className="page-title">
                    <div>
                      <h1>모임 만들기</h1>
                      <p>운동 종목은 DB에 저장된 리스트에서 선택하고, 모임 모집글은 MEETINGS에 저장됩니다.</p>
                    </div>
                  </div>

                  <div className="card form-card">
                    <form className="form-grid">
                      <div className="form-group full">
                        <label>제목</label>
                        <input className="input" placeholder="예: 야당역 5km 러닝 크루 모집" />
                      </div>

                      <div className="form-group">
                        <label>운동 종목</label>
                        <select className="select">
                          {sports.map((sport) => (
                              <option key={sport.name}>{sport.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>지역</label>
                        <select className="select">
                          <option>경기 파주시</option>
                          <option>서울 마포구</option>
                          <option>서울 강남구</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>상세 장소</label>
                        <input className="input" placeholder="예: 야당역 2번 출구" />
                      </div>

                      <div className="form-group">
                        <label>날짜</label>
                        <input className="input" type="date" />
                      </div>

                      <div className="form-group">
                        <label>시작 시간</label>
                        <input className="input" type="time" />
                      </div>

                      <div className="form-group">
                        <label>모집 인원</label>
                        <input className="input" type="number" min="2" defaultValue="10" />
                      </div>

                      <div className="form-group full">
                        <label>모임 방식</label>
                        <div className="radio-row">
                          <label className="chip">
                            <input type="radio" name="meetingType" defaultChecked /> 1회성 모임
                          </label>
                          <label className="chip">
                            <input type="radio" name="meetingType" /> 정기 모임
                          </label>
                        </div>
                      </div>

                      <div className="form-group full">
                        <label>모임 설명</label>
                        <textarea className="textarea" placeholder="모임 소개, 준비물, 진행 방식 등을 적어주세요." />
                      </div>

                      <div className="form-actions full">
                        <button className="btn btn-ghost" type="button" onClick={() => setTab("finder")}>
                          취소
                        </button>
                        <button className="btn btn-primary" type="button" onClick={() => setTab("finder")}>
                          등록하기
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </section>
          )}

          {tab === "login" && (
              <section className="page active" style={{ padding: 0 }}>
                <div className="login-shell">
                  <div className="login-layout">
                    <div className="login-copy">
                      <h1>
                        동네에서
                        <br />
                        <span>같이 뛰는</span>
                        <br />
                        운동 습관
                      </h1>
                      <p>러닝, 풋살, 헬스, 배드민턴까지. 가까운 사람들과 운동 모임을 만들고 참여해보세요.</p>
                    </div>

                    <section className="login-card">
                      <h2>
                        반가워요,
                        <br />
                        오늘도 같이 움직여볼까요?
                      </h2>
                      <p>로그인하고 내 주변 운동 모임을 확인하세요.</p>

                      <label className="login-input">
                        <span>●</span>
                        <input placeholder="아이디 또는 이메일" defaultValue="testuser" />
                      </label>

                      <label className="login-input">
                        <span>◆</span>
                        <input type="password" placeholder="비밀번호" defaultValue="1234" />
                      </label>

                      <div className="login-options">
                        <label>
                          <input type="checkbox" /> 아이디 저장
                        </label>
                        <label>
                          <input type="checkbox" /> 자동 로그인
                        </label>
                      </div>

                      <button className="btn btn-primary" style={{ width: "100%", height: 58 }} type="button" onClick={() => setTab("home")}>
                        로그인
                      </button>

                      <div className="login-links">
                        <button type="button">회원가입</button>
                        <span>·</span>
                        <button type="button">아이디/비밀번호 찾기</button>
                      </div>
                    </section>
                  </div>
                </div>
              </section>
          )}

          {tab === "mypage" && (
              <section className="page active">
                <div className="container">
                  <div className="page-title">
                    <div>
                      <h1>마이페이지</h1>
                      <p>내가 만든 모임, 신청한 모임, 후기 작성 가능한 모임을 확인합니다.</p>
                    </div>
                  </div>

                  <div className="card profile-card">
                    <div className="profile-left">
                      <div className="profile-avatar" />
                      <div>
                        <h2>파주러너</h2>
                        <p style={{ color: "var(--sub)" }}>경기 파주시 · 관심 운동: 러닝, 풋살</p>
                      </div>
                    </div>
                    <button className="btn btn-ghost" type="button">
                      프로필 수정
                    </button>
                  </div>

                  <div className="stat-grid">
                    <div className="card stat-card">
                      <span>내가 만든 모임</span>
                      <strong>4</strong>
                    </div>
                    <div className="card stat-card">
                      <span>신청한 모임</span>
                      <strong>3</strong>
                    </div>
                    <div className="card stat-card">
                      <span>참여 완료</span>
                      <strong>12</strong>
                    </div>
                    <div className="card stat-card">
                      <span>후기 작성 가능</span>
                      <strong>2</strong>
                    </div>
                  </div>

                  <div className="list">
                    {cards.slice(0, 3).map((meeting) => (
                        <article key={meeting.id} className="card list-card">
                          <div>
                            <div className="status-row" style={{ justifyContent: "flex-start" }}>
                              <span className={`tag ${getStatusClass(meeting.status)}`}>{meeting.statusText}</span>
                              <span className="tag blue">{meeting.sport}</span>
                            </div>
                            <h3>{meeting.title}</h3>
                            <p className="desc">{meeting.desc}</p>
                            <div className="meta-line">
                              장소 · {meeting.place} · 시간 · {meeting.date} {meeting.time}
                            </div>
                          </div>

                          <div className="list-side">
                            <button className="btn btn-ghost" type="button" onClick={() => moveToDetail(meeting)}>
                              상세
                            </button>
                            <button className="btn btn-soft" type="button">
                              후기 작성
                            </button>
                          </div>
                        </article>
                    ))}
                  </div>
                </div>
              </section>
          )}

          {tab === "admin" && (
              <section className="page active">
                <div className="container">
                  <div className="page-title">
                    <div>
                      <h1>관리자 페이지</h1>
                      <p>회원, 모임 게시글, 신고 내역, 운동 종목을 한 화면에서 관리합니다.</p>
                    </div>
                  </div>

                  <div className="stat-grid">
                    <div className="card stat-card">
                      <span>전체 회원</span>
                      <strong>1,248</strong>
                    </div>
                    <div className="card stat-card">
                      <span>등록 모임</span>
                      <strong>328</strong>
                    </div>
                    <div className="card stat-card">
                      <span>대기 신고</span>
                      <strong>7</strong>
                    </div>
                    <div className="card stat-card">
                      <span>운동 종목</span>
                      <strong>7</strong>
                    </div>
                  </div>

                  <div className="tabs">
                    <button className="tab active" type="button">회원 관리</button>
                    <button className="tab" type="button">모임 관리</button>
                    <button className="tab" type="button">신고 내역</button>
                    <button className="tab" type="button">운동 종목</button>
                  </div>

                  <div className="card table-card">
                    <table className="table">
                      <thead>
                      <tr>
                        <th>회원 ID</th>
                        <th>닉네임</th>
                        <th>지역</th>
                        <th>관심 운동</th>
                        <th>권한</th>
                        <th>상태</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr>
                        <td>U001</td>
                        <td>파주러너</td>
                        <td>경기 파주시</td>
                        <td>러닝, 풋살</td>
                        <td>USER</td>
                        <td><span className="tag green">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td>U002</td>
                        <td>운정헬린이</td>
                        <td>경기 파주시</td>
                        <td>헬스</td>
                        <td>USER</td>
                        <td><span className="tag green">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td>U003</td>
                        <td>관리자</td>
                        <td>서울 마포구</td>
                        <td>-</td>
                        <td>ADMIN</td>
                        <td><span className="tag blue">ADMIN</span></td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
          )}
        </main>
      </div>
  );
}