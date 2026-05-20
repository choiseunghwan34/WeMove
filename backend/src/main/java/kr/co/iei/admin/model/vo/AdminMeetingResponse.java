package kr.co.iei.admin.model.vo;

import lombok.Data;

@Data
public class AdminMeetingResponse {
  private Long meetingId;
  private String title;
  private String sportName;
  private String regionName;
  private Integer approvedCount;
  private Integer maxMembers;
  private String status;
  private String hostNickname;
}
