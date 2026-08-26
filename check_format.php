<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Siswa;
use App\Models\Alumni;

echo "Sample Siswa data:\n";
foreach (Siswa::take(3)->get() as $s) {
    echo "  ID: $s->id, tahun_masuk: " . ($s->tahun_masuk ? $s->tahun_masuk->format('Y-m-d') : 'NULL') . "\n";
}

echo "\nSample Alumni data:\n";
foreach (Alumni::take(3)->get() as $a) {
    echo "  Siswa ID: $a->siswa_id, tahun_diterima: " . ($a->tahun_diterima ?? 'NULL') . "\n";
}
