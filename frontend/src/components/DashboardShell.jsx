import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UiIcon from "./UiIcon";
import { interestItems, navItems } from "../data/dashboardData";
import styles from "../styles/DashboardShell.module.css";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardShell({
  active = "",
  title,
  description,
  sidebarExtra = null,
  aside = null,
  children,
}) {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <span>W</span>
          <strong>WeMove</strong>
        </Link>

        <label className={styles.dashboardSearch}>
          <UiIcon name="search" className={styles.dashboardSearchIcon} />
          <input placeholder="모임, 지역, 운동 종목을 검색해보세요" />
        </label>

        <div className={styles.dashboardActions}>
          {loading ? null : user ? (
            <>
              <span className={styles.dashboardUserName}>
                {user.nickname || user.loginId}
              </span>
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
            {navItems.map((item) => (
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
          </nav>

          <section className={styles.dashboardInterestCard}>
            <div className={styles.dashboardSidebarHead}>
              <strong>관심 운동</strong>
            </div>
            <div className={styles.dashboardInterestList}>
              {interestItems.map((item) => (
                <span key={item.label}>
                  <i>
                    <UiIcon
                      name={item.icon}
                      className={styles.dashboardInterestIcon}
                    />
                  </i>
                  {item.label}
                </span>
              ))}
            </div>
          </section>

          {sidebarExtra}
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

        <aside className={styles.dashboardAside}>{aside}</aside>
      </div>
    </div>
  );
}
