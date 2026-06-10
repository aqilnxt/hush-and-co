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
import PublicLayout from './components/layouts/PublicLayout';
import AuthLayout from './components/layouts/AuthLayout';
import CustomerLayout from './components/layouts/CustomerLayout';
import StaffLayout from './components/layouts/StaffLayout';
import AdminLayout from './components/layouts/AdminLayout';

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
import OAuthCallback from './pages/auth/OAuthCallback';
import SupabaseOAuthCallback from './pages/auth/SupabaseOAuthCallback';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import MenuManager from './pages/admin/MenuManager';
import ToppingManager from './pages/admin/ToppingManager';
import CategoryManager from './pages/admin/CategoryManager';
import TableManager from './pages/admin/TableManager';
import UserManager from './pages/admin/UserManager';
import Reports from './pages/admin/Reports';
import AdminGallery from './pages/admin/Gallery';
import SiteSettings from './pages/admin/SiteSettings';
import DashboardLayout from './layouts/DashboardLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Icons for navigation
import {
    HomeIcon,
    ShoppingBagIcon,
    TableCellsIcon,
    UserGroupIcon,
    DocumentChartBarIcon,
    QueueListIcon,
    TagIcon,
} from '@heroicons/react/24/outline';

// Protected Route
function homeRouteForRole(role) {
    if (role === 'admin') return '/admin';
    if (role === 'staff') return '/staff';
    return '/menu';
}

function ProtectedRoute({ children, roles, loginPath = '/login' }) {
    const { user, loading } = useAuth();

    if (loading)
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    if (!user) return <Navigate to={loginPath} replace />;

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
                navigate('/cart', { replace: true });
            })
            .catch(() => {
                // Table not found – still go to cart so user can pick manually
                localStorage.setItem(
                    'orderInfo',
                    JSON.stringify({
                        orderType: 'dine-in',
                        tableId: null,
                        tableNumber: null,
                        pickupName: null,
                    }),
                );
                navigate('/cart', { replace: true });
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
            path: '/admin/toppings',
            label: 'Toppings',
            icon: TagIcon,
            active: location.pathname === '/admin/toppings',
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

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<Landing />} />
                <Route path="order" element={<QrOrderRedirect />} />
            </Route>

            <Route path="/" element={<AuthLayout />}>
                <Route path="login" element={<Login variant="customer" />} />
                <Route path="staff/login" element={<Login variant="staff" />} />
                <Route path="admin/login" element={<Login variant="admin" />} />
                <Route path="register" element={<Register />} />
                <Route path="oauth-success" element={<OAuthCallback />} />
                <Route
                    path="supabase-oauth-callback"
                    element={<SupabaseOAuthCallback />}
                />
            </Route>

            <Route path="/" element={<CustomerLayout />}>
                <Route path="menu" element={<Menu />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="orders">
                    <Route
                        index
                        element={
                            <ProtectedRoute roles={['customer']}>
                                <Orders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path=":id"
                        element={
                            <ProtectedRoute roles={['customer']}>
                                <OrderDetail />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Route>

            <Route
                path="/staff"
                element={
                    <ProtectedRoute roles={['staff']}>
                        <StaffLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<StaffDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            <Route
                path="/admin"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="menus" element={<MenuManager />} />
                <Route path="toppings" element={<ToppingManager />} />
                <Route path="categories" element={<CategoryManager />} />
                <Route path="tables" element={<TableManager />} />
                <Route path="users" element={<UserManager />} />
                <Route path="reports" element={<Reports />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="site-settings" element={<SiteSettings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
            </Route>

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
