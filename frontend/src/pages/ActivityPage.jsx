import { Link } from "react-router-dom";
import DashboardShell from "../components/DashboardShell";
import UiIcon from "../components/UiIcon";
import { meetings } from "../data/demoData";
import { meetingImages } from "../data/dashboardData";
import styles from "../styles/ActivityPage.module.css";

const activityItems = [
  { label: "참여 예정", value: "3회" },
  { label: "참여 완료", value: "12회" },
  { label: "내가 만든 모임", value: "4개" },
  { label: "이번 달 운동", value: "18시간" },
];

const activityFeed = [
  { title: "야당역 러닝 크루에 참가 신청했어요.", meta: "오늘 · 러닝", time: "5분 전" },
  { title: "운정 헬스 모임이 승인되었어요.", meta: "어제 · 헬스", time: "1일 전" },
  { title: "금촌 풋살 팀 후기를 남겼어요.", meta: "지난주 · 풋살", time: "4일 전" },
];

export default function ActivityPage() {
  return (
    <DashboardShell
      active="내 활동"
      title="내 활동"
      description="신청한 모임, 참여 기록, 최근 활동을 한 화면에서 확인할 수 있어요."
      aside={
        <>
          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>이번 주 목표</h3>
            </div>
            <div className={styles.dashboardSimpleList}>
              <div><span>운동 횟수</span><strong>3 / 4회</strong></div>
              <div><span>참여 모임</span><strong>2 / 2개</strong></div>
              <div><span>활동 시간</span><strong>5.5시간</strong></div>
            </div>
          </section>
          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>최근 활동</h3>
            </div>
            <div className={styles.dashboardActivityList}>
              {activityFeed.map((item) => (
                <div key={item.title} className={styles.dashboardActivityItem}>
                  <i><UiIcon name="activity" className={styles.dashboardActivityGlyph} /></i>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.meta}</p>
                  </div>
                  <span>{item.time}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      }
    >
      <section className={styles.dashboardStatGrid}>
        {activityItems.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.dashboardPanel}>
        <div className={styles.dashboardSectionHead}>
          <div>
            <h2>참여 예정 모임</h2>
            <p className={styles.dashboardSectionCopy}>다가오는 일정과 신청 상태를 빠르게 확인하세요.</p>
          </div>
          <Link to="/meetings">모임 더 보기</Link>
        </div>
        <div className={styles.dashboardCompactList}>
          {meetings.slice(0, 3).map((meeting) => (
            <Link key={meeting.id} to={`/meetings/${meeting.id}`} className={styles.dashboardCompactCard}>
              <div className={styles.dashboardCompactBody}>
                <img src={meetingImages[meeting.id]} alt={meeting.title} className={styles.dashboardMiniImage} />
                <div>
                <div className={styles.dashboardMeetingBadges}>
                  <span>{meeting.sport}</span>
                  <span className={styles.dashboardStatusBadge}>{meeting.statusText}</span>
                </div>
                <h3>{meeting.title}</h3>
                <p>{meeting.place} · {meeting.displayDate} {meeting.time}</p>
                </div>
              </div>
              <strong>{meeting.current}/{meeting.max}명</strong>
            </Link>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
