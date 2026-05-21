package kr.co.iei.meeting.model.dao;

import java.util.*;
import kr.co.iei.meeting.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MeetingDao {
  private final SqlSession sqlSession;

  public List<MeetingListResponse> selectMeetingList(MeetingSearchCondition c) {
    return sqlSession.selectList("meeting.selectMeetingList", c);
  }

  public int selectMeetingCount(MeetingSearchCondition c) {
    return sqlSession.selectOne("meeting.selectMeetingCount", c);
  }

  public List<Map<String, Object>> selectTopRegions() {
    return sqlSession.selectList("meeting.selectTopRegions");
  }

  public MeetingDetailResponse selectMeetingDetail(Long id) {
    return sqlSession.selectOne("meeting.selectMeetingDetail", id);
  }

  public int insertMeeting(Meeting m) {
    return sqlSession.insert("meeting.insertMeeting", m);
  }

  public int updateMeeting(Long id, MeetingUpdateRequest req) {
    Map<String, Object> p = new HashMap<>();
    p.put("meetingId", id);
    p.put("request", req);
    return sqlSession.update("meeting.updateMeeting", p);
  }

  public int softDeleteMeeting(Long id) {
    return sqlSession.update("meeting.softDeleteMeeting", id);
  }

  public int updateMeetingStatus(Long id, String status) {
    return sqlSession.update(
        "meeting.updateMeetingStatus", Map.of("meetingId", id, "status", status));
  }

  public Integer selectMaxMembers(Long id) {
    return sqlSession.selectOne("meeting.selectMaxMembers", id);
  }
}
