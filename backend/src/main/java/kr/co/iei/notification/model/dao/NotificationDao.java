package kr.co.iei.notification.model.dao;

import kr.co.iei.notification.model.vo.NotificationRecord;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class NotificationDao {
  private final SqlSession sqlSession;

  public int insertNotification(NotificationRecord notification) {
    return sqlSession.insert("notification.insertNotification", notification);
  }
}
