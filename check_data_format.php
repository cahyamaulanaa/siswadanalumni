<?php
require 'vendor/autoload.php';

use App\Models\Siswa;
use App\Models\Alumni;

Siswa::take(3)->get()->each(function ($s) {
    echo "Siswa ID: $s->id, tahun_masuk: " . $s->tahun_masuk . ", Status: $s->status\n";
});

echo "\n";
Alumni::take(3)->get()->each(function ($a) {
    echo "Alumni Siswa ID: $a->siswa_id, tahun_diterima: " . $a->tahun_diterima . "\n";
});
