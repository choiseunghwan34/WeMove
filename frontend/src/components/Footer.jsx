import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Link to="/" className="footer-brand">
            WeMove
          </Link>
          <p className="footer-copy">
            오늘 운동, 혼자 말고 같이. 내 주변 운동 모임을 더 자연스럽고 편하게
            연결합니다.
          </p>
        </div>
        <div className="footer-links">
          <Link to="/meetings">모임 찾기</Link>
          <Link to="/meetings/new">모임 만들기</Link>
          <Link to="/mypage">마이페이지</Link>
          <Link to="/admin">관리자</Link>
        </div>
      </div>
    </footer>
  );
}
