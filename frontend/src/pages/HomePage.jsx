import { Link } from "react-router-dom";
import { meetings, regions, sports } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function HomePage() {
  const recruitingMeetings = meetings.filter((meeting) => meeting.status === "RECRUITING");

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>지역 기반 운동 모임 매칭 플랫폼</p>
          <h1>
            오늘 운동,
            <br />
            <strong>혼자 말고 같이</strong>
          </h1>
          <p>
            내 주변 운동 모임을 빠르게 찾고, 참가 신청하고, 모임장이 승인까지 관리할 수 있는
            지역 기반 운동 플랫폼입니다.
          </p>

          <div className={styles.searchCard}>
            <label>
              <span>지역</span>
              <select>{regions.map((region) => <option key={region}>{region}</option>)}</select>
            </label>
            <label>
              <span>종목</span>
              <select>
                <option>전체 운동</option>
                {sports.map((sport) => <option key={sport.id}>{sport.name}</option>)}
              </select>
            </label>
            <Link to="/meetings" className={styles.primaryLink}>모임 찾기</Link>
          </div>

          <div className={styles.metrics}>
            <span><strong>328</strong>개 모임</span>
            <span><strong>8.9k</strong>명 참여</span>
            <span><strong>4.8</strong>평균 후기</span>
          </div>
        </div>

        <aside className={styles.phonePreview}>
          <div className={styles.mapPreview}><i /><i /><i /></div>
          {recruitingMeetings.slice(0, 3).map((meeting) => (
            <Link key={meeting.id} className={styles.phoneItem} to={`/meetings/${meeting.id}`}>
              <b>{meeting.code}</b>
              <span>
                <strong>{meeting.title}</strong>
                <small>{meeting.displayDate} {meeting.time} · {meeting.current}/{meeting.max}명</small>
              </span>
            </Link>
          ))}
        </aside>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h2>인기 운동 카테고리</h2>
            <p>내 주변에서 자주 열리는 운동 종목을 빠르게 둘러보세요.</p>
          </div>
          <Link to="/meetings">전체 보기</Link>
        </div>
        <div className={styles.categoryGrid}>
          {sports.map((sport) => (
            <Link key={sport.id} to="/meetings">
              <span>{sport.code}</span>
              <strong>{sport.name}</strong>
              <small>{sport.count}개 모임</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h2>모집 중인 모임</h2>
            <p>가까운 지역에서 바로 참여할 수 있는 모임을 추천해드릴게요.</p>
          </div>
          <Link to="/meetings">더 보기</Link>
        </div>
        <div className={styles.cardGrid}>
          {recruitingMeetings.slice(0, 3).map((meeting) => (
            <Link key={meeting.id} className={styles.meetingCard} to={`/meetings/${meeting.id}`}>
              <div className={styles.cover}><span>{meeting.sport}</span></div>
              <div className={styles.cardMeta}>
                <span className={cx("badge", "success")}>{meeting.statusText}</span>
                <small>{meeting.current}/{meeting.max}명</small>
              </div>
              <h3>{meeting.title}</h3>
              <p>{meeting.desc}</p>
              <footer>{meeting.place} · {meeting.displayDate} {meeting.time}</footer>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.how}>
        <div>
          <h2>참여는 간단하게, 운영은 체계적으로.</h2>
          <p>
            운동 종목과 지역을 기준으로 모임을 찾고, 모임장은 신청자와 모집 상태를 한 화면에서
            관리할 수 있습니다.
          </p>
        </div>
        <ol>
          <li><strong>지역과 운동 종목 선택</strong><span>원하는 조건으로 모임을 빠르게 좁혀볼 수 있습니다.</span></li>
          <li><strong>모임 참가 신청</strong><span>일정과 인원을 확인한 뒤 간단히 신청을 보냅니다.</span></li>
          <li><strong>모임장 승인 후 참여</strong><span>승인되면 바로 일정에 맞춰 준비할 수 있습니다.</span></li>
        </ol>
      </section>
    </div>
  );
}
