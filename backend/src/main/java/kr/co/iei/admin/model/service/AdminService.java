package kr.co.iei.admin.model.service;

import java.util.List;
import kr.co.iei.admin.model.vo.*;

public interface AdminService {
  AdminSummary getSummary();

  List<AdminMemberResponse> getMembers();

  List<AdminMeetingResponse> getMeetings();

  List<AdminReportResponse> getReports();

  void resolveReport(Long reportId);

  void rejectReport(Long reportId);
}
