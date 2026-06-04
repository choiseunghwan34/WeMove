package kr.co.iei.notification.model.service;

import java.time.LocalDateTime;
import kr.co.iei.admin.model.service.AccountSanctionMessageUtil;
import kr.co.iei.common.websocket.NotificationWebSocketBroadcaster;
import kr.co.iei.notification.model.vo.NotificationRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
  private final NotificationWebSocketBroadcaster notificationWebSocketBroadcaster;

  @Override
  public void sendToUser(Long userId, String type, String title, String message, String sourceId) {
    dispatch(userId, buildRecord(userId, type, title, message, sourceId, false, null, null));
  }

  @Override
  public void sendAccountWarning(Long userId, String reason, String sourceId) {
    String notice = AccountSanctionMessageUtil.buildWarningNotice(reason);
    dispatch(
        userId,
        buildRecord(
            userId, "accountWarning", "관리자 경고", notice, sourceId, false, null, null));
  }

  @Override
  public void sendAccountSuspend(
      Long userId,
      String reason,
      int suspendHours,
      LocalDateTime suspendedUntil,
      String sourceId) {
    String notice =
        AccountSanctionMessageUtil.buildSuspendNotice(reason, suspendHours, suspendedUntil);
    dispatch(
        userId,
        buildRecord(
            userId,
            "accountSuspend",
            "계정 정지 안내",
            notice,
            sourceId,
            true,
            suspendedUntil,
            suspendHours));
  }

  private NotificationRecord buildRecord(
      Long userId,
      String type,
      String title,
      String message,
      String sourceId,
      boolean forceLogout,
      LocalDateTime suspendedUntil,
      Integer suspendHours) {
    NotificationRecord notification = new NotificationRecord();
    notification.setUserId(userId);
    notification.setType(type);
    notification.setTitle(title);
    notification.setMessage(message);
    notification.setSourceId(sourceId);
    notification.setForceLogout(forceLogout);
    notification.setSuspendedUntil(suspendedUntil);
    notification.setSuspendHours(suspendHours);
    notification.setCreatedAt(LocalDateTime.now());
    return notification;
  }

  private void dispatch(Long userId, NotificationRecord notification) {
    if (userId == null || notification.getTitle() == null || notification.getTitle().isBlank()) {
      return;
    }

    Runnable broadcaster =
        () -> notificationWebSocketBroadcaster.sendToUser(userId, notification);

    if (TransactionSynchronizationManager.isSynchronizationActive()) {
      TransactionSynchronizationManager.registerSynchronization(
          new TransactionSynchronization() {
            @Override
            public void afterCommit() {
              broadcaster.run();
            }
          });
      return;
    }

    broadcaster.run();
  }
}
