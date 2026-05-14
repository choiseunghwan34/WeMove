import { Link } from "react-router-dom";
import UiIcon from "./UiIcon";
import { interestItems, navItems } from "../data/dashboardData";
import styles from "../styles/DashboardShell.module.css";

export default function DashboardShell({
  active = "홈",
  title,
  description,
  sidebarExtra = null,
  aside = null,
  children,
}) {
  return (
    <div className={styles.dashboardPage}>
      <header className={styles.dashboardHeader}>
        <Link to="/" className={styles.dashboardLogo}>
          <span>W</span>
          <strong>WeMove</strong>
        </Link>

        <label className={styles.dashboardSearch}>
          <UiIcon name="search" className={styles.dashboardSearchIcon} />
          <input placeholder="모임, 지역, 운동 종목을 검색해보세요" />
        </label>

        <div className={styles.dashboardActions}>
          <Link to="/login" className={styles.dashboardLoginButton}>로그인</Link>
          <Link to="/signup" className={styles.dashboardSignupButton}>회원가입</Link>
        </div>
      </header>

      <div className={styles.dashboardShell}>
        <aside className={styles.dashboardSidebar}>
          <nav className={styles.dashboardNav}>
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={active === item.label ? styles.dashboardNavItemActive : styles.dashboardNavItem}
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
                  <i><UiIcon name={item.icon} className={styles.dashboardInterestIcon} /></i>
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

        <aside className={styles.dashboardAside}>
          {aside}
        </aside>
      </div>
    </div>
  );
}
