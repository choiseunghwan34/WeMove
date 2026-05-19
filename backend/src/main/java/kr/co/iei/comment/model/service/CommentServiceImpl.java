package kr.co.iei.comment.model.service;

import java.util.List;
import kr.co.iei.comment.model.dao.CommentDao;
import kr.co.iei.comment.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
  private final CommentDao commentDao;

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

  public void deleteComment(Long commentId) {
    commentDao.softDeleteComment(commentId);
  }
}
