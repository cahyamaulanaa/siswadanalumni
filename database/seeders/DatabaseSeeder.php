<?php

namespace Database\Seeders;

use App\Models\Alumni;
use App\Models\Angkatan;
use App\Models\Cabang;
use App\Models\SesiKelas;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Cabang (3 cabang)
        $cabang_bandung = Cabang::create([
            'nama' => 'Bimbel Gambar Villa Merah - Bandung',
            'kota' => 'Bandung',
            'alamat' => 'Jl. Cipaganti No. 123, Bandung, Jawa Barat',
            'telepon' => '(022) 1234567',
        ]);

        $cabang_jakarta_selatan = Cabang::create([
            'nama' => 'Bimbel Gambar Villa Merah - Jakarta Selatan',
            'kota' => 'Jakarta Selatan',
            'alamat' => 'Jl. Senopati No. 45, Jakarta Selatan',
            'telepon' => '(021) 2345678',
        ]);

        $cabang_jakarta_pusat = Cabang::create([
            'nama' => 'Bimbel Gambar Villa Merah - Jakarta Pusat',
            'kota' => 'Jakarta Pusat',
            'alamat' => 'Jl. Kesawan No. 10, Jakarta Pusat',
            'telepon' => '(021) 3456789',
        ]);

        // 2. Seed Program data first so classes can be selected later
        $this->call(ProgramSeeder::class);

        // 3. Seed Users (Super Admin, Admin Cabang, dan Pengajar)
        // Super Admin
        User::create([
            'cabang_id' => null,
            'nama' => 'Admin Super',
            'email' => 'superadmin@sialumni.local',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        // Admin Cabang Bandung
        $admin_bandung = User::create([
            'cabang_id' => $cabang_bandung->id,
            'nama' => 'Admin Bandung',
            'email' => 'admin.bandung@sialumni.local',
            'password' => Hash::make('password123'),
            'role' => 'admin_cabang',
            'is_active' => true,
        ]);

        // Admin Cabang Jakarta Selatan
        $admin_jakarta_sel = User::create([
            'cabang_id' => $cabang_jakarta_selatan->id,
            'nama' => 'Admin Jakarta Selatan',
            'email' => 'admin.jaksel@sialumni.local',
            'password' => Hash::make('password123'),
            'role' => 'admin_cabang',
            'is_active' => true,
        ]);

        // Admin Cabang Jakarta Pusat
        $admin_jakarta_pus = User::create([
            'cabang_id' => $cabang_jakarta_pusat->id,
            'nama' => 'Admin Jakarta Pusat',
            'email' => 'admin.jakpus@sialumni.local',
            'password' => Hash::make('password123'),
            'role' => 'admin_cabang',
            'is_active' => true,
        ]);

        // Pengajar
        User::create([
            'cabang_id' => $cabang_bandung->id,
            'nama' => 'Pengajar Budi',
            'email' => 'pengajar.budi@sialumni.local',
            'password' => Hash::make('password123'),
            'role' => 'pengajar',
            'is_active' => true,
        ]);

        // Direksi
        User::create([
            'cabang_id' => null,
            'nama' => 'Direksi Villa Merah',
            'email' => 'direksi@sialumni.local',
            'password' => Hash::make('password123'),
            'role' => 'direksi',
            'is_active' => true,
        ]);

        // Staff Karyawan
        User::create([
            'cabang_id' => $cabang_bandung->id,
            'nama' => 'Staff Admin',
            'email' => 'staff@sialumni.local',
            'password' => Hash::make('password123'),
            'role' => 'staff_karyawan',
            'is_active' => true,
        ]);

        // 3. Seed Angkatan
        $angkatan_2024_bandung = Angkatan::create([
            'cabang_id' => $cabang_bandung->id,
            'tahun' => 2024,
            'program' => 'reguler',
        ]);

        $angkatan_2023_bandung = Angkatan::create([
            'cabang_id' => $cabang_bandung->id,
            'tahun' => 2023,
            'program' => 'intensif',
        ]);

        $angkatan_2024_jaksel = Angkatan::create([
            'cabang_id' => $cabang_jakarta_selatan->id,
            'tahun' => 2024,
            'program' => 'reguler',
        ]);

        // 4. Seed Siswa
        $siswa_data = [
            ['nama_lengkap' => 'Ahmad Reza Pratama', 'asal_sekolah' => 'SMA Negeri 1 Bandung', 'is_alumni' => false, 'angkatan' => $angkatan_2024_bandung, 'cabang' => $cabang_bandung],
            ['nama_lengkap' => 'Siti Nurhaliza', 'asal_sekolah' => 'SMA Negeri 2 Bandung', 'is_alumni' => false, 'angkatan' => $angkatan_2024_bandung, 'cabang' => $cabang_bandung],
            ['nama_lengkap' => 'Budi Santoso', 'asal_sekolah' => 'SMA Negeri 3 Bandung', 'is_alumni' => true, 'angkatan' => $angkatan_2023_bandung, 'cabang' => $cabang_bandung],
            ['nama_lengkap' => 'Dewi Lestari', 'asal_sekolah' => 'SMA Negeri 4 Bandung', 'is_alumni' => true, 'angkatan' => $angkatan_2023_bandung, 'cabang' => $cabang_bandung],
            ['nama_lengkap' => 'Rina Kusuma', 'asal_sekolah' => 'SMA Negeri 1 Jakarta', 'is_alumni' => false, 'angkatan' => $angkatan_2024_jaksel, 'cabang' => $cabang_jakarta_selatan],
        ];

        $siswa_instances = [];
        foreach ($siswa_data as $data) {
            $siswa = Siswa::create([
                'cabang_id' => $data['cabang']->id,
                'nama_lengkap' => $data['nama_lengkap'],
                'asal_sekolah' => $data['asal_sekolah'],
                'tanggal_lahir' => now()->subYears(rand(16, 20))->toDateString(),
                'no_hp' => '08' . rand(1000000000, 9999999999),
                'alamat' => 'Jl. Merdeka No. ' . rand(1, 100),
                'foto' => null,
                'tahun_masuk' => $data['angkatan']->tahun,
                'tahun_lulus' => $data['is_alumni'] ? $data['angkatan']->tahun : null,
            ]);
            $siswa_instances[] = $siswa;
        }

        // 5. Seed Alumni (untuk siswa yang status alumni)
        Alumni::create([
            'siswa_id' => $siswa_instances[2]->id,
            'ptn_diterima' => 'Institut Teknologi Bandung',
            'jurusan' => 'Desain Grafis',
            'jalur_masuk' => 'snbp',
            'tahun_diterima' => 2023,
            'testimoni' => 'Bimbel ini sangat membantu saya masuk ITB!',
        ]);

        Alumni::create([
            'siswa_id' => $siswa_instances[3]->id,
            'ptn_diterima' => 'Universitas Indonesia',
            'jurusan' => 'Arsitektur',
            'jalur_masuk' => 'snbt',
            'tahun_diterima' => 2023,
            'testimoni' => 'Kualitas mengajar di sini luar biasa!',
        ]);

        // 6. Seed Sesi Kelas
        $sesi1 = SesiKelas::create([
            'angkatan_id' => $angkatan_2024_bandung->id,
            'cabang_id' => $cabang_bandung->id,
            'dibuat_oleh' => $admin_bandung->id,
            'tanggal' => now()->toDateString(),
            'topik' => 'Dasar-dasar Komposisi Gambar',
            'instruktur' => 'Ibu Siti',
            'jam_mulai' => '09:00',
            'jam_selesai' => '11:00',
            'catatan' => 'Kelas pembukaan untuk angkatan 2024',
        ]);

        $sesi2 = SesiKelas::create([
            'angkatan_id' => $angkatan_2024_bandung->id,
            'cabang_id' => $cabang_bandung->id,
            'dibuat_oleh' => $admin_bandung->id,
            'tanggal' => now()->addDay()->toDateString(),
            'topik' => 'Teknik Shading dan Pencahayaan',
            'instruktur' => 'Pak Adi',
            'jam_mulai' => '13:00',
            'jam_selesai' => '15:00',
            'catatan' => 'Lanjutan materi komposisi',
        ]);

    }
}
