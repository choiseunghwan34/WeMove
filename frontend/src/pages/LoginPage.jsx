import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import homeBg from "../assets/images/home-bg.webp";
import styles from "../styles/LoginPage.module.css";

const authBackgrounds = [homeBg];

const getLoginErrorMessage = (error) => {
  const serverMessage = error?.response?.data?.message;

  if (serverMessage) {
    return serverMessage;
  }

  if (error?.response) {
    return "아이디 또는 비밀번호가 올바르지 않습니다.";
  }

  return "서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.";
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loginId: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundImage = useMemo(
    () => authBackgrounds[Math.floor(Math.random() * authBackgrounds.length)],
    [],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginId = form.loginId.trim();
    const password = form.password;

    if (!loginId || !password) {
      setErrorMessage("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { data } = await login({ loginId, password });

      localStorage.setItem(
        "wemoveUser",
        JSON.stringify({
          ...data,
          memberId: data.memberId ?? data.userId,
        }),
      );
      navigate("/meetings");
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={styles.page}
      style={{ "--auth-bg-image": `url(${backgroundImage})` }}
    >
      <div className={styles.layout}>
        <section className={styles.copy}>
          <Link to="/" className={styles.logo}>
            WeMove
          </Link>
          <span className={styles.eyebrow}>LOCAL FITNESS COMMUNITY</span>
          <h1>동네 운동을 자연스럽게 이어주는 방법</h1>
          <p>
            러닝, 헬스, 풋살, 배드민턴까지. 가까운 사람들과 함께 운동
            루틴을 만들고, 모임을 찾고, 참여하고, 관리할 수 있는 지역 기반
            운동 플랫폼입니다.
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
            <h2>오늘도 가까운 사람들과 같이 움직여볼까요?</h2>
            <p>로그인하고 내 주변 운동 모임을 바로 확인해보세요.</p>
          </div>

          <label>
            <span>아이디</span>
            <input
              name="loginId"
              value={form.loginId}
              onChange={handleChange}
              placeholder="아이디 입력"
              autoComplete="username"
              disabled={isSubmitting}
            />
          </label>

          <label>
            <span>비밀번호</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </label>

          <div className={styles.options}>
            <label>
              <input type="checkbox" disabled={isSubmitting} /> 아이디 저장
            </label>
            <label>
              <input type="checkbox" disabled={isSubmitting} /> 자동 로그인
            </label>
          </div>

          {errorMessage ? (
            <p role="alert" style={{ color: "#dc2626", margin: "0" }}>
              {errorMessage}
            </p>
          ) : null}

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>

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
