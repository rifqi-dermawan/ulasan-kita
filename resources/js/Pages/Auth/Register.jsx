import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import HelpPanel from '@/Components/UlasanKita/HelpPanel';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-[#F9FBFA] flex flex-col lg:flex-row text-[#2C3E50] font-sans">
            <Head title="Daftar - UlasanKita" />

            {/* SISI KIRI (Branding & Fitur) */}
            <div className="lg:w-1/2 bg-[#E8F5F1] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#B2DFDB]">
                <div>
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

                    <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#2C3E50] leading-[1.25] tracking-tight mb-8 max-w-lg">
                        Mulai dengarkan pelanggan warung Anda dengan mudah.
                    </h1>

                    <div className="space-y-5 text-sm sm:text-base text-[#2C3E50] max-w-md">
                        <div className="flex items-start gap-3.5">
                            <svg className="w-6 h-6 text-[#26A69A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <p>
                                <strong>Daftar gratis</strong> untuk warung makan, kedai kopi, atau usaha kampus.
                            </p>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <svg className="w-6 h-6 text-[#26A69A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                            </svg>
                            <p>
                                <strong>Deteksi sentimen otomatis</strong> positif, netral, dan negatif tanpa ribet.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#B2DFDB]/60 text-xs text-gray-500">
                    Aplikasi ulasan ramah warung dan kedai kampus.
                </div>
            </div>

            {/* SISI KANAN (Form Card Register) */}
            <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-2xl border-2 border-[#B2DFDB] p-6 sm:p-8 shadow-soft">
                    
                    {/* Toggle Masuk / Daftar */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <Link
                            href={route('login')}
                            className="w-full py-2.5 bg-white border border-[#26A69A] hover:bg-[#E8F5F1] text-[#26A69A] font-bold text-sm rounded-lg transition text-center"
                        >
                            Masuk
                        </Link>
                        <button
                            type="button"
                            className="w-full py-2.5 bg-[#1E6B65] text-white font-bold text-sm rounded-lg transition shadow-xs text-center"
                        >
                            Daftar
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-[#2C3E50] tracking-tight">
                            Buat Akun Baru
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Daftarkan kedai atau warung Anda dalam hitungan detik.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Nama Kedai / Pemilik */}
                        <div>
                            <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                                Nama Warung / Pemilik
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Kantin Bu Sari"
                                className="w-full rounded-lg border border-[#B2DFDB] focus:ring-[#26A69A] focus:border-[#26A69A] text-sm text-[#2C3E50]"
                                required
                            />
                            {errors.name && <p className="text-xs text-[#1E6B65] mt-1">{errors.name}</p>}
                        </div>

                        {/* Alamat Email */}
                        <div>
                            <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                                Alamat email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="bu.sari@email.com"
                                className="w-full rounded-lg border border-[#B2DFDB] focus:ring-[#26A69A] focus:border-[#26A69A] text-sm text-[#2C3E50]"
                                required
                            />
                            {errors.email && <p className="text-xs text-[#1E6B65] mt-1">{errors.email}</p>}
                        </div>

                        {/* Kata Sandi */}
                        <div>
                            <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                                Kata sandi
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="flex-1 rounded-lg border border-[#B2DFDB] focus:ring-[#26A69A] focus:border-[#26A69A] text-sm text-[#2C3E50]"
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
                            {errors.password && <p className="text-xs text-[#1E6B65] mt-1">{errors.password}</p>}
                        </div>

                        {/* Konfirmasi Kata Sandi */}
                        <div>
                            <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                                Ulangi kata sandi
                            </label>
                            <input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-[#B2DFDB] focus:ring-[#26A69A] focus:border-[#26A69A] text-sm text-[#2C3E50]"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-bold text-sm rounded-lg transition shadow-xs disabled:opacity-50"
                            >
                                {processing ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                            </button>
                        </div>
                    </form>

                </div>
            </div>

            <HelpPanel defaultOpen={false} />
        </div>
    );
}
