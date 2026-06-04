import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const roleLabels = {
    admin: 'Admin',
    staff: 'Staff',
    customer: 'Customer',
    guest: 'Tamu',
};

export default function ProfileDropdown({
    name,
    email,
    role,
    avatar,
    menuItems = [],
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const roleLabel = roleLabels[role] || role || 'User';

    return (
        <div ref={ref} className="relative inline-block w-full">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="w-full flex items-center justify-between gap-3 rounded-3xl border border-cream-300 bg-white px-4 py-3 shadow-sm transition hover:border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-100"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-cream-100 text-sm font-semibold overflow-hidden">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={name || 'Avatar'}
                                className="h-full w-full object-cover"
                            />
                        ) : name ? (
                            <span>{name.charAt(0).toUpperCase()}</span>
                        ) : (
                            <UserCircleIcon className="w-5 h-5" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy-900 truncate">
                            {name || 'User'}
                        </p>
                        <p className="text-xs text-navy-400 truncate">
                            {roleLabel}
                        </p>
                    </div>
                </div>

                <ChevronDownIcon
                    className={`w-5 h-5 text-navy-400 transition ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 bottom-full z-50 mb-3 w-full min-w-[240px] overflow-hidden rounded-3xl border border-cream-300 bg-white shadow-xl ring-1 ring-black/5"
                    >
                        <div className="px-4 py-4 border-b border-cream-200">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-navy-400">
                                Signed in as
                            </p>
                            <p className="mt-2 text-sm font-medium text-navy-900 truncate">
                                {email || '—'}
                            </p>
                        </div>
                        <div className="space-y-1 px-2 py-2">
                            {menuItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={`${item.label}-${idx}`}
                                        type="button"
                                        onClick={() => {
                                            setOpen(false);
                                            item.onClick?.();
                                        }}
                                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-navy-700 transition hover:bg-cream-50"
                                    >
                                        {Icon && (
                                            <Icon className="w-4 h-4 text-navy-400" />
                                        )}
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
