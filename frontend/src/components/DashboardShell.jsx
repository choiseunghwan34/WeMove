import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import defaultUserImage from "../assets/image/Default-user.png";
import { interestItems, navItems } from "../data/dashboardData";
import { useAuth } from "../contexts/AuthContext";
import { WEMOVE_NOTIFICATION_EVENT } from "../utils/notificationEvents";
import styles from "../styles/DashboardShell.module.css";
import UiIcon from "./UiIcon";
import WeMoveLogo from "./WeMoveLogo";

export default function DashboardShell({
  active = "",
  title,
  description,
  headerSearchValue,
  onHeaderSearchChange,
  onHeaderSearchSubmit,
  headerSearchPlaceholder = "모임, 지역, 운동 종목을 검색해보세요",
  sidebarInterestItems,
  sidebarExtra = null,
  aside = null,
  children,
}) {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInterestExpanded, setIsInterestExpanded] = useState(false);
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const isAdmin = user?.role === "ADMIN";
  const searchValue =
    typeof headerSearchValue === "string" ? headerSearchValue : internalSearchValue;
  const profileImage =
    typeof user?.profileImage === "string" && user.profileImage.trim()
      ? user.profileImage.trim()
      : defaultUserImage;
  const visibleNavItems = isAdmin
    ? navItems.filter((item) => item.to === "/" || item.to === "/meetings")
    : navItems;
  const effectiveInterestItems =
    sidebarInterestItems === undefined ? interestItems : sidebarInterestItems;
  const visibleInterestItems = isInterestExpanded
    ? effectiveInterestItems
    : effectiveInterestItems.slice(0, 5);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
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

  const handleSearchChange = (event) => {
    if (onHeaderSearchChange) {
      onHeaderSearchChange(event);
      return;
    }

    setInternalSearchValue(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = searchValue.trim();

    if (onHeaderSearchSubmit) {
      onHeaderSearchSubmit(keyword);
      return;
    }

    navigate(keyword ? `/search?q=${encodeURIComponent(keyword)}` : "/search");
  };

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.dashboardHeader}>
        <Link to="/" className={styles.dashboardLogo} onClick={closeMenu}>
          <WeMoveLogo tone="dark" size="md" />
        </Link>

        <form className={styles.dashboardSearch} onSubmit={handleSearchSubmit}>
          <UiIcon name="search" className={styles.dashboardSearchIcon} />
          <input
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={headerSearchPlaceholder}
          />
        </form>

        <div className={styles.dashboardActions}>
          {loading ? null : user ? (
            <>
              <div className={styles.dashboardNotification} ref={notificationRef}>
                <button
                  type="button"
                  className={styles.dashboardNotificationButton}
                  onClick={toggleNotifications}
                  aria-label="알림"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 21.5a2.6 2.6 0 0 0 2.4-1.6H9.6a2.6 2.6 0 0 0 2.4 1.6ZM5.7 17.8h12.6c.7 0 1.1-.8.7-1.4l-1.2-1.8V10a5.8 5.8 0 0 0-4.4-5.6 1.5 1.5 0 0 0-2.8 0A5.8 5.8 0 0 0 6.2 10v4.6L5 16.4c-.4.6 0 1.4.7 1.4Z" />
                  </svg>
                  {unreadCount > 0 ? (
                    <span className={styles.dashboardNotificationBadge}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {isNotificationOpen ? (
                  <section className={styles.dashboardNotificationMenu}>
                    <div className={styles.dashboardNotificationHead}>
                      <strong>알림</strong>
                      <span>{notifications.length}개</span>
                    </div>
                    <div className={styles.dashboardNotificationList}>
                      {notifications.length ? (
                        notifications.map((notification) => (
                          <article
                            key={notification.id}
                            className={styles.dashboardNotificationItem}
                          >
                            <strong>{notification.title}</strong>
                            {notification.message ? <p>{notification.message}</p> : null}
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
                        <p className={styles.dashboardNotificationEmpty}>
                          아직 받은 알림이 없습니다.
                        </p>
                      )}
                    </div>
                  </section>
                ) : null}
              </div>
              <div className={styles.dashboardUserInfo}>
                <img
                  src={profileImage}
                  alt={user.nickname ? `${user.nickname} 프로필` : "기본 프로필"}
                  className={styles.dashboardUserAvatar}
                />
                <span className={styles.dashboardUserName}>
                  {user.nickname || user.loginId}
                </span>
              </div>
              <button
                type="button"
                className={styles.dashboardSignupButton}
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.dashboardLoginButton}>
                로그인
              </Link>
              <Link to="/signup" className={styles.dashboardSignupButton}>
                회원가입
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={styles.mobileMenuButton}
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {isMenuOpen ? (
        <button
          type="button"
          className={styles.mobileMenuBackdrop}
          aria-label="메뉴 닫기"
          onClick={closeMenu}
        />
      ) : null}

      <div className={styles.dashboardShell}>
        <aside
          className={`${styles.dashboardSidebar} ${
            isMenuOpen ? styles.dashboardSidebarOpen : ""
          }`}
        >
          <div className={styles.mobileDrawerHead}>
            <strong>메뉴</strong>
            <button type="button" onClick={closeMenu} aria-label="메뉴 닫기">
              닫기
            </button>
          </div>

          <nav className={styles.dashboardNav}>
            {visibleNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={
                  active === item.label
                    ? styles.dashboardNavItemActive
                    : styles.dashboardNavItem
                }
                onClick={closeMenu}
              >
                <UiIcon name={item.icon} className={styles.dashboardNavIcon} />
                <span>{item.label}</span>
              </Link>
            ))}
            {isAdmin ? (
              <Link
                to="/admin"
                className={
                  active === "관리자페이지"
                    ? styles.dashboardNavItemActive
                    : styles.dashboardNavItem
                }
                onClick={closeMenu}
              >
                <UiIcon name="spark" className={styles.dashboardNavIcon} />
                <span>관리자페이지</span>
              </Link>
            ) : null}
          </nav>

          {!isAdmin ? (
            <section className={styles.dashboardInterestCard}>
              <div className={styles.dashboardSidebarHead}>
                <strong>관심 운동</strong>
              </div>
              <div className={styles.dashboardInterestList}>
                {visibleInterestItems.length ? (
                  visibleInterestItems.map((item) => (
                    <span key={item.label}>
                      <i>
                        <UiIcon
                          name={item.icon || "spark"}
                          className={styles.dashboardInterestIcon}
                        />
                      </i>
                      {item.label}
                    </span>
                  ))
                ) : (
                  <span>미설정</span>
                )}
              </div>
              {effectiveInterestItems.length > 5 ? (
                <button
                  type="button"
                  className={styles.dashboardInterestMore}
                  onClick={() => setIsInterestExpanded((current) => !current)}
                >
                  {isInterestExpanded
                    ? "접기"
                    : `더보기 ${effectiveInterestItems.length - 5}개`}
                </button>
              ) : null}
            </section>
          ) : null}

          {!isAdmin ? sidebarExtra : null}
        </aside>

        <main className={styles.dashboardMain}>
          {(title || description) && (
            <section className={styles.dashboardPageIntro}>
              {title ? <h1>{title}</h1> : null}
              {description ? <p>{description}</p> : null}
            </section>
          )}
          {children}
        </main>

        <aside className={styles.dashboardAside}>{!isAdmin ? aside : null}</aside>
      </div>
    </div>
  );
}
