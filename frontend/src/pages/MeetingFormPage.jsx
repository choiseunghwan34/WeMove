import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../styles/MeetingCreatePage.module.css";
import SportPickerModal from "../components/SportPickerModal.jsx";
import RegionPickerModal from "../components/RegionPickerModal.jsx";
import ReactCalendarDatePicker from "../components/ReactCalendarDatePicker.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getSports } from "../api/sportApi.js";
import { getRegions } from "../api/regionApi.js";
import DeleteMeetingButton from "./DeleteMeetingButton.jsx";

const normalizeText = (value = "") => String(value).trim();
const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024;

export default function MeetingFormPage({ initialData, onSubmit, title }) {
  const { meetingId } = useParams();
  const isEditMode = !!meetingId;

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);
  const inputRefs = useRef({});

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const initialFormValue = initialData || {
    sportId: null,
    regionId: null,
    title: "",
    content: "",
    placeName: "",
    address: "",
    latitude: null,
    longitude: null,
    meetingDate: "",
    startTime: "",
    maxMembers: "",
    meetingType: "ONE_TIME",
    repeatType: "NONE",
    supplies: "",
    guideText: "",
    status: "RECRUITING",
  };

  const [form, setForm] = useState(initialFormValue);
  const [files, setFiles] = useState([]);
  const [sports, setSports] = useState([]);
  const [regions, setRegions] = useState([]);

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);

  const [selectedSportName, setSelectedSportName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState({
    sido: "",
    sigungu: "",
    dong: "",
  });

  // 1. 썸네일 미리보기 상태 생성 (중복 제거 완료)
  const previews = useMemo(() => {
    return files.map((file) => {
      if (file.url) {
        return { name: file.name, url: file.url };
      }
      return { name: file.name, url: URL.createObjectURL(file) };
    });
  }, [files]);

  // 2. 초기 API 데이터 수집 및 비동기 동기화 처리
  useEffect(() => {
    Promise.all([getSports(), getRegions()])
      .then(([sportRes, regionRes]) => {
        setSports(sportRes.data || []);
        setRegions(regionRes.data || []);
      })
      .catch((err) => console.error("데이터 로드 실패: ", err));
  }, []);

  // 3. 수정 모드 시 initialData 정보 매핑 구조화
  useEffect(() => {
    if (!initialData || sports.length === 0 || regions.length === 0) return;

    const foundSport = sports.find((s) => s.name === initialData.sportName);
    const foundRegion = regions.find(
      (r) => `${r.sido} ${r.sigungu} ${r.dong}` === initialData.regionName,
    );

    const formattedStartTime = initialData.startTime
      ? initialData.startTime.substring(0, 5)
      : "";

    setForm((prev) => ({
      ...prev,
      ...initialData,
      startTime: formattedStartTime,
      sportId: foundSport ? foundSport.sportId : prev.sportId,
      regionId: foundRegion ? foundRegion.regionId : prev.regionId,
    }));

    if (initialData.sportName) {
      setSelectedSportName(initialData.sportName);
    }
    if (initialData.regionName) {
      const parts = initialData.regionName.split(" ");
      setSelectedRegion({
        sido: parts[0] || "",
        sigungu: parts[1] || "",
        dong: parts[2] || "",
      });
    }
    if (initialData.thumbnailImage) {
      setFiles([{ name: "기존 썸네일", url: initialData.thumbnailImage }]);
    }
  }, [initialData, sports, regions]);

  // 4. 시간 드롭다운 옵션 바인딩 처리 (충돌 구역 정리 완료)
  const timeOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayStr = getTodayString();

    for (let i = 0; i < 24; i++) {
      for (let m = 0; m < 60; m += 10) {
        if (form.meetingDate === todayStr) {
          if (i < currentHour || (i === currentHour && m <= currentMinute)) {
            continue;
          }
        }
        const p = i < 12 ? "오전" : "오후";
        const hDisplay = i === 0 ? 12 : i > 12 ? i - 12 : i;
        const valH = String(i).padStart(2, "0");
        const valM = String(m).padStart(2, "0");

        options.push({
          value: `${valH}:${valM}`,
          label: `${p} ${String(hDisplay).padStart(2, "0")}:${valM}`,
        });
      }
    }
    return options;
  }, [form.meetingDate]);

  // 5. 프리뷰 메모리 누수 방지 안전장치
  useEffect(() => {
    return () => previews.forEach((item) => URL.revokeObjectURL(item.url));
  }, [previews]);

  // 6. 지역 Picker를 위한 계층 구조 데이터 가공 (수동 가공 예외 방지)
  const regionHierarchy = useMemo(() => {
    const hierarchy = [];
    regions.forEach((r) => {
      let sidoObj = hierarchy.find((item) => item.name === r.sido);
      if (!sidoObj) {
        sidoObj = { name: r.sido, sub: [] };
        hierarchy.push(sidoObj);
      }
      let sigunguObj = sidoObj.sub.find((item) => item.name === r.sigungu);
      if (!sigunguObj) {
        sigunguObj = { name: r.sigungu, sub: [] };
        sidoObj.sub.push(sigunguObj);
      }
      if (r.dong && !sigunguObj.sub.includes(r.dong)) {
        sigunguObj.sub.push(r.dong);
      }
    });
    return hierarchy;
  }, [regions]);

  const regionDisplayText = selectedRegion.dong
    ? `${selectedRegion.sido} ${selectedRegion.sigungu} ${selectedRegion.dong}`
    : "";

  // 7. 각 이벤트 핸들러 선언 단락
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let addr = "";
        let extraAddr = "";

        if (data.userSelectedType === "R") {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }

        if (data.userSelectedType === "R") {
          if (data.bname !== "" && /[동로가]$/.test(data.bname)) {
            extraAddr += data.bname;
          }
          if (data.buildingName !== "" && data.apartment === "Y") {
            extraAddr +=
              extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
          }
          if (extraAddr !== "") {
            extraAddr = " (" + extraAddr + ")";
          }
        }
        const fullAddress = addr + extraAddr;
        setForm((prev) => ({ ...prev, address: fullAddress }));
      },
    }).open();
  };

  const handleCustomBtnClick = () => fileInputRef.current.click();

  const handleSportApply = (d) => {
    setForm((p) => ({ ...p, sportId: d.sportId }));
    setSelectedSportName(d.name);
    setIsSportModalOpen(false);
  };

  const handleRegionApply = (d) => {
    setSelectedRegion({ sido: d.sido, sigungu: d.sigungu, dong: d.dong });
    const match = regions.find(
      (r) => r.sido === d.sido && r.sigungu === d.sigungu && r.dong === d.dong,
    );
    if (match) {
      setForm((p) => ({ ...p, regionId: match.regionId }));
    }
    setIsRegionModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: ["sportId", "regionId", "maxMembers"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file?.size > MAX_THUMBNAIL_SIZE) {
      alert("10MB 이하만 가능합니다.");
      return;
    }
    if (file) setFiles([file]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = () => setFiles([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const minRequiredMembers =
      isEditMode && initialData?.approvedCount
        ? Math.max(2, initialData?.approvedCount)
        : 2;

    if (Number(form.maxMembers) < minRequiredMembers) {
      if (minRequiredMembers > 2) {
        alert(
          `모집 인원은 현재 승인된 인원 (${initialData.approvedCount}명) 이상이어야 합니다.`,
        );
      } else {
        alert("참여 인원은 본인 포함 최소 2명 이상이어야 합니다.");
      }
      inputRefs.current.maxMembers?.focus();
      return;
    }

    const selectedDate = new Date(form.meetingDate);
    const today = new Date();
    const isToday =
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate();

    if (isToday && form.startTime) {
      const [selectedHour, selectedMinute] = form.startTime
        .split(":")
        .map(Number);
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();

      if (
        selectedHour < currentHour ||
        (selectedHour === currentHour && selectedMinute <= currentMinute)
      ) {
        alert("당일 모임은 현재 시간 이후로만 설정 가능합니다.");
        inputRefs.current.startTime?.focus();
        return;
      }
    }

    let finalForm = { ...form };
    if (!finalForm.sportId && selectedSportName) {
      const s = sports.find((x) => x.name === selectedSportName);
      if (s) finalForm.sportId = s.sportId;
    }

    if (!finalForm.regionId && selectedRegion.sido) {
      const r = regions.find(
        (x) =>
          x.sido === selectedRegion.sido &&
          x.sigungu === selectedRegion.sigungu &&
          x.dong === selectedRegion.dong,
      );
      if (r) finalForm.regionId = r.regionId;
    }

    const requiredFields = [
      { key: "title", label: "모임 제목", refKey: "title" },
      { key: "address", label: "주소", refKey: "address" },
      { key: "placeName", label: "상세 주소", refKey: "placeName" },
      { key: "meetingDate", label: "날짜", refKey: "meetingDate" },
      { key: "startTime", label: "시작 시간", refKey: "startTime" },
      { key: "maxMembers", label: "모집 인원", refKey: "maxMembers" },
      { key: "supplies", label: "준비물", refKey: "supplies" },
      { key: "guideText", label: "진행 안내", refKey: "guideText" },
      { key: "content", label: "모임 소개", refKey: "content" },
    ];

    for (const f of requiredFields) {
      if (!finalForm[f.key] || String(finalForm[f.key]).trim() === "") {
        alert(`${f.label}을(를) 입력해주세요.`);
        inputRefs.current[f.refKey]?.focus();
        inputRefs.current[f.refKey]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
    }

    if (!finalForm.sportId) {
      alert("운동 종목을 선택해주세요.");
      setIsSportModalOpen(true);
      return;
    }
    if (!finalForm.regionId) {
      alert("지역을 선택해주세요.");
      setIsRegionModalOpen(true);
      return;
    }
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append(
      "request",
      new Blob([JSON.stringify(finalForm)], { type: "application/json" }),
    );
    if (files.length > 0) formData.append("image", files[0]);
    onSubmit(formData);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <div>
          <h1>{title}</h1>
          <p>
            {isEditMode
              ? "참가 예정인 사람들도 헷갈리지 않도록, 바뀐 정보가 한눈에 보이게 정리해두세요."
              : "제목, 장소, 시간, 소개와 대표 사진까지 정리하면 훨씬 신뢰감 있는 모임 페이지를 만들 수 있습니다."}
          </p>
        </div>
      </div>

      <section className={styles.formIntro}>
        <h2>
          {isEditMode
            ? "기존 흐름은 유지하고, 필요한 부분만 정확하게 다듬어보세요."
            : "좋은 모임은 한눈에 이해되는 정보에서 시작됩니다."}
        </h2>
        <p>
          참가자는 제목과 썸네일, 장소, 분위기를 먼저 봅니다. 처음 보는 사람도
          바로 감을 잡을 수 있게 간결하고 선명하게 구성해보세요.
        </p>
        <div className={styles.formHintGrid}>
          <article>
            <span>제목 작성 팁</span>
            <strong>지역 + 운동 + 시간대가 자연스럽게 보이도록 쓰기</strong>
          </article>
          <article>
            <span>사진 등록 팁</span>
            <strong>실제 분위기가 잘 보이는 밝은 운동 사진 선택</strong>
          </article>
          <article>
            <span>소개 작성 팁</span>
            <strong>
              초보 가능 여부, 준비물, 진행 방식을 짧고 명확하게 안내
            </strong>
          </article>
        </div>
      </section>

      <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
        <label className={styles.full}>
          <div className={styles.titleRow}>
            <span className={styles.requiredLabel}>모임 제목</span>
            <p className={styles.requiredNotice}>
              * 표시는 필수 입력 항목입니다.
            </p>
          </div>
          <input
            ref={(el) => (inputRefs.current.title = el)}
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="예: 야당역 5km 러닝 크루 모집"
          />
        </label>

        <label>
          <span className={styles.requiredLabel}>운동 종목</span>
          <div className={styles.pickerRow}>
            <button
              type="button"
              className={styles.pickerButton}
              onClick={() => setIsSportModalOpen(true)}
            >
              종목 조회
            </button>
            <div className={styles.pickerSummary}>
              <span className={styles.pickerLabel}>선택 종목</span>
              <span
                className={
                  selectedSportName ? styles.valueText : styles.placeholderText
                }
              >
                {selectedSportName || "운동 종목을 선택해주세요"}
              </span>
            </div>
          </div>
        </label>

        <label>
          <span className={styles.requiredLabel}>지역</span>
          <div className={styles.pickerRow}>
            <button
              type="button"
              className={styles.pickerButton}
              onClick={() => setIsRegionModalOpen(true)}
            >
              지역 조회
            </button>
            <div className={styles.pickerSummary}>
              <span className={styles.pickerLabel}>선택 지역</span>
              <span
                className={
                  regionDisplayText ? styles.valueText : styles.placeholderText
                }
              >
                {regionDisplayText || "지역을 선택해주세요."}
              </span>
            </div>
          </div>
        </label>

        <label>
          <span className={styles.requiredLabel}>주소</span>
          <input
            ref={(el) => (inputRefs.current.address = el)}
            name="address"
            value={form.address}
            onClick={handleAddressSearch}
            readOnly
            placeholder="주소를 설정하세요."
            style={{ cursor: "pointer" }}
          />
        </label>

        <label>
          <span className={styles.requiredLabel}>상세 주소</span>
          <input
            ref={(el) => (inputRefs.current.placeName = el)}
            name="placeName"
            value={form.placeName}
            onChange={handleChange}
            placeholder="예: 야당역 2번 출구 앞"
          />
        </label>

        <label>
          <span className={styles.requiredLabel}>날짜</span>
          <ReactCalendarDatePicker
            inputRef={(el) => (inputRefs.current.meetingDate = el)}
            name="meetingDate"
            value={form.meetingDate}
            onChange={handleChange}
            type={form.meetingDate ? "date" : "text"}
            placeholder="날짜를 설정하세요."
            onClick={(e) => {
              const target = e.target;
              if (target.type !== "date") {
                target.type = "date";
              }
              setTimeout(() => {
                try {
                  target.showPicker();
                } catch (error) {}
              }, 10);
            }}
            onBlur={(e) => {
              if (!e.target.value) {
                e.target.type = "text";
              }
            }}
            min={getTodayString()}
          />
        </label>

        <label>
          <span className={styles.requiredLabel}>시작 시간</span>
          <select
            ref={(el) => (inputRefs.current.startTime = el)}
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className={`${styles.timeSelect} ${!form.startTime ? styles.placeholderText : styles.valueText}`}
          >
            <option value="" disabled hidden>
              시간을 설정하세요.
            </option>
            {timeOptions.map((time) => (
              <option
                key={time.value}
                value={time.value}
                className={styles.timeOption}
              >
                {time.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={styles.requiredLabel}>모집 인원 (본인 포함)</span>
          <input
            ref={(el) => (inputRefs.current.maxMembers = el)}
            name="maxMembers"
            value={form.maxMembers}
            onChange={handleChange}
            type="number"
            min={
              isEditMode && initialData?.approvedCount
                ? initialData?.approvedCount
                : "2"
            }
          />
          {isEditMode &&
            initialData?.approvedCount &&
            Number(form.maxMembers) < initialData.approvedCount && (
              <small
                style={{
                  color: "#d32f2f",
                  marginTop: "4px",
                  display: "block",
                  fontSize: "0.85rem",
                }}
              >
                * 현재 승인된 인원 ({initialData.approvedCount}명) 미만으로 줄일
                수 없습니다.
              </small>
            )}
        </label>

        <label>
          <span className={styles.requiredLabel}>모집 상태</span>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={!isEditMode}
          >
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집완료</option>
          </select>
        </label>

        <label className={styles.full}>
          <span className={styles.requiredLabel}>준비물</span>
          <input
            name="supplies"
            value={form.supplies}
            onChange={handleChange}
            placeholder="편한 운동복, 물, 개인 이어폰"
          />
        </label>

        <label className={styles.full}>
          <span className={styles.requiredLabel}>모임 소개</span>
          <input
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="모임 분위기 등 간단한 모임 소개를 적어주세요."
          />
        </label>

        <label className={styles.full}>
          <span className={styles.requiredLabel}>진행 안내</span>
          <textarea
            name="guideText"
            value={form.guideText}
            onChange={handleChange}
            placeholder="[진행 안내 사항을 적어주세요.]&#10;&#10;- 집결 시간:&#10;모임 시작 10분 전&#10;&#10;- 주의사항:&#10;우천 시 모임 취소 여부는 당일 오전 00시에 공지합니다.&#10;늦으시는 분들은 채팅을 통해 연락 부탁드립니다.&#10;운동 중 개인 부상에 대해서는 본인 책임이 크니 무리하지 마세요!&#10;당일 뵙겠습니다!"
          />
        </label>

        <label className={`${styles.full} ${styles.fileUploadWrapper}`}>
          <span className={styles.fileUploadLabel}>대표 사진 등록</span>
          <input
            type="file"
            accept="image/*"
            className={styles.uploadInput}
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <small className={styles.uploadHint}>
            대표 썸네일 1장만 등록할 수 있습니다. 최대 10MB까지 지원합니다.
          </small>
          <button
            type="button"
            onClick={handleCustomBtnClick}
            className={styles.fileUploadButton}
          >
            파일 선택
          </button>
        </label>

        {previews.length > 0 && (
          <div className={`${styles.full} ${styles.reviewPreviewGrid}`}>
            {previews.map((preview) => (
              <article key={preview.name} className={styles.reviewPreviewCard}>
                <img
                  src={preview.url}
                  alt={preview.name}
                  className={styles.reviewPreviewImage}
                />
                <div className={styles.reviewPreviewMeta}>
                  <span>{preview.name}</span>
                  <button type="button" onClick={handleRemoveImage}>
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={`${styles.full} ${styles.formActions}`}>
          {isEditMode && (
            <div className={styles.formActions}>
              <DeleteMeetingButton
                meetingId={meetingId}
                onDeleted={() => navigate(`/meetings`)}
              />
            </div>
          )}
          <div className={styles.actionGroup}>
            <Link to="/meetings">취소</Link>
            <button type="submit">
              {isEditMode ? "모임 수정" : "모임 등록"}
            </button>
          </div>
        </div>
      </form>

      <SportPickerModal
        open={isSportModalOpen}
        sports={sports}
        initialSelection={{
          category:
            sports.find((s) => s.sportId === form.sportId)?.category ||
            "전체 분류",
          sportId: form.sportId,
          name: selectedSportName,
        }}
        onApply={handleSportApply}
        onClose={() => setIsSportModalOpen(false)}
      />

      <RegionPickerModal
        open={isRegionModalOpen}
        regions={regionHierarchy}
        initialSelection={{
          sido: selectedRegion.sido || "전체 시도",
          sigungu: selectedRegion.sigungu || "전체 시군구",
          dong: selectedRegion.dong || "전체 읍면동",
        }}
        onApply={handleRegionApply}
        onClose={() => setIsRegionModalOpen(false)}
      />
    </div>
  );
}
