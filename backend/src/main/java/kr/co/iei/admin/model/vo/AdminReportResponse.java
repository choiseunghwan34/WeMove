package kr.co.iei.admin.model.vo;

import lombok.Data;

@Data
public class AdminReportResponse {
  private Long reportId;
  private String reason;
  private String status;
  private java.time.LocalDateTime createdAt;
  private Integer targetUserId;
  private String targetName;
}
