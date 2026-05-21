import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";
import homeBg from "../assets/images/home-bg.webp";
import {
  clearRememberedLoginId,
  getRememberedLoginId,
  setRememberedLoginId,
} from "../utils/rememberedLogin";
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
  const { setAuthenticatedUser } = useAuth();
  const [form, setForm] = useState({
    loginId: "",
    password: "",
  });
  const [rememberLoginId, setRememberLoginId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedLoginId = getRememberedLoginId();
    if (savedLoginId) {
      setForm((current) => ({ ...current, loginId: savedLoginId }));
      setRememberLoginId(true);
    }
  }, []);

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
      const { data } = await login({ loginId, password, autoLogin });

      if (rememberLoginId) {
        setRememberedLoginId(loginId);
      } else {
        clearRememberedLoginId();
      }

      setAuthenticatedUser(data);
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
            러닝, 풋살, 실내, 배드민턴까지. 가까운 사람들과 함께 운동 루틴을
            만들고 모임을 찾고, 참여하고, 관리할 수 있는 지역 기반 운동
            플랫폼입니다.
          </p>

          <div className={styles.metrics}>
            <article>
              <strong>328+</strong>
              <span>생성 모임</span>
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
            <h2>오늘은 가까운 사람들과 같이 움직여볼까요?</h2>
            <p>로그인하고 이번 주 운동 모임을 바로 확인해보세요.</p>
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
              <input
                type="checkbox"
                checked={rememberLoginId}
                onChange={(event) => setRememberLoginId(event.target.checked)}
                disabled={isSubmitting}
              />
              아이디 저장
            </label>
            <label>
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(event) => setAutoLogin(event.target.checked)}
                disabled={isSubmitting}
              />
              자동 로그인
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
