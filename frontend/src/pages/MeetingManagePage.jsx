import { Link, useParams } from "react-router-dom";
import { meetings } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const pendingApplicants = [
  { id: 1, name: "러닝하나", note: "6분 페이스로 편하게 참여 가능합니다.", status: "대기중" },
  { id: 2, name: "운정조거", note: "처음 참여하지만 꾸준히 달리고 있습니다.", status: "대기중" },
  { id: 3, name: "파주크루", note: "주말 러닝 모임 경험이 여러 번 있습니다.", status: "대기중" },
];

const approvedApplicants = [
  { id: 4, name: "야당러너", note: "이전 모임 2회 참여 · 매너점수 4.8", status: "승인 완료" },
  { id: 5, name: "주말러닝", note: "지각 없이 꾸준히 참여하는 멤버", status: "승인 완료" },
];

export default function MeetingManagePage() {
  const { meetingId } = useParams();
  const meeting = meetings.find((item) => String(item.id) === meetingId) ?? meetings[0];

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <div>
          <h1>신청자 관리</h1>
          <p>{meeting.title}에 참가 신청한 사람들을 확인하고 승인, 보류, 마감 처리를 한 화면에서 관리하세요.</p>
        </div>
      </div>

      <section className={styles.statGrid}>
        <article><span>전체 신청</span><strong>7</strong></article>
        <article><span>승인 완료</span><strong>4</strong></article>
        <article><span>대기 인원</span><strong>3</strong></article>
        <article><span>최대 인원</span><strong>{meeting.max}</strong></article>
      </section>

      <div className={styles.subGrid}>
        <section className={styles.softPanel}>
          <h2>승인 대기</h2>
          <p>참가 메시지와 기본 정보를 보고 바로 승인하거나 보류할 수 있습니다.</p>
          <div className={styles.participantList}>
            {pendingApplicants.map((item) => (
              <article key={item.id} className={styles.participantCard}>
                <div className={styles.participantHead}>
                  <div className={styles.participantMeta}>
                    <strong>{item.name}</strong>
                    <p>{item.note}</p>
                  </div>
                  <span className={styles.badge}>{item.status}</span>
                </div>
                <div className={styles.participantActions}>
                  <button type="button">보류</button>
                  <button type="button">승인</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.softPanel}>
          <h2>승인된 참가자</h2>
          <p>현재 승인된 멤버를 보고 마감 여부를 결정하거나 세부 관리를 이어갈 수 있습니다.</p>
          <div className={styles.participantList}>
            {approvedApplicants.map((item) => (
              <article key={item.id} className={styles.participantCard}>
                <div className={styles.participantHead}>
                  <div className={styles.participantMeta}>
                    <strong>{item.name}</strong>
                    <p>{item.note}</p>
                  </div>
                  <span className={styles.reviewScore}>{item.status}</span>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.formActions}>
            <Link to={`/meetings/${meeting.id}`}>상세로 돌아가기</Link>
            <button type="button">모집 마감 처리</button>
          </div>
        </section>
      </div>
    </div>
  );
}
