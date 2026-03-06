import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import MobileNavbar from "./components/MobileNavbar";
import NetworkMobilePage from "./pages/NetworkMobilePage";
import CreatePostMobilePage from "./pages/CreatePostMobilePage";
import SearchMobilePage from "./pages/SearchMobilePage";
import NotificationsPage from "./pages/NotificationsPage";
import CreateCommunityDocs from "./pages/CreateCommunityDocs";
import DocumentationPage from "./pages/DocumentationPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
// @ts-ignore
import ChatPage from "./pages/ChatPage.jsx";

/**
 * Layout mapping to include MobileNavbar on authenticated routes.
 */
function AuthenticatedLayout() {
  return (
    <>
      <Outlet />
      <MobileNavbar />
    </>
  );
}

/**
 * The root component of the application.
 * Handles the main routing setup using React Router.
 *
 * @returns {JSX.Element} The main App component with routes.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/register" element={<AuthPage />} />
        <Route path="/auth/login" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/docs/create-community" element={<CreateCommunityDocs />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />

        {/* Routes with Mobile Bottom Navbar */}
        <Route element={<AuthenticatedLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <NetworkMobilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePostMobilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchMobilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:identifier" element={<Profile />} />
          <Route
            path="/chat/*"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
