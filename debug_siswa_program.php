<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Siswa;

$siswaIds = [6];
foreach ($siswaIds as $id) {
    echo "SISWA ID: $id\n";
    $programs = DB::table('siswa_program')->where('siswa_id', $id)->get();
    echo "PIVOT:\n" . json_encode($programs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    $siswa = Siswa::with(['program'])->find($id);
    if ($siswa) {
        echo "SISWA PROGRAMS:\n" . json_encode($siswa->program->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    }
}
