import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const roleLabels = {
    admin: 'Admin',
    staff: 'Staff',
    customer: 'Customer',
};

export default function LandingProfileDropdown({
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

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const roleLabel = roleLabels[role] || 'User';
    const firstName = name?.split(' ')[0] || 'User';
    const initial = firstName.charAt(0).toUpperCase();

    return (
        <div ref={ref} className="relative inline-block w-full">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex items-center justify-between gap-3 rounded-full border border-cream-300/70 bg-white py-1 pl-1 pr-2.5 shadow-sm transition-shadow duration-200 hover:shadow-md focus:outline-none"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-cream-200 font-playfair text-[11px] font-semibold overflow-hidden">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={name || 'Avatar'}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span>{initial}</span>
                        )}
                    </div>
                    <div className="min-w-0 leading-none">
                        <p className="text-[12px] font-semibold text-navy-900 truncate">
                            {firstName}
                        </p>
                        <p className="text-[10px] text-navy-400 truncate">
                            {roleLabel}
                        </p>
                    </div>
                </div>

                <ChevronDownIcon
                    className={`h-3 w-3 text-navy-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 overflow-hidden rounded-2xl border border-cream-300/60 bg-white shadow-[0_8px_24px_rgba(14,26,46,0.1),0_2px_8px_rgba(14,26,46,0.06)]"
                    >
                        <div className="px-4 py-4 border-b border-cream-200">
                            <p className="text-[13px] font-semibold text-navy-900 truncate">
                                {name || 'User'}
                            </p>
                            <p className="mt-1 text-[11px] text-navy-400 truncate">
                                {email || '—'}
                            </p>
                        </div>
                        <div className="space-y-1 px-2 py-2">
                            {menuItems.map((item, idx) => {
                                const Icon = item.icon;
                                const isLogout =
                                    item.label.toLowerCase() === 'logout';
                                return (
                                    <button
                                        key={`${item.label}-${idx}`}
                                        type="button"
                                        onClick={() => {
                                            setOpen(false);
                                            item.onClick?.();
                                        }}
                                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition ${
                                            isLogout
                                                ? 'border-t border-cream-200 text-red-500 hover:bg-red-50'
                                                : 'text-navy-700 hover:bg-cream-100'
                                        }`}
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
