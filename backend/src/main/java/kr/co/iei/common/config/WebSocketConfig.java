package kr.co.iei.common.config;

import kr.co.iei.chat.websocket.DirectChatWebSocketHandler;
import kr.co.iei.common.websocket.CommonWebSocketHandler;
import kr.co.iei.chat.websocket.MeetingChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
  private final CommonWebSocketHandler commonWebSocketHandler;
  private final MeetingChatWebSocketHandler meetingChatWebSocketHandler;
  private final DirectChatWebSocketHandler directChatWebSocketHandler;

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry
        .addHandler(commonWebSocketHandler, "/ws/email-verifications")
        .setAllowedOrigins("http://localhost:5173", "http://127.0.0.1:5173");

    registry
        .addHandler(meetingChatWebSocketHandler, "/ws/meeting-chat")
        .setAllowedOrigins("http://localhost:5173", "http://127.0.0.1:5173");

    registry
        .addHandler(directChatWebSocketHandler, "/ws/direct-chat")
        .setAllowedOrigins("http://localhost:5173", "http://127.0.0.1:5173");

  }
}
