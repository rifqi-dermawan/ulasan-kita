import React from 'react';
import { Link } from '@inertiajs/react';

export default function EmptyState({
    title = 'Belum ada ulasan',
    description = 'Tambahkan ulasan pertama Anda atau import ulasan pelanggan untuk memulai.',
    actionText = '+ Tambah Ulasan',
    actionHref = null,
    onAction = null,
    className = '',
}) {
    return (
        <div className={`border-2 border-dashed border-[#B2DFDB] rounded-2xl p-8 sm:p-12 text-center bg-white/60 ${className}`}>
            {/* Lingkaran Ikon Ulasan */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#26A69A] bg-[#E8F5F1] flex items-center justify-center text-[#26A69A]">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </div>

            <h4 className="text-base font-bold text-[#2C3E50] mb-2">{title}</h4>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">{description}</p>

            {actionText && (
                actionHref ? (
                    <Link
                        href={actionHref}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-medium text-sm rounded-lg shadow-sm transition"
                    >
                        {actionText}
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={onAction}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-medium text-sm rounded-lg shadow-sm transition"
                    >
                        {actionText}
                    </button>
                )
            )}
        </div>
    );
}
