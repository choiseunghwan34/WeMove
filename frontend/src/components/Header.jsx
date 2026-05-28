import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import defaultUserImage from "../assets/image/Default-user.png";
import { useAuth } from "../contexts/AuthContext";
import { WEMOVE_NOTIFICATION_EVENT } from "../utils/notificationEvents";
import WeMoveLogo from "./WeMoveLogo";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const isAdmin = user?.role === "ADMIN";
  const isAdminPage = location.pathname.startsWith("/admin");
  const profileImage =
    typeof user?.profileImage === "string" && user.profileImage.trim()
      ? user.profileImage.trim()
      : defaultUserImage;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleNotification = (event) => {
      const notification = event.detail;
      if (!notification?.title) {
        return;
      }

      setNotifications((current) => [notification, ...current].slice(0, 20));
      setUnreadCount((current) => current + 1);
    };

    window.addEventListener(WEMOVE_NOTIFICATION_EVENT, handleNotification);
    return () => {
      window.removeEventListener(WEMOVE_NOTIFICATION_EVENT, handleNotification);
    };
  }, []);

  useEffect(() => {
    if (!isNotificationOpen) {
      return undefined;
    }

    const closeOnOutsideClick = (event) => {
      if (notificationRef.current?.contains(event.target)) {
        return;
      }

      setIsNotificationOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [isNotificationOpen]);

  const toggleNotifications = () => {
    setIsNotificationOpen((current) => !current);
    setUnreadCount(0);
  };

  const handleAdminSectionMove = (section) => {
    navigate(`/admin#${section}`);
    window.setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const userNavItems = [
    { to: "/meetings", label: "모임 찾기" },
    { to: "/meetings/new", label: "모임 생성" },
    { to: "/mypage", label: "마이페이지" },
    ...(isAdmin ? [{ to: "/admin", label: "관리자" }] : []),
  ];

  const adminNavItems = [
    { label: "홈", action: () => navigate("/") },
    { label: "회원 관리", action: () => handleAdminSectionMove("members") },
    { label: "모임 관리", action: () => handleAdminSectionMove("meetings") },
    { label: "신고 내역", action: () => handleAdminSectionMove("reports") },
    { label: "운동 종목", action: () => handleAdminSectionMove("sports") },
  ];

  return (
    <header className="header">
      <div className="inner">
        <Link to="/" className="logo">
          <WeMoveLogo tone="dark" size="md" />
        </Link>

        <nav className="main-nav">
          {isAdminPage
            ? adminNavItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="main-nav-button"
                  onClick={item.action}
                >
                  {item.label}
                </button>
              ))
            : userNavItems.map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
        </nav>

        <div className="header-actions">
          {loading ? null : user ? (
            <>
              <div className="header-notification" ref={notificationRef}>
                <button
                  type="button"
                  className="header-notification-button"
                  onClick={toggleNotifications}
                  aria-label="알림"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 21.5a2.6 2.6 0 0 0 2.4-1.6H9.6a2.6 2.6 0 0 0 2.4 1.6ZM5.7 17.8h12.6c.7 0 1.1-.8.7-1.4l-1.2-1.8V10a5.8 5.8 0 0 0-4.4-5.6 1.5 1.5 0 0 0-2.8 0A5.8 5.8 0 0 0 6.2 10v4.6L5 16.4c-.4.6 0 1.4.7 1.4Z" />
                  </svg>
                  {unreadCount > 0 ? (
                    <span className="header-notification-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {isNotificationOpen ? (
                  <section className="header-notification-menu">
                    <div className="header-notification-head">
                      <strong>알림</strong>
                      <span>{notifications.length}개</span>
                    </div>
                    <div className="header-notification-list">
                      {notifications.length ? (
                        notifications.map((notification) => (
                          <article
                            key={notification.id}
                            className="header-notification-item"
                          >
                            <strong>{notification.title}</strong>
                            {notification.message ? (
                              <p>{notification.message}</p>
                            ) : null}
                            <time>
                              {notification.createdAt
                                ? String(notification.createdAt)
                                    .replace("T", " ")
                                    .slice(0, 16)
                                : ""}
                            </time>
                          </article>
                        ))
                      ) : (
                        <p className="header-notification-empty">
                          아직 받은 알림이 없습니다.
                        </p>
                      )}
                    </div>
                  </section>
                ) : null}
              </div>
              <div className="header-user-info">
                <img
                  src={profileImage}
                  alt={user.nickname ? `${user.nickname} 프로필` : "기본 프로필"}
                  className="header-user-avatar"
                />
                <span className="header-user-name">{user.nickname || user.loginId}</span>
              </div>
              <button
                type="button"
                className="header-signup"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-login">
                로그인
              </Link>
              <Link to="/signup" className="header-signup">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
