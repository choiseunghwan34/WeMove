package kr.co.iei.admin.model.service;

import java.util.List;
import kr.co.iei.admin.model.dao.AdminDao;
import kr.co.iei.admin.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
  private final AdminDao adminDao;

  public AdminSummary getSummary() {
    return adminDao.selectSummary();
  }

  public List<AdminMemberResponse> getMembers() {
    return adminDao.selectMembers();
  }

  public List<AdminRegionResponse> getRegions() {
    return adminDao.selectRegions();
  }

  public List<AdminMeetingResponse> getMeetings() {
    return adminDao.selectMeetings();
  }

  public List<AdminReportResponse> getReports() {
    return adminDao.selectReports();
  }

  public void updateMemberStatus(Long userId, String status) {
    adminDao.updateMemberStatus(userId, status);
  }

  public void updateMeetingStatus(Long meetingId, String status) {
    adminDao.updateMeetingStatus(meetingId, status);
  }

  public void resolveReport(Long reportId) {
    adminDao.updateReportStatus(reportId, "RESOLVED");
  }

  public void rejectReport(Long reportId) {
    adminDao.updateReportStatus(reportId, "REJECTED");
  }
}
