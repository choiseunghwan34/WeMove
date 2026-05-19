import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="inner">
        <Link to="/" className="logo">
          WeMove
        </Link>

        <nav className="main-nav">
          <Link to="/meetings">모임 찾기</Link>
          <Link to="/meetings/new">모임 생성</Link>
          <Link to="/mypage">마이페이지</Link>
          <Link to="/admin">관리자</Link>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="header-login">
            로그인
          </Link>
          <Link to="/signup" className="header-signup">
            회원가입
          </Link>
        </div>
      </div>
    </header>
  );
}
