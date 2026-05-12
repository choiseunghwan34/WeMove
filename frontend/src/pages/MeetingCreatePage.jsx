import { Link } from "react-router-dom";
import { regions, sports } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function MeetingCreatePage() {
  return (
    <div className={cx("page", "narrow")}>
      <div className={styles.pageTitle}>
        <div><h1>모임 만들기</h1><p>운동 종목, 장소, 일정, 모집 인원을 정확히 작성하면 참가 신청이 더 잘 들어옵니다.</p></div>
      </div>
      <form className={styles.formCard}>
        <label className={styles.full}><span>제목</span><input placeholder="예: 야당역 5km 러닝 크루 모집" /></label>
        <label><span>운동 종목</span><select>{sports.map((sport) => <option key={sport.id}>{sport.name}</option>)}</select></label>
        <label><span>지역</span><select>{regions.map((region) => <option key={region}>{region}</option>)}</select></label>
        <label><span>상세 장소</span><input placeholder="예: 야당역 2번 출구" /></label>
        <label><span>주소</span><input placeholder="예: 경기 파주시 야당동 000" /></label>
        <label><span>날짜</span><input type="date" defaultValue="2026-05-16" /></label>
        <label><span>시작 시간</span><input type="time" defaultValue="20:00" /></label>
        <label><span>모집 인원</span><input type="number" min="2" defaultValue="10" /></label>
        <label><span>모집 상태</span><select defaultValue="RECRUITING"><option value="RECRUITING">모집중</option><option value="CLOSED">모집마감</option></select></label>
        <div className={cx("full", "choiceGroup")}><span>모임 방식</span><div><label><input type="radio" name="meetingType" defaultChecked /> 1회성 모임</label><label><input type="radio" name="meetingType" /> 정기 모임</label></div></div>
        <label><span>반복 방식</span><select defaultValue="NONE"><option value="NONE">없음</option><option value="WEEKLY">매주</option><option value="BIWEEKLY">격주</option><option value="MONTHLY">매월</option></select></label>
        <label className={styles.full}><span>모임 설명</span><textarea placeholder="모임 소개, 준비물, 진행 방식, 초보자 환영 여부 등을 적어주세요." /></label>
        <div className={cx("full", "formActions")}><Link to="/meetings">취소</Link><button type="button">등록하기</button></div>
      </form>
    </div>
  );
}
