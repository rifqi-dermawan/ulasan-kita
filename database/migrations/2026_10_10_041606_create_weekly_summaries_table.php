<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Rentang waktu minggu tersebut
            $table->date('start_date');
            $table->date('end_date');

            // Cache hasil AI
            $table->text('summary_text')->nullable(); // Paragraf "Dari 128 ulasan, 24 bernada negatif..."
            $table->json('top_complaints')->nullable(); // Simpan array 3 keluhan teratas & saran AI dalam bentuk JSON

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_summaries');
    }
};
