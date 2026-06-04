import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppModal from "../components/AppModal";
import WeMoveLogo from "../components/WeMoveLogo";
import { login } from "../api/authApi";
import { getLoginPageStats } from "../api/statsApi";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/LoginPage.module.css";
import { parseUserFromAccessToken } from "../utils/jwtPayload";
import {
  clearRememberedLoginId,
  getRememberedLoginId,
  setRememberedLoginId,
} from "../utils/rememberedLogin";

// 새로고침 시 번갈아 나올 배경 이미지들 임포트
import bg1 from "../assets/image/bg1.jpg";
import bg2 from "../assets/image/bg2.jpg";

const authBackgrounds = [bg1, bg2];

const normalizeServerMessage = (message) => {
  if (!message) {
    return "";
  }

  if (
      message.includes("Invalid login credentials") ||
      message.includes("아이디 또는 비밀번호") ||
      message.includes("비밀번호가 올바르지")
  ) {
    return "아이디 또는 비밀번호가 올바르지 않습니다.";
  }

  if (message.includes("이메일 인증")) {
    return "이메일 인증을 완료한 뒤 로그인해주세요.";
  }

  if (message.includes("deleted") || message.includes("탈퇴")) {
    return "탈퇴한 계정은 로그인할 수 없습니다.";
  }

  return message;
};

const getLoginErrorMessage = (error) => {
  const serverMessage = normalizeServerMessage(error?.response?.data?.message);

  if (serverMessage) {
    return serverMessage;
  }

  if (error?.response?.status === 400 || error?.response?.status === 401) {
    return "아이디 또는 비밀번호가 올바르지 않습니다.";
  }

  if (error?.response?.status === 403) {
    return "로그인 조건을 만족하지 않아 접속할 수 없습니다.";
  }

  return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
};

const formatMetric = (value) => {
  const numericValue = Number(value ?? 0);

  if (numericValue >= 1000000) {
    return `${(numericValue / 1000000).toFixed(1)}M`;
  }

  if (numericValue >= 1000) {
    return `${(numericValue / 1000).toFixed(1)}K`;
  }

  return String(numericValue);
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuthenticatedAccessToken } = useAuth();
  const [form, setForm] = useState({ loginId: "", password: "" });
  const [rememberLoginId, setRememberLoginId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달 관련 상태
  const [duplicatePromptOpen, setDuplicatePromptOpen] = useState(false);
  const [suspendedModalOpen, setSuspendedModalOpen] = useState(false);
  const [suspensionDetails, setSuspensionDetails] = useState({
    reason: "",
    until: "",
  });

  const [stats, setStats] = useState({
    totalMembers: 0,
    totalMeetings: 0,
    completedMeetings: 0,
  });

  useEffect(() => {
    const savedLoginId = getRememberedLoginId();
    if (savedLoginId) {
      setForm((current) => ({ ...current, loginId: savedLoginId }));
      setRememberLoginId(true);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const { data } = await getLoginPageStats();
        if (active && data) {
          setStats({
            totalMembers: data.totalMembers ?? 0,
            totalMeetings: data.totalMeetings ?? 0,
            completedMeetings: data.completedMeetings ?? 0,
          });
        }
      } catch {
        if (active) {
          setStats({
            totalMembers: 0,
            totalMeetings: 0,
            completedMeetings: 0,
          });
        }
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, []);

  // 렌더링 시 랜덤으로 배경 이미지 선택
  const backgroundImage = useMemo(
      () => authBackgrounds[Math.floor(Math.random() * authBackgrounds.length)],
      [],
  );

  const finishLogin = (loginId, nextAccessToken) => {
    const parsedUser = parseUserFromAccessToken(nextAccessToken);

    if (rememberLoginId) {
      setRememberedLoginId(loginId);
    } else {
      clearRememberedLoginId();
    }

    setAuthenticatedAccessToken(nextAccessToken);
    navigate(parsedUser?.role === "ADMIN" ? "/admin" : "/");
  };

  const requestLogin = async ({ forceLogin = false } = {}) => {
    const loginId = form.loginId.trim();
    const password = form.password;
    const { data } = await login({ loginId, password, autoLogin, forceLogin });
    finishLogin(loginId, data?.accessToken);
  };

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
      await requestLogin();
    } catch (error) {
      const errData = error?.response?.data;

      // 1. 중복 로그인 확인
      if (errData?.code === "DUPLICATE_LOGIN_REQUIRED") {
        setDuplicatePromptOpen(true);
      }
      // 2. 계정 정지 확인 (상태 코드 423 또는 에러 메시지/코드로 판별)
      else if (
          error?.response?.status === 423 ||
          errData?.code === "ACCOUNT_SUSPENDED" ||
          errData?.message?.includes("suspended") ||
          errData?.message?.includes("정지")
      ) {

        // 💡 백엔드에서 내려온 ISO 일시 문자열 가공 ('T' 제거 및 포맷팅)
        const rawUntil = errData?.suspendedUntil || "";
        const formattedUntil = rawUntil.includes("T")
            ? rawUntil.replace("T", " ")
            : rawUntil;

        setSuspensionDetails({
          reason: errData?.reason || "운영원칙 위반",
          until: formattedUntil || "관리자 문의 요망",
        });
        setSuspendedModalOpen(true);
      }
      // 3. 그 외 일반 에러
      else {
        setErrorMessage(getLoginErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDuplicateLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await requestLogin({ forceLogin: true });
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setDuplicatePromptOpen(false);
      setIsSubmitting(false);
    }
  };

  return (
      <>
        <main className={styles.page}>
          {/* 줌인 애니메이션이 적용되는 배경 레이어 */}
          <div
              className={styles.backgroundLayer}
              style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {/* 배경을 살짝 눌러주는 어두운 오버레이 */}
          <div className={styles.backgroundOverlay} />

          {/* 둥둥 떠다니는 빛 효과 (Ambient Orbs) */}
          <div className={styles.ambientEffects} aria-hidden="true">
            <div className={`${styles.ambientOrb} ${styles.orb1}`} />
            <div className={`${styles.ambientOrb} ${styles.orb2}`} />
            <div className={`${styles.ambientOrb} ${styles.orb3}`} />
          </div>

          <div className={styles.layout}>
            <section className={styles.copy}>
              <Link to="/" className={styles.logo}>
                <WeMoveLogo tone="dark" size="md" />
              </Link>
              <span className={styles.eyebrow}>LOCAL FITNESS COMMUNITY</span>
              <h1>동네 운동을 자연스럽게 이어주는 방법</h1>
              <p>
                러닝, 헬스, 풋살, 등산, 배드민턴까지. 가까운 사람들과 함께 움직일 수 있는
                지역 기반 운동 모임 플랫폼입니다.
              </p>

              <div className={styles.metrics}>
                <article>
                  <strong>{formatMetric(stats.totalMembers)}</strong>
                  <span>회원 수</span>
                </article>
                <article>
                  <strong>{formatMetric(stats.totalMeetings)}</strong>
                  <span>생성 모임</span>
                </article>
                <article>
                  <strong>{formatMetric(stats.completedMeetings)}</strong>
                  <span>누적 참여</span>
                </article>
              </div>
            </section>

            <form className={styles.card} onSubmit={handleSubmit}>
              <div className={styles.cardHead}>
                <span className={styles.cardKicker}>로그인</span>
                <h2>오늘도 가까운 운동 모임과 같이 움직여볼까요?</h2>
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

        {/* 중복 로그인 모달 */}
        <AppModal
            open={duplicatePromptOpen}
            title="중복 로그인 안내"
            description="이미 로그인 중인 계정이 있습니다. 새 기기에서 계속 로그인하시겠습니까?"
            confirmText="확인"
            cancelText="취소"
            onConfirm={confirmDuplicateLogin}
            onClose={() => setDuplicatePromptOpen(false)}
        />

        {/* 정지 계정 안내 모달 */}
        <AppModal
            open={suspendedModalOpen}
            title="접속 제한 안내"
            description="운영원칙 위반으로 인해 계정 이용이 일시적으로 제한되었습니다."
            confirmText="확인"
            hideCancel={true} // 닫기 버튼 하나만 보여줌
            onConfirm={() => setSuspendedModalOpen(false)}
            onClose={() => setSuspendedModalOpen(false)}
        >
          <div style={{
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            textAlign: "left"
          }}>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "4px" }}>
                정지 사유
              </span>
              <strong style={{ fontSize: "14px", color: "#334155" }}>
                {suspensionDetails.reason}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "4px" }}>
                제한 해제 일시
              </span>
              <strong style={{ fontSize: "15px", color: "#e11d48" }}>
                {suspensionDetails.until}
              </strong>
            </div>
          </div>
        </AppModal>
      </>
  );
}