import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem(
      "wemoveUser",
      JSON.stringify({ memberId: 1, loginId: "user01", nickname: "러너민수", role: "USER" })
    );
    navigate("/meetings");
  };

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <section className={styles.copy}>
          <Link to="/" className={styles.logo}>WeMove</Link>
          <h1>동네에서 같이 하는 운동 습관</h1>
          <p>
            러닝, 헬스, 풋살, 배드민턴까지. 가까운 사람들과 자연스럽게 운동을 이어갈 수 있는
            모임을 만나보세요.
          </p>
        </section>

        <form className={styles.card} onSubmit={handleSubmit}>
          <h2>오늘은 누구와 같이 움직여볼까요?</h2>
          <p>로그인하고 내 주변 운동 모임을 바로 확인해보세요.</p>

          <label>
            <span>아이디 또는 이메일</span>
            <input placeholder="user01" defaultValue="user01" />
          </label>

          <label>
            <span>비밀번호</span>
            <input type="password" placeholder="1234" defaultValue="1234" />
          </label>

          <div className={styles.options}>
            <label><input type="checkbox" /> 아이디 저장</label>
            <label><input type="checkbox" /> 자동 로그인</label>
          </div>

          <button className={styles.submit} type="submit">로그인</button>

          <div className={styles.links}>
            <Link to="/signup">회원가입</Link>
            <span>·</span>
            <button type="button">아이디/비밀번호 찾기</button>
          </div>
        </form>
      </div>
    </main>
  );
}
