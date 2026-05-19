package kr.co.iei.comment.model.vo;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Comment {
  private Long commentId;
  private Long meetingId;
  private Long writerId;
  private Long parentCommentId;
  private String content;
  private Boolean isDeleted;
  private LocalDateTime createdAt;
}
