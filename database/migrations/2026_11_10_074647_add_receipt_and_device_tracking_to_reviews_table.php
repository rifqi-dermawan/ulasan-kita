<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->string('receipt_number', 50)->nullable()->after('menu_item')->index();
            $table->string('photo_path', 255)->nullable()->after('receipt_number');
            $table->string('device_id', 100)->nullable()->after('photo_path')->index();
            $table->string('ip_address', 45)->nullable()->after('device_id');
            $table->text('user_agent')->nullable()->after('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['receipt_number', 'photo_path', 'device_id', 'ip_address', 'user_agent']);
        });
    }
};
