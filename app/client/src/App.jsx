import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { AuthProvider } from './contexts/AuthContext';
import ManagerFlow from './flows/ManagerFlow';
import AdminPage from './components/AdminPage';
import Dashboard from './components/Dashboard';
import JoinCohortPage from './components/auth/JoinCohortPage';
import LoginScreen from './components/auth/LoginScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';

/**
 * App — VidyaSpark routes:
 *   /            → Landing page (WelcomeScreen)
 *   /login       → Login screen
 *   /join/:code  → Cohort join page
 *   /dashboard   → Ignator dashboard (module library)
 *   /tapovan/:moduleId → Full Tapovan session flow
 *   /admin       → Admin portal
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <Routes>
            <Route path="/join/:code" element={<JoinCohortPage />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/tapovan/:moduleId" element={
              <ProtectedRoute><ManagerFlow /></ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute admin><AdminPage /></ProtectedRoute>
            } />
            <Route path="/instructor" element={<Navigate to="/admin" replace />} />
            <Route path="/*" element={<ManagerFlow />} />
          </Routes>
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
