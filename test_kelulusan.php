<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Alumni;
use App\Models\Siswa;

$baseQuery = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id');

// Test grouping by tahun_diterima
$kelulusan_by_year = $baseQuery
    ->selectRaw('alumni.tahun_diterima as tahun, COUNT(*) as total')
    ->whereNotNull('alumni.tahun_diterima')
    ->groupBy('alumni.tahun_diterima')
    ->orderBy('alumni.tahun_diterima', 'asc')
    ->get();

echo "=== Kelulusan by Year (Raw Query) ===\n";
echo $baseQuery
    ->selectRaw('alumni.tahun_diterima as tahun, COUNT(*) as total')
    ->whereNotNull('alumni.tahun_diterima')
    ->groupBy('alumni.tahun_diterima')
    ->orderBy('alumni.tahun_diterima', 'asc')
    ->toSql() . "\n\n";

echo "=== Results ===\n";
foreach ($kelulusan_by_year as $row) {
    echo "Tahun: $row->tahun, Total: $row->total\n";
}
