<?php

namespace Database\Seeders;

use App\Models\Siswa;
use App\Models\Alumni;
use App\Models\Cabang;
use App\Models\Angkatan;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class SiswaAlumniSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        
        $cabangs = Cabang::all();
        $angkatans = Angkatan::all();
        
        if ($cabangs->isEmpty() || $angkatans->isEmpty()) {
            $this->command->error('Cabang atau Angkatan data tidak ditemukan. Jalankan DatabaseSeeder terlebih dahulu.');
            return;
        }

        $informasi_sumber = ['website', 'instagram', 'tiktok', 'kerabat', 'orang_tua', 'teman'];
        $jalur_masuk = ['snbp', 'snbt', 'mandiri'];
        
        // Create 10 Siswa
        $siswa_ids = [];
        for ($i = 0; $i < 10; $i++) {
            $angkatan = $angkatans->random();
            $siswa = Siswa::create([
                'cabang_id' => $cabangs->random()->id,
                'nama_lengkap' => $faker->name(),
                'asal_sekolah' => $faker->company() . ' High School',
                'tanggal_lahir' => $faker->dateTimeBetween('-20 years', '-16 years')->format('Y-m-d'),
                'no_hp' => '08' . $faker->numerify('##########'),
                'alamat' => $faker->address(),
                'email' => $faker->unique()->safeEmail(),
                'informasi_villa_merah' => $faker->randomElement($informasi_sumber),
                'kelas' => $faker->numberBetween(1, 12),
                'tahun_masuk' => $faker->dateTimeBetween('-3 years', 'now')->format('Y-m-d'),
                'tahun_lulus' => null,
            ]);
            
            $siswa_ids[] = $siswa->id;
        }

        // Create 20 Alumni from the 10 Siswa (2 alumni records per siswa with different data)
        // But we can't have duplicate siswa_id, so we need to create 20 more siswa first
        // OR we create 20 alumni from different siswa. Let's create more siswa to have 20+ for alumni
        
        // Actually, let's create 20 more siswa to have enough for 20 alumni
        for ($i = 0; $i < 20; $i++) {
            $angkatan = $angkatans->random();
            $siswa = Siswa::create([
                'cabang_id' => $cabangs->random()->id,
                'nama_lengkap' => $faker->name(),
                'asal_sekolah' => $faker->company() . ' High School',
                'tanggal_lahir' => $faker->dateTimeBetween('-22 years', '-18 years')->format('Y-m-d'),
                'no_hp' => '08' . $faker->numerify('##########'),
                'alamat' => $faker->address(),
                'email' => $faker->unique()->safeEmail(),
                'informasi_villa_merah' => $faker->randomElement($informasi_sumber),
                'kelas' => $faker->numberBetween(1, 12),
                'tahun_masuk' => $faker->dateTimeBetween('-5 years', '-2 years')->format('Y-m-d'),
                'tahun_lulus' => $faker->numberBetween(2023, 2024),
            ]);
            
            $siswa_ids[] = $siswa->id;
        }

        // Create 20 Alumni records (last 20 siswa)
        $alumni_siswa_ids = array_slice($siswa_ids, 10, 20);
        
        foreach ($alumni_siswa_ids as $siswa_id) {
            Alumni::create([
                'siswa_id' => $siswa_id,
                'ptn_diterima' => $faker->randomElement([
                    'Universitas Indonesia',
                    'ITB',
                    'Universitas Gadjah Mada',
                    'Universitas Airlangga',
                    'IPB University',
                    'Universitas Diponegoro',
                    'Universitas Padjajaran',
                    'Universitas Brawijaya',
                    'Universitas Hasanuddin',
                    'Universitas Sumatera Utara',
                    'Telkom University',
                    'Binus University',
                    'Universitas Trisakti',
                ]),
                'jurusan' => $faker->randomElement([
                    'Teknik Informatika',
                    'Teknik Mesin',
                    'Teknik Sipil',
                    'Teknik Elektro',
                    'Manajemen',
                    'Akuntansi',
                    'Hukum',
                    'Kedokteran',
                    'Farmasi',
                    'Psikologi',
                    'Ilmu Komunikasi',
                    'Sastra Inggris',
                    'Sistem Informasi',
                ]),
                'jalur_masuk' => $faker->randomElement($jalur_masuk),
                'tahun_diterima' => $faker->numberBetween(2022, 2024),
                'testimoni' => $faker->sentence(15),
            ]);
        }

        $this->command->info('✓ Berhasil membuat 10 data Siswa dan 20 data Alumni!');
    }
}
