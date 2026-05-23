import React from 'react';
import {
    MagnifyingGlassIcon,
    BellIcon,
    PlusIcon,
    Bars3Icon,
} from '@heroicons/react/24/outline';

export default function AdminHeader({
    title,
    subtitle,
    headerActions,
    onOpenSearch,
    onOpenSidebar,
}) {
    return (
        <header className="bg-cream-50 border-b border-cream-200 px-5 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenSidebar}
                    className="lg:hidden w-11 h-11 rounded-2xl bg-white border border-cream-200 text-navy-700 flex items-center justify-center transition hover:border-navy-300"
                    aria-label="Open sidebar"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <div>
                    <p className="text-xs text-navy-500 uppercase tracking-[.22em] font-medium">
                        {subtitle}
                    </p>
                    <h2 className="text-lg sm:text-xl font-semibold text-navy-900">
                        {title}
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenSearch}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cream-200 bg-white px-4 py-3 text-sm font-medium text-navy-700 hover:border-navy-300 transition"
                >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    Cari
                </button>
                {headerActions}
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-2xl border border-cream-200 bg-white px-4 py-3 text-sm font-medium text-navy-700 hover:border-navy-300 transition"
                >
                    <BellIcon className="w-5 h-5" />
                    Notifikasi
                </button>
            </div>
        </header>
    );
}
