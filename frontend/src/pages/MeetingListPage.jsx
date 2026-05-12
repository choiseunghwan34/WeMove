import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { meetings, regions, sports } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function MeetingListPage() {
  const [sport, setSport] = useState("전체");
  const [region, setRegion] = useState("전체 지역");
  const [status, setStatus] = useState("전체 상태");
  const [keyword, setKeyword] = useState("");

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const q = keyword.trim();
      return (sport === "전체" || meeting.sport === sport)
        && (region === "전체 지역" || meeting.region === region)
        && (status === "전체 상태" || meeting.statusText === status)
        && (!q || meeting.title.includes(q) || meeting.place.includes(q) || meeting.desc.includes(q));
    });
  }, [sport, region, status, keyword]);

  return (
    <div className={styles.finderLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.profileMini}><div className={styles.avatar} /><div><strong>게스트 사용자</strong><span>로그인하고 모임에 참여하세요</span></div></div>
        <section><h3>둘러보기</h3>{["전체 모임", "오늘 모임", "이번 주 인기", "초보 환영"].map((item, index) => <button key={item} className={index === 0 ? styles.active : ""} type="button"><span>{item}</span><small>{[328, 24, 41, 86][index]}</small></button>)}</section>
        <section><h3>운동 종목</h3>{sports.map((item) => <button key={item.id} type="button" onClick={() => setSport(item.name)}><span>{item.name}</span><small>{item.count}</small></button>)}</section>
        <section><h3>내 활동</h3>{["참가 신청", "찜한 모임", "내가 만든 모임"].map((item) => <button key={item} type="button"><span>{item}</span><small>0</small></button>)}</section>
      </aside>

      <main>
        <section className={styles.notice}><div><h1>이번 주말, 동네에서 같이 운동할 사람을 찾아보세요.</h1><p>운동 종목과 지역을 선택하면 모집 중인 모임을 빠르게 확인할 수 있습니다.</p></div><Link to="/meetings/new">모임 만들기</Link></section>
        <section className={styles.filterPanel}>
          <div className={styles.tabs}>{["전체", ...sports.map((item) => item.name), "기타"].map((item) => <button key={item} className={sport === item ? styles.active : ""} type="button" onClick={() => setSport(item)}>{item}</button>)}</div>
          <div className={styles.filterRow}>
            <select value={region} onChange={(event) => setRegion(event.target.value)}><option>전체 지역</option>{regions.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={status} onChange={(event) => setStatus(event.target.value)}><option>전체 상태</option><option>모집중</option><option>모집마감</option></select>
            <input type="date" />
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="제목, 장소 검색" />
          </div>
        </section>
        <div className={styles.listHead}><h2>파주시 주변 모임</h2><span>총 {filteredMeetings.length}개</span></div>
        <section className={styles.meetingList}>
          {filteredMeetings.map((meeting) => (
            <Link key={meeting.id} className={styles.listCard} to={`/meetings/${meeting.id}`}>
              <div>
                <div className={styles.listTags}><span className={styles.badge}>{meeting.sport}</span><span className={cx("badge", meeting.status === "CLOSED" ? "warning" : "success")}>{meeting.statusText}</span></div>
                <h3>{meeting.title}</h3><p>{meeting.desc}</p>
                <div className={styles.listMeta}><span>{meeting.region}</span><span>{meeting.place}</span><span>{meeting.current}/{meeting.max}명</span></div>
                <div className={styles.host}><i /><span>{meeting.host} · 매너점수 4.8</span></div>
              </div>
              <aside><div className={styles.dateBox}><span>{meeting.displayDate}</span><strong>{meeting.time}</strong></div><button type="button" className={meeting.status === "CLOSED" ? styles.closed : ""}>{meeting.status === "CLOSED" ? "마감" : "참가 신청"}</button></aside>
            </Link>
          ))}
        </section>
      </main>

      <aside className={styles.rightbar}>
        <section><h3>인기 지역</h3>{["운정동", "야당동", "금촌동", "문산읍"].map((item, index) => <p key={item}><b>{index + 1}</b>{item}<span>{[38, 27, 19, 13][index]}개</span></p>)}</section>
        <section><h3>이번 주 일정</h3><div className={styles.calendar}>{["월", "화", "수", "목", "금", "토", "일", "12", "13", "14", "15", "16", "17", "18"].map((day, index) => <span key={`${day}-${index}`} className={[2, 4, 5, 9, 11, 12].includes(index) ? styles.on : ""}>{day}</span>)}</div></section>
        <section><h3>실시간 인기 종목</h3>{["러닝", "풋살", "헬스", "배드민턴"].map((item, index) => <p key={item}><b>{index + 1}</b>{item}<span>+{[12, 8, 5, 4][index]}</span></p>)}</section>
        <section><h3>모임 생성 가이드</h3><p className={styles.guideText}>제목, 장소, 날짜, 모집 인원을 구체적으로 작성하면 신청률이 높아집니다.</p><Link to="/meetings/new">가이드 보기</Link></section>
      </aside>
    </div>
  );
}
