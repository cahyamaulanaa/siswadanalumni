<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Alumni;
use App\Models\Siswa;

echo "=== DATA VERIFICATION ===\n";
echo "\n1. Database Statistics:\n";
echo "   Total Siswa: " . Siswa::count() . "\n";
echo "   Total Alumni: " . Alumni::count() . "\n";
echo "   Siswa Aktif (2026): " . Siswa::where('status', 'aktif')->whereYear('tahun_masuk', 2026)->count() . "\n";

echo "\n2. Alumni by Graduation Year (tahun_diterima):\n";
$alumni_by_year = Alumni::selectRaw('tahun_diterima, COUNT(*) as total')
    ->whereNotNull('tahun_diterima')
    ->groupBy('tahun_diterima')
    ->orderBy('tahun_diterima')
    ->get();
foreach ($alumni_by_year as $row) {
    echo "   Tahun $row->tahun_diterima: $row->total\n";
}

echo "\n3. Alumni by Jalur Masuk:\n";
$alumni_by_jalur = Alumni::selectRaw('jalur_masuk, COUNT(*) as total')
    ->where('jalur_masuk', '!=', null)
    ->groupBy('jalur_masuk')
    ->get();
foreach ($alumni_by_jalur as $row) {
    echo "   Jalur $row->jalur_masuk: $row->total\n";
}

echo "\n4. Top 5 PTN by Alumni Count:\n";
$alumni_by_ptn = Alumni::selectRaw('ptn_diterima, COUNT(*) as total')
    ->where('ptn_diterima', '!=', null)
    ->groupBy('ptn_diterima')
    ->orderByRaw('COUNT(*) DESC')
    ->limit(5)
    ->get();
foreach ($alumni_by_ptn as $row) {
    echo "   $row->ptn_diterima: $row->total\n";
}

echo "\n5. Sidebar Alumni Badge Count:\n";
echo "   Alumni in sidebar should show: " . Alumni::count() . "\n";
