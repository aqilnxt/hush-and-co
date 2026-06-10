import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    UserCircleIcon,
    EnvelopeIcon,
    SparklesIcon,
    ClockIcon,
    ShieldCheckIcon,
    CheckIcon,
    XMarkIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';

const ROLE_LABELS = {
    admin: 'Admin',
    staff: 'Staff',
    customer: 'Customer',
};

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return date.toLocaleDateString('id', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

const getPointTier = (points = 0) => {
    const pts = Number(points) || 0;
    if (pts >= 500) {
        return { label: 'Gold', classes: 'bg-yellow-100 text-yellow-800' };
    }
    if (pts >= 100) {
        return { label: 'Silver', classes: 'bg-navy-100 text-navy-900' };
    }
    return { label: 'Bronze', classes: 'bg-cream-200 text-navy-900' };
};

const getPointProgress = (points = 0) => {
    const pts = Number(points) || 0;
    if (pts >= 500) {
        return 100;
    }
    if (pts >= 100) {
        return Math.round(((pts - 100) / 400) * 100);
    }
    return Math.round((pts / 100) * 100);
};

const getNextTierText = (points = 0) => {
    const pts = Number(points) || 0;
    if (pts >= 500) {
        return 'Sudah berada di tier tertinggi';
    }
    const next = pts >= 100 ? 500 : 100;
    const remaining = next - pts;
    return `${remaining} poin lagi ke tier berikutnya`;
};

export default function Profile() {
    const { user, setUser } = useAuth();
    const [lastError, setLastError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        birth_date: user?.birth_date || '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [errors, setErrors] = useState({});
    const [pointLogs, setPointLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        if (user) {
            fetchPointHistory();
        }
    }, [user?.id]);

    const fetchPointHistory = async () => {
        setLoadingLogs(true);
        try {
            const res = await api.get('/points/history');
            setPointLogs(res.data.data);
        } catch (err) {
            console.error('Gagal memuat riwayat poin', err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const roleLabel = ROLE_LABELS[user?.role] || 'User';
    const createdAt = useMemo(
        () => formatDate(user?.created_at),
        [user?.created_at],
    );

    const userPoints = Number(user?.points) || 0;
    const pointTier = getPointTier(userPoints);
    const pointProgress = getPointProgress(userPoints);
    const nextTierText = getNextTierText(userPoints);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        if (errors.avatar) {
            setErrors((prev) => ({
                ...prev,
                avatar: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Nama harus diisi';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email harus diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        return newErrors;
    };

    const handleSave = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSaving(true);
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('email', formData.email);
            if (formData.birth_date) {
                payload.append('birth_date', formData.birth_date);
            }
            if (avatarFile) {
                payload.append('avatar', avatarFile);
            }

            const response = await api.put('/auth/profile', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.user) {
                setUser(response.data.user);
                setAvatarFile(null);
                setAvatarPreview(response.data.user.avatar || null);
                setIsEditing(false);
                toast.success('Profil berhasil diperbarui');
            }
        } catch (err) {
            // If validation errors returned (422), map them to local errors
            if (err.response?.status === 422 && err.response.data?.errors) {
                const serverErrors = err.response.data.errors;
                const mapped = {};
                Object.keys(serverErrors).forEach((key) => {
                    mapped[key] = serverErrors[key][0];
                });
                setErrors((prev) => ({ ...prev, ...mapped }));
                toast.error('Periksa input form');
            } else {
                console.error('Profile update error', err.response || err);
                const message =
                    err.response?.data?.message || 'Gagal memperbarui profil';
                const status = err.response?.status || 'network';
                setLastError(err.response?.data || { message, status });
                toast.error(`${message} (${status})`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            birth_date: user?.birth_date || '',
        });
        setAvatarFile(null);
        setAvatarPreview(user?.avatar || null);
        setErrors({});
        setIsEditing(false);
    };

    const handleStartEdit = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            birth_date: user?.birth_date || '',
        });
        setIsEditing(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-[40px] border border-cream-300 bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.28em] text-navy-400">
                            Profil
                        </p>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-navy-900">
                                Detail akun dan informasi profil
                            </h1>
                            <p className="max-w-2xl text-sm leading-7 text-navy-600">
                                Kelola nama, email, dan ikon profil Anda.
                                Halaman ini dibuat agar lebih lapang dan mudah
                                dilihat.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={handleStartEdit}
                                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-cream-100 transition hover:bg-navy-800"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-5 py-3 text-sm font-semibold text-navy-900 transition hover:bg-cream-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    Batal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {lastError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700 mb-2">
                        Debug: response error
                    </p>
                    <pre className="text-xs text-red-800 max-h-48 overflow-auto">
                        {JSON.stringify(lastError, null, 2)}
                    </pre>
                </div>
            )}

            {isEditing ? (
                <div className="grid gap-6 xl:grid-cols-[320px_1fr] items-start">
                    <aside className="rounded-[40px] border border-cream-300 bg-cream-50 shadow-sm overflow-hidden self-start">
                        <div className="bg-navy-900 h-20" />
                        <div className="p-6 pt-12 pb-6 text-center">
                            <div className="mx-auto -mt-14 h-28 w-28 overflow-hidden rounded-full ring-4 ring-white border border-cream-200 bg-navy-900 shadow-sm">
                                {avatarPreview || user?.avatar ? (
                                    <img
                                        src={avatarPreview || user.avatar}
                                        alt={user?.name || 'Avatar'}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-cream-100">
                                        {user?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || (
                                            <UserCircleIcon className="w-12 h-12" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 space-y-2">
                                <p className="text-xl font-semibold text-navy-900">
                                    {user?.name || 'Nama tidak tersedia'}
                                </p>
                                <p className="text-sm uppercase tracking-[0.24em] text-navy-400">
                                    {roleLabel}
                                </p>
                            </div>
                            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-[24px] bg-white p-3">
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-navy-400">
                                        POIN
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-navy-900">
                                        {userPoints}
                                    </p>
                                </div>
                                <div className="rounded-[24px] bg-white p-3">
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-navy-400">
                                        ROLE
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-navy-900">
                                        {roleLabel}
                                    </p>
                                </div>
                                <div className="rounded-[24px] bg-white p-3">
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-navy-400">
                                        SEJAK
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-navy-900 leading-tight">
                                        {user?.created_at
                                            ? new Date(
                                                  user.created_at,
                                              ).toLocaleDateString('id', {
                                                  year: 'numeric',
                                              })
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 border-t border-cream-200" />
                            <label
                                htmlFor="avatar"
                                className="mt-5 inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-white px-4 py-3 text-sm font-semibold text-navy-900 transition hover:bg-navy-50 cursor-pointer"
                            >
                                <PhotoIcon className="h-4 w-4" />
                                Pilih Gambar
                            </label>
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="sr-only"
                            />
                            {errors.avatar && (
                                <p className="mt-2 text-xs text-red-600">
                                    {errors.avatar}
                                </p>
                            )}
                        </div>
                    </aside>

                    <section className="rounded-[40px] border border-cream-300 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-navy-400 mb-6">
                            Edit Informasi Profil
                        </p>
                        <div className="grid gap-5">
                            <div>
                                <label className="text-xs uppercase tracking-[0.2em] text-navy-400 font-medium block mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full rounded-3xl border px-4 py-3 text-sm font-medium bg-white transition focus:outline-none ${
                                        errors.name
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-cream-300 focus:border-navy-400'
                                    }`}
                                    placeholder="Masukkan nama lengkap"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-[0.2em] text-navy-400 font-medium block mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full rounded-3xl border px-4 py-3 text-sm font-medium bg-white transition focus:outline-none ${
                                        errors.email
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-cream-300 focus:border-navy-400'
                                    }`}
                                    placeholder="Masukkan email"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-[0.2em] text-navy-400 font-medium block mb-2">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    className={`w-full rounded-3xl border px-4 py-3 text-sm font-medium bg-white transition focus:outline-none ${
                                        errors.birth_date
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-cream-300 focus:border-navy-400'
                                    }`}
                                />
                                {errors.birth_date && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.birth_date}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[320px_1fr] items-start">
                    <aside className="rounded-[40px] border border-cream-300 bg-cream-50 shadow-sm overflow-hidden self-start">
                        <div className="bg-navy-900 h-20" />
                        <div className="p-6 pt-12 pb-6 text-center">
                            <div className="mx-auto -mt-14 h-28 w-28 overflow-hidden rounded-full ring-4 ring-white border border-cream-200 bg-navy-900 shadow-sm">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user?.name || 'Avatar'}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-cream-100">
                                        {user?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || (
                                            <UserCircleIcon className="w-12 h-12" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 space-y-2">
                                <p className="text-xl font-semibold text-navy-900">
                                    {user?.name || 'Nama tidak tersedia'}
                                </p>
                                <p className="text-sm uppercase tracking-[0.24em] text-navy-400">
                                    {roleLabel}
                                </p>
                            </div>
                            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-[24px] bg-white p-3">
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-navy-400">
                                        POIN
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-navy-900">
                                        {userPoints}
                                    </p>
                                </div>
                                <div className="rounded-[24px] bg-white p-3">
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-navy-400">
                                        ROLE
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-navy-900">
                                        {roleLabel}
                                    </p>
                                </div>
                                <div className="rounded-[24px] bg-white p-3">
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-navy-400">
                                        SEJAK
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-navy-900 leading-tight">
                                        {user?.created_at
                                            ? new Date(
                                                  user.created_at,
                                              ).toLocaleDateString('id', {
                                                  year: 'numeric',
                                              })
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 border-t border-cream-200" />
                        </div>
                    </aside>

                    <div className="space-y-6">
                        <div className="rounded-[40px] border border-cream-300 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-navy-400">
                                        Informasi akun
                                    </p>
                                    <p className="text-sm text-navy-600 mt-1">
                                        Semua informasi dasar yang terhubung
                                        dengan akun Anda.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleStartEdit}
                                    className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-cream-100 transition hover:bg-navy-800"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="rounded-[32px] bg-cream-50 p-5">
                                    <p className="text-xs uppercase tracking-[0.2em] text-navy-400">
                                        Email
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-navy-900 truncate">
                                        {user?.email || '—'}
                                    </p>
                                </div>
                                <div className="rounded-[32px] bg-cream-50 p-5">
                                    <p className="text-xs uppercase tracking-[0.2em] text-navy-400">
                                        Tanggal Lahir
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-navy-900">
                                        {formatDate(user?.birth_date)}
                                    </p>
                                </div>
                                <div className="rounded-[32px] bg-cream-50 p-5">
                                    <p className="text-xs uppercase tracking-[0.2em] text-navy-400">
                                        Provider
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-navy-900">
                                        {user?.provider || 'local'}
                                    </p>
                                </div>
                                <div className="rounded-[32px] bg-cream-50 p-5">
                                    <p className="text-xs uppercase tracking-[0.2em] text-navy-400">
                                        Terdaftar sejak
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-navy-900">
                                        {createdAt}
                                    </p>
                                </div>
                                <div className="rounded-[32px] bg-cream-50 p-5">
                                    <p className="text-xs uppercase tracking-[0.2em] text-navy-400">
                                        Poin
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-navy-900">
                                        {user?.points ?? 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Riwayat Poin */}
                        <div className="rounded-[40px] border border-cream-300 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.24em] text-navy-400">
                                            Total Poin
                                        </p>
                                        <p className="text-4xl font-semibold text-navy-900 mt-2">
                                            {userPoints}
                                        </p>
                                    </div>
                                    <div
                                        className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold ${pointTier.classes}`}
                                    >
                                        {pointTier.label}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-2 overflow-hidden rounded-full bg-cream-200">
                                        <div
                                            className="h-full rounded-full bg-navy-900"
                                            style={{
                                                width: `${Math.max(pointProgress, 3)}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-navy-500">
                                        {nextTierText}
                                    </p>
                                </div>

                                {loadingLogs ? (
                                    <div className="py-8 flex justify-center">
                                        <div className="w-5 h-5 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : pointLogs.length === 0 ? (
                                    <div className="py-8 flex flex-col items-center justify-center gap-3 text-center text-sm text-navy-500">
                                        <SparklesIcon className="w-10 h-10 text-yellow-500" />
                                        <p className="font-semibold text-navy-900">
                                            Belum ada poin.
                                        </p>
                                        <p>
                                            Selesaikan pesanan pertamamu untuk
                                            mulai mengumpulkan poin.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-72 overflow-y-auto pr-2 divide-y divide-cream-100">
                                        {pointLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex justify-between items-center text-xs pt-3 first:pt-0"
                                            >
                                                <div>
                                                    <p className="font-semibold text-navy-800">
                                                        {log.type === 'earn'
                                                            ? '☕ Dapatkan Poin'
                                                            : '🛍️ Tukarkan Poin'}
                                                    </p>
                                                    <p className="text-navy-400 mt-1">
                                                        Order #HSH-
                                                        {String(
                                                            log.order_id,
                                                        ).padStart(4, '0')}{' '}
                                                        ·{' '}
                                                        {new Date(
                                                            log.created_at,
                                                        ).toLocaleDateString(
                                                            'id',
                                                            {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`font-bold text-sm ${log.points_change > 0 ? 'text-green-600' : 'text-red-500'}`}
                                                >
                                                    {log.points_change > 0
                                                        ? `+${log.points_change}`
                                                        : log.points_change}{' '}
                                                    pts
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
