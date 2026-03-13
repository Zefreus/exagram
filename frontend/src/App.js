import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConsentPage from './pages/ConsentPage';
import DashboardPage from './pages/DashboardPage';
import ExamResultPage from './pages/ExamResultPage';
import SpecialistsPage from './pages/SpecialistsPage';
import TermosPage from './pages/TermosPage';
import PrivacidadePage from './pages/PrivacidadePage';
import SettingsPage from './pages/SettingsPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Protected Route Component
const ProtectedRoute = ({ children, requireConsent = true }) => {
    const { user, loading, isAuthenticated } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center">
                <div className="animate-pulse-soft text-[#1D9E75]">
                    <svg className="w-12 h-12 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                </div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (requireConsent && !user?.consent_granted) {
        return <Navigate to="/consent" replace />;
    }
    
    return children;
};

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
    const { admin, adminToken } = useAuth();
    
    if (!adminToken || !admin) {
        return <Navigate to="/admin/login" replace />;
    }
    
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/termos" element={<TermosPage />} />
            <Route path="/privacidade" element={<PrivacidadePage />} />
            <Route path="/especialistas" element={<SpecialistsPage />} />
            
            {/* Consent (requires auth but not consent) */}
            <Route path="/consent" element={
                <ProtectedRoute requireConsent={false}>
                    <ConsentPage />
                </ProtectedRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
            } />
            <Route path="/exam/:examId" element={
                <ProtectedRoute>
                    <ExamResultPage />
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute>
                    <SettingsPage />
                </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/*" element={
                <AdminProtectedRoute>
                    <AdminDashboardPage />
                </AdminProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
                <Toaster position="top-right" richColors />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
