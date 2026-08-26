<?php

namespace Database\Seeders;

use App\Models\KategoriProgram;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        // Kategori: SR ANAK
        $sr_anak = KategoriProgram::create([
            'nama' => 'SR ANAK',
            'tipe' => 'SR_ANAK',
            'deskripsi' => 'Program untuk tingkat SD',
        ]);

        Program::create([
            'kategori_program_id' => $sr_anak->id,
            'nama' => 'SR SD',
            'kelas_min' => 1,
            'kelas_max' => 6,
            'deskripsi' => 'Program SR untuk kelas 1-6 SD',
        ]);

        // Kategori: SR ANAK ONLINE
        $sr_anak_online = KategoriProgram::create([
            'nama' => 'SR ANAK ONLINE',
            'tipe' => 'SR_ANAK_ONLINE',
            'deskripsi' => 'Program SR online untuk tingkat SD',
        ]);

        Program::create([
            'kategori_program_id' => $sr_anak_online->id,
            'nama' => 'SR SD Online',
            'kelas_min' => 1,
            'kelas_max' => 6,
            'deskripsi' => 'Program SR online untuk kelas 1-6 SD',
        ]);

        // Kategori: SR SMP
        $sr_smp = KategoriProgram::create([
            'nama' => 'SR SMP',
            'tipe' => 'SR_SMP',
            'deskripsi' => 'Program SR untuk tingkat SMP',
        ]);

        Program::create([
            'kategori_program_id' => $sr_smp->id,
            'nama' => 'SR SMP',
            'kelas_min' => 7,
            'kelas_max' => 9,
            'deskripsi' => 'Program SR untuk kelas 7-9 SMP',
        ]);

        // Kategori: SR SMP ONLINE
        $sr_smp_online = KategoriProgram::create([
            'nama' => 'SR SMP ONLINE',
            'tipe' => 'SR_SMP_ONLINE',
            'deskripsi' => 'Program SR online untuk tingkat SMP',
        ]);

        Program::create([
            'kategori_program_id' => $sr_smp_online->id,
            'nama' => 'SR SMP ONLINE',
            'kelas_min' => 7,
            'kelas_max' => 9,
            'deskripsi' => 'Program SR online untuk kelas 7-9 SMP',
        ]);

        // Kategori: SRD
        $srd = KategoriProgram::create([
            'nama' => 'SRD',
            'tipe' => 'SRD',
            'deskripsi' => 'Program SRD untuk tingkat SMA',
        ]);

        Program::create([
            'kategori_program_id' => $srd->id,
            'nama' => 'SR GOLD',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $srd->id,
            'nama' => 'SR SILVER',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $srd->id,
            'nama' => 'SR ADVANCE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $srd->id,
            'nama' => 'SR MINSEN',
            'kelas_min' => 10,
            'kelas_max' => 11,
        ]);

        Program::create([
            'kategori_program_id' => $srd->id,
            'nama' => 'SR PLATINUM',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $srd->id,
            'nama' => 'SR BEASISWA',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $srd->id,
            'nama' => 'SR BRONZE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        // Kategori: SRD ONLINE
        $srd_online = KategoriProgram::create([
            'nama' => 'SRD ONLINE',
            'tipe' => 'SRD_ONLINE',
            'deskripsi' => 'Program SRD online untuk tingkat SMA',
        ]);

        Program::create([
            'kategori_program_id' => $srd_online->id,
            'nama' => 'SR GOLD ONLINE JANGKA PENDEK',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $srd_online->id,
            'nama' => 'SR GOLD ONLINE JANGKA PANJANG',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $srd_online->id,
            'nama' => 'SR MINSEN ONLINE JANGKA PENDEK',
            'kelas_min' => 10,
            'kelas_max' => 11,
        ]);

        Program::create([
            'kategori_program_id' => $srd_online->id,
            'nama' => 'SR MINSEN ONLINE JANGKA PANJANG',
            'kelas_min' => 10,
            'kelas_max' => 11,
        ]);

        Program::create([
            'kategori_program_id' => $srd_online->id,
            'nama' => 'SR BEASISWA ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $srd_online->id,
            'nama' => 'SR BRONZE ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        // Kategori: INTENSIF SRD
        $intensif_srd = KategoriProgram::create([
            'nama' => 'INTENSIF SRD',
            'tipe' => 'INTENSIF_SRD',
            'deskripsi' => 'Program Intensif SRD untuk tingkat SMA',
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd->id,
            'nama' => 'INTENSIF SNBP-SNBT',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd->id,
            'nama' => 'INTENSIF SNBP',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd->id,
            'nama' => 'INTENSIF SNBT',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd->id,
            'nama' => 'INTENSIF SSU TEST',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd->id,
            'nama' => 'INTENSIF NON TEST',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        // Kategori: INTENSIF SRD ONLINE
        $intensif_srd_online = KategoriProgram::create([
            'nama' => 'INTENSIF SRD ONLINE',
            'tipe' => 'INTENSIF_SRD_ONLINE',
            'deskripsi' => 'Program Intensif SRD online untuk tingkat SMA',
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd_online->id,
            'nama' => 'INTENSIF SNBP-SNBT ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd_online->id,
            'nama' => 'INTENSIF SNBP ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd_online->id,
            'nama' => 'INTENSIF SNBT ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd_online->id,
            'nama' => 'INTENSIF SSU TEST ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_srd_online->id,
            'nama' => 'INTENSIF SSU NON ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        // Kategori: AR
        $ar = KategoriProgram::create([
            'nama' => 'AR',
            'tipe' => 'AR',
            'deskripsi' => 'Program Arsitektur',
        ]);

        Program::create([
            'kategori_program_id' => $ar->id,
            'nama' => 'AR GOLD',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $ar->id,
            'nama' => 'AR SILVER',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $ar->id,
            'nama' => 'MINAT ARSITEKTUR',
            'kelas_min' => 10,
            'kelas_max' => 11,
        ]);

        // Kategori: AR ONLINE
        $ar_online = KategoriProgram::create([
            'nama' => 'AR ONLINE',
            'tipe' => 'AR_ONLINE',
            'deskripsi' => 'Program Arsitektur online',
        ]);

        Program::create([
            'kategori_program_id' => $ar_online->id,
            'nama' => 'AR GOLD ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $ar_online->id,
            'nama' => 'AR SILVER ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $ar_online->id,
            'nama' => 'MINAT ARSITEKTUR ONLINE',
            'kelas_min' => 10,
            'kelas_max' => 11,
        ]);

        // Kategori: INTENSIF AR
        $intensif_ar = KategoriProgram::create([
            'nama' => 'INTENSIF AR',
            'tipe' => 'INTENSIF_AR',
            'deskripsi' => 'Program Intensif Arsitektur',
        ]);

        Program::create([
            'kategori_program_id' => $intensif_ar->id,
            'nama' => 'PMDK UNPAR',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_ar->id,
            'nama' => 'USM 1 UNPAR',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_ar->id,
            'nama' => 'USM 2 UNPAR',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_ar->id,
            'nama' => 'USM 3 UNPAR',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        // Kategori: INTENSIF AR ONLINE
        $intensif_ar_online = KategoriProgram::create([
            'nama' => 'INTENSIF AR ONLINE',
            'tipe' => 'INTENSIF_AR_ONLINE',
            'deskripsi' => 'Program Intensif Arsitektur online',
        ]);

        Program::create([
            'kategori_program_id' => $intensif_ar_online->id,
            'nama' => 'PMDK UNPAR ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_ar_online->id,
            'nama' => 'USM 1 UNPAR ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_ar_online->id,
            'nama' => 'USM 2 UNPAR ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);

        Program::create([
            'kategori_program_id' => $intensif_ar_online->id,
            'nama' => 'USM 3 UNPAR ONLINE',
            'kelas_min' => 12,
            'kelas_max' => 12,
        ]);
    }
}
