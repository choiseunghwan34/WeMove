package kr.co.iei.notification.model.service;

import java.time.LocalDateTime;

public interface NotificationService {
  void sendToUser(Long userId, String type, String title, String message, String sourceId);

  void sendAccountWarning(Long userId, String reason, String sourceId);

  void sendAccountSuspend(
      Long userId, String reason, int suspendHours, LocalDateTime suspendedUntil, String sourceId);
}
