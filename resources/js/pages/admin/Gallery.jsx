import React, { useEffect, useState } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    PhotoIcon,
    ArrowPathIcon,
    InboxIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api, { backendBaseUrl } from '../../api/axios';

export default function Gallery() {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Add Form states
    const [newTitle, setNewTitle] = useState('');
    const [newSortOrder, setNewSortOrder] = useState('0');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    // Edit Form states
    const [editTitle, setEditTitle] = useState('');
    const [editSortOrder, setEditSortOrder] = useState('0');

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/gallery');
            setGalleryItems(res.data.data || []);
        } catch (err) {
            toast.error('Gagal memuat galeri foto');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `${backendBaseUrl}${url}`;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            toast.error('File harus berupa gambar');
            return;
        }

        setSelectedFile(file);
        setFilePreview(URL.createObjectURL(file));
    };

    const handleRemoveSelectedFile = () => {
        setSelectedFile(null);
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
            setFilePreview(null);
        }
        const fileInput = document.getElementById('gallery-upload-file');
        if (fileInput) fileInput.value = '';
    };

    const handleAddPhoto = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error('Pilih file gambar terlebih dahulu');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('title', newTitle);
        formData.append('sort_order', newSortOrder);

        try {
            await api.post('/admin/gallery', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Foto berhasil ditambahkan ke galeri!');
            setNewTitle('');
            setNewSortOrder('0');
            handleRemoveSelectedFile();
            fetchGallery();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengunggah foto');
        } finally {
            setUploading(false);
        }
    };

    const handleToggleActive = async (item) => {
        try {
            await api.put(`/admin/gallery/${item.id}`, {
                is_active: !item.is_active,
            });
            toast.success(item.is_active ? 'Foto dinonaktifkan' : 'Foto diaktifkan');
            fetchGallery();
        } catch (err) {
            toast.error('Gagal mengubah status aktif');
        }
    };

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditTitle(item.title || '');
        setEditSortOrder(String(item.sort_order || 0));
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditTitle('');
        setEditSortOrder('0');
    };

    const handleUpdate = async (id) => {
        try {
            await api.put(`/admin/gallery/${id}`, {
                title: editTitle,
                sort_order: parseInt(editSortOrder) || 0,
            });
            toast.success('Foto berhasil diperbarui!');
            setEditingId(null);
            fetchGallery();
        } catch (err) {
            toast.error('Gagal memperbarui foto');
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/admin/gallery/${deleteId}`);
            toast.success('Foto berhasil dihapus dari galeri');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchGallery();
        } catch (err) {
            toast.error('Gagal menghapus foto');
        }
    };

    if (loading && galleryItems.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Form Unggah Foto */}
            <div className="bg-white border border-cream-300 rounded-[32px] p-6 shadow-sm">
                <h3 className="font-playfair text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
                    <PhotoIcon className="w-5 h-5 text-navy-500" />
                    Tambah Foto Baru ke Suasana Kafe
                </h3>
                <form onSubmit={handleAddPhoto} className="grid gap-6 md:grid-cols-[1fr_2fr] items-start">
                    {/* Input Upload & Preview */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-navy-800">
                            Pilih File Gambar
                        </label>
                        <div className="relative border-2 border-dashed border-cream-300 hover:border-navy-400 rounded-2xl p-4 flex flex-col items-center justify-center bg-cream-50/50 cursor-pointer min-h-[160px] transition-all">
                            {filePreview ? (
                                <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-sm">
                                    <img
                                        src={filePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemoveSelectedFile();
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow"
                                        title="Hapus gambar"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-2">
                                    <PhotoIcon className="w-8 h-8 text-cream-400 mx-auto" />
                                    <p className="text-xs text-navy-500 font-medium">
                                        Klik untuk pilih berkas gambar
                                    </p>
                                    <p className="text-[10px] text-navy-400">
                                        PNG, JPG, JPEG, WEBP
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                id="gallery-upload-file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Inputs Meta */}
                    <div className="space-y-4 h-full flex flex-col justify-between">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2 text-sm text-navy-700 font-medium">
                                Label / Judul Foto (Opsional)
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Misal: Outdoor terrace"
                                    className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                />
                            </label>
                            <label className="space-y-2 text-sm text-navy-700 font-medium">
                                Urutan Tampil (Sort Order)
                                <input
                                    type="number"
                                    value={newSortOrder}
                                    onChange={(e) => setNewSortOrder(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                />
                            </label>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-100 transition hover:bg-navy-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                            >
                                {uploading ? (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                        Mengunggah...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-4 h-4" />
                                        Unggah Foto
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Grid List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-playfair text-xl font-semibold text-navy-900">
                        Daftar Foto Galeri ({galleryItems.length})
                    </h3>
                    <button
                        type="button"
                        onClick={fetchGallery}
                        className="p-2 rounded-xl border border-cream-300 text-navy-600 bg-white hover:bg-cream-50 transition"
                        title="Segarkan data"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                </div>

                {galleryItems.length === 0 ? (
                    <div className="bg-white border border-cream-300 rounded-[32px] py-16 text-center text-navy-400">
                        <div className="flex flex-col items-center gap-3">
                            <InboxIcon className="w-12 h-12 text-navy-200" />
                            <p className="text-sm font-medium">Galeri foto kosong.</p>
                            <p className="text-xs text-navy-400 max-w-xs">
                                Unggah foto suasana di atas untuk ditampilkan secara dinamis pada landing page kafe.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {galleryItems.map((item) => {
                            const isEditing = editingId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white border rounded-[32px] overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 ${
                                        item.is_active ? 'border-cream-300' : 'border-red-200/50 opacity-75'
                                    }`}
                                >
                                    {/* Preview Gambar */}
                                    <div className="relative aspect-video bg-cream-50/50 overflow-hidden group">
                                        <img
                                            src={getImageUrl(item.image_url)}
                                            alt={item.title || 'Foto Suasana'}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 left-3 bg-navy-900/80 backdrop-blur-sm text-cream-100 text-xs px-2.5 py-1 rounded-full font-semibold">
                                            #{item.sort_order}
                                        </div>
                                        {!item.is_active && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                                                Nonaktif
                                            </div>
                                        )}
                                    </div>

                                    {/* Deskripsi & Form Edit */}
                                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <label className="block text-xs font-semibold text-navy-700">
                                                    Label Foto
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full mt-1 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-xs text-navy-900 outline-none focus:border-navy-400"
                                                    />
                                                </label>
                                                <label className="block text-xs font-semibold text-navy-700">
                                                    Sort Order
                                                    <input
                                                        type="number"
                                                        value={editSortOrder}
                                                        onChange={(e) => setEditSortOrder(e.target.value)}
                                                        className="w-full mt-1 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-xs text-navy-900 outline-none focus:border-navy-400"
                                                    />
                                                </label>
                                                <div className="flex gap-2 justify-end pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={cancelEditing}
                                                        className="inline-flex items-center justify-center p-2 rounded-full border border-cream-300 hover:bg-cream-50 text-navy-600 transition"
                                                        title="Batal"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdate(item.id)}
                                                        className="inline-flex items-center justify-center p-2 rounded-full bg-navy-900 hover:bg-navy-800 text-cream-100 transition"
                                                        title="Simpan"
                                                    >
                                                        <CheckIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-semibold text-sm text-navy-900 line-clamp-1">
                                                    {item.title || <span className="italic text-navy-300 font-light">Tidak ada judul</span>}
                                                </h4>
                                                <p className="text-[10px] text-navy-400 mt-1 uppercase tracking-wide">
                                                    Terdaftar: {new Date(item.created_at).toLocaleDateString('id')}
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {!isEditing && (
                                            <div className="flex items-center justify-between border-t border-cream-100 pt-4 mt-auto">
                                                {/* Active Switch */}
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.is_active}
                                                        onChange={() => handleToggleActive(item)}
                                                        className="w-4 h-4 rounded border-cream-300 text-navy-800 focus:ring-navy-800 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-semibold text-navy-700">
                                                        Tampilkan
                                                    </span>
                                                </label>

                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(item)}
                                                        className="p-2 rounded-full border border-cream-300 text-navy-600 bg-white hover:bg-cream-50 transition"
                                                        title="Edit label & urutan"
                                                    >
                                                        <PencilIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(item.id)}
                                                        className="p-2 rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition"
                                                        title="Hapus foto"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Hapus */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 px-4 py-6">
                    <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl ring-1 ring-black/5">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-navy-900">
                                    Hapus foto dari galeri?
                                </h3>
                                <p className="text-sm text-navy-500 mt-1">
                                    Foto suasana yang dihapus akan terhapus permanen dari server dan tidak tampil lagi di landing page.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                    className="rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-700 transition hover:bg-cream-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
