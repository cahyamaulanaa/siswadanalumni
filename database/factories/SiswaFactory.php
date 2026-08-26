<?php

namespace Database\Factories;

use App\Models\Cabang;
use App\Models\Siswa;
use Illuminate\Database\Eloquent\Factories\Factory;

class SiswaFactory extends Factory
{
    protected $model = Siswa::class;

    public function definition(): array
    {
        return [
            'cabang_id' => Cabang::factory(),
            'nama_lengkap' => $this->faker->name(),
            'asal_sekolah' => $this->faker->company(),
            'tanggal_lahir' => $this->faker->date(),
            'no_hp' => $this->faker->phoneNumber(),
            'alamat' => $this->faker->address(),
            'email' => $this->faker->unique()->safeEmail(),
            'informasi_villa_merah' => 'website',
            'tahun_masuk' => $this->faker->date('Y-m-d', 'now'),
            'kelas' => 10,
        ];
    }
}
