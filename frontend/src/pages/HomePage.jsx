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

        <aside className={styles.heroShowcase}>
          <div className={styles.heroVisualCard}>
            <div className={styles.heroVisualCopy}>
              <span>이번 주 추천</span>
              <strong>파주 야간 러닝 크루</strong>
              <small>야당역 · 20:00 · 초보 환영</small>
            </div>
          </div>
          <div className={styles.heroMiniGrid}>
            {recruitingMeetings.slice(0, 2).map((meeting) => (
              <Link key={meeting.id} className={styles.heroMiniCard} to={`/meetings/${meeting.id}`}>
                <b>{meeting.sport}</b>
                <strong>{meeting.title}</strong>
                <small>{meeting.place} · {meeting.displayDate} {meeting.time}</small>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className={styles.highlightBand}>
        <article>
          <span>내 주변 모임</span>
          <strong>지역 기반 탐색</strong>
          <p>집 근처, 회사 근처, 자주 가는 동네 기준으로 모임을 찾을 수 있습니다.</p>
        </article>
        <article>
          <span>운영 편의</span>
          <strong>신청자 승인 관리</strong>
          <p>모임장은 참가 신청, 승인, 거절, 모집 완료 처리를 한 화면에서 관리합니다.</p>
        </article>
        <article>
          <span>참여 경험</span>
          <strong>후기와 매너 중심</strong>
          <p>참여자 후기를 통해 분위기를 미리 확인하고 더 안심하고 신청할 수 있습니다.</p>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h2>인기 운동 카테고리</h2>
            <p>지금 가장 활발하게 열리는 운동 종목을 빠르게 둘러보세요.</p>
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
