import { Link } from "react-router-dom";
import DashboardShell from "../components/DashboardShell";
import { meetings } from "../data/demoData";
import { meetingImages } from "../data/dashboardData";
import styles from "../styles/WeMovePages.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function MyPage() {
  return (
    <DashboardShell
      active="마이페이지"
      title="마이페이지"
      description="프로필과 활동 지표, 내가 만든 모임을 한 화면에서 관리할 수 있어요."
      aside={
        <>
          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>프로필 요약</h3>
            </div>
            <div className={styles.dashboardSimpleList}>
              <div><span>활동 지역</span><strong>경기 파주시</strong></div>
              <div><span>관심 운동</span><strong>러닝, 풋살, 등산</strong></div>
              <div><span>매너점수</span><strong>4.8 / 5.0</strong></div>
            </div>
          </section>
          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>바로가기</h3>
            </div>
            <div className={styles.dashboardQuickLinks}>
              <Link to="/meetings/new">모임 만들기</Link>
              <Link to="/activity">내 활동 보기</Link>
              <Link to="/meetings">모임 찾기</Link>
            </div>
          </section>
        </>
      }
    >
      <section className={styles.profileCard}>
        <div className={styles.profileLeft}>
          <div className={styles.profileAvatar} />
          <div>
            <h2>파주러너</h2>
            <p>경기 파주시 · 관심 운동: 러닝, 풋살, 등산</p>
          </div>
        </div>
        <button type="button">프로필 수정</button>
      </section>

      <section className={styles.dashboardStatGrid}>
        <article><span>내가 만든 모임</span><strong>4</strong></article>
        <article><span>신청한 모임</span><strong>3</strong></article>
        <article><span>참여 완료</span><strong>12</strong></article>
        <article><span>후기 작성 가능</span><strong>2</strong></article>
      </section>

      <section className={styles.tabsPanel}>
        <div className={styles.pageTabs}>
          <button className={cx("tabButton", "tabButtonActive")} type="button">내가 만든 모임</button>
          <button className={styles.tabButton} type="button">내가 신청한 모임</button>
          <button className={styles.tabButton} type="button">참여한 모임</button>
          <button className={styles.tabButton} type="button">후기 관리</button>
        </div>

        <div className={styles.myList}>
          {meetings.slice(0, 4).map((meeting) => (
            <article key={meeting.id}>
              <div className={styles.dashboardCompactBody}>
                <img src={meetingImages[meeting.id]} alt={meeting.title} className={styles.dashboardMiniImage} />
                <div>
                <span className={cx("badge", meeting.status === "CLOSED" ? "warning" : "success")}>{meeting.statusText}</span>
                {" "}
                <span className={styles.badge}>{meeting.sport}</span>
                <h3>{meeting.title}</h3>
                <p>{meeting.desc}</p>
                <small>{meeting.place} · {meeting.displayDate} {meeting.time}</small>
                </div>
              </div>
              <aside>
                <Link to={`/meetings/${meeting.id}`}>상세 보기</Link>
                <Link to={`/meetings/${meeting.id}/reviews`}>후기 작성</Link>
              </aside>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
