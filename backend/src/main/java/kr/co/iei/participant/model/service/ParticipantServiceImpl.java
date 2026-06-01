package kr.co.iei.participant.model.service;

import java.time.LocalDateTime;
import java.util.*;
import kr.co.iei.chat.model.service.ChatService;
import kr.co.iei.meeting.model.dao.MeetingDao;
import kr.co.iei.meeting.model.vo.MeetingDetailResponse;
import kr.co.iei.participant.model.dao.ParticipantDao;
import kr.co.iei.participant.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParticipantServiceImpl implements ParticipantService {
  private final ParticipantDao participantDao;
  private final MeetingDao meetingDao;
  private final ChatService chatService;

  @Transactional
  public void apply(Long meetingId, ParticipantRequest req) {
    MeetingDetailResponse meeting = meetingDao.selectMeetingDetail(meetingId);
    if (meeting == null) {
      throw new IllegalArgumentException("존재하지 않는 모임입니다.");
    }
    if (!"RECRUITING".equals(meeting.getStatus())) {
      throw new IllegalArgumentException("모집중인 모임만 참여 신청할 수 있습니다.");
    }

    Long hostUserId = meetingDao.selectHostUserId(meetingId);
    if (hostUserId != null && hostUserId.equals(req.getUserId())) {
      throw new IllegalArgumentException("주최자는 자신의 모임에 참여 신청할 수 없습니다.");
    }

    MeetingParticipant existing = participantDao.selectParticipantByMeetingIdAndUserId(meetingId, req.getUserId());
    if (existing != null) {
      if ("PENDING".equals(existing.getStatus()) || "APPROVED".equals(existing.getStatus())) {
        throw new IllegalArgumentException("이미 신청한 모임입니다.");
      }
      if ("REJECTED".equals(existing.getStatus())) {
        throw new IllegalArgumentException("거절된 모임에는 다시 신청할 수 없습니다.");
      }
      existing.setStatus("PENDING");
      existing.setMessage(req.getMessage());
      participantDao.updateParticipantForReapply(existing);
    } else {
      MeetingParticipant p = new MeetingParticipant();
      p.setMeetingId(meetingId);
      p.setUserId(req.getUserId());
      p.setMessage(req.getMessage());
      p.setStatus("PENDING");
      participantDao.insertParticipant(p);
    }
  }

  public List<ParticipantResponse> getParticipants(Long meetingId) {
    return participantDao.selectParticipants(meetingId);
  }

  @Transactional
  public void approve(Long participantId) {
    participantDao.updateStatus(participantId, "APPROVED");
    Long meetingId = participantDao.selectMeetingIdByParticipantId(participantId);
    MeetingDetailResponse meeting = meetingDao.selectMeetingDetail(meetingId);
    ParticipantResponse participant = participantDao.selectParticipant(participantId);
    if (participant != null) {
      String nickname = participant.getNickname() == null ? "참가자" : participant.getNickname();
      chatService.createSystemMessage(
          meetingId, participant.getUserId(), nickname + "님의 모임 가입이 완료되었습니다.");
    }
    Integer approved = participantDao.countApprovedByMeetingId(meetingId);
    Integer max = meetingDao.selectMaxMembers(meetingId);

    // [수정] sjm_0528의 단일 행 if문 구조에 중괄호 {}를 안전하게 씌워 하단의 닫는 괄호와 짝을 맞췄습니다.
    if (approved != null && max != null && approved >= max) {
      meetingDao.updateMeetingStatus(meetingId, "CLOSED");
    }
  }

  public void reject(Long participantId) {
    participantDao.updateStatus(participantId, "REJECTED");
  }

  public void cancel(Long participantId) {
    participantDao.updateStatus(participantId, "CANCELLED");
  }

  @Transactional
  public void cancelApproval(Long participantId) {
    participantDao.updateStatus(participantId, "PENDING");
    Long meetingId = participantDao.selectMeetingIdByParticipantId(participantId);
    if (meetingId != null) {
      MeetingDetailResponse meeting = meetingDao.selectMeetingDetail(meetingId);
      Integer approved = participantDao.countApprovedByMeetingId(meetingId);
      Integer max = meetingDao.selectMaxMembers(meetingId);

      // [수정] 최신 코드(sjm_0528)의 로직인 인원수 체크 조합만 남겼습니다. (시간 체크 제거)
      if (approved != null && max != null && approved < max) {
        meetingDao.updateMeetingStatus(meetingId, "RECRUITING");
      }
    }
  }

  // NOTE: sjm_0528 로직에서 사용되지 않는다면 이 아래의 isRecruitable 메서드는 지우셔도 무방합니다.
  private boolean isRecruitable(MeetingDetailResponse meeting) {
    if (meeting == null || meeting.getMeetingDate() == null || meeting.getStartTime() == null) {
      return false;
    }

    LocalDateTime startAt = LocalDateTime.of(meeting.getMeetingDate(), meeting.getStartTime());
    return startAt.isAfter(LocalDateTime.now());
  }
}