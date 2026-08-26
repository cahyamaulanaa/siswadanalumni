<?php
require 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;

$db = new DB;
$db->addConnection([
    'driver' => 'sqlite',
    'database' => __DIR__ . '/database/database.sqlite',
]);
$db->setAsGlobal();
$db->bootEloquent();

$siswa = DB::table('siswa')
    ->selectRaw('strftime("%Y", tahun_masuk) as tahun, COUNT(*) as total')
    ->groupBy('tahun')
    ->orderBy('tahun', 'desc')
    ->get();

$alumni = DB::table('alumni')
    ->selectRaw('strftime("%Y", tahun_diterima) as tahun, COUNT(*) as total')
    ->where('tahun_diterima', '!=', null)
    ->groupBy('tahun')
    ->orderBy('tahun', 'desc')
    ->get();

echo "=== Siswa by Year ===\n";
foreach ($siswa as $row) {
    echo "Tahun $row->tahun: $row->total\n";
}

echo "\n=== Alumni by Year ===\n";
foreach ($alumni as $row) {
    echo "Tahun $row->tahun: $row->total\n";
}
