<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Alumni;

// Update alumni yang belum memiliki tahun_diterima
$alumniWithoutYear = Alumni::whereNull('tahun_diterima')->get();

echo "Updating " . count($alumniWithoutYear) . " alumni records with missing tahun_diterima...\n";

foreach ($alumniWithoutYear as $alumni) {
    $alumni->tahun_diterima = rand(2022, 2024);
    $alumni->save();
}

echo "Done! All alumni now have tahun_diterima.\n";

// Verify
$byYear = Alumni::selectRaw('tahun_diterima, COUNT(*) as total')
    ->groupBy('tahun_diterima')
    ->get();

echo "\n=== Alumni by Tahun Diterima ===\n";
foreach ($byYear as $row) {
    echo "Tahun {$row->tahun_diterima}: {$row->total}\n";
}

// Show sample jalur masuk distribution
$byJalur = Alumni::selectRaw('jalur_masuk, COUNT(*) as total')
    ->groupBy('jalur_masuk')
    ->get();

echo "\n=== Alumni by Jalur Masuk ===\n";
foreach ($byJalur as $row) {
    echo "{$row->jalur_masuk}: {$row->total}\n";
}

// Show top PTN
$ptn = Alumni::selectRaw('ptn_diterima, COUNT(*) as total')
    ->groupBy('ptn_diterima')
    ->orderByRaw('COUNT(*) DESC')
    ->limit(5)
    ->get();

echo "\n=== Top 5 PTN ===\n";
foreach ($ptn as $row) {
    echo "{$row->ptn_diterima}: {$row->total}\n";
}
