
import {createMeeting} from "../api/meetingApi.js";
import MeetingFormPage from "./MeetingFormPage.jsx";
import {useNavigate} from "react-router-dom";


export default function MeetingCreatePage() {
  console.log("★★★★ 지금 MeetingCreatePage 파일이 실행되었습니다 ★★★★");
  const navigate = useNavigate();

  const handleCreate = (formData) =>{
    createMeeting(formData).then((res)=>{
      console.log(res);
      alert("모임 등록 완료");
      navigate("/meetings");
    }).catch((err)=>{console.log(err);
      if(err.response?.status === 401){
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      }else{
        alert("모임 등록 중 오류가 발생했습니다.")
      }
    });
  }
  return <MeetingFormPage title="모임 만들기" onSubmit={handleCreate} />;
}
