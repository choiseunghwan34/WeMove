import { useParams } from "react-router-dom";
import { meetings } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const applicants = [
  { id: 1, name: "러닝유나", note: "6분대 페이스로 참여 가능합니다.", status: "대기중" },
  { id: 2, name: "운정조거", note: "처음 참여하지만 꾸준히 달리고 있습니다.", status: "대기중" },
];

const approved = [
  { id: 3, name: "야당러너", note: "이전 모임 2회 참여", status: "승인됨" },
  { id: 4, name: "파주런클럽", note: "매너점수 4.9", status: "승인됨" },
];

export default function MeetingManagePage() {
  const { meetingId } = useParams();
  const meeting = meetings.find((item) => String(item.id) === meetingId) ?? meetings[0];

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <div>
          <h1>신청자 관리</h1>
          <p>{meeting.title}에 신청한 참가자를 확인하고 승인, 거절, 모집 완료 처리를 진행할 수 있습니다.</p>
        </div>
      </div>

      <section className={styles.statGrid}>
        <article><span>전체 신청</span><strong>6</strong></article>
        <article><span>승인 완료</span><strong>4</strong></article>
        <article><span>대기 인원</span><strong>2</strong></article>
        <article><span>최대 인원</span><strong>{meeting.max}</strong></article>
      </section>

      <div className={styles.subGrid}>
        <section className={styles.softPanel}>
          <h2>승인 대기</h2>
          <p>신청 메시지와 기본 정보를 확인한 뒤 승인 또는 거절할 수 있습니다.</p>
          <div className={styles.participantList}>
            {applicants.map((item) => (
              <article key={item.id} className={styles.participantCard}>
                <div className={styles.participantHead}>
                  <div className={styles.participantMeta}>
                    <strong>{item.name}</strong>
                    <p>{item.note}</p>
                  </div>
                  <span className={styles.badge}>{item.status}</span>
                </div>
                <div className={styles.participantActions}>
                  <button type="button">거절</button>
                  <button type="button">승인</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.softPanel}>
          <h2>승인된 참가자</h2>
          <p>현재 승인된 참가자를 확인하고 모집 완료 여부를 판단할 수 있습니다.</p>
          <div className={styles.participantList}>
            {approved.map((item) => (
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
            <button type="button">모집 완료 처리</button>
          </div>
        </section>
      </div>
    </div>
  );
}
