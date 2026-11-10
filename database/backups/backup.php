<?php

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$tables = ['users', 'reviews', 'weekly_summaries'];
$backupData = [];

foreach ($tables as $table) {
    if (Schema::hasTable($table)) {
        $backupData[$table] = DB::table($table)->get()->toArray();
    }
}

$filename = __DIR__.'/backup_'.date('Y_m_d_His').'.json';
file_put_contents($filename, json_encode($backupData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Backup created successfully at {$filename}\n";
echo 'Total reviews backed up: '.count($backupData['reviews'] ?? [])."\n";
