import MeetingFormPage from "./MeetingFormPage.jsx";

export default function MeetingEditPage() {
  const handleUpdate = (formData) => { /* API 로직 */ };
  return <MeetingFormPage title="모임 수정하기" onSubmit={handleUpdate} />;
}