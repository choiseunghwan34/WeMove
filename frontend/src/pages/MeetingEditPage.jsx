import MeetingFormPage from "./MeetingFormPage.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {getMeeting, updateMeeting} from "../api/meetingApi.js";

export default function MeetingEditPage() {

  const {meetingId} = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  //1.기존 데이터 불러오기
  useEffect(()=>{
    getMeeting(meetingId).then((res)=>{
      console.log(res.data);
      setInitialData(res.data);
      setLoading(false);
    }).catch((err)=>{
      console.log(err);
      alert("모임 정보를 불러오는데 실패했습니다.")
      navigate("/meetings");
    })
  },[meetingId, navigate]);

  //2.수정 api호출 로직
  const handleUpdate = (formData) => {
    updateMeeting(meetingId, formData).then((res)=>{
      console.log(res);
      alert("모임이 수정되었습니다.");
      navigate(`/meetings/${meetingId}`); //해당 모임의 상세페이지로 이동
  }).catch((err)=>{
    console.log(err);
    if(err.response?.status === 401){
      alert("로그인이 만료되었습니다.");
      navigate("/login");
    }else{
    alert("모임 수정 중 오류가 발생했습니다.")}
    });
  }
  //데이터를 가져오는 중일 때
  if(!initialData){
    return (
        <div>모임 정보를 불러오는 중...</div>
    )
  }

  return <MeetingFormPage title="모임 수정하기"
                          initialData={initialData}
                          onSubmit={handleUpdate} />;
}