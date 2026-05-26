import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import defaultUserImage from "../assets/image/Default-user.png";
import { interestItems, navItems } from "../data/dashboardData";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/DashboardShell.module.css";
import UiIcon from "./UiIcon";
import WeMoveLogo from "./WeMoveLogo";

export default function DashboardShell({
  active = "",
  title,
  description,
  sidebarInterestItems,
  sidebarExtra = null,
  aside = null,
  children,
}) {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInterestExpanded, setIsInterestExpanded] = useState(false);
  const isAdmin = user?.role === "ADMIN";
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

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.dashboardHeader}>
        <Link to="/" className={styles.dashboardLogo} onClick={closeMenu}>
          <WeMoveLogo tone="dark" size="md" />
        </Link>

        <label className={styles.dashboardSearch}>
          <UiIcon name="search" className={styles.dashboardSearchIcon} />
          <input placeholder="모임, 지역, 운동 종목을 검색해보세요" />
        </label>

        <div className={styles.dashboardActions}>
          {loading ? null : user ? (
            <>
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
