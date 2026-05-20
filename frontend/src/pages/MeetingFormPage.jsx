import { useParams } from "react-router-dom";
import MeetingCreatePage from "./MeetingCreatePage";
import MeetingEditPage from "./MeetingEditPage";

const MeetingFormPage = () => {
  const { meetingId } = useParams();
  const isEdit = Boolean(meetingId);

  return <div>{isEdit ? <MeetingEditPage /> : <MeetingCreatePage />}</div>;
};
