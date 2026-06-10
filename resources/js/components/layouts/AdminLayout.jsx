import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    HomeIcon,
    ShoppingBagIcon,
    TableCellsIcon,
    UserGroupIcon,
    DocumentChartBarIcon,
    TagIcon,
    UserCircleIcon,
    PhotoIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from './AdminSidebar';
import AppHeader from '../common/AppHeader';
import AdminSearchModal from './AdminSearchModal';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [headerActions, setHeaderActions] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [readIds, setReadIds] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_read_notifications');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const inputRef = useRef(null);
    const prevIdsRef = useRef([]);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate('/login', { replace: true });
    }, [logout, navigate]);

    useEffect(() => {
        localStorage.setItem(
            'admin_read_notifications',
            JSON.stringify(readIds),
        );
    }, [readIds]);

    const fetchNotifications = async () => {
        try {
            const [ordersRes, menusRes] = await Promise.all([
                api.get('/staff/orders?status=pending'),
                api.get('/menus'),
            ]);

            const pendingOrders = ordersRes.data.data || [];
            const allMenus = menusRes.data.data || [];
            const list = [];

            pendingOrders.forEach((order) => {
                list.push({
                    id: `order-${order.id}`,
                    type: 'order',
                    title: 'Pesanan Baru ☕',
                    message: `Order #HSH-${String(order.id).padStart(4, '0')} (${
                        order.order_type === 'dine-in' ? 'Dine-in' : 'Takeaway'
                    }) senilai Rp ${order.total_price?.toLocaleString('id')}`,
                    time: new Date(order.created_at),
                    timeLabel: new Date(order.created_at).toLocaleDateString(
                        'id',
                        {
                            day: 'numeric',
                            month: 'short',
                        },
                    ),
                    link: '/admin',
                    read: readIds.includes(`order-${order.id}`),
                });
            });

            allMenus.forEach((menu) => {
                if (!menu.is_available) {
                    list.push({
                        id: `menu-${menu.id}`,
                        type: 'stock',
                        title: 'Stok Habis ⚠️',
                        message: `Menu "${menu.name}" ditandai sebagai tidak tersedia.`,
                        time: new Date(menu.updated_at || new Date()),
                        timeLabel: new Date(
                            menu.updated_at || new Date(),
                        ).toLocaleDateString('id', {
                            day: 'numeric',
                            month: 'short',
                        }),
                        link: '/admin/menus',
                        read: readIds.includes(`menu-${menu.id}`),
                    });
                }
            });

            list.sort((a, b) => b.time - a.time);
            setNotifications(list);
        } catch (err) {
            console.error('Gagal memuat data notifikasi', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 12000);
        return () => clearInterval(interval);
    }, [readIds]);

    useEffect(() => {
        const currentIds = notifications.map((n) => n.id);
        const newNotifications = notifications.filter(
            (n) =>
                !prevIdsRef.current.includes(n.id) && !readIds.includes(n.id),
        );

        if (prevIdsRef.current.length > 0 && newNotifications.length > 0) {
            newNotifications.forEach((n) => {
                toast(n.message, {
                    icon: n.type === 'order' ? '☕' : '⚠️',
                    duration: 5000,
                    style: {
                        borderRadius: '20px',
                        background: '#0F172A',
                        color: '#FDFBF7',
                        border: '1px solid #E2D4C9',
                    },
                });
            });
        }
        prevIdsRef.current = currentIds;
    }, [notifications, readIds]);

    const handleNotificationClick = (item) => {
        if (!readIds.includes(item.id)) {
            setReadIds((prev) => [...prev, item.id]);
        }
        setNotificationOpen(false);
        navigate(item.link);
    };

    const markAllRead = () => {
        const allIds = notifications.map((n) => n.id);
        setReadIds(allIds);
    };

    const notificationCount = notifications.filter(
        (n) => !readIds.includes(n.id),
    ).length;

    const toggleNotification = () => {
        setNotificationOpen((prev) => !prev);
    };

    const closeNotification = () => {
        setNotificationOpen(false);
    };

    const searchItems = useMemo(
        () => [
            {
                title: 'Dashboard',
                subtitle: 'Ringkasan performa',
                path: '/admin',
                icon: HomeIcon,
            },
            {
                title: 'Kelola Menu',
                subtitle: 'Tambah atau edit menu',
                path: '/admin/menus',
                icon: ShoppingBagIcon,
            },
            {
                title: 'Meja & QR',
                subtitle: 'Atur meja dan QR code',
                path: '/admin/tables',
                icon: TableCellsIcon,
            },
            {
                title: 'Kategori',
                subtitle: 'Atur kategori menu',
                path: '/admin/categories',
                icon: TagIcon,
            },
            {
                title: 'User & Staff',
                subtitle: 'Daftar akun customer dan staff',
                path: '/admin/users',
                icon: UserGroupIcon,
            },
            {
                title: 'Laporan',
                subtitle: 'Pantau performa bisnis',
                path: '/admin/reports',
                icon: DocumentChartBarIcon,
            },
        ],
        [],
    );

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) {
            return [];
        }

        const query = searchQuery.toLowerCase();
        return searchItems
            .filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.subtitle.toLowerCase().includes(query),
            )
            .slice(0, 8);
    }, [searchItems, searchQuery]);

    const handleCloseSearch = useCallback(() => {
        setSearchOpen(false);
        setSearchQuery('');
    }, []);

    const handleSelectResult = useCallback(
        (item) => {
            handleCloseSearch();
            if (item.onClick) {
                item.onClick();
                return;
            }
            if (item.path) {
                navigate(item.path);
            }
        },
        [handleCloseSearch, navigate],
    );

    useEffect(() => {
        const listener = (event) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                setSearchOpen(true);
                setTimeout(() => inputRef.current?.focus(), 120);
                return;
            }
            if (event.key === 'Escape' && searchOpen) {
                handleCloseSearch();
            }
        };

        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, [searchOpen, handleCloseSearch]);

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
            path: '/admin/categories',
            label: 'Kategori',
            icon: TagIcon,
            active: location.pathname === '/admin/categories',
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
        {
            path: '/admin/gallery',
            label: 'Galeri',
            icon: PhotoIcon,
            active: location.pathname === '/admin/gallery',
        },
        {
            path: '/admin/site-settings',
            label: 'Pengaturan Situs',
            icon: Cog6ToothIcon,
            active: location.pathname === '/admin/site-settings',
        },
        {
            path: '/admin/profile',
            label: 'Profil',
            icon: UserCircleIcon,
            active: location.pathname === '/admin/profile',
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
        '/admin/categories': {
            title: 'Kelola Kategori',
            subtitle: 'Atur kategori menu',
        },
        '/admin/users': {
            title: 'User & Staff',
            subtitle: 'Kelola akun customer dan staff',
        },
        '/admin/reports': {
            title: 'Laporan',
            subtitle: 'Pantau performa bisnis dan laporan',
        },
        '/admin/toppings': {
            title: 'Topping Manager',
            subtitle: 'Kelola daftar topping dan harga global',
        },
        '/admin/gallery': {
            title: 'Kelola Galeri',
            subtitle: 'Atur foto suasana kafe di landing page',
        },
        '/admin/site-settings': {
            title: 'Pengaturan Situs',
            subtitle: 'Kelola gambar landing page dan auth page.',
        },
        '/admin/profile': {
            title: 'Profil',
            subtitle: 'Lihat detail akun dan informasi profil.',
        },
    };

    const { title, subtitle } =
        routeMeta[location.pathname] || routeMeta['/admin'];

    return (
        <AdminHeaderActionContext.Provider value={setHeaderActions}>
            <div className="min-h-screen bg-cream-100 text-navy-900">
                <AdminSidebar
                    sidebarItems={navItems}
                    user={user}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onLogout={handleLogout}
                />

                <div className="lg:pl-[280px] min-h-screen">
                    <AppHeader
                        title={title}
                        subtitle={subtitle}
                        headerActions={headerActions}
                        showSearch
                        onOpenSearch={() => setSearchOpen(true)}
                        onOpenSidebar={() => setSidebarOpen(true)}
                        notifications={notifications}
                        notificationOpen={notificationOpen}
                        onToggleNotifications={toggleNotification}
                        onCloseNotifications={closeNotification}
                        onSelectNotification={handleNotificationClick}
                        onMarkAllRead={markAllRead}
                        unreadCount={notificationCount}
                    />

                    <main className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
                        <Outlet />
                    </main>
                </div>

                <AdminSearchModal
                    isOpen={searchOpen}
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                    results={searchResults}
                    onClose={handleCloseSearch}
                    onSelectResult={handleSelectResult}
                    placeholder="Cari di dashboard…"
                    inputRef={inputRef}
                />
            </div>
        </AdminHeaderActionContext.Provider>
    );
}

export const AdminHeaderActionContext = createContext(() => {});
