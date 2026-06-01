package kr.co.iei.chat.model.dao;

import kr.co.iei.chat.model.vo.ChatMessage;
import kr.co.iei.chat.model.vo.ChatMessageResponse;
import kr.co.iei.chat.model.vo.ChatRoomResponse;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;


@Repository
@RequiredArgsConstructor
public class DirectChatDao {

    private final SqlSession sqlSession;

    public boolean canAccessDirectChat(Long userId1, Long userId2) {
        if (userId1 == null || userId2 == null || userId1.equals(userId2)) {
            return false;
        }
        
        Integer count =
                sqlSession.selectOne(
                        "chat.canAccessDirectChat", Map.of("userId1", userId1, "userId2", userId2));
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
