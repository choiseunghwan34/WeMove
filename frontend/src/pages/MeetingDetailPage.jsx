import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppModal from "../components/AppModal";
import { meetings } from "../data/demoData";
import { meetingImages } from "../data/dashboardData";
import styles from "../styles/MeetingDetailPage.module.css";

const cx = (...names) =>
  names
    .filter(Boolean)
    .map((name) => styles[name])
    .join(" ");

const comments = [
  {
    id: 1,
    writer: "러닝유나",
    content: "페이스 어느 정도로 가는지 궁금해요. 6분대도 괜찮을까요?",
    time: "방금 전",
  },
  {
    id: 2,
    writer: "야당조거",
    content: "초보도 편하게 참여 가능합니다. 출발 전에 스트레칭도 같이 해요.",
    time: "12분 전",
  },
  {
    id: 3,
    writer: "운정러너",
    content: "주차 가능한 곳이 있는지도 알려주시면 좋겠습니다.",
    time: "25분 전",
  },
];

export default function MeetingDetailPage() {
  const { meetingId } = useParams();
  const meeting =
    meetings.find((item) => String(item.id) === meetingId) ?? meetings[0];
  const isClosed = meeting.status === "CLOSED";
  const [modalType, setModalType] = useState(null);
  const closeModal = () => setModalType(null);

  return (
    <div className={styles.page}>
      <div className={styles.detailLayout}>
        <main className={styles.detailMain}>
          <section className={styles.detailHero}>
            <div className={styles.detailHeroImageWrap}>
              <img
                src={meetingImages[meeting.id]}
                alt={meeting.title}
                className={styles.detailHeroImage}
              />
            </div>
            <div className={styles.detailCover}>
              <div className={styles.detailBadges}>
                <span className={styles.badge}>{meeting.sport}</span>
                <span className={cx("badge", isClosed ? "warning" : "success")}>
                  {meeting.statusText}
                </span>
              </div>
              <h1>{meeting.title}</h1>
              <p>{meeting.desc}</p>
            </div>

            <div className={styles.detailSummary}>
              <article>
                <span>지역</span>
                <strong>{meeting.region}</strong>
              </article>
              <article>
                <span>상세 장소</span>
                <strong>{meeting.place}</strong>
              </article>
              <article>
                <span>일시</span>
                <strong>
                  2026.{meeting.displayDate} {meeting.time}
                </strong>
              </article>
              <article>
                <span>참가 인원</span>
                <strong>
                  {meeting.current}/{meeting.max}명
                </strong>
              </article>
            </div>
          </section>

          <section className={styles.detailSection}>
            <div className={styles.sectionHead}>
              <div>
                <h2>모임 소개</h2>
                <p>참여 전에 꼭 확인하면 좋은 모임 정보입니다.</p>
              </div>
            </div>
            <div className={styles.detailBody}>
              <p>
                {meeting.desc} 러닝 이후에는 간단한 정리 운동까지 함께 진행하고,
                처음 오시는 분도 어색하지 않도록 출발 전 가벼운 인사 시간을
                가집니다.
              </p>
              <ul className={styles.detailChecklist}>
                <li>모임 방식: 1회성 모임</li>
                <li>반복 방식: 없음</li>
                <li>준비물: 편한 운동복, 물, 개인 이어폰</li>
                <li>진행 안내: 시작 10분 전 집결 권장</li>
              </ul>
            </div>
          </section>

          <section className={styles.detailSection}>
            <div className={styles.sectionHead}>
              <div>
                <h2>댓글</h2>
                <p>참여 전 궁금한 점을 편하게 남겨보세요.</p>
              </div>
            </div>

            <div className={styles.commentList}>
              {comments.map((comment) => (
                <article key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentAvatar} />
                  <div>
                    <div className={styles.commentMeta}>
                      <strong>{comment.writer}</strong>
                      <span>{comment.time}</span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                </article>
              ))}
            </div>

            <form className={styles.commentForm}>
              <textarea placeholder="모임장에게 궁금한 점이나 참여 전에 확인하고 싶은 내용을 남겨보세요." />
              <div className={styles.formActions}>
                <button type="button">댓글 등록</button>
              </div>
            </form>
          </section>
        </main>

        <aside className={styles.detailSidebar}>
          <section className={styles.detailPanel}>
            <h3>모임장 정보</h3>
            <div className={styles.hostCard}>
              <div className={styles.profileAvatar} />
              <div>
                <strong>{meeting.host}</strong>
                <p>러닝 · 매너점수 4.8 · 응답 빠름</p>
              </div>
            </div>
            <div className={styles.sideInfo}>
              <p>
                <span>모집 상태</span>
                <b>{meeting.statusText}</b>
              </p>
              <p>
                <span>현재 참가자</span>
                <b>{meeting.current}명</b>
              </p>
              <p>
                <span>최대 인원</span>
                <b>{meeting.max}명</b>
              </p>
            </div>
            <div className={styles.stickyActions}>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={isClosed}
                onClick={() => !isClosed && setModalType("apply")}
              >
                {isClosed ? "신청 마감" : "참가 신청"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setModalType("cancel")}
              >
                신청 취소
              </button>
              <Link
                to={`/meetings/${meeting.id}/edit`}
                className={styles.secondaryButton}
              >
                모임 수정
              </Link>
              <Link
                to={`/meetings/${meetingId}/manage`}
                className={styles.secondaryButton}
              >
                신청자 관리
              </Link>
            </div>
          </section>
        </aside>
      </div>

      <AppModal
        open={modalType === "apply"}
        eyebrow="참가 신청"
        title="이 모임에 참가 신청할까요?"
        description="신청 전에 일정과 준비물을 한 번 더 확인해 주세요. 모임장이 승인하면 참여가 확정됩니다."
        confirmText="참가 신청하기"
        onClose={closeModal}
        onConfirm={closeModal}
      >
        <div className={styles.modalMeetingCard}>
          <img src={meetingImages[meeting.id]} alt={meeting.title} />
          <div>
            <span>
              {meeting.sport} · {meeting.statusText}
            </span>
            <strong>{meeting.title}</strong>
            <p>
              {meeting.region} · {meeting.place}
            </p>
          </div>
        </div>
        <dl className={styles.modalInfoList}>
          <div>
            <dt>일시</dt>
            <dd>
              2026.{meeting.displayDate} {meeting.time}
            </dd>
          </div>
          <div>
            <dt>모임 방식</dt>
            <dd>1회성 모임</dd>
          </div>
          <div>
            <dt>반복 방식</dt>
            <dd>없음</dd>
          </div>
          <div>
            <dt>준비물</dt>
            <dd>편한 운동복, 물, 개인 이어폰</dd>
          </div>
          <div>
            <dt>진행 안내</dt>
            <dd>시작 10분 전 집결 권장</dd>
          </div>
        </dl>
      </AppModal>

      <AppModal
        open={modalType === "cancel"}
        eyebrow="신청 취소"
        title="참가 신청을 취소할까요?"
        description="취소하면 다시 신청해야 하며, 모임장에게 신청 취소 상태로 표시됩니다."
        confirmText="신청 취소하기"
        tone="danger"
        onClose={closeModal}
        onConfirm={closeModal}
      >
        <div className={styles.modalNotice}>
          <strong>{meeting.title}</strong>
          <p>
            이미 승인된 일정이라면 모임장에게 간단한 사유를 남기는 것이 좋아요.
          </p>
        </div>
      </AppModal>
    </div>
  );
}
