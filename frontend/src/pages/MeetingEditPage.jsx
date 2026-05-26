import MeetingFormPage from "./MeetingFormPage.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {useState} from "react";

export default function MeetingEditPage() {

  const {meetingId} = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);


  const handleUpdate = (formData) => { /* API 로직 */ };
  return <MeetingFormPage title="모임 수정하기" onSubmit={handleUpdate} />;
}