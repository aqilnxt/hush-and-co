import React from 'react';

export default function Card({ title, subtitle, className = '', children }) {
    return (
        <div
            className={`rounded-3xl border border-cream-200 bg-white shadow-sm ${className}`}
        >
            {(title || subtitle) && (
                <div className="px-6 py-5 border-b border-cream-200">
                    {title && (
                        <h3 className="text-base font-semibold text-navy-900">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-navy-500 mt-1">{subtitle}</p>
                    )}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
}
