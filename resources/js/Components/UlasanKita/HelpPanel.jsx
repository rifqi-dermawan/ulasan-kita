import React, { useState } from 'react';

export default function HelpPanel({
    title = 'Bantuan: Penggunaan Aplikasi',
    defaultOpen = false,
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <>
            {/* Tombol Floating "? Bantuan" di pojok kanan bawah */}
            <div className="print:hidden fixed bottom-6 right-6 z-40">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#26A69A] hover:bg-[#1E6B65] text-white text-sm font-semibold rounded-full shadow-lg transition transform hover:scale-105"
                >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">?</span>
                    <span>Bantuan</span>
                </button>
            </div>

            {/* Panel Bantuan Samping / Modal */}
            {isOpen && (
                <div className="print:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-end p-4 sm:p-6 bg-black/20 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-[#B2DFDB] p-6 shadow-xl max-w-sm w-full animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E8F5F1] mb-4">
                            <h4 className="text-base font-bold text-[#2C3E50]">{title}</h4>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-[#E8F5F1] flex items-center justify-center text-gray-500 hover:text-[#2C3E50] transition"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3 text-sm text-[#2C3E50] mb-6">
                            <p className="text-gray-600">
                                Di sini Anda melihat dan mengelola seluruh ulasan pelanggan warung atau kedai kampus Anda.
                            </p>
                            <div className="p-3 bg-[#E8F5F1] rounded-lg border border-[#B2DFDB] space-y-2">
                                <p>
                                    <strong className="text-[#26A69A]">Positif:</strong> Pelanggan senang dan puas.
                                </p>
                                <p>
                                    <strong className="text-[#2C3E50]">Netral:</strong> Biasa saja, tidak memuji tapi juga tidak komplain.
                                </p>
                                <p>
                                    <strong className="text-[#1E6B65]">Negatif:</strong> Pelanggan mengeluh atau memberi saran perbaikan.
                                </p>
                            </div>
                            <p className="text-xs text-gray-500">
                                Semua aksen dan badge menggunakan palet mint yang tenang agar mata tidak lelah.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 border border-[#B2DFDB] text-[#2C3E50] hover:bg-[#E8F5F1] rounded-lg text-sm font-medium transition"
                            >
                                Tutup Bantuan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
