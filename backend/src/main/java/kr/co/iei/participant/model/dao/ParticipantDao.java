package kr.co.iei.participant.model.dao;

import java.util.*;
import kr.co.iei.participant.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ParticipantDao {
  private final SqlSession sqlSession;

  public Integer exists(Long meetingId, Long userId) {
    return sqlSession.selectOne(
        "participant.exists", Map.of("meetingId", meetingId, "userId", userId));
  }

  public int insertParticipant(MeetingParticipant p) {
    return sqlSession.insert("participant.insertParticipant", p);
  }

  public List<ParticipantResponse> selectParticipants(Long meetingId) {
    return sqlSession.selectList("participant.selectParticipants", meetingId);
  }

  public int updateStatus(Long participantId, String status) {
    return sqlSession.update(
        "participant.updateStatus", Map.of("participantId", participantId, "status", status));
  }

  public Integer countApprovedByMeetingId(Long meetingId) {
    return sqlSession.selectOne("participant.countApprovedByMeetingId", meetingId);
  }

  public Long selectMeetingIdByParticipantId(Long participantId) {
    return sqlSession.selectOne("participant.selectMeetingIdByParticipantId", participantId);
  }
}
