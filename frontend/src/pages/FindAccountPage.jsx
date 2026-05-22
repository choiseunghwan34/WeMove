import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import homeBg from "../assets/images/home-bg.webp";
import WeMoveLogo from "../components/WeMoveLogo";
import styles from "../styles/FindAccountPage.module.css";

const authBackgrounds = [homeBg];

export default function FindAccountPage() {
  const [mode, setMode] = useState("id");
  const [resultMessage, setResultMessage] = useState("");
  const backgroundImage = useMemo(
    () => authBackgrounds[Math.floor(Math.random() * authBackgrounds.length)],
    [],
  );

  const handleFindId = (event) => {
    event.preventDefault();
    setResultMessage(
      "인증이 완료되었습니다. 가입된 아이디는 wemove_runner 입니다.",
    );
  };

  const handleResetPassword = (event) => {
    event.preventDefault();
    setResultMessage("비밀번호 재설정 링크를 이메일로 전송했습니다.");
  };

  return (
    <main
      className={styles.page}
      style={{ "--auth-bg-image": `url(${backgroundImage})` }}
    >
      <div className={styles.layout}>
        <section className={styles.copy}>
          <Link to="/" className={styles.logo}>
            <WeMoveLogo tone="light" size="md" />
          </Link>
          <span className={styles.eyebrow}>ACCOUNT SUPPORT</span>
          <h1>아이디와 비밀번호를 빠르게 다시 찾는 방법</h1>
          <p>
            가입한 이메일과 기본 정보만 확인하면 계정 조회와 비밀번호 재설정을
            안전하게 이어갈 수 있습니다.
          </p>

          <div className={styles.metrics}>
            <article>
              <strong>이메일 인증</strong>
              <span>가입 정보 확인 후 안전하게 진행</span>
            </article>
            <article>
              <strong>아이디 조회</strong>
              <span>가입된 계정 정보를 빠르게 확인</span>
            </article>
            <article>
              <strong>비밀번호 재설정</strong>
              <span>링크 발송 후 새 비밀번호 등록</span>
            </article>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardKicker}>계정 찾기</span>
            <h2>계정 정보를 다시 연결해볼까요?</h2>
            <p>아이디 찾기 또는 비밀번호 재설정 중 원하는 작업을 선택하세요.</p>
          </div>

          <div className={styles.tabRow}>
            <button
              type="button"
              className={mode === "id" ? styles.tabActive : styles.tab}
              onClick={() => setMode("id")}
            >
              아이디 찾기
            </button>
            <button
              type="button"
              className={mode === "password" ? styles.tabActive : styles.tab}
              onClick={() => setMode("password")}
            >
              비밀번호 재설정
            </button>
          </div>

          {mode === "id" ? (
            <form className={styles.form} onSubmit={handleFindId}>
              <label>
                <span>이름 또는 닉네임</span>
                <input placeholder="러너민수" />
              </label>
              <label>
                <span>가입 이메일</span>
                <div className={styles.inlineField}>
                  <input type="email" placeholder="runner@wemove.kr" />
                  <button type="button">인증</button>
                </div>
              </label>
              <label>
                <span>인증번호</span>
                <input placeholder="6자리 인증번호 입력" />
              </label>
              <button className={styles.submit} type="submit">
                아이디 확인
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleResetPassword}>
              <label>
                <span>아이디</span>
                <input placeholder="wemove_runner" />
              </label>
              <label>
                <span>가입 이메일</span>
                <div className={styles.inlineField}>
                  <input type="email" placeholder="runner@wemove.kr" />
                  <button type="button">인증</button>
                </div>
              </label>
              <label>
                <span>새 비밀번호</span>
                <input type="password" placeholder="새 비밀번호 입력" />
              </label>
              <label>
                <span>새 비밀번호 확인</span>
                <input type="password" placeholder="새 비밀번호 다시 입력" />
              </label>
              <button className={styles.submit} type="submit">
                재설정 링크 받기
              </button>
            </form>
          )}

          {resultMessage && (
            <div className={styles.resultBox}>
              <strong>안내</strong>
              <p>{resultMessage}</p>
            </div>
          )}

          <div className={styles.links}>
            <Link to="/login">로그인으로 돌아가기</Link>
            <span>·</span>
            <Link to="/signup">회원가입</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
