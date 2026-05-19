import { Link } from "react-router-dom";
export default function MeetingListItem({ meeting }) {
  return (
    <Link className="meeting-row" to={"/meetings/" + meeting.meetingId}>
      <div>
        <h4>{meeting.title}</h4>
        <p>{meeting.regionName}</p>
      </div>
    </Link>
  );
}
