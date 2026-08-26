<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Siswa;

echo "=== CHECKING FIRST SISWA IN LIST ===\n\n";

// Get first siswa (probably the one displayed in table)
$siswa = Siswa::with(['cabang', 'angkatan', 'program'])->first();

if ($siswa) {
    echo "ID: {$siswa->id}\n";
    echo "Nama: {$siswa->nama_lengkap}\n";
    echo "Email: {$siswa->email}\n";
    echo "Program count: " . ($siswa->program ? count($siswa->program) : 0) . "\n";
    if ($siswa->program && count($siswa->program) > 0) {
        echo "Program 0: {$siswa->program[0]->nama}\n";
    }
    echo "Tanggal Lahir (raw): {$siswa->tanggal_lahir}\n";
    echo "Tahun Masuk (raw): {$siswa->tahun_masuk}\n";
    echo "\nFull data:\n";
    echo json_encode($siswa->toArray(), JSON_PRETTY_PRINT) . "\n";
} else {
    echo "No siswa found\n";
}
