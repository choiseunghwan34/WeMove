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

    public List<DirectChatRoomResponse> selectRooms(Long userId) {
        return sqlSession.selectList("directChat.selectRooms", userId);
    }

    public DirectChatRoomResponse selectRoom(Long roomId, Long userId) {
        return sqlSession.selectOne(
                "directChat.selectRoom",
                Map.of("roomId", roomId, "userId", userId)
        );
    }

    public boolean canAccessDirectChat(Long userId, Long targetUserId) {
        if (userId == null || targetUserId == null || userId.equals(targetUserId)) {
            return false;
        }

        Integer count = sqlSession.selectOne(
                "directChat.canAccessDirectChat",
                Map.of("userId", userId, "targetUserId", targetUserId)
        );

        return count != null && count > 0;
    }

    public Long selectExistingRoomId(Long userId, Long targetUserId) {
        return sqlSession.selectOne(
                "directChat.selectExistingRoomId",
                Map.of("userId", userId, "targetUserId", targetUserId)
        );
    }

    public int insertRoom(DirectChatRoom room) {
        return sqlSession.insert("directChat.insertRoom", room);
    }

    public int insertParticipant(Long roomId, Long userId) {
        return sqlSession.insert(
                "directChat.insertParticipant",
                Map.of("roomId", roomId, "userId", userId)
        );
    }

    public boolean canAccessRoom(Long roomId, Long userId) {
        if (roomId == null || userId == null) {
            return false;
        }

        Integer count = sqlSession.selectOne(
                "directChat.canAccessRoom",
                Map.of("roomId", roomId, "userId", userId)
        );

        return count != null && count > 0;
    }

    public List<DirectChatMessageResponse> selectMessages(Long roomId, int limit) {
        return sqlSession.selectList(
                "directChat.selectMessages",
                Map.of("roomId", roomId, "limit", limit)
        );
    }

    public int insertMessage(DirectChatMessage message) {
        return sqlSession.insert("directChat.insertMessage", message);
    }

    public DirectChatMessageResponse selectMessage(Long messageId) {
        return sqlSession.selectOne("directChat.selectMessage", messageId);
    }
}
