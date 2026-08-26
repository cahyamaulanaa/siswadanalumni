<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Program;
use App\Models\KategoriProgram;

echo 'program=' . Program::count() . PHP_EOL;
echo 'kategori=' . KategoriProgram::count() . PHP_EOL;
