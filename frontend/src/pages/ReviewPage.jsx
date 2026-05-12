import { useState } from "react";
import { useParams } from "react-router-dom";
import { meetings } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const initialReviews = [
  { id: 1, writer: "러닝유나", rating: 5, content: "분위기가 편하고 초보도 참여하기 좋았어요. 다음에도 또 신청할 것 같아요." },
  { id: 2, writer: "야당조거", rating: 4, content: "시간 관리가 잘 됐고 모임장 안내도 깔끔했습니다. 장소 안내가 특히 좋았어요." },
];

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function ReviewPage() {
  const { meetingId } = useParams();
  const meeting = meetings.find((item) => String(item.id) === meetingId) ?? meetings[0];
  const [rating, setRating] = useState(5);

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <div>
          <h1>후기 작성</h1>
          <p>{meeting.title} 참여 경험을 남겨 다음 참가자에게 도움이 되는 정보를 전해주세요.</p>
        </div>
      </div>

      <div className={styles.subGrid}>
        <section className={styles.softPanel}>
          <h2>새 후기 남기기</h2>
          <p>모임 분위기, 진행 방식, 난이도, 참여 경험을 중심으로 솔직하게 적어주세요.</p>
          <form className={styles.stack}>
            <div>
              <span className={styles.kicker}>별점 선택</span>
              <div className={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    className={cx("ratingButton", rating === score && "ratingButtonActive")}
                    onClick={() => setRating(score)}
                  >
                    {score}점
                  </button>
                ))}
              </div>
            </div>
            <textarea
              style={{ minHeight: 180, padding: 16, border: "1px solid #e6e9ee", borderRadius: 16, resize: "vertical", outline: "none" }}
              placeholder="예: 초보자도 참여하기 편했고, 모임장이 페이스를 잘 맞춰줘서 부담 없이 끝까지 함께할 수 있었어요."
            />
            <div className={styles.formActions}>
              <button type="button">후기 등록</button>
            </div>
          </form>
        </section>

        <section className={styles.softPanel}>
          <h2>후기 목록</h2>
          <p>참가자들이 실제로 남긴 피드백을 확인할 수 있습니다.</p>
          <div className={styles.reviewList}>
            {initialReviews.map((review) => (
              <article key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHead}>
                  <div className={styles.reviewMeta}>
                    <strong>{review.writer}</strong>
                    <p>참여자 후기</p>
                  </div>
                  <span className={styles.reviewScore}>{review.rating}.0</span>
                </div>
                <p>{review.content}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
