import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SiswaManagement } from './pages/SiswaManagement';
import { AlumniManagement } from './pages/AlumniManagement';
import { PortofolioAlumniManagement } from './pages/PortofolioAlumniManagement';
import { Settings } from './pages/Settings';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const AppLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white" style={{ display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <main style={{ marginLeft: '220px', flex: 1, transition: 'margin-left 0.3s ease' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/siswa" element={<SiswaManagement />} />
                    <Route path="/alumni" element={<AlumniManagement />} />
                    <Route path="/portofolio-alumni" element={<PortofolioAlumniManagement />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
