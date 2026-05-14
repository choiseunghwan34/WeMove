import { adminMembers, meetings, reports, sports } from "../data/demoData";
import styles from "../styles/AdminPage.module.css";

const cx = (...names) => names.filter(Boolean).map((name) => styles[name]).join(" ");

export default function AdminPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <div>
          <h1>관리자 페이지</h1>
          <p>회원, 모임, 신고, 운동 종목을 실제 백오피스처럼 한 화면에서 관리할 수 있도록 구성했습니다.</p>
        </div>
      </div>

      <section className={styles.statGrid}>
        <article><span>전체 회원</span><strong>1,248</strong></article>
        <article><span>등록 모임</span><strong>328</strong></article>
        <article><span>대기 신고</span><strong>7</strong></article>
        <article><span>운동 종목</span><strong>{sports.length}</strong></article>
      </section>

      <div className={styles.pageTabs}>
        <button className={cx("tabButton", "tabButtonActive")} type="button">회원 관리</button>
        <button className={styles.tabButton} type="button">모임 관리</button>
        <button className={styles.tabButton} type="button">신고 내역</button>
        <button className={styles.tabButton} type="button">운동 종목</button>
      </div>

      <section className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <h2>회원 관리</h2>
            <p>회원 상태와 권한을 확인하고 운영 이슈를 빠르게 대응할 수 있습니다.</p>
          </div>
          <button type="button">회원 검색</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>회원 ID</th>
              <th>닉네임</th>
              <th>로그인 ID</th>
              <th>지역</th>
              <th>권한</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {adminMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.nickname}</td>
                <td>{member.loginId}</td>
                <td>{member.region}</td>
                <td>{member.role}</td>
                <td><span className={cx("badge", member.status === "SUSPENDED" ? "warning" : "success")}>{member.status}</span></td>
                <td><button type="button">상세</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <h2>모임 관리</h2>
            <p>등록된 모임 상태와 모집 현황을 빠르게 확인할 수 있는 운영 테이블입니다.</p>
          </div>
          <button type="button">모임 등록</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>모임 ID</th>
              <th>제목</th>
              <th>종목</th>
              <th>지역</th>
              <th>인원</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id}>
                <td>M{String(meeting.id).padStart(3, "0")}</td>
                <td>{meeting.title}</td>
                <td>{meeting.sport}</td>
                <td>{meeting.region}</td>
                <td>{meeting.current}/{meeting.max}</td>
                <td><span className={cx("badge", meeting.status === "CLOSED" ? "warning" : "success")}>{meeting.statusText}</span></td>
                <td><button type="button">상세</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <h2>신고 내역</h2>
            <p>대기 중인 신고를 확인하고 적절하게 처리할 수 있도록 구성했습니다.</p>
          </div>
          <button type="button">처리 완료 보기</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>신고 ID</th>
              <th>대상</th>
              <th>사유</th>
              <th>상태</th>
              <th>등록일</th>
              <th>처리</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.target}</td>
                <td>{report.reason}</td>
                <td><span className={cx("badge", report.status === "PENDING" ? "warning" : "success")}>{report.status}</span></td>
                <td>{report.createdAt}</td>
                <td><button type="button">처리</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
