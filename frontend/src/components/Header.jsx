import { Link, useNavigate } from "react-router-dom";
import defaultUserImage from "../assets/image/Default-user.png";
import { useAuth } from "../contexts/AuthContext";
import WeMoveLogo from "./WeMoveLogo";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const profileImage =
    typeof user?.profileImage === "string" && user.profileImage.trim()
      ? user.profileImage.trim()
      : defaultUserImage;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="inner">
        <Link to="/" className="logo">
          <WeMoveLogo tone="dark" size="md" />
        </Link>

        <nav className="main-nav">
          <Link to="/meetings">모임 찾기</Link>
          <Link to="/meetings/new">모임 생성</Link>
          <Link to="/mypage">마이페이지</Link>
          {isAdmin ? <Link to="/admin">관리자</Link> : null}
        </nav>

        <div className="header-actions">
          {loading ? null : user ? (
            <>
              <div className="header-user-info">
                <img
                  src={profileImage}
                  alt={user.nickname ? `${user.nickname} 프로필` : "기본 프로필"}
                  className="header-user-avatar"
                />
                <span className="header-user-name">
                  {user.nickname || user.loginId}
                </span>
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
