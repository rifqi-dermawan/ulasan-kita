import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import HelpPanel from '@/Components/UlasanKita/HelpPanel';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const navItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
        },
        {
            name: 'Ulasan',
            href: route('ulasan.index'),
            active: route().current('ulasan.index'),
            icon: (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            ),
        },
        {
            name: 'Tambah Ulasan',
            href: route('ulasan.create'),
            active: route().current('ulasan.create'),
            icon: (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#F9FBFA] text-[#2C3E50] font-sans flex flex-col lg:flex-row pb-20 lg:pb-0">
            
            {/* DESKTOP SIDEBAR (Sesuai Gambar 3 & Gambar 5) */}
            <aside className="print:hidden hidden lg:flex w-64 shrink-0 bg-[#E8F5F1] min-h-screen border-r border-[#B2DFDB] p-6 flex-col justify-between sticky top-0 h-screen overflow-y-auto">
                <div className="space-y-8">
                    {/* Brand Logo UlasanKita */}
                    <Link href={route('dashboard')} className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-[#26A69A] flex items-center justify-center text-white shadow-xs">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </span>
                        <span className="font-extrabold text-xl text-[#2C3E50] tracking-tight">
                            UlasanKita
                        </span>
                    </Link>

                    {/* Menu Navigasi Utama */}
                    <nav className="space-y-1.5">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                                    item.active
                                        ? 'bg-[#1E6B65] text-white shadow-xs'
                                        : 'text-[#2C3E50] hover:bg-[#B2DFDB]/40'
                                }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Bagian Bawah Sidebar (Profil & Logout) */}
                <div className="pt-6 border-t border-[#B2DFDB] space-y-3">
                    <div>
                        <p className="font-bold text-sm text-[#2C3E50] truncate">
                            {user?.name || 'Kantin Bu Sari'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                        </p>
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#1E6B65] transition w-full text-left"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Keluar</span>
                    </Link>
                </div>
            </aside>

            {/* MOBILE TOP BAR */}
            <div className="print:hidden lg:hidden bg-white border-b border-[#B2DFDB] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
                <Link href={route('dashboard')} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#26A69A] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </span>
                    <span className="font-extrabold text-base text-[#2C3E50]">
                        UlasanKita
                    </span>
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1E6B65] bg-[#E8F5F1] px-2.5 py-1 rounded-full border border-[#B2DFDB]">
                        {user?.name || 'Kantin Bu Sari'}
                    </span>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {header && (
                    <header className="px-4 sm:px-8 pt-6 pb-2">
                        {header}
                    </header>
                )}

                <main className="flex-1">
                    {children}
                </main>
            </div>

            {/* MOBILE BOTTOM NAVIGATION BAR (Sesuai Gambar 2 & Gambar 4) */}
            <nav className="print:hidden lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#B2DFDB] shadow-lg flex items-center justify-around py-2 px-1">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[10px] font-medium transition ${
                            item.active
                                ? 'bg-[#1E6B65] text-white px-3'
                                : 'text-gray-600 hover:text-[#26A69A]'
                        }`}
                    >
                        {item.icon}
                        <span className="mt-0.5 truncate max-w-[60px]">{item.name}</span>
                    </Link>
                ))}

                {/* Logout Button on Mobile */}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex flex-col items-center justify-center px-2 py-1 text-gray-500 hover:text-[#1E6B65] text-[10px]"
                >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="mt-0.5">Keluar</span>
                </Link>
            </nav>

            {/* Floating Tombol Bantuan (Pojok kanan bawah sesuai Gambar 2, 3, 4, 5) */}
            <HelpPanel defaultOpen={false} />
        </div>
    );
}
