import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import HelpPanel from '@/Components/UlasanKita/HelpPanel';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const isEmailIncomplete = data.email.length > 0 && (!data.email.includes('@') || !data.email.includes('.'));

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#F9FBFA] flex flex-col lg:flex-row text-[#2C3E50] font-sans">
            <Head title="Masuk - UlasanKita" />

            {/* SISI KIRI (Branding & Fitur) */}
            <div className="lg:w-1/2 bg-[#E8F5F1] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#B2DFDB]">
                <div>
                    {/* Logo UlasanKita */}
                    <div className="flex items-center gap-3 mb-10 sm:mb-16">
                        <span className="w-10 h-10 rounded-xl bg-[#26A69A] flex items-center justify-center text-white shadow-xs">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </span>
                        <span className="font-extrabold text-2xl text-[#2C3E50] tracking-tight">
                            UlasanKita
                        </span>
                    </div>

                    {/* Headline Utama */}
                    <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#2C3E50] leading-[1.25] tracking-tight mb-8 max-w-lg">
                        Tahu apa kata pelanggan tanpa membaca satu per satu.
                    </h1>

                    {/* 3 Keunggulan Fitur */}
                    <div className="space-y-5 text-sm sm:text-base text-[#2C3E50] max-w-md">
                        <div className="flex items-start gap-3.5">
                            <svg className="w-6 h-6 text-[#26A69A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <p>
                                <strong>Tempel ulasan</strong> dari Google Maps, Instagram, atau kotak saran.
                            </p>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <svg className="w-6 h-6 text-[#26A69A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                                <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                            </svg>
                            <p>
                                <strong>AI menandai</strong> tiap ulasan: positif, netral, atau negatif.
                            </p>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <svg className="w-6 h-6 text-[#26A69A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                <polyline points="17 6 23 6 23 12" />
                            </svg>
                            <p>
                                <strong>Tiap minggu</strong>, keluhan utama dirangkum untuk Anda.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#B2DFDB]/60 text-xs text-gray-500">
                    Aplikasi ulasan ramah warung dan kedai kampus.
                </div>
            </div>

            {/* SISI KANAN (Form Card Login) */}
            <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-2xl border-2 border-[#B2DFDB] p-6 sm:p-8 shadow-soft">
                    
                    {/* Toggle Masuk / Daftar */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            className="w-full py-2.5 bg-[#1E6B65] text-white font-bold text-sm rounded-lg transition shadow-xs text-center"
                        >
                            Masuk
                        </button>
                        <Link
                            href={route('register')}
                            className="w-full py-2.5 bg-white border border-[#26A69A] hover:bg-[#E8F5F1] text-[#26A69A] font-bold text-sm rounded-lg transition text-center"
                        >
                            Daftar
                        </Link>
                    </div>

                    {/* Judul Form */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-[#2C3E50] tracking-tight">
                            Selamat datang kembali
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Masuk untuk melihat ulasan minggu ini.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 text-xs font-medium text-[#1E6B65] bg-[#E8F5F1] p-3 rounded-lg border border-[#B2DFDB]">
                            {status}
                        </div>
                    )}

                    {/* Banner Error Kredensial Tidak Valid */}
                    {errors.email && (
                        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in shadow-2xs">
                            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span className="font-semibold leading-relaxed">{errors.email}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Alamat Email */}
                        <div>
                            <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                                Alamat email <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="bu.sari@email.com"
                                className={`w-full rounded-lg border text-sm text-[#2C3E50] transition ${
                                    errors.email
                                        ? 'border-red-400 bg-red-50/20 focus:ring-red-500 focus:border-red-500'
                                        : isEmailIncomplete
                                        ? 'border-amber-400 bg-amber-50/20 focus:ring-amber-500 focus:border-amber-500'
                                        : 'border-[#B2DFDB] focus:ring-[#26A69A] focus:border-[#26A69A]'
                                }`}
                                autoFocus
                                required
                            />

                            {/* Peringatan Format Email saat mengetik */}
                            {!errors.email && isEmailIncomplete && (
                                <div className="flex items-start gap-1.5 text-xs text-amber-700 mt-1.5 font-medium leading-tight">
                                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                    <span>Alamat email belum lengkap (contoh: bu.sari@email.com)</span>
                                </div>
                            )}
                        </div>

                        {/* Kata Sandi dengan Tombol Tampilkan */}
                        <div>
                            <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                                Kata sandi <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`flex-1 rounded-lg border text-sm text-[#2C3E50] transition ${
                                        errors.password
                                            ? 'border-red-400 bg-red-50/20 focus:ring-red-500 focus:border-red-500'
                                            : 'border-[#B2DFDB] focus:ring-[#26A69A] focus:border-[#26A69A]'
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="px-3.5 py-2 border border-[#26A69A] hover:bg-[#E8F5F1] text-[#26A69A] text-xs font-semibold rounded-lg transition"
                                >
                                    {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5 font-medium">
                                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <span>{errors.password}</span>
                                </div>
                            )}

                            {canResetPassword && (
                                <div className="mt-1.5 text-right">
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-[#26A69A] hover:underline font-medium"
                                    >
                                        Lupa kata sandi?
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Tombol Submit Masuk */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-bold text-sm rounded-lg transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing && (
                                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                )}
                                <span>{processing ? 'Memproses...' : 'Masuk'}</span>
                            </button>
                        </div>
                    </form>

                </div>
            </div>

            {/* Floating Tombol Bantuan */}
            <HelpPanel defaultOpen={false} />
        </div>
    );
}
