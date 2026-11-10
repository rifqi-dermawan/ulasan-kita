<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            // Relasi ke pemilik warung/kantin
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Data Input Asli
            $table->text('content'); // Isi ulasan
            $table->string('source')->nullable(); // Google Maps, Instagram, dll
            $table->string('menu_item')->nullable(); // Contoh: Nasi goreng
            $table->date('review_date')->nullable();

            // Data Hasil Analisis AI
            $table->string('sentiment')->nullable(); // Positif, Netral, Negatif
            $table->string('ai_confidence')->nullable(); // Tinggi, Sedang, Rendah
            $table->string('complaint_topic')->nullable(); // Contoh: Waktu tunggu, Kebersihan

            // Logika untuk fitur "Ubah Label / Kembalikan ke hasil AI"
            $table->boolean('is_edited_by_user')->default(false);
            $table->string('original_sentiment')->nullable(); // Menyimpan sentimen asli dari AI sebelum diedit manual

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
