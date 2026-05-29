import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AppModal from "../components/AppModal";
import DashboardShell from "../components/DashboardShell";
import MeetingRegionPickerModal from "../components/MeetingRegionPickerModal";
import Pagination from "../components/Pagination";
import SportPickerModal from "../components/SportPickerModal2";
import UiIcon from "../components/UiIcon";
import { useAuth } from "../contexts/AuthContext";
import { meetings } from "../data/demoData";
import { getMeetings, getTopRegions } from "../api/meetingApi";
import { getMember } from "../api/memberApi";
import { getRegions } from "../api/regionApi";
import { getSports } from "../api/sportApi";
import styles from "../styles/MeetingListPage.module.css";

const cx = (...names) =>
  names
    .filter(Boolean)
    .map((name) => styles[name] || name)
    .join(" ");

const ALL_REGION = "전체 지역";
const ALL_SPORT = "전체 종목";
const ALL_STATUS = "전체 상태";
const PAGE_SIZE = 10;
const weekdayLabels = ["오늘", "내일", "토", "일"];

const STATUS_MAP = {
  RECRUITING: "모집중",
  CLOSED: "모집마감",
  COMPLETED: "진행완료",
  CANCELLED: "취소됨",
};

const normalizeText = (value = "") => String(value).trim();

const normalizeRegion = (region) => ({
  regionId: region.regionId,
  sido: normalizeText(region.sido),
  sigungu: normalizeText(region.sigungu),
  dong: normalizeText(region.dong),
});

const normalizeSport = (sport) => ({
  sportId: sport.sportId,
  name: sport.name ?? "-",
  category: sport.category ?? "기타",
  isActive: sport.isActive ?? true,
});

const formatRegionLabel = (selection) => {
  if (!selection) return ALL_REGION;

  const parts = [selection.sido, selection.sigungu, selection.dong]
    .map(normalizeText)
    .filter(Boolean);

  return parts.length ? parts.join(" ") : ALL_REGION;
};

const formatTopRegionLabel = (region) => {
  if (!region || typeof region !== "object") {
    return String(region || "");
  }

  const parts = [
    region.sido || region.sidoName,
    region.sigungu || region.sigunguName,
    region.dong || region.dongName,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(" ")
    : region.regionName || region.name || "";
};

const resolveRegionSelectionFromLabel = (regions, label) => {
  const normalizedLabel = normalizeText(label);
  if (!normalizedLabel) {
    return null;
  }

  const terms = normalizedLabel.split(/\s+/).filter(Boolean);

  if (terms.length === 1) {
    return {
      regionId: null,
      sido: terms[0],
      sigungu: "",
      dong: "",
    };
  }

  if (terms.length === 2) {
    return {
      regionId: null,
      sido: terms[0],
      sigungu: terms[1],
      dong: "",
    };
  }

  const dongName = terms.slice(2).join(" ");
  const matchedRegion =
    regions.find(
      (region) =>
        normalizeText(region.sido) === terms[0] &&
        normalizeText(region.sigungu) === terms[1] &&
        normalizeText(region.dong) === dongName,
    ) ?? null;

  if (matchedRegion) {
    return matchedRegion;
  }

  return {
    regionId: null,
    sido: terms[0],
    sigungu: terms[1],
    dong: dongName,
  };
};

export default function MeetingListPage() {
  const [urlSearchParams] = useSearchParams();
  const listStartRef = useRef(null);
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const keywordParam = urlSearchParams.get("keyword") ?? "";
  const regionLabelParam = urlSearchParams.get("regionLabel") ?? "";
  const sportNameParam = urlSearchParams.get("sportName") ?? "";
  const isGlobalSearch =
    urlSearchParams.get("global") === "1" ||
    Boolean(keywordParam || sportNameParam || regionLabelParam);

  const [meetingDate, setMeetingDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);

  const [memberRegionId, setMemberRegionId] = useState(null);
  const [memberRegionReady, setMemberRegionReady] = useState(false);

  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState(regionLabelParam ? "" : keywordParam);
  const [meetingList, setMeetingList] = useState([]);

  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExplicitAll, setIsExplicitAll] = useState(false);
  const [topRegions, setTopRegions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [sportOptions, setSportOptions] = useState([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [regionsResponse, sportsResponse] = await Promise.all([
          getRegions(),
          getSports(),
        ]);

        setRegionOptions(
          Array.isArray(regionsResponse.data)
            ? regionsResponse.data
                .map(normalizeRegion)
                .filter((region) => region.sido && region.sigungu)
            : [],
        );

        setSportOptions(
          Array.isArray(sportsResponse.data)
            ? sportsResponse.data
                .map(normalizeSport)
                .filter((sport) => sport.isActive !== false)
            : [],
        );
      } catch (error) {
        console.error(error);
        setRegionOptions([]);
        setSportOptions([]);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    const fetchMemberRegion = async () => {
      if (!isAuthenticated || !user?.memberId) {
        setMemberRegionId(null);
        setMemberRegionReady(true);
        return;
      }

      setMemberRegionReady(false);

      try {
        const response = await getMember(user.memberId);

        if (active) {
          setMemberRegionId(response.data?.regionId ?? null);
        }
      } catch (error) {
        console.error(error);

        if (active) {
          setMemberRegionId(null);
        }
      } finally {
        if (active) {
          setMemberRegionReady(true);
        }
      }
    };

    fetchMemberRegion();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, user?.memberId]);

  const memberRegion = useMemo(
    () =>
      regionOptions.find((region) => region.regionId === memberRegionId) ??
      null,
    [regionOptions, memberRegionId],
  );

  const regionParams = useMemo(() => {
    if (!selectedRegion) {
      return {};
    }

    if (selectedRegion.regionId) {
      return { regionId: selectedRegion.regionId };
    }

    return {
      sido: selectedRegion.sido || null,
      sigungu: selectedRegion.sigungu || null,
      dong: selectedRegion.dong || null,
    };
  }, [selectedRegion]);

  const searchParams = useMemo(
    () => ({
      ...regionParams,
      baseRegionId:
        selectedRegion || isExplicitAll || isGlobalSearch
          ? null
          : memberRegionId,
      sportId: selectedSport?.sportId ?? null,
      status,
      keyword,
      meetingDate,
      page: currentPage,
      size: PAGE_SIZE,
    }),
    [
      regionParams,
      selectedRegion,
      isExplicitAll,
      memberRegionId,
      isGlobalSearch,
      selectedSport,
      status,
      keyword,
      meetingDate,
      currentPage,
    ],
  );

  useEffect(() => {
    setKeyword(regionLabelParam ? "" : keywordParam);
    setCurrentPage(1);
  }, [keywordParam, regionLabelParam]);

  useEffect(() => {
    if (!regionOptions.length) {
      return;
    }

    if (!regionLabelParam) {
      setSelectedRegion(null);
      return;
    }

    const resolvedRegion = resolveRegionSelectionFromLabel(
      regionOptions,
      regionLabelParam,
    );

    setSelectedRegion(resolvedRegion);
    setIsExplicitAll(false);
    setCurrentPage(1);
  }, [regionLabelParam, regionOptions]);

  useEffect(() => {
    if (!sportOptions.length) {
      return;
    }

    if (!sportNameParam) {
      setSelectedSport(null);
      return;
    }

    const matchedSport =
      sportOptions.find((sport) => sport.name === sportNameParam) ?? null;
    setSelectedSport(matchedSport);
    setCurrentPage(1);
  }, [sportNameParam, sportOptions]);

  useEffect(() => {
    if (authLoading || !memberRegionReady) return;

    const fetchMeetings = async () => {
      try {
        const response = await getMeetings(searchParams);

        if (response.data) {
          setMeetingList(response.data.list || []);
          setTotalCount(response.data.totalCount || 0);
        }
      } catch (error) {
        console.error(error);
        setMeetingList([]);
        setTotalCount(0);
      }
    };

    fetchMeetings();
  }, [authLoading, memberRegionReady, searchParams]);

  useEffect(() => {
    const fetchTopRegions = async () => {
      try {
        const response = await getTopRegions();
        setTopRegions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
        setTopRegions([]);
      }
    };

    fetchTopRegions();
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const displayedRegionLabel = selectedRegion
    ? formatRegionLabel(selectedRegion)
    : isAuthenticated && memberRegion && !isExplicitAll
      ? `${memberRegion.sido} ${memberRegion.sigungu}`
      : ALL_REGION;

  const displayedSportLabel = selectedSport?.name ?? ALL_SPORT;

  const mobileSummary = `${displayedRegionLabel} · ${displayedSportLabel} · ${
    status ? STATUS_MAP[status] || status : ALL_STATUS
  }`;

  const handlePageChange = (page) => {
    setCurrentPage(page);

    if (!listStartRef.current) {
      return;
    }

    const listTop =
      listStartRef.current.getBoundingClientRect().top + window.scrollY - 8;

    window.scrollTo({ top: listTop, behavior: "smooth" });
  };

  const resetFilters = () => {
    setSelectedRegion(null);
    setIsExplicitAll(true);
    setSelectedSport(null);
    setStatus("");
    setKeyword("");
    setMeetingDate("");
    setCurrentPage(1);
  };

  const applyRegionSelection = (selection) => {
    const normalized = {
      regionId: selection?.regionId ?? null,
      sido: selection?.sido ?? "",
      sigungu: selection?.sigungu ?? "",
      dong: selection?.dong ?? "",
    };

    const hasSelection = Boolean(
      normalized.regionId ||
      normalized.sido ||
      normalized.sigungu ||
      normalized.dong,
    );

    setSelectedRegion(hasSelection ? normalized : null);
    setIsExplicitAll(!hasSelection);
    setCurrentPage(1);
    setIsRegionModalOpen(false);
  };

  const applySportSelection = (sport) => {
    setSelectedSport(sport ?? null);
    setCurrentPage(1);
    setIsSportModalOpen(false);
  };

  return (
    <DashboardShell
      active="모임 찾기"
      title="모임 찾기"
      description="지역과 운동 종목을 기준으로 지금 참여할 수 있는 모임을 빠르게 골라보세요."
      aside={
        <>
          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>인기 지역</h3>
            </div>
            <div className={styles.dashboardSimpleList}>
              {topRegions.map((item, index) => {
                const regionLabel = formatTopRegionLabel(item);
                const meetingCount =
                  item && typeof item === "object" ? item.count : 0;

                return (
                  <div key={`${regionLabel}-${index}`}>
                    <span>
                      {index + 1}. {regionLabel}
                    </span>
                    <strong>{meetingCount}개</strong>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>이번 주 일정</h3>
            </div>
            <div className={styles.dashboardScheduleList}>
              {meetings.slice(0, 4).map((meeting, index) => (
                <div key={meeting.id} className={styles.dashboardScheduleItem}>
                  <span>{weekdayLabels[index]}</span>
                  <strong>{meeting.time}</strong>
                  <p>{meeting.title}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      }
    >
      <section className={styles.notice}>
        <div>
          <h1>이번 주말, 동네에서 같이 운동할 사람을 찾아보세요.</h1>
          <p>
            운동 종목과 지역을 선택하면 모집 중인 모임을 빠르게 확인할 수
            있습니다.
          </p>
        </div>
        <Link to="/meetings/new">모임 만들기</Link>
      </section>

      <div className={styles.mobileFilterBar}>
        <button type="button" onClick={() => setIsFilterOpen(true)}>
          필터 열기
        </button>
        <span>{mobileSummary}</span>
      </div>

      <section className={styles.filterPanel} ref={listStartRef}>
        <div className={styles.selectionBar}>
          <strong>
            {displayedRegionLabel} · {displayedSportLabel}
          </strong>
          <span>
            {selectedRegion
              ? "선택한 지역 기준으로 조회 중"
              : isAuthenticated && memberRegion && !isExplicitAll
                ? "사용자의 지역 기준으로 조회 중"
                : "전체 지역 기준으로 조회 중"}
          </span>
        </div>

        <div className={styles.filterRow}>
          <button
            type="button"
            className={styles.pickerButton}
            onClick={() => setIsRegionModalOpen(true)}
          >
            지역 조회
          </button>

          <button
            type="button"
            className={styles.pickerButton}
            onClick={() => setIsSportModalOpen(true)}
          >
            운동 조회
          </button>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">전체 상태</option>
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집마감</option>
            <option value="COMPLETED">모임완료</option>
          </select>

          <input
            type="date"
            value={meetingDate}
            onChange={(event) => {
              setMeetingDate(event.target.value);
              setCurrentPage(1);
            }}
            onClick={(e) => e.target.showPicker?.()}
          />

          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="운동명, 제목, 지역 검색"
          />

          <button
            type="button"
            className={styles.resetButton}
            onClick={resetFilters}
          >
            <UiIcon name="refresh" className={styles.resetIcon} />
            초기화
          </button>
        </div>
      </section>

      <div className={styles.listHead}>
        <div className={styles.listHeadCopy}>
          <span className={styles.listEyebrow}>LIVE MEETINGS</span>
          <h2>
            {displayedRegionLabel === ALL_REGION
              ? "전체 지역"
              : displayedRegionLabel}{" "}
            모임
          </h2>
          <p>
            지금 열려 있는 모임을 한눈에 비교하고 바로 참여 요청까지 이어가세요.
          </p>
        </div>
        <div className={styles.listHeadCount}>
          <span className={styles.listCountLabel}>RESULT</span>
          <strong>{totalCount}</strong>
        </div>
      </div>

      <section className={styles.meetingList}>
        {meetingList.length === 0 ? (
          <div className={styles.emptyList}>
            <div className={styles.emptyIconWrap}>
              <UiIcon name="search" className={styles.emptyIcon} />
            </div>
            <span className={styles.emptyEyebrow}>NO MATCH FOUND</span>
            <h3>조건에 맞는 모임이 없습니다</h3>
            <p>
              지역, 종목, 날짜를 조금만 넓혀보면 바로 참여할 수 있는 모임이 더
              잘 보여요.
            </p>
            <div className={styles.emptyActions}>
              <button type="button" onClick={resetFilters}>
                <UiIcon name="refresh" className={styles.emptyButtonIcon} />
                검색 조건 초기화
              </button>
              <Link to="/search" className={styles.emptyLink}>
                <UiIcon name="spark" className={styles.emptyButtonIcon} />
                통합 검색으로 둘러보기
              </Link>
            </div>
          </div>
        ) : (
          meetingList.map((meeting) => (
            <Link
              key={meeting.meetingId}
              className={cx(
                "listCard",
                meeting.status === "RECRUITING" && "listCardRecruiting",
                meeting.status === "COMPLETED" && "listCardCompleted",
                (meeting.status === "CLOSED" ||
                  meeting.status === "CANCELLED") &&
                  "listCardClosed",
              )}
              to={`/meetings/${meeting.meetingId}`}
            >
              <div className={styles.listCardBody}>
                <img
                  src={meeting.thumbnailImage || "/src/assets/image/bg1.jpg"}
                  alt={meeting.title}
                  className={styles.listCardImage}
                />

                <div className={styles.listCardContent}>
                  <div className={styles.listTags}>
                    <span className={styles.badge}>{meeting.sportName}</span>
                    <span
                      className={cx(
                        "badge",
                        meeting.status === "CLOSED" ||
                          meeting.status === "CANCELLED"
                          ? "warning"
                          : "success",
                      )}
                    >
                      {STATUS_MAP[meeting.status] || "알 수 없음"}
                    </span>
                  </div>

                  <h3>{meeting.title}</h3>
                  <p>{meeting.content}</p>

                  <div className={styles.listMeta}>
                    <span>
                      <UiIcon
                        name="location"
                        className={styles.dashboardMetaIcon}
                      />
                      {meeting.regionName}
                    </span>
                    <span>
                      <UiIcon
                        name="calendar"
                        className={styles.dashboardMetaIcon}
                      />
                      {meeting.placeName}
                    </span>
                    <span>
                      <UiIcon
                        name="user"
                        className={styles.dashboardMetaIcon}
                      />
                      {meeting.approvedCount || 1}/{meeting.maxMembers}명
                    </span>
                  </div>

                  <div className={styles.host}>
                    <img
                      src={meeting.hostProfileImage || "/src/assets/image/default-user.png"}
                      alt={meeting.meetingHostName}
                      className={styles.dashboardHostAvatar}
                      onError={(e) => {
                        e.target.src = "/src/assets/image/default-user.png";
                      }}
                    />
                    <span>{meeting.meetingHostName || "익명"}</span>
                  </div>
                </div>
              </div>

              <aside>
                <div className={styles.dateBox}>
                  <span>
                    {meeting.meetingDate
                      ? String(meeting.meetingDate)
                          .split("-")
                          .slice(1)
                          .join(".")
                      : "-"}
                  </span>
                  <strong>
                    {meeting.startTime
                      ? String(meeting.startTime).slice(0, 5)
                      : "-"}
                  </strong>
                </div>

                <button
                  type="button"
                  className={
                    ["CLOSED", "COMPLETED", "CANCELLED"].includes(
                      meeting.status,
                    )
                      ? styles.actionClosed
                      : ""
                  }
                >
                  {meeting.status === "CLOSED"
                    ? "모집마감"
                    : meeting.status === "COMPLETED"
                      ? "진행완료"
                      : meeting.status === "CANCELLED"
                        ? "취소됨"
                        : "참가 신청"}
                </button>
              </aside>
            </Link>
          ))
        )}
      </section>

      {totalCount > 0 && (
        <div className={styles.paginationWrapper}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
            variant="centered"
          />
        </div>
      )}

      <AppModal
        open={isFilterOpen}
        variant="sheet"
        eyebrow="모임 필터"
        title="원하는 모임만 빠르게 볼까요?"
        description="지역과 운동 종목을 모달에서 고르고 세부 조건을 조정할 수 있습니다."
        confirmText="필터 적용"
        onClose={() => setIsFilterOpen(false)}
        onConfirm={() => setIsFilterOpen(false)}
      >
        <div className={styles.sheetPickerGrid}>
          <button
            type="button"
            onClick={() => {
              setIsFilterOpen(false);
              setIsRegionModalOpen(true);
            }}
          >
            지역 조회
          </button>

          <button
            type="button"
            onClick={() => {
              setIsFilterOpen(false);
              setIsSportModalOpen(true);
            }}
          >
            운동 조회
          </button>
        </div>

        <div className={styles.sheetFilterFields}>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">전체 상태</option>
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집마감</option>
            <option value="COMPLETED">모임완료</option>
            <option value="CANCELLED">취소됨</option>
          </select>

          <input
            type="date"
            value={meetingDate}
            onChange={(event) => {
              setMeetingDate(event.target.value);
              setCurrentPage(1);
            }}
            onClick={(e) => e.target.showPicker?.()}
          />

          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="제목, 장소 검색"
          />
        </div>
      </AppModal>

      <MeetingRegionPickerModal
        open={isRegionModalOpen}
        regions={regionOptions}
        initialSelection={selectedRegion}
        onApply={applyRegionSelection}
        onClose={() => setIsRegionModalOpen(false)}
      />

      <SportPickerModal
        open={isSportModalOpen}
        sports={sportOptions}
        selectedSportId={selectedSport?.sportId ?? null}
        onApply={applySportSelection}
        onClose={() => setIsSportModalOpen(false)}
      />
    </DashboardShell>
  );
}
