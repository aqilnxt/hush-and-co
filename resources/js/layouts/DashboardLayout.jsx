import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDownIcon,
    Bars3Icon,
    XCircleIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({
    title = 'Dashboard',
    subtitle = '',
    navItems = [],
    searchItems = [],
    headerActions = null,
    showSearch = true,
    showTime = true,
}) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [time, setTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const profileRef = useRef(null);
    const searchInputRef = useRef(null);

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

    // Click outside profile dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
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
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 hover:opacity-80 transition"
                    >
                        <div className="w-11 h-11 bg-navy-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                            <SparklesIcon className="w-6 h-6 text-cream-100" />
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

                {/* Profile + Logout */}
                <div
                    className="p-5 border-t border-cream-300 bg-white shrink-0 relative"
                    ref={profileRef}
                >
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl ring-1 ring-cream-300 hover:ring-navy-400 transition-all"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-full bg-navy-800 text-cream-100 flex items-center justify-center font-bold text-sm">
                                {user?.name?.charAt(0)?.toUpperCase() || (
                                    <UserCircleIcon className="w-6 h-6" />
                                )}
                            </div>
                            <div className="min-w-0 text-left">
                                <p className="text-sm font-bold text-navy-900 truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs font-medium text-navy-400 truncate">
                                    {user?.role === 'admin'
                                        ? 'Admin'
                                        : user?.role === 'staff'
                                          ? 'Staff'
                                          : 'Customer'}
                                </p>
                            </div>
                        </div>
                        <ChevronDownIcon
                            className={`w-5 h-5 text-navy-400 transition ${profileOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {profileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl bg-white border border-cream-300 shadow-xl overflow-hidden z-50"
                            >
                                <div className="p-4 border-b border-cream-200">
                                    <p className="text-xs text-navy-400">
                                        Signed in as
                                    </p>
                                    <p className="text-sm mt-1 text-navy-900">
                                        {user?.email}
                                    </p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-cream-100 text-sm text-navy-600"
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </aside>

            {/* ========== MAIN CONTENT ========== */}
            <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen w-full">
                {/* Header */}
                <header className="flex items-center justify-between w-full h-[90px] shrink-0 border-b border-cream-300 bg-white px-5 md:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden size-11 flex items-center justify-center rounded-xl ring-1 ring-cream-300 hover:ring-navy-800 transition-all"
                        >
                            <Bars3Icon className="size-6 text-navy-900" />
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="font-playfair font-bold text-2xl text-navy-900">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-sm text-navy-400 font-medium">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {showSearch && (
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() =>
                                        searchInputRef.current?.focus()
                                    }
                                    className="size-11 flex items-center justify-center rounded-xl ring-1 ring-cream-300 hover:ring-navy-800 transition-all cursor-pointer bg-cream-100/50"
                                    title="Search (Ctrl+K)"
                                >
                                    <MagnifyingGlassIcon className="size-5 text-navy-900" />
                                </button>

                                {/* Search Dropdown */}
                                <AnimatePresence>
                                    {searchQuery &&
                                        searchResults.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-white border border-cream-300 shadow-lg overflow-hidden z-50"
                                            >
                                                <div className="p-3 border-b border-cream-200 text-xs text-navy-400">
                                                    Search Results
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {searchResults.map(
                                                        (result, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() =>
                                                                    handleSearchSelect(
                                                                        result,
                                                                    )
                                                                }
                                                                className="w-full px-4 py-3 hover:bg-cream-50 text-left border-b border-cream-100 last:border-b-0 transition"
                                                            >
                                                                <p className="text-sm font-medium text-navy-900">
                                                                    {
                                                                        result.title
                                                                    }
                                                                </p>
                                                                {result.subtitle && (
                                                                    <p className="text-xs text-navy-400 mt-1">
                                                                        {
                                                                            result.subtitle
                                                                        }
                                                                    </p>
                                                                )}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="hidden sm:flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Online
                        </div>

                        {showTime && (
                            <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-100 border border-cream-300 text-xs text-navy-400">
                                {time.toLocaleString('id', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        )}

                        {headerActions}
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet context={{ searchInputRef }} />
                </div>
            </main>
        </div>
    );
}
