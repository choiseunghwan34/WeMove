package kr.co.iei.meeting.model.vo;

import java.time.*;
import lombok.Data;

@Data
public class MeetingListResponse {
  private Long meetingId;
  private String title;
  private String placeName;
  private LocalDate meetingDate;
  private LocalTime startTime;
  private Integer maxMembers;
  private Integer approvedCount;
  private String status;
  private String sportName;
  private String regionName;
  private String content;
  private String address;
  private String thumbnailImage;
  private String meetingHostName;
}
