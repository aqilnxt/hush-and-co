import React from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function renderIcon(icon) {
    if (!icon) return null;
    if (typeof icon === 'string') return <span>{icon}</span>;
    const IconComponent = icon;
    return <IconComponent className="w-5 h-5 text-navy-600" />;
}

export default function AdminSearchModal({
    isOpen,
    query,
    onQueryChange,
    results,
    onClose,
    onSelectResult,
    placeholder,
    inputRef,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-navy-900/50 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-5 border-b border-cream-200">
                    <div className="flex items-center gap-3">
                        <MagnifyingGlassIcon className="w-6 h-6 text-navy-700" />
                        <div>
                            <p className="text-sm font-semibold text-navy-900">
                                Cari di dashboard
                            </p>
                            <p className="text-xs text-navy-500">
                                Tekan Esc untuk menutup
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-50 text-navy-700 hover:bg-cream-100 transition"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder={placeholder}
                        className="w-full rounded-3xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                    />
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-5 pb-5">
                    {results.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-cream-200 bg-cream-50 p-8 text-center text-sm text-navy-500">
                            Belum ada hasil pencarian.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {results.map((item, index) => (
                                <button
                                    key={`${item.title}-${index}`}
                                    type="button"
                                    onClick={() => onSelectResult(item)}
                                    className="w-full text-left rounded-3xl border border-cream-200 bg-white p-4 transition hover:border-navy-200 hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">
                                            {renderIcon(item.icon)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-navy-900 truncate">
                                                {item.title}
                                            </p>
                                            {item.subtitle ? (
                                                <p className="text-sm text-navy-500 truncate">
                                                    {item.subtitle}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
