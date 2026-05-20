import { useEffect, useMemo, useState } from "react";
import {
  getAdminMeetings,
  getAdminMembers,
  getAdminReports,
  getSummary,
} from "../api/adminApi";
import { getRegions } from "../api/regionApi";
import { adminMembers, meetings, reports, sports } from "../data/demoData";
import styles from "../styles/AdminPage.module.css";

const cx = (...names) =>
  names
    .filter(Boolean)
    .map((name) => styles[name])
    .join(" ");

const ALL_SIDO = "전체 시도";
const ALL_SIGUNGU = "전체 시군구";
const ALL_DONG = "전체 읍면동";

const normalizeText = (value = "") => value.trim();

const isSameRegionPart = (left = "", right = "") =>
  !left || !right || left === right || left.startsWith(right) || right.startsWith(left);

const parseRegionLabel = (label = "") => {
  const [sido = "", sigungu = "", dong = ""] = normalizeText(label).split(/\s+/);
  return { sido, sigungu, dong };
};

const toRegionKey = (region) => [region.sido, region.sigungu, region.dong].join("|");

const buildFallbackRegions = () => {
  const regionMap = new Map();

  [...adminMembers, ...meetings].forEach((item) => {
    const parsed = parseRegionLabel(item.region);

    if (parsed.sido && parsed.sigungu && parsed.dong) {
      regionMap.set(toRegionKey(parsed), parsed);
    }
  });

  return [...regionMap.values()].sort((left, right) =>
    toRegionKey(left).localeCompare(toRegionKey(right), "ko"),
  );
};

const fallbackSummary = {
  totalMembers: 1248,
  totalMeetings: 328,
  pendingReports: 7,
  totalSports: sports.length,
};

const meetingStatusText = {
  RECRUITING: "모집중",
  CLOSED: "모집마감",
  COMPLETED: "모임완료",
  CANCELLED: "취소됨",
};

export default function AdminPage() {
  const fallbackRegions = useMemo(buildFallbackRegions, []);
  const [regions, setRegions] = useState([]);
  const [summary, setSummary] = useState(fallbackSummary);
  const [members, setMembers] = useState(adminMembers);
  const [meetingRows, setMeetingRows] = useState(meetings);
  const [reportRows, setReportRows] = useState(reports);
  const [selectedSido, setSelectedSido] = useState(ALL_SIDO);
  const [selectedSigungu, setSelectedSigungu] = useState(ALL_SIGUNGU);
  const [selectedDong, setSelectedDong] = useState(ALL_DONG);

  useEffect(() => {
    let isMounted = true;

    getRegions()
      .then(({ data }) => {
        if (!isMounted || !Array.isArray(data)) {
          return;
        }

        const normalized = data
          .map((region) => ({
            sido: normalizeText(region.sido),
            sigungu: normalizeText(region.sigungu),
            dong: normalizeText(region.dong),
          }))
          .filter((region) => region.sido && region.sigungu && region.dong);

        setRegions(normalized);
      })
      .catch(() => {
        if (isMounted) {
          setRegions([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      getSummary(),
      getAdminMembers(),
      getAdminMeetings(),
      getAdminReports(),
    ]).then((results) => {
      if (!isMounted) {
        return;
      }

      const [summaryResult, membersResult, meetingsResult, reportsResult] = results;

      if (summaryResult.status === "fulfilled" && summaryResult.value.data) {
        setSummary(summaryResult.value.data);
      }

      if (
        membersResult.status === "fulfilled" &&
        Array.isArray(membersResult.value.data)
      ) {
        setMembers(
          membersResult.value.data.map((member) => ({
            id: member.userId,
            loginId: member.loginId,
            nickname: member.nickname,
            region: member.regionName ?? "-",
            role: member.role,
            status: member.status,
          })),
        );
      }

      if (
        meetingsResult.status === "fulfilled" &&
        Array.isArray(meetingsResult.value.data)
      ) {
        setMeetingRows(
          meetingsResult.value.data.map((meeting) => ({
            id: meeting.meetingId,
            title: meeting.title,
            sport: meeting.sportName,
            region: meeting.regionName,
            current: meeting.approvedCount ?? 0,
            max: meeting.maxMembers ?? 0,
            status: meeting.status,
            statusText: meetingStatusText[meeting.status] ?? meeting.status,
          })),
        );
      }

      if (
        reportsResult.status === "fulfilled" &&
        Array.isArray(reportsResult.value.data)
      ) {
        setReportRows(
          reportsResult.value.data.map((report) => ({
            id: report.reportId,
            target: `신고 #${report.reportId}`,
            reason: report.reason,
            status: report.status,
            createdAt: report.createdAt ? report.createdAt.slice(0, 10) : "-",
          })),
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const regionOptions = regions.length ? regions : fallbackRegions;

  const sidoOptions = useMemo(() => {
    return [...new Set(regionOptions.map((region) => region.sido))].sort((left, right) =>
      left.localeCompare(right, "ko"),
    );
  }, [regionOptions]);

  const sigunguOptions = useMemo(() => {
    return [
      ...new Set(
        regionOptions
          .filter(
            (region) =>
              selectedSido === ALL_SIDO || isSameRegionPart(region.sido, selectedSido),
          )
          .map((region) => region.sigungu),
      ),
    ].sort((left, right) => left.localeCompare(right, "ko"));
  }, [regionOptions, selectedSido]);

  const dongOptions = useMemo(() => {
    return [
      ...new Set(
        regionOptions
          .filter(
            (region) =>
              (selectedSido === ALL_SIDO || isSameRegionPart(region.sido, selectedSido)) &&
              (selectedSigungu === ALL_SIGUNGU ||
                isSameRegionPart(region.sigungu, selectedSigungu)),
          )
          .map((region) => region.dong),
      ),
    ].sort((left, right) => left.localeCompare(right, "ko"));
  }, [regionOptions, selectedSido, selectedSigungu]);

  const matchesRegionSelection = (regionLabel) => {
    const parsed = parseRegionLabel(regionLabel);

    return (
      (selectedSido === ALL_SIDO || isSameRegionPart(parsed.sido, selectedSido)) &&
      (selectedSigungu === ALL_SIGUNGU ||
        isSameRegionPart(parsed.sigungu, selectedSigungu)) &&
      (selectedDong === ALL_DONG || isSameRegionPart(parsed.dong, selectedDong))
    );
  };

  const filteredMembers = useMemo(
    () => members.filter((member) => matchesRegionSelection(member.region)),
    [members, selectedSido, selectedSigungu, selectedDong],
  );

  const filteredMeetings = useMemo(
    () => meetingRows.filter((meeting) => matchesRegionSelection(meeting.region)),
    [meetingRows, selectedSido, selectedSigungu, selectedDong],
  );

  const selectedRegionSummary = [selectedSido, selectedSigungu, selectedDong]
    .filter(
      (value) =>
        value !== ALL_SIDO && value !== ALL_SIGUNGU && value !== ALL_DONG,
    )
    .join(" · ");

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <div>
          <h1>관리자 페이지</h1>
          <p>
            회원, 모임, 신고, 운동 종목 데이터를 한눈에 확인하고 빠르게 관리할 수
            있도록 정리한 운영 화면입니다.
          </p>
        </div>
      </div>

      <section className={styles.statGrid}>
        <article>
          <span>전체 회원</span>
          <strong>{summary.totalMembers ?? fallbackSummary.totalMembers}</strong>
        </article>
        <article>
          <span>등록 모임</span>
          <strong>{summary.totalMeetings ?? fallbackSummary.totalMeetings}</strong>
        </article>
        <article>
          <span>대기 신고</span>
          <strong>{summary.pendingReports ?? fallbackSummary.pendingReports}</strong>
        </article>
        <article>
          <span>운동 종목</span>
          <strong>{summary.totalSports ?? fallbackSummary.totalSports}</strong>
        </article>
      </section>

      <div className={styles.pageTabs}>
        <button className={cx("tabButton", "tabButtonActive")} type="button">
          회원 관리
        </button>
        <button className={styles.tabButton} type="button">
          모임 관리
        </button>
        <button className={styles.tabButton} type="button">
          신고 내역
        </button>
        <button className={styles.tabButton} type="button">
          운동 종목
        </button>
      </div>

      <section className={styles.filterPanel}>
        <div className={styles.filterHead}>
          <div>
            <h2>지역별 조회</h2>
            <p>
              시도, 시군구, 읍면동을 순서대로 고르면 당근처럼 단계적으로 지역을
              좁혀서 회원과 모임을 볼 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedSido(ALL_SIDO);
              setSelectedSigungu(ALL_SIGUNGU);
              setSelectedDong(ALL_DONG);
            }}
          >
            전체 보기
          </button>
        </div>

        <div className={styles.filterRow}>
          <select
            value={selectedSido}
            onChange={(event) => {
              setSelectedSido(event.target.value);
              setSelectedSigungu(ALL_SIGUNGU);
              setSelectedDong(ALL_DONG);
            }}
          >
            <option value={ALL_SIDO}>{ALL_SIDO}</option>
            {sidoOptions.map((sido) => (
              <option key={sido} value={sido}>
                {sido}
              </option>
            ))}
          </select>

          <select
            value={selectedSigungu}
            onChange={(event) => {
              setSelectedSigungu(event.target.value);
              setSelectedDong(ALL_DONG);
            }}
            disabled={selectedSido === ALL_SIDO}
          >
            <option value={ALL_SIGUNGU}>{ALL_SIGUNGU}</option>
            {sigunguOptions.map((sigungu) => (
              <option key={sigungu} value={sigungu}>
                {sigungu}
              </option>
            ))}
          </select>

          <select
            value={selectedDong}
            onChange={(event) => setSelectedDong(event.target.value)}
            disabled={selectedSigungu === ALL_SIGUNGU}
          >
            <option value={ALL_DONG}>{ALL_DONG}</option>
            {dongOptions.map((dong) => (
              <option key={dong} value={dong}>
                {dong}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterMeta}>
          <span>{selectedRegionSummary || "전체 지역"} 기준으로 조회 중입니다.</span>
          <strong>
            회원 {filteredMembers.length}명 · 모임 {filteredMeetings.length}개
          </strong>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <h2>회원 관리</h2>
            <p>선택한 지역 기준으로 회원 상태와 권한을 빠르게 확인할 수 있습니다.</p>
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
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.nickname}</td>
                <td>{member.loginId}</td>
                <td>{member.region}</td>
                <td>{member.role}</td>
                <td>
                  <span
                    className={cx(
                      "badge",
                      member.status === "SUSPENDED" ? "warning" : "success",
                    )}
                  >
                    {member.status}
                  </span>
                </td>
                <td>
                  <button type="button">상세</button>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyCell}>
                  선택한 지역에 해당하는 회원이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <h2>모임 관리</h2>
            <p>등록된 모임도 같은 지역 기준으로 바로 좁혀서 확인할 수 있습니다.</p>
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
            {filteredMeetings.map((meeting) => (
              <tr key={meeting.id}>
                <td>M{String(meeting.id).padStart(3, "0")}</td>
                <td>{meeting.title}</td>
                <td>{meeting.sport}</td>
                <td>{meeting.region}</td>
                <td>
                  {meeting.current}/{meeting.max}
                </td>
                <td>
                  <span
                    className={cx(
                      "badge",
                      meeting.status === "CLOSED" ? "warning" : "success",
                    )}
                  >
                    {meeting.statusText}
                  </span>
                </td>
                <td>
                  <button type="button">상세</button>
                </td>
              </tr>
            ))}
            {filteredMeetings.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyCell}>
                  선택한 지역에 해당하는 모임이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <h2>신고 내역</h2>
            <p>처리 대기 중인 신고를 확인하고 운영 이슈를 정리할 수 있습니다.</p>
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
            {reportRows.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.target}</td>
                <td>{report.reason}</td>
                <td>
                  <span
                    className={cx(
                      "badge",
                      report.status === "PENDING" ? "warning" : "success",
                    )}
                  >
                    {report.status}
                  </span>
                </td>
                <td>{report.createdAt}</td>
                <td>
                  <button type="button">처리</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
