import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import AdminPage from "./pages/AdminPage";
import ActivityPage from "./pages/ActivityPage";
import FindAccountPage from "./pages/FindAccountPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MeetingCreatePage from "./pages/MeetingCreatePage";
import MeetingDetailPage from "./pages/MeetingDetailPage";
import MeetingEditPage from "./pages/MeetingEditPage";
import MeetingListPage from "./pages/MeetingListPage";
import MeetingManagePage from "./pages/MeetingManagePage";
import MyPage from "./pages/MyPage";
import ReviewPage from "./pages/ReviewPage";
import SignupPage from "./pages/SignupPage";

function LayoutRoutes() {
  const location = useLocation();
  const { pathname } = location;
  const isDashboardRoute = (
    pathname === "/"
    || pathname === "/meetings"
    || pathname === "/activity"
    || pathname === "/mypage"
  );

  return (
    <>
      {!isDashboardRoute && <Header />}
      <main className={isDashboardRoute ? "app-main home-main" : "app-main"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/meetings" element={<MeetingListPage />} />
          <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
          <Route path="/meetings/new" element={<MeetingCreatePage />} />
          <Route path="/meetings/:meetingId/edit" element={<MeetingEditPage />} />
          <Route path="/meetings/:meetingId/manage" element={<MeetingManagePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/meetings/:meetingId/reviews" element={<ReviewPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/find-account" element={<FindAccountPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<LayoutRoutes />} />
    </Routes>
  );
}
