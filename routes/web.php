<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

// RUTE PUBLIK (Jalur Pelanggan via QR Code)
Route::get('/kantin/{user}/ulas', [ReviewController::class, 'publicCreate'])
    ->name('kantin.ulas');
Route::post('/kantin/{user}/ulas', [ReviewController::class, 'publicStore'])
    ->middleware('throttle:public-reviews')
    ->name('kantin.ulas.store');

// Alias untuk backward compatibility
Route::get('/kantin/{user}/ulas-legacy', [ReviewController::class, 'publicCreate'])->name('public.ulasan.create');
Route::post('/kantin/{user}/ulas-legacy', [ReviewController::class, 'publicStore'])->middleware('throttle:public-reviews')->name('public.ulasan.store');

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Halaman Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Halaman & Aksi Manajemen Ulasan
    Route::get('/ulasan', [ReviewController::class, 'index'])->name('ulasan.index');
    Route::get('/ulasan/tambah', [ReviewController::class, 'create'])->name('ulasan.create');
    Route::post('/ulasan', [ReviewController::class, 'store'])->name('ulasan.store');
    Route::put('/ulasan/{review}', [ReviewController::class, 'update'])->name('ulasan.update');
    Route::delete('/ulasan/{review}', [ReviewController::class, 'destroy'])->name('ulasan.destroy');
    Route::post('/ulasan/{review}/analyze', [ReviewController::class, 'analyze'])->name('ulasan.analyze');
    Route::post('/ulasan/analyze-all', [ReviewController::class, 'analyzeAll'])->name('ulasan.analyze-all');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
