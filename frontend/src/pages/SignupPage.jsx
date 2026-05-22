import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, signup } from "../api/authApi";
import api from "../api/axiosInstance";
import { getRegions } from "../api/regionApi";
import RegionPickerModal from "../components/RegionPickerModal";
import { useAuth } from "../contexts/AuthContext";
import homeBg from "../assets/images/home-bg.webp";
import styles from "../styles/SignupPage.module.css";

const authBackgrounds = [homeBg];

const initialForm = {
  loginId: "",
  email: "",
  password: "",
  passwordConfirm: "",
  nickname: "",
  gender: "",
  birthYear: "",
  phone: "",
};

const initialRegionSelection = {
  sido: "전체 시도",
  sigungu: "전체 시군구",
  dong: "전체 읍면동",
};

const LOGIN_ID_PATTERN = /^[a-z0-9]{7}$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]+$/;
const CURRENT_YEAR = new Date().getFullYear();
const FALLBACK_REGIONS = [
  { regionId: 1, sido: "경기", sigungu: "파주시", dong: "운정동" },
  { regionId: 2, sido: "경기", sigungu: "파주시", dong: "야당동" },
  { regionId: 3, sido: "경기", sigungu: "파주시", dong: "금촌동" },
  { regionId: 4, sido: "경기", sigungu: "파주시", dong: "문산읍" },
  { regionId: 5, sido: "서울", sigungu: "마포구", dong: "합정동" },
  { regionId: 6, sido: "서울", sigungu: "강남구", dong: "역삼동" },
];

const normalizeText = (value = "") => String(value).trim();

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.startsWith("02")) {
    if (digits.length <= 5) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const getPhoneDigits = (phone) => phone.replace(/\D/g, "");

const getRegionLabel = (selection) => {
  const values = [selection.sido, selection.sigungu, selection.dong].filter(
    (value) => value && !value.startsWith("전체 "),
  );

  return values.length ? values.join(" ") : "";
};

const buildRegionHierarchy = (regions) => {
  const grouped = new Map();

  regions.forEach((region) => {
    const sido = normalizeText(region.sido);
    const sigungu = normalizeText(region.sigungu);
    const dong = normalizeText(region.dong);

    if (!sido || !sigungu || !dong) {
      return;
    }

    if (!grouped.has(sido)) {
      grouped.set(sido, new Map());
    }

    const sigunguMap = grouped.get(sido);
    if (!sigunguMap.has(sigungu)) {
      sigunguMap.set(sigungu, []);
    }

    sigunguMap.get(sigungu).push(dong);
  });

  return [...grouped.entries()]
    .sort((left, right) => left[0].localeCompare(right[0], "ko"))
    .map(([sido, sigunguMap]) => ({
      sido,
      sigungus: [...sigunguMap.entries()]
        .sort((left, right) => left[0].localeCompare(right[0], "ko"))
        .map(([sigungu, dongs]) => ({
          sigungu,
          dongs: [...new Set(dongs)].sort((left, right) =>
            left.localeCompare(right, "ko"),
          ),
        })),
    }));
};

const getSignupErrorMessage = (error) => {
  const serverMessage = error?.response?.data?.message;

  if (serverMessage) {
    return serverMessage;
  }

  if (error?.response) {
    return "회원가입 정보를 다시 확인해주세요.";
  }

  return "서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.";
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { setAuthenticatedAccessToken } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [regions, setRegions] = useState([]);
  const [regionSelection, setRegionSelection] = useState(
    initialRegionSelection,
  );
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingLoginId, setIsCheckingLoginId] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] =
    useState("idle");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const backgroundImage = useMemo(
    () => authBackgrounds[Math.floor(Math.random() * authBackgrounds.length)],
    [],
  );

  useEffect(() => {
    let active = true;

    const loadRegions = async () => {
      try {
        const { data } = await getRegions();
        const nextRegions = Array.isArray(data) ? data : [];

        if (active) {
          setRegions(nextRegions.length ? nextRegions : FALLBACK_REGIONS);
        }
      } catch {
        if (active) {
          setRegions(FALLBACK_REGIONS);
        }
      }
    };

    loadRegions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (emailVerificationStatus !== "pending") {
      return undefined;
    }

    let socket;

    try {
      socket = new WebSocket("ws://localhost:8456/ws/email-verifications");

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const nextEmail = normalizeText(payload.email);

          if (payload.verified && nextEmail) {
            setVerifiedEmail(nextEmail);
            setForm((current) => ({ ...current, email: nextEmail }));
            setEmailVerificationStatus("verified");
            setFieldErrors((current) => ({
              ...current,
              email: "",
            }));
          }
        } catch {
          // 웹소켓 메시지 형식이 다르면 회원가입 입력 흐름은 유지합니다.
        }
      };

      socket.onerror = () => {
        setFieldErrors((current) => ({
          ...current,
          email:
            "이메일 인증 연결을 확인할 수 없습니다. 인증 서버 상태를 확인해주세요.",
        }));
      };
    } catch {
      setFieldErrors((current) => ({
        ...current,
        email: "이메일 인증 연결을 시작할 수 없습니다.",
      }));
    }

    return () => {
      socket?.close();
    };
  }, [emailVerificationStatus]);

  const regionHierarchy = useMemo(
    () => buildRegionHierarchy(regions),
    [regions],
  );

  const selectedRegion = useMemo(() => {
    return regions.find(
      (region) =>
        normalizeText(region.sido) === regionSelection.sido &&
        normalizeText(region.sigungu) === regionSelection.sigungu &&
        normalizeText(region.dong) === regionSelection.dong,
    );
  }, [regionSelection, regions]);

  const regionLabel = getRegionLabel(regionSelection);

  const validateForm = () => {
    const nextErrors = {};
    const loginId = normalizeText(form.loginId);
    const email = normalizeText(form.email);
    const password = form.password;
    const phoneDigits = getPhoneDigits(form.phone);
    const birthYear = Number(form.birthYear);

    if (!LOGIN_ID_PATTERN.test(loginId)) {
      nextErrors.loginId =
        "아이디는 소문자와 숫자를 조합해 정확히 7자리로 입력해주세요.";
    }

    if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "올바른 이메일 형식으로 입력해주세요.";
    } else if (
      emailVerificationStatus !== "verified" ||
      verifiedEmail !== email
    ) {
      nextErrors.email = "이메일 인증을 완료해주세요.";
    }

    if (!PASSWORD_PATTERN.test(password)) {
      nextErrors.password =
        "비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해 정확히 8자리로 입력해주세요.";
    }

    if (form.passwordConfirm !== password) {
      nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    if (!NICKNAME_PATTERN.test(normalizeText(form.nickname))) {
      nextErrors.nickname =
        "닉네임은 한글, 영문, 숫자만 입력해주세요. 공백과 특수문자는 사용할 수 없습니다.";
    }

    if (!selectedRegion?.regionId) {
      nextErrors.region = "지역을 선택해주세요.";
    }

    if (!form.gender) {
      nextErrors.gender = "성별을 선택해주세요.";
    }

    if (
      !/^\d{4}$/.test(form.birthYear) ||
      birthYear < 1900 ||
      birthYear > CURRENT_YEAR
    ) {
      nextErrors.birthYear = "출생년도는 4자리 연도로 입력해주세요.";
    }

    if (phoneDigits.length < 9 || phoneDigits.length > 11) {
      nextErrors.phone = "연락처는 숫자 9자리에서 11자리까지 입력해주세요.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "phone" ? formatPhone(value) : value;

    if (name === "email") {
      setVerifiedEmail("");
      setEmailVerificationStatus("idle");
    }

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const checkLoginId = async () => {
    const loginId = normalizeText(form.loginId);

    if (!LOGIN_ID_PATTERN.test(loginId)) {
      setFieldErrors((current) => ({
        ...current,
        loginId: "아이디는 소문자와 숫자를 조합해 정확히 7자리로 입력해주세요.",
      }));
      return;
    }

    setIsCheckingLoginId(true);

    try {
      await api.get("/auth/check-login-id", { params: { loginId } });
      setFieldErrors((current) => ({
        ...current,
        loginId: "",
      }));
    } catch (error) {
      const status = error?.response?.status;
      setFieldErrors((current) => ({
        ...current,
        loginId:
          status === 409
            ? "이미 사용 중인 아이디입니다."
            : "중복 확인 API가 준비되지 않았습니다. 가입 시 서버에서 다시 확인됩니다.",
      }));
    } finally {
      setIsCheckingLoginId(false);
    }
  };

  const requestEmailVerification = async () => {
    const email = normalizeText(form.email);

    if (!EMAIL_PATTERN.test(email)) {
      setFieldErrors((current) => ({
        ...current,
        email: "올바른 이메일 형식으로 입력해주세요.",
      }));
      return;
    }

    setIsCheckingEmail(true);
    setEmailVerificationStatus("pending");

    try {
      await api.post("/auth/email/send", { email });
      setFieldErrors((current) => ({
        ...current,
        email: "인증 메일을 보냈습니다. 메일의 인증하기 버튼을 눌러주세요.",
      }));
    } catch (error) {
      const status = error?.response?.status;
      setEmailVerificationStatus("idle");
      setFieldErrors((current) => ({
        ...current,
        email:
          status === 409
            ? "이미 사용 중인 이메일입니다."
            : "이메일 인증 API가 준비되지 않았습니다.",
      }));
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const applyRegion = (selection) => {
    setRegionSelection(selection);
    setIsRegionModalOpen(false);
    setFieldErrors((current) => ({
      ...current,
      region: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormMessage("");

    if (!validateForm()) {
      return;
    }

    const loginId = normalizeText(form.loginId);
    const email = normalizeText(form.email);
    const password = form.password;

    setIsSubmitting(true);

    try {
      await signup({
        loginId,
        email,
        password,
        nickname: normalizeText(form.nickname),
        regionId: selectedRegion.regionId,
        gender: form.gender,
        birthYear: Number(form.birthYear),
        phone: getPhoneDigits(form.phone),
      });

      const { data } = await login({ loginId, password, autoLogin: true });
      setAuthenticatedAccessToken(data?.accessToken);
      navigate("/meetings");
    } catch (error) {
      const message = getSignupErrorMessage(error);

      if (message.includes("아이디")) {
        setFieldErrors((current) => ({ ...current, loginId: message }));
      } else if (message.includes("이메일")) {
        setFieldErrors((current) => ({ ...current, email: message }));
      } else if (message.includes("닉네임")) {
        setFieldErrors((current) => ({ ...current, nickname: message }));
      } else {
        setFormMessage(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={styles.page}
      style={{ "--auth-bg-image": `url(${backgroundImage})` }}
    >
      <div className={`${styles.layout} ${styles.signupLayout}`}>
        <section className={styles.copy}>
          <Link to="/" className={styles.logo}>
            WeMove
          </Link>
          <span className={styles.eyebrow}>JOIN WEMOVE</span>
          <h1>내 지역에서 시작하는 새로운 운동 루틴</h1>
          <p>
            기본 정보를 입력하면 내 주변 모임을 훨씬 더 빠르게 찾을 수 있습니다.
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

        <form
          className={`${styles.card} ${styles.signupCard}`}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={styles.cardHead}>
            <span className={styles.cardKicker}>회원가입</span>
            <h2>프로필을 만들고 바로 시작하세요</h2>
            <p>기본 정보를 입력하면 WeMove 활동 준비가 끝납니다.</p>
          </div>

          <div className={styles.signupSection}>
            <div className={styles.fieldGrid}>
              <label>
                <span>아이디</span>
                <div className={styles.inlineField}>
                  <input
                    name="loginId"
                    value={form.loginId}
                    onChange={handleChange}
                    placeholder="영문 소문자와 숫자"
                    autoComplete="username"
                    maxLength={7}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={checkLoginId}
                    disabled={isSubmitting || isCheckingLoginId}
                  >
                    {isCheckingLoginId ? "확인중" : "중복확인"}
                  </button>
                </div>
                <small className={styles.fieldError}>
                  {fieldErrors.loginId || "\u00a0"}
                </small>
              </label>

              <label>
                <span>이메일</span>
                <div className={styles.inlineField}>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="runner@wemove.kr"
                    autoComplete="email"
                    readOnly={emailVerificationStatus === "verified"}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={requestEmailVerification}
                    disabled={
                      isSubmitting ||
                      isCheckingEmail ||
                      emailVerificationStatus === "verified"
                    }
                  >
                    {emailVerificationStatus === "verified"
                      ? "완료"
                      : isCheckingEmail
                        ? "전송중"
                        : "인증"}
                  </button>
                </div>
                <small
                  className={
                    emailVerificationStatus === "verified"
                      ? styles.fieldSuccess
                      : styles.fieldError
                  }
                >
                  {emailVerificationStatus === "verified"
                    ? "이메일 인증이 완료되었습니다."
                    : fieldErrors.email || "\u00a0"}
                </small>
              </label>

              <label>
                <span>비밀번호</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="대소문자, 숫자, 특수문자 포함 8자리 이상"
                  autoComplete="new-password"
                  maxLength={8}
                  disabled={isSubmitting}
                />
                <small className={styles.fieldError}>
                  {fieldErrors.password || "\u00a0"}
                </small>
              </label>

              <label>
                <span>비밀번호 확인</span>
                <input
                  name="passwordConfirm"
                  type="password"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  placeholder="비밀번호 다시 입력"
                  autoComplete="new-password"
                  maxLength={8}
                  disabled={isSubmitting}
                />
                <small className={styles.fieldError}>
                  {fieldErrors.passwordConfirm || "\u00a0"}
                </small>
              </label>

              <label>
                <span>닉네임</span>
                <input
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  placeholder="러너민수"
                  autoComplete="nickname"
                  disabled={isSubmitting}
                />
                <small className={styles.fieldError}>
                  {fieldErrors.nickname || "\u00a0"}
                </small>
              </label>

              <label>
                <span>지역</span>
                <button
                  type="button"
                  className={styles.regionSelectButton}
                  onClick={() => setIsRegionModalOpen(true)}
                  disabled={isSubmitting}
                >
                  {regionLabel || "지역 선택"}
                </button>
                <small className={styles.fieldError}>
                  {fieldErrors.region || "\u00a0"}
                </small>
              </label>

              <label>
                <span>성별</span>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">성별 선택</option>
                  <option value="M">남</option>
                  <option value="F">여</option>
                </select>
                <small className={styles.fieldError}>
                  {fieldErrors.gender || "\u00a0"}
                </small>
              </label>

              <label>
                <span>출생년도</span>
                <input
                  name="birthYear"
                  value={form.birthYear}
                  onChange={handleChange}
                  placeholder="1998"
                  inputMode="numeric"
                  maxLength={4}
                  disabled={isSubmitting}
                />
                <small className={styles.fieldError}>
                  {fieldErrors.birthYear || "\u00a0"}
                </small>
              </label>

              <label className={styles.fullField}>
                <span>연락처</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={13}
                  disabled={isSubmitting}
                />
                <small className={styles.fieldError}>
                  {fieldErrors.phone || "\u00a0"}
                </small>
              </label>
            </div>
          </div>

          {formMessage ? (
            <p className={styles.formError} role="alert">
              {formMessage}
            </p>
          ) : null}

          <button
            className={styles.submit}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "가입 처리 중..." : "가입 완료"}
          </button>

          <div className={styles.links}>
            <Link to="/login">이미 계정이 있어요</Link>
          </div>
        </form>
      </div>

      <RegionPickerModal
        open={isRegionModalOpen}
        regions={regionHierarchy}
        initialSelection={regionSelection}
        onApply={applyRegion}
        onClose={() => setIsRegionModalOpen(false)}
      />
    </main>
  );
}
