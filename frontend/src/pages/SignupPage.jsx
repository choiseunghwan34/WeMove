import { Link } from "react-router-dom";
import { regions, sports } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function SignupPage() {
  return (
    <div className={cx("page", "narrow")}>
      <div className={styles.pageTitle}>
        <div>
          <h1>회원가입</h1>
          <p>내 지역과 관심 운동을 등록해두면 주변 모임을 더 빠르게 추천받을 수 있습니다.</p>
        </div>
      </div>

      <section className={styles.formIntro}>
        <h2>처음 가입해도 바로 모임을 찾을 수 있게 준비해두었습니다.</h2>
        <p>아이디와 프로필 정보, 관심 운동 종목만 입력하면 WeMove에서 바로 활동을 시작할 수 있습니다.</p>
      </section>

      <form className={styles.formCard}>
        <label>
          <span>아이디</span>
          <input placeholder="wemove_runner" />
        </label>
        <label>
          <span>이메일</span>
          <input type="email" placeholder="runner@wemove.kr" />
        </label>
        <label>
          <span>비밀번호</span>
          <input type="password" placeholder="비밀번호 입력" />
        </label>
        <label>
          <span>비밀번호 확인</span>
          <input type="password" placeholder="비밀번호 다시 입력" />
        </label>
        <label>
          <span>닉네임</span>
          <input placeholder="러너민수" />
        </label>
        <label>
          <span>지역</span>
          <select>{regions.map((region) => <option key={region}>{region}</option>)}</select>
        </label>
        <div className={`${styles.full} ${styles.choiceGroup}`}>
          <span>관심 운동 종목</span>
          <div>
            {sports.map((sport) => (
              <label key={sport.id}>
                <input type="checkbox" defaultChecked={sport.id <= 2} />
                {sport.name}
              </label>
            ))}
          </div>
        </div>
        <div className={`${styles.full} ${styles.formActions}`}>
          <Link to="/login">로그인으로</Link>
          <button type="button">가입 완료</button>
        </div>
      </form>
    </div>
  );
}
