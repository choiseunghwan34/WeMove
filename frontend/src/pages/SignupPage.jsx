import { Link, useNavigate } from "react-router-dom";
import { regions, sports } from "../data/demoData";
import styles from "../styles/SignupPage.module.css";

export default function SignupPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/login");
  };

  return (
    <main className={styles.page}>
      <div className={`${styles.layout} ${styles.signupLayout}`}>
        <section className={styles.copy}>
          <Link to="/" className={styles.logo}>WeMove</Link>
          <span className={styles.eyebrow}>JOIN WEMOVE</span>
          <h1>내 지역과 관심 운동으로 시작하는 새로운 루틴</h1>
          <p>
            프로필과 관심 운동 종목만 등록하면 내 주변 모임을 훨씬 더 빠르게 찾을 수 있습니다.
            처음 가입해도 바로 참여 흐름이 이어지도록 설계했습니다.
          </p>

          <div className={styles.metrics}>
            <article>
              <strong>러닝</strong>
              <span>출근 전부터 퇴근 후까지</span>
            </article>
            <article>
              <strong>풋살</strong>
              <span>팀이 없어도 가볍게</span>
            </article>
            <article>
              <strong>등산</strong>
              <span>주말 루틴까지 자연스럽게</span>
            </article>
          </div>
        </section>

        <form className={`${styles.card} ${styles.signupCard}`} onSubmit={handleSubmit}>
          <div className={styles.cardHead}>
            <span className={styles.cardKicker}>회원가입</span>
            <h2>프로필을 만들고 바로 시작하세요</h2>
            <p>기본 정보와 관심 운동만 입력하면 WeMove 활동 준비가 끝납니다.</p>
          </div>

          <div className={styles.signupSection}>
            <div className={styles.fieldGrid}>
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
                <select defaultValue={regions[0]}>
                  {regions.map((region) => <option key={region}>{region}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className={`${styles.choiceBlock} ${styles.signupSection}`}>
            <span>관심 운동 종목</span>
            <div className={styles.choiceList}>
              {sports.map((sport) => (
                <label key={sport.id} className={styles.choiceChip}>
                  <input type="checkbox" defaultChecked={sport.id <= 2} />
                  {sport.name}
                </label>
              ))}
            </div>
          </div>

          <button className={styles.submit} type="submit">가입 완료</button>

          <div className={styles.links}>
            <Link to="/login">이미 계정이 있어요</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
