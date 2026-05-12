import { Link, useParams } from "react-router-dom";
import { meetings, regions, sports } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function MeetingEditPage() {
  const { meetingId } = useParams();
  const meeting = meetings.find((item) => String(item.id) === meetingId) ?? meetings[0];

  return (
    <div className={cx("page", "narrow")}>
      <div className={styles.pageTitle}>
        <div>
          <h1>모임 수정</h1>
          <p>기존 참가자들이 혼란스럽지 않도록 변경 사항이 한눈에 보이도록 정리해보세요.</p>
        </div>
      </div>

      <section className={styles.formIntro}>
        <h2>현재 등록된 정보를 바탕으로 필요한 항목만 빠르게 수정하세요.</h2>
        <p>일정, 장소, 인원, 모집 상태를 조정해 모임 운영을 더 매끄럽게 이어갈 수 있습니다.</p>
      </section>

      <form className={styles.formCard}>
        <label className={styles.full}>
          <span>제목</span>
          <input defaultValue={meeting.title} />
        </label>
        <label>
          <span>운동 종목</span>
          <select defaultValue={meeting.sport}>{sports.map((sport) => <option key={sport.id}>{sport.name}</option>)}</select>
        </label>
        <label>
          <span>지역</span>
          <select defaultValue={meeting.region}>{regions.map((region) => <option key={region}>{region}</option>)}</select>
        </label>
        <label>
          <span>상세 장소</span>
          <input defaultValue={meeting.place} />
        </label>
        <label>
          <span>날짜</span>
          <input type="date" defaultValue="2026-05-16" />
        </label>
        <label>
          <span>시작 시간</span>
          <input type="time" defaultValue={meeting.time} />
        </label>
        <label>
          <span>모집 인원</span>
          <input type="number" min="2" defaultValue={meeting.max} />
        </label>
        <label>
          <span>모집 상태</span>
          <select defaultValue={meeting.status}>
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집마감</option>
            <option value="COMPLETED">종료</option>
            <option value="CANCELLED">취소</option>
          </select>
        </label>
        <label className={styles.full}>
          <span>모임 설명</span>
          <textarea defaultValue={meeting.desc} />
        </label>
        <div className={`${styles.full} ${styles.formActions}`}>
          <Link to={`/meetings/${meeting.id}`}>취소</Link>
          <button type="button">수정 저장</button>
        </div>
      </form>
    </div>
  );
}
