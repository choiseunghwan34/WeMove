package kr.co.iei.chat.model.service;

import kr.co.iei.chat.model.dao.DirectChatDao;
import kr.co.iei.chat.model.vo.*;
import kr.co.iei.chat.websocket.DirectChatBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DirectChatServiceImpl implements DirectChatService {
  private static final int MESSAGE_LIMIT = 100;
  private static final int MAX_CONTENT_LENGTH = 1000;

  private final DirectChatDao directChatDao;
  private final DirectChatBroadcaster directChatBroadcaster;

  @Override
  public List<DirectChatRoomResponse> getRooms(Long userId) {
    if (userId == null) {
      throw new IllegalArgumentException("로그인이 필요합니다.");
    }
    return directChatDao.selectRooms(userId);
  }

  @Override
  @Transactional
  public DirectChatRoomResponse createRoom(Long userId, DirectChatRoomCreateRequest request) {
    Long targetUserId = request == null ? null : request.getTargetUserId();

    if (userId == null) {
      throw new IllegalArgumentException("로그인이 필요합니다.");
    }
    if (targetUserId == null) {
      throw new IllegalArgumentException("대화 상대를 선택해주세요.");
    }
    if (userId.equals(targetUserId)) {
      throw new IllegalArgumentException("자기 자신에게는 1대1 대화를 보낼 수 없습니다.");
    }

    if (!directChatDao.canAccessDirectChat(userId, targetUserId)) {
      throw new ResponseStatusException(
              HttpStatus.FORBIDDEN,
              "같은 모임의 참가자에게만 개인 메시지를 보낼 수 있습니다."
      );
    }

    Long existingRoomId = directChatDao.selectExistingRoomId(userId, targetUserId);
    if (existingRoomId != null) {
      return directChatDao.selectRoom(existingRoomId, userId);
    }

    DirectChatRoom room = new DirectChatRoom();
    directChatDao.insertRoom(room);

    directChatDao.insertParticipant(room.getRoomId(), userId);
    directChatDao.insertParticipant(room.getRoomId(), targetUserId);

    return directChatDao.selectRoom(room.getRoomId(), userId);
  }

  @Override
  public List<DirectChatMessageResponse> getMessages(Long roomId, Long userId) {
    assertCanAccess(roomId, userId);
    return directChatDao.selectMessages(roomId, MESSAGE_LIMIT);
  }

  @Override
  @Transactional
  public DirectChatMessageResponse createMessage(
          Long roomId, Long userId, ChatMessageRequest request) {
    assertCanAccess(roomId, userId);

    String content = request == null ? "" : normalizeContent(request.getContent());
    if (content.isBlank()) {
      throw new IllegalArgumentException("메시지를 입력해주세요.");
    }
    if (content.length() > MAX_CONTENT_LENGTH) {
      throw new IllegalArgumentException("메시지는 1000자 이하로 입력해주세요.");
    }

    DirectChatMessage message = new DirectChatMessage();
    message.setRoomId(roomId);
    message.setSenderId(userId);
    message.setContent(content);
    message.setMessageType("TEXT");

    directChatDao.insertMessage(message);

    DirectChatMessageResponse savedMessage =
            directChatDao.selectMessage(message.getMessageId());

    directChatBroadcaster.broadcast(
            roomId,
            new ChatMessageEvent("DIRECT_CHAT_MESSAGE_CREATED", savedMessage)
    );

    return savedMessage;
  }

  @Override
  public boolean canAccess(Long roomId, Long userId) {
    if (roomId == null || userId == null) {
      return false;
    }
    return directChatDao.canAccessRoom(roomId, userId);
  }

  private void assertCanAccess(Long roomId, Long userId) {
    if (!canAccess(roomId, userId)) {
      throw new ResponseStatusException(
              HttpStatus.FORBIDDEN,
              "참여 중인 1대1 대화방만 사용할 수 있습니다."
      );
    }
  }

  private String normalizeContent(String content) {
    return String.valueOf(content == null ? "" : content).trim();
  }
}