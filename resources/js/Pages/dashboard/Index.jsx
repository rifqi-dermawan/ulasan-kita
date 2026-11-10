import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePoll } from '@inertiajs/react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    LabelList,
} from 'recharts';

function CustomComplaintTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
            <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-[#B2DFDB] text-xs space-y-1 z-50">
                <div className="flex items-center gap-1.5 font-bold text-[#2C3E50]">
                    <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: item.fill }}
                    />
                    <span>{item.fullTitle}</span>
                </div>
                <div className="text-gray-500 text-[11px] pl-4">
                    Peringkat: <strong className="text-[#2C3E50]">{item.rank}</strong> • Jumlah: <strong className="text-[#1E6B65]">{item.count} ulasan</strong>
                </div>
            </div>
        );
    }
    return null;
}

export default function Dashboard({
    auth,
    totalReviews = 0,
    stats = {
        positif: 0,
        positifPercentage: 0,
        netral: 0,
        netralPercentage: 0,
        negatif: 0,
        negatifPercentage: 0,
        unanalyzed: 0,
    },
    weeklyTrend = [],
    topComplaints = [],
    dateRangeText = '',
}) {
    // Auto-update dashboard secara live real-time setiap 3 detik
    usePoll(3000);

    // Perhitungan Koordinat Dinamis Grafik Garis SVG
    const xCoordinates = [60, 130, 200, 270, 340, 400];
    const maxVal = Math.max(
        ...weeklyTrend.map((w) => Math.max(w.positif, w.netral, w.negatif)),
        5 // Skala minimum agar garis tetap proporsional
    );

    // SVG Y: 25 (puncak) hingga 170 (dasar sumbu X)
    const getY = (val) => {
        const numericVal = Number(val) || 0;
        return 170 - Math.round((numericVal / maxVal) * 145);
    };

    const posPoints = weeklyTrend.map((w, i) => `${xCoordinates[i]},${getY(w.positif)}`).join(' ');
    const netPoints = weeklyTrend.map((w, i) => `${xCoordinates[i]},${getY(w.netral)}`).join(' ');
    const negPoints = weeklyTrend.map((w, i) => `${xCoordinates[i]},${getY(w.negatif)}`).join(' ');

    const maxComplaintCount = Math.max(...topComplaints.map((c) => c.count), 1);

    const complaintColors = ['#1E6B65', '#26A69A', '#4DB6AC'];
    const complaintsChartData = topComplaints.map((c, idx) => {
        const truncated = c.title.length > 15 ? c.title.slice(0, 14) + '…' : c.title;
        return {
            rank: `#${idx + 1}`,
            name: `#${idx + 1} ${truncated}`,
            fullTitle: c.title,
            count: c.count,
            fill: complaintColors[idx % complaintColors.length],
        };
    });

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard - UlasanKita" />

            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
                
                {/* Header & Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
                            <span className="text-[#26A69A]">Beranda</span>
                            <span>&gt;</span>
                            <span className="text-[#2C3E50]">Dashboard</span>
                        </nav>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3E50] tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {dateRangeText || 'Ringkasan performa ulasan kantin Anda'} (Total {totalReviews} ulasan)
                        </p>
                    </div>

                    <Link
                        href={route('ulasan.create')}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-bold text-sm rounded-lg shadow-xs transition"
                    >
                        <span>+</span>
                        <span>Tambah Ulasan</span>
                    </Link>
                </div>

                {/* 3 STAT CARDS (Sesuai Jumlah Data Asli di Ulasan) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Card 1: Positif */}
                    <div className="bg-white rounded-2xl border border-[#B2DFDB] p-5 sm:p-6 shadow-soft space-y-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#26A69A] text-white text-xs font-semibold shadow-2xs">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                </svg>
                                <span>Positif</span>
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-[#2C3E50]">
                                {stats.positif}
                            </span>
                            <span className="text-sm font-medium text-gray-500">ulasan</span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="w-full bg-[#E8F5F1] rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-[#26A69A] h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(stats.positifPercentage, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {stats.positifPercentage}% • pelanggan senang
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Netral */}
                    <div className="bg-white rounded-2xl border border-[#B2DFDB] p-5 sm:p-6 shadow-soft space-y-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F1] border border-[#26A69A] text-[#26A69A] text-xs font-semibold">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                                <span>Netral</span>
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-[#2C3E50]">
                                {stats.netral}
                            </span>
                            <span className="text-sm font-medium text-gray-500">ulasan</span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="w-full bg-[#E8F5F1] rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-[#26A69A] h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(stats.netralPercentage, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {stats.netralPercentage}% • biasa saja, tidak memuji dan tidak mengeluh
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Negatif */}
                    <div className="bg-white rounded-2xl border border-[#B2DFDB] p-5 sm:p-6 shadow-soft space-y-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F1] border border-[#1E6B65] text-[#1E6B65] text-xs font-semibold">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                                </svg>
                                <span>Negatif</span>
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-[#2C3E50]">
                                {stats.negatif}
                            </span>
                            <span className="text-sm font-medium text-gray-500">ulasan</span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="w-full bg-[#E8F5F1] rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="bg-[#1E6B65] h-2.5 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(stats.negatifPercentage, 100)}%`,
                                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 6px)'
                                    }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {stats.negatifPercentage}% • pelanggan mengeluh
                            </p>
                        </div>
                    </div>

                </div>

                {/* DUA CARD BAWAH: TREN MINGGUAN & 3 KELUHAN TERATAS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* 1. TREN MINGGUAN */}
                    <div className="bg-white rounded-2xl border border-[#B2DFDB] p-5 sm:p-6 shadow-soft space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h3 className="font-bold text-base sm:text-lg text-[#2C3E50]">
                                    Tren mingguan
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                    Total {totalReviews} ulasan • Pantau perkembangan ulasan tiap pekan
                                </p>
                            </div>
                            {weeklyTrend[weeklyTrend.length - 1] && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E8F5F1] text-xs font-semibold text-[#1E6B65] border border-[#B2DFDB] self-start sm:self-auto shadow-2xs">
                                    <span className="text-[#2C3E50]">Minggu Ini:</span>
                                    <span className="text-[#26A69A]">● {weeklyTrend[weeklyTrend.length - 1].positif} Positif</span>
                                    <span className="text-[#26A69A]">■ {weeklyTrend[weeklyTrend.length - 1].netral} Netral</span>
                                    <span className="text-[#1E6B65]">▲ {weeklyTrend[weeklyTrend.length - 1].negatif} Negatif</span>
                                </div>
                            )}
                        </div>

                        {/* Grafik Garis Dinamis SVG */}
                        <div className="pt-2">
                            <div className="relative h-60 w-full">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 450 215">
                                    {/* Grid Lines */}
                                    <line x1="40" y1="25" x2="430" y2="25" stroke="#E8F5F1" strokeWidth="1" />
                                    <text x="15" y="29" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">{maxVal}</text>
                                    
                                    <line x1="40" y1="73" x2="430" y2="73" stroke="#E8F5F1" strokeWidth="1" />
                                    <text x="15" y="77" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">{Math.round(maxVal * 0.66)}</text>

                                    <line x1="40" y1="121" x2="430" y2="121" stroke="#E8F5F1" strokeWidth="1" />
                                    <text x="15" y="125" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">{Math.round(maxVal * 0.33)}</text>

                                    <line x1="40" y1="170" x2="430" y2="170" stroke="#E8F5F1" strokeWidth="1" />
                                    <text x="22" y="174" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">0</text>

                                    {/* Garis pemandu vertikal kolom minggu ini */}
                                    <line
                                        x1={xCoordinates[xCoordinates.length - 1]}
                                        y1="25"
                                        x2={xCoordinates[xCoordinates.length - 1]}
                                        y2="170"
                                        stroke="#26A69A"
                                        strokeWidth="1"
                                        strokeDasharray="2,3"
                                        opacity="0.4"
                                    />

                                    {/* Line 1: Positif (Garis tebal, bulat) */}
                                    <polyline
                                        fill="none"
                                        stroke="#26A69A"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={posPoints}
                                    />
                                    {weeklyTrend.map((w, i) => (
                                        <g key={`pos-${i}`}>
                                            <circle
                                                cx={xCoordinates[i]}
                                                cy={getY(w.positif)}
                                                r={i === weeklyTrend.length - 1 ? 5 : 4}
                                                fill="#26A69A"
                                            />
                                            {w.positif > 0 && (
                                                <text
                                                    x={xCoordinates[i]}
                                                    y={getY(w.positif) - 8}
                                                    textAnchor="middle"
                                                    fill="#26A69A"
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                >
                                                    {w.positif}
                                                </text>
                                            )}
                                        </g>
                                    ))}

                                    {/* Line 2: Netral (Putus-putus, kotak) */}
                                    <polyline
                                        fill="none"
                                        stroke="#26A69A"
                                        strokeWidth="2"
                                        strokeDasharray="4,4"
                                        points={netPoints}
                                    />
                                    {weeklyTrend.map((w, i) => (
                                        <g key={`net-${i}`}>
                                            <rect
                                                x={xCoordinates[i] - (i === weeklyTrend.length - 1 ? 4.5 : 3.5)}
                                                y={getY(w.netral) - (i === weeklyTrend.length - 1 ? 4.5 : 3.5)}
                                                width={i === weeklyTrend.length - 1 ? 9 : 7}
                                                height={i === weeklyTrend.length - 1 ? 9 : 7}
                                                fill="#26A69A"
                                            />
                                            {w.netral > 0 && (
                                                <text
                                                    x={xCoordinates[i]}
                                                    y={getY(w.netral) - 8}
                                                    textAnchor="middle"
                                                    fill="#26A69A"
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                >
                                                    {w.netral}
                                                </text>
                                            )}
                                        </g>
                                    ))}

                                    {/* Line 3: Negatif (Garis gelap, segitiga) */}
                                    <polyline
                                        fill="none"
                                        stroke="#1E6B65"
                                        strokeWidth="2"
                                        points={negPoints}
                                    />
                                    {weeklyTrend.map((w, i) => {
                                        const x = xCoordinates[i];
                                        const y = getY(w.negatif);
                                        const size = i === weeklyTrend.length - 1 ? 5 : 4;
                                        return (
                                            <g key={`neg-${i}`}>
                                                <polygon
                                                    points={`${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`}
                                                    fill="#1E6B65"
                                                />
                                                {w.negatif > 0 && (
                                                    <text
                                                        x={x}
                                                        y={y - 8}
                                                        textAnchor="middle"
                                                        fill="#1E6B65"
                                                        fontSize="10"
                                                        fontWeight="bold"
                                                    >
                                                        {w.negatif}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}

                                    {/* Sumbu X (Label Minggu & Rentang Tanggal) */}
                                    {weeklyTrend.map((w, i) => {
                                        const isCurrent = i === weeklyTrend.length - 1;
                                        return (
                                            <g key={`lbl-${i}`}>
                                                <text
                                                    x={xCoordinates[i]}
                                                    y="188"
                                                    textAnchor="middle"
                                                    fill={isCurrent ? "#1E6B65" : "#4B5563"}
                                                    fontSize={isCurrent ? "11" : "10"}
                                                    fontWeight={isCurrent ? "bold" : "600"}
                                                    fontFamily="sans-serif"
                                                >
                                                    {w.label}
                                                </text>
                                                <text
                                                    x={xCoordinates[i]}
                                                    y="201"
                                                    textAnchor="middle"
                                                    fill={isCurrent ? "#26A69A" : "#9CA3AF"}
                                                    fontSize="8.5"
                                                    fontWeight={isCurrent ? "bold" : "normal"}
                                                    fontFamily="sans-serif"
                                                >
                                                    {w.range || w.label}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#2C3E50] pt-4 border-t border-[#E8F5F1]">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#26A69A]"></span>
                                        <span className="font-medium">Positif (garis tebal, bulat)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 border-2 border-[#26A69A] bg-transparent"></span>
                                        <span className="font-medium">Netral (putus-putus, kotak)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 bg-[#1E6B65] text-[10px] leading-none text-white flex items-center justify-center">▲</span>
                                        <span className="font-medium">Negatif (garis gelap, segitiga)</span>
                                    </div>
                                </div>
                                <div className="text-[11px] text-gray-500 font-medium">
                                    Total ulasan: <strong className="text-[#1E6B65]">{totalReviews}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. 3 KELUHAN TERATAS MINGGU INI */}
                    <div className="bg-white rounded-2xl border border-[#B2DFDB] p-5 sm:p-6 shadow-soft space-y-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-base sm:text-lg text-[#2C3E50]">
                                    3 keluhan teratas minggu ini
                                </h3>
                                {topComplaints.length > 0 && (
                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#E8F5F1] text-[#1E6B65] border border-[#B2DFDB]">
                                        {topComplaints.reduce((acc, c) => acc + c.count, 0)} Total Keluhan
                                    </span>
                                )}
                            </div>

                            {topComplaints.length === 0 ? (
                                <div className="p-8 text-center bg-[#E8F5F1]/40 rounded-xl border border-[#B2DFDB] space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-[#26A69A] text-white flex items-center justify-center mx-auto shadow-xs">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-sm text-[#2C3E50]">
                                        Belum Ada Keluhan Tercatat
                                    </h4>
                                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                        Semua ulasan yang masuk saat ini berstatus positif atau netral. Pelayanan Anda berjalan baik!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Recharts Horizontal Bar Chart */}
                                    <div className="w-full h-48 min-h-[190px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                layout="vertical"
                                                data={complaintsChartData}
                                                margin={{ top: 10, right: 50, left: 0, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8F5F1" />
                                                <XAxis
                                                    type="number"
                                                    allowDecimals={false}
                                                    stroke="#9CA3AF"
                                                    fontSize={11}
                                                    tickLine={false}
                                                    axisLine={{ stroke: '#B2DFDB' }}
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={105}
                                                    stroke="#2C3E50"
                                                    fontSize={11}
                                                    fontWeight={600}
                                                    tickLine={false}
                                                    axisLine={{ stroke: '#B2DFDB' }}
                                                />
                                                <Tooltip content={<CustomComplaintTooltip />} />
                                                <Bar
                                                    dataKey="count"
                                                    radius={[0, 8, 8, 0]}
                                                    barSize={20}
                                                    animationDuration={800}
                                                >
                                                    {complaintsChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                    <LabelList
                                                        dataKey="count"
                                                        position="right"
                                                        formatter={(val) => `${val} ulasan`}
                                                        style={{ fill: '#1E6B65', fontSize: '11px', fontWeight: 700 }}
                                                    />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Tautan ke ulasan terkait */}
                                    <div className="space-y-2 pt-3 border-t border-[#E8F5F1]">
                                        {topComplaints.map((complaint, index) => (
                                            <div key={index} className="flex items-center justify-between text-xs py-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span
                                                        className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[10px] shrink-0"
                                                        style={{ backgroundColor: complaintColors[index % complaintColors.length] }}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-semibold text-[#2C3E50] truncate" title={complaint.title}>
                                                        {complaint.title}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={route('ulasan.index', { search: complaint.title })}
                                                    className="text-[#26A69A] hover:text-[#1E6B65] hover:underline font-semibold shrink-0 ml-2"
                                                >
                                                    Lihat {complaint.count} ulasan &rarr;
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tombol Baca Ringkasan Lengkap */}
                        <div className="pt-2">
                            <Link
                                href={route('ulasan.index')}
                                className="w-full py-2.5 border-2 border-[#26A69A] hover:bg-[#E8F5F1] text-[#26A69A] font-bold text-sm rounded-lg transition text-center block shadow-2xs"
                            >
                                Baca Ringkasan Lengkap
                            </Link>
                        </div>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}
