import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeftOnRectangleIcon,
    SparklesIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

function renderIcon(icon) {
    if (!icon) return null;
    if (typeof icon === 'string') return <span>{icon}</span>;
    const IconComponent = icon;
    return <IconComponent className="w-5 h-5" />;
}

function AdminSidebar({ sidebarItems, user, isOpen, onClose, onLogout }) {
    return (
        <aside
            className={`flex flex-col w-[280px] shrink-0 h-screen fixed inset-y-0 left-0 z-50 bg-white border-r border-cream-300 transform transition-transform duration-300 overflow-y-auto shadow-xl lg:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        >
            <div className="flex items-center justify-between border-b border-cream-300 h-[90px] px-5 gap-3 shrink-0">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-navy-800 rounded-xl flex items-center justify-center shadow-sm">
                        <SparklesIcon className="w-6 h-6 text-cream-200" />
                    </div>
                    <h1 className="font-playfair font-bold text-xl text-navy-900 tracking-tight">
                        Hush <span className="text-cream-600">&</span> Co.
                    </h1>
                </Link>
                <button
                    onClick={onClose}
                    className="lg:hidden w-11 h-11 bg-white rounded-xl p-[10px] flex items-center justify-center ring-1 ring-cream-300 hover:ring-navy-800 transition-all duration-300"
                    aria-label="Close sidebar"
                >
                    <XMarkIcon className="w-6 h-6 text-navy-400" />
                </button>
            </div>

            <div className="flex flex-col p-5 gap-6 overflow-y-auto flex-1">
                <div className="flex flex-col gap-4">
                    <h3 className="font-medium text-xs text-navy-400 uppercase tracking-wider px-2">
                        Main Menu
                    </h3>
                    <div className="flex flex-col gap-1">
                        {sidebarItems.map((item) => {
                            const isActive = item.active ?? false;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="group"
                                >
                                    <div
                                        className={`flex items-center rounded-2xl p-4 gap-3 transition-all duration-300 ${
                                            isActive
                                                ? 'bg-cream-200'
                                                : 'bg-white hover:bg-cream-200'
                                        }`}
                                    >
                                        <span
                                            className={`transition-all ${
                                                isActive
                                                    ? 'text-navy-800'
                                                    : 'text-navy-400 group-hover:text-navy-900'
                                            }`}
                                        >
                                            {renderIcon(item.icon)}
                                        </span>
                                        <span
                                            className={`font-medium transition-all ${
                                                isActive
                                                    ? 'font-bold text-navy-900'
                                                    : 'text-navy-400 group-hover:text-navy-900'
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-cream-300 bg-white shrink-0">
                <div className="flex items-center justify-between p-3 rounded-2xl ring-1 ring-cream-300 hover:ring-red-400/50 hover:bg-red-50/50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-cream-200 font-bold text-sm shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-navy-900 truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs font-medium text-navy-400 truncate">
                                {user?.role || 'Admin'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-xl bg-white flex items-center justify-center hover:bg-red-50 transition-colors"
                        title="Logout"
                    >
                        <ArrowLeftOnRectangleIcon className="w-4 h-4 text-navy-400 hover:text-red-500 transition-colors" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default React.memo(AdminSidebar);
