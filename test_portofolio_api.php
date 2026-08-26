<?php
// Test script untuk check API response

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$portofolios = \App\Models\PortofolioAlumni::with(['alumni.siswa'])->first();

if ($portofolios) {
    echo "Raw Model Data:\n";
    echo json_encode($portofolios->toArray(), JSON_PRETTY_PRINT) . "\n\n";
    
    echo "Model with Appended URLs:\n";
    $portofolios->append(['gambar_suasana_url', 'gambar_karya_bebas_url']);
    echo json_encode($portofolios->toArray(), JSON_PRETTY_PRINT) . "\n\n";
    
    echo "Storage URL Test:\n";
    echo "gambar_suasana_url: " . $portofolios->gambar_suasana_url . "\n";
    echo "gambar_karya_bebas_url: " . $portofolios->gambar_karya_bebas_url . "\n";
    
    echo "\nAPP_URL: " . env('APP_URL') . "\n";
} else {
    echo "No portofolio found\n";
}
