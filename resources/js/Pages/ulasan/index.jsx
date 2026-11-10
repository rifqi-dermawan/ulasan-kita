import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BadgeSentiment from '@/Components/UlasanKita/BadgeSentiment';
import ConfirmModal from '@/Components/UlasanKita/ConfirmModal';
import EmptyState from '@/Components/UlasanKita/EmptyState';
import { Head, Link, router, useForm, usePage, usePoll } from '@inertiajs/react';

export default function Index({
    auth,
    reviews,
    filters = {},
    stats = {},
    sourceOptions = {
        qr: 'QR Code',
        google_maps: 'Google Maps',
        whatsapp: 'WhatsApp',
        instagram: 'Instagram',
        lisan: 'Ulasan Lisan',
        lainnya: 'Lainnya',
    },
}) {
    const { flash } = usePage().props;
    const today = new Date().toISOString().split('T')[0];

    // Auto-update ulasan secara live real-time setiap 4 detik
    usePoll(4000);

    // State untuk Search & Filter Tab
    const [search, setSearch] = useState(filters.search || '');
    const currentSentiment = filters.sentiment || '';

    // State untuk Edit Modal
    const [editingReview, setEditingReview] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // State untuk Delete Modal
    const [deletingReview, setDeletingReview] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // State loading untuk AI Action
    const [analyzingId, setAnalyzingId] = useState(null);
    const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

    // Form Edit Ulasan menggunakan useForm Inertia
    const editForm = useForm({
        content: '',
        menu_item: '',
        reviewed_at: '',
        sentiment: 'Netral',
        reanalyze: false,
    });

    // Helper cerdas cek menu minuman vs makanan
    const isDrinkMenu = (menuName) => {
        if (!menuName) return false;
        const lower = menuName.toLowerCase();
        const drinkKeywords = [
            'kopi', 'coffee', 'teh', 'tea', 'es ', ' es', 'jus', 'juice',
            'susu', 'milk', 'drink', 'minuman', 'boba', 'latte', 'cappuccino',
            'matcha', 'sirup', 'air ', 'lemon', 'float', 'smoothie', 'cendol', 'dawet',
            'wedang', 'sekoteng', 'jahe', 'jeruk'
        ];
        return drinkKeywords.some((kw) => lower.includes(kw));
    };

    // Komponen Badge Menu dengan ikon pintar (Makanan: Sendok Garpu, Minuman: Cangkir)
    const MenuBadge = ({ menuItem }) => {
        if (!menuItem) return null;
        const isDrink = isDrinkMenu(menuItem);

        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5F1] text-[#1E6B65] border border-[#B2DFDB]">
                {isDrink ? (
                    // Ikon Minuman / Cangkir
                    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                        <line x1="6" y1="1" x2="6" y2="4" />
                        <line x1="10" y1="1" x2="10" y2="4" />
                        <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                ) : (
                    // Ikon Makanan / Sendok & Garpu
                    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                        <path d="M7 11v11" />
                        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                    </svg>
                )}
                <span>{menuItem}</span>
            </span>
        );
    };

    // Buka Modal Edit
    const handleOpenEdit = (review) => {
        setEditingReview(review);

        let dateStr = '';
        if (review.reviewed_at) {
            try {
                dateStr = new Date(review.reviewed_at).toISOString().split('T')[0];
            } catch {
                dateStr = review.reviewed_at.substring(0, 10);
            }
        } else if (review.review_date) {
            dateStr = review.review_date;
        } else if (review.created_at) {
            try {
                dateStr = new Date(review.created_at).toISOString().split('T')[0];
            } catch {
                dateStr = review.created_at.substring(0, 10);
            }
        }

        editForm.setData({
            content: review.content || '',
            menu_item: review.menu_item || '',
            reviewed_at: dateStr,
            sentiment: review.sentiment || 'Netral',
            reanalyze: false,
        });
        editForm.clearErrors();
        setIsEditModalOpen(true);
    };

    // Submit Edit
    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editingReview) return;

        editForm.put(route('ulasan.update', editingReview.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingReview(null);
            },
        });
    };

    // Buka Modal Delete
    const handleOpenDelete = (review) => {
        setDeletingReview(review);
        setIsDeleteModalOpen(true);
    };

    // Konfirmasi Delete
    const handleConfirmDelete = () => {
        if (!deletingReview) return;

        setIsDeleting(true);
        router.delete(route('ulasan.destroy', deletingReview.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                setDeletingReview(null);
            },
        });
    };

    // Jalankan Analisis AI untuk 1 ulasan
    const handleAnalyzeSingle = (reviewId) => {
        setAnalyzingId(reviewId);
        router.post(
            route('ulasan.analyze', reviewId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setAnalyzingId(null),
            }
        );
    };

    // Jalankan Analisis AI untuk semua ulasan yang belum dianalisis
    const handleAnalyzeAll = () => {
        if (isAnalyzingAll) return;
        setIsAnalyzingAll(true);
        router.post(
            route('ulasan.analyze-all'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsAnalyzingAll(false),
            }
        );
    };

    // Navigasi Filter terpadu
    const applyFilters = (sentimentVal, searchVal) => {
        router.get(
            route('ulasan.index'),
            {
                sentiment: sentimentVal !== undefined ? sentimentVal : currentSentiment || undefined,
                search: searchVal !== undefined ? searchVal : search || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Filter perubahan tab sentimen
    const handleFilterSentiment = (sentimentValue) => {
        applyFilters(sentimentValue, undefined);
    };

    // Submit Pencarian
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters(undefined, search);
    };

    // Reset Semua Filter
    const handleResetFilters = () => {
        setSearch('');
        applyFilters('', '');
    };

    // Format tanggal ulasan
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const unanalyzedCount = stats.unanalyzed || 0;
    const hasActiveFilters = Boolean(search || currentSentiment);

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Ulasan - UlasanKita" />

            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
                {/* Flash Messages Banner */}
                {flash?.success && (
                    <div className="bg-[#E8F5F1] border-2 border-[#26A69A] text-[#1E6B65] p-4 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-[#26A69A] text-white flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </span>
                            <p className="text-sm font-semibold">{flash.success}</p>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 border-2 border-red-300 text-red-800 p-4 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </span>
                            <p className="text-sm font-semibold">{flash.error}</p>
                        </div>
                    </div>
                )}

                {/* Banner Notifikasi Ulasan Belum Dianalisis */}
                {unanalyzedCount > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-teal-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="font-bold text-sm sm:text-base text-[#2C3E50]">
                                    Ada {unanalyzedCount} Ulasan Belum Dianalisis AI
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                    Klik tombol di samping untuk menganalisis seluruh ulasan secara otomatis menggunakan AI Gemini.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAnalyzeAll}
                            disabled={isAnalyzingAll}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition shrink-0 disabled:opacity-60"
                        >
                            {isAnalyzingAll ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <span>Menganalisis...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                    <span>Analisis Semua ({unanalyzedCount})</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Header & Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
                            <Link href={route('dashboard')} className="text-[#26A69A] hover:underline">
                                Beranda
                            </Link>
                            <span>&gt;</span>
                            <span className="text-[#2C3E50]">Daftar Ulasan</span>
                        </nav>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3E50] tracking-tight">
                            Daftar Ulasan
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Kelola ulasan masuk, lacak sumber ulasan, dan pantau hasil analisis sentimen AI
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {unanalyzedCount > 0 && (
                            <button
                                type="button"
                                onClick={handleAnalyzeAll}
                                disabled={isAnalyzingAll}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                                <span>{isAnalyzingAll ? 'Menganalisis...' : `Analisis AI (${unanalyzedCount})`}</span>
                            </button>
                        )}

                        <Link
                            href={route('ulasan.create')}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition"
                        >
                            <span>+</span>
                            <span>Tambah Ulasan</span>
                        </Link>
                    </div>
                </div>

                {/* Filter Tab Sentimen & Kotak Pencarian */}
                <div className="bg-white rounded-2xl border border-[#B2DFDB] p-4 sm:p-5 shadow-soft">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        {/* Tabs Sentimen */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                            <button
                                type="button"
                                onClick={() => handleFilterSentiment('')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                                    currentSentiment === ''
                                        ? 'bg-[#1E6B65] text-white shadow-xs'
                                        : 'bg-[#E8F5F1] text-[#2C3E50] hover:bg-[#B2DFDB]/60'
                                }`}
                            >
                                Semua ({stats.total ?? 0})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterSentiment('Positif')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                                    currentSentiment === 'Positif'
                                        ? 'bg-[#26A69A] text-white shadow-xs'
                                        : 'bg-[#E8F5F1] text-[#2C3E50] hover:bg-[#B2DFDB]/60'
                                }`}
                            >
                                Positif ({stats.positif ?? 0})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterSentiment('Netral')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                                    currentSentiment === 'Netral'
                                        ? 'bg-[#2C3E50] text-white shadow-xs'
                                        : 'bg-[#E8F5F1] text-[#2C3E50] hover:bg-[#B2DFDB]/60'
                                }`}
                            >
                                Netral ({stats.netral ?? 0})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterSentiment('Negatif')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                                    currentSentiment === 'Negatif'
                                        ? 'bg-[#1E6B65] text-white shadow-xs'
                                        : 'bg-[#E8F5F1] text-[#2C3E50] hover:bg-[#B2DFDB]/60'
                                }`}
                            >
                                Negatif ({stats.negatif ?? 0})
                            </button>
                            {unanalyzedCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleFilterSentiment('Belum Dianalisis')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                                        currentSentiment === 'Belum Dianalisis'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                    }`}
                                >
                                    Belum Dianalisis ({unanalyzedCount})
                                </button>
                            )}
                        </div>

                        {/* Search Input & Reset Button */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                            <div className="relative flex-1 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Cari ulasan atau menu..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-gray-50 border border-[#B2DFDB] rounded-lg text-[#2C3E50] focus:bg-white focus:outline-none focus:border-[#26A69A] focus:ring-1 focus:ring-[#26A69A]"
                                />
                                <svg
                                    className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-[#1E6B65] hover:bg-[#16504C] text-white font-semibold text-xs sm:text-sm rounded-lg transition"
                            >
                                Cari
                            </button>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-3 py-1.5 border border-[#B2DFDB] hover:bg-[#E8F5F1] text-gray-600 text-xs rounded-lg transition whitespace-nowrap"
                                    title="Reset Semua Filter"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Konten Daftar Ulasan */}
                {reviews.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada ulasan ditemukan"
                        description={
                            hasActiveFilters
                                ? 'Tidak ada ulasan yang sesuai dengan filter atau kata kunci pencarian Anda.'
                                : 'Belum ada ulasan yang masuk. Bagikan kartu QR Code ke pelanggan atau tambahkan ulasan secara manual.'
                        }
                        actionText="+ Tambah Ulasan Baru"
                        actionHref={route('ulasan.create')}
                    />
                ) : (
                    <div className="bg-white rounded-2xl border border-[#B2DFDB] shadow-soft overflow-hidden">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-[#E8F5F1] text-[#2C3E50] border-b border-[#B2DFDB] font-bold text-xs uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Isi Ulasan & Menu</th>
                                        <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                                        <th className="py-3.5 px-4 whitespace-nowrap">Sentimen</th>
                                        <th className="py-3.5 px-6 text-right whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8F5F1]">
                                    {reviews.data.map((review) => {
                                        const isSingleAnalyzing = analyzingId === review.id;
                                        const dateVal = review.reviewed_at || review.review_date || review.created_at;

                                        return (
                                            <tr key={review.id} className="hover:bg-[#F9FBFA] transition">
                                                {/* Kolom Ulasan */}
                                                <td className="py-4 px-6 align-top">
                                                    <p className="text-[#2C3E50] font-medium leading-relaxed whitespace-pre-wrap">
                                                        "{review.content}"
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                                        {review.menu_item && (
                                                            <MenuBadge menuItem={review.menu_item} />
                                                        )}
                                                        {review.receipt_number && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                🧾 Struk: #{review.receipt_number}
                                                            </span>
                                                        )}
                                                        {review.photo_url && (
                                                            <a
                                                                href={review.photo_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F5F1] text-[#1E6B65] border border-[#B2DFDB] hover:underline"
                                                            >
                                                                📷 Foto Bukti
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Kolom Tanggal */}
                                                <td className="py-4 px-4 align-top text-xs text-gray-600 whitespace-nowrap">
                                                    {formatDate(dateVal)}
                                                </td>

                                                {/* Kolom Sentimen */}
                                                <td className="py-4 px-4 align-top space-y-1">
                                                    <BadgeSentiment sentiment={review.sentiment} />
                                                    {review.is_edited_by_user ? (
                                                        <p className="text-[10px] text-gray-400 italic">
                                                            (Disesuaikan pemilik)
                                                        </p>
                                                    ) : null}
                                                </td>

                                                {/* Kolom Aksi */}
                                                <td className="py-4 px-6 align-middle text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Tombol Analisis AI: HANYA muncul jika belum dianalisis */}
                                                        {(!review.sentiment || review.sentiment === 'Belum Dianalisis') && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAnalyzeSingle(review.id)}
                                                                disabled={isSingleAnalyzing}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition disabled:opacity-50"
                                                                title="Jalankan Analisis AI Gemini"
                                                            >
                                                                {isSingleAnalyzing ? (
                                                                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                                                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                                                                    </svg>
                                                                )}
                                                                <span>Analisis AI</span>
                                                            </button>
                                                        )}

                                                        {/* Tombol Edit */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEdit(review)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#26A69A] text-white hover:bg-[#1E6B65] transition shadow-2xs"
                                                            title="Edit Ulasan"
                                                        >
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M12 20h9" />
                                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                            </svg>
                                                            <span>Edit</span>
                                                        </button>

                                                        {/* Tombol Hapus */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDelete(review)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 transition shadow-2xs"
                                                            title="Hapus Ulasan"
                                                        >
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                            </svg>
                                                            <span>Hapus</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-[#E8F5F1]">
                            {reviews.data.map((review) => {
                                const isSingleAnalyzing = analyzingId === review.id;
                                const dateVal = review.reviewed_at || review.review_date || review.created_at;

                                return (
                                    <div key={review.id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <BadgeSentiment sentiment={review.sentiment} size="sm" />
                                            <span className="text-[11px] text-gray-500">
                                                {formatDate(dateVal)}
                                            </span>
                                        </div>

                                        <p className="text-sm font-medium text-[#2C3E50] leading-relaxed">
                                            "{review.content}"
                                        </p>

                                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                                            {review.menu_item && (
                                                <MenuBadge menuItem={review.menu_item} />
                                            )}
                                            {review.receipt_number && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    🧾 Struk: #{review.receipt_number}
                                                </span>
                                            )}
                                            {review.photo_url && (
                                                <a
                                                    href={review.photo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F5F1] text-[#1E6B65] border border-[#B2DFDB] hover:underline"
                                                >
                                                    📷 Foto Bukti
                                                </a>
                                            )}
                                            {review.is_edited_by_user && (
                                                <span className="text-[10px] text-gray-400 italic">
                                                    (Disesuaikan pemilik)
                                                </span>
                                            )}
                                        </div>

                                        {/* Aksi Mobile */}
                                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                                            {(!review.sentiment || review.sentiment === 'Belum Dianalisis') && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAnalyzeSingle(review.id)}
                                                    disabled={isSingleAnalyzing}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-white flex items-center gap-1 shadow-2xs"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                                                    </svg>
                                                    <span>AI</span>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(review)}
                                                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#26A69A] text-white flex items-center gap-1 shadow-2xs"
                                            >
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDelete(review)}
                                                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white flex items-center gap-1 shadow-2xs"
                                            >
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Bar */}
                        {reviews.links && reviews.links.length > 3 && (
                            <div className="p-4 sm:p-5 bg-[#F9FBFA] border-t border-[#B2DFDB] flex items-center justify-between flex-wrap gap-3">
                                <p className="text-xs text-gray-500">
                                    Menampilkan {reviews.from || 0} - {reviews.to || 0} dari {reviews.total || 0} ulasan
                                </p>

                                <div className="flex items-center gap-1">
                                    {reviews.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className="px-3 py-1.5 text-xs text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed select-none"
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                                    link.active
                                                        ? 'bg-[#1E6B65] text-white shadow-xs'
                                                        : 'bg-white border border-[#B2DFDB] text-[#2C3E50] hover:bg-[#E8F5F1]'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL EDIT ULASAN */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl border-2 border-[#B2DFDB] p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E8F5F1] mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-[#2C3E50]">Edit Ulasan</h3>
                                <p className="text-xs text-gray-500">Ubah teks ulasan, sumber, tanggal, atau sesuaikan sentimen</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-[#E8F5F1] flex items-center justify-center text-gray-400 hover:text-[#2C3E50] transition"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            {/* Isi Ulasan */}
                            <div>
                                <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                                    Isi Ulasan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows="4"
                                    value={editForm.data.content}
                                    maxLength={1000}
                                    onChange={(e) => editForm.setData('content', e.target.value)}
                                    placeholder="Tuliskan ulasan pelanggan..."
                                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-[#B2DFDB] rounded-xl text-[#2C3E50] focus:bg-white focus:outline-none focus:border-[#26A69A] focus:ring-1 focus:ring-[#26A69A]"
                                    required
                                />
                                {editForm.errors.content && (
                                    <p className="text-xs text-red-600 mt-1">{editForm.errors.content}</p>
                                )}
                            </div>

                            {/* Menu Item & Tanggal Ulasan */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                                        Menu Terkait (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={100}
                                        value={editForm.data.menu_item}
                                        onChange={(e) => editForm.setData('menu_item', e.target.value)}
                                        placeholder="Contoh: Soto Ayam"
                                        className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-[#B2DFDB] rounded-xl text-[#2C3E50] focus:bg-white focus:outline-none focus:border-[#26A69A] focus:ring-1 focus:ring-[#26A69A]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                                        Tanggal Ulasan (Maksimal Hari Ini)
                                    </label>
                                    <input
                                        type="date"
                                        max={today}
                                        value={editForm.data.reviewed_at}
                                        onChange={(e) => editForm.setData('reviewed_at', e.target.value)}
                                        className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-[#B2DFDB] rounded-xl text-[#2C3E50] focus:bg-white focus:outline-none focus:border-[#26A69A] focus:ring-1 focus:ring-[#26A69A]"
                                    />
                                    {editForm.errors.reviewed_at && (
                                        <p className="text-xs text-red-600 mt-1">{editForm.errors.reviewed_at}</p>
                                    )}
                                </div>
                            </div>

                            {/* Pilihan Label Sentimen */}
                            <div>
                                <label className="block text-xs font-bold text-[#2C3E50] mb-2">
                                    Label Sentimen Ulasan
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Positif', 'Netral', 'Negatif'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                editForm.setData('sentiment', opt);
                                                editForm.setData('reanalyze', false);
                                            }}
                                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                                editForm.data.sentiment === opt
                                                    ? opt === 'Positif'
                                                        ? 'bg-[#26A69A] text-white border-[#26A69A] shadow-xs'
                                                        : opt === 'Negatif'
                                                        ? 'bg-[#1E6B65] text-white border-[#1E6B65] shadow-xs'
                                                        : 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-xs'
                                                    : 'bg-white border-[#B2DFDB] text-gray-700 hover:bg-[#E8F5F1]'
                                            }`}
                                        >
                                            <span>{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Checkbox Re-analyze AI */}
                            <div className="bg-[#E8F5F1] p-3.5 rounded-xl border border-[#B2DFDB] flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="reanalyze"
                                    checked={editForm.data.reanalyze}
                                    onChange={(e) => editForm.setData('reanalyze', e.target.checked)}
                                    className="w-4 h-4 text-[#26A69A] rounded border-gray-300 focus:ring-[#26A69A]"
                                />
                                <label htmlFor="reanalyze" className="text-xs text-[#2C3E50] font-medium cursor-pointer select-none">
                                    ✨ <strong>Analisis Ulang dengan AI Gemini</strong> (AI akan membaca kembali isi ulasan di atas secara otomatis)
                                </label>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-3 border-t border-[#E8F5F1] flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 border border-[#B2DFDB] text-gray-600 hover:bg-[#E8F5F1] rounded-xl text-xs sm:text-sm font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2 bg-[#26A69A] hover:bg-[#1E6B65] text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL HAPUS ULASAN */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Ulasan Ini?"
                message={`Ulasan "${deletingReview?.content?.substring(0, 60)}..." akan dihapus secara permanen dari daftar ulasan Anda.`}
                confirmText="Hapus Ulasan"
                cancelText="Batal"
                isLoading={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
