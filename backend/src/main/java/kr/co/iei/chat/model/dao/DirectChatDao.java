package kr.co.iei.chat.model.dao;


import java.util.List;
import java.util.Map;
import kr.co.iei.chat.model.vo.DirectChatMessage;
import kr.co.iei.chat.model.vo.DirectChatMessageResponse;
import kr.co.iei.chat.model.vo.DirectChatRoom;
import kr.co.iei.chat.model.vo.DirectChatRoomResponse;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;


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
                        "directChat.canAccessDirectChat", Map.of("userId1", userId1, "userId2", userId2));
        return count != null && count > 0;
    }

    public List<DirectChatRoomResponse> selectRooms(Long userId) {
        return sqlSession.selectList("directChat.selectRooms", userId);
    }
    public DirectChatRoomResponse selectRoom(Long roomId, Long userId){
        return sqlSession.selectOne("directChat.selectRoom", Map.of("roomId", roomId, "userId", userId));
    }

    public Long selectExistingRoomId(Long userId1, Long userId2) {
        return sqlSession.selectOne("directChat.selectExistingRoomId", Map.of("userId1", userId1, "userId2", userId2));
    }
    public int insertRoom(DirectChatRoom room) {
        return sqlSession.insert("directChat.insertRoom", room);
    }
    //public int

    public List<DirectChatMessageResponse> selectMessages(Long roomId, int limit) {
        return sqlSession.selectList("directChat.selectMessages", Map.of("roomId", roomId, "limit", limit));
    }

    public int insertMessage(DirectChatMessage message) {
        return sqlSession.insert("directChat.insertMessage", message);
    }

    public DirectChatMessageResponse selectMessage(Long messageId) {
        return sqlSession.selectOne("directChat.selectMessage", messageId);
    }
}
