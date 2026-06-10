import React, { useEffect, useState } from 'react';
import {
    SparklesIcon,
    CheckCircleIcon,
    XCircleIcon,
    PlusIcon,
    BanknotesIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ToppingManager() {
    const [toppings, setToppings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', price: 0, active: true });

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/toppings');
            setToppings(res.data || res.data.data || []);
        } catch (err) {
            toast.error('Gagal memuat toppings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    const openEdit = (t) => {
        setEditing(t);
        setForm({ name: t.name, price: t.price, active: t.active });
    };

    const save = async () => {
        try {
            if (editing) {
                await api.put(`/admin/toppings/${editing.id}`, form);
                toast.success('Topping diperbarui');
            } else {
                await api.post('/admin/toppings', form);
                toast.success('Topping dibuat');
            }
            setEditing(null);
            setForm({ name: '', price: 0, active: true });
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan');
        }
    };

    const destroy = async (t) => {
        if (!confirm(`Hapus topping ${t.name}?`)) return;
        try {
            await api.delete(`/admin/toppings/${t.id}`);
            toast.success('Topping dihapus');
            fetch();
        } catch (err) {
            toast.error('Gagal menghapus');
        }
    };

    const toggleActive = async (t) => {
        try {
            await api.put(`/admin/toppings/${t.id}`, {
                active: !t.active,
            });
            toast.success(
                `Topping ${t.active ? 'dinonaktifkan' : 'diaktifkan'}!`,
            );
            fetch();
        } catch (err) {
            toast.error('Gagal memperbarui status topping');
        }
    };

    const totalActive = toppings.filter((t) => t.active).length;
    const totalInactive = toppings.length - totalActive;

    const formatRp = (value) => `Rp ${Number(value).toLocaleString('id-ID')}`;

    return (
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-8">
            <div className="grid gap-6 md:grid-cols-3 mb-6">
                <div className="relative rounded-3xl bg-white p-6 shadow-sm border border-cream-200">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-navy-400 mb-2">
                                Total Topping
                            </p>
                            <p className="font-playfair text-4xl font-bold text-navy-900">
                                {toppings.length}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-cream-100 flex items-center justify-center shadow-sm">
                            <SparklesIcon className="h-6 w-6 text-navy-600" />
                        </div>
                    </div>
                </div>

                <div className="relative rounded-3xl bg-white p-6 shadow-sm border border-cream-200">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-navy-400 mb-2">
                                Topping Aktif
                            </p>
                            <p className="font-playfair text-4xl font-bold text-navy-900">
                                {totalActive}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-cream-100 flex items-center justify-center shadow-sm">
                            <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="relative rounded-3xl bg-white p-6 shadow-sm border border-cream-200">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-navy-400 mb-2">
                                Tidak Aktif
                            </p>
                            <p className="font-playfair text-4xl font-bold text-navy-900">
                                {totalInactive}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-cream-100 flex items-center justify-center shadow-sm">
                            <XCircleIcon className="h-6 w-6 text-red-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 rounded-[32px] border border-cream-300 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy-100 text-navy-500">
                        <PlusIcon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-navy-900">
                        {editing ? 'Edit Topping' : 'Tambah Topping Baru'}
                    </h2>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
                    <div className="w-full lg:w-[40%]">
                        <label className="mb-2 block text-sm font-semibold text-navy-800">
                            Nama Topping
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="Contoh: Extra Milk"
                            className="w-full rounded-full border border-cream-300 bg-cream-50 px-5 py-3 text-sm text-navy-900 outline-none transition focus:border-navy-400"
                        />
                    </div>

                    <div className="w-full lg:w-[30%]">
                        <label className="mb-2 block text-sm font-semibold text-navy-800">
                            Harga (Rp)
                        </label>
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    price: parseFloat(e.target.value || 0),
                                })
                            }
                            placeholder="0"
                            className="w-full rounded-full border border-cream-300 bg-cream-50 px-5 py-3 text-sm text-navy-900 outline-none transition focus:border-navy-400"
                        />
                    </div>

                    <div className="flex w-full items-center justify-between gap-6 lg:w-[20%]">
                        <label className="flex items-center gap-2 text-sm font-medium text-navy-800 pb-3">
                            <input
                                type="checkbox"
                                checked={!!form.active}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        active: e.target.checked,
                                    })
                                }
                                className="h-4 w-4 rounded border-cream-300 bg-white text-navy-800 focus:ring-navy-800"
                            />
                            Aktif
                        </label>
                        <button
                            onClick={save}
                            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-100"
                        >
                            <CheckCircleIcon className="h-4 w-4" />
                            Simpan
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-cream-300 bg-white shadow-sm">
                <div className="grid grid-cols-4 gap-0 border-b border-cream-200 bg-cream-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-navy-400">
                    <div className="col-span-2">Nama</div>
                    <div>Harga</div>
                    <div className="text-right">Aksi</div>
                </div>
                <div className="divide-y divide-cream-200">
                    {loading ? (
                        <div className="px-6 py-6 text-navy-500">Memuat...</div>
                    ) : (
                        toppings.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-cream-50"
                            >
                                <div className="min-w-0">
                                    <div className="font-semibold text-navy-900">
                                        {t.name}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-navy-800">
                                    <BanknotesIcon className="h-4 w-4 text-navy-400" />
                                    <span className="font-medium">
                                        {formatRp(t.price)}
                                    </span>
                                </div>
                                <div>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                            t.active
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {t.active ? (
                                            <CheckCircleIcon className="h-3.5 w-3.5" />
                                        ) : (
                                            <XCircleIcon className="h-3.5 w-3.5" />
                                        )}
                                        {t.active ? 'Aktif' : 'Tidak aktif'}
                                    </span>
                                </div>
                                <div className="ml-auto flex items-center gap-2 text-right">
                                    <button
                                        onClick={() => openEdit(t)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2 text-xs font-semibold text-navy-800"
                                    >
                                        <PencilIcon className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => toggleActive(t)}
                                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                                            t.active
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                    >
                                        {t.active ? 'Nonaktifkan' : 'Aktifkan'}
                                    </button>
                                    <button
                                        onClick={() => destroy(t)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                                    >
                                        <TrashIcon className="h-3.5 w-3.5" />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
