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

  // Pagination fields
  private int page = 1;
  private int size = 10;

  public int getOffset() {
    return (page - 1) * size;
  }
}
