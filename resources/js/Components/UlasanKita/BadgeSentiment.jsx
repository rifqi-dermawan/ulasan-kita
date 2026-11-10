import React from 'react';

export default function BadgeSentiment({ sentiment = 'Netral', size = 'md', className = '' }) {
    const s = sentiment?.toLowerCase() || 'netral';

    let config = {
        label: 'Netral',
        textColor: 'text-[#2C3E50]',
        icon: (
            // Garis 2px, 20px ikon datar / netral
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
        ),
    };

    if (s.includes('positif')) {
        config = {
            label: 'Positif',
            textColor: 'text-[#26A69A]',
            icon: (
                // Ikon jempol / senyum garis 2px 20px
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                </svg>
            ),
        };
    } else if (s.includes('negatif')) {
        config = {
            label: 'Negatif',
            textColor: 'text-[#1E6B65]',
            icon: (
                // Ikon sedih garis 2px 20px (tetap warna mint gelap sesuai tema tanpa merah)
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                </svg>
            ),
        };
    } else if (s.includes('belum')) {
        config = {
            label: 'Belum Dianalisis',
            textColor: 'text-amber-800',
            bg: 'bg-amber-50',
            border: 'border-amber-300',
            icon: (
                <svg className="w-4 h-4 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            ),
        };
    }

    const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full ${config.bg || 'bg-[#E8F5F1]'} border ${config.border || 'border-[#B2DFDB]'} font-medium ${config.textColor} ${sizeClasses} ${className}`}
        >
            {config.icon}
            <span>{config.label}</span>
        </span>
    );
}
