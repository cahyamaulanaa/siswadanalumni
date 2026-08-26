<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop tables
        Schema::dropIfExists('notifikasi_log');
        Schema::dropIfExists('absensi');
        Schema::dropIfExists('pengumuman');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate tables in reverse order
        Schema::create('pengumuman', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabang_id')->constrained('cabang');
            $table->foreignId('dibuat_oleh')->constrained('users');
            $table->string('judul');
            $table->text('isi');
            $table->string('target_role');
            $table->string('channel');
            $table->string('status_kirim')->default('draft');
            $table->dateTime('jadwal_kirim')->nullable();
            $table->timestamps();
        });

        Schema::create('absensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_id')->constrained('sesi_kelas');
            $table->foreignId('siswa_id')->constrained('siswa');
            $table->foreignId('dicatat_oleh')->constrained('users');
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alpa'])->default('hadir');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('notifikasi_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengumuman_id')->constrained('pengumuman');
            $table->string('tujuan');
            $table->string('channel');
            $table->string('status');
            $table->text('keterangan')->nullable();
            $table->dateTime('terkirim_at')->nullable();
            $table->timestamps();
        });
    }
};
