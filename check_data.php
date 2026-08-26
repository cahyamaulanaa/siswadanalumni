<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Siswa;
use App\Models\Alumni;

echo "=== Siswa Data ===\n";
$siswaByYear = Siswa::selectRaw('COUNT(*) as total, YEAR(tahun_masuk) as tahun, status')
    ->groupBy('tahun', 'status')
    ->get();
foreach ($siswaByYear as $s) {
    echo "Tahun {$s->tahun}, Status {$s->status}: {$s->total}\n";
}

echo "\n=== Alumni Data ===\n";
$alumniByYear = Alumni::selectRaw('COUNT(*) as total, YEAR(tahun_diterima) as tahun')
    ->groupBy('tahun')
    ->get();
foreach ($alumniByYear as $a) {
    echo "Tahun {$a->tahun}: {$a->total}\n";
}

echo "\n=== Sample Siswa ===\n";
$siswa = Siswa::first();
echo "ID: {$siswa->id}, Nama: {$siswa->nama_lengkap}, Tahun Masuk: {$siswa->tahun_masuk}, Status: {$siswa->status}\n";

echo "\n=== Sample Alumni ===\n";
$alumni = Alumni::first();
echo "Siswa ID: {$alumni->siswa_id}, PTN: {$alumni->ptn_diterima}, Jalur: {$alumni->jalur_masuk}, Tahun: {$alumni->tahun_diterima}\n";
