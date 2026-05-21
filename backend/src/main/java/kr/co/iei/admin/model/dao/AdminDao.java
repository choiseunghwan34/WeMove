package kr.co.iei.admin.model.dao;

import java.util.*;
import kr.co.iei.admin.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class AdminDao {
  private final SqlSession sqlSession;

  public AdminSummary selectSummary() {
    return sqlSession.selectOne("admin.selectSummary");
  }

  public List<AdminMemberResponse> selectMembers() {
    return sqlSession.selectList("admin.selectMembers");
  }

  public List<AdminRegionResponse> selectRegions() {
    return sqlSession.selectList("admin.selectRegions");
  }

  public List<AdminMeetingResponse> selectMeetings() {
    return sqlSession.selectList("admin.selectMeetings");
  }

  public List<AdminReportResponse> selectReports() {
    return sqlSession.selectList("admin.selectReports");
  }

  public int updateMemberStatus(Long userId, String status) {
    return sqlSession.update(
        "admin.updateMemberStatus", Map.of("userId", userId, "status", status));
  }

  public int updateMeetingStatus(Long meetingId, String status) {
    return sqlSession.update(
        "admin.updateMeetingStatus",
        Map.of("meetingId", meetingId, "status", status));
  }

  public int updateReportStatus(Long reportId, String status) {
    return sqlSession.update(
        "admin.updateReportStatus", Map.of("reportId", reportId, "status", status));
  }
}
