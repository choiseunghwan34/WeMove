import { Link } from "react-router-dom";
import { regions, sports } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function MeetingCreatePage() {
  return (
    <div className={cx("page", "narrow")}>
      <div className={styles.pageTitle}>
        <div>
          <h1>모임 만들기</h1>
          <p>운동 종목, 장소, 일정, 모집 인원을 명확하게 작성하면 참가 신청률이 훨씬 좋아집니다.</p>
        </div>
      </div>

      <section className={styles.formIntro}>
        <h2>좋은 모임은 정보가 명확할수록 더 빨리 모입니다.</h2>
        <p>
          참가자는 제목과 시간, 장소, 분위기를 먼저 봅니다. 핵심 정보를 간결하게 적고,
          초보자 참여 여부나 준비물을 함께 적어주면 신청 전환이 더 좋아집니다.
        </p>
        <div className={styles.formHintGrid}>
          <article>
            <span>제목 작성 팁</span>
            <strong>지역 + 운동 + 시간대가 한눈에 들어오게 적기</strong>
          </article>
          <article>
            <span>장소 작성 팁</span>
            <strong>출구, 체육관명, 주차 가능 여부까지 함께 안내</strong>
          </article>
          <article>
            <span>설명 작성 팁</span>
            <strong>초보 가능 여부, 진행 방식, 준비물을 짧게 정리</strong>
          </article>
        </div>
      </section>

      <form className={styles.formCard}>
        <label className={styles.full}>
          <span>제목</span>
          <input placeholder="예: 야당역 5km 러닝 크루 모집" />
        </label>
        <label>
          <span>운동 종목</span>
          <select>{sports.map((sport) => <option key={sport.id}>{sport.name}</option>)}</select>
        </label>
        <label>
          <span>지역</span>
          <select>{regions.map((region) => <option key={region}>{region}</option>)}</select>
        </label>
        <label>
          <span>상세 장소</span>
          <input placeholder="예: 야당역 2번 출구" />
        </label>
        <label>
          <span>주소</span>
          <input placeholder="예: 경기 파주시 경의로 000" />
        </label>
        <label>
          <span>날짜</span>
          <input type="date" defaultValue="2026-05-16" />
        </label>
        <label>
          <span>시작 시간</span>
          <input type="time" defaultValue="20:00" />
        </label>
        <label>
          <span>모집 인원</span>
          <input type="number" min="2" defaultValue="10" />
        </label>
        <label>
          <span>모집 상태</span>
          <select defaultValue="RECRUITING">
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집마감</option>
          </select>
        </label>
        <div className={`${styles.full} ${styles.choiceGroup}`}>
          <span>모임 방식</span>
          <div>
            <label><input type="radio" name="meetingType" defaultChecked /> 1회성 모임</label>
            <label><input type="radio" name="meetingType" /> 정기 모임</label>
          </div>
        </div>
        <label>
          <span>반복 방식</span>
          <select defaultValue="NONE">
            <option value="NONE">없음</option>
            <option value="WEEKLY">매주</option>
            <option value="BIWEEKLY">격주</option>
            <option value="MONTHLY">매월</option>
          </select>
        </label>
        <label className={styles.full}>
          <span>모임 설명</span>
          <textarea placeholder="모임 소개, 준비물, 진행 방식, 초보자 참여 여부 등을 적어주세요." />
        </label>
        <div className={`${styles.full} ${styles.formActions}`}>
          <Link to="/meetings">취소</Link>
          <button type="button">등록하기</button>
        </div>
      </form>
    </div>
  );
}
