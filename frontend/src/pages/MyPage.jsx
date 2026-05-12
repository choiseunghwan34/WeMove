import { Link } from "react-router-dom";
import { meetings } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function MyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}><div><h1>마이페이지</h1><p>내 프로필, 만든 모임, 신청한 모임, 후기 작성 가능한 모임을 확인합니다.</p></div></div>
      <section className={styles.profileCard}>
        <div className={styles.profileLeft}><div className={styles.profileAvatar} /><div><h2>파주러너</h2><p>경기 파주시 · 관심 운동: 러닝, 풋살, 등산</p></div></div>
        <button type="button">프로필 수정</button>
      </section>
      <section className={styles.statGrid}>
        <article><span>내가 만든 모임</span><strong>4</strong></article>
        <article><span>신청한 모임</span><strong>3</strong></article>
        <article><span>참여 완료</span><strong>12</strong></article>
        <article><span>후기 작성 가능</span><strong>2</strong></article>
      </section>
      <section className={styles.tabsPanel}>
        <div className={styles.pageTabs}><button className={styles.active} type="button">내가 만든 모임</button><button type="button">내가 신청한 모임</button><button type="button">참여한 모임</button><button type="button">후기 관리</button></div>
        <div className={styles.myList}>
          {meetings.slice(0, 4).map((meeting) => (
            <article key={meeting.id}>
              <div><span className={cx("badge", meeting.status === "CLOSED" ? "warning" : "success")}>{meeting.statusText}</span> <span className={styles.badge}>{meeting.sport}</span><h3>{meeting.title}</h3><p>{meeting.desc}</p><small>{meeting.place} · {meeting.displayDate} {meeting.time}</small></div>
              <aside><Link to={`/meetings/${meeting.id}`}>상세 보기</Link><Link to={`/meetings/${meeting.id}/reviews`}>후기 작성</Link></aside>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
