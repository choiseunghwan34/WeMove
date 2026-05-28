package kr.co.iei.participant.model.service;

import java.util.*;
import kr.co.iei.meeting.model.dao.MeetingDao;
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

  @Transactional
  public void apply(Long meetingId, ParticipantRequest req) {
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
    Integer approved = participantDao.countApprovedByMeetingId(meetingId);
    Integer max = meetingDao.selectMaxMembers(meetingId);
    if (approved != null && max != null && (approved + 1) >= max)
      meetingDao.updateMeetingStatus(meetingId, "CLOSED");
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
      Integer approved = participantDao.countApprovedByMeetingId(meetingId);
      Integer max = meetingDao.selectMaxMembers(meetingId);
      if (approved != null && max != null && (approved + 1) < max) {
        meetingDao.updateMeetingStatus(meetingId, "RECRUITING");
      }
    }
  }
}
