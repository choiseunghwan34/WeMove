package kr.co.iei.meeting.model.dao;

import java.util.*;
import kr.co.iei.meeting.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

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

  public int updateMeeting(MeetingUpdateRequest request) {
    return sqlSession.update("meeting.updateMeeting", request);
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

  public Long selectHostUserId(Long id) {
    return sqlSession.selectOne("meeting.selectHostUserId", id);
  }

  public int startDueMeetings() {
    return sqlSession.update("meeting.startDueMeetings");
  }


  public List<MeetingListResponse> selectMainMeetingList(Map<String, Object> result) {
    return sqlSession.selectList("meeting.selectMainMeetingList", result);
  }

  public List<MeetingListResponse> selectMainMeetingListByIds(List<Long> meetingIds) {
    return sqlSession.selectList("meeting.selectMainMeetingListByIds", meetingIds);
  }
}
