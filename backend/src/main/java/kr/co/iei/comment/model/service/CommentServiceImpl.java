package kr.co.iei.comment.model.service;

import java.util.List;
import kr.co.iei.comment.model.dao.CommentDao;
import kr.co.iei.comment.model.vo.*;
import kr.co.iei.meeting.model.dao.MeetingDao;
import kr.co.iei.meeting.model.vo.Meeting;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
  private final CommentDao commentDao;
  private final MeetingDao meetingDao;

  public List<CommentResponse> getComments(Long meetingId) {
    return commentDao.selectComments(meetingId);
  }

  public void createComment(Long meetingId, CommentRequest req) {
    Comment c = new Comment();
    c.setMeetingId(meetingId);
    c.setWriterId(req.getWriterId());
    c.setParentCommentId(req.getParentCommentId());
    c.setContent(req.getContent());
    commentDao.insertComment(c);
  }

  @Override
  public void deleteComment(Long commentId, Long requestId) {
    // 1. 댓글 정보 가져오기
    Comment comment = commentDao.selectCommentById(commentId);
    if (comment == null) {
      throw new IllegalArgumentException("존재하지 않는 댓글입니다.");
    }

    // 2. 모임 정보 가져오기 (주최자가 누군지 확인하기 위함)
    Long hostUserId = meetingDao.selectHostUserId(comment.getMeetingId());
    if (hostUserId == null) {
      throw new IllegalArgumentException("존재하지 않는 모임입니다.");
    }
    // 3. 권한 체크 (작성자이거나 모임 주최자인지 확인)
    boolean isWriter = comment.getWriterId().equals(requestId);
    boolean isHost = hostUserId.equals(requestId);

    if (!isWriter && !isHost) {
      throw new SecurityException("댓글을 삭제할 권한이 없습니다."); // 권한 없을 시 예외 발생
    }

    // 4. 권한이 확인되었으므로 소프트 삭제 진행
    commentDao.softDeleteComment(commentId);
  }


}
