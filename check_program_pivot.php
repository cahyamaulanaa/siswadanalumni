<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Siswa;
use Illuminate\Support\Facades\DB;

echo "=== CHECKING SISWA_PROGRAM PIVOT TABLE ===\n\n";

$pivotData = DB::table('siswa_program')->get();
echo "Total records in siswa_program: " . count($pivotData) . "\n\n";

foreach ($pivotData as $record) {
    $siswa = Siswa::find($record->siswa_id);
    $programName = DB::table('program')->where('id', $record->program_id)->value('nama');
    
    echo "Siswa ID: {$record->siswa_id}\n";
    echo "  Nama: " . ($siswa ? $siswa->nama_lengkap : 'NOT FOUND') . "\n";
    echo "  Program ID: {$record->program_id}\n";
    echo "  Program Nama: $programName\n";
    echo "  Date: {$record->terdaftar_at}\n\n";
}

echo "\n=== ALL SISWA WITH THEIR PROGRAM STATUS ===\n\n";
$allSiswa = Siswa::with('program')->get();
foreach ($allSiswa as $s) {
    $prog = $s->program && count($s->program) > 0 ? $s->program[0]->nama : 'NONE';
    echo "{$s->id} | {$s->nama_lengkap} | Program: $prog\n";
}
