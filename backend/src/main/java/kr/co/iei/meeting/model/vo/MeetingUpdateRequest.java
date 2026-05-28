package kr.co.iei.meeting.model.vo;

import java.sql.Time;
import java.time.*;
import java.util.TimeZone;

import lombok.Data;

@Data
public class MeetingUpdateRequest {
  private String title;
  private String content;
  private String placeName;
  private String address;
  private LocalDate meetingDate;
  private LocalTime startTime;
  private Integer maxMembers;
  private String status;
  private String guideText;
  private String supplies;
}
