package kr.co.iei.notification.controller;

import java.util.List;
import kr.co.iei.auth.util.JwtTokenProvider;
import kr.co.iei.notification.model.service.NotificationService;
import kr.co.iei.notification.model.vo.NotificationRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
  private final NotificationService notificationService;
  private final JwtTokenProvider jwtTokenProvider;

  @GetMapping
  public ResponseEntity<List<NotificationRecord>> notifications(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    Long userId = resolveUserId(authorization);
    return ResponseEntity.ok(notificationService.getNotifications(userId));
  }

  @GetMapping("/unread-count")
  public ResponseEntity<Integer> unreadCount(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    Long userId = resolveUserId(authorization);
    return ResponseEntity.ok(notificationService.countUnread(userId));
  }

  @PatchMapping("/read-all")
  public ResponseEntity<Void> readAll(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    Long userId = resolveUserId(authorization);
    notificationService.markAllRead(userId);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{notificationId}")
  public ResponseEntity<Void> deleteNotification(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable Long notificationId) {
    Long userId = resolveUserId(authorization);
    notificationService.deleteNotification(userId, notificationId);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping
  public ResponseEntity<Void> deleteAll(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    Long userId = resolveUserId(authorization);
    notificationService.deleteAll(userId);
    return ResponseEntity.ok().build();
  }

  private Long resolveUserId(String authorization) {
    if (authorization != null && authorization.startsWith("Bearer ")) {
      String accessToken = authorization.substring("Bearer ".length());
      if (jwtTokenProvider.isValid(accessToken)) {
        return jwtTokenProvider.parseUserId(accessToken);
      }
    }

    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
  }
}
