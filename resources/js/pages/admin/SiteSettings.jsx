import React, { useMemo, useRef, useState } from 'react';
import {
    ArrowPathIcon,
    PhotoIcon,
    CloudArrowUpIcon,
    PencilSquareIcon,
    ArrowUpOnSquareIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api, { backendBaseUrl } from '../../api/axios';
import useSiteSettings, { resolveSiteImage } from '../../hooks/useSiteSettings';

const SETTINGS = [
    {
        key: 'logo',
        title: 'Logo Situs',
        description:
            'Logo utama yang tampil di navbar, admin sidebar, dan layout umum.',
        fallback: '/images/hush-co-logo.png',
        fit: 'contain',
        aspect: 'aspect-square',
    },
    {
        key: 'hero_image',
        title: 'Hero Image',
        description: 'Gambar landing page di bagian hero.',
        fallback: '/images/hush-co-lifestyle.png',
        fit: 'cover',
        aspect: 'aspect-video',
    },
    {
        key: 'about_image',
        title: 'About Image',
        description: 'Gambar section tentang kami di landing page.',
        fallback: '/images/hush-co-about.png',
        fit: 'cover',
        aspect: 'aspect-video',
    },
    {
        key: 'auth_bg',
        title: 'Auth Background',
        description: 'Background halaman login/register.',
        fallback: '/images/hush-co-cafe.png',
        fit: 'cover',
        aspect: 'aspect-[4/3]',
    },
];

const MAX_FILE_SIZE_MB = 50;

export default function SiteSettings() {
    const { settings, loading, refresh } = useSiteSettings();
    const [uploadingKey, setUploadingKey] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputs = useRef({});

    const handleFileSelect = async (key, event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.match('image.*')) {
            toast.error('File harus berupa gambar.');
            event.target.value = null;
            return;
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(
                `Ukuran file tidak boleh lebih dari ${MAX_FILE_SIZE_MB}MB.`,
            );
            event.target.value = null;
            return;
        }

        await uploadImage(key, file);
        event.target.value = null;
    };

    const uploadImage = async (key, file) => {
        setUploadingKey(key);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            await api.post(`/admin/site-settings/${key}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Gambar berhasil diperbarui.');
            await refresh();
        } catch (err) {
            const status = err.response?.status;
            if (status === 413) {
                toast.error(
                    'Ukuran file terlalu besar. Coba gunakan file yang lebih kecil.',
                );
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Gagal mengunggah gambar.');
            }
        } finally {
            setUploading(false);
            setUploadingKey(null);
        }
    };

    const cards = useMemo(
        () =>
            SETTINGS.map((item) => ({
                ...item,
                imageUrl: resolveSiteImage(settings[item.key], item.fallback),
            })),
        [settings],
    );

    const renderButtonText = (key) => {
        if (uploading && uploadingKey === key) {
            return 'Mengunggah...';
        }

        return 'Ganti Gambar';
    };

    if (loading) {
        return (
            <div className="min-h-[420px] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-8">
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-navy-900">
                        <PhotoIcon className="w-6 h-6" />
                        <h1 className="font-playfair text-2xl font-semibold">
                            Pengaturan Gambar Situs
                        </h1>
                    </div>
                    <p className="text-sm text-navy-600 max-w-2xl">
                        Kelola gambar statis landing page dan halaman auth dari
                        satu tempat. Upload file baru untuk setiap pengaturan,
                        dan preview akan langsung diperbarui.
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-2 items-start">
                    {cards.map((item) => (
                        <div
                            key={item.key}
                            className="bg-white border border-cream-300 rounded-[32px] shadow-sm p-6"
                        >
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.24em] text-navy-500 mb-2">
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-navy-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-cream-100 text-navy-700">
                                    <CloudArrowUpIcon className="w-5 h-5" />
                                </div>
                            </div>

                            <div
                                className={`relative rounded-[28px] overflow-hidden border border-cream-200 bg-cream-50 ${item.aspect} mb-6`}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className={
                                        item.fit === 'contain'
                                            ? 'w-full h-full object-contain p-8'
                                            : 'w-full h-full object-cover'
                                    }
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>

                            <p className="text-xs text-navy-500 mb-4">
                                Ukuran maksimum {MAX_FILE_SIZE_MB}MB. Format:
                                JPEG, PNG, JPG, GIF, WEBP.
                            </p>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputs.current[item.key]?.click()
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy-900 px-5 py-3 text-sm font-semibold text-cream-100 transition hover:bg-navy-800"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    {renderButtonText(item.key)}
                                </button>
                                <span className="text-xs text-navy-500">
                                    Preview akan otomatis refresh setelah
                                    upload.
                                </span>
                            </div>

                            <input
                                ref={(el) => {
                                    fileInputs.current[item.key] = el;
                                }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(item.key, e)}
                            />
                        </div>
                    ))}
                </div>

                <div className="rounded-[32px] bg-cream-100 border border-cream-200 p-6 text-sm text-navy-600">
                    <div className="flex items-center gap-2 mb-2 text-navy-700 font-medium">
                        <ArrowUpOnSquareIcon className="w-4 h-4" />
                        Tips
                    </div>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            Gunakan gambar dengan resolusi cukup besar untuk
                            tampilan desktop.
                        </li>
                        <li>
                            Logo sebaiknya memiliki latar transparan jika
                            memungkinkan.
                        </li>
                        <li>
                            Jika preview tidak berubah segera, refresh halaman
                            atau tunggu beberapa saat.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
