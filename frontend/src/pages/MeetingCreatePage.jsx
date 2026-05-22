import {useEffect, useMemo, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import styles from "../styles/MeetingCreatePage.module.css";
import {createMeeting} from "../api/meetingApi.js";

import {getSports} from "../api/sportApi.js";
import {getRegions} from "../api/regionApi.js";

import SportPickerModal from "../components/SportPickerModal.jsx";
import RegionPickerModal from "../components/RegionPickerModal.jsx";

//썸네일영역
function useImagePreviews(files) {
    const previews = useMemo(() => {
        return files.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        }));
    }, [files]);

    useEffect(() => {
        return () => {
            previews.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [previews]);

    return previews;
}

//텍스트 정규화
const normalizeText = (value = "") => String(value).trim();

export default function MeetingCreatePage() {
    //인풋정보
    const initialForm = {
        sportId: 1,
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
    const [form, setForm] = useState(initialForm);
    const navigate = useNavigate();

    //파일인풋 조작 ref
    const fileInputRef = useRef(null);
    const handleCustomBtnClick = () => {
        fileInputRef.current.click();
    }

    //오늘 날짜 가져오는 함수
    const getTodayString =()=>{
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }




    //모달 선택 및 상태관리
    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
    const [isSportModalOpen, setIsSportModalOpen] = useState(false);

    const [sports, setSports] = useState([]);
    const [regions, setRegions] = useState([]);

    const [selectedSportName, setSelectedSportName] = useState("");
    const [selectedRegion, setSelectedRegion] = useState({
        sido: "",
        sigungu: "",
        dong: "",
    });

    const regionDisplayText = selectedRegion.dong ? `${selectedRegion.sido} ${selectedRegion.sigungu} ${selectedRegion.dong}` : "";

    useEffect(() => {
        //운동종목
        getSports().then((res) => {
            console.log(res);
            setSports(res.data)
        }).catch((err) => {
            console.log(err)
        })
        //지역 ( sido, sigungu, dong)
        getRegions().then((res) => {
            console.log(res);
            const normalizeRegions = res.data.map(r => ({
                regionId: r.regionId,
                sido: normalizeText(r.sido),
                sigungu: normalizeText(r.sigungu),
                dong: normalizeText(r.dong),
            }))
            setRegions(normalizeRegions);
        }).catch((err) => {
            console.log(err)
        })
    }, []);
    //지역데이터를 계층형으로 변환
    const regionHierarchy = useMemo(() => {
        const grouped = new Map();

        regions.forEach((region) => {
            if (!grouped.has(region.sido)) {
                grouped.set(region.sido, new Map());
            }
            const sigunguMap = grouped.get(region.sido);
            if (!sigunguMap.has(region.sigungu)) {
                sigunguMap.set(region.sigungu, []);
            }
            sigunguMap.get(region.sigungu).push(region.dong);
        })
        return [...grouped.entries()].sort((left, right) => left[0].localeCompare(right[0], "ko")).map(([sido, sigunguMap]) => ({
            sido,
            sigungus: [...sigunguMap.entries()].sort((left, right) => left[0].localeCompare(right[0], "ko"))
                .map(([sigungu, dongs]) => ({
                    sigungu,
                    dongs: [...new Set(dongs)].sort((left, right) => left.localeCompare(right, "ko")),
                }))
        }))
    }, [regions])


    //운동종목 적용 모달 핸들러
    const handleSportApply = (selectedDraft) => {
        setForm((prev) => ({...prev, sportId: selectedDraft.sportId}));
        setSelectedSportName(selectedDraft.name);
        setIsSportModalOpen(false);
    };
    //지역 적용 모달 핸들러
    const handleRegionApply = (selectedDraft) => {
        setSelectedRegion({
            sido: selectedDraft.sido,
            sigungu: selectedDraft.sigungu,
            dong: selectedDraft.dong,
        })

        //원본데이터에서 일치하는 객체를 찾아 regionId 추출
        const matchedRegion = regions.find(r =>
            r.sido === selectedDraft.sido &&
            r.sigungu === selectedDraft.sigungu &&
            r.dong === selectedDraft.dong
        );
        if (matchedRegion) {
            setForm((prev) => ({...prev, regionId: matchedRegion.regionId}));
        }
        setIsRegionModalOpen(false);
    }

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev, [name]: ["sportId", "regionId", "maxMembers"].includes(name)
                ? Number(value)
                : value,
        }));
    };

    //썸네일 파일 처리
    const [files, setFiles] = useState([]);
    const previews = useImagePreviews(files);

    const handleFileChange = (event) => {
        const nextFiles = Array.from(event.target.files ?? []).slice(0, 4);
        setFiles(nextFiles);

        // 핵심: 브라우저가 이전 파일을 기억하지 못하도록 input 값을 비움
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (targetName) => {
        setFiles((current) => current.filter((file) => file.name !== targetName));
    };


    //모임 등록 제출
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.sportId || !form.regionId) {
            alert("운동 종목과 지역을 선택해주세요.")
            return;
        }
        console.log(form);
        createMeeting(form).then((res) => {
            console.log(res)
            alert("모임 등록 완료");
            navigate("/meetings");
        }).catch((err) => {
            console.log(err)
            alert("모임 등록 중 오류가 발생했습니다.")
        })

        /*파일 추가시 아래코드사용
        const formData = new FormData();

                // JSON 데이터 추가
        formData.append("request",
            new Blob([JSON.stringify(form)], {
                type: "application/json",
            }))

        //이미지 파일 추가
        files.forEach((file) => {
            formData.append("images", file);
        })

        //api요청
        createMeeting(formData).then((res) => {
            console.log(res)
            alert("모임 등록 완료")
            //navigate("/meetings");
        }).catch((err) => {
            console.log(err)
            alert("모임 등록 실패")
        })
        * */
    }


    return (
        <div className={styles.page}>
            <div className={styles.pageTitle}>
                <div>
                    <h1>모임 만들기</h1>
                    <p>
                        제목, 장소, 시간, 소개와 대표 사진까지 정리하면 훨씬 신뢰감 있는
                        모임 페이지를 만들 수 있습니다.
                    </p>
                </div>
            </div>

            <section className={styles.formIntro}>
                <h2>좋은 모임은 한눈에 이해되는 정보에서 시작됩니다.</h2>
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
                        <strong>실제 분위기가 잘 보이는 밝은 운동 사진 1~4장 선택</strong>
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
                <label className={styles.full}>
                    <span>모임 제목</span>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="예: 야당역 5km 러닝 크루 모집"
                    />
                </label>
                {/* 운동 종목 선택 영역 */}
                <label>
                    <span>운동 종목</span>
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
                                className={selectedSportName ? styles.valueText : styles.placeholderText}>{selectedSportName || "운동 종목을 선택해주세요"}</span>
                        </div>
                    </div>
                </label>
                {/* 지역 선택 영역 */}
                <label>
                    <span>지역</span>
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
                                className={regionDisplayText ? styles.valueText : styles.placeholderText}>{regionDisplayText || "지역을 선택해주세요."}</span>
                        </div>
                    </div>
                </label>

                <label>
                    <span>상세 장소</span>
                    <input
                        name="placeName"
                        value={form.placeName}
                        onChange={handleChange}
                        placeholder="예: 야당역 2번 출구 앞"
                    />
                </label>
                <label>
                    <span>주소</span>
                    <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="예: 경기 파주시 경의로 000"
                    />
                </label>
                <label>
                    <span>날짜</span>
                    <input
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
                    <span>시작 시간</span>
                    <input
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        type={form.startTime ? "time":"text"}
                        placeholder="시간을 설정하세요"
                        onClick={(e)=>{
                            const target = e.target;
                            // 1. 클릭하는 순간 즉시 time 타입으로 변경
                            if (target.type !== "time") {
                                target.type = "time";
                            }

                            // 2. 브라우저가 타입을 바꿀 아주 짧은 시간(10ms)을 준 뒤 시간 선택창 강제 호출
                            setTimeout(() => {
                                try {
                                    target.showPicker();
                                } catch (error) {
                                    // Safari 등 구형 브라우저 대비 안전장치
                                }
                            }, 10);
                        }}
                        onBlur={(e)=>{
                            //창을 닫았을때 선택된 값이 없다면 다시 텍스트로 복귀
                            if(!e.target.value){
                                e.target.type = "text";
                            }
                        }}
                        //시간설정30분(1800초)단위로 선택가능하게 제한
                        step="1800"/>
                </label>
                <label>
                    <span>모집 인원</span>
                    <input
                        name="maxMembers"
                        value={form.maxMembers}
                        onChange={handleChange}
                        type="number"
                        min="2"
                    />
                </label>
                <label>
                    <span>모집 상태</span>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="RECRUITING">모집중</option>
                        <option value="CLOSED">모집마감</option>
                    </select>
                </label>
                {/*
        <div className={`${styles.full} ${styles.choiceGroup}`}>
          <span>모임 방식</span>
          <div>
            <label><input type="radio" name="meetingType" defaultChecked /> 1회성 모임</label>
            <label><input type="radio" name="meetingType" /> 정기 모임</label>
          </div>
        </div>


        <label>
          <span>반복 주기</span>
          <select defaultValue="NONE">
            <option value="NONE">없음</option>
            <option value="WEEKLY">매주</option>
            <option value="BIWEEKLY">격주</option>
            <option value="MONTHLY">매월</option>
          </select>
        </label>
            */}

                <label className={styles.full}>
                    <span>준비물</span>
                    <input
                        name="supplies"
                        value={form.supplies}
                        onChange={handleChange}
                        placeholder="편한 운동복, 물, 개인 이어폰"
                    />
                </label>

                <label className={styles.full}>
                    <span>진행 안내</span>
                    <textarea
                        name="guideText"
                        value={form.guideText}
                        onChange={handleChange}
                        placeholder="시작 10분 전 집결을 권장합니다. 간단한 인사와 스트레칭 후 함께 이동합니다."
                    />
                </label>

                <label className={styles.full}>
                    <span>모임 소개</span>
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
                        multiple
                        ref={fileInputRef}
                        //className={styles.uploadInput}
                        onChange={handleFileChange}
                        style={{display: "none"}}
                    />

                    <button type="button" onClick={handleCustomBtnClick} className={styles.fileUploadButton}>파일 선택
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
                                        onClick={() => removeFile(preview.name)}
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
                    <button type="submit">모임 등록</button>
                </div>
            </form>

            {/*운동 종목 선택 모달*/}
            <SportPickerModal open={isSportModalOpen}
                              sports={sports} // DB에서 가져온 배열 전달
                              initialSelection={{sportId: form.sportId, name: selectedSportName}}
                              onApply={handleSportApply}
                              onClose={() => setIsSportModalOpen(false)}/>
            {/*지역 선택 모달*/}
            <RegionPickerModal open={isRegionModalOpen}
                               regions={regionHierarchy} // 변환된 계층형 데이터
                               initialSelection={{
                                   sido: selectedRegion.sido || "전체 시도",
                                   sigungu: selectedRegion.sigungu || "전체 시군구",
                                   dong: selectedRegion.dong || "전체 읍면동"
                               }}
                               onApply={handleRegionApply}
                               onClose={() => {
                                   setIsRegionModalOpen(false)
                               }}/>
        </div>
    );
}
