package kr.co.iei.chat.model.dao;

import java.util.List;
import java.util.Map;
import kr.co.iei.chat.model.vo.ChatMessage;
import kr.co.iei.chat.model.vo.ChatMessageResponse;
import kr.co.iei.chat.model.vo.ChatRoomResponse;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatDao {
  private final SqlSession sqlSession;

  public boolean canAccessMeetingChat(Long meetingId, Long userId) {
    Integer count =
        sqlSession.selectOne(
            "chat.canAccessMeetingChat", Map.of("meetingId", meetingId, "userId", userId));
    return count != null && count > 0;
  }

  public List<ChatRoomResponse> selectChatRooms(Long userId) {
    return sqlSession.selectList("chat.selectChatRooms", userId);
  }

  public List<ChatMessageResponse> selectMessages(Long meetingId, int limit) {
    return sqlSession.selectList("chat.selectMessages", Map.of("meetingId", meetingId, "limit", limit));
  }

  public int insertMessage(ChatMessage message) {
    return sqlSession.insert("chat.insertMessage", message);
  }

  public ChatMessageResponse selectMessage(Long messageId) {
    return sqlSession.selectOne("chat.selectMessage", messageId);
  }
}
