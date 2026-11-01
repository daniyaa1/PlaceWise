import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Components
import Navbar from './components/Navbar';
import SidebarRail from './components/SidebarRail';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';

// Student Pages
import DashboardPage from './pages/student/DashboardPage';
import ProfilePage from './pages/student/ProfilePage';
import PreferencesPage from './pages/student/PreferencesPage';
import ResumePage from './pages/student/ResumePage';
import OpportunityDiscoveryPage from './pages/student/OpportunityDiscoveryPage';
import OpportunityDetailPage from './pages/student/OpportunityDetailPage';
import CompanyDetailPage from './pages/student/CompanyDetailPage';
import ApplicationTrackerPage from './pages/student/ApplicationTrackerPage';
import NotificationsPage from './pages/student/NotificationsPage';
import SettingsPage from './pages/student/SettingsPage';

// Placement Admin Pages
import PlacementDashboardPage from './pages/admin/PlacementDashboardPage';
import CompanyManagementPage from './pages/admin/CompanyManagementPage';
import DriveManagementPage from './pages/admin/DriveManagementPage';

// Platform Admin Pages
import ModerationQueuePage from './pages/platform/ModerationQueuePage';
import InstitutionManagementPage from './pages/platform/InstitutionManagementPage';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Authenticating user session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f9] dark:bg-[#080b14] text-slate-900 dark:text-slate-100 transition-colors duration-400 relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Dynamic Ambient Glass Lights (Shine through frosted panels like Apple VisionOS / Dribbble) */}
      <div className="ambient-glow-mesh">
        <div className="ambient-orb w-[650px] h-[650px] bg-gradient-to-tr from-indigo-600/40 via-purple-600/30 to-blue-500/20 -top-40 -left-40" />
        <div className="ambient-orb w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/35 via-teal-500/25 to-blue-600/20 top-1/4 -right-40" />
        <div className="ambient-orb w-[700px] h-[700px] bg-gradient-to-tr from-pink-600/25 via-purple-600/30 to-indigo-600/25 -bottom-40 left-1/3" />
        <div className="ambient-orb w-[500px] h-[500px] bg-gradient-to-r from-emerald-500/20 to-teal-500/15 top-2/3 -left-20" />
      </div>

      {/* Main Top Navigation Header */}
      <Navbar />

      {/* App Body with Left Icon Rail + Content */}
      <div className="flex-1 flex w-full relative z-10">
        {isAuthenticated && <SidebarRail />}

        <main className="flex-1 w-full overflow-y-auto">
          <Routes>
            {/* Public & Discovery Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/opportunities" element={<OpportunityDiscoveryPage />} />
            <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
            <Route path="/companies/:id" element={<CompanyDetailPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preferences"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <PreferencesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resumes"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <ResumePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <ApplicationTrackerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'PLACEMENT_ADMIN', 'PLATFORM_ADMIN']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'PLACEMENT_ADMIN', 'PLATFORM_ADMIN']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Placement Administrator Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT_ADMIN', 'PLATFORM_ADMIN']}>
                  <PlacementDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT_ADMIN', 'PLATFORM_ADMIN']}>
                  <CompanyManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/drives"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT_ADMIN', 'PLATFORM_ADMIN']}>
                  <DriveManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Platform Administrator Routes */}
            <Route
              path="/platform/moderation"
              element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                  <ModerationQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/institutions"
              element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                  <InstitutionManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/10 glass-panel py-5 text-center text-xs text-slate-500 dark:text-slate-400 relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 font-medium">
            <span className="font-extrabold text-slate-900 dark:text-white">PlaceWise</span>
            <span>—</span>
            <span>Multi-College Career & Placement Intelligence Platform</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Engineered with CPIE • Glassmorphism Design System • Light & Dark Mode
          </div>
        </div>
      </footer>
    </div>
  );
}
