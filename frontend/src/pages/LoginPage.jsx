import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import homeBg from "../assets/images/home-bg.webp";
import styles from "../styles/LoginPage.module.css";

const authBackgrounds = [homeBg];

export default function LoginPage() {
  const navigate = useNavigate();
  const backgroundImage = useMemo(
    () => authBackgrounds[Math.floor(Math.random() * authBackgrounds.length)],
    []
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem(
      "wemoveUser",
      JSON.stringify({ memberId: 1, loginId: "user01", nickname: "러너민수", role: "USER" })
    );
    navigate("/meetings");
  };

  return (
    <main
      className={styles.page}
      style={{ "--auth-bg-image": `url(${backgroundImage})` }}
    >
      <div className={styles.layout}>
        <section className={styles.copy}>
          <Link to="/" className={styles.logo}>WeMove</Link>
          <span className={styles.eyebrow}>LOCAL FITNESS COMMUNITY</span>
          <h1>동네 운동이 더 자연스럽게 이어지는 방식</h1>
          <p>
            러닝, 헬스, 풋살, 배드민턴까지. 가까운 사람들과 함께 운동 루틴을 만들고,
            모임을 찾고, 참여하고, 관리할 수 있는 지역 기반 운동 플랫폼입니다.
          </p>

          <div className={styles.metrics}>
            <article>
              <strong>328+</strong>
              <span>활성 모임</span>
            </article>
            <article>
              <strong>8.9K</strong>
              <span>누적 참여</span>
            </article>
            <article>
              <strong>4.8</strong>
              <span>평균 만족도</span>
            </article>
          </div>
        </section>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHead}>
            <span className={styles.cardKicker}>로그인</span>
            <h2>오늘은 누구와 같이 움직여볼까요?</h2>
            <p>로그인하고 내 주변 운동 모임을 바로 확인해보세요.</p>
          </div>

          <label>
            <span>아이디 또는 이메일</span>
            <input placeholder="user01" defaultValue="user01" />
          </label>

          <label>
            <span>비밀번호</span>
            <input type="password" placeholder="비밀번호 입력" defaultValue="1234" />
          </label>

          <div className={styles.options}>
            <label><input type="checkbox" /> 아이디 저장</label>
            <label><input type="checkbox" /> 자동 로그인</label>
          </div>

          <button className={styles.submit} type="submit">로그인</button>

          <div className={styles.links}>
            <Link to="/signup">회원가입</Link>
            <span>·</span>
            <Link to="/find-account">아이디/비밀번호 찾기</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
