package kr.co.iei.meeting.model.vo;

import java.time.*;
import lombok.Data;

@Data
public class MeetingDetailResponse {
  private Long meetingId;
  private Long hostUserId;
  private String hostNickname;
  private String title;
  private String content;
  private String placeName;
  private String address;
  private String thumbnailImage;
  private LocalDate meetingDate;
  private LocalTime startTime;
  private Integer maxMembers;
  private Integer approvedCount;
  private String status;
  private String sportName;
  private String regionName;
}
