import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

export default function QrLinkCard({
    url,
    kantinName = 'Kantin',
    title = 'Kartu QR Ulasan Pelanggan',
    description = 'Pelanggan dapat memindai QR code ini di meja atau kasir untuk langsung membuka formulir ulasan.',
}) {
    const [copied, setCopied] = useState(false);
    const canvasContainerRef = useRef(null);

    const handleCopy = () => {
        if (!url) return;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const handleDownloadPng = () => {
        if (!canvasContainerRef.current) return;
        const canvas = canvasContainerRef.current.querySelector('canvas');
        if (!canvas) return;

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        const safeName = kantinName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-');
        downloadLink.download = `qr-ulasan-${safeName || 'kantin'}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white rounded-2xl border-2 border-[#B2DFDB] p-6 shadow-sm space-y-5">
            {/* Header Kartu */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8F5F1] pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#26A69A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            QR
                        </span>
                        <h3 className="font-extrabold text-base sm:text-lg text-[#2C3E50]">
                            {title}
                        </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {description}
                    </p>
                </div>
                <span className="inline-flex self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5F1] text-[#1E6B65] border border-[#B2DFDB]">
                    {kantinName}
                </span>
            </div>

            {/* Area QR Code & Info */}
            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Preview Tampilan QR (QRCodeSVG) */}
                <div className="bg-[#F9FBFA] p-4 rounded-xl border border-[#B2DFDB] flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                        <QRCodeSVG
                            value={url || ''}
                            size={168}
                            level="M"
                            marginSize={4}
                            fgColor="#0F172A"
                            bgColor="#FFFFFF"
                        />
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono mt-2">
                        Scan via Kamera HP
                    </span>
                </div>

                {/* Input Tautan & Aksi */}
                <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#2C3E50] uppercase tracking-wider">
                            Tautan Ulasan Mandiri
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={url || ''}
                                className="flex-1 px-3.5 py-2.5 bg-[#F9FBFA] border border-[#B2DFDB] rounded-lg text-xs sm:text-sm text-[#2C3E50] font-mono select-all focus:outline-none focus:ring-1 focus:ring-[#26A69A]"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="px-4 py-2.5 bg-[#26A69A] hover:bg-[#1E6B65] text-white font-semibold text-xs sm:text-sm rounded-lg transition inline-flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Tersalin!</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        <span>Salin Tautan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Tombol Aksi: Unduh PNG & Cetak */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <button
                            type="button"
                            onClick={handleDownloadPng}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E6B65] hover:bg-[#154B47] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-2xs transition"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Unduh PNG (1024px)</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#B2DFDB] hover:bg-[#E8F5F1] text-[#2C3E50] font-semibold text-xs sm:text-sm rounded-lg shadow-2xs transition"
                        >
                            <svg className="w-4 h-4 text-[#1E6B65]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            <span>Cetak Kartu QR</span>
                        </button>
                    </div>

                    <p className="text-[11px] text-gray-500">
                        * Format PNG 1024×1024px siap cetak resolusi tinggi untuk ditempel di meja kasir atau akrilik meja makan.
                    </p>
                </div>
            </div>

            {/* QRCodeCanvas 1024px off-screen untuk Download resolusi tinggi */}
            <div
                ref={canvasContainerRef}
                style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0 }}
                aria-hidden="true"
            >
                <QRCodeCanvas
                    value={url || ''}
                    size={1024}
                    level="M"
                    marginSize={4}
                    fgColor="#0F172A"
                    bgColor="#FFFFFF"
                />
            </div>
        </div>
    );
}

