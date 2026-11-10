import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import QrLinkCard from '@/Components/QrLinkCard';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({
    auth,
    kantin = {},
    publicUrl = '',
}) {
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        source: 'qr',
        reviewed_at: today,
        menu_item: '',
        receipt_number: '',
        content: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('ulasan.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Ulasan - UlasanKita" />

            <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
                {/* Header & Breadcrumb (Sembunyikan saat dicetak) */}
                <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
                            <Link href={route('dashboard')} className="text-[#26A69A] hover:underline">
                                Beranda
                            </Link>
                            <span>&gt;</span>
                            <Link href={route('ulasan.index')} className="text-[#26A69A] hover:underline">
                                Ulasan
                            </Link>
                            <span>&gt;</span>
                            <span className="text-[#2C3E50]">Tambah Ulasan</span>
                        </nav>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3E50] tracking-tight">
                            Tambah Ulasan
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Bagikan kartu QR Code ulasan mandiri atau catat ulasan pelanggan secara langsung
                        </p>
                    </div>

                    <Link
                        href={route('ulasan.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-[#B2DFDB] hover:bg-[#E8F5F1] text-[#2C3E50] font-semibold text-xs sm:text-sm rounded-lg transition"
                    >
                        &larr; Kembali ke Daftar
                    </Link>
                </div>

                {/* Komponen Kartu QR Code Pelanggan */}
                {publicUrl && (
                    <QrLinkCard
                        url={publicUrl}
                        kantinName={kantin.name || 'Kantin'}
                        title="Kartu QR Jalur Pelanggan Mandiri"
                        description="Cetak atau bagikan QR code ini. Pelanggan dapat memindai dari meja untuk mengisi ulasan langsung tanpa perlu login."
                    />
                )}

                {/* Form Input Ulasan Manual (Sembunyikan saat dicetak) */}
                <form
                    onSubmit={handleSubmit}
                    className="print:hidden bg-white rounded-2xl border border-[#B2DFDB] p-6 sm:p-8 shadow-sm space-y-6"
                >
                    <div className="border-b border-[#E8F5F1] pb-4">
                        <h2 className="font-bold text-base sm:text-lg text-[#2C3E50]">
                            Formulir Input Ulasan Manual
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Gunakan form ini untuk mencatat ulasan pelanggan secara langsung jika diperlukan
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Input Tanggal Ulasan (Default hari ini, tidak boleh di masa depan) */}
                        <div className="space-y-1.5">
                            <label htmlFor="reviewed_at" className="block text-xs sm:text-sm font-bold text-[#2C3E50]">
                                Tanggal Ulasan <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="reviewed_at"
                                type="date"
                                max={today}
                                value={data.reviewed_at}
                                onChange={(e) => setData('reviewed_at', e.target.value)}
                                className={`w-full px-3.5 py-2.5 bg-[#F9FBFA] border rounded-xl text-sm text-[#2C3E50] focus:outline-none focus:ring-1 transition ${
                                    errors.reviewed_at
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 focus:border-[#26A69A] focus:ring-[#26A69A]'
                                }`}
                            />
                            {errors.reviewed_at && (
                                <p className="text-xs text-red-500 font-medium">{errors.reviewed_at}</p>
                            )}
                        </div>

                        {/* Menu yang Dipesan */}
                        <div className="space-y-1.5">
                            <label htmlFor="menu_item" className="block text-xs sm:text-sm font-bold text-[#2C3E50]">
                                Menu yang Dipesan <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
                            </label>
                            <input
                                id="menu_item"
                                type="text"
                                value={data.menu_item}
                                onChange={(e) => setData('menu_item', e.target.value)}
                                placeholder="Contoh: Ayam Katsu, Es Jeruk"
                                className="w-full px-3.5 py-2.5 bg-[#F9FBFA] border border-gray-200 rounded-xl text-sm text-[#2C3E50] placeholder-gray-400 focus:outline-none focus:border-[#26A69A] focus:ring-1 focus:ring-[#26A69A] transition"
                            />
                            {errors.menu_item && (
                                <p className="text-xs text-red-500 font-medium">{errors.menu_item}</p>
                            )}
                        </div>

                        {/* Nomor Struk / ID Pesanan */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="receipt_number" className="block text-xs sm:text-sm font-bold text-[#2C3E50]">
                                    Nomor Struk / ID Pesanan <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
                                </label>
                                <span className="text-[10px] text-[#1E6B65] font-semibold bg-[#E8F5F1] px-2 py-0.5 rounded-full border border-[#B2DFDB]">
                                    🧾 Verifikasi Pembelian
                                </span>
                            </div>
                            <input
                                id="receipt_number"
                                type="text"
                                maxLength={50}
                                value={data.receipt_number}
                                onChange={(e) => setData('receipt_number', e.target.value)}
                                placeholder="Contoh: #042 atau STR-20261110"
                                className={`w-full px-3.5 py-2.5 bg-[#F9FBFA] border rounded-xl text-sm text-[#2C3E50] placeholder-gray-400 focus:outline-none focus:ring-1 transition ${
                                    errors.receipt_number
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 focus:border-[#26A69A] focus:ring-[#26A69A]'
                                }`}
                            />
                            {errors.receipt_number && (
                                <p className="text-xs text-red-500 font-medium">{errors.receipt_number}</p>
                            )}
                        </div>
                    </div>

                    {/* Isi Ulasan */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="content" className="block text-xs sm:text-sm font-bold text-[#2C3E50]">
                                Isi Ulasan Pelanggan <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[11px] text-gray-400">Min. 5 karakter, maks. 1000</span>
                        </div>
                        <textarea
                            id="content"
                            rows={4}
                            required
                            maxLength={1000}
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder="Tuliskan ulasan pelanggan di sini..."
                            className={`w-full px-3.5 py-2.5 bg-[#F9FBFA] border rounded-xl text-sm text-[#2C3E50] placeholder-gray-400 focus:outline-none focus:ring-1 transition resize-none ${
                                errors.content
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:border-[#26A69A] focus:ring-[#26A69A]'
                            }`}
                        />
                        {errors.content && (
                            <p className="text-xs text-red-500 font-medium">{errors.content}</p>
                        )}
                    </div>

                    {/* Info Otomatis Analisis Sentimen */}
                    <div className="bg-[#E8F5F1] rounded-xl p-3 border border-[#B2DFDB] flex items-start gap-2.5 text-xs text-[#1E6B65]">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <p className="leading-relaxed">
                            Setelah disimpan, kecerdasan buatan (AI) akan secara otomatis mendeteksi sentimen ulasan (<strong>Positif</strong>, <strong>Netral</strong>, atau <strong>Negatif</strong>). Data privasi pengulas tetap terjaga tanpa menyimpan nama atau foto.
                        </p>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E8F5F1]">
                        <Link
                            href={route('ulasan.index')}
                            className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-xs sm:text-sm rounded-xl transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || data.content.trim().length < 5}
                            className={`px-6 py-2.5 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 ${
                                processing || data.content.trim().length < 5
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#26A69A] hover:bg-[#1E6B65] text-white'
                            }`}
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    <span>Menyimpan & Menganalisis...</span>
                                </>
                            ) : (
                                <span>Simpan Ulasan</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
