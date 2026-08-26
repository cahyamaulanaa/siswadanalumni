<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Alumni;
use App\Models\Siswa;

$alumni = Alumni::with(['siswa.cabang','siswa.program'])->find(3);
echo "ALUMNI:\n";
echo json_encode($alumni ? $alumni->toArray() : null, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

echo "SISWA TRASHED\n";
$siswa = Siswa::withTrashed()->find(6);
echo json_encode($siswa ? $siswa->toArray() : null, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
