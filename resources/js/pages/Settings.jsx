import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Cog6ToothIcon,
    ShieldCheckIcon,
    BellAlertIcon,
} from '@heroicons/react/24/outline';

const ROLE_LABELS = {
    admin: 'Admin',
    staff: 'Staff',
    customer: 'Customer',
};

export default function Settings() {
    const { user } = useAuth();
    const roleLabel = ROLE_LABELS[user?.role] || 'User';

    return (
        <div className="space-y-8">
            <div className="rounded-4xl border border-cream-300 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3">
                    <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-navy-400">
                            Pengaturan akun
                        </p>
                        <h1 className="mt-3 text-2xl font-semibold text-navy-900">
                            Settings
                        </h1>
                        <p className="mt-2 text-sm text-navy-500">
                            Kelola preferensi, keamanan, dan notifikasi akunmu.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-3xl border border-cream-300 bg-cream-50 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-navy-400">
                                Role
                            </p>
                            <p className="mt-2 text-sm font-semibold text-navy-900">
                                {roleLabel}
                            </p>
                        </div>
                        <div className="rounded-3xl border border-cream-300 bg-cream-50 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-navy-400">
                                Email
                            </p>
                            <p className="mt-2 text-sm font-semibold text-navy-900 truncate">
                                {user?.email || '—'}
                            </p>
                        </div>
                        <div className="rounded-3xl border border-cream-300 bg-cream-50 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-navy-400">
                                Provider
                            </p>
                            <p className="mt-2 text-sm font-semibold text-navy-900">
                                {user?.provider || 'local'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-4xl border border-cream-300 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 text-navy-900 mb-4">
                        <Cog6ToothIcon className="w-5 h-5 text-navy-500" />
                        <p className="text-sm font-semibold">Account</p>
                    </div>
                    <div className="space-y-3 text-sm text-navy-600">
                        <p>Ubah nama, email, dan avatar profil.</p>
                        <p>Aktifkan atau nonaktifkan preferensi email.</p>
                    </div>
                </div>

                <div className="rounded-4xl border border-cream-300 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 text-navy-900 mb-4">
                        <ShieldCheckIcon className="w-5 h-5 text-navy-500" />
                        <p className="text-sm font-semibold">Security</p>
                    </div>
                    <div className="space-y-3 text-sm text-navy-600">
                        <p>Ubah password akunmu secara aman.</p>
                        <p>Kelola sesi dan akses saat ini.</p>
                    </div>
                </div>

                <div className="rounded-4xl border border-cream-300 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 text-navy-900 mb-4">
                        <BellAlertIcon className="w-5 h-5 text-navy-500" />
                        <p className="text-sm font-semibold">Notifications</p>
                    </div>
                    <div className="space-y-3 text-sm text-navy-600">
                        <p>Atur notifikasi email dan aplikasi.</p>
                        <p>Aktifkan notifikasi pesanan terbaru.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
