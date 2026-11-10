import React from 'react';

export default function ConfirmModal({
    isOpen = false,
    onClose,
    onConfirm,
    title = 'Hapus 12 ulasan?',
    message = '12 ulasan akan dihapus dari daftar ulasan Anda. Tindakan ini tidak dapat dibatalkan. Pastikan Anda sudah tidak membutuhkan data ulasan ini.',
    confirmText = 'Hapus 12 Ulasan',
    cancelText = 'Batal',
    isLoading = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-[#B2DFDB] p-6 max-w-md w-full shadow-2xl relative">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E8F5F1] mb-4">
                    <h3 className="text-lg font-bold text-[#2C3E50]">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-[#E8F5F1] flex items-center justify-center text-gray-400 hover:text-[#2C3E50] transition"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Deskripsi */}
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {message}
                </p>

                {/* Footer Tombol */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-[#B2DFDB] text-[#2C3E50] hover:bg-[#E8F5F1] rounded-lg text-sm font-medium transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-5 py-2 bg-[#1E6B65] hover:bg-[#16504C] text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
