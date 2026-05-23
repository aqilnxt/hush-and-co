import React, { useEffect } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useSearchParams,
    useNavigate,
    useLocation,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './api/axios';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Landing Page
import Landing from './pages/Landing';

// Customer Pages
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import MenuManager from './pages/admin/MenuManager';
import TableManager from './pages/admin/TableManager';
import UserManager from './pages/admin/UserManager';
import Reports from './pages/admin/Reports';

// Icons for navigation
import {
    HomeIcon,
    ShoppingBagIcon,
    TableCellsIcon,
    UserGroupIcon,
    DocumentChartBarIcon,
    QueueListIcon,
} from '@heroicons/react/24/outline';

// Protected Route
function homeRouteForRole(role) {
    if (role === 'admin') return '/admin';
    if (role === 'staff') return '/staff';
    return '/menu';
}

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
        return <Navigate to={homeRouteForRole(user.role)} replace />;
    }

    return children;
}

function QrOrderRedirect() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const tableParam = searchParams.get('table');
        if (!tableParam) {
            navigate('/', { replace: true });
            return;
        }

        // Resolve table_number to db id via API
        api.get(`/tables/number/${tableParam}`)
            .then((res) => {
                const table = res.data.data;
                const savedOrderInfo = JSON.parse(
                    localStorage.getItem('orderInfo') || '{}',
                );
                const orderInfo = {
                    ...savedOrderInfo,
                    orderType: 'dine-in',
                    tableId: String(table.id),
                    tableNumber: table.table_number,
                    pickupName: null,
                };
                localStorage.setItem('orderInfo', JSON.stringify(orderInfo));
                localStorage.setItem('nextRoute', '/cart');
                if (user) {
                    navigate('/cart', { replace: true });
                } else {
                    navigate('/login', { replace: true });
                }
            })
            .catch(() => {
                // Table not found – still go to cart so user can pick manually
                localStorage.setItem('nextRoute', '/cart');
                if (user) {
                    navigate('/cart', { replace: true });
                } else {
                    navigate('/login', { replace: true });
                }
            });
    }, [searchParams, user, navigate]);

    return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center">
            <div className="text-navy-800 text-sm">Memproses QR Code...</div>
        </div>
    );
}

// Admin Dashboard Layout Wrapper
function AdminDashboardLayout() {
    const location = useLocation();
    const navItems = [
        {
            path: '/admin',
            label: 'Dashboard',
            icon: HomeIcon,
            active: location.pathname === '/admin',
        },
        {
            path: '/admin/menus',
            label: 'Kelola Menu',
            icon: ShoppingBagIcon,
            active: location.pathname === '/admin/menus',
        },
        {
            path: '/admin/tables',
            label: 'Meja & QR',
            icon: TableCellsIcon,
            active: location.pathname === '/admin/tables',
        },
        {
            path: '/admin/users',
            label: 'User & Staff',
            icon: UserGroupIcon,
            active: location.pathname === '/admin/users',
        },
        {
            path: '/admin/reports',
            label: 'Laporan',
            icon: DocumentChartBarIcon,
            active: location.pathname === '/admin/reports',
        },
    ];

    const routeMeta = {
        '/admin': {
            title: 'Dashboard',
            subtitle: 'Selamat datang, Admin 👋',
        },
        '/admin/menus': {
            title: 'Kelola Menu',
            subtitle: 'Tambahkan dan atur item menu',
        },
        '/admin/tables': {
            title: 'Meja & QR Code',
            subtitle: 'Kelola meja dan QR menu',
        },
        '/admin/users': {
            title: 'User & Staff',
            subtitle: 'Kelola akun customer dan staff',
        },
        '/admin/reports': {
            title: 'Laporan',
            subtitle: 'Pantau performa bisnis dan laporan',
        },
    };

    const { title, subtitle } =
        routeMeta[location.pathname] || routeMeta['/admin'];

    return (
        <DashboardLayout
            title={title}
            subtitle={subtitle}
            navItems={navItems}
            searchItems={[]}
            showSearch={true}
            showTime={true}
        />
    );
}

// Staff Dashboard Layout Wrapper
function StaffDashboardLayout() {
    const location = useLocation();
    const navItems = [
        {
            path: '/staff',
            label: 'Order Queue',
            icon: QueueListIcon,
            active: location.pathname === '/staff',
        },
    ];

    const routeMeta = {
        '/staff': {
            title: 'Live Order Dashboard',
            subtitle: 'Kelola order masuk secara realtime',
        },
    };

    const { title, subtitle } =
        routeMeta[location.pathname] || routeMeta['/staff'];

    return (
        <DashboardLayout
            title={title}
            subtitle={subtitle}
            navItems={navItems}
            searchItems={[]}
            showSearch={true}
            showTime={true}
        />
    );
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/order" element={<QrOrderRedirect />} />
            <Route path="/" element={<Landing />} />

            {/* Customer */}
            <Route
                path="/menu"
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
            <Route
                path="/orders/:id"
                element={
                    <ProtectedRoute roles={['customer']}>
                        <OrderDetail />
                    </ProtectedRoute>
                }
            />

            {/* Staff Dashboard */}
            <Route
                path="/staff"
                element={
                    <ProtectedRoute roles={['staff']}>
                        <StaffDashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<StaffDashboard />} />
            </Route>

            {/* Admin Dashboard */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <AdminDashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="menus" element={<MenuManager />} />
                <Route path="tables" element={<TableManager />} />
                <Route path="users" element={<UserManager />} />
                <Route path="reports" element={<Reports />} />
            </Route>

            {/* Fallback */}
            <Route
                path="*"
                element={
                    <Navigate
                        to={user ? homeRouteForRole(user.role) : '/'}
                        replace
                    />
                }
            />
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
