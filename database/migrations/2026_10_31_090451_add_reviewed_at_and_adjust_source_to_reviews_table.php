<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (! Schema::hasColumn('reviews', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('menu_item');
            }
            if (! Schema::hasColumn('reviews', 'source')) {
                $table->string('source')->nullable()->after('content');
            }
        });

        // Isi data lama: reviewed_at = created_at, source dibiarkan null (tampil "-" di UI)
        DB::table('reviews')->whereNull('reviewed_at')->update([
            'reviewed_at' => DB::raw('created_at'),
            'source' => null,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'reviewed_at')) {
                $table->dropColumn('reviewed_at');
            }
        });
    }
};
