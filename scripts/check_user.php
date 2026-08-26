<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = $argv[1] ?? 'superadmin@sialumni.local';
$user = User::where('email', $email)->first();
if (!$user) {
    echo json_encode(['exists' => false, 'email' => $email]) . PHP_EOL;
    exit(0);
}
$matches = Hash::check('password123', $user->password);
$output = [
    'exists' => true,
    'id' => $user->id,
    'email' => $user->email,
    'nama' => $user->nama,
    'is_active' => $user->is_active,
    'cabang_id' => $user->cabang_id,
    'password_hash' => $user->password,
    'password123_matches' => $matches,
];
echo json_encode($output, JSON_PRETTY_PRINT) . PHP_EOL;
