import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Ulas({ kantin = {} }) {
    const { flash } = usePage().props;
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hasDismissedSuccess, setHasDismissedSuccess] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [submittedDetails, setSubmittedDetails] = useState({
        menu: '',
        rating: 0,
        time: '',
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        menu_item: '',
        rating: 5, // Default 5 bintang
        photo: null,
        content: '',
        hp_token: '', // Honeypot anti-spam bot
        device_id: '',
    });

    // Inisialisasi Device Token unik per perangkat
    useEffect(() => {
        try {
            let token = localStorage.getItem('ulasankita_device_id');
            if (!token) {
                token = 'dev_' + (typeof crypto !== 'undefined' && crypto.randomUUID 
                    ? crypto.randomUUID() 
                    : (Date.now().toString(36) + Math.random().toString(36).substring(2)));
                localStorage.setItem('ulasankita_device_id', token);
            }
            setData('device_id', token);
        } catch (err) {
            console.warn('LocalStorage error:', err);
        }
    }, []);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemovePhoto = () => {
        setData('photo', null);
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
            setPhotoPreview(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentMenu = data.menu_item;
        const currentRating = data.rating;
        const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

        post(route('kantin.ulas.store', kantin.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSubmittedDetails({
                    menu: currentMenu,
                    rating: currentRating,
                    time: currentTime,
                });
                setIsSubmitted(true);
                setHasDismissedSuccess(false);
                handleRemovePhoto();
                reset();
            },
        });
    };

    // Tombol "Kirim Ulasan Lainnya" me-reset tampilan kembali ke formulir tanpa macet
    const handleReset = () => {
        setIsSubmitted(false);
        setHasDismissedSuccess(true);
        handleRemovePhoto();
        reset();

        // Bersihkan state riwayat browser agar flash message tidak memicu tampilan sukses lagi
        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    const isContentValid = data.content.trim().length >= 5 && data.content.length <= 1000;
    const showSuccessView = isSubmitted || (flash?.success && !hasDismissedSuccess);

    const ratingLabels = {
        1: 'Sangat Kurang 😞',
        2: 'Kurang Pas 🙁',
        3: 'Cukup / Biasa Saja 😐',
        4: 'Enak & Puas 😊',
        5: 'Sangat Enak & Mantap! 🤩',
    };

    return (
        <div className="min-h-screen bg-[#F9FBFA] text-[#2C3E50] font-sans flex flex-col justify-between py-6 px-4 sm:px-6">
            <Head title={`Beri Ulasan - ${kantin.name || 'Kantin'}`} />

            {/* Header & Logo */}
            <div className="max-w-md w-full mx-auto text-center space-y-3 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F5F1] border border-[#B2DFDB] text-[#1E6B65] text-xs font-semibold shadow-2xs">
                    <svg className="w-4 h-4 text-[#26A69A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>UlasanKita • Jalur Pelanggan</span>
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3E50] tracking-tight">
                        {kantin.name || 'Kantin'}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Bagikan penilaian hidangan dan masukan Anda untuk peningkatan pelayanan
                    </p>
                </div>
            </div>

            {/* Content Card Mobile-First */}
            <div className="max-w-md w-full mx-auto my-6">
                {showSuccessView ? (
                    /* TAMPILAN SUKSES & LANGKAH KE SELANJUTNYA */
                    <div className="bg-white rounded-2xl border-2 border-[#B2DFDB] p-6 sm:p-8 shadow-sm text-center space-y-6 animate-in fade-in duration-300">
                        {/* Centang Animasi Sukses */}
                        <div className="w-16 h-16 bg-[#E8F5F1] text-[#26A69A] rounded-full mx-auto flex items-center justify-center shadow-xs">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        {/* Pesan Sukses */}
                        <div className="space-y-2">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C3E50]">
                                Ulasan Berhasil Terkirim!
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                {flash?.success || `Terima kasih banyak! Penilaian Anda langsung diterima oleh ${kantin.name || 'kantin'} untuk peningkatan kualitas hidangan.`}
                            </p>
                        </div>

                        {/* Ringkasan Singkat Ulasan yang Baru Dikirim */}
                        <div className="bg-[#F9FBFA] border border-[#B2DFDB] rounded-xl p-4 text-left space-y-2 text-xs">
                            <div className="flex items-center justify-between text-gray-500">
                                <span>Menu yang dinilai:</span>
                                <strong className="text-[#2C3E50] font-bold">
                                    {submittedDetails.menu || 'Pesanan Anda'}
                                </strong>
                            </div>
                            {submittedDetails.rating > 0 && (
                                <div className="flex items-center justify-between text-gray-500">
                                    <span>Rating kepuasan:</span>
                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                        {'★'.repeat(submittedDetails.rating)}
                                        <span className="text-[11px] text-gray-600 font-medium ml-1">
                                            ({submittedDetails.rating}/5)
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-gray-500 border-t border-gray-100 pt-2 text-[11px]">
                                <span>Waktu verifikasi:</span>
                                <span className="text-[#1E6B65] font-semibold">
                                    {submittedDetails.time || 'Baru saja'}
                                </span>
                            </div>
                        </div>

                        {/* LANGKAH KE SELANJUTNYA */}
                        <div className="space-y-3 pt-1">
                            {/* Tombol Utama: Tulis Ulasan Menu Lainnya */}
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full py-3.5 px-4 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 group"
                            >
                                <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                <span>Tulis Ulasan untuk Menu Lainnya</span>
                            </button>

                            {/* Kartu Apresiasi Kasir / Loyalty */}
                            <div className="p-3.5 bg-[#E8F5F1]/60 border border-dashed border-[#26A69A] rounded-xl text-xs text-[#1E6B65] flex items-center gap-2.5 text-left">
                                <span className="text-lg">🏷️</span>
                                <p className="leading-snug">
                                    <strong>Apresiasi Kantin:</strong> Tunjukkan layar ini ke kasir jika kantin memiliki promo diskon ulasan pembeli!
                                </p>
                            </div>
                        </div>

                        <p className="text-[11px] text-gray-400">
                            Selamat menikmati santapan Anda dan semoga harimu menyenangkan! ✨
                        </p>
                    </div>
                ) : (
                    /* FORM INPUT ULASAN PELANGGAN */
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl border-2 border-[#B2DFDB] p-6 sm:p-7 shadow-sm space-y-5"
                    >
                        {/* Peringatan Pembatasan Perangkat / Cooldown / Rate Limit */}
                        {(errors.device_id || flash?.error) && (
                            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                                <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="font-bold">Perhatian</p>
                                    <p className="mt-0.5 leading-relaxed">
                                        {errors.device_id || flash?.error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Honeypot Field (Tersembunyi dari manusia, untuk memancing bot spam) */}
                        <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                            <label htmlFor="hp_token">Leave this field blank</label>
                            <input
                                id="hp_token"
                                type="text"
                                name="hp_token"
                                tabIndex={-1}
                                autoComplete="off"
                                value={data.hp_token}
                                onChange={(e) => setData('hp_token', e.target.value)}
                            />
                        </div>

                        {/* PILIHAN RATING BINTANG 1 - 5 */}
                        <div className="space-y-2 text-center pb-1">
                            <label className="block text-xs sm:text-sm font-bold text-[#2C3E50]">
                                Bagaimana Kepuasan Anda? <span className="text-red-500">*</span>
                            </label>
                            
                            {/* Deretan 5 Bintang Interaktif */}
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const active = (hoverRating || data.rating) >= star;
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('rating', star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="text-3xl sm:text-4xl transition-transform hover:scale-125 focus:outline-none p-1 cursor-pointer"
                                            aria-label={`Rating ${star} bintang`}
                                        >
                                            <span className={active ? 'text-amber-400 drop-shadow-xs' : 'text-gray-300'}>
                                                ★
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Label Deskripsi Rating */}
                            <p className="text-xs font-semibold text-[#1E6B65]">
                                {ratingLabels[hoverRating || data.rating] || 'Pilih Bintang'}
                            </p>
                        </div>

                        {/* Input Menu yang Dipesan */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="menu_item"
                                className="block text-xs sm:text-sm font-bold text-[#2C3E50]"
                            >
                                Makanan / Minuman yang Dinilai <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
                            </label>
                            <input
                                id="menu_item"
                                type="text"
                                maxLength={100}
                                value={data.menu_item}
                                onChange={(e) => setData('menu_item', e.target.value)}
                                placeholder="Contoh: Ayam Katsu, Es Teh Manis, Nasi Goreng"
                                className="w-full px-3.5 py-2.5 bg-[#F9FBFA] border border-gray-200 rounded-xl text-sm text-[#2C3E50] placeholder-gray-400 focus:outline-none focus:border-[#26A69A] focus:ring-1 focus:ring-[#26A69A] transition"
                            />
                            {errors.menu_item && (
                                <p className="text-xs text-red-500 font-medium">{errors.menu_item}</p>
                            )}
                        </div>

                        {/* Textarea Ulasan */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="content"
                                    className="block text-xs sm:text-sm font-bold text-[#2C3E50]"
                                >
                                    Ulasan & Pengalaman Anda <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-[11px] ${data.content.length > 1000 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                    {data.content.length}/1000 karakter
                                </span>
                            </div>
                            <textarea
                                id="content"
                                rows={3}
                                required
                                maxLength={1000}
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                placeholder="Ceritakan rasa masakan, porsi, kebersihan, atau pelayanan staf..."
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

                        {/* Upload Foto Makanan (Opsional) */}
                        <div className="space-y-1.5">
                            <label className="block text-xs sm:text-sm font-bold text-[#2C3E50]">
                                Foto Makanan / Minuman <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
                            </label>

                            {photoPreview ? (
                                <div className="relative inline-block mt-1">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-24 h-24 object-cover rounded-xl border-2 border-[#26A69A] shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow transition cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#B2DFDB] hover:border-[#26A69A] rounded-xl cursor-pointer bg-[#F9FBFA] hover:bg-[#E8F5F1]/30 transition group">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 group-hover:text-[#1E6B65] font-medium">
                                        <svg className="w-5 h-5 text-[#26A69A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                        <span>Ambil foto hidangan atau pilih dari galeri</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, atau WebP (Maks. 5 MB)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoChange}
                                    />
                                </label>
                            )}
                            {errors.photo && (
                                <p className="text-xs text-red-500 font-medium">{errors.photo}</p>
                            )}
                        </div>

                        {/* Tombol Kirim Lebar Penuh dengan Status Loading */}
                        <button
                            type="submit"
                            disabled={processing || !isContentValid}
                            className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                                processing || !isContentValid
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#26A69A] hover:bg-[#1E6B65] text-white shadow-sm'
                            }`}
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    <span>Mengirim ulasan...</span>
                                </>
                            ) : (
                                <span>Kirim Penilaian Sekarang</span>
                            )}
                        </button>
                    </form>
                )}
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 space-y-1 pb-2">
                <p>Didukung oleh <strong className="text-[#26A69A]">UlasanKita</strong></p>
                <p>Solusi Manajemen Kepuasan Pelanggan Kantin & UMKM</p>
            </div>
        </div>
    );
}