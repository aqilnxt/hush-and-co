import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bars3Icon,
    XCircleIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from '../components/common/ProfileDropdown';
import AppHeader from '../components/common/AppHeader';

export default function DashboardLayout({
    title = 'Dashboard',
    subtitle = '',
    navItems = [],
    searchItems = [],
    headerActions = null,
    showSearch = true,
    showTime = true,
    logoPath = '/',
}) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [time, setTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const searchInputRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    // Determine profile path based on current location
    const isStaffPath = location.pathname.startsWith('/staff');
    const profilePath = isStaffPath ? '/staff/profile' : '/profile';
    const settingsPath = isStaffPath ? '/staff/settings' : '/settings';

    // Clock updates
    useEffect(() => {
        const clock = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(clock);
    }, []);

    // Close sidebar on mobile when navigating
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Ctrl+K to focus search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setSearchQuery('');
                searchInputRef.current?.blur();
                setSearchResults([]);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query || searchItems.length === 0) {
            setSearchResults([]);
            return;
        }
        const results = searchItems
            .filter((item) =>
                item.title.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 6);
        setSearchResults(results);
    };

    const handleSearchSelect = (item) => {
        if (item.path) {
            navigate(item.path);
            setSearchQuery('');
            setSearchResults([]);
            setSidebarOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream-100 flex">
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ========== SIDEBAR ========== */}
            <aside
                className={`flex flex-col w-[280px] shrink-0 h-screen fixed inset-y-0 left-0 z-50 bg-white border-r border-cream-300 transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between border-b border-cream-300 h-[90px] px-5 gap-3 shrink-0">
                    <button
                        onClick={() => navigate(logoPath)}
                        className="flex items-center gap-3 hover:opacity-80 transition"
                    >
                        <div className="w-11 h-11 bg-navy-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm bg-white">
                                    <img
                                        src="/images/hush-co-logo.png"
                                        alt="Hush & Co"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement.innerHTML =
                                                '<span class="w-full h-full flex items-center justify-center font-playfair text-cream-100">H</span>';
                                        }}
                                    />
                                </div>
                        </div>
                        <h1 className="font-playfair font-bold text-xl text-navy-900 tracking-tight">
                            Hush <span className="text-cream-600">&</span> Co.
                        </h1>
                    </button>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden size-11 flex shrink-0 bg-white rounded-xl p-[10px] items-center justify-center ring-1 ring-cream-300 hover:ring-navy-800 transition-all"
                    >
                        <XCircleIcon className="size-6 text-navy-400" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.active;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setSidebarOpen(false);
                                    }}
                                    className={`flex items-center rounded-2xl p-4 gap-3 transition-all ${
                                        isActive
                                            ? 'bg-cream-200 text-navy-800'
                                            : 'bg-white hover:bg-cream-200 text-navy-400 hover:text-navy-800'
                                    }`}
                                >
                                    <Icon className="size-6" />
                                    <span className="font-medium">
                                        {item.label}
                                    </span>
                                    {item.badge && (
                                        <span className="ml-auto px-2.5 py-0.5 rounded-full bg-navy-800 text-cream-100 text-xs font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {user && (
                    <div className="p-5 border-t border-cream-300 bg-white shrink-0">
                        <ProfileDropdown
                            name={user.name}
                            email={user.email}
                            role={user.role}
                            avatar={user.avatar}
                            menuItems={[
                                {
                                    label: 'Profile',
                                    icon: UserCircleIcon,
                                    onClick: () => navigate(profilePath),
                                },
                                {
                                    label: 'Settings',
                                    icon: Cog6ToothIcon,
                                    onClick: () => navigate(settingsPath),
                                },
                                {
                                    label: 'Logout',
                                    icon: ArrowRightOnRectangleIcon,
                                    onClick: handleLogout,
                                },
                            ]}
                        />
                    </div>
                )}
            </aside>

            {/* ========== MAIN CONTENT ========== */}
            <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen w-full">
                {/* Header */}
                <AppHeader
                    title={title}
                    subtitle={subtitle}
                    onOpenSidebar={() => setSidebarOpen(true)}
                    showSearch={showSearch}
                    onOpenSearch={() => searchInputRef.current?.focus()}
                    searchQuery={searchQuery}
                    searchResults={searchResults}
                    onSearchSelect={handleSearchSelect}
                    headerActions={headerActions}
                    showTime={showTime}
                    timeText={time.toLocaleString('id', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                />

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet context={{ searchInputRef }} />
                </div>
            </main>
        </div>
    );
}
