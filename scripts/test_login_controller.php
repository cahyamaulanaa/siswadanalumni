<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;

$request = Request::create('/api/auth/login', 'POST', [
    'email' => 'superadmin@sialumni.local',
    'password' => 'password123'
]);

$controller = new AuthController();
$response = $controller->login($request);

if (is_object($response) && method_exists($response, 'getContent')) {
    echo $response->getContent() . PHP_EOL;
} else {
    var_dump($response);
}
