@echo off
title Server UlasanKita (0.0.0.0:8000)
echo ===================================================
echo   Menjalankan Server UlasanKita untuk Semua HP/Host
echo   IP Laptop : 192.168.18.15:8000
echo   Status    : Siap menerima scan QR dari iPhone/Android
echo.
echo   *JANGAN TUTUP JENDELA INI SELAMA DEMO BERLANGSUNG*
echo ===================================================
echo.
php artisan serve --host=0.0.0.0 --port=8000
pause

