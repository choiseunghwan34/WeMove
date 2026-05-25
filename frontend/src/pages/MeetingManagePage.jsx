import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppModal from "../components/AppModal";
import { getMeeting, updateMeetingStatus } from "../api/meetingApi";
import {
  approveParticipant,
  getParticipants,
  rejectParticipant,
  cancelApproval,
} from "../api/participantApi";
import styles from "../styles/MeetingManagePage.module.css";

export default function MeetingManagePage() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);

  const fetchData = async () => {
    try {
      const [meetingRes, participantsRes] = await Promise.all([
        getMeeting(meetingId),
        getParticipants(meetingId),
      ]);
      console.log("[DEBUG] Fetched participants list:", participantsRes.data);
      setMeeting(meetingRes.data);
      setParticipants(participantsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch manage data:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();
  }, [meetingId]);

  const closeModal = () => setActionModal(null);

  const handleConfirm = async () => {
    if (!actionModal) return;

    try {
      if (actionModal.type === "approve") {
        await approveParticipant(actionModal.applicant.participantId);
      } else if (actionModal.type === "reject") {
        await rejectParticipant(actionModal.applicant.participantId);
      } else if (actionModal.type === "close") {
        await updateMeetingStatus(meetingId, { status: "CLOSED" });
      } else if (actionModal.type === "cancelApproval") {
        await cancelApproval(actionModal.applicant.participantId);
      }

      // 성공 시 데이터 새로고침 및 모달 닫기
      await fetchData();
      closeModal();
    } catch (error) {
      console.error("[DEBUG] Action failed - Full Error Details:", error);
      if (error.response) {
        console.error("[DEBUG] Server Response Status:", error.response.status);
        console.error("[DEBUG] Server Response Data:", error.response.data);
      }
      alert("요청 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const pendingApplicants = participants.filter((p) => p.status === "PENDING");
  const approvedApplicants = participants.filter((p) => p.status === "APPROVED");

  const isClosed = meeting && (meeting.status === "CLOSED" || meeting.status === "COMPLETED");

  const modalCopy =
    {
      reject: {
        eyebrow: "신청 거절",
        title: `${actionModal?.applicant?.nickname ?? ""}님을 거절할까요?`,
        description:
          "거절하면 해당 사용자는 이 모임에 다시 신청할 수 없게 됩니다.",
        confirmText: "거절 처리",
      },
      approve: {
        eyebrow: "참가 승인",
        title: `${actionModal?.applicant?.nickname ?? ""}님을 승인할까요?`,
        description: "승인하면 참가자 목록에 추가되고 모임 정원에 반영됩니다.",
        confirmText: "승인하기",
      },
      close: {
        eyebrow: "모집 마감",
        title: "이 모임의 모집을 마감할까요?",
        description: "마감 처리 후에는 신규 참가 신청 버튼이 비활성화됩니다.",
        confirmText: "모집 마감 처리",
        tone: "danger",
      },
      cancelApproval: {
        eyebrow: "승인 취소",
        title: `${actionModal?.applicant?.nickname ?? ""}님의 승인을 취소할까요?`,
        description: "승인을 취소하면 해당 신청자는 다시 승인 대기 상태로 이동합니다.",
        confirmText: "승인 취소",
        tone: "danger",
      },
    }[actionModal?.type] ?? {};

  if (loading) return <div className={styles.page}>로딩 중...</div>;
  if (!meeting) return <div className={styles.page}>모임을 찾을 수 없습니다.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <div>
          <h1>신청자 관리</h1>
          <p>
            {meeting.title}에 참가 신청한 사람들을 확인하고 승인, 거절, 마감
            처리를 한 화면에서 관리하세요.
          </p>
        </div>
      </div>

      <section className={styles.statGrid}>
        <article>
          <span>전체 신청</span>
          <strong>{participants.length}</strong>
        </article>
        <article>
          <span>승인 완료</span>
          <strong>{approvedApplicants.length}</strong>
        </article>
        <article>
          <span>대기 인원</span>
          <strong>{pendingApplicants.length}</strong>
        </article>
        <article>
          <span>최대 인원</span>
          <strong>{meeting.maxMembers}</strong>
        </article>
      </section>

      <div className={styles.subGrid}>
        <section className={styles.softPanel}>
          <h2>승인 대기</h2>
          <p>
            참가 메시지와 기본 정보를 보고 바로 승인하거나 거절할 수 있습니다.
          </p>
          <div className={styles.participantList}>
            {pendingApplicants.length === 0 ? (
              <div className={styles.emptyState}>대기 중인 신청자가 없습니다.</div>
            ) : (
              pendingApplicants.map((item) => (
                <article key={item.participantId} className={styles.participantCard}>
                  <div className={styles.participantHead}>
                    <div className={styles.participantMeta}>
                      <strong>{item.nickname}</strong>
                      <p>{item.message || "참가 메시지가 없습니다."}</p>
                    </div>
                    <span className={styles.badge}>대기중</span>
                  </div>
                  <div className={styles.participantActions}>
                    <button
                      type="button"
                      disabled={isClosed}
                      onClick={() =>
                        setActionModal({ type: "reject", applicant: item })
                      }
                    >
                      거절
                    </button>
                    <button
                      type="button"
                      disabled={isClosed}
                      onClick={() =>
                        setActionModal({ type: "approve", applicant: item })
                      }
                    >
                      승인
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className={styles.softPanel}>
          <h2>승인된 참가자</h2>
          <p>
            현재 승인된 멤버를 보고 마감 여부를 결정하거나 세부 관리를 이어갈 수
            있습니다.
          </p>
          <div className={styles.participantList}>
            {approvedApplicants.length === 0 ? (
              <div className={styles.emptyState}>승인된 참가자가 없습니다.</div>
            ) : (
              approvedApplicants.map((item) => (
                <article key={item.participantId} className={styles.participantCard}>
                  <div className={styles.participantHead}>
                    <div className={styles.participantMeta}>
                      <strong>{item.nickname}</strong>
                      <p>{item.message || "참가 메시지가 없습니다."}</p>
                    </div>
                    <span className={styles.reviewScore}>승인 완료</span>
                  </div>
                  <div className={styles.participantActions}>
                    <button
                      type="button"
                      onClick={() =>
                        setActionModal({ type: "cancelApproval", applicant: item })
                      }
                    >
                      승인 취소
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
          <div className={styles.formActions}>
            <Link to={`/meetings/${meetingId}`}>상세로 돌아가기</Link>
            <button
              type="button"
              disabled={isClosed}
              onClick={() => setActionModal({ type: "close" })}
            >
              {isClosed ? "모집 마감 완료" : "모집 마감 처리"}
            </button>
          </div>
        </section>
      </div>

      <AppModal
        open={Boolean(actionModal)}
        eyebrow={modalCopy.eyebrow}
        title={modalCopy.title}
        description={modalCopy.description}
        confirmText={modalCopy.confirmText}
        tone={modalCopy.tone}
        onClose={closeModal}
        onConfirm={handleConfirm}
      >
        {actionModal?.applicant ? (
          <div className={styles.applicantModalCard}>
            <div className={styles.applicantAvatar}>
              {(actionModal.applicant.nickname || "").slice(0, 1)}
            </div>
            <div>
              <strong>{actionModal.applicant.nickname}</strong>
              <p>{actionModal.applicant.message || "참가 메시지가 없습니다."}</p>
            </div>
          </div>
        ) : (
          <div className={styles.applicantModalCard}>
            <div className={styles.applicantAvatar}>마</div>
            <div>
              <strong>{meeting.title}</strong>
              <p>
                현재 승인 완료 {approvedApplicants.length}명, 대기 인원{" "}
                {pendingApplicants.length}명입니다.
              </p>
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}
