import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
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
import CoursePlayerPage from "./pages/learning/CoursePlayerPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
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
        <Route path="/user-login" element={<LoginPage />} />
        <Route path="/user-login.html" element={<Navigate to="/user-login" replace />} />
        <Route path="/user-register" element={<RegisterPage />} />
        <Route path="/user-register.html" element={<Navigate to="/user-register" replace />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-login.html" element={<Navigate to="/admin-login" replace />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin-dashboard.html" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="/course-catalog" element={<CourseCatalogPage />} />
        <Route path="/course-catalog.html" element={<Navigate to="/course-catalog" replace />} />
        <Route path="/user-dashboard" element={<UserDashboardPage />} />
        <Route path="/user-dashboard.html" element={<Navigate to="/user-dashboard" replace />} />
        <Route path="/certificates" element={<CertificateWalletPage />} />
        <Route path="/certificates.html" element={<Navigate to="/certificates" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile.html" element={<Navigate to="/profile" replace />} />
        <Route path="/course-player" element={<CoursePlayerPage />} />
        <Route path="/course-player.html" element={<Navigate to="/course-player" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
