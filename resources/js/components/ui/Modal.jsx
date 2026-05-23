import React from 'react';

export default function Modal({ isOpen, title, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-navy-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
                    <h3 className="text-lg font-semibold text-navy-900">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl bg-cream-50 px-3 py-2 text-sm font-medium text-navy-500 hover:bg-cream-100"
                    >
                        Close
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
