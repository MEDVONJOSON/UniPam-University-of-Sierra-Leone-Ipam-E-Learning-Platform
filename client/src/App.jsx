import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import LmsShell from "./layouts/LmsShell";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import TrainingPage from "./pages/TrainingPage";
import ContactPage from "./pages/ContactPage";
import ServicePage from "./pages/ServicePage";
import TeamPage from "./pages/TeamPage";
import TestimonialPage from "./pages/TestimonialPage";
import FeaturePage from "./pages/FeaturePage";
import PricePage from "./pages/PricePage";
import DetailPage from "./pages/DetailPage";
import QuotePage from "./pages/QuotePage";
import ApplicationsPage from "./pages/ApplicationsPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CourseCatalogPage from "./pages/learning/CourseCatalogPage";
import UserDashboardPage from "./pages/learning/UserDashboardPage";
import CertificateWalletPage from "./pages/learning/CertificateWalletPage";
import ProfilePage from "./pages/learning/ProfilePage";
import MessagesPage from "./pages/learning/MessagesPage";
import CoursePlayerPage from "./pages/learning/CoursePlayerPage";
import TeachingPage from "./pages/learning/TeachingPage";
import CourseMaterialsManagerPage from "./pages/learning/CourseMaterialsManagerPage";
import CourseAssessmentsManagerPage from "./pages/learning/CourseAssessmentsManagerPage";
import AssessmentResultsPage from "./pages/learning/AssessmentResultsPage";
import TakeAssessmentPage from "./pages/learning/TakeAssessmentPage";
import MaterialsRepositoryPage from "./pages/learning/MaterialsRepositoryPage";
import IpamPage from "./pages/IpamPage";
import IpamFacultyPage from "./pages/IpamFacultyPage";
import IpamProgramPage from "./pages/IpamProgramPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public marketing site */}
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about.html" element={<Navigate to="/about" replace />} />
        <Route path="/service" element={<ServicePage />} />
        <Route path="/service.html" element={<Navigate to="/service" replace />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team.html" element={<Navigate to="/team" replace />} />
        <Route path="/testimonial" element={<TestimonialPage />} />
        <Route path="/testimonial.html" element={<Navigate to="/testimonial" replace />} />
        <Route path="/feature" element={<FeaturePage />} />
        <Route path="/feature.html" element={<Navigate to="/feature" replace />} />
        <Route path="/price" element={<PricePage />} />
        <Route path="/price.html" element={<Navigate to="/price" replace />} />
        <Route path="/detail" element={<DetailPage />} />
        <Route path="/detail.html" element={<Navigate to="/detail" replace />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/quote.html" element={<Navigate to="/quote" replace />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications.html" element={<Navigate to="/applications" replace />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/training.html" element={<Navigate to="/training" replace />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/contact.html" element={<Navigate to="/contact" replace />} />
        {/* IPAM Academic Portal */}
        <Route path="/ipam" element={<IpamPage />} />
        <Route path="/ipam/:facultySlug" element={<IpamFacultyPage />} />
        <Route path="/ipam/:facultySlug/:programId" element={<IpamProgramPage />} />
        {/* Public course browsing - no auth required to browse, only to enroll */}
        <Route path="/course-catalog" element={<CourseCatalogPage />} />
        <Route path="/course-catalog.html" element={<Navigate to="/course-catalog" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-login.html" element={<Navigate to="/admin-login" replace />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin-dashboard.html" element={<Navigate to="/admin-dashboard" replace />} />

        {/* Legacy path redirects */}
        <Route path="/user-login" element={<Navigate to="/login" replace />} />
        <Route path="/user-login.html" element={<Navigate to="/login" replace />} />
        <Route path="/user-register" element={<Navigate to="/register" replace />} />
        <Route path="/user-register.html" element={<Navigate to="/register" replace />} />
        <Route path="/user-dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/user-dashboard.html" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/certificates" element={<Navigate to="/app/certificates" replace />} />
        <Route path="/certificates.html" element={<Navigate to="/app/certificates" replace />} />
        <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
        <Route path="/profile.html" element={<Navigate to="/app/profile" replace />} />
        <Route path="/course-player" element={<Navigate to="/app/learn" replace />} />
        <Route path="/course-player.html" element={<Navigate to="/app/learn" replace />} />

        {/* Authenticated LMS app */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<LmsShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboardPage />} />
            <Route path="certificates" element={<CertificateWalletPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="learn" element={<CoursePlayerPage />} />
            <Route path="learn/:courseId" element={<CoursePlayerPage />} />
            <Route path="learn/:courseId/assessments/:assessmentId" element={<TakeAssessmentPage />} />
            <Route path="teach" element={<TeachingPage />} />
            <Route path="teach/:courseId/materials" element={<CourseMaterialsManagerPage />} />
            <Route path="teach/:courseId/assessments" element={<CourseAssessmentsManagerPage />} />
            <Route path="teach/:courseId/assessments/:assessmentId/results" element={<AssessmentResultsPage />} />
            <Route path="repository" element={<MaterialsRepositoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
