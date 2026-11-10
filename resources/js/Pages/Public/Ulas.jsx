import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Ulas({ kantin = {} }) {
    const { flash } = usePage().props;
    const [submitted, setSubmitted] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        menu_item: '',
        receipt_number: '',
        photo: null,
        content: '',
        hp_token: '', // Honeypot anti-spam bot
        device_id: '',
    });

    // Inisialisasi Device Token unik per perangkat (pengganti MAC Address di web)
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
        post(route('kantin.ulas.store', kantin.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSubmitted(true);
                handleRemovePhoto();
                reset();
            },
        });
    };

    const handleReset = () => {
        setSubmitted(false);
        handleRemovePhoto();
        reset();
    };

    const isContentValid = data.content.trim().length >= 5 && data.content.length <= 1000;

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
                        Bagikan ulasan dan masukan Anda untuk peningkatan pelayanan kami
                    </p>
                </div>
            </div>

            {/* Content Card Mobile-First */}
            <div className="max-w-md w-full mx-auto my-6">
                {submitted || flash?.success ? (
                    /* Kartu Terima Kasih */
                    <div className="bg-white rounded-2xl border-2 border-[#B2DFDB] p-6 sm:p-8 shadow-sm text-center space-y-5 animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-[#E8F5F1] text-[#26A69A] rounded-full mx-auto flex items-center justify-center shadow-2xs">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-extrabold text-[#2C3E50]">
                                Terima Kasih Banyak!
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                {flash?.success || `Ulasan Anda berhasil dikirim ke ${kantin.name || 'kantin'}. Masukan Anda sangat berharga bagi kami untuk menyajikan layanan yang lebih baik!`}
                            </p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full py-3 px-4 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-semibold text-sm rounded-xl shadow-xs transition"
                            >
                                Kirim Ulasan Lainnya
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form Input Ulasan Pelanggan */
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
                                    <p className="font-bold">Batas Pengiriman Ulasan</p>
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

                        {/* Input Menu yang Dipesan (Opsional) */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="menu_item"
                                className="block text-xs sm:text-sm font-bold text-[#2C3E50]"
                            >
                                Menu yang Dipesan <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
                            </label>
                            <input
                                id="menu_item"
                                type="text"
                                maxLength={100}
                                value={data.menu_item}
                                onChange={(e) => setData('menu_item', e.target.value)}
                                placeholder="Contoh: Nasi Goreng Spesial, Es Jeruk Manis"
                                className="w-full px-3.5 py-2.5 bg-[#F9FBFA] border border-gray-200 rounded-xl text-sm text-[#2C3E50] placeholder-gray-400 focus:outline-none focus:border-[#26A69A] focus:ring-1 focus:ring-[#26A69A] transition"
                            />
                            {errors.menu_item && (
                                <p className="text-xs text-red-500 font-medium">{errors.menu_item}</p>
                            )}
                        </div>

                        {/* Input Nomor Struk / ID Pesanan (Verifikasi Pembelian Seperti Google Maps) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="receipt_number"
                                    className="block text-xs sm:text-sm font-bold text-[#2C3E50]"
                                >
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
                            {errors.receipt_number ? (
                                <p className="text-xs text-red-500 font-medium">{errors.receipt_number}</p>
                            ) : (
                                <p className="text-[11px] text-gray-500">
                                    1 nomor struk hanya berlaku untuk 1 ulasan agar ulasan Anda terverifikasi riil.
                                </p>
                            )}
                        </div>

                        {/* Upload Foto Makanan / Struk (Opsional) */}
                        <div className="space-y-1.5">
                            <label className="block text-xs sm:text-sm font-bold text-[#2C3E50]">
                                Foto Makanan / Bukti Struk <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
                            </label>

                            {photoPreview ? (
                                <div className="relative inline-block mt-1">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-28 h-28 object-cover rounded-xl border-2 border-[#26A69A] shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#B2DFDB] hover:border-[#26A69A] rounded-xl cursor-pointer bg-[#F9FBFA] hover:bg-[#E8F5F1]/30 transition group">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 group-hover:text-[#1E6B65] font-medium">
                                        <svg className="w-5 h-5 text-[#26A69A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                        <span>Ambil foto atau pilih dari galeri</span>
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
                                rows={4}
                                required
                                maxLength={1000}
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                placeholder="Ceritakan rasa hidangan, porsi, kebersihan, atau keramahan staf..."
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

                        {/* Info Pelanggan */}
                        <div className="bg-[#E8F5F1] rounded-xl p-3 border border-[#B2DFDB] flex items-start gap-2.5 text-xs text-[#1E6B65]">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <p className="leading-relaxed">
                                Ulasan Anda diverifikasi secara otomatis dan dianalisis untuk membantu kantin meningkatkan mutu pelayanan.
                            </p>
                        </div>

                        {/* Tombol Kirim Lebar Penuh dengan Status Loading */}
                        <button
                            type="submit"
                            disabled={processing || !isContentValid}
                            className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 ${
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
                                    <span>Mengirim & memverifikasi ulasan...</span>
                                </>
                            ) : (
                                <span>Kirim Ulasan Sekarang</span>
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
