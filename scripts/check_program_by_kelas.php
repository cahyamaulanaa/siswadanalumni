<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\SiswaController;

$request = Request::create('/api/siswa-data/program-by-kelas', 'GET', [
    'kelas' => 10,
]);

$controller = new SiswaController();
$response = $controller->getProgramByKelas($request);
echo $response->getContent() . PHP_EOL;
