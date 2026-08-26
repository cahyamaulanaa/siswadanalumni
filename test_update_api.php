<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Siswa;
use Illuminate\Support\Facades\Validator;

echo "=== TESTING SISWA UPDATE VIA API ===\n\n";

// Get the siswa to update
$siswa = Siswa::find(20);

if (!$siswa) {
    echo "Siswa not found\n";
    exit;
}

echo "Original data:\n";
echo "  Nama: {$siswa->nama_lengkap}\n";
echo "  Email: {$siswa->email}\n";
echo "  Tahun Masuk: {$siswa->tahun_masuk}\n\n";

// Prepare test data
$testData = [
    'cabang_id' => 1,
    'nama_lengkap' => 'NAMA DIUBAH DARI TEST API',
    'kelas' => 12,
    'asal_sekolah' => 'SMAN 20 Bandung',
    'tanggal_lahir' => '2002-05-21',
    'no_hp' => '081234567890',
    'alamat' => 'Bandung',
    'email' => 'cahyamaulana497@gmail.com',
    'informasi_villa_merah' => 'instagram',
    'tahun_masuk' => '2026-06-12',
];

echo "Attempting to update with data:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Validate using the same rules as the controller
$rules = [
    'cabang_id' => 'required|exists:cabang,id',
    'nama_lengkap' => 'required|string|max:255',
    'kelas' => 'required|integer|between:1,12',
    'asal_sekolah' => 'required|string|max:255',
    'tanggal_lahir' => 'required|date_format:Y-m-d',
    'no_hp' => 'required|string|max:20',
    'alamat' => 'required|string|max:255',
    'email' => 'required|email|max:255',
    'informasi_villa_merah' => 'required|string|max:50',
    'tahun_masuk' => 'required|date_format:Y-m-d',
];

$validator = Validator::make($testData, $rules);

if ($validator->fails()) {
    echo "Validation errors:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "  - $error\n";
    }
    echo "\n";
} else {
    echo "✓ Validation passed\n\n";
    
    // Update the model
    $siswa->update($testData);
    
    echo "After update:\n";
    echo "  Nama: {$siswa->nama_lengkap}\n";
    echo "  Email: {$siswa->email}\n";
    echo "  Tahun Masuk: {$siswa->tahun_masuk}\n\n";
    
    // Verify in database
    $fresh = Siswa::find(20);
    echo "Verified from fresh query:\n";
    echo "  Nama: {$fresh->nama_lengkap}\n";
    echo "  Email: {$fresh->email}\n";
    echo "  Tahun Masuk: {$fresh->tahun_masuk}\n";
}
