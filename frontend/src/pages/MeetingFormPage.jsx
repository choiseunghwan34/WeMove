import {useEffect, useMemo, useRef, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import styles from "../styles/MeetingCreatePage.module.css";
import SportPickerModal from "../components/SportPickerModal.jsx";
import RegionPickerModal from "../components/RegionPickerModal.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";
import {getSports} from "../api/sportApi.js";
import {getRegions} from "../api/regionApi.js";

const normalizeText = (value = "") => String(value).trim();
const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024;

export default function MeetingFormPage({initialData, onSubmit, title}) {
    console.log("★★★★★★ props 확인 ★★★★★★");
    console.log("onSubmit:", onSubmit);
    console.log("title:", title);

    const {meetingId} = useParams();
    const isEditMode = !!meetingId;//meetingId가 있으면 TRUE, 없으면 FALSE

    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();
    const fileInputRef = useRef(null);
    const inputRefs = useRef({});

    const initialFormValue = initialData || {
        sportId: null, regionId: null, title: "", content: "", placeName: "", address: "",
        latitude: null, longitude: null, meetingDate: "", startTime: "", maxMembers: "",
        meetingType: "ONE_TIME", repeatType: "NONE", supplies: "", guideText: "", status: "RECRUITING",
    };

    const [form, setForm] = useState(initialFormValue);
    const [files, setFiles] = useState([]);

    const [sports, setSports] = useState([]);
    const [regions, setRegions] = useState([]);

    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
    const [isSportModalOpen, setIsSportModalOpen] = useState(false);

    const [selectedSportName, setSelectedSportName] = useState("");
    const [selectedRegion, setSelectedRegion] = useState({sido: "", sigungu: "", dong: ""});


    // 썸네일 미리보기
    const previews = useMemo(() => {
        return files.map((file) => {
            // 1. file이 객체 형태(수정 모드에서 넣은 {name, url})라면 url 그대로 사용
            if (file.url) {
                return {name: file.name, url: file.url};
            }
            // 2. file이 실제 File 객체라면 createObjectURL 사용
            return {name: file.name, url: URL.createObjectURL(file)};
        });
    }, [files]);

    useEffect(() => {
        return () => previews.forEach((item) => URL.revokeObjectURL(item.url));
    }, [previews]);

    useEffect(() => {
        getSports().then((res)=>{
            setSports(res.data);
        }).catch((err)=>{console.log(err)});
        getRegions().then((res)=>{
            setRegions(res.data.map(r=>({
                regionId: r.regionId,
                sido: normalizeText(r.sido),
                sigungu: normalizeText(r.sigungu),
                dong: normalizeText(r.dong),
            })));
        }).catch((err)=>{console.log(err)});
    }, []);

    // 데이터 로드
    useEffect(() => {
        //1. 기본 폼 데이터 불러오기(저장된 데이터가 있을때만 실행)
        if (!initialData || sports.length === 0 || regions.length === 0) return;

        const foundSport = sports.find(s => s.name === initialData.sportName);
        const foundRegion = regions.find(r =>
            `${r.sido} ${r.sigungu} ${r.dong}` === initialData.regionName);

        setForm(prev => ({
            ...prev,
            ...initialData,
            startTime: formattedStartTime,
            sportId: foundSport? foundSport.sportId : prev.sportId,
            regionId: foundRegion? foundRegion.regionId : prev.regionId,

        }));

        //모달 표시용 이름 동기화
        if(initialData.sportName){
            setSelectedSportName(initialData.sportName);
        }
        if(initialData.regionName){
            const parts = initialData.regionName.split(" ");
            setSelectedRegion({
                sido: parts[0] || "",
                sigungu: parts[1] || "",
                dong: parts[2] || "",
            })
        }
        if (initialData.thumbnailImage) {
            console.log("이미지 url확인: ", initialData.thumbnailImage);
            setFiles([{name: "기존 썸네일", url: initialData.thumbnailImage}]);
        }

        const formattedStartTime = initialData.startTime ? initialData.startTime.substring(0,5): "";




    }, [initialData, sports, regions]);

    const regionHierarchy = useMemo(() => {
        const grouped = new Map();
        regions.forEach((region) => {
            if (!grouped.has(region.sido)) grouped.set(region.sido, new Map());
            const sigunguMap = grouped.get(region.sido);
            if (!sigunguMap.has(region.sigungu)) sigunguMap.set(region.sigungu, []);
            sigunguMap.get(region.sigungu).push(region.dong);
        });
        return [...grouped.entries()].sort((l, r) => l[0].localeCompare(r[0], "ko")).map(([sido, sigunguMap]) => ({
            sido,
            sigungus: [...sigunguMap.entries()].sort((l, r) => l[0].localeCompare(r[0], "ko")).map(([sigungu, dongs]) => ({
                sigungu,
                dongs: [...new Set(dongs)].sort((l, r) => l.localeCompare(r, "ko")),
            })),
        }));
    }, [regions]);

    const timeOptions = useMemo(() => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            const p = i < 12 ? '오전' : '오후';
            const h = i === 0 ? 12 : (i > 12 ? i - 12 : i);
            const valH = String(i).padStart(2, '0');
            options.push({value: `${valH}:00`, label: `${p} ${String(h).padStart(2, '0')}:00`});
            options.push({value: `${valH}:30`, label: `${p} ${String(h).padStart(2, '0')}:30`});
        }
        return options;
    }, []);

    // 핸들러
    // 카카오 주소 API 핸들러
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                let addr = ''; // 주소 변수
                let extraAddr = ''; // 참고항목 변수

                // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === 'R') { // 도로명 주소
                    addr = data.roadAddress;
                } else { // 지번 주소
                    addr = data.jibunAddress;
                }

                // 도로명 타입일 때 참고항목을 조합한다.
                if (data.userSelectedType === 'R') {
                    if (data.bname !== '' && /[동로가]$/.test(data.bname)) {
                        extraAddr += data.bname;
                    }
                    if (data.buildingName !== '' && data.apartment === 'Y') {
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    if (extraAddr !== '') {
                        extraAddr = ' (' + extraAddr + ')';
                    }
                }
                const fullAddress = addr + extraAddr;

                setForm((prev) => ({
                    ...prev, address: fullAddress
                }));
            }
        }).open();
    };
    const handleCustomBtnClick = () => fileInputRef.current.click();
    const getTodayString = () => new Date().toISOString().split('T')[0];
    const regionDisplayText = selectedRegion.dong ? `${selectedRegion.sido} ${selectedRegion.sigungu} ${selectedRegion.dong}` : "";

    const handleSportApply = (d) => {
        setForm(p => ({...p, sportId: d.sportId}));
        setSelectedSportName(d.name);
        setIsSportModalOpen(false);
    };
    const handleRegionApply = (d) => {
        // 1. 선택된 정보를 상태에 저장 (화면 표시용)
        setSelectedRegion({sido: d.sido, sigungu: d.sigungu, dong: d.dong});
        // 2. 평탄화된 regions 리스트에서 ID를 찾음
        const match = regions.find(r =>
            r.sido === d.sido &&
            r.sigungu === d.sigungu &&
            r.dong === d.dong
        );
        if (match) {
            setForm(p => ({...p, regionId: match.regionId}));
        }
        setIsRegionModalOpen(false);
    };
    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm(p => ({...p, [name]: ["sportId", "regionId", "maxMembers"].includes(name) ? Number(value) : value}));
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
    const removeFile = (nameToRemove) => {
        setFiles(files.filter(f => f.name !== nameToRemove));
    };
    const handleRemoveImage =()=>{
        if (files.length > 0) {
            removeFile(files[0].name);
        }
        setForm(prev=>({
            ...prev,
            thumbnailImage: null,
            isImageRemoved: true,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("onsubmit 함수확인: ", onSubmit)

        let finalForm = {...form};
        // sportName은 있는데 sportId가 없다면 매칭
        if (!finalForm.sportId && selectedSportName) {
            const s = sports.find(x => x.name === selectedSportName);
            if (s) finalForm.sportId = s.sportId;
        }

        // regionName(이름)은 있는데 regionId가 없다면 매칭
        if (!finalForm.regionId && selectedRegion.sido) {
            const r = regions.find(x =>
                x.sido === selectedRegion.sido &&
                x.sigungu === selectedRegion.sigungu &&
                x.dong === selectedRegion.dong
            );
            if (r) finalForm.regionId = r.regionId;
        }

        const requiredFields = [
            {key: "title", label: "모임 제목", refKey: "title"},
            {key: "address", label: "주소", refKey: "address"},
            {key: "placeName", label: "상세 주소", refKey: "placeName"},
            {key: "meetingDate", label: "날짜", refKey: "meetingDate"},
            {key: "startTime", label: "시작 시간", refKey: "startTime"},
            {key: "maxMembers", label: "모집 인원", refKey: "maxMembers"},
            {key: "supplies", label: "준비물", refKey: "supplies"},
            {key: "guideText", label: "진행 안내", refKey: "guideText"},
            {key: "content", label: "모임 소개", refKey: "content"}
        ];
        for (const f of requiredFields) {
            if (!form[f.key] || String(form[f.key]).trim() === "") {
                alert(`${f.label}을(를) 입력해주세요.`);
                inputRefs.current[f.refKey]?.focus();
                inputRefs.current[f.refKey]?.scrollIntoView({behavior: 'smooth', block: 'center'});
                return;
            }
        }
        if (!form.sportId) {
            alert("운동 종목을 선택해주세요.");
            setIsSportModalOpen(true);
            return;
        }
        if (!form.regionId) {
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
        formData.append("request", new Blob([JSON.stringify(form)], {type: "application/json"}));
        if (files.length > 0) formData.append("image", files[0]);
        onSubmit(formData);
    };

    return (

        <div className={styles.page}>
            <div className={styles.pageTitle}>
                <div>
                    <h1>{title}</h1>
                    <p>{isEditMode? "참가 예정인 사람들도 헷갈리지 않도록, 바뀐 정보가 한눈에 보이게 정리해두세요." :"제목, 장소, 시간, 소개와 대표 사진까지 정리하면 훨씬 신뢰감 있는 모임 페이지를 만들 수 있습니다."}

                    </p>
                </div>
            </div>

            <section className={styles.formIntro}>
                <h2>{isEditMode? "기존 흐름은 유지하고, 필요한 부분만 정확하게 다듬어보세요.":"좋은 모임은 한눈에 이해되는 정보에서 시작됩니다."}</h2>
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

            <form className={styles.formCard} onSubmit={handleSubmit}>
                <p className={styles.requiredNotice}>* 표시는 필수 입력 항목입니다.</p>

                {/* ref={(el) => (inputRefs.current.필드명 = el)} 형태로 할당 */}
                <label className={styles.full}>
                    <span className={styles.requiredLabel}>모임 제목</span>
                    <input
                        ref={(el) => (inputRefs.current.title = el)}
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="예: 야당역 5km 러닝 크루 모집"
                    />
                </label>
                {/* 운동 종목 선택 영역 */}
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
                {/* 지역 선택 영역 */}
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
                        style={{cursor: "pointer"}}
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
                    <input
                        ref={(el) => (inputRefs.current.meetingDate = el)}
                        name="meetingDate"
                        value={form.meetingDate}
                        onChange={handleChange}
                        type={form.meetingDate ? "date" : "text"}
                        placeholder="날짜를 설정하세요."
                        onClick={(e) => {
                            const target = e.target;

                            // 1. 클릭하는 순간 즉시 date 타입으로 변경
                            if (target.type !== "date") {
                                target.type = "date";
                            }

                            // 2. 브라우저가 타입을 바꿀 아주 짧은 시간(10ms)을 준 뒤 달력 강제 호출
                            setTimeout(() => {
                                try {
                                    target.showPicker();
                                } catch (error) {
                                    // Safari 등 구형 브라우저 대비 안전장치
                                }
                            }, 10);
                        }}
                        onBlur={(e) => {
                            // 달력을 닫았는데 값이 없으면 다시 text(Placeholder)로 복귀
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
                        min="2"
                    />
                </label>
                <label>
                    <span className={styles.requiredLabel}>모집 상태</span>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="RECRUITING">모집중</option>
                        <option value="CLOSED">모집마감</option>
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
                    <span className={styles.requiredLabel}>진행 안내</span>
                    <textarea
                        name="guideText"
                        value={form.guideText}
                        onChange={handleChange}
                        placeholder="시작 10분 전 집결을 권장합니다. 간단한 인사와 스트레칭 후 함께 이동합니다."
                    />
                </label>

                <label className={styles.full}>
                    <span className={styles.requiredLabel}>모임 소개</span>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        placeholder="모임 분위기, 참가 대상, 준비물, 진행 방식, 초보 가능 여부를 적어주세요."
                    />
                </label>

                <label className={`${styles.full} ${styles.fileUploadWrapper}`}>
                    <span className={styles.fileUploadLabel}>대표 사진 등록</span>
                    <input
                        type="file"
                        accept="image/*"
                        className={styles.uploadInput}
                        multiple
                        ref={fileInputRef}
                        //className={styles.uploadInput}
                        onChange={handleFileChange}
                        style={{display: "none"}}
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
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <div className={`${styles.full} ${styles.formActions}`}>
                    <Link to="/meetings">취소</Link>
                    <button type="submit">{isEditMode? "모임 수정" : "모임 등록"}</button>
                </div>
            </form>


            {/*운동 종목 선택 모달*/}
            <SportPickerModal
                open={isSportModalOpen}
                sports={sports} // DB에서 가져온 배열 전달
                initialSelection={{
                    category: sports.find(s => s.sportId === form.sportId)?.category || "전체 분류",
                    sportId: form.sportId,
                    name: selectedSportName
                }}
                onApply={handleSportApply}
                onClose={() => setIsSportModalOpen(false)}
            />
            {/*지역 선택 모달*/}
            <RegionPickerModal
                open={isRegionModalOpen}
                regions={regionHierarchy} // 변환된 계층형 데이터
                initialSelection={{
                    sido: selectedRegion.sido || "전체 시도",
                    sigungu: selectedRegion.sigungu || "전체 시군구",
                    dong: selectedRegion.dong || "전체 읍면동",
                }}
                onApply={handleRegionApply}
                onClose={() => {
                    setIsRegionModalOpen(false);
                }}
            />
        </div>


    )

}