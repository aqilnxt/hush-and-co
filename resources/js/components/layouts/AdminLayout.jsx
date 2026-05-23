import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminSearchModal from './AdminSearchModal';

export default function AdminLayout({
    sidebarItems,
    title,
    subtitle,
    headerActions,
    onSearch,
    searchPlaceholder = 'Cari di dashboard…',
    children,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate('/login', { replace: true });
    }, [logout, navigate]);

    const searchResults = useMemo(() => {
        if (!onSearch || !searchQuery.trim()) return [];
        return onSearch(searchQuery.trim());
    }, [onSearch, searchQuery]);

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

    return (
        <div className="min-h-screen bg-cream-100 text-navy-900">
            <AdminSidebar
                sidebarItems={sidebarItems}
                user={user}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
            />

            <div className="lg:pl-[280px] min-h-screen">
                <AdminHeader
                    title={title}
                    subtitle={subtitle}
                    headerActions={headerActions}
                    onOpenSearch={() => setSearchOpen(true)}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />

                <main className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>

            <AdminSearchModal
                isOpen={searchOpen}
                query={searchQuery}
                onQueryChange={setSearchQuery}
                results={searchResults}
                onClose={handleCloseSearch}
                onSelectResult={handleSelectResult}
                placeholder={searchPlaceholder}
                inputRef={inputRef}
            />
        </div>
    );
}
