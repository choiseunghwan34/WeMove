import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../styles/MeetingCreatePage.module.css";
import SportPickerModal from "../components/SportPickerModal.jsx";
import RegionPickerModal from "../components/RegionPickerModal.jsx";
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

     const getTodayString = () => new Date().toISOString().split('T')[0];

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
    const [selectedRegion, setSelectedRegion] = useState({ sido: "", sigungu: "", dong: "" });


    // ?몃꽕??誘몃━蹂닿린
    const previews = useMemo(() => {
        return files.map((file) => {
            if (file.url) {
                return { name: file.name, url: file.url };
            }
            return { name: file.name, url: URL.createObjectURL(file) };
        });
    }, [files]);

    // 怨꾩링??吏???곗씠??
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

    // ?쒓컙 ?듭뀡 (?먮윭 ?섏젙??遺遺?
    const timeOptions = useMemo(() => {
        const options = [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const todayStr = getTodayString(); // ?좎뼵???⑥닔 ?덉쟾?섍쾶 ?몄텧

        for (let i = 0; i < 24; i++) {
            for (let m = 0; m < 60; m += 10) {
                // ?ㅻ뒛 ?좎쭨???뚮쭔 ?쒓컙 ?꾪꽣留?
                if (form.meetingDate === todayStr) {
                    if (i < currentHour || (i === currentHour && m <= currentMinute)) {
                        continue;
                    }
                }
                const p = i < 12 ? '?ㅼ쟾' : '?ㅽ썑';
                const hDisplay = i === 0 ? 12 : (i > 12 ? i - 12 : i);
                const valH = String(i).padStart(2, '0');
                const valM = String(m).padStart(2, '0');

                options.push({
                    value: `${valH}:${valM}`,
                    label: `${p} ${String(hDisplay).padStart(2, '0')}:${valM}`
                });
            }
        }
        return options;
    }, [form.meetingDate]);


    // ??4. useEffect (API ?몄텧 諛??ъ씠???댄럺??

    // 硫붾え由??꾩닔 諛⑹?
    useEffect(() => {
        return () => previews.forEach((item) => URL.revokeObjectURL(item.url));
    }, [previews]);

    // 珥덇린 ?곗씠??濡쒕뱶 (醫낅ぉ, 吏??
    useEffect(() => {
        getSports().then((res) => {
            setSports(res.data);
        }).catch((err) => {
            console.log(err)
        });
        getRegions().then((res) => {
            setRegions(res.data.map(r => ({
                regionId: r.regionId,
                sido: normalizeText(r.sido),
                sigungu: normalizeText(r.sigungu),
                dong: normalizeText(r.dong),
            })));
        }).catch((err) => {
            console.log(err)
        });
    }, []);

    // ??珥덇린媛??명똿 (?섏젙 紐⑤뱶????
    useEffect(() => {
        if (!initialData || sports.length === 0 || regions.length === 0) return;

        const foundSport = sports.find(s => s.name === initialData.sportName);
        const foundRegion = regions.find(r =>
            `${r.sido} ${r.sigungu} ${r.dong}` === initialData.regionName);

        const formattedStartTime = initialData.startTime ? initialData.startTime.substring(0, 5) : "";

        setForm(prev => ({
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
            console.log("?대?吏 url?뺤씤: ", initialData.thumbnailImage);
            setFiles([{ name: "existing-thumbnail", url: initialData.thumbnailImage }]);
        }
    }, [initialData, sports, regions]);


    // ??5. ?쇰컲 ?몃뱾???⑥닔??

    const regionDisplayText = selectedRegion.dong ? `${selectedRegion.sido} ${selectedRegion.sigungu} ${selectedRegion.dong}` : "";

    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                let addr = '';
                let extraAddr = '';

                if (data.userSelectedType === 'R') {
                    addr = data.roadAddress;
                } else {
                    addr = data.jibunAddress;
                }

                if (data.userSelectedType === 'R') {
                    if (data.bname !== '' && /[?숇줈媛]$/.test(data.bname)) {
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

    const handleSportApply = (d) => {
        setForm(p => ({ ...p, sportId: d.sportId }));
        setSelectedSportName(d.name);
        setIsSportModalOpen(false);
    };

    const handleRegionApply = (d) => {
        setSelectedRegion({ sido: d.sido, sigungu: d.sigungu, dong: d.dong });
        const match = regions.find(r =>
            r.sido === d.sido &&
            r.sigungu === d.sigungu &&
            r.dong === d.dong
        );
        if (match) {
            setForm(p => ({ ...p, regionId: match.regionId }));
        }
        setIsRegionModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: ["sportId", "regionId", "maxMembers"].includes(name) ? Number(value) : value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file?.size > MAX_THUMBNAIL_SIZE) {
            alert("10MB ?댄븯留?媛?ν빀?덈떎.");
            return;
        }
        if (file) setFiles([file]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (nameToRemove) => {
        setFiles(files.filter(f => f.name !== nameToRemove));
    };

    const handleRemoveImage = () => {
        if (files.length > 0) {
            removeFile(files[0].name);
        }
        setForm(prev => ({
            ...prev,
            thumbnailImage: null,
            isImageRemoved: true,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("onsubmit ?⑥닔?뺤씤: ", onSubmit)

        //?뱀씤???몄썝蹂대떎 ?곴쾶 ?섏젙遺덇?
        if(isEditMode && initialData?.approvedCount !== undefined){
            if(Number(form.maxMembers) < initialData.approvedCount){
                alert(`紐⑥쭛 ?몄썝? ?꾩옱 ?뱀씤???몄썝 (${initialData.approvedCount}紐? ?댁긽?댁뼱???⑸땲??`)
                inputRefs.current.maxMembers?.focus();
                return;
            }
        }

        // ?뱀씪 ?쒓컙 ?좏슚??寃??濡쒖쭅
        const selectedDate = new Date(form.meetingDate);
        const today = new Date();

        const isToday = selectedDate.getFullYear() === today.getFullYear() &&
            selectedDate.getMonth() === today.getMonth() &&
            selectedDate.getDate() === today.getDate();

        if (isToday) {
            const [selectedHour, selectedMinute] = form.startTime.split(":").map(Number);
            const currentHour = today.getHours();
            const currentMinute = today.getMinutes();

            if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute <= currentMinute)) {
                alert("?뱀씪 紐⑥엫? ?꾩옱 ?쒓컙 ?댄썑濡쒕쭔 ?ㅼ젙 媛?ν빀?덈떎.");
                inputRefs.current.startTime?.focus();
                return;
            }
        }

        let finalForm = { ...form };
        if (!finalForm.sportId && selectedSportName) {
            const s = sports.find(x => x.name === selectedSportName);
            if (s) finalForm.sportId = s.sportId;
        }

        if (!finalForm.regionId && selectedRegion.sido) {
            const r = regions.find(x =>
                x.sido === selectedRegion.sido &&
                x.sigungu === selectedRegion.sigungu &&
                x.dong === selectedRegion.dong
            );
            if (r) finalForm.regionId = r.regionId;
        }

        const requiredFields = [
            { key: "title", label: "紐⑥엫 ?쒕ぉ", refKey: "title" },
            { key: "address", label: "二쇱냼", refKey: "address" },
            { key: "placeName", label: "?곸꽭 二쇱냼", refKey: "placeName" },
            { key: "meetingDate", label: "?좎쭨", refKey: "meetingDate" },
            { key: "startTime", label: "?쒖옉 ?쒓컙", refKey: "startTime" },
            { key: "maxMembers", label: "紐⑥쭛 ?몄썝", refKey: "maxMembers" },
            { key: "supplies", label: "以鍮꾨Ъ", refKey: "supplies" },
            { key: "guideText", label: "吏꾪뻾 ?덈궡", refKey: "guideText" },
            { key: "content", label: "紐⑥엫 ?뚭컻", refKey: "content" }
        ];

        for (const f of requiredFields) {
            if (!form[f.key] || String(form[f.key]).trim() === "") {
                alert(`${f.label}??瑜? ?낅젰?댁＜?몄슂.`);
                inputRefs.current[f.refKey]?.focus();
                inputRefs.current[f.refKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        }

        if (!form.sportId) {
            alert("?대룞 醫낅ぉ???좏깮?댁＜?몄슂.");
            setIsSportModalOpen(true);
            return;
        }
        if (!form.regionId) {
            alert("吏??쓣 ?좏깮?댁＜?몄슂.");
            setIsRegionModalOpen(true);
            return;
        }
        if (!isAuthenticated) {
            alert("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("request", new Blob([JSON.stringify(form)], { type: "application/json" }));
        if (files.length > 0) formData.append("image", files[0]);
        onSubmit(formData);
    };

    return (

        <div className={styles.page}>
            <div className={styles.pageTitle}>
                <div>
                    <h1>{title}</h1>
                    <p>{isEditMode ? "李멸? ?덉젙???щ엺?ㅻ룄 ?룰컝由ъ? ?딅룄濡? 諛붾??뺣낫媛 ?쒕늿??蹂댁씠寃??뺣━?대몢?몄슂." : "?쒕ぉ, ?μ냼, ?쒓컙, ?뚭컻? ????ъ쭊源뚯? ?뺣━?섎㈃ ?⑥뵮 ?좊ː媛??덈뒗 紐⑥엫 ?섏씠吏瑜?留뚮뱾 ???덉뒿?덈떎."}

                    </p>
                </div>
            </div>
            <section className={styles.formIntro}>
                <h2>{isEditMode ? "모임 정보를 수정해 주세요." : "좋은 모임은 알아보기 쉬운 정보에서 시작합니다."}</h2>
                <p>
                    제목, 장소, 시간, 소개와 사진을 정리하면 참여자가 모임을 더 쉽게 이해할 수 있습니다.
                </p>
                <div className={styles.formHintGrid}>
                    <article>
                        <span>제목 작성 팁</span>
                        <strong>지역, 운동, 시간을 자연스럽게 보여주기</strong>
                    </article>
                    <article>
                        <span>사진 등록 팁</span>
                        <strong>실제 분위기가 잘 보이는 밝은 운동 사진 선택</strong>
                    </article>
                    <article>
                        <span>소개 작성 팁</span>
                        <strong>초보 가능 여부, 준비물, 진행 방식을 짧고 명확하게 안내</strong>
                    </article>
                </div>
            </section>

            <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
                <label className={styles.full}>
                    <div className={styles.titleRow}>
                        <span className={styles.requiredLabel}>모임 제목</span>
                        <p className={styles.requiredNotice}>* 표시는 필수 입력 항목입니다.</p>
                    </div>
                    <input
                        ref={(el) => (inputRefs.current.title = el)}
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="예: 잠실 5km 러닝 모임"
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
                <label>
                    <span className={styles.requiredLabel}>주소</span>
                    <input
                        ref={(el) => (inputRefs.current.address = el)}
                        name="address"
                        value={form.address}
                        onClick={handleAddressSearch}
                        readOnly
                        placeholder="주소를 설정하세요"
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
                        placeholder="예: 잠실역 2번 출구 앞"
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
                        placeholder="날짜를 설정하세요"
                        onClick={(e) => {
                            const target = e.target;
                            if (target.type !== "date") {
                                target.type = "date";
                            }
                            setTimeout(() => {
                                try {
                                    target.showPicker();
                                } catch (error) {
                                    // Browser fallback.
                                }
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
                            시간을 설정하세요
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
                        min={isEditMode && initialData?.approvedCount ? initialData?.approvedCount : "2"}
                    />
                    {isEditMode && initialData?.approvedCount && Number(form.maxMembers) < initialData.approvedCount && (
                        <small style={{ color: "#d32f2f", marginTop: "4px", display: "block", fontSize: "0.85rem" }}>* 현재 승인된 인원보다 적게 줄일 수 없습니다.</small>
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
                        placeholder="모임 분위기와 간단한 소개를 적어주세요"
                    />
                </label>

                </label>

                <label className={styles.full}>
                    <span className={styles.requiredLabel}>吏꾪뻾 ?덈궡</span>
                    <textarea
                        name="guideText"
                        value={form.guideText}
                        onChange={handleChange}
                        placeholder="[吏꾪뻾 ?덈궡 ?ы빆???곸뼱二쇱꽭??]

- 吏묎껐 ?쒓컙:
紐⑥엫 ?쒖옉 10遺???

- 二쇱쓽?ы빆:
?곗쿇 ??紐⑥엫 痍⑥냼 ?щ????뱀씪 ?ㅼ쟾 00?쒖뿉 怨듭??⑸땲??
??쑝?쒕뒗 遺꾨뱾? 梨꾪똿???듯빐 ?곕씫 遺?곷뱶由쎈땲??
?대룞 以?媛쒖씤 遺?곸뿉 ??댁꽌??蹂몄씤 梨낆엫???щ땲 臾대━?섏? 留덉꽭??
?뱀씪 逾숆쿋?듬땲??"
                    />
                </label>

                <label className={`${styles.full} ${styles.fileUploadWrapper}`}>
                    <span className={styles.fileUploadLabel}>????ъ쭊 ?깅줉</span>
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
                        ????몃꽕??1?λ쭔 ?깅줉?????덉뒿?덈떎. 理쒕? 10MB源뚯? 吏?먰빀?덈떎.
                    </small>

                    <button
                        type="button"
                        onClick={handleCustomBtnClick}
                        className={styles.fileUploadButton}
                    >
                        ?뚯씪 ?좏깮
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
                                        ??젣
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <div className={`${styles.full} ${styles.formActions}`}>
                    {isEditMode && (
                        <div className={styles.formActions}> {/* ??젣 踰꾪듉??媛먯떥??div 異붽? */}
                            <DeleteMeetingButton meetingId={meetingId} onDeleted={() => navigate(`/meetings`)} />
                        </div>

                    )}
                    <div className={styles.actionGroup}>
                        <Link to="/meetings">痍⑥냼</Link>
                        <button type="submit">{isEditMode ? "紐⑥엫 ?섏젙" : "紐⑥엫 ?깅줉"}</button>

                    </div>
                </div>
            </form>


            {/*?대룞 醫낅ぉ ?좏깮 紐⑤떖*/}
            <SportPickerModal
                open={isSportModalOpen}
                sports={sports} // DB?먯꽌 媛?몄삩 諛곗뿴 ?꾨떖
                initialSelection={{
                    category: sports.find(s => s.sportId === form.sportId)?.category || "?꾩껜 遺꾨쪟",
                    sportId: form.sportId,
                    name: selectedSportName
                }}
                onApply={handleSportApply}
                onClose={() => setIsSportModalOpen(false)}
            />
            {/*吏???좏깮 紐⑤떖*/}
            <RegionPickerModal
                open={isRegionModalOpen}
                regions={regionHierarchy} // 蹂?섎맂 怨꾩링???곗씠??
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
