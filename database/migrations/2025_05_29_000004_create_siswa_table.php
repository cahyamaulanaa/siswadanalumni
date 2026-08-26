<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('cascade');
            $table->string('angkatan_text', 150);
            $table->string('nama_lengkap', 150);
            $table->string('asal_sekolah', 150);
            $table->date('tanggal_lahir');
            $table->string('no_hp', 20);
            $table->text('alamat');
            $table->string('foto')->nullable();
            $table->integer('tahun_masuk');
            $table->integer('tahun_lulus')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siswa');
    }
};
