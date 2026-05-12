import { adminMembers, meetings, reports, sports } from "../data/demoData";
import styles from "../styles/WeMovePages.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function AdminPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}><div><h1>관리자 페이지</h1><p>회원, 모임 게시글, 신고 내역, 운동 종목을 한 화면에서 관리합니다.</p></div></div>
      <section className={styles.statGrid}>
        <article><span>전체 회원</span><strong>1,248</strong></article>
        <article><span>등록 모임</span><strong>328</strong></article>
        <article><span>대기 신고</span><strong>7</strong></article>
        <article><span>운동 종목</span><strong>{sports.length}</strong></article>
      </section>
      <div className={styles.pageTabs}><button className={styles.active} type="button">회원 관리</button><button type="button">모임 관리</button><button type="button">신고 내역</button><button type="button">운동 종목</button></div>
      <section className={styles.tableCard}>
        <div className={styles.tableHead}><div><h2>회원 관리</h2><p>회원 상태와 권한을 확인하는 백오피스 테이블입니다.</p></div><button type="button">회원 검색</button></div>
        <table><thead><tr><th>회원 ID</th><th>닉네임</th><th>지역</th><th>관심 운동</th><th>권한</th><th>상태</th><th>관리</th></tr></thead><tbody>{adminMembers.map((member) => <tr key={member.id}><td>{member.id}</td><td>{member.nickname}</td><td>{member.region}</td><td>{member.sports}</td><td>{member.role}</td><td><span className={cx("badge", member.status === "SUSPENDED" ? "warning" : "success")}>{member.status}</span></td><td><button type="button">상세</button></td></tr>)}</tbody></table>
      </section>
      <section className={styles.tableCard}>
        <div className={styles.tableHead}><div><h2>모임 관리</h2><p>MEETINGS 테이블에 저장되는 모집글을 관리합니다.</p></div><button type="button">모임 등록</button></div>
        <table><thead><tr><th>모임 ID</th><th>제목</th><th>종목</th><th>지역</th><th>인원</th><th>상태</th><th>관리</th></tr></thead><tbody>{meetings.map((meeting) => <tr key={meeting.id}><td>M{String(meeting.id).padStart(3, "0")}</td><td>{meeting.title}</td><td>{meeting.sport}</td><td>{meeting.region}</td><td>{meeting.current}/{meeting.max}</td><td><span className={cx("badge", meeting.status === "CLOSED" ? "warning" : "success")}>{meeting.statusText}</span></td><td><button type="button">상세</button></td></tr>)}</tbody></table>
      </section>
      <section className={styles.tableCard}>
        <div className={styles.tableHead}><div><h2>신고 내역</h2><p>부적절한 모임 글이나 사용자 신고를 확인하고 처리합니다.</p></div><button type="button">처리 완료 보기</button></div>
        <table><thead><tr><th>신고 ID</th><th>신고자</th><th>대상</th><th>사유</th><th>상태</th><th>처리</th></tr></thead><tbody>{reports.map((report) => <tr key={report.id}><td>{report.id}</td><td>{report.reporter}</td><td>{report.target}</td><td>{report.reason}</td><td><span className={cx("badge", report.status === "PENDING" ? "warning" : "success")}>{report.status}</span></td><td><button type="button">처리</button></td></tr>)}</tbody></table>
      </section>
    </div>
  );
}
