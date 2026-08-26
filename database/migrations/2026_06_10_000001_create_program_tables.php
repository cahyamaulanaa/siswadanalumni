<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel Kategori Program
        if (!Schema::hasTable('kategori_program')) {
            Schema::create('kategori_program', function (Blueprint $table) {
                $table->id();
                $table->string('nama')->unique();
                $table->text('deskripsi')->nullable();
                $table->string('tipe')->comment('SR_ANAK, SR_ANAK_ONLINE, SR_SMP, SR_SMP_ONLINE, SRD, SRD_ONLINE, INTENSIF_SRD, INTENSIF_SRD_ONLINE, AR, AR_ONLINE, INTENSIF_AR, INTENSIF_AR_ONLINE');
                $table->timestamps();
            });
        }

        // Tabel Program
        if (!Schema::hasTable('program')) {
            Schema::create('program', function (Blueprint $table) {
                $table->id();
                $table->foreignId('kategori_program_id')->constrained('kategori_program')->onDelete('cascade');
                $table->string('nama')->unique();
                $table->unsignedTinyInteger('kelas_min')->comment('Kelas minimum (1-12)');
                $table->unsignedTinyInteger('kelas_max')->comment('Kelas maksimum (1-12)');
                $table->text('deskripsi')->nullable();
                $table->timestamps();
            });
        }

        // Pivot table untuk relasi siswa dan program
        if (!Schema::hasTable('siswa_program')) {
            Schema::create('siswa_program', function (Blueprint $table) {
                $table->id();
                $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
                $table->foreignId('program_id')->constrained('program')->onDelete('cascade');
                $table->timestamp('terdaftar_at')->useCurrent();
                $table->unique(['siswa_id', 'program_id']);
            });
        }

        // Update tabel siswa - tambah kolom baru
        Schema::table('siswa', function (Blueprint $table) {
            if (!Schema::hasColumn('siswa', 'email')) {
                $table->string('email')->nullable()->unique()->after('alamat');
            }
            if (!Schema::hasColumn('siswa', 'informasi_villa_merah')) {
                $table->enum('informasi_villa_merah', ['website', 'instagram', 'tiktok', 'kerabat', 'orang_tua', 'teman'])->nullable()->after('email');
            }
            if (!Schema::hasColumn('siswa', 'kelas')) {
                $table->unsignedTinyInteger('kelas')->nullable()->comment('Kelas 1-12')->after('tahun_masuk');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siswa_program');
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropColumn(['email', 'informasi_villa_merah', 'foto', 'kelas']);
        });
        Schema::dropIfExists('program');
        Schema::dropIfExists('kategori_program');
    }
};
