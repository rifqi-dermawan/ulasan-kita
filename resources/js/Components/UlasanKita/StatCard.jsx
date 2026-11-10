import React from 'react';
import BadgeSentiment from './BadgeSentiment';

export default function StatCard({
    sentiment = 'Netral',
    periodText = 'Minggu ini',
    count = 24,
    total = 30,
    label = 'ulasan',
    caption = 'Persentase ulasan minggu ini',
    className = '',
}) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className={`bg-white rounded-lg border border-[#B2DFDB] p-6 shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <BadgeSentiment sentiment={sentiment} />
                <span className="text-xs text-[#26A69A] font-medium hover:underline cursor-pointer">
                    {periodText}
                </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-extrabold text-[#2C3E50]">{count}</span>
                <span className="text-sm font-medium text-gray-500">{label}</span>
            </div>

            {/* Progress Bar dengan Mint Utama & background Mint Terang */}
            <div className="w-full bg-[#E8F5F1] rounded-full h-2.5 overflow-hidden mb-2">
                <div
                    className="bg-[#26A69A] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                />
            </div>

            <p className="text-xs text-gray-500">{caption}</p>
        </div>
    );
}
