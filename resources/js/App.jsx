import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import MenuManager from './pages/admin/MenuManager';
import TableManager from './pages/admin/TableManager';
import UserManager from './pages/admin/UserManager';
import Reports from './pages/admin/Reports';

// Protected Route
function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();

    if (loading)
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    if (!user) return <Navigate to="/login" replace />;

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer */}
            <Route
                path="/"
                element={
                    <ProtectedRoute roles={['customer']}>
                        <Menu />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cart"
                element={
                    <ProtectedRoute roles={['customer']}>
                        <Cart />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/checkout"
                element={
                    <ProtectedRoute roles={['customer']}>
                        <Checkout />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <ProtectedRoute roles={['customer']}>
                        <Orders />
                    </ProtectedRoute>
                }
            />

            {/* Staff */}
            <Route
                path="/staff"
                element={
                    <ProtectedRoute roles={['staff']}>
                        <StaffDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Admin */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/menus"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <MenuManager />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/tables"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <TableManager />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <UserManager />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <Reports />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: '#1B2A4A',
                            color: '#F5EFE0',
                            fontSize: '13px',
                        },
                    }}
                />
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
