package kr.co.iei.chat.model.vo;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class ChatRoomResponse {
  private Long meetingId;
  private String title;
  private String sportName;
  private String regionName;
  private LocalDate meetingDate;
  private LocalTime startTime;
  private Long lastMessageId;
  private String lastMessage;
  private String lastMessageAt;
}
