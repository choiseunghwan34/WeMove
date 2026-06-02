import { useState, useEffect } from "react";
import styles from "../styles/UserProfileDetailModal.module.css";
import UiIcon from "./UiIcon";
import { createReport } from "../api/reportApi";
import { openDirectChat } from "../utils/directChatEvents";

const formatJoinDate = (dateStr) => {
  if (!dateStr) return "2026.05";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = dateStr.split(/[-T.]/);
      if (parts.length >= 2) {
        return `${parts[0]}.${parts[1]}`;
      }
      return "2026.05";
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}.${month}`;
  } catch (e) {
    return "2026.05";
  }
};

export default function UserProfileDetailModal({ open, onClose, user, loginUser }) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reportDetail, setReportDetail] = useState("");

  // 모달이 열리거나 유저가 바뀔 때 신고 상태 초기화
  useEffect(() => {
    if (open) {
      setIsReporting(false);
      setReportReason("");
      setCustomReason("");
      setReportDetail("");
    }
  }, [open, user]);

  if (!open || !user) return null;

  // 나이대 계산 (현재 임시 연도 2026년 기준)
  const getAgeGroupText = () => {
    if (!user.birthYear) return "연령 미지정";
    const currentYear = 2026;
    const age = currentYear - Number(user.birthYear) + 1;
    const ageGroup = Math.floor(age / 10) * 10;
    return `${ageGroup}대`;
  };

  // 성별 텍스트 변환
  const getGenderText = () => {
    if (user.gender === 1) return "남성";
    if (user.gender === 2) return "여성";
    return "성별 미지정";
  };

  const joinDate = formatJoinDate(user.createdAt);
  const ageGroup = getAgeGroupText();
  const genderText = getGenderText();

  // 관심 스포츠 칩 리스트 파싱
  const sportsList = user.sports && user.sports.trim()
    ? user.sports.split(", ").filter(Boolean)
    : [];

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) {
      alert("신고 사유를 선택해 주세요.");
      return;
    }
    if (reportReason === "OTHER" && !customReason.trim()) {
      alert("직접 입력 사유를 적어주세요.");
      return;
    }

    const confirmReport = window.confirm(`${user.nickname}님을 정말로 신고하시겠습니까?`);
    if (!confirmReport) {
      return;
    }

    const finalContent = reportReason === "OTHER"
      ? `[직접 입력 사유: ${customReason}] \n ${reportDetail || ""}`
      : (reportDetail || "");

    try {
      await createReport({
        reporterId: loginUser.memberId,
        targetUserId: user.userId,
        reason: reportReason,
        content: finalContent
      });
      alert(`${user.nickname}님에 대한 신고가 정상적으로 접수되었습니다. 관리자 검토 후 조치 예정입니다.`);
      setIsReporting(false);
      onClose();
    } catch (error) {
      console.error("Failed to submit report:", error);
      alert("신고 접수에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // 로그인한 유저 본인 프로필일 경우 신고 버튼 미노출
  const isMe = loginUser && (Number(loginUser.memberId) === Number(user.userId));

  const handleDirectChatClick = () => {

    if (!loginUser || !loginUser.memberId) {
      alert("로그인이 필요한 기능입니다. 로그인 후 이용해주세요.");
      return;
    }

    if (isMe) {
      return;
    }

    openDirectChat(user.userId);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* 모달 헤더 */}
        <div className={styles.modalHeader}>
          <h2>{isReporting ? "유저 신고하기" : "멤버 프로필"}</h2>
          <button type="button" className={styles.closeIconButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 모달 바디 */}
        <div className={styles.modalBody}>
          {!isReporting ? (
            /* 1단계: 일반 프로필 조회 화면 */
            <div className={styles.profileContainer}>
              <div className={styles.profileMainRow}>
                <img
                  src={user.profileImage || "/src/assets/image/default-user.png"}
                  alt={user.nickname}
                  className={styles.profileAvatar}
                  onError={(e) => {
                    e.target.src = "/src/assets/image/default-user.png";
                  }}
                />
                <div className={styles.profileMetaGroup}>
                  <strong className={styles.nicknameText}>{user.nickname}</strong>
                  <span className={styles.metaJoinDate}>가입일 {joinDate}</span>
                  <span className={styles.metaSubText}>
                    {genderText} / {ageGroup} &nbsp;·&nbsp; {user.regionName || "지역 미지정"}
                  </span>
                </div>
              </div>

              {/* 관심 스포츠 칩 리스트 (관심운동 한글 소제목 없이 바로 노출) */}
              <div className={styles.sportsSection}>
                {sportsList.length === 0 ? (
                  <div className={styles.emptySports}>등록된 관심 운동 종목이 없습니다.</div>
                ) : (
                  <div className={styles.sportsChipsWrapper}>
                    {sportsList.map((sport, index) => (
                      <span key={`${sport}-${index}`} className={styles.sportChip}>
                        {sport}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 2단계: 신고 사유 작성 화면 (스위칭 콘텐츠) */
            <form onSubmit={handleReportSubmit} className={styles.reportForm}>
              <p className={styles.reportGuide}>
                이 유저(<strong>{user.nickname}</strong>)에게 비매너, 노쇼 또는 부적절한 행위가 있었나요?<br />신속히 확인하여 조치하겠습니다.
              </p>
              
              <div className={styles.formField}>
                <label htmlFor="reportReasonSelect">신고 분류</label>
                <select
                  id="reportReasonSelect"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="">사유를 선택해 주세요</option>
                  <option value="NOSHOW">무단 노쇼 (모임 불참)</option>
                  <option value="ABUSE">폭언 / 욕설 / 비매너 행동</option>
                  <option value="SPAM">상업적 홍보 및 종교 포교 활동</option>
                  <option value="FRAUD">허위 프로필 및 사칭</option>
                  <option value="OTHER">기타 직접 입력</option>
                </select>
              </div>

              {reportReason === "OTHER" && (
                <div className={styles.formField}>
                  <label htmlFor="customReasonInput">직접 입력 (최대 30자)</label>
                  <input
                    type="text"
                    id="customReasonInput"
                    className={styles.customReasonInput}
                    placeholder="신고 사유를 직접 입력해 주세요."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    maxLength={30}
                    required
                  />
                </div>
              )}

              <div className={styles.formField}>
                <label htmlFor="reportDetailText">상세 내용 (선택)</label>
                <textarea
                  id="reportDetailText"
                  placeholder="신고 사유에 대한 상세한 정황이나 상황을 묘사해 주시면 검토에 큰 도움이 됩니다."
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  maxLength={300}
                />
              </div>

              <div className={styles.reportActions}>
                <button
                  type="button"
                  className={styles.cancelReportButton}
                  onClick={() => setIsReporting(false)}
                >
                  이전으로
                </button>
                <button type="submit" className={styles.submitReportButton}>
                  신고 접수
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 모달 푸터 (신고 중이 아닐 때만 렌더링) */}
        {!isReporting && (
          <div className={styles.modalFooter}>
            {!isMe ? (
              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.directChatButton}
                  onClick={handleDirectChatClick}
                >
                  1:1 대화
                </button>
                <button
                  type="button"
                  className={styles.reportTriggerButton}
                  onClick={() => {
                    if (!loginUser || !loginUser.memberId) {
                      alert("로그인이 필요한 기능입니다. 로그인 후 이용해주세요.");
                      return;
                    }
                    setIsReporting(true);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  신고하기
                </button>
              </div>
            ) : (
              <span className={styles.myProfileTag}>나의 프로필 카드</span>
            )}
            <button type="button" className={styles.closeFooterButton} onClick={onClose}>
              닫기
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
