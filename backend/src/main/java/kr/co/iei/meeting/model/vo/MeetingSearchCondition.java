package kr.co.iei.meeting.model.vo;

import lombok.Data;

import java.util.List;

@Data
public class MeetingSearchCondition {
  private Long sportId;
  private Long regionId;
  private String status;
  private String keyword;
  private String sort;
  private String sportName;
  private List<String> fixedSports;
  private String meetingDate;
}
